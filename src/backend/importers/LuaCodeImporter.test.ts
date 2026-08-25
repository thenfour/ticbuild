import { inflateSync } from "node:zlib";
import { TicbuildProjectCore } from "../projectCore";
import { Manifest as TicbuildManifest } from "../manifestTypes";
import { CodeResourceView } from "./CodeResource";
import { createIdentitySourceMap, mapPreprocessedOffset } from "../sourceMap";

type Manifest = Omit<TicbuildManifest, "buildConfiguration">;

function makeProject(manifest: Manifest): TicbuildProjectCore {
  return new TicbuildProjectCore({
    manifest: { buildConfiguration: "release", ...manifest },
    manifestPath: "C:/test/manifest.ticbuild.jsonc",
    projectDir: "C:/test",
  });
}

describe("CodeResourceView output", () => {
  it("should emit metadata before code in insertion order", async () => {
    const manifest: Manifest = {
      project: {
        name: "test",
        metadata: {
          title: "$(project.name)",
          author: "Carl",
          menu: "MENU1 MENU2 MENU3",
        },
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      variables: {
        "project.name": "test",
      },
      imports: [],
      assembly: {
        lua: {
          minify: false,
        },
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const view = new CodeResourceView("print('hello')", "print('hello')");

    const output = new TextDecoder().decode(await view.getDataForChunk(project, "CODE"));
    expect(output.startsWith(
      "-- title:  test\n-- author: Carl\n-- menu:   MENU1 MENU2 MENU3\n\nprint('hello')",
    )).toBe(true);
  });

  it("should preserve metadata when minification strips other comments", async () => {
    const manifest: Manifest = {
      project: {
        name: "test",
        metadata: {
          title: "Demo",
          author: "Carl",
        },
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      variables: {},
      imports: [],
      assembly: {
        lua: {
          minify: true,
        },
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const view = new CodeResourceView("-- throwaway\nprint('hello')", "-- throwaway\nprint('hello')");

    const output = new TextDecoder().decode(await view.getDataForChunk(project, "CODE"));
    expect(output).toContain("-- title:  Demo");
    expect(output).toContain("-- author: Carl");
    expect(output).not.toContain("throwaway");
  });

  it("should normalize renameSpecifiedGlobalSymbols=true to opt-in", async () => {
    const manifest: Manifest = {
      project: {
        name: "test",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      variables: {},
      imports: [],
      assembly: {
        lua: {
          minify: true,
          minification: {
            renameLocalVariables: false,
            renameSpecifiedGlobalSymbols: true,
          },
        },
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const source = "function Demo_LongName() return 1 end return Demo_LongName()";
    const view = new CodeResourceView(source, source, ["Demo_LongName"]);

    const output = new TextDecoder().decode(await view.getDataForChunk(project, "CODE"));

    expect(output).toContain("function a()");
    expect(output).toContain("return a()");
    expect(output).not.toContain("Demo_LongName");
  });

  it("maps renamed identifiers in minified Lua to their authored symbol", () => {
    const manifest: Manifest = {
      project: {
        name: "test",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      variables: {},
      imports: [],
      assembly: {
        lua: {
          minify: true,
          minification: {
            renameLocalVariables: false,
            removeUnusedLocals: false,
          },
        },
        blocks: [],
      },
    };
    const project = makeProject(manifest);
    const sourcePath = "C:/test/main.lua";
    const repeatedCalls = Array.from({ length: 8 }, (_, index) => `local value${index}=time()`).join("\n");
    const source = `function Demo_LongName() return 1 end\n${repeatedCalls}\nreturn Demo_LongName()`;
    const sourceMap = createIdentitySourceMap(source, sourcePath);
    const view = new CodeResourceView(source, source, ["Demo_LongName"], sourceMap, sourceMap);

    const artifacts = view.getArtifacts(project);
    const generatedNameOffset = artifacts.minifiedSource.indexOf("function a") + "function ".length;
    expect(generatedNameOffset).toBeGreaterThanOrEqual("function ".length);
    expect(mapPreprocessedOffset(artifacts.minifiedSourceMap, generatedNameOffset, "right")).toEqual({
      file: sourcePath,
      offset: source.indexOf("Demo_LongName"),
      name: "Demo_LongName",
    });
    const generatedAliasOffset = artifacts.minifiedSource.indexOf("_a");
    expect(generatedAliasOffset).toBeGreaterThanOrEqual(0);
    expect(mapPreprocessedOffset(
      artifacts.minifiedSourceMap,
      generatedAliasOffset,
      "right",
    )?.name).toBeUndefined();
  });

  it("should normalize renameSpecifiedGlobalSymbols=false to off", async () => {
    const manifest: Manifest = {
      project: {
        name: "test",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      variables: {},
      imports: [],
      assembly: {
        lua: {
          minify: true,
          minification: {
            renameSpecifiedGlobalSymbols: false,
          },
        },
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const source = "function Demo_LongName() return 1 end return Demo_LongName()";
    const view = new CodeResourceView(source, source, ["Demo_LongName"]);

    const output = new TextDecoder().decode(await view.getDataForChunk(project, "CODE"));

    expect(output).toContain("function Demo_LongName()");
    expect(output).toContain("return Demo_LongName()");
    expect(output).not.toContain("function a()");
  });

  it("should let an explicit opt-out mode override the legacy boolean", async () => {
    const manifest: Manifest = {
      project: {
        name: "test",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      variables: {},
      imports: [],
      assembly: {
        lua: {
          minify: true,
          minification: {
            globalSymbolRenaming: "opt-out",
            renameSpecifiedGlobalSymbols: false,
          },
        },
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const source = [
      "function Public_LongApi() return Internal_LongHelper() end",
      "function Internal_LongHelper() return 1 end",
      "return Public_LongApi()",
    ].join("\n");
    const view = new CodeResourceView(
      source,
      source,
      [],
      undefined,
      undefined,
      ["Public_LongApi"],
    );

    const output = new TextDecoder().decode(await view.getDataForChunk(project, "CODE"));

    expect(output).toContain("function Public_LongApi()");
    expect(output).toContain("return Public_LongApi()");
    expect(output).not.toContain("Internal_LongHelper");
  });

  it("should reject multi-line metadata values", () => {
    const manifest: Manifest = {
      project: {
        name: "test",
        metadata: {
          desc: "line 1\nline 2",
        },
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      variables: {},
      imports: [],
      assembly: {
        lua: {
          minify: false,
        },
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const view = new CodeResourceView("print('hello')", "print('hello')");

    expect(() => view.getDataForChunk(project, "CODE")).toThrow("Project metadata desc must be a single line");
  });
});

describe("CodeResourceView compressionMode", () => {
  function makeLuaProject(): TicbuildProjectCore {
    return makeProject({
      project: {
        name: "test",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      variables: {},
      imports: [],
      assembly: {
        lua: {
          minify: false,
        },
        blocks: [],
      },
    });
  }

  function makeCompressibleLuaSource(): string {
    let source = "";
    for (let i = 0; i < 2000; i += 1) {
      source += `local variable${i % 40}=function() return ${i % 13} end\n`;
    }
    return source;
  }

  it("should emit valid zlib streams for default, zlib-max, and zopfli modes", async () => {
    const project = makeLuaProject();
    const source = makeCompressibleLuaSource();
    const view = new CodeResourceView(source, source);

    const defaultBytes = await view.getDataForChunk(project, "CODE_COMPRESSED", { compressionMode: "default" });
    const zlibMaxBytes = await view.getDataForChunk(project, "CODE_COMPRESSED", { compressionMode: "zlib-max" });
    const zopfliBytes = await view.getDataForChunk(project, "CODE_COMPRESSED", { compressionMode: "zopfli" });

    expect(new TextDecoder().decode(inflateSync(defaultBytes))).toBe(source);
    expect(new TextDecoder().decode(inflateSync(zlibMaxBytes))).toBe(source);
    expect(new TextDecoder().decode(inflateSync(zopfliBytes))).toBe(source);
    expect(zlibMaxBytes.length).toBeLessThan(defaultBytes.length);
    expect(zopfliBytes.length).toBeLessThanOrEqual(zlibMaxBytes.length);
  });

  it("should reject unsupported compression modes", () => {
    const project = makeLuaProject();
    const view = new CodeResourceView("print('hello')", "print('hello')");

    expect(() =>
      view.getDataForChunk(project, "CODE_COMPRESSED", { compressionMode: "brotli" } as any),
    ).toThrow("Unsupported Lua compression mode: brotli");
  });
});
