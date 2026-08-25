import * as luaparse from "luaparse";
import type { AliasStrategy } from "./lua_alias_shared";
import type { LuaPrinterOptions } from "./lua_printer_types";

export type OptimizationRuleOptions = LuaPrinterOptions & {
  stripComments: boolean;
  renameLocalVariables: boolean;
  aliasRepeatedExpressions: boolean;
  aliasLiterals: boolean;
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
export type LuaLocalIntroductionHook = (
  context: Readonly<LuaOptimizationContext> & {
    readonly localIntroductions: LuaLocalIntroductionCollector;
  },
) => void;

export type LuaOptimizationHooks = {
  normalize?: LuaOptimizationHook;
  reduce?: LuaOptimizationHook;
  introduceLocals?: LuaLocalIntroductionHook;
  finalize?: LuaOptimizationHook;
  rename?: LuaOptimizationHook;
};

export interface LuaOptimizationRule {
  readonly id: string;
  readonly family: string;
  readonly description: string;
  readonly enabled: (options: OptimizationRuleOptions) => boolean;
  readonly hooks: LuaOptimizationHooks;
}
