import { rewriteLuaAst } from "./lua_ast_rewrite";
import type { LuaOptimizationRule } from "./lua_optimizer_types";

export const removeFalseWhileRule: LuaOptimizationRule = {
  id: "control-flow.remove-false-while",
  family: "control-flow",
  description: "Remove while loops whose condition is already false or nil",
  defaultEnabled: (options) => options.simplifyControlFlow ?? false,
  hooks: {
    reduce(context) {
      const changed = rewriteLuaAst(context.ast, {
        statement(statement) {
          if (
            statement.type !== "WhileStatement" ||
            (statement.condition.type !== "NilLiteral" &&
              (statement.condition.type !== "BooleanLiteral" || statement.condition.value))
          ) {
            return { statements: [statement], changed: false };
          }
          return { statements: [], changed: true };
        },
      });
      return { changed };
    },
  },
};
