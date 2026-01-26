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
});
