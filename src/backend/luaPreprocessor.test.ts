import { preprocessLuaCode } from "./luaPreprocessor";
import { Manifest } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";

function makeProject(manifest: Manifest): TicbuildProjectCore {
  return new TicbuildProjectCore({
    manifest,
    manifestPath: "C:/test/manifest.ticbuild.jsonc",
    projectDir: "C:/test",
  });
}

describe("Lua preprocessor __ENCODE", () => {
  it("should encode hex to hex literal", async () => {
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
        blocks: [],
      },
    };

    // for reference,
    // {25,44,93,255,127,128}
    // hex:    "192c5dff7f80"
    // b85+1:  "#)(](nIt.M!"
    // lz85+1: "!!!X;l?2oD)"

    {
      const project = makeProject(manifest);
      const source = 'local value = __ENCODE("hex", "hex", "1f 00")';
      const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

      expect(result.code).toContain('local value = "1f00"');
    }

    {
      const project = makeProject(manifest);
      const source = 'local value = __ENCODE("b85+1", "hex", "#)(](nIt.M!")';
      const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

      expect(result.code).toContain('local value = "192c5dff7f80"');
    }

    {
      const project = makeProject(manifest);
      const source = 'local value = __ENCODE("lz85+1", "hex", "!!!X;l?2oD)")';
      const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

      expect(result.code).toContain('local value = "192c5dff7f80"');
    }

    {
      const project = makeProject(manifest);
      const source = 'local value = __ENCODE("lz85+1", "b85+1", "!!!X;l?2oD)")';
      const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

      expect(result.code).toContain('local value = "#)(](nIt.M!"');
    }

    {
      const project = makeProject(manifest);
      const source = 'local value = __ENCODE("lz85+1", "u8", "!!!X;l?2oD)")';
      const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

      expect(result.code).toContain("local value = {25,44,93,255,127,128}");
    }
  });
});
