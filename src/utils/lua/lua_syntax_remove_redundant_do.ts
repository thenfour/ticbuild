import * as luaparse from "luaparse";
import { walkAST } from "./lua_ast";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import type { LuaOptimizationRule } from "./lua_optimizer_types";

function hasDirectLocalDeclarations(body: readonly luaparse.Statement[]): boolean {
  return body.some((statement) =>
    statement.type === "LocalStatement" ||
    (statement.type === "FunctionDeclaration" && statement.isLocal)
  );
}

function containsJumpSyntax(statement: luaparse.DoStatement): boolean {
  let found = false;
  walkAST(statement, (node) => {
    found ||= node.type === "GotoStatement" || node.type === "LabelStatement";
  });
  return found;
}

function canRemoveDo(
  statement: luaparse.DoStatement,
  parent: luaparse.Node,
  isLastStatement: boolean,
): boolean {
  if (containsJumpSyntax(statement)) return false;
  if (!hasDirectLocalDeclarations(statement.body)) return true;

  // A tail block cannot extend a local across any later statement. Repeat bodies
  // are the exception: their locals are also visible to the until condition.
  return isLastStatement && parent.type !== "RepeatStatement";
}

export const removeRedundantDoSyntaxRule: LuaOptimizationRule = {
  id: "syntax.remove-redundant-do",
  family: "syntax",
  description: "Remove lexical do blocks whose scope is provably redundant",
  defaultEnabled: (options) => options.canonicalizeSyntax ?? false,
  hooks: {
    reduce(context) {
      const changed = rewriteLuaAst(context.ast, {
        statement(statement, rewriteContext) {
          if (
            statement.type !== "DoStatement" ||
            !canRemoveDo(
              statement,
              rewriteContext.parent,
              rewriteContext.index === rewriteContext.body.length - 1,
            )
          ) {
            return { statements: [statement], changed: false };
          }
          return { statements: statement.body, changed: true };
        },
      });
      return { changed };
    },
  },
};
