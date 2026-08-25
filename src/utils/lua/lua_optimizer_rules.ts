import { aliasRepeatedExpressionsRule } from "./lua_alias_expressions";
import { aliasLiteralsRule } from "./lua_alias_literals";
import type { LuaOptimizationRule } from "./lua_optimizer_types";
import { packLocalDeclarationsRule } from "./lua_pack_locals";
import { removeUnusedFunctionsRule } from "./lua_remove_unused_functions";
import { removeUnusedLocalsRule } from "./lua_remove_unused_locals";
import { renameAllowedGlobalsRule } from "./lua_rename_allowed_globals";
import { renameAllowedTableKeysRule } from "./lua_rename_allowed_table_keys";
import { renameTableFieldsRule } from "./lua_rename_table_fields";
import { renameLocalVariablesRule } from "./lua_renamer";
import { simplifyExpressionsRule } from "./lua_simplify";
import { stripCommentsRule } from "./lua_strip_comments";

export const luaOptimizationRules: readonly LuaOptimizationRule[] = [
  stripCommentsRule,
  simplifyExpressionsRule,
  removeUnusedLocalsRule,
  removeUnusedFunctionsRule,
  aliasLiteralsRule,
  aliasRepeatedExpressionsRule,
  packLocalDeclarationsRule,
  renameLocalVariablesRule,
  renameAllowedGlobalsRule,
  renameAllowedTableKeysRule,
  renameTableFieldsRule,
];
