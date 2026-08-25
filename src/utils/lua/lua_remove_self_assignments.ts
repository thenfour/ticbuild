import * as luaparse from "luaparse";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import { analyzeLuaLexicalBindings } from "./lua_lexical_bindings";
import type { LuaOptimizationRule } from "./lua_optimizer_types";

function removeSelfAssignments(ast: luaparse.Chunk): boolean {
  const analysis = analyzeLuaLexicalBindings(ast);
  return rewriteLuaAst(ast, {
    statement(statement) {
      if (
        statement.type !== "AssignmentStatement" ||
        statement.variables.length !== statement.init.length ||
        statement.variables.length === 0
      ) {
        return { statements: [statement], changed: false };
      }

      const isLocalNoOp = statement.variables.every((target, index) => {
        const value = statement.init[index];
        if (target.type !== "Identifier" || value.type !== "Identifier") return false;
        const targetBinding = analysis.bindingByIdentifier.get(target);
        return targetBinding !== undefined &&
          targetBinding === analysis.bindingByIdentifier.get(value);
      });
      return isLocalNoOp
        ? { statements: [], changed: true }
        : { statements: [statement], changed: false };
    },
  });
}

export const removeSelfAssignmentsRule: LuaOptimizationRule = {
  id: "reduce.remove-self-assignments",
  family: "simplify",
  description: "Remove assignments that preserve exact local binding values",
  defaultEnabled: (options) => options.simplifyExpressions,
  hooks: {
    reduce(context) {
      return { changed: removeSelfAssignments(context.ast) };
    },
  },
};
