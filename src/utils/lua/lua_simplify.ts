import * as luaparse from "luaparse";
import { inheritLuaNodeOrigin } from "./lua_ast_provenance";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import {
  cloneLuaScalarLiteral,
  isLuaScalarLiteral,
  isLuaTruthyLiteral,
} from "./lua_constant_literals";
import type { LuaOptimizationRule } from "./lua_optimizer_types";
import { unparseLua } from "./lua_printer";
import type { LiteralNode, StringLiteralNode } from "./lua_utils";
import { stringValue } from "./lua_utils";

function makeNumericLiteral(value: number, source: luaparse.Node): luaparse.NumericLiteral | null {
  if (!Number.isFinite(value) || Object.is(value, -0)) return null;
  return inheritLuaNodeOrigin({ type: "NumericLiteral", value, raw: String(value) }, source);
}

function makeBooleanLiteral(value: boolean, source: luaparse.Node): luaparse.BooleanLiteral {
  return inheritLuaNodeOrigin({
    type: "BooleanLiteral",
    value,
    raw: value ? "true" : "false",
  }, source);
}

function makeStringLiteral(value: string, source: luaparse.Node): StringLiteralNode {
  return inheritLuaNodeOrigin({
    type: "StringLiteral",
    value,
    raw: JSON.stringify(value),
  }, source) as StringLiteralNode;
}

function numericValue(literal: LiteralNode): number | null {
  return literal.type === "NumericLiteral" && Number.isFinite(literal.value)
    ? literal.value
    : null;
}

function stringLiteral(literal: LiteralNode): StringLiteralNode | null {
  return literal.type === "StringLiteral" ? literal as StringLiteralNode : null;
}

function numericPairIsExact(left: number, right: number): boolean {
  return (!Number.isInteger(left) || Number.isSafeInteger(left)) &&
    (!Number.isInteger(right) || Number.isSafeInteger(right));
}

function tightExpressionLength(expression: luaparse.Expression): number {
  const statement: luaparse.ReturnStatement = {
    type: "ReturnStatement",
    arguments: [expression],
  };
  const chunk: luaparse.Chunk = { type: "Chunk", body: [statement] };
  return unparseLua(chunk, {
    maxIndentLevel: 0,
    lineBehavior: "tight2",
    maxLineLength: Number.MAX_SAFE_INTEGER,
  }).trim().slice("return ".length).length;
}

function literalsEqual(left: LiteralNode, right: LiteralNode): boolean | null {
  if (left.type === "NilLiteral") return right.type === "NilLiteral";
  if (left.type === "BooleanLiteral" && right.type === "BooleanLiteral") {
    return left.value === right.value;
  }
  if (left.type === "NumericLiteral" && right.type === "NumericLiteral") {
    return numericPairIsExact(left.value, right.value) ? left.value === right.value : null;
  }
  if (left.type === "StringLiteral" && right.type === "StringLiteral") {
    const leftValue = stringValue(left as StringLiteralNode);
    const rightValue = stringValue(right as StringLiteralNode);
    return leftValue === null || rightValue === null ? null : leftValue === rightValue;
  }
  return false;
}

function foldNumericBinary(
  operator: string,
  left: LiteralNode,
  right: LiteralNode,
  source: luaparse.Node,
): luaparse.NumericLiteral | null {
  const a = numericValue(left);
  const b = numericValue(right);
  if (a === null || b === null) return null;
  if (!numericPairIsExact(a, b)) return null;

  let result: number;
  switch (operator) {
    case "+":
      result = a + b;
      break;
    case "-":
      result = a - b;
      break;
    case "*":
      result = a * b;
      break;
    case "/":
      if (b === 0) return null;
      result = a / b;
      break;
    case "//":
      if (b === 0) return null;
      result = Math.floor(a / b);
      break;
    case "%":
      if (b === 0) return null;
      result = a - Math.floor(a / b) * b;
      break;
    case "^":
      result = Math.pow(a, b);
      break;
    default:
      return null;
  }
  if (Number.isInteger(a) && Number.isInteger(b) &&
      operator !== "/" && operator !== "^" && !Number.isSafeInteger(result)) {
    return null;
  }
  return makeNumericLiteral(result, source);
}

function foldBinary(expression: luaparse.BinaryExpression): LiteralNode | null {
  const { left, right, operator } = expression;
  if (!isLuaScalarLiteral(left) || !isLuaScalarLiteral(right)) return null;

  const numeric = foldNumericBinary(operator, left, right, expression);
  if (numeric) return numeric;

  if (operator === "..") {
    const leftString = stringLiteral(left);
    const rightString = stringLiteral(right);
    if (!leftString || !rightString) return null;
    const leftValue = stringValue(leftString);
    const rightValue = stringValue(rightString);
    return leftValue === null || rightValue === null
      ? null
      : makeStringLiteral(leftValue + rightValue, expression);
  }

  if (operator === "==" || operator === "~=") {
    const equal = literalsEqual(left, right);
    if (equal === null) return null;
    return makeBooleanLiteral(operator === "==" ? equal : !equal, expression);
  }

  const a = numericValue(left);
  const b = numericValue(right);
  if (a === null || b === null || !numericPairIsExact(a, b)) return null;
  switch (operator) {
    case "<":
      return makeBooleanLiteral(a < b, expression);
    case "<=":
      return makeBooleanLiteral(a <= b, expression);
    case ">":
      return makeBooleanLiteral(a > b, expression);
    case ">=":
      return makeBooleanLiteral(a >= b, expression);
    default:
      return null;
  }
}

function foldExpression(expression: luaparse.Expression): luaparse.Expression {
  if (expression.type === "UnaryExpression" && isLuaScalarLiteral(expression.argument)) {
    if (expression.operator === "not") {
      return makeBooleanLiteral(!isLuaTruthyLiteral(expression.argument), expression);
    }
    if (expression.operator === "-") {
      const value = numericValue(expression.argument);
      if (value !== null && (!Number.isInteger(value) || Number.isSafeInteger(value))) {
        return makeNumericLiteral(-value, expression) ?? expression;
      }
    }
  }

  if (expression.type === "BinaryExpression") {
    const folded = foldBinary(expression);
    if (!folded) return expression;
    if ((folded.type === "NumericLiteral" || folded.type === "StringLiteral") &&
        tightExpressionLength(folded) > tightExpressionLength(expression)) {
      return expression;
    }
    return folded;
  }

  if (expression.type === "LogicalExpression" && isLuaScalarLiteral(expression.left)) {
    const leftIsTruthy = isLuaTruthyLiteral(expression.left);
    if (expression.operator === "and") {
      return leftIsTruthy
        ? expression.right
        : cloneLuaScalarLiteral(expression.left, expression);
    }
    return leftIsTruthy
      ? cloneLuaScalarLiteral(expression.left, expression)
      : expression.right;
  }

  return expression;
}

function simplifyExpressions(ast: luaparse.Chunk): boolean {
  return rewriteLuaAst(ast, {
    expression(expression) {
      const folded = foldExpression(expression);
      return { expression: folded, changed: folded !== expression };
    },
  });
}

export function simplifyExpressionsInAST(ast: luaparse.Chunk): luaparse.Chunk {
  simplifyExpressions(ast);
  return ast;
}

export const simplifyExpressionsRule: LuaOptimizationRule = {
  id: "reduce.simplify-expressions",
  family: "simplify",
  description: "Fold constant scalar expressions",
  defaultEnabled: (options) => options.simplifyExpressions,
  hooks: {
    reduce(context) {
      return { changed: simplifyExpressions(context.ast) };
    },
  },
};
