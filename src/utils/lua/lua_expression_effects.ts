import * as luaparse from "luaparse";

// Preserve the established minifier contract: explicit calls are effects;
// errors and metamethods from otherwise ordinary expressions are not modeled.
export function luaExpressionHasSideEffects(expression: luaparse.Expression): boolean {
  switch (expression.type) {
    case "CallExpression":
    case "TableCallExpression":
    case "StringCallExpression":
      return true;
    case "UnaryExpression":
      return luaExpressionHasSideEffects(expression.argument);
    case "BinaryExpression":
    case "LogicalExpression":
      return luaExpressionHasSideEffects(expression.left) ||
        luaExpressionHasSideEffects(expression.right);
    case "MemberExpression":
      return luaExpressionHasSideEffects(expression.base);
    case "IndexExpression":
      return luaExpressionHasSideEffects(expression.base) ||
        luaExpressionHasSideEffects(expression.index);
    case "TableConstructorExpression":
      return expression.fields.some((field) =>
        (field.type === "TableKey" && luaExpressionHasSideEffects(field.key)) ||
        luaExpressionHasSideEffects(field.value)
      );
    case "FunctionDeclaration":
      // Creating a closure does not execute its body.
      return false;
    default:
      return false;
  }
}
