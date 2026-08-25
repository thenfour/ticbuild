import * as luaparse from "luaparse";
import { walkAST } from "./lua_ast";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import { luaExpressionHasSideEffects } from "./lua_expression_effects";
import { analyzeLuaLexicalBindings, LuaLocalBinding } from "./lua_lexical_bindings";
import type { LuaOptimizationRule } from "./lua_optimizer_types";

type Store = {
  readonly statement: luaparse.LocalStatement | luaparse.AssignmentStatement;
  readonly binding: LuaLocalBinding;
  readonly value: luaparse.Expression;
  readonly isDeclaration: boolean;
};

function storeFor(
  statement: luaparse.Statement,
  bindingByIdentifier: ReadonlyMap<luaparse.Identifier, LuaLocalBinding>,
): Store | null {
  if (
    statement.type === "LocalStatement" &&
    statement.variables.length === 1 &&
    statement.init.length === 1
  ) {
    const binding = bindingByIdentifier.get(statement.variables[0]);
    return binding
      ? { statement, binding, value: statement.init[0], isDeclaration: true }
      : null;
  }
  if (
    statement.type === "AssignmentStatement" &&
    statement.variables.length === 1 &&
    statement.variables[0].type === "Identifier" &&
    statement.init.length === 1
  ) {
    const binding = bindingByIdentifier.get(statement.variables[0]);
    return binding
      ? { statement, binding, value: statement.init[0], isDeclaration: false }
      : null;
  }
  return null;
}

function expressionReadsBinding(
  expression: luaparse.Expression,
  binding: LuaLocalBinding,
): boolean {
  const reads = new Set(binding.reads);
  let found = false;
  walkAST(expression, (node) => {
    if (node.type === "Identifier" && reads.has(node)) found = true;
  });
  return found;
}

function removeStraightLineDeadStores(ast: luaparse.Chunk): boolean {
  const analysis = analyzeLuaLexicalBindings(ast);
  const declarationValues = new Map<luaparse.LocalStatement, luaparse.Expression>();
  const removeAssignments = new Set<luaparse.AssignmentStatement>();

  function collect(body: readonly luaparse.Statement[]): void {
    for (let index = 0; index < body.length; index++) {
      const statement = body[index];
      const current = storeFor(statement, analysis.bindingByIdentifier);
      const next = index + 1 < body.length
        ? storeFor(body[index + 1], analysis.bindingByIdentifier)
        : null;
      if (
        current &&
        next &&
        current.binding === next.binding &&
        !luaExpressionHasSideEffects(current.value) &&
        !luaExpressionHasSideEffects(next.value) &&
        !expressionReadsBinding(next.value, current.binding)
      ) {
        if (current.isDeclaration) {
          // Moving an adjacent overwrite into the declaration retains the
          // binding while eliminating both the dead value and an assignment.
          declarationValues.set(
            current.statement as luaparse.LocalStatement,
            next.value,
          );
          removeAssignments.add(next.statement as luaparse.AssignmentStatement);
        } else {
          removeAssignments.add(current.statement as luaparse.AssignmentStatement);
        }
      }

      switch (statement.type) {
        case "FunctionDeclaration":
        case "WhileStatement":
        case "RepeatStatement":
        case "DoStatement":
        case "ForNumericStatement":
        case "ForGenericStatement":
          collect(statement.body);
          break;
        case "IfStatement":
          statement.clauses.forEach((clause) => collect(clause.body));
          break;
        default:
          break;
      }
    }
  }

  collect(ast.body);
  if (declarationValues.size === 0 && removeAssignments.size === 0) return false;

  return rewriteLuaAst(ast, {
    statement(statement) {
      if (statement.type === "LocalStatement" && declarationValues.has(statement)) {
        statement.init = [declarationValues.get(statement)!];
        return { statements: [statement], changed: true };
      }
      if (statement.type === "AssignmentStatement" && removeAssignments.has(statement)) {
        return { statements: [], changed: true };
      }
      return { statements: [statement], changed: false };
    },
  });
}

export const removeStraightLineDeadStoresRule: LuaOptimizationRule = {
  id: "reduce.remove-straight-line-dead-stores",
  family: "dead-code",
  description: "Remove pure local stores immediately overwritten in the same block",
  defaultEnabled: (options) => options.simplifyExpressions,
  hooks: {
    reduce(context) {
      return { changed: removeStraightLineDeadStores(context.ast) };
    },
  },
};
