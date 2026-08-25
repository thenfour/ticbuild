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

describe("binding-aware unused local removal", () => {
  it("does not treat named table or member keys as local reads", () => {
    expect(minify("local key=1 return {key=2},source.key", {
      removeUnusedLocals: true,
    })).toBe("return{key=2},source.key");
  });

  it("distinguishes shadowed locals", () => {
    expect(minify("local x=1 do local x=2 print(x) end", {
      removeUnusedLocals: true,
    })).toBe("do local x=2print(x)end");
  });

  it("removes unused aligned slots with pure initializers", () => {
    expect(minify("local a,b=side(),2 return a", {
      removeUnusedLocals: true,
    })).toBe("local a=side()return a");
  });

  it("keeps an unused slot whose initializer may have effects", () => {
    expect(minify("local a,b=1,side() return a", {
      removeUnusedLocals: true,
    })).toBe("local a,b=1,side()return a");
  });

  it("removes an unused trailing multi-return suffix", () => {
    expect(minify("local a,b,c=values() return a", {
      removeUnusedLocals: true,
    })).toBe("local a=values()return a");
  });

  it("keeps declarations targeted by later assignments", () => {
    expect(minify("local x=1 x=2", {
      removeUnusedLocals: true,
    })).toBe("local x=1x=2");
  });
});

describe("unused parameter removal", () => {
  it("removes an unused suffix without changing call sites", () => {
    expect(minify("local function f(a,b,c)return a end return f(1,2,3)", {
      ruleOverrides: { "reduce.remove-unused-parameters": true },
    })).toBe("local function f(a)return a end return f(1,2,3)");
  });

  it("does not shift a used parameter across an unused middle parameter", () => {
    expect(minify("local function f(a,b,c)return a,c end", {
      ruleOverrides: { "reduce.remove-unused-parameters": true },
    })).toBe("local function f(a,b,c)return a,c end");
  });

  it("preserves named parameters when the function consumes varargs", () => {
    expect(minify("local function f(a,b,...)return a,... end", {
      ruleOverrides: { "reduce.remove-unused-parameters": true },
    })).toBe("local function f(a,b,...)return a,...end");
  });

  it("can remove named parameters when declared varargs are unused", () => {
    expect(minify("local function f(a,b,...)return a end", {
      ruleOverrides: { "reduce.remove-unused-parameters": true },
    })).toBe("local function f(a,...)return a end");
  });

  it("keeps a parameter that is assigned even if it is never read", () => {
    expect(minify("local function f(a,b)b=1 return a end", {
      ruleOverrides: { "reduce.remove-unused-parameters": true },
    })).toBe("local function f(a,b)b=1return a end");
  });
});

describe("unused generic-for variable removal", () => {
  it("removes an unused trailing iterator result", () => {
    expect(minify("for k,v in pairs(items)do print(k)end", {
      ruleOverrides: { "reduce.remove-unused-for-variables": true },
    })).toBe("for k in pairs(items)do print(k)end");
  });

  it("does not shift a used variable across an unused middle result", () => {
    expect(minify("for a,b,c in values()do print(a,c)end", {
      ruleOverrides: { "reduce.remove-unused-for-variables": true },
    })).toBe("for a,b,c in values()do print(a,c)end");
  });

  it("retains the required first variable when no iterator results are read", () => {
    expect(minify("for a,b,c in values()do tick()end", {
      ruleOverrides: { "reduce.remove-unused-for-variables": true },
    })).toBe("for a in values()do tick()end");
  });
});

describe("immutable local alias elimination", () => {
  it("uses the original binding for table and function identity", () => {
    expect(minify("local object=make() local alias=object use(alias)", {
      ruleOverrides: { "reduce.inline-immutable-aliases": true },
    })).toBe("local object=make()use(object)");
  });

  it("collapses alias chains over reduction rounds", () => {
    expect(minify("local root=make() local first=root local second=first use(second)", {
      ruleOverrides: { "reduce.inline-immutable-aliases": true },
    })).toBe("local root=make()use(root)");
  });

  it("keeps aliases whose source can be rebound", () => {
    expect(minify("local source=make() local alias=source source=other use(alias)", {
      ruleOverrides: { "reduce.inline-immutable-aliases": true },
    })).toBe("local source=make()local alias=source source=other use(alias)");
  });

  it("keeps aliases that are themselves assigned", () => {
    expect(minify("local source=make() local alias=source alias=other use(alias)", {
      ruleOverrides: { "reduce.inline-immutable-aliases": true },
    })).toBe("local source=make()local alias=source alias=other use(alias)");
  });

  it("does not capture a same-named binding around an alias read", () => {
    expect(minify([
      "local source=make()",
      "local alias=source",
      "do local source=other use(alias) end",
    ].join("\n"), {
      ruleOverrides: { "reduce.inline-immutable-aliases": true },
    })).toBe("local source=make()local alias=source do local source=other use(alias)end");
  });

  it("keeps an alias when longer replacements outweigh its declaration", () => {
    expect(minify([
      "local extraordinarilyLongSourceName=make()",
      "local x=extraordinarilyLongSourceName",
      "return x,x,x,x",
    ].join("\n"), {
      ruleOverrides: { "reduce.inline-immutable-aliases": true },
    })).toBe(
      "local extraordinarilyLongSourceName=make()local x=extraordinarilyLongSourceName " +
      "return x,x,x,x",
    );
  });
});

