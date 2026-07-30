import * as luaparse from "luaparse";
import { AliasInfo, AliasStrategy, runAliasPass } from "./lua_alias_shared";
import { StringLiteralNode } from "./lua_utils";

// ============================================================================
// Literal Aliasing - Create local aliases for repeated literal values
// ============================================================================

// Configuration
const LITERAL_ALIAS_PREFIX = "L";

//type StringLiteralNode = luaparse.StringLiteral&{value?: string | null};
//type LiteralNode = StringLiteralNode|luaparse.NumericLiteral|luaparse.BooleanLiteral|luaparse.NilLiteral;

// Serialize a literal to a string key for comparison
function serializeLiteral(node: luaparse.Expression): string | null {
  if (!node) return null;

  switch (node.type) {
    case "StringLiteral": {
      const strNode = node as StringLiteralNode;
      const raw = strNode.raw ?? (strNode.value != null ? JSON.stringify(strNode.value) : '""');
      return `str:${raw}`;
    }

    case "NumericLiteral":
      return `num:${node.value}`;

    case "BooleanLiteral":
      return `bool:${node.value}`;

    case "NilLiteral":
      return "nil";

    default:
      return null;
  }
}

// Estimate the source bytes saved by aliasing this literal.
function estimateLiteralSavings(info: AliasInfo, aliasNameLength: number): number {
  const node = info.node;

  // Calculate the cost of the literal per use
  let literalCost = 0;
  switch (node.type) {
    case "StringLiteral": {
      const strNode = node as StringLiteralNode;
      // String literals: quotes + escaped content; value may be undefined
      const valueLength = strNode.value ? strNode.value.length + 2 : 0;
      literalCost = strNode.raw?.length || valueLength;
      break;
    }

    case "NumericLiteral":
      // Numeric literals: digit count
      literalCost = node.raw?.length || String(node.value).length;
      break;

    case "BooleanLiteral":
      // true = 4 chars, false = 5 chars
      literalCost = node.value ? 4 : 5;
      break;

    case "NilLiteral":
      // nil = 3 chars
      literalCost = 3;
      break;

    default:
      return Number.NEGATIVE_INFINITY;
  }

  // Calculate the cost of creating an alias
  // Format: "local La=<literal>" (minimum)
  const declarationCost = 6 + aliasNameLength + literalCost; // "local " + name + "=" + literal

  // Calculate the cost of using the alias (just the identifier length)
  const useCost = aliasNameLength;

  // Total cost with alias: declaration + (useCost * count)
  const aliasTotalCost = declarationCost + useCost * info.count;

  // Total cost without alias: literalCost * count
  const noAliasTotalCost = literalCost * info.count;

  return noAliasTotalCost - aliasTotalCost;
}

export const literalAliasStrategy: AliasStrategy = {
  rule: "aliasLiterals",
  prefix: LITERAL_ALIAS_PREFIX,
  serialize: serializeLiteral,
  estimateSavings: estimateLiteralSavings,
};

/**
 * Alias repeated literal values in the AST
 *
 * This optimization finds literal values (strings, numbers) that are used multiple times
 * and creates local aliases for them to reduce code size.
 *
 * Example:
 *   local x = "hello" .. "world"
 *   local y = "hello" .. "test"
 *   local z = "hello" .. "demo"
 *
 * Becomes:
 *   local La = "hello"
 *   local x = La .. "world"
 *   local y = La .. "test"
 *   local z = La .. "demo"
 */
export function aliasLiteralsInAST(ast: luaparse.Chunk): luaparse.Chunk {
  return runAliasPass(ast, literalAliasStrategy);
}
