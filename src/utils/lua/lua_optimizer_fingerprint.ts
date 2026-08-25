// in order to stop a cyclic/endless loop of optimizer passes, if we find the same
// AST fingerprint twice, stop short.

import { createHash } from "crypto";
import type { Hash } from "crypto";
import * as luaparse from "luaparse";

// Source-only metadata must not keep an otherwise stable reduction running.
const ignoredAstKeys = new Set(["comments", "loc", "range"]);

function writeCanonicalValue(hash: Hash, value: unknown): void {
  if (value === null) {
    hash.update("null");
    return;
  }

  switch (typeof value) {
    case "undefined":
      hash.update("undefined");
      return;
    case "boolean":
    case "number":
    case "string":
      hash.update(`${typeof value}:${String(value).length}:${String(value)}`);
      return;
    case "object":
      break;
    default:
      throw new Error(`Cannot fingerprint AST value of type ${typeof value}`);
  }

  if (Array.isArray(value)) {
    hash.update("[");
    value.forEach((item) => writeCanonicalValue(hash, item));
    hash.update("]");
    return;
  }

  hash.update("{");
  const record = value as Record<string, unknown>;
  Object.keys(record)
    .filter((key) => !ignoredAstKeys.has(key) && record[key] !== undefined)
    .sort()
    .forEach((key) => {
      writeCanonicalValue(hash, key);
      writeCanonicalValue(hash, record[key]);
    });
  hash.update("}");
}

export function fingerprintLuaAst(ast: luaparse.Chunk): string {
  const hash = createHash("sha256");
  writeCanonicalValue(hash, ast);
  return hash.digest("hex");
}
