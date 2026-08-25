import * as luaparse from "luaparse";
import { inheritLuaNodeOrigin } from "./lua_ast_provenance";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import { isLuaScalarLiteral, isLuaTruthyLiteral } from "./lua_constant_literals";
import type { LuaOptimizationRule } from "./lua_optimizer_types";

function branchNeedsScope(body: readonly luaparse.Statement[]): boolean {
  return body.some((statement) =>
    statement.type === "LocalStatement" ||
    statement.type === "LabelStatement" ||
    (statement.type === "FunctionDeclaration" && statement.isLocal)
  );
}

function selectedBranch(
  body: luaparse.Statement[],
  source: luaparse.IfStatement,
): luaparse.Statement[] {
  if (body.length === 0) return [];
  if (!branchNeedsScope(body)) return body;
  const scoped = inheritLuaNodeOrigin<luaparse.DoStatement>(
    { type: "DoStatement", body },
    source,
  );
  return [scoped];
}

function resolveConstantIf(statement: luaparse.IfStatement): {
  statements: luaparse.Statement[];
  changed: boolean;
} {
  const clauses: Array<luaparse.IfClause | luaparse.ElseifClause | luaparse.ElseClause> = [];
  let changed = false;

  for (const clause of statement.clauses) {
    if (clause.type === "ElseClause") {
      if (clauses.length === 0) return { statements: selectedBranch(clause.body, statement), changed: true };
      clauses.push(clause);
      break;
    }

    if (!isLuaScalarLiteral(clause.condition)) {
      clauses.push(clause);
      continue;
    }

    changed = true;
    if (!isLuaTruthyLiteral(clause.condition)) continue;

    if (clauses.length === 0) {
      return { statements: selectedBranch(clause.body, statement), changed: true };
    }
    clauses.push(inheritLuaNodeOrigin<luaparse.ElseClause>(
      { type: "ElseClause", body: clause.body },
      clause,
    ));
    break;
  }

  if (clauses.length === 0) return { statements: [], changed: true };
  if (clauses[0].type === "ElseClause") {
    return { statements: selectedBranch(clauses[0].body, statement), changed: true };
  }

  if (clauses[0].type === "ElseifClause") {
    const first = clauses[0];
    clauses[0] = inheritLuaNodeOrigin<luaparse.IfClause>({
      type: "IfClause",
      condition: first.condition,
      body: first.body,
    }, first);
    changed = true;
  }

  if (!changed) return { statements: [statement], changed: false };
  statement.clauses = clauses;
  return { statements: [statement], changed: true };
}

export const resolveConstantIfRule: LuaOptimizationRule = {
  id: "control-flow.resolve-constant-if",
  family: "control-flow",
  description: "Remove unreachable constant if branches while preserving block scope",
  defaultEnabled: (options) => options.simplifyControlFlow ?? false,
  hooks: {
    reduce(context) {
      const changed = rewriteLuaAst(context.ast, {
        statement(statement) {
          return statement.type === "IfStatement"
            ? resolveConstantIf(statement)
            : { statements: [statement], changed: false };
        },
      });
      return { changed };
    },
  },
};