describe("exact local self-assignment removal", () => {
  it("removes a local assignment whose values are unchanged", () => {
    expect(minify("local a,b=1,2 a,b=a,b return a,b", {
      ruleOverrides: { "reduce.remove-self-assignments": true },
    })).toBe("local a,b=1,2return a,b");
  });

  it("does not remove a global self-assignment", () => {
    expect(minify("value=value", {
      ruleOverrides: { "reduce.remove-self-assignments": true },
    })).toBe("value=value");
  });

  it("uses binding identity rather than identifier spelling", () => {
    expect(minify("local x=1 do local x=x x=x print(x)end", {
      ruleOverrides: { "reduce.remove-self-assignments": true },
    })).toBe("local x=1do local x=x print(x)end");
  });
});

describe("single-use expression inlining", () => {
  it("moves a pure expression into an adjacent direct return", () => {
    expect(minify("local x=a+b return x", {
      ruleOverrides: { "reduce.inline-single-use-expressions": true },
    })).toBe("return a+b");
  });

  it("collapses adjacent expression chains over reduction rounds", () => {
    expect(minify("local x=a+b local y=x return y", {
      ruleOverrides: { "reduce.inline-single-use-expressions": true },
    })).toBe("return a+b");
  });

  it("does not move calls or multi-return values", () => {
    expect(minify("local x=make() return x", {
      ruleOverrides: { "reduce.inline-single-use-expressions": true },
    })).toBe("local x=make()return x");
  });

  it("does not cross an intervening statement", () => {
    expect(minify("local x=a+b tick() return x", {
      ruleOverrides: { "reduce.inline-single-use-expressions": true },
    })).toBe("local x=a+b tick()return x");
  });

  it("requires the read to be the complete returned value", () => {
    expect(minify("local x=a+b return consume(x)", {
      ruleOverrides: { "reduce.inline-single-use-expressions": true },
    })).toBe("local x=a+b return consume(x)");
  });
});

describe("straight-line dead store removal", () => {
  it("moves an adjacent overwrite into the retained declaration", () => {
    expect(minify("local x=1 x=2 return x", {
      ruleOverrides: { "reduce.remove-straight-line-dead-stores": true },
    })).toBe("local x=2return x");
  });

  it("removes an overwritten single-local assignment", () => {
    expect(minify("local x x=1 x=2 return x", {
      ruleOverrides: { "reduce.remove-straight-line-dead-stores": true },
    })).toBe("local x x=2return x");
  });

  it("does not discard an effectful stored expression", () => {
    expect(minify("local x=make() x=2 return x", {
      ruleOverrides: { "reduce.remove-straight-line-dead-stores": true },
    })).toBe("local x=make()x=2return x");
  });

  it("does not move an overwrite past an intervening statement", () => {
    expect(minify("local x=1 observe() x=2 return x", {
      ruleOverrides: { "reduce.remove-straight-line-dead-stores": true },
    })).toBe("local x=1observe()x=2return x");
  });

  it("keeps a value read by the overwriting expression", () => {
    expect(minify("local x=1 x=x+1 return x", {
      ruleOverrides: { "reduce.remove-straight-line-dead-stores": true },
    })).toBe("local x=1x=x+1return x");
  });

  it("keeps the old value before a potentially effectful overwrite", () => {
    expect(minify("local x=1 x=next_value() return x", {
      ruleOverrides: { "reduce.remove-straight-line-dead-stores": true },
    })).toBe("local x=1x=next_value()return x");
  });

  it("does not move a capturing closure into its binding's initializer", () => {
    expect(minify("local x=1 x=function()return x end return x", {
      ruleOverrides: { "reduce.remove-straight-line-dead-stores": true },
    })).toBe("local x=1x=function()return x end return x");
  });
});

describe("binding optimization umbrellas and overrides", () => {
  it("enables unused parameters and loop variables under removeUnusedLocals", () => {
    expect(minify([
      "local function f(a,b)return a end",
      "for k,v in pairs(items)do print(k)end",
    ].join("\n"), {
      removeUnusedLocals: true,
    })).toBe("local function f(a)return a end for k in pairs(items)do print(k)end");
  });

  it("can disable a granular rule under its umbrella", () => {
    expect(minify("local function f(a,b)return a end", {
      removeUnusedLocals: true,
      ruleOverrides: { "reduce.remove-unused-parameters": false },
    })).toBe("local function f(a,b)return a end");
  });

  it("enables expression and store reductions under simplifyExpressions", () => {
    expect(minify("local x=1 x=a+b return x", {
      simplifyExpressions: true,
      ruleOverrides: { "reduce.inline-immutable-scalars": false },
    })).toBe("return a+b");
  });
});
