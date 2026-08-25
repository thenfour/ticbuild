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
import { resolveConstantIfRule } from "./lua_control_flow_resolve_constant_if";
import { inlineImmutableScalarsRule } from "./lua_inline_immutable_scalars";
import { inlineImmutableAliasesRule } from "./lua_inline_immutable_aliases";
import { removeSelfAssignmentsRule } from "./lua_remove_self_assignments";
import { removeUnusedForVariablesRule } from "./lua_remove_unused_for_variables";
import { removeUnusedParametersRule } from "./lua_remove_unused_parameters";
import { inlineSingleUseExpressionsRule } from "./lua_inline_single_use_expressions";
import { removeStraightLineDeadStoresRule } from "./lua_remove_dead_stores";

export const luaOptimizationRules: readonly LuaOptimizationRule[] = [
  stripCommentsRule,
  simplifyExpressionsRule,
  inlineImmutableScalarsRule,
  inlineImmutableAliasesRule,
  inlineSingleUseExpressionsRule,
  removeSelfAssignmentsRule,
  removeStraightLineDeadStoresRule,
  memberAccessSyntaxRule,
  bareTableKeySyntaxRule,
  omitLocalNilSyntaxRule,
  invertNegatedIfRule,
  resolveConstantIfRule,
  removeFalseWhileRule,
  removeUnusedLocalsRule,
  removeUnusedParametersRule,
  removeUnusedForVariablesRule,
  removeUnusedFunctionsRule,
  aliasLiteralsRule,
  aliasRepeatedExpressionsRule,
  packLocalDeclarationsRule,
  renameLocalVariablesRule,
  renameAllowedGlobalsRule,
  renameAllowedTableKeysRule,
  renameTableFieldsRule,
];
