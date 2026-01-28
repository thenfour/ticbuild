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

function dumpTempLuaFile(content: string): string {
  // dump to a temp file and report path on console
  const tempPath = path.join(os.tmpdir(), `ticbuild-lua-preproc-${Date.now()}.lua`);
  fs.writeFileSync(tempPath, content, "utf-8");
  console.log(`Dumped output to: ${tempPath}`);
  return tempPath;
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

describe("Lua preprocessor macros", () => {
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

  it("should perform textual replacement", async () => {
    const project = makeProject(manifest);
    const source = `--#macro ID(x) => x
local value = ID(42)`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");
    expect(result.code).toContain("local value = 42");
  });

  it("should be nestable", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro ID(x) => x
--#macro WRAP(y) => ID(y)
local value = WRAP(42)`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");
    expect(result.code).toContain("local value = 42");
  });

  it("should be nestable 2 times", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro ID(x) => x
--#macro WRAP(y) => ID(y)
--#macro DOUBLE_WRAP(z) => WRAP(z)
local value = DOUBLE_WRAP(42)`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");
    expect(result.code).toContain("local value = 42");
  });

  it("should respect ordering when nesting", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro WRAP(y) => ID(y)
--#macro ID(x) => x
local value = (WRAP(42))`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");
    // Hm what should we expect honestly? at least it shouldn't blow up
    expect(result.code).toContain("local value = (42)");
  });

  it("should be overridable", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro WRAP(y) => ID(y+1)
--#macro ID(x) => x
--#macro WRAP(y) => ID(y+2)
local value = (WRAP(42))`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    // dumpTempLuaFile(result.code);

    expect(result.code).toContain("local value = (42+2)");
  });

  it("should be overridable and nestable", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro ID(x) => x+1
--#macro WRAP(y) => ID(y+2)
--#macro ID(x) => x+3
--#macro WRAP(y) => ID(y+4)
local value = (WRAP(42))`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    // dumpTempLuaFile(result.code);

    expect(result.code).toContain("local value = (42+4+3)");
  });

  it("should strip comments in a way that doesn't accidentally concatenate", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro STRING_CONCAT(a,b)
a-- comment1
..-- comment2
b
--#endmacro
local value = (STRING_CONCAT(10,12))
`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    // comments should not remove the newlines or cause accidental concatenation
    // : local value = (10..12) is a syntax error
    expect(result.code).toContain(`local value = (10
..
12)`);
  });

  it("should not include comments", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro ID(x) => x+1 -- comment
local value = (ID(42))`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    // Currently getting:
    // local value = (42+1 -- comment)"
    // which is just a syntax error and not what any dev would expect.
    expect(result.code).toContain("local value = (42+1)");
  });

  it("should not treat double dashes in strings as comments (be lexically aware generally)", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro ID(x) => "--" .. x .. "--" -- comment
local value = (ID(42))`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain(`local value = ("--" .. 42 .. "--")`);
  });

  it("should strip comments from macro arguments at call sites", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro ID(x) => x
local value = (ID(
42-- a comment
..
43
))`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain(`local value = (42
..
43)`);
  });

  it("should not include comments (multi-line macro)", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro ID(x) -- comment 1
x+1 -- comment 2
--#endmacro -- comment 3
local value = (ID(42))`;

    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    // not certain the expected result: something like this, but possibly with some whitespace / linebreak differences.
    expect(result.code).toContain(`local value = (42+1)`);
  });
});

describe("Lua preprocessor include resolution", () => {
  it("should resolve --#include relative to including file", async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-preproc-"));
    const srcDir = path.join(tempRoot, "src");
    fs.mkdirSync(srcDir, { recursive: true });

    const mathPath = path.join(srcDir, "math.lua");
    const utilPath = path.join(srcDir, "utils.lua");

    fs.writeFileSync(mathPath, "local M = 1\n", "utf-8");

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

    //const resultPath = path.join(srcDir, "result.lua");
    //console.log(`resultPath: ${resultPath}`);
    // write out the result for inspection if needed
    //fs.writeFileSync(resultPath, result.code, "utf-8");

    // note: 2 line endings -- don't skip them, don't collapse them.
    expect(result.code).toContain(`local M = 1\n\nlocal x = 1`);
  });
});
