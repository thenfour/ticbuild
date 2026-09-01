import * as luaparse from "luaparse";
import { inheritLuaNodeOrigin } from "./lua_ast_provenance";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import type { LuaOptimizationRule } from "./lua_optimizer_types";
import { isLuaIdentifierName, StringLiteralNode, stringValue } from "./lua_utils";

export const bareTableKeySyntaxRule: LuaOptimizationRule = {
  id: "syntax.bare-table-key",
  family: "syntax",
  description: "Print constant identifier table keys with bare-key syntax",
  defaultEnabled: (options) => options.canonicalizeSyntax ?? false,
  hooks: {
    reduce(context) {
      const changed = rewriteLuaAst(context.ast, {
        expression(expression) {
          if (expression.type !== "TableConstructorExpression") {
            return { expression, changed: false };
          }

          let fieldsChanged = false;
          const fields = expression.fields.map((field) => {
            if (field.type !== "TableKey" || field.key.type !== "StringLiteral") {
              return field;
            }
            const name = stringValue(field.key as StringLiteralNode);
            if (name === null || !isLuaIdentifierName(name)) {
              return field;
            }

            fieldsChanged = true;
            const key = inheritLuaNodeOrigin<luaparse.Identifier>({
              type: "Identifier",
              name,
            }, field.key, name);
            return inheritLuaNodeOrigin<luaparse.TableKeyString>({
              type: "TableKeyString",
              key,
              value: field.value,
            }, field);
          });

          if (!fieldsChanged) {
            return { expression, changed: false };
          }
          return {
            expression: inheritLuaNodeOrigin<luaparse.TableConstructorExpression>({
              ...expression,
              fields,
            }, expression),
            changed: true,
          };
        },
      });
      return { changed };
    },
  },
};
