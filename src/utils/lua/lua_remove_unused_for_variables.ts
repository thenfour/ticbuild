import * as luaparse from "luaparse";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import { analyzeLuaLexicalBindings, LuaLocalBinding } from "./lua_lexical_bindings";
import type { LuaOptimizationRule } from "./lua_optimizer_types";

function isUnused(binding: LuaLocalBinding | undefined): boolean {
  return binding !== undefined && binding.reads.length === 0 && binding.writes.length === 0;
}

function removeUnusedForVariables(ast: luaparse.Chunk): boolean {
  const analysis = analyzeLuaLexicalBindings(ast);
  return rewriteLuaAst(ast, {
    statement(statement) {
      if (statement.type !== "ForGenericStatement") {
        return { statements: [statement], changed: false };
      }

      let keepCount = statement.variables.length;
      while (
        keepCount > 1 &&
        isUnused(analysis.bindingByIdentifier.get(statement.variables[keepCount - 1]))
      ) {
        keepCount--;
      }
      if (keepCount === statement.variables.length) {
        return { statements: [statement], changed: false };
      }
      statement.variables = statement.variables.slice(0, keepCount);
      return { statements: [statement], changed: true };
    },
  });
}

export const removeUnusedForVariablesRule: LuaOptimizationRule = {
  id: "reduce.remove-unused-for-variables",
  family: "dead-code",
  description: "Remove trailing unused generic-for variables",
  defaultEnabled: (options) => options.removeUnusedLocals,
  hooks: {
    reduce(context) {
      return { changed: removeUnusedForVariables(context.ast) };
    },
  },
};
