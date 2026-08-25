import * as luaparse from "luaparse";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import { luaExpressionHasSideEffects } from "./lua_expression_effects";
import { isLuaScalarLiteral } from "./lua_constant_literals";
import { analyzeLuaLexicalBindings, LuaBindingOccurrence } from "./lua_lexical_bindings";
import type { LuaOptimizationRule } from "./lua_optimizer_types";

type ExpressionCandidate = {
  readonly statement: luaparse.LocalStatement;
  readonly initializer: luaparse.Expression;
  readonly read: luaparse.Identifier;
  readonly readStatement: luaparse.Statement;
};

function isDirectDestination(occurrence: LuaBindingOccurrence): boolean {
  const statement = occurrence.statement;
  if (statement.type === "ReturnStatement") {
    return statement.arguments.length === 1 && statement.arguments[0] === occurrence.identifier;
  }
  return statement.type === "LocalStatement" &&
    statement.variables.length === 1 &&
    statement.init.length === 1 &&
    statement.init[0] === occurrence.identifier;
}

function inlineSingleUseExpressions(ast: luaparse.Chunk): boolean {
  const analysis = analyzeLuaLexicalBindings(ast);
  const candidates: ExpressionCandidate[] = [];

  function collect(body: readonly luaparse.Statement[]): void {
    body.forEach((statement, index) => {
      if (
        statement.type === "LocalStatement" &&
        statement.variables.length === 1 &&
        statement.init.length === 1 &&
        statement.variables[0].name !== "_ENV" &&
        statement.init[0].type !== "Identifier" &&
        !isLuaScalarLiteral(statement.init[0]) &&
        !luaExpressionHasSideEffects(statement.init[0])
      ) {
        const binding = analysis.bindingByIdentifier.get(statement.variables[0]);
        const read = binding?.readOccurrences[0];
        if (
          binding &&
          binding.readOccurrences.length === 1 &&
          binding.writeOccurrences.length === 0 &&
          read?.block === body &&
          body[index + 1] === read.statement &&
          isDirectDestination(read)
        ) {
          candidates.push({
            statement,
            initializer: statement.init[0],
            read: read.identifier,
            readStatement: read.statement,
          });
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
    });
  }

  collect(ast.body);
  const candidateStatements = new Set(candidates.map((candidate) => candidate.statement));
  const selected = candidates.filter((candidate) =>
    // Collapse chains from the final use backward over reduction rounds.
    candidate.readStatement.type !== "LocalStatement" ||
    !candidateStatements.has(candidate.readStatement)
  );
  if (selected.length === 0) return false;

  const replacementByRead = new Map<luaparse.Identifier, luaparse.Expression>();
  const removedStatements = new Set<luaparse.LocalStatement>();
  for (const candidate of selected) {
    replacementByRead.set(candidate.read, candidate.initializer);
    removedStatements.add(candidate.statement);
  }

  return rewriteLuaAst(ast, {
    expression(expression) {
      if (expression.type !== "Identifier") {
        return { expression, changed: false };
      }
      const replacement = replacementByRead.get(expression);
      return replacement
        ? { expression: replacement, changed: true }
        : { expression, changed: false };
    },
    statement(statement) {
      return statement.type === "LocalStatement" && removedStatements.has(statement)
        ? { statements: [], changed: true }
        : { statements: [statement], changed: false };
    },
  });
}

export const inlineSingleUseExpressionsRule: LuaOptimizationRule = {
  id: "reduce.inline-single-use-expressions",
  family: "simplify",
  description: "Inline adjacent single-use expressions without changing evaluation order",
  defaultEnabled: (options) => options.simplifyExpressions,
  hooks: {
    reduce(context) {
      return { changed: inlineSingleUseExpressions(context.ast) };
    },
  },
};
