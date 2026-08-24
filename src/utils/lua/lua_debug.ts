export const LUA_LANGUAGE_ID = "lua";
export const LUA_LANGUAGE_DISPLAY_NAME = "Lua";

// documented by Lua 5.3's lua_Debug.what
// Main chunks and native functions need special display labels because neither necessarily
// has a discoverable function name. Tail calls are represented by
// lua_Debug.istailcall (on payload.tailCall).
export const LuaFrameWhat = {
  LuaFunction: "Lua",
  NativeFunction: "C",
  MainChunk: "main",
} as const;

// The remoting payload serializes native frame sources as "[C]". Lua's
// underlying source convention uses "=[C]", where '=' marks a user-defined
// source description rather than a file or literal chunk.
export const LUA_NATIVE_FRAME_SOURCE = "[C]";

// prefixes that Lua reports which can be used for identifying contextual symbol.
// Lua can also report `constant`, but its quoted
// text is a literal value rather than a source identifier, so using it for
// symbol lookup would create false matches.
export const LuaErrorValueOriginKinds = ["global", "local", "upvalue", "field", "method"] as const;
export type LuaErrorValueOriginKind = typeof LuaErrorValueOriginKinds[number];

export interface LuaErrorValueOrigin {
  kind: LuaErrorValueOriginKind;
  symbol: string;
}

const luaErrorValueOriginKindSet = new Set<string>(LuaErrorValueOriginKinds);

// Lua 5.3 appends varinfo() text to several runtime type errors, for example:
//   attempt to call a nil value (global 'missingFunction')
//   attempt to perform arithmetic on a nil value (local 'amount')
//   attempt to index a nil value (upvalue 'state')
// Lua formats this suffix itself as " (%s '%s')" (see varinfo in ldebug.c)
const luaErrorValueOriginSuffix = /\((global|local|upvalue|field|method) '([^'\r\n]+)'\)$/;

export function parseLuaErrorValueOrigin(message: string): LuaErrorValueOrigin | undefined {
  const match = luaErrorValueOriginSuffix.exec(message);
  if (!match || !luaErrorValueOriginKindSet.has(match[1])) {
    return undefined;
  }
  return {
    kind: match[1] as LuaErrorValueOriginKind,
    symbol: match[2],
  };
}
