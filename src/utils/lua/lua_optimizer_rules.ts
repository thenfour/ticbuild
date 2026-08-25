// registry of minifier rules

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
import { bareTableKeySyntaxRule } from "./lua_syntax_bare_table_key";
import { memberAccessSyntaxRule } from "./lua_syntax_member_access";
import { omitLocalNilSyntaxRule } from "./lua_syntax_omit_local_nil";
import { invertNegatedIfRule } from "./lua_control_flow_invert_negated_if";
import { removeFalseWhileRule } from "./lua_control_flow_remove_false_while";

export const luaOptimizationRules: readonly LuaOptimizationRule[] = [
  stripCommentsRule,
  simplifyExpressionsRule,
  memberAccessSyntaxRule,
  bareTableKeySyntaxRule,
  omitLocalNilSyntaxRule,
  invertNegatedIfRule,
  removeFalseWhileRule,
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
