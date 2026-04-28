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
  it("should respect code.emitGlobals=false", () => {
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

    const withGlobals = new TextDecoder().decode(view.getDataForChunk(project, "CODE"));
    expect(withGlobals).toContain('local PROJECT_NAME = "Demo"');

    const withoutGlobals = new TextDecoder().decode(view.getDataForChunk(project, "CODE", { emitGlobals: false }));
    expect(withoutGlobals).not.toContain('local PROJECT_NAME = "Demo"');
    expect(withoutGlobals).toContain("print('hello')");
  });

  it("should emit metadata before globals in insertion order", () => {
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

    const output = new TextDecoder().decode(view.getDataForChunk(project, "CODE"));
    expect(output.startsWith(
      "-- title:  test\n-- author: Carl\n-- menu:   MENU1 MENU2 MENU3\n\nlocal PROJECT_NAME = \"Demo\"\n\nprint('hello')",
    )).toBe(true);
  });

  it("should preserve metadata when minification strips other comments", () => {
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

    const output = new TextDecoder().decode(view.getDataForChunk(project, "CODE"));
    expect(output).toContain("-- title:  Demo");
    expect(output).toContain("-- author: Carl");
    expect(output).not.toContain("throwaway");
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
