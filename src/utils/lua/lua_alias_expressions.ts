import * as luaparse from "luaparse";
import {AliasBindingScope, AliasInfo, AliasStrategy, runAliasPass} from "./lua_alias_shared";
import type { LuaOptimizationRule } from "./lua_optimizer_types";
import {StringLiteralNode} from "./lua_utils";

// ============================================================================
// Expression Aliasing - Create local aliases for repeated expressions
// ============================================================================

// Configuration
const EXPR_ALIAS_PREFIX = "_"; // Prefix for generated alias names
const SAFE_GLOBAL_BASES = new Set(["math", "string", "table", "utf8", "bit", "bit32", "coroutine"]);
const SAFE_GLOBAL_FUNCS = new Set([
   // TIC-80 API (pure or stable references)
   "peek", "poke", "peek4", "poke4", "memcpy", "memset", "pmem", "mget",  "mset", "sfx",  "music",
   "map",  "spr",  "circ",  "circb", "rect",   "rectb",  "tri",  "line",  "pix",  "clip", "btn",
   "btnp", "key",  "keyp",  "mouse", "time",   "tstamp", "sync", "trace", "exit",
]);

//type StringLiteralNode = luaparse.StringLiteral&{value?: string | null};

function baseIsSafeGlobal(expr: luaparse.Expression, bindings: AliasBindingScope): boolean {
   return expr.type === "Identifier" && SAFE_GLOBAL_BASES.has(expr.name) && !bindings.isShadowed(expr.name);
}

// Serialize an expression to a string key for comparison
function serializeExpression(node: luaparse.Expression|null|undefined, bindings: AliasBindingScope): string|null {
   if (!node)
      return null;

   switch (node.type) {
      case "Identifier":
         if (!SAFE_GLOBAL_FUNCS.has(node.name) || bindings.isShadowed(node.name))
            return null;
         return `id:${node.name}`;

      case "MemberExpression": {
         if (!baseIsSafeGlobal(node.base, bindings))
            return null;
         const baseName = (node.base as luaparse.Identifier).name;
         const id = node.identifier;
         let identifier: string|null = null;

         if (id) {
            if (id.type === "Identifier")
               identifier = id.name;
            else
               identifier = serializeExpression(id, bindings);
         }

         if (!identifier)
            return null;

         return `member:${baseName}.${identifier}`;
      }

      case "IndexExpression": {
         if (!baseIsSafeGlobal(node.base, bindings))
            return null;
         const base = (node.base as luaparse.Identifier).name;
         const index = serializeExpression(node.index, bindings);
         if (!base || !index)
            return null;
         return `index:${base}[${index}]`;
      }

      case "StringLiteral": {
         const strNode = node as StringLiteralNode;
         const raw = strNode.raw ?? (strNode.value != null ? JSON.stringify(strNode.value) : "\"\"");
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

// Check if an expression is worth aliasing
function isAliasableExpression(node: luaparse.Expression|null|undefined, bindings: AliasBindingScope): boolean {
   if (!node)
      return false;

   switch (node.type) {
      case "Identifier":
         return SAFE_GLOBAL_FUNCS.has(node.name) && !bindings.isShadowed(node.name);

      case "MemberExpression":
         // Only alias safe global library member access (e.g., math.cos)
         return baseIsSafeGlobal(node.base, bindings);

      case "IndexExpression":
         // Only alias safe global library index access (e.g., math["cos"])
         return baseIsSafeGlobal(node.base, bindings);

      // Don't alias literals
      case "StringLiteral":
      case "NumericLiteral":
      case "BooleanLiteral":
      case "NilLiteral":
         return false;

      default:
         return false;
   }
}

function expressionTextLength(node: luaparse.Expression|null|undefined): number {
   if (!node)
      return Number.POSITIVE_INFINITY;

   switch (node.type) {
      case "Identifier":
         return node.name.length;

      case "MemberExpression": {
         const id = node.identifier;
         const idLen = id?.type === "Identifier" ? id.name.length : expressionTextLength(id as any);
         return expressionTextLength(node.base) + 1 + idLen; // base . id
      }

      case "IndexExpression": {
         return expressionTextLength(node.base) + 2 + expressionTextLength(node.index); // base[index]
      }

      case "StringLiteral": {
         const strNode = node as StringLiteralNode;
         if (strNode.raw)
            return strNode.raw.length;
         if (typeof strNode.value === "string")
            return strNode.value.length + 2; // quotes
         return 2;
      }

      case "NumericLiteral":
         return node.raw?.length || String(node.value).length;

      case "BooleanLiteral":
         return node.value ? 4 : 5;

      case "NilLiteral":
         return 3;

      default:
         return Number.POSITIVE_INFINITY;
   }
}

function estimateExpressionSavings(info: AliasInfo, aliasNameLength: number): number {
   const exprCost = expressionTextLength(info.node);
   if (!Number.isFinite(exprCost))
      return Number.NEGATIVE_INFINITY;

   const declarationCost = 6 + aliasNameLength + exprCost;                           // "local " + name + "=" + expr
   const useCost = aliasNameLength;

   const aliasTotal = declarationCost + useCost * info.count;
   const noAliasTotal = exprCost * info.count;

   return noAliasTotal - aliasTotal;
}

export const repeatedExpressionAliasStrategy: AliasStrategy = {
   rule: "aliasRepeatedExpressions",
   prefix: EXPR_ALIAS_PREFIX,
   serialize: (node: luaparse.Expression|null|undefined, bindings: AliasBindingScope) => {
      if (!node)
         return null;
      if (!isAliasableExpression(node, bindings))
         return null;
      return serializeExpression(node, bindings);
   },
   estimateSavings: estimateExpressionSavings,
};

export const aliasRepeatedExpressionsRule: LuaOptimizationRule = {
   id: "introduce.alias-repeated-expressions",
   family: "aliases",
   description: "Introduce locals for profitable repeated expressions",
   enabled: (options) => options.aliasRepeatedExpressions,
   hooks: {
      introduceLocals(context) {
         context.localIntroductions.proposeAlias(repeatedExpressionAliasStrategy);
      },
   },
};

/**
 * Alias repeated expressions in the AST
 * 
 * This optimization finds expressions that are used multiple times (like math.cos, string.sub)
 * and creates local aliases for them to reduce code size. Aliases are declared in the highest
 * scope where they are used.
 * 
 * Example:
 *   local x = math.cos(1) + math.cos(2) + math.cos(3)
 *   local y = math.sin(1) + math.sin(2) + math.sin(3)
 * 
 * Becomes:
 *   local _a = math.cos
 *   local _b = math.sin
 *   local x = _a(1) + _a(2) + _a(3)
 *   local y = _b(1) + _b(2) + _b(3)
 */
export function aliasRepeatedExpressionsInAST(ast: luaparse.Chunk): luaparse.Chunk {
   return runAliasPass(ast, repeatedExpressionAliasStrategy);
}
