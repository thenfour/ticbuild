import * as luaparse from "luaparse";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import { analyzeLuaLexicalBindings, LuaLocalBinding } from "./lua_lexical_bindings";
import type { LuaOptimizationRule } from "./lua_optimizer_types";

function expressionUsesVararg(expression: luaparse.Expression): boolean {
  switch (expression.type) {
    case "VarargLiteral":
      return true;
    case "FunctionDeclaration":
      // A nested function has its own vararg declaration and scope.
      return false;
    case "TableConstructorExpression":
      return expression.fields.some((field) =>
        (field.type === "TableKey" && expressionUsesVararg(field.key)) ||
        expressionUsesVararg(field.value)
      );
    case "UnaryExpression":
      return expressionUsesVararg(expression.argument);
    case "BinaryExpression":
    case "LogicalExpression":
      return expressionUsesVararg(expression.left) || expressionUsesVararg(expression.right);
    case "MemberExpression":
      return expressionUsesVararg(expression.base);
    case "IndexExpression":
      return expressionUsesVararg(expression.base) || expressionUsesVararg(expression.index);
    case "CallExpression":
      return expressionUsesVararg(expression.base) ||
        expression.arguments.some(expressionUsesVararg);
    case "TableCallExpression":
      return expressionUsesVararg(expression.base) || expressionUsesVararg(expression.arguments);
    case "StringCallExpression":
      return expressionUsesVararg(expression.base) || expressionUsesVararg(expression.argument);
    default:
      return false;
  }
}

function statementUsesVararg(statement: luaparse.Statement): boolean {
  switch (statement.type) {
    case "LocalStatement":
      return statement.init.some(expressionUsesVararg);
    case "AssignmentStatement":
      return statement.variables.some(expressionUsesVararg) ||
        statement.init.some(expressionUsesVararg);
    case "CallStatement":
      return expressionUsesVararg(statement.expression);
    case "ReturnStatement":
      return statement.arguments.some(expressionUsesVararg);
    case "IfStatement":
      return statement.clauses.some((clause) =>
        (clause.type !== "ElseClause" && expressionUsesVararg(clause.condition)) ||
        clause.body.some(statementUsesVararg)
      );
    case "WhileStatement":
    case "RepeatStatement":
      return expressionUsesVararg(statement.condition) || statement.body.some(statementUsesVararg);
    case "DoStatement":
      return statement.body.some(statementUsesVararg);
    case "ForNumericStatement":
      return expressionUsesVararg(statement.start) || expressionUsesVararg(statement.end) ||
        (statement.step !== null && expressionUsesVararg(statement.step)) ||
        statement.body.some(statementUsesVararg);
    case "ForGenericStatement":
      return statement.iterators.some(expressionUsesVararg) ||
        statement.body.some(statementUsesVararg);
    case "FunctionDeclaration":
      return false;
    default:
      return false;
  }
}

function isUnused(binding: LuaLocalBinding | undefined): boolean {
  return binding !== undefined && binding.reads.length === 0 && binding.writes.length === 0;
}

function removeUnusedParameterSuffix(
  fn: luaparse.FunctionDeclaration,
  bindingByIdentifier: ReadonlyMap<luaparse.Identifier, LuaLocalBinding>,
): boolean {
  const varargIndex = fn.parameters.findIndex((parameter) => parameter.type === "VarargLiteral");
  if (varargIndex >= 0 && fn.body.some(statementUsesVararg)) return false;

  const namedParameterCount = varargIndex >= 0 ? varargIndex : fn.parameters.length;
  let keepCount = namedParameterCount;
  while (keepCount > 0) {
    const parameter = fn.parameters[keepCount - 1];
    if (parameter.type !== "Identifier" || !isUnused(bindingByIdentifier.get(parameter))) break;
    keepCount--;
  }
  if (keepCount === namedParameterCount) return false;

  const suffix = varargIndex >= 0 ? fn.parameters.slice(varargIndex) : [];
  fn.parameters = [...fn.parameters.slice(0, keepCount), ...suffix];
  return true;
}

function removeUnusedParameters(ast: luaparse.Chunk): boolean {
  const analysis = analyzeLuaLexicalBindings(ast);
  const rewritten = new Set<luaparse.FunctionDeclaration>();

  function rewriteFunction(fn: luaparse.FunctionDeclaration): boolean {
    if (rewritten.has(fn)) return false;
    rewritten.add(fn);
    return removeUnusedParameterSuffix(fn, analysis.bindingByIdentifier);
  }

  return rewriteLuaAst(ast, {
    expression(expression) {
      return {
        expression,
        changed: expression.type === "FunctionDeclaration" && rewriteFunction(expression),
      };
    },
    statement(statement) {
      return {
        statements: [statement],
        changed: statement.type === "FunctionDeclaration" && rewriteFunction(statement),
      };
    },
  });
}

export const removeUnusedParametersRule: LuaOptimizationRule = {
  id: "reduce.remove-unused-parameters",
  family: "dead-code",
  description: "Remove trailing unused function parameters",
  defaultEnabled: (options) => options.removeUnusedLocals,
  hooks: {
    reduce(context) {
      return { changed: removeUnusedParameters(context.ast) };
    },
  },
};
