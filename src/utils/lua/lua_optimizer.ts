import * as luaparse from "luaparse";
import { runAliasPasses } from "./lua_alias_shared";
import type { AliasPassReport, AliasStrategy } from "./lua_alias_shared";
import { luaOptimizationRules } from "./lua_optimizer_rules";
import { fingerprintLuaAst } from "./lua_optimizer_fingerprint";
import type {
  LuaLocalIntroductionCollector,
  LuaOptimizationContext,
  LuaOptimizationHook,
  LuaOptimizationRule,
  OptimizationRuleOptions,
} from "./lua_optimizer_types";

// number of passes we can run over the Lua source to reduce feedback-style,
// before we give up and assume cyclic.
export const MAX_LUA_REDUCTION_ROUNDS = 100;

class LocalIntroductionPlanner implements LuaLocalIntroductionCollector {
  private readonly aliasStrategies: AliasStrategy[] = [];
  private acceptingProposals = false;

  collect(runRules: () => void): void {
    this.acceptingProposals = true;
    try {
      runRules();
    } finally {
      this.acceptingProposals = false;
    }
  }

  proposeAlias(strategy: AliasStrategy): void {
    if (!this.acceptingProposals) {
      throw new Error("Local introductions may only be proposed during the introduceLocals stage");
    }
    if (this.aliasStrategies.includes(strategy)) {
      throw new Error(`Alias strategy ${strategy.rule} was proposed more than once`);
    }
    this.aliasStrategies.push(strategy);
  }

  apply(ast: luaparse.Chunk): { ast: luaparse.Chunk; report: AliasPassReport } {
    return runAliasPasses(ast, this.aliasStrategies);
  }
}

export type LuaOptimizationResult = {
  ast: luaparse.Chunk;
  report: AliasPassReport;
};

function validateRules(rules: readonly LuaOptimizationRule[]): void {
  const ids = new Set<string>();
  for (const rule of rules) {
    if (ids.has(rule.id)) {
      throw new Error(`Duplicate Lua optimization rule id: ${rule.id}`);
    }
    ids.add(rule.id);
    if (Object.keys(rule.hooks).length === 0) {
      throw new Error(`Lua optimization rule ${rule.id} has no hooks`);
    }
  }
}

function selectEnabledRules(
  rules: readonly LuaOptimizationRule[],
  options: OptimizationRuleOptions,
): readonly LuaOptimizationRule[] {
  const rulesById = new Map(rules.map((rule) => [rule.id, rule]));
  for (const id of Object.keys(options.ruleOverrides ?? {})) {
    if (!rulesById.has(id)) {
      throw new Error(`Unknown Lua optimization rule override: ${id}`);
    }
  }

  return rules.filter((rule) =>
    options.ruleOverrides?.[rule.id] ?? rule.defaultEnabled(options)
  );
}

function runHooks(
  rules: readonly LuaOptimizationRule[],
  context: LuaOptimizationContext,
  selectHook: (rule: LuaOptimizationRule) => LuaOptimizationHook | undefined,
): void {
  for (const rule of rules) {
    selectHook(rule)?.(context);
  }
}

function changedRuleSummary(rounds: readonly string[][]): string {
  return [...new Set(rounds.flat())].join(", ") || "none";
}

function runReductions(
  rules: readonly LuaOptimizationRule[],
  context: LuaOptimizationContext,
): void {
  const reductionRules = rules.filter((rule) => rule.hooks.reduce !== undefined);
  if (reductionRules.length === 0) return;

  const fingerprints = new Map<string, number>();
  const changedRulesByRound: string[][] = [];

  for (let round = 0; round < MAX_LUA_REDUCTION_ROUNDS; round++) {
    const startFingerprint = fingerprintLuaAst(context.ast);
    const repeatedRound = fingerprints.get(startFingerprint);
    if (repeatedRound !== undefined) {
      const cycleRules = changedRulesByRound.slice(repeatedRound);
      throw new Error(
        `Lua reduction cycle: round ${round} repeats round ${repeatedRound}; ` +
        `changing rules: ${changedRuleSummary(cycleRules)}`,
      );
    }
    fingerprints.set(startFingerprint, round);

    const changedRules: string[] = [];
    for (const rule of reductionRules) {
      if (rule.hooks.reduce?.(context).changed) {
        changedRules.push(rule.id);
      }
    }
    changedRulesByRound.push(changedRules);

    if (changedRules.length === 0) {
      if (fingerprintLuaAst(context.ast) !== startFingerprint) {
        throw new Error(
          "A Lua reduction rule changed the AST without reporting a change; " +
          `checked rules: ${reductionRules.map((rule) => rule.id).join(", ")}`,
        );
      }
      return;
    }
  }

  const finalFingerprint = fingerprintLuaAst(context.ast);
  const repeatedRound = fingerprints.get(finalFingerprint);
  if (repeatedRound !== undefined) {
    const cycleRules = changedRulesByRound.slice(repeatedRound);
    throw new Error(
      `Lua reduction cycle: round ${MAX_LUA_REDUCTION_ROUNDS} repeats round ${repeatedRound}; ` +
      `changing rules: ${changedRuleSummary(cycleRules)}`,
    );
  }

  throw new Error(
    `Lua reductions did not converge after ${MAX_LUA_REDUCTION_ROUNDS} rounds; ` +
    `changing rules: ${changedRuleSummary(changedRulesByRound)}`,
  );
}

export function optimizeLuaAst(
  ast: luaparse.Chunk,
  options: OptimizationRuleOptions,
  rules: readonly LuaOptimizationRule[] = luaOptimizationRules,
): LuaOptimizationResult {
  validateRules(rules);

  const localIntroductions = new LocalIntroductionPlanner();
  const context: LuaOptimizationContext = { ast, options };
  const enabledRules = selectEnabledRules(rules, options);

  runHooks(enabledRules, context, (rule) => rule.hooks.normalize);
  runReductions(enabledRules, context);
  runHooks(enabledRules, context, (rule) => rule.hooks.prepareLocals);

  localIntroductions.collect(() => {
    const introductionContext = { ast: context.ast, options, localIntroductions };
    for (const rule of enabledRules) {
      rule.hooks.introduceLocals?.(introductionContext);
    }
  });
  const introductionResult = localIntroductions.apply(context.ast);
  context.ast = introductionResult.ast;

  runHooks(enabledRules, context, (rule) => rule.hooks.finalize);
  runHooks(enabledRules, context, (rule) => rule.hooks.rename);

  return { ast: context.ast, report: introductionResult.report };
}
