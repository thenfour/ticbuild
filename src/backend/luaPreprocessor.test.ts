import { preprocessLuaCode } from "./luaPreprocessor";
import { Manifest as TicbuildManifest } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";
import * as cons from "../utils/console";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

type Manifest = Omit<TicbuildManifest, "buildConfiguration">;

function makeProject(manifest: Manifest): TicbuildProjectCore {
  return new TicbuildProjectCore({
    manifest: { buildConfiguration: "release", ...manifest },
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

    {
      const project = makeProject(manifest);
      const source = 'local value = __ENCODE("hex,hex", "1f 00")';
      const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

      expect(result.code).toContain('local value = "1f00"');
    }

    {
      const project = makeProject(manifest);
      const source = 'local value = __ENCODE("b85+1,hex", "#)(](nIt.M!")';
      const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

      expect(result.code).toContain('local value = "192c5dff7f80"');
    }
  });
});

describe("Lua preprocessor stringification", () => {
  it("should expand variables to a Lua string literal", async () => {
    const manifest: Manifest = {
      project: {
        name: "test",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      variables: {
        greet: "hi",
      },
      imports: [],
      assembly: {
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const source = 'local s = __EXPAND("$(greet) there")';
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain('local s = "hi there"');
  });

  it("should support string concatenation in preprocessor expressions", async () => {
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

    const project = makeProject(manifest);
    const source = `
--#define A "hi"
--#if A .. "!" == "hi!"
local x = 1
--#else
local x = 2
--#endif
`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain("local x = 1");
    expect(result.code).not.toContain("local x = 2");
  });

  it("should support --#ifdef for defined symbols", async () => {
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

    const project = makeProject(manifest);
    const source = `
--#define FEATURE
--#ifdef FEATURE
local enabled = true
--#else
local enabled = false
--#endif
`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain("local enabled = true");
    expect(result.code).not.toContain("local enabled = false");
  });

  it("should support --#ifndef for undefined symbols", async () => {
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

    const project = makeProject(manifest);
    const source = `
--#ifndef FEATURE
local enabled = false
--#else
local enabled = true
--#endif
`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain("local enabled = false");
    expect(result.code).not.toContain("local enabled = true");
  });

  it("should seed preprocessor defines from the manifest", async () => {
    const manifest: Manifest = {
      project: {
        name: "test",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      variables: {},
      preprocessor: {
        defines: {
          FEATURE: true,
        },
      },
      imports: [],
      assembly: {
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const source = `
--#ifdef FEATURE
local enabled = true
--#else
local enabled = false
--#endif
`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain("local enabled = true");
    expect(result.code).not.toContain("local enabled = false");
  });

  it("should substitute manifest variables in string preprocessor defines", async () => {
    const manifest: Manifest = {
      project: {
        name: "test",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      variables: {
        title: "My Game",
      },
      preprocessor: {
        defines: {
          TITLE_NAME: "$(title)",
        },
      },
      imports: [],
      assembly: {
        blocks: [],
      },
    };

    const project = makeProject(manifest);
    const source = `
--#if TITLE_NAME == "My Game"
local titleOk = true
--#else
local titleOk = false
--#endif
`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain("local titleOk = true");
    expect(result.code).not.toContain("local titleOk = false");
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
    const warnSpy = jest.spyOn(cons, "warning").mockImplementation(() => { });
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

describe("Lua preprocessor minify directives", () => {
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

  it("should collect allow_rename targets from simple global declarations", async () => {
    const project = makeProject(manifest);
    const source = `
--#minify allow_rename
-- a regular comment can sit between the annotation and declaration
function Demo_LongName() end

--#minify allow_rename
Demo_AssignedLongName = function() end
`;

    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain("function Demo_LongName() end");
    expect(result.code).toContain("Demo_AssignedLongName = function() end");
    expect(result.code).not.toContain("--#minify allow_rename");
    expect(result.minifyAllowedGlobalNames).toEqual(["Demo_LongName", "Demo_AssignedLongName"]);
  });

  it("should allow same-line comments", async () => {
    const project = makeProject(manifest);
    const source = `
--#minify allow_rename -- a comment can be here too
function Demo_LongName() end

--#minify allow_rename
Demo_AssignedLongName = function() end
`;

    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain("function Demo_LongName() end");
    expect(result.code).toContain("Demo_AssignedLongName = function() end");
    expect(result.code).not.toContain("--#minify allow_rename");
    expect(result.minifyAllowedGlobalNames).toEqual(["Demo_LongName", "Demo_AssignedLongName"]);
  });

  it("should collect no_rename targets from simple global declarations", async () => {
    const project = makeProject(manifest);
    const source = `
--#minify no_rename -- public API
-- a regular comment can sit between the annotation and declaration
function Public_LongName() end

--#minify no_rename
Public_AssignedLongName = function() end
`;

    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain("function Public_LongName() end");
    expect(result.code).toContain("Public_AssignedLongName = function() end");
    expect(result.code).not.toContain("--#minify no_rename");
    expect(result.minifyGlobalNamesToKeep).toEqual(["Public_LongName", "Public_AssignedLongName"]);
  });

  it("should ignore inactive allow_rename directives", async () => {
    const project = makeProject(manifest);
    const source = `
--#if false
--#minify allow_rename
function Demo_Inactive() end
--#endif
function Demo_ActiveButUnmarked() end
`;

    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.minifyAllowedGlobalNames).toEqual([]);
    expect(result.code).not.toContain("Demo_Inactive");
  });

  it("should ignore inactive no_rename directives", async () => {
    const project = makeProject(manifest);
    const source = `
--#if false
--#minify no_rename
function Demo_Inactive() end
--#endif
function Demo_ActiveButUnmarked() end
`;

    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.minifyGlobalNamesToKeep).toEqual([]);
    expect(result.code).not.toContain("Demo_Inactive");
  });

  it("should reject unknown minify options", async () => {
    const project = makeProject(manifest);
    const source = "--#minify unknown\nfunction Demo_LongName() end";

    await expect(preprocessLuaCode(project, source, "C:/test/source.lua")).rejects.toThrow(
      "Unsupported --#minify option: unknown",
    );
  });

  it("should reject allow_rename when the next code line is not a simple global declaration", async () => {
    const project = makeProject(manifest);
    const source = "--#minify allow_rename\nlocal function Demo_LocalName() end";

    await expect(preprocessLuaCode(project, source, "C:/test/source.lua")).rejects.toThrow(
      "--#minify allow_rename must be followed by a simple global function or assignment",
    );
  });

  it("should reject no_rename when the next code line is not a simple global declaration", async () => {
    const project = makeProject(manifest);
    const source = "--#minify no_rename\nlocal function Demo_LocalName() end";

    await expect(preprocessLuaCode(project, source, "C:/test/source.lua")).rejects.toThrow(
      "--#minify no_rename must be followed by a simple global function or assignment",
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

  it("should expand parenthesis-less object-like macros in identifier expressions", async () => {
    const project = makeProject(manifest);
    const source = `local before = VALUE
--#macro VALUE => 23
local first = VALUE
local keyed = { VALUE = VALUE, [VALUE] = VALUE }
local member = object.VALUE
--#macro VALUE => 24
local second = VALUE`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain("local before = VALUE");
    expect(result.code).toContain("local first = 23");
    expect(result.code).toContain("local keyed = { VALUE = 23, [23] = 23 }");
    expect(result.code).toContain("local member = object.VALUE");
    expect(result.code).toContain("local second = 24");
    expect(result.preprocessorSymbols.filter((symbol) => symbol.name === "VALUE")).toMatchObject([
      { invocationStyle: "object", params: [] },
      { invocationStyle: "object", params: [] },
    ]);
  });

  it("should distinguish object-like and zero-parameter function-like macros", async () => {
    const project = makeProject(manifest);
    const source = `--#macro OBJECT_VALUE => 1
--#macro FUNCTION_VALUE() => 2
local objectValue = OBJECT_VALUE
local functionValue = FUNCTION_VALUE
local calledValue = FUNCTION_VALUE()`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain("local objectValue = 1");
    expect(result.code).toContain("local functionValue = FUNCTION_VALUE");
    expect(result.code).toContain("local calledValue = 2");
  });

  it("should apply a macro definition only to later invocations", async () => {
    const project = makeProject(manifest);
    const source = `local before = ID(1)
--#macro ID(x) => x
local after = ID(2)`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain(`local before = ID(1)
local after = 2`);
  });

  it("should apply each macro redefinition only to later invocations", async () => {
    const project = makeProject(manifest);
    const source = `--#macro VALUE(x) => x+1
local first = VALUE(10)
--#macro VALUE(x) => x+2
local second = VALUE(20)`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain(`local first = 10+1
local second = 20+2`);
  });

  it("should resolve nested macros using definitions active at the invocation", async () => {
    const project = makeProject(manifest);
    const source = `--#macro WRAP(x) => ID(x)
local before = WRAP(10)
--#macro ID(x) => x+1
local middle = WRAP(20)
--#macro ID(x) => x+2
local after = WRAP(30)`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain(`local before = ID(10)
local middle = 20+1
local after = 30+2`);
  });

  it("should ignore inactive macro definitions when resolving later invocations", async () => {
    const project = makeProject(manifest);
    const source = `--#macro VALUE(x) => x+1
local first = VALUE(10)
--#if false
--#macro VALUE(x) => x+99
--#endif
local second = VALUE(20)`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain(`local first = 10+1
local second = 20+1`);
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

  it("should allow empty inline macros", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro ASSERT(condition, message) => --
ASSERT(x > 0, "x must be positive")
local value = 42`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).not.toContain("ASSERT(");
    expect(result.code).toContain("local value = 42");
  });

  it("should allow empty multi-line macros", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro ASSERT(condition, message)
-- release build strips assertions
--#endmacro
ASSERT(x > 0, "x must be positive")
local value = 42`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).not.toContain("ASSERT(");
    expect(result.code).toContain("local value = 42");
  });

  it("should expand parameterized statement-list macros at standalone call sites", async () => {
    const project = makeProject(manifest);
    const source = `--#macro ASSERT(condition, message) => --
--#macro REQUIRE_OR_RETURN(condition, returnVal)
ASSERT(condition, "requirement failed")
if not condition then
  return returnVal
end
--#endmacro
local function check(ok)
  REQUIRE_OR_RETURN(ok, 17)
  return 0
end`;
    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).not.toContain("REQUIRE_OR_RETURN(");
    expect(result.code).not.toContain("ASSERT(");
    expect(result.code).toContain(`if not ok then
  return 17
end`);
  });

  it("should reject statement-list macros in expression contexts", async () => {
    const project = makeProject(manifest);
    const source = `--#macro RETURN_VALUE(value)
return value
--#endmacro
local value = RETURN_VALUE(1)`;

    await expect(preprocessLuaCode(project, source, "C:/test/source.lua")).rejects.toThrow(
      "Statement-list macro RETURN_VALUE can only be used as a standalone call statement",
    );
  });

  it("should reject empty macros in expression contexts", async () => {
    const project = makeProject(manifest);
    const source = `--#macro NOP() => --
local value = NOP()`;

    await expect(preprocessLuaCode(project, source, "C:/test/source.lua")).rejects.toThrow(
      "Empty macro NOP can only be used as a standalone call statement",
    );
  });

  it("should require object-like macros to contain one expression", async () => {
    const project = makeProject(manifest);
    const source = `--#macro INVALID
local value = 1
--#endmacro
local value = INVALID`;

    await expect(preprocessLuaCode(project, source, "C:/test/source.lua")).rejects.toThrow(
      "Object-like macro INVALID must have exactly one Lua expression",
    );
  });

  it("should reject invalid macro bodies even when they are not invoked", async () => {
    const project = makeProject(manifest);
    const source = `--#macro INVALID(value)
if value then
--#endmacro
local value = 1`;

    await expect(preprocessLuaCode(project, source, "C:/test/source.lua")).rejects.toThrow(
      "Failed to parse macro body",
    );
  });

  it("should reject expansions that leave invalid Lua", async () => {
    const project = makeProject(manifest);
    const source = `--#macro ADD_ONE(value) => value+1
ADD_ONE(1)`;

    await expect(preprocessLuaCode(project, source, "C:/test/source.lua")).rejects.toThrow(
      "Failed to parse Lua while expanding macros",
    );
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

    expect(result.code).toContain(`local value = (42+1)`);
  });

  it("should be nestable with code after", async () => {
    const project = makeProject(manifest);
    const source = `
--#macro TIC_WIDTH() => 240
--#macro ID(x) => x

local boundWidth = ID(TIC_WIDTH())
local y = x

    
    `;

    const result = await preprocessLuaCode(project, source, "C:/test/source.lua");

    expect(result.code).toContain(`local boundWidth = 240
local y = x`);
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
      manifest: { buildConfiguration: "release", ...manifest },
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

  it("should preserve macro definition order across includes", async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-preproc-macros-"));
    const srcDir = path.join(tempRoot, "src");
    fs.mkdirSync(srcDir, { recursive: true });

    const includePath = path.join(srcDir, "macros.lua");
    fs.writeFileSync(
      includePath,
      `local includedBefore = VALUE(2)
--#macro VALUE(x) => x+2
local includedAfter = VALUE(3)`,
      "utf-8",
    );

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
      manifest: { buildConfiguration: "release", ...manifest },
      manifestPath: path.join(tempRoot, "manifest.ticbuild.jsonc"),
      projectDir: tempRoot,
    });
    const source = `--#macro VALUE(x) => x+1
local mainBefore = VALUE(1)
--#include "src/macros.lua"
local mainAfter = VALUE(4)`;

    const result = await preprocessLuaCode(project, source, path.join(tempRoot, "main.lua"));

    expect(result.code).toContain("local mainBefore = 1+1");
    expect(result.code).toContain("local includedBefore = 2+1");
    expect(result.code).toContain("local includedAfter = 3+2");
    expect(result.code).toContain("local mainAfter = 4+2");
  });
});
