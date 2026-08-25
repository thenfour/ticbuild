import * as luaparse from "luaparse";
import { isLuaIdentifierName } from "./lua_ast";
import { inheritLuaNodeOrigin } from "./lua_ast_provenance";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import type { LuaOptimizationRule } from "./lua_optimizer_types";
import { StringLiteralNode, stringValue } from "./lua_utils";

export const memberAccessSyntaxRule: LuaOptimizationRule = {
  id: "syntax.member-access",
  family: "syntax",
  description: "Print constant identifier indexes with member-access syntax",
  defaultEnabled: (options) => options.canonicalizeSyntax ?? false,
  hooks: {
    reduce(context) {
      const changed = rewriteLuaAst(context.ast, {
        expression(expression) {
          if (expression.type !== "IndexExpression" || expression.index.type !== "StringLiteral") {
            return { expression, changed: false };
          }
          const name = stringValue(expression.index as StringLiteralNode);
          if (name === null || !isLuaIdentifierName(name)) {
            return { expression, changed: false };
          }

          const identifier = inheritLuaNodeOrigin<luaparse.Identifier>({
            type: "Identifier",
            name,
          }, expression.index, name);
          const member = inheritLuaNodeOrigin<luaparse.MemberExpression>({
            type: "MemberExpression",
            indexer: ".",
            identifier,
            base: expression.base,
          }, expression);
          return { expression: member, changed: true };
        },
      });
      return { changed };
    },
  },
};
