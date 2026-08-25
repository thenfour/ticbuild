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

describe("Lua declaration packing with implicit nils", () => {
  const packingOptions: Partial<OptimizationRuleOptions> = {
    canonicalizeSyntax: true,
    packLocalDeclarations: true,
  };

  it("packs declarations whose initializers are all implicit nil", () => {
    expect(minify(
      "local x=nil local y=nil return x,y",
      packingOptions,
    )).toBe("local x,y return x,y");
  });

  it("omits a trailing implicit nil after a single-valued initializer", () => {
    expect(minify(
      "local x=1 local y=nil return x,y",
      packingOptions,
    )).toBe("local x,y=1 return x,y");
  });

  it("materializes positional nils before later initializers", () => {
    expect(minify(
      "local x=nil local y=f() return x,y",
      packingOptions,
    )).toBe("local x,y=nil,f() return x,y");
  });

  it("closes a multi-return initializer with one nil before omitting later nils", () => {
    expect(minify(
      "local x=f() local y=nil local z=nil return x,y,z",
      packingOptions,
    )).toBe("local x,y,z=f(),nil return x,y,z");
  });

  it("does not pack a declaration with extra side-effecting initializers", () => {
    expect(minify(
      "local x=f(),g() local y=1 return x,y",
      packingOptions,
    )).toBe("local x=f(),g() local y=1 return x,y");
  });

  it("does not create a literal alias for nils that packing leaves implicit", () => {
    const declarations = Array.from({ length: 6 }, (_, index) =>
      `local value${index}=nil`
    ).join("\n");
    const output = minify(
      `${declarations}\nreturn value0,value1,value2,value3,value4,value5`,
      { ...packingOptions, aliasLiterals: true },
    );

    expect(output).not.toContain("nil");
    expect(output.match(/\blocal\b/g)).toHaveLength(1);
  });

  it("lets literal aliases see nil placeholders that packing must materialize", () => {
    const declarations = Array.from({ length: 20 }, (_, index) => [
      `local value${index}=nil`,
      `local result${index}=f()`,
    ].join("\n")).join("\n");
    const output = minify(
      `${declarations}\nreturn value0`,
      {
        ...packingOptions,
        aliasLiterals: true,
        renameLocalVariables: true,
        maxLineLength: 10_000,
      },
    );

    expect(output.match(/\bnil\b/g)).toHaveLength(1);
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
      ruleOverrides: { "syntax.typo": true } as unknown as OptimizationRuleOptions["ruleOverrides"],
    })).toThrow("Unknown Lua optimization rule override: syntax.typo");
  });
});
