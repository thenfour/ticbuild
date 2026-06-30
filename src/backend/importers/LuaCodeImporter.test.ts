import { inflateSync } from "node:zlib";
import { LuaCodeResourceView } from "./LuaCodeImporter";
import { TicbuildProjectCore } from "../projectCore";
import { Manifest } from "../manifestTypes";

function makeProject(manifest: Manifest): TicbuildProjectCore {
  return new TicbuildProjectCore({
    manifest,
    manifestPath: "C:/test/manifest.ticbuild.jsonc",
    projectDir: "C:/test",
  });
}

describe("LuaCodeResourceView emitGlobals", () => {
  it("should respect code.emitGlobals=false", async () => {
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
          minify: false,
          globals: {
            PROJECT_NAME: "Demo",
          },
        },
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const view = new LuaCodeResourceView("print('hello')", "print('hello')");

    const withGlobals = new TextDecoder().decode(await view.getDataForChunk(project, "CODE"));
    expect(withGlobals).toContain('local PROJECT_NAME = "Demo"');

    const withoutGlobals = new TextDecoder().decode(await view.getDataForChunk(project, "CODE", { emitGlobals: false }));
    expect(withoutGlobals).not.toContain('local PROJECT_NAME = "Demo"');
    expect(withoutGlobals).toContain("print('hello')");
  });

  it("should emit metadata before globals in insertion order", async () => {
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
          globals: {
            PROJECT_NAME: "Demo",
          },
        },
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const view = new LuaCodeResourceView("print('hello')", "print('hello')");

    const output = new TextDecoder().decode(await view.getDataForChunk(project, "CODE"));
    expect(output.startsWith(
      "-- title:  test\n-- author: Carl\n-- menu:   MENU1 MENU2 MENU3\n\nlocal PROJECT_NAME = \"Demo\"\n\nprint('hello')",
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
    const view = new LuaCodeResourceView("-- throwaway\nprint('hello')", "-- throwaway\nprint('hello')");

    const output = new TextDecoder().decode(await view.getDataForChunk(project, "CODE"));
    expect(output).toContain("-- title:  Demo");
    expect(output).toContain("-- author: Carl");
    expect(output).not.toContain("throwaway");
  });

  it("should apply preprocessor-collected allowed global renames during minification", async () => {
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
          },
        },
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const source = "function Demo_LongName() return 1 end return Demo_LongName()";
    const view = new LuaCodeResourceView(source, source, ["Demo_LongName"]);

    const output = new TextDecoder().decode(await view.getDataForChunk(project, "CODE"));

    expect(output).toContain("function a()");
    expect(output).toContain("return a()");
    expect(output).not.toContain("Demo_LongName");
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
    const view = new LuaCodeResourceView("print('hello')", "print('hello')");

    expect(() => view.getDataForChunk(project, "CODE")).toThrow("Project metadata desc must be a single line");
  });
});

describe("LuaCodeResourceView compressionMode", () => {
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
    const view = new LuaCodeResourceView(source, source);

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
    const view = new LuaCodeResourceView("print('hello')", "print('hello')");

    expect(() =>
      view.getDataForChunk(project, "CODE_COMPRESSED", { compressionMode: "brotli" } as any),
    ).toThrow("Unsupported Lua compression mode: brotli");
  });
});
