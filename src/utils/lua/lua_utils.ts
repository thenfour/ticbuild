import * as luaparse from "luaparse";
import { LUA_RESERVED_WORDS } from "./lua_ast";

// luaparse doesn't actually output value; correct the type.
export type StringLiteralNode = luaparse.StringLiteral & { value?: string | null };
export type LiteralNode = luaparse.NumericLiteral | StringLiteralNode | luaparse.BooleanLiteral | luaparse.NilLiteral;

// https://www.lua.org/manual/5.3/manual.html#6.4
const LUA_SIMPLE_STRING_ESCAPES: Readonly<Record<string, string>> = {
   a: "\x07",
   b: "\b",
   f: "\f",
   n: "\n",
   r: "\r",
   t: "\t",
   v: "\v",
   "\\": "\\",
   "\"": "\"",
   "'": "'",
};


// Short name generator (a, b, c, ..., z, aa, ab, ...), skipping Lua reserved words.
export function generateShortName(index: number): string {
   const alphabet = "abcdefghijklmnopqrstuvwxyz";
   let name = "";
   let n = index;
   do {
      name = alphabet[n % 26] + name;
      n = Math.floor(n / 26) - 1;
   } while (n >= 0);
   return name;
}

export function nextFreeName(counter: { value: number }): string {
   while (true) {
      const name = generateShortName(counter.value++);
      if (!LUA_RESERVED_WORDS.has(name))
         return name;
   }
}

export function isStringLiteral(node: luaparse.Expression | undefined | null): node is luaparse.StringLiteral {
   return !!node && node.type === "StringLiteral";
}

function decodeQuotedString(raw: string): string | null {
   const quote = raw[0];
   if ((quote !== "\"" && quote !== "'") || raw[raw.length - 1] !== quote)
      return null;

   let value = "";
   for (let i = 1; i < raw.length - 1; i++) {
      const ch = raw[i];
      if (ch !== "\\") {
         value += ch;
         continue;
      }

      const escaped = raw[++i];
      if (escaped === undefined)
         return null;

      if (escaped in LUA_SIMPLE_STRING_ESCAPES) {
         value += LUA_SIMPLE_STRING_ESCAPES[escaped];
         continue;
      }

      if (escaped === "\n" || escaped === "\r") {
         if (escaped === "\r" && raw[i + 1] === "\n") i++;
         value += "\n";
         continue;
      }

      if (escaped === "z") {
         while (i + 1 < raw.length - 1 && /[ \f\n\r\t\v]/.test(raw[i + 1])) i++;
         continue;
      }

      if (escaped === "x") {
         const digits = raw.slice(i + 1, i + 3);
         if (!/^[0-9a-fA-F]{2}$/.test(digits)) return null;
         const byte = Number.parseInt(digits, 16);
         // Re-emitting a byte >= 0x80 as a Unicode code point would change its
         // UTF-8 byte sequence, so preserve the original literal in that case.
         if (byte >= 0x80) return null;
         value += String.fromCharCode(byte);
         i += 2;
         continue;
      }

      if (escaped === "u" && raw[i + 1] === "{") {
         const close = raw.indexOf("}", i + 2);
         if (close < 0) return null;
         const digits = raw.slice(i + 2, close);
         if (!/^[0-9a-fA-F]+$/.test(digits)) return null;
         const codePoint = Number.parseInt(digits, 16);
         if (codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) return null;
         value += String.fromCodePoint(codePoint);
         i = close;
         continue;
      }

      if (/^[0-9]$/.test(escaped)) {
         let digits = escaped;
         while (digits.length < 3 && /^[0-9]$/.test(raw[i + 1] ?? "")) digits += raw[++i];
         const byte = Number.parseInt(digits, 10);
         if (byte > 0x7f) return null;
         value += String.fromCharCode(byte);
         continue;
      }

      return null;
   }

   return value;
}

export function decodeRawString(raw: string | undefined): string | null {
   if (!raw || raw.length < 2)
      return null;

   const longBracket = raw.match(/^\[(=*)\[([\s\S]*)\]\1\]$/);
   if (longBracket) {
      let value = longBracket[2];
      if (value.startsWith("\r\n"))
         value = value.slice(2);
      else if (value.startsWith("\n") || value.startsWith("\r"))
         value = value.slice(1);
      return value.replace(/\r\n?|\n/g, "\n");
   }

   return decodeQuotedString(raw);
}

export function stringValue(node: StringLiteralNode): string | null {
   if (typeof node.value === "string")
      return node.value;
   return decodeRawString(node.raw);
}
