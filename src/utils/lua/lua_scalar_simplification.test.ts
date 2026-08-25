import { OptimizationRuleOptions, processLua } from "./lua_processor";

const baseOptions: OptimizationRuleOptions = {
  maxIndentLevel: 0,
  lineBehavior: "tight2",
  maxLineLength: 10_000,
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

describe("Lua immutable scalar inlining", () => {
  it("replaces a scalar local's only read and removes its declaration", () => {
    expect(minify('local x="hi" print(x)', {
      simplifyExpressions: true,
    })).toBe('print("hi")');
  });

  it("does not propagate a binding written by a called closure", () => {
    expect(minify([
      'local x="hi"',
      'local function set() x="bye" end',
      'set()',
      'print(x)',
    ].join("\n"), {
      simplifyExpressions: true,
    })).toBe('local x="hi"local function set()x="bye"end set()print(x)');
  });

  it("can replace an immutable captured local", () => {
    expect(minify([
      'local x="hi"',
      'local function get() return x end',
      'return get()',
    ].join("\n"), {
      simplifyExpressions: true,
    })).toBe('local function get()return"hi"end return get()');
  });

  it("does not confuse a method's implicit self parameter with an outer local", () => {
    expect(minify([
      'local self="outer"',
      "function target:method() return self end",
      "return self",
    ].join("\n"), {
      simplifyExpressions: true,
    })).toBe('function target:method()return self end return"outer"');
  });

  it("tracks shadowed locals as separate bindings", () => {
    expect(minify([
      'local x="outer"',
      'do',
      '  local x="inner"',
      '  print(x)',
      'end',
      'print(x)',
    ].join("\n"), {
      simplifyExpressions: true,
    })).toBe('do print("inner")end print("outer")');
  });

  it("evaluates local initializers before introducing their bindings", () => {
    expect(minify([
      'local x="outer"',
      "do local x=x print(x) end",
    ].join("\n"), {
      simplifyExpressions: true,
    })).toBe('do print("outer")end');
  });

  it("does not inline a binding assigned after its declaration", () => {
    expect(minify('local x="hi" x="bye" print(x)', {
      simplifyExpressions: true,
    })).toBe('local x="hi"x="bye"print(x)');
  });

  it("treats an omitted initializer as nil when no multi-return can supply it", () => {
    expect(minify("local x return x", {
      simplifyExpressions: true,
    })).toBe("return nil");
  });

  it("does not assume missing values after a multi-return initializer are nil", () => {
    expect(minify("local a,b=values() return b", {
      simplifyExpressions: true,
    })).toBe("local a,b=values()return b");
  });

  it("removes aligned scalar slots from a multi-local declaration", () => {
    expect(minify("local a,b=1,2 return a,b", {
      simplifyExpressions: true,
    })).toBe("return 1,2");
  });

  it("does not confuse named table and member keys with binding reads", () => {
    expect(minify('local key="value" return {key=key},source.key', {
      simplifyExpressions: true,
    })).toBe('return{key="value"},source.key');
  });

  it("keeps _ENV declarations because they affect other name resolution", () => {
    expect(minify("local _ENV=nil return _ENV,unknown", {
      simplifyExpressions: true,
    })).toBe("local _ENV=nil return _ENV,unknown");
  });

  it("does not duplicate a long scalar when direct inlining would cost bytes", () => {
    const literal = '"a fairly long compile time string"';
    expect(minify(`local x=${literal} return x,x,x,x`, {
      simplifyExpressions: true,
    })).toBe(`local x=${literal}return x,x,x,x`);
  });

  it("scores repeated values against the local's eventual renamed length", () => {
    const literal = '"a fairly long compile time string"';
    expect(minify(`local descriptiveName=${literal} return descriptiveName,descriptiveName`, {
      simplifyExpressions: true,
      renameLocalVariables: true,
    })).toBe(`local a=${literal}return a,a`);
  });

  it("does not treat a use nested inside a condition call as a removable condition", () => {
    const literal = '"a fairly long compile time string"';
    expect(minify(`local x=${literal} if check(x,x,x,x) then use() end`, {
      simplifyExpressions: true,
      simplifyControlFlow: true,
    })).toBe(`local x=${literal}if check(x,x,x,x)then use()end`);
  });
});

describe("Lua constant expression folding", () => {
  it("folds finite literal arithmetic, comparisons, and short-circuit expressions", () => {
    expect(minify("return 1+2*3,7==7,false and missing(),true or missing()", {
      simplifyExpressions: true,
    })).toBe("return 7,true,false,true");
  });

  it("does not emit JavaScript spellings for non-finite numeric results", () => {
    const output = minify("return 1/0,0/0,1//0,1%0", {
      simplifyExpressions: true,
    });

    expect(output).toBe("return 1/0,0/0,1//0,1%0");
    expect(output).not.toMatch(/Infinity|NaN/);
  });

  it("does not fold integers that JavaScript cannot represent exactly", () => {
    expect(minify("return 9223372036854775807+1", {
      simplifyExpressions: true,
    })).toContain("+1");
  });

  it("keeps a constant arithmetic expression when its result would print longer", () => {
    expect(minify("return 1/3", {
      simplifyExpressions: true,
    })).toBe("return 1/3");
  });

  it("does not guess equality for string literals it cannot decode safely", () => {
    expect(minify('return "\\255"=="\\255"', {
      simplifyExpressions: true,
    })).toContain("==");
  });
});

describe("Lua constant control-flow resolution", () => {
  it("lets scalar inlining expose a removable while loop", () => {
    expect(minify([
      "local enabled=false",
      'while enabled do print("never") end',
    ].join("\n"), {
      simplifyExpressions: true,
      simplifyControlFlow: true,
    })).toBe("");
  });

  it("can duplicate a flag when every use unlocks control-flow removal", () => {
    expect(minify([
      "local enabled=false",
      "if enabled then first() end",
      "if enabled then second() end",
    ].join("\n"), {
      simplifyExpressions: true,
      simplifyControlFlow: true,
    })).toBe("");
  });

  it("does not duplicate a flag when control-flow removal is disabled", () => {
    expect(minify("local x=false return x,x", {
      simplifyExpressions: true,
      renameLocalVariables: true,
    })).toBe("local a=false return a,a");
  });

  it("selects the reachable if branch", () => {
    expect(minify([
      "local enabled=false",
      "if enabled then dead() else live() end",
    ].join("\n"), {
      simplifyExpressions: true,
      simplifyControlFlow: true,
    })).toBe("live()");
  });

  it("folds derived scalar conditions before selecting a branch", () => {
    expect(minify("local n=1+2 if n==3 then yes() else no() end", {
      simplifyExpressions: true,
      simplifyControlFlow: true,
    })).toBe("yes()");
  });

  it("removes functions made unreachable by a constant branch", () => {
    expect(minify([
      "local function feature() work() end",
      "local enabled=false",
      "if enabled then feature() end",
    ].join("\n"), {
      simplifyExpressions: true,
      simplifyControlFlow: true,
      removeUnusedFunctions: true,
    })).toBe("");
  });

  it("preserves the selected branch's lexical scope", () => {
    expect(minify("if true then local x=1 end return x", {
      simplifyControlFlow: true,
    })).toBe("do local x=1 end return x");
  });

  it("uses Lua truthiness for scalar conditions", () => {
    expect(minify('if 0 then zero() end if "" then empty() end', {
      simplifyControlFlow: true,
    })).toBe("zero()empty()");
  });

  it("prunes constant clauses without discarding an earlier dynamic branch", () => {
    expect(minify([
      "if false then first()",
      "elseif ready then second()",
      "elseif true then third()",
      "else fourth() end",
    ].join("\n"), {
      simplifyControlFlow: true,
    })).toBe("if ready then second()else third()end");
  });
});

describe("Lua scalar simplification rule overrides", () => {
  it("can disable immutable scalar inlining under its umbrella", () => {
    expect(minify('local x="hi" print(x)', {
      simplifyExpressions: true,
      ruleOverrides: { "reduce.inline-immutable-scalars": false },
    })).toBe('local x="hi"print(x)');
  });

  it("can enable immutable scalar inlining without its umbrella", () => {
    expect(minify('local x="hi" print(x)', {
      ruleOverrides: { "reduce.inline-immutable-scalars": true },
    })).toBe('print("hi")');
  });

  it("can disable constant-if resolution under its umbrella", () => {
    expect(minify("if false then dead() else live() end", {
      simplifyControlFlow: true,
      ruleOverrides: { "control-flow.resolve-constant-if": false },
    })).toBe("if false then dead()else live()end");
  });
});
