import { OptimizationRuleOptions, processLua } from "./lua_processor";

const baseOptions: OptimizationRuleOptions = {
  maxIndentLevel: 0,
  lineBehavior: "tight",
  maxLineLength: 80,
  stripComments: false,
  renameLocalVariables: false,
  aliasRepeatedExpressions: false,
  aliasLiterals: false,
  simplifyExpressions: false,
  removeUnusedLocals: false,
  removeUnusedFunctions: false,
  functionNamesToKeep: [],
  renameTableFields: false,
  tableEntryKeysToRename: [],
  globalSymbolRenaming: "off",
  packLocalDeclarations: false,
  canonicalizeSyntax: false,
  simplifyControlFlow: false,
  ruleOverrides: {},
};

function minify(source: string, overrides: Partial<OptimizationRuleOptions>): string {
  return processLua(source, { ...baseOptions, ...overrides }).trim();
}

describe("Lua syntax canonicalization rules", () => {
  it("uses member access only for legal, non-reserved identifier keys", () => {
    expect(minify(
      'return t["valid"],t["also_valid"],t["end"],t["not-valid"]',
      { canonicalizeSyntax: true },
    )).toBe('return t.valid,t.also_valid,t["end"],t["not-valid"]');
  });

  it("uses bare table keys only for legal, non-reserved identifier keys", () => {
    expect(minify(
      'return {["valid"]=1,["end"]=2,["not-valid"]=3}',
      { canonicalizeSyntax: true },
    )).toBe('return {valid=1,["end"]=2,["not-valid"]=3}');
  });

  it("omits nil only from an exact single-local initializer", () => {
    expect(minify("local value=nil", { canonicalizeSyntax: true })).toBe("local value");
    expect(minify("local a,b=nil,f()", { canonicalizeSyntax: true })).toBe("local a,b=nil,f()");
  });
});

describe("Lua control-flow simplification rules", () => {
  it("inverts an exact negated if/else and swaps its branches", () => {
    expect(minify(
      "if not ready then a() else b() end",
      { simplifyControlFlow: true },
    )).toBe("if ready then b() else a() end");
  });

  it("does not invert an if containing elseif clauses", () => {
    expect(minify(
      "if not ready then a() elseif waiting then b() else c() end",
      { simplifyControlFlow: true },
    )).toBe("if not ready then a() elseif waiting then b() else c() end");
  });

  it("removes while loops whose condition is already false or nil", () => {
    expect(minify(
      "while false do a() end while nil do b() end return 1",
      { simplifyControlFlow: true },
    )).toBe("return 1");
  });

  it("allows one reduction to expose work for other rules", () => {
    expect(minify(
      "local x=1 while 1>2 do print(x) end",
      {
        simplifyExpressions: true,
        simplifyControlFlow: true,
        removeUnusedLocals: true,
      },
    )).toBe("");
  });
});

describe("Lua optimization rule overrides", () => {
  it("can enable one rule while its umbrella is disabled", () => {
    expect(minify(
      'return t["valid"],{["valid"]=1}',
      { ruleOverrides: { "syntax.member-access": true } },
    )).toBe('return t.valid,{["valid"]=1}');
  });

  it("can disable one rule while its umbrella is enabled", () => {
    expect(minify(
      'return t["valid"],{["valid"]=1}',
      {
        canonicalizeSyntax: true,
        ruleOverrides: { "syntax.member-access": false },
      },
    )).toBe('return t["valid"],{valid=1}');
  });

  it("overrides existing rules that have specialized options", () => {
    expect(minify("-- remove me\nreturn 1", {
      stripComments: false,
      ruleOverrides: { "syntax.strip-comments": true },
    })).toBe("return 1");
  });

  it("rejects unknown rule IDs", () => {
    expect(() => minify("return 1", {
      ruleOverrides: { "syntax.typo": true },
    })).toThrow("Unknown Lua optimization rule override: syntax.typo");
  });
});
