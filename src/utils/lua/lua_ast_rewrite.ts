import * as luaparse from "luaparse";

export type LuaExpressionRewriteResult = {
  expression: luaparse.Expression;
  changed: boolean;
};

export type LuaStatementRewriteResult = {
  statements: luaparse.Statement[];
  changed: boolean;
};

export type LuaStatementRewriteContext = {
  readonly parent: luaparse.Node;
  readonly body: readonly luaparse.Statement[];
  readonly index: number;
};

export type LuaAstRewriteVisitor = {
  expression?: (expression: luaparse.Expression) => LuaExpressionRewriteResult;
  statement?: (
    statement: luaparse.Statement,
    context: LuaStatementRewriteContext,
  ) => LuaStatementRewriteResult;
};

type BlockRewriteResult = {
  body: luaparse.Statement[];
  changed: boolean;
};

function rewriteExpressionList(
  expressions: luaparse.Expression[],
  visitor: LuaAstRewriteVisitor,
): boolean {
  let changed = false;
  for (let index = 0; index < expressions.length; index++) {
    const result = rewriteExpression(expressions[index], visitor);
    expressions[index] = result.expression;
    changed ||= result.changed;
  }
  return changed;
}

function rewriteExpression(
  expression: luaparse.Expression,
  visitor: LuaAstRewriteVisitor,
): LuaExpressionRewriteResult {
  let changed = false;

  switch (expression.type) {
    case "FunctionDeclaration": {
      const body = rewriteBlock(expression.body, expression, visitor);
      expression.body = body.body;
      changed ||= body.changed;
      break;
    }
    case "TableConstructorExpression":
      for (const field of expression.fields) {
        if (field.type === "TableKey") {
          const key = rewriteExpression(field.key, visitor);
          field.key = key.expression;
          changed ||= key.changed;
        }
        // TableKeyString.key is syntax, not an evaluated expression.
        const value = rewriteExpression(field.value, visitor);
        field.value = value.expression;
        changed ||= value.changed;
      }
      break;
    case "UnaryExpression": {
      const argument = rewriteExpression(expression.argument, visitor);
      expression.argument = argument.expression;
      changed ||= argument.changed;
      break;
    }
    case "BinaryExpression":
    case "LogicalExpression": {
      const left = rewriteExpression(expression.left, visitor);
      const right = rewriteExpression(expression.right, visitor);
      expression.left = left.expression;
      expression.right = right.expression;
      changed ||= left.changed || right.changed;
      break;
    }
    case "MemberExpression": {
      const base = rewriteExpression(expression.base, visitor);
      expression.base = base.expression;
      changed ||= base.changed;
      break;
    }
    case "IndexExpression": {
      const base = rewriteExpression(expression.base, visitor);
      const index = rewriteExpression(expression.index, visitor);
      expression.base = base.expression;
      expression.index = index.expression;
      changed ||= base.changed || index.changed;
      break;
    }
    case "CallExpression": {
      const base = rewriteExpression(expression.base, visitor);
      expression.base = base.expression;
      const argumentsChanged = rewriteExpressionList(expression.arguments, visitor);
      changed ||= base.changed || argumentsChanged;
      break;
    }
    case "TableCallExpression": {
      const base = rewriteExpression(expression.base, visitor);
      const argument = rewriteExpression(expression.arguments, visitor);
      expression.base = base.expression;
      expression.arguments = argument.expression;
      changed ||= base.changed || argument.changed;
      break;
    }
    case "StringCallExpression": {
      const base = rewriteExpression(expression.base, visitor);
      const argument = rewriteExpression(expression.argument, visitor);
      expression.base = base.expression;
      expression.argument = argument.expression;
      changed ||= base.changed || argument.changed;
      break;
    }
    default:
      break;
  }

  const result = visitor.expression?.(expression);
  return result
    ? { expression: result.expression, changed: changed || result.changed }
    : { expression, changed };
}

function rewriteBlock(
  body: luaparse.Statement[],
  parent: luaparse.Node,
  visitor: LuaAstRewriteVisitor,
): BlockRewriteResult {
  const rewritten: luaparse.Statement[] = [];
  let changed = false;
  for (let index = 0; index < body.length; index++) {
    const result = rewriteStatement(body[index], { parent, body, index }, visitor);
    rewritten.push(...result.statements);
    changed ||= result.changed;
  }
  return { body: rewritten, changed };
}

function rewriteStatement(
  statement: luaparse.Statement,
  context: LuaStatementRewriteContext,
  visitor: LuaAstRewriteVisitor,
): LuaStatementRewriteResult {
  let changed = false;

  switch (statement.type) {
    case "ReturnStatement":
      changed = rewriteExpressionList(statement.arguments, visitor) || changed;
      break;
    case "IfStatement":
      for (const clause of statement.clauses) {
        if (clause.type !== "ElseClause") {
          const condition = rewriteExpression(clause.condition, visitor);
          clause.condition = condition.expression;
          changed ||= condition.changed;
        }
        const body = rewriteBlock(clause.body, clause, visitor);
        clause.body = body.body;
        changed ||= body.changed;
      }
      break;
    case "WhileStatement":
    case "RepeatStatement": {
      const condition = rewriteExpression(statement.condition, visitor);
      const body = rewriteBlock(statement.body, statement, visitor);
      statement.condition = condition.expression;
      statement.body = body.body;
      changed ||= condition.changed || body.changed;
      break;
    }
    case "DoStatement": {
      const body = rewriteBlock(statement.body, statement, visitor);
      statement.body = body.body;
      changed ||= body.changed;
      break;
    }
    case "LocalStatement":
      changed = rewriteExpressionList(statement.init, visitor) || changed;
      break;
    case "AssignmentStatement": {
      for (let index = 0; index < statement.variables.length; index++) {
        const result = rewriteExpression(statement.variables[index], visitor);
        statement.variables[index] = result.expression as typeof statement.variables[number];
        changed ||= result.changed;
      }
      changed = rewriteExpressionList(statement.init, visitor) || changed;
      break;
    }
    case "CallStatement": {
      const result = rewriteExpression(statement.expression, visitor);
      statement.expression = result.expression as typeof statement.expression;
      changed ||= result.changed;
      break;
    }
    case "FunctionDeclaration": {
      const body = rewriteBlock(statement.body, statement, visitor);
      statement.body = body.body;
      changed ||= body.changed;
      break;
    }
    case "ForNumericStatement": {
      const start = rewriteExpression(statement.start, visitor);
      const end = rewriteExpression(statement.end, visitor);
      statement.start = start.expression;
      statement.end = end.expression;
      changed ||= start.changed || end.changed;
      if (statement.step) {
        const step = rewriteExpression(statement.step, visitor);
        statement.step = step.expression;
        changed ||= step.changed;
      }
      const body = rewriteBlock(statement.body, statement, visitor);
      statement.body = body.body;
      changed ||= body.changed;
      break;
    }
    case "ForGenericStatement": {
      changed = rewriteExpressionList(statement.iterators, visitor) || changed;
      const body = rewriteBlock(statement.body, statement, visitor);
      statement.body = body.body;
      changed ||= body.changed;
      break;
    }
    default:
      break;
  }

  const result = visitor.statement?.(statement, context);
  return result
    ? { statements: result.statements, changed: changed || result.changed }
    : { statements: [statement], changed };
}

export function rewriteLuaAst(ast: luaparse.Chunk, visitor: LuaAstRewriteVisitor): boolean {
  const result = rewriteBlock(ast.body, ast, visitor);
  ast.body = result.body;
  return result.changed;
}
