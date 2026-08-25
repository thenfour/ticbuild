import * as luaparse from "luaparse";
import * as fs from "node:fs";
import * as path from "node:path";
import { literalAliasStrategy } from "./lua_alias_literals";
import { MAX_LUA_REDUCTION_ROUNDS, optimizeLuaAst } from "./lua_optimizer";
import { fingerprintLuaAst } from "./lua_optimizer_fingerprint";
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
  it("repeats reductions until removing a function releases its captured local", () => {
    const result = optimizeLuaAst(
      parse("local x=1\nlocal function f() return x end"),
      { ...options, removeUnusedLocals: true, removeUnusedFunctions: true },
    );

    expect(result.ast.body).toEqual([]);
  });

  it("keeps a captured local when its function remains reachable", () => {
    const result = optimizeLuaAst(
      parse("local x=1\nlocal function f() return x end\nreturn f()"),
      { ...options, removeUnusedLocals: true, removeUnusedFunctions: true },
    );

    expect(result.ast.body.map((statement) => statement.type)).toEqual([
      "LocalStatement",
      "FunctionDeclaration",
      "ReturnStatement",
    ]);
  });

  it("keeps side effects after their dependent function is removed", () => {
    const result = optimizeLuaAst(
      parse("local x=time()\nlocal function f() return x end"),
      { ...options, removeUnusedLocals: true, removeUnusedFunctions: true },
    );

    expect(result.ast.body.map((statement) => statement.type)).toEqual(["LocalStatement"]);
  });

  it("executes stages in engine order and rules in registry order", () => {
    const events: string[] = [];
    const rules: LuaOptimizationRule[] = [
      {
        id: "test.registered-first",
        family: "test",
        description: "First test rule",
        defaultEnabled: () => true,
        hooks: {
          reduce: () => {
            events.push("first.reduce");
            return { changed: false };
          },
          rename: () => events.push("first.rename"),
        },
      },
      {
        id: "test.registered-second",
        family: "test",
        description: "Second test rule",
        defaultEnabled: () => true,
        hooks: {
          normalize: () => events.push("second.normalize"),
          reduce: () => {
            events.push("second.reduce");
            return { changed: false };
          },
          prepareLocals: () => events.push("second.prepareLocals"),
          finalize: () => events.push("second.finalize"),
        },
      },
      {
        id: "test.disabled",
        family: "test",
        description: "Disabled test rule",
        defaultEnabled: () => false,
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
      "second.prepareLocals",
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
      defaultEnabled: () => true,
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
      defaultEnabled: () => true,
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
      defaultEnabled: () => true,
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

  it("keeps public rule override IDs synchronized with the manifest schema", () => {
    const schema = JSON.parse(fs.readFileSync(
      path.resolve(__dirname, "../../..", "ticbuild.schema.json"),
      "utf8",
    ));
    const schemaRuleIds = Object.keys(
      schema.properties.assembly.properties.lua.properties.minification
        .properties.ruleOverrides.properties,
    );

    expect(schemaRuleIds.sort()).toEqual(luaOptimizationRules.map((rule) => rule.id).sort());
  });

  it("detects a reduction cycle and identifies the changing rule", () => {
    const toggleRule: LuaOptimizationRule = {
      id: "test.toggle-number",
      family: "test",
      description: "Toggle a number",
      defaultEnabled: () => true,
      hooks: {
        reduce(context) {
          const statement = context.ast.body[0] as luaparse.ReturnStatement;
          const literal = statement.arguments[0] as luaparse.NumericLiteral;
          literal.value = literal.value === 1 ? 2 : 1;
          literal.raw = String(literal.value);
          return { changed: true };
        },
      },
    };

    expect(() => optimizeLuaAst(parse("return 1"), options, [toggleRule]))
      .toThrow(/round 2 repeats round 0.*test\.toggle-number/);
  });

  it("caps reductions whose states never repeat", () => {
    const incrementRule: LuaOptimizationRule = {
      id: "test.increment-number",
      family: "test",
      description: "Increment a number",
      defaultEnabled: () => true,
      hooks: {
        reduce(context) {
          const statement = context.ast.body[0] as luaparse.ReturnStatement;
          const literal = statement.arguments[0] as luaparse.NumericLiteral;
          literal.value += 1;
          literal.raw = String(literal.value);
          return { changed: true };
        },
      },
    };

    expect(() => optimizeLuaAst(parse("return 1"), options, [incrementRule]))
      .toThrow(`did not converge after ${MAX_LUA_REDUCTION_ROUNDS} rounds`);
  });

  it("rejects an AST mutation reported as unchanged", () => {
    const dishonestRule: LuaOptimizationRule = {
      id: "test.unreported-change",
      family: "test",
      description: "Change a number without reporting it",
      defaultEnabled: () => true,
      hooks: {
        reduce(context) {
          const statement = context.ast.body[0] as luaparse.ReturnStatement;
          const literal = statement.arguments[0] as luaparse.NumericLiteral;
          literal.value = 2;
          literal.raw = "2";
          return { changed: false };
        },
      },
    };

    expect(() => optimizeLuaAst(parse("return 1"), options, [dishonestRule]))
      .toThrow("changed the AST without reporting a change");
  });

  it("excludes comments and source locations from structural fingerprints", () => {
    const compact = parse("-- first\nreturn 1");
    const shifted = parse("\n\n-- second\nreturn 1");

    expect(fingerprintLuaAst(compact)).toBe(fingerprintLuaAst(shifted));
  });
});
