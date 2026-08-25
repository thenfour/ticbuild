import {
  canJoinWithoutChangingLuaTokens,
  collectPrintedLuaLexemes,
} from "./lua_printer_lexemes";
import type { PrintedLuaTokenLexeme } from "./lua_printer_lexemes";

// ===== TIGHT2 MODE: remove only lexically optional whitespace =====

export function printTight2Lua(canonical: string, maxLineLength: number): string {
  if (canonical.length === 0) {
    return "";
  }

  const lexemes = collectPrintedLuaLexemes(canonical);
  const maxLen = maxLineLength || 120;
  const separatorCache = new Map<string, string>();
  const lines: string[] = [];
  let currentLine = "";
  let previousToken: PrintedLuaTokenLexeme | undefined;

  const flushLine = () => {
    if (currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = "";
    }
  };
  const separatorBetween = (
    left: PrintedLuaTokenLexeme,
    right: PrintedLuaTokenLexeme,
  ): string => {
    const cacheKey = left.text.length + right.text.length <= 128
      ? `${left.token.type}:${left.text.length}:${left.text}${right.token.type}:${right.text}`
      : undefined;
    const cached = cacheKey === undefined ? undefined : separatorCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Re-lexing the pair proves that removing whitespace preserves both token boundaries.
    const separator = canJoinWithoutChangingLuaTokens(left, right) ? "" : " ";
    if (cacheKey !== undefined) {
      separatorCache.set(cacheKey, separator);
    }
    return separator;
  };

  for (const lexeme of lexemes) {
    // Comments and multiline literals remain indivisible and cannot affect neighboring code.
    if (lexeme.kind === "comment" || /[\r\n]/.test(lexeme.text)) {
      flushLine();
      lines.push(lexeme.text);
      previousToken = undefined;
      continue;
    }

    if (currentLine.length === 0) {
      currentLine = lexeme.text;
    } else {
      const separator = separatorBetween(previousToken!, lexeme);
      const candidate = currentLine + separator + lexeme.text;
      if (candidate.length <= maxLen) {
        currentLine = candidate;
      } else {
        flushLine();
        currentLine = lexeme.text;
      }
    }
    previousToken = lexeme;
  }

  flushLine();
  return lines.join("\n") + (lines.length > 0 ? "\n" : "");
}
