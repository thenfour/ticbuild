import { rewriteLuaAst } from "./lua_ast_rewrite";
import type { LuaOptimizationRule } from "./lua_optimizer_types";

export const invertNegatedIfRule: LuaOptimizationRule = {
  id: "control-flow.invert-negated-if",
  family: "control-flow",
  description: "Invert a negated two-branch if and swap its branches",
  defaultEnabled: (options) => options.simplifyControlFlow ?? false,
  hooks: {
    reduce(context) {
      const changed = rewriteLuaAst(context.ast, {
        statement(statement) {
          if (
            statement.type !== "IfStatement" ||
            statement.clauses.length !== 2 ||
            statement.clauses[0].type !== "IfClause" ||
            statement.clauses[1].type !== "ElseClause"
          ) {
            return { statements: [statement], changed: false };
          }

          const ifClause = statement.clauses[0];
          const elseClause = statement.clauses[1];
          const condition = ifClause.condition;
          if (condition.type !== "UnaryExpression" || condition.operator !== "not") {
            return { statements: [statement], changed: false };
          }

          const thenBody = ifClause.body;
          ifClause.condition = condition.argument;
          ifClause.body = elseClause.body;
          elseClause.body = thenBody;
          return { statements: [statement], changed: true };
        },
      });
      return { changed };
    },
  },
};
