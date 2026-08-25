import { OptimizationRuleOptions, processLua } from "./lua_processor";

function options(overrides: Partial<OptimizationRuleOptions>): OptimizationRuleOptions {
  return {
    stripComments: true,
    maxIndentLevel: 1,
    lineBehavior: "tight",
    maxLineLength: 180,
    renameLocalVariables: false,
    aliasRepeatedExpressions: false,
    aliasLiterals: false,
    packLocalDeclarations: false,
    simplifyExpressions: false,
    removeUnusedLocals: false,
    removeUnusedFunctions: false,
    functionNamesToKeep: [],
    renameTableFields: false,
    tableEntryKeysToRename: [],
    ...overrides,
  };
}

describe("generated Lua symbol collisions", () => {
  it("does not let a renamed local capture an existing global reference", () => {
    const output = processLua(
      "local longName=1\nreturn a+longName",
      options({ renameLocalVariables: true }),
    );

    expect(output.trim()).toBe("local b=1 return a+b");
  });

  it("keeps a global visible in a local initializer", () => {
    const output = processLua(
      "local a=a\nreturn a",
      options({ renameLocalVariables: true }),
    );

    expect(output.trim()).toBe("local b=a return b");
  });

  it("keeps a global visible after a nested local scope ends", () => {
    const output = processLua(
      "do\nlocal a=1\nend\nreturn a",
      options({ renameLocalVariables: true }),
    );

    expect(output.trim()).toBe("do local b=1 end return a");
  });

  it("does not let an allowed table-key rename collide with a named key", () => {
    const input = `
local t = { a = 1, longName = 2 }
return t.a + t["longName"]
`;
    const output = processLua(input, options({ tableEntryKeysToRename: ["longName"] }));

    expect(output).toContain("{a=1,b=2}");
    expect(output).toContain('return t.a+t["b"]');
  });

  it("does not let an allowed table-key rename collide with a string key", () => {
    const input = `
local t = { ["a"] = 1, ["longName"] = 2 }
return t["a"] + t.longName
`;
    const output = processLua(input, options({ tableEntryKeysToRename: ["longName"] }));

    expect(output).toContain('{["a"]=1,["b"]=2}');
    expect(output).toContain('return t["a"]+t.b');
  });
});
