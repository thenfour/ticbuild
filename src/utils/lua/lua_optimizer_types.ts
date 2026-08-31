import * as luaparse from "luaparse";
import type { AliasStrategy } from "./lua_alias_shared";
import type { LuaPrinterOptions } from "./lua_printer_types";

export const OptimizationRuleIds = [
  "syntax.strip-comments",
  "reduce.simplify-expressions",
  "reduce.inline-immutable-scalars",
  "reduce.inline-immutable-aliases",
  "reduce.inline-single-use-expressions",
  "reduce.remove-self-assignments",
  "reduce.remove-straight-line-dead-stores",
  "syntax.member-access",
  "syntax.bare-table-key",
  "syntax.omit-local-nil",
  "syntax.remove-redundant-do",
  "control-flow.invert-negated-if",
  "control-flow.resolve-constant-if",
  "control-flow.remove-false-while",
  "reduce.remove-unused-locals",
  "reduce.remove-unused-parameters",
  "reduce.remove-unused-for-variables",
  "reduce.remove-unused-functions",
  "introduce.alias-literals",
  "introduce.alias-repeated-expressions",
  "finalize.pack-local-declarations",
  "rename.local-variables",
  "rename.allowed-globals",
  "rename.allowed-table-keys",
  "rename.table-fields",
] as const;

export type OptimizationRuleId = (typeof OptimizationRuleIds)[number];

export type OptimizationRuleOptions = LuaPrinterOptions & {
  stripComments: boolean;
  renameLocalVariables: boolean;
  aliasRepeatedExpressions: boolean;
  aliasLiterals: boolean;
  // Fold scalar expressions and inline immutable scalar locals.
  simplifyExpressions: boolean;
  removeUnusedLocals: boolean;
  removeUnusedFunctions: boolean;
  // Entrypoints and other externally referenced functions must remain addressable.
  functionNamesToKeep: string[];
  renameTableFields: boolean;
  // These keys may be renamed even when their containing table escapes local analysis.
  tableEntryKeysToRename: string[];
  globalSymbolsToRename?: string[];
  // Opt-in renames only listed globals; opt-out renames defined globals unless kept.
  globalSymbolRenaming?: "off" | "opt-in" | "opt-out";
  globalSymbolsToKeep?: string[];
  packLocalDeclarations: boolean;
  // "umbrella rules" combining small rules
  canonicalizeSyntax?: boolean;
  simplifyControlFlow?: boolean;

  // these win against above settings.
  ruleOverrides?: Readonly<Partial<Record<OptimizationRuleId, boolean>>>;
};

export interface LuaLocalIntroductionCollector {
  // Proposals are resolved together so registration order cannot consume local capacity.
  proposeAlias(strategy: AliasStrategy): void;
}

export type LuaOptimizationContext = {
  ast: luaparse.Chunk;
  readonly options: OptimizationRuleOptions;
};

export type LuaOptimizationHook = (context: LuaOptimizationContext) => void;
export type LuaReductionResult = { changed: boolean };
export type LuaReductionHook = (context: LuaOptimizationContext) => LuaReductionResult;
export type LuaLocalIntroductionHook = (
  context: Readonly<LuaOptimizationContext> & {
    readonly localIntroductions: LuaLocalIntroductionCollector;
  },
) => void;

export type LuaOptimizationHooks = {
  normalize?: LuaOptimizationHook;
  reduce?: LuaReductionHook;
  // Reshape existing locals before rules decide which new locals to introduce.
  prepareLocals?: LuaOptimizationHook;
  introduceLocals?: LuaLocalIntroductionHook;
  finalize?: LuaOptimizationHook;
  rename?: LuaOptimizationHook;
};

export interface LuaOptimizationRule {
  // The engine accepts injected rule sets for tests and diagnostics. The
  // built-in/public override surface is narrowed separately by OptimizationRuleId.
  readonly id: string;
  readonly family: string;
  readonly description: string;
  readonly defaultEnabled: (options: OptimizationRuleOptions) => boolean;
  readonly hooks: LuaOptimizationHooks;
}
