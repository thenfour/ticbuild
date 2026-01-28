import { preprocessLuaCode } from "./luaPreprocessor";
import { Manifest } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";
import * as cons from "../utils/console";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

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

describe("Lua preprocessor error/warning directives", () => {
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

  it("should emit warnings for --#warning", async () => {
    const warnSpy = jest.spyOn(cons, "warning").mockImplementation(() => {});
    const project = makeProject(manifest);
    const source = "--#warning please check this\nlocal x = 1";

    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain("local x = 1");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("should error on --#error", async () => {
    const project = makeProject(manifest);
    const source = "--#error build failed";

    await expect(preprocessLuaCode(project, source, "C:/test/source.lua")).rejects.toThrow(
      "[LuaPreprocessor] C:/test/source.lua:1 build failed",
    );
  });
});

describe("Lua preprocessor include resolution", () => {
  it("should resolve --#include relative to including file", async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-preproc-"));
    const srcDir = path.join(tempRoot, "src");
    fs.mkdirSync(srcDir, { recursive: true });

    const mathPath = path.join(srcDir, "math.lua");
    const utilPath = path.join(srcDir, "utils.lua");

    fs.writeFileSync(mathPath, "local M = {}\nM.VALUE = 123\nreturn M\n", "utf-8");

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

    const project = new TicbuildProjectCore({
      manifest,
      manifestPath: path.join(tempRoot, "manifest.ticbuild.jsonc"),
      projectDir: tempRoot,
    });

    const source = '--#include "math.lua"\nlocal x = 1';
    fs.writeFileSync(utilPath, source, "utf-8");

    const result = await preprocessLuaCode(project, source, utilPath);

    expect(result.code).toContain("M.VALUE = 123");
    expect(result.code).toContain("local x = 1");
  });
});
