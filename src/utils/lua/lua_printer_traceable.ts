import {
  collectPrintedLuaLexemes,
  LUA_TOKEN_TYPES,
} from "./lua_printer_lexemes";
import type { PrintedLuaLexeme, PrintedLuaTokenLexeme } from "./lua_printer_lexemes";

// ===== TRACEABLE MODE: one diagnostic anchor per generated line =====
//
// Lua 5.3 records binary/unary bytecode against the operator token's line and
// ordinary function calls against the start of the suffixed expression. Keep
// those anchors distinct while grouping structural punctuation that cannot
// introduce another useful source-map choice on the same line.
//
// Generate canonical pretty output first instead of maintaining a second AST
// serializer. Re-lexing that valid output preserves literal spellings and
// comments while replacing only insignificant whitespace. maxLineLength and
// maxIndentLevel intentionally do not apply in this diagnostic mode.
export function printTraceableLua(canonical: string): string {
  if (canonical.length === 0) {
    return "";
  }

  type ParenthesisKind = "call" | "function-parameters" | "group";
  const lexemes = collectPrintedLuaLexemes(canonical);
  // Includes chained calls such as f()(), f"x"(), and f{}().
  const canEndSuffixedExpression = (lexeme: PrintedLuaTokenLexeme | undefined): boolean => {
    if (!lexeme) {
      return false;
    }
    return lexeme.token.type === LUA_TOKEN_TYPES.Identifier ||
      lexeme.token.type === LUA_TOKEN_TYPES.StringLiteral ||
      lexeme.text === ")" || lexeme.text === "]" || lexeme.text === "}";
  };
  // Reuse canonical whitespace when grouping so the token stream cannot change.
  const canonicalInlineSeparator = (left: PrintedLuaLexeme, right: PrintedLuaLexeme): string =>
    /\s/.test(canonical.slice(left.range[1], right.range[0])) ? " " : "";

  const lines: string[] = [];
  const parenthesisStack: ParenthesisKind[] = [];
  let previousToken: PrintedLuaTokenLexeme | undefined;
  let localPrefixAwaitingName = false;
  let insideFunctionHeader = false;
  let functionNameAwaitingFirstIdentifier = false;

  for (const lexeme of lexemes) {
    if (lexeme.kind === "comment") {
      lines.push(lexeme.text);
      previousToken = undefined;
      continue;
    }

    const token = lexeme.token;
    const text = lexeme.text;
    const isIdentifier = token.type === LUA_TOKEN_TYPES.Identifier;
    const joinsLocalPrefix = localPrefixAwaitingName && (text === "function" || isIdentifier);
    const joinsFunctionName = functionNameAwaitingFirstIdentifier && isIdentifier;
    // Call/signature parens are scaffolding; grouping parens retain their own lines.
    const openingParenthesisKind: ParenthesisKind | undefined = text === "("
      ? insideFunctionHeader
        ? "function-parameters"
        : canEndSuffixedExpression(previousToken)
          ? "call"
          : "group"
      : undefined;
    const closingParenthesisKind = text === ")"
      ? parenthesisStack[parenthesisStack.length - 1]
      : undefined;
    const followsMemberPrefix = previousToken?.text === "." || previousToken?.text === ":";
    const isTrailingScaffolding = text === "," || text === ";" || text === "=";
    // "[" can share its base; "]" stays separate because Lua may report its line.
    const isIndexOpener = text === "[" && canEndSuffixedExpression(previousToken);
    const isGroupedCallOrParameterParen = openingParenthesisKind === "call" ||
      openingParenthesisKind === "function-parameters" ||
      closingParenthesisKind === "call" ||
      closingParenthesisKind === "function-parameters";
    const appendToPreviousLine = !!previousToken && (
      joinsLocalPrefix ||
      joinsFunctionName ||
      followsMemberPrefix ||
      isTrailingScaffolding ||
      isIndexOpener ||
      isGroupedCallOrParameterParen
    );

    if (appendToPreviousLine) {
      lines[lines.length - 1] += canonicalInlineSeparator(previousToken!, lexeme) + text;
    } else {
      lines.push(text);
    }

    if (text === ")") {
      parenthesisStack.pop();
    }
    if (openingParenthesisKind) {
      parenthesisStack.push(openingParenthesisKind);
      if (openingParenthesisKind === "function-parameters") {
        insideFunctionHeader = false;
        functionNameAwaitingFirstIdentifier = false;
      }
    }
    if (joinsLocalPrefix) {
      localPrefixAwaitingName = false;
    }
    if (joinsFunctionName) {
      functionNameAwaitingFirstIdentifier = false;
    }
    if (text === "local") {
      localPrefixAwaitingName = true;
    }
    if (text === "function") {
      insideFunctionHeader = true;
      functionNameAwaitingFirstIdentifier = true;
    }
    previousToken = lexeme;
  }

  return lines.join("\n") + "\n";
}
