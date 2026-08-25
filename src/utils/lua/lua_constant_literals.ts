import * as luaparse from "luaparse";
import { inheritLuaNodeOrigin } from "./lua_ast_provenance";
import type { LiteralNode, StringLiteralNode } from "./lua_utils";

export function isLuaScalarLiteral(
  expression: luaparse.Expression | null | undefined,
): expression is LiteralNode {
  return expression?.type === "NumericLiteral" ||
    expression?.type === "StringLiteral" ||
    expression?.type === "BooleanLiteral" ||
    expression?.type === "NilLiteral";
}

export function cloneLuaScalarLiteral(
  literal: LiteralNode,
  source: luaparse.Node = literal,
): LiteralNode {
  let clone: LiteralNode;
  switch (literal.type) {
    case "StringLiteral": {
      const stringLiteral = literal as StringLiteralNode;
      clone = {
        type: "StringLiteral",
        value: stringLiteral.value,
        raw: stringLiteral.raw,
      };
      break;
    }
    default:
      clone = { ...literal };
      break;
  }
  return inheritLuaNodeOrigin(clone, source) as LiteralNode;
}

export function makeLuaNilLiteral(source: luaparse.Node): luaparse.NilLiteral {
  return inheritLuaNodeOrigin(
    { type: "NilLiteral", value: null, raw: "nil" },
    source,
  );
}

export function isLuaTruthyLiteral(literal: LiteralNode): boolean {
  return literal.type !== "NilLiteral" &&
    (literal.type !== "BooleanLiteral" || literal.value);
}
