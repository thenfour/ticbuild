import * as luaparse from "luaparse";
import { inheritLuaNodeOrigin } from "./lua_ast_provenance";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import type { LuaOptimizationRule } from "./lua_optimizer_types";

export const omitLocalNilSyntaxRule: LuaOptimizationRule = {
  id: "syntax.omit-local-nil",
  family: "syntax",
  description: "Omit a redundant nil initializer from a single local declaration",
  defaultEnabled: (options) => options.canonicalizeSyntax ?? false,
  hooks: {
    reduce(context) {
      const changed = rewriteLuaAst(context.ast, {
        statement(statement) {
          if (
            statement.type !== "LocalStatement" ||
            statement.variables.length !== 1 ||
            statement.init.length !== 1 ||
            statement.init[0].type !== "NilLiteral"
          ) {
            return { statements: [statement], changed: false };
          }

          const replacement = inheritLuaNodeOrigin<luaparse.LocalStatement>({
            ...statement,
            init: [],
          }, statement);
          return { statements: [replacement], changed: true };
        },
      });
      return { changed };
    },
  },
};
