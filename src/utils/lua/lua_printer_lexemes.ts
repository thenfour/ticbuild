import * as luaparse from "luaparse";

export type PrintedLuaTokenLexeme = {
  kind: "token";
  range: [number, number];
  text: string;
  token: luaparse.Token;
};

export type PrintedLuaCommentLexeme = {
  kind: "comment";
  range: [number, number];
  text: string;
};

export type PrintedLuaLexeme = PrintedLuaTokenLexeme | PrintedLuaCommentLexeme;

// @types/luaparse omits this runtime export.
export const LUA_TOKEN_TYPES = (luaparse as typeof luaparse & {
  tokenTypes: { Identifier: number; StringLiteral: number };
}).tokenTypes;

function lexPrintedLua(
  source: string,
  onComment?: (comment: PrintedLuaCommentLexeme) => void,
): PrintedLuaTokenLexeme[] {
  const lexer = luaparse.parse({
    wait: true,
    luaVersion: "5.3",
    comments: onComment !== undefined,
    locations: false,
    ranges: true,
    onCreateNode: (node) => {
      if (node.type !== "Comment" || !onComment) {
        return;
      }
      const comment = node as luaparse.Comment & { range?: [number, number] };
      if (comment.range && comment.range[1] > comment.range[0]) {
        onComment({
          kind: "comment",
          range: comment.range,
          text: source.slice(comment.range[0], comment.range[1]),
        });
      }
    },
  });
  lexer.write(source);

  const tokens: PrintedLuaTokenLexeme[] = [];
  while (true) {
    const token = lexer.lex();
    if (token.range[0] === token.range[1]) {
      return tokens;
    }
    tokens.push({
      kind: "token",
      range: token.range,
      text: source.slice(token.range[0], token.range[1]),
      token,
    });
  }
}

export function collectPrintedLuaLexemes(source: string): PrintedLuaLexeme[] {
  const comments: PrintedLuaCommentLexeme[] = [];
  const lexemes: PrintedLuaLexeme[] = lexPrintedLua(source, (comment) => comments.push(comment));
  lexemes.push(...comments);

  lexemes.sort((a, b) => a.range[0] - b.range[0] || a.range[1] - b.range[1]);
  return lexemes;
}

export function canJoinWithoutChangingLuaTokens(
  left: PrintedLuaTokenLexeme,
  right: PrintedLuaTokenLexeme,
): boolean {
  const joined = left.text + right.text;
  try {
    let createsComment = false;
    const joinedTokens = lexPrintedLua(joined, () => { createsComment = true; });
    return !createsComment && joinedTokens.length === 2 &&
      joinedTokens[0].range[0] === 0 &&
      joinedTokens[0].range[1] === left.text.length &&
      joinedTokens[1].range[0] === left.text.length &&
      joinedTokens[1].range[1] === joined.length &&
      joinedTokens[0].token.type === left.token.type &&
      joinedTokens[1].token.type === right.token.type;
  } catch {
    return false;
  }
}
