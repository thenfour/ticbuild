import * as luaparse from "luaparse";
import { literalAliasStrategy } from "./lua_alias_literals";
import { optimizeLuaAst } from "./lua_optimizer";
import { luaOptimizationRules } from "./lua_optimizer_rules";
import type { LuaOptimizationRule, OptimizationRuleOptions } from "./lua_optimizer_types";

const options: OptimizationRuleOptions = {
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
};

function parse(code: string): luaparse.Chunk {
  return luaparse.parse(code, {
    luaVersion: "5.3",
    comments: true,
    locations: true,
    ranges: true,
  });
}

describe("Lua optimizer engine", () => {
  it("executes stages in engine order and rules in registry order", () => {
    const events: string[] = [];
    const rules: LuaOptimizationRule[] = [
      {
        id: "test.registered-first",
        family: "test",
        description: "First test rule",
        enabled: () => true,
        hooks: {
          reduce: () => events.push("first.reduce"),
          rename: () => events.push("first.rename"),
        },
      },
      {
        id: "test.registered-second",
        family: "test",
        description: "Second test rule",
        enabled: () => true,
        hooks: {
          normalize: () => events.push("second.normalize"),
          reduce: () => events.push("second.reduce"),
          finalize: () => events.push("second.finalize"),
        },
      },
      {
        id: "test.disabled",
        family: "test",
        description: "Disabled test rule",
        enabled: () => false,
        hooks: {
          normalize: () => events.push("disabled.normalize"),
        },
      },
    ];

    optimizeLuaAst(parse("return 1"), options, rules);

    expect(events).toEqual([
      "second.normalize",
      "first.reduce",
      "second.reduce",
      "second.finalize",
      "first.rename",
    ]);
  });

  it("applies all local proposals before finalization", () => {
    let finalizeSawGeneratedLocal = false;
    const aliasRule: LuaOptimizationRule = {
      id: "test.alias",
      family: "test",
      description: "Propose a literal alias",
      enabled: () => true,
      hooks: {
        introduceLocals(context) {
          context.localIntroductions.proposeAlias(literalAliasStrategy);
        },
      },
    };
    const observerRule: LuaOptimizationRule = {
      id: "test.finalize-observer",
      family: "test",
      description: "Observe the finalized AST",
      enabled: () => true,
      hooks: {
        finalize(context) {
          finalizeSawGeneratedLocal = context.ast.body[0]?.type === "LocalStatement";
        },
      },
    };
    const source = Array.from(
      { length: 4 },
      () => 'print("a sufficiently long repeated literal")',
    ).join("\n");

    optimizeLuaAst(parse(source), options, [observerRule, aliasRule]);

    expect(finalizeSawGeneratedLocal).toBe(true);
  });

  it("rejects local proposals outside their scheduling stage", () => {
    type IntroductionContext = Parameters<
      NonNullable<LuaOptimizationRule["hooks"]["introduceLocals"]>
    >[0];
    let retainedCollector: IntroductionContext["localIntroductions"];
    const invalidRule: LuaOptimizationRule = {
      id: "test.invalid-local-proposal",
      family: "test",
      description: "Propose a local at the wrong time",
      enabled: () => true,
      hooks: {
        introduceLocals(context) {
          retainedCollector = context.localIntroductions;
        },
        finalize() {
          retainedCollector.proposeAlias(literalAliasStrategy);
        },
      },
    };

    expect(() => optimizeLuaAst(parse("return 1"), options, [invalidRule]))
      .toThrow("introduceLocals stage");
  });

  it("keeps rule metadata complete and identifiers unique", () => {
    const ids = luaOptimizationRules.map((rule) => rule.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const rule of luaOptimizationRules) {
      expect(rule.id).toMatch(/^[a-z]+[a-z.-]*$/);
      expect(rule.family.length).toBeGreaterThan(0);
      expect(rule.description.length).toBeGreaterThan(0);
      expect(Object.keys(rule.hooks).length).toBeGreaterThan(0);
    }
  });
});
