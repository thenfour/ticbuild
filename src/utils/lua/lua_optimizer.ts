import * as luaparse from "luaparse";
import { runAliasPasses } from "./lua_alias_shared";
import type { AliasPassReport, AliasStrategy } from "./lua_alias_shared";
import { luaOptimizationRules } from "./lua_optimizer_rules";
import type {
  LuaLocalIntroductionCollector,
  LuaOptimizationContext,
  LuaOptimizationHook,
  LuaOptimizationRule,
  OptimizationRuleOptions,
} from "./lua_optimizer_types";

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

function runHooks(
  rules: readonly LuaOptimizationRule[],
  context: LuaOptimizationContext,
  selectHook: (rule: LuaOptimizationRule) => LuaOptimizationHook | undefined,
): void {
  for (const rule of rules) {
    selectHook(rule)?.(context);
  }
}

export function optimizeLuaAst(
  ast: luaparse.Chunk,
  options: OptimizationRuleOptions,
  rules: readonly LuaOptimizationRule[] = luaOptimizationRules,
): LuaOptimizationResult {
  validateRules(rules);

  const localIntroductions = new LocalIntroductionPlanner();
  const context: LuaOptimizationContext = { ast, options };
  const enabledRules = rules.filter((rule) => rule.enabled(options));

  runHooks(enabledRules, context, (rule) => rule.hooks.normalize);
  runHooks(enabledRules, context, (rule) => rule.hooks.reduce);

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
