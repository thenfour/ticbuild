/** The line syntax shared by Lua preprocessing and the TypeScript directive bridge. */
type PreprocessorDirective = { name: string; arguments: string };

// `  --# include "import:math"` -> ["include", '"import:math"'].
// Whitespace after # is accepted by the Lua preprocessor.
const luaDirectivePattern = /^\s*--#\s*(\w+)\s*(.*)$/;

// `  //--#include "import:math"` -> ["  ", "include", ' "import:math"'].
// TypeScript directives require //--# with no intervening whitespace. Keep the
// argument spacing intact because marker restoration reproduces the authored line.
const typeScriptDirectivePattern = /^([ \t]*)\/\/--#(\w+)\b(.*)$/;
const supportedDirectives = new Set([
  "pragma", "define", "undef", "include", "if", "ifdef", "ifndef", "else", "endif",
  "warning", "error", "macro", "endmacro", "minify",
]);

const directiveMarker = "__TICBUILD_PREPROCESSOR_DIRECTIVE__";
// TSTL emits a standalone call with a double-quoted base64 payload and no semicolon.
// Capture indentation and payload; ordinary Lua calls must pass through untouched.
const emittedDirectiveMarkerPattern = new RegExp(
  `^([ \\t]*)${directiveMarker}\\("([A-Za-z0-9+/=]+)"\\)[ \\t]*$`,
);

export function parseLuaPreprocessorDirective(line: string): PreprocessorDirective | undefined {
  const match = luaDirectivePattern.exec(line);
  return match ? { name: match[1], arguments: match[2] } : undefined;
}

/**
 * Preserve directives through TypeScript compilation, which discards comments.
 * For example, //--#define DEBUG becomes a call carrying base64("#define DEBUG").
 * restoreTypeScriptPreprocessorDirective later reconstructs --#define DEBUG.
 */
export function preserveTypeScriptPreprocessorDirectives(source: string): string {
  return source.split(/\r?\n/).map(line => {
    const match = typeScriptDirectivePattern.exec(line);
    if (!match) return line;
    const [, indent, name, argumentsText] = match;
    if (!supportedDirectives.has(name)) return line;
    const payload = Buffer.from(`#${name}${argumentsText}`, "utf8").toString("base64");
    return `${indent}${directiveMarker}("${payload}");`;
  }).join("\n");
}

/** Decode one emitted marker call to its Lua directive, preserving indentation. */
export function restoreTypeScriptPreprocessorDirective(line: string): string | undefined {
  const match = emittedDirectiveMarkerPattern.exec(line);
  if (!match) return undefined;
  const [, indent, payload] = match;
  return `${indent}--${Buffer.from(payload, "base64").toString("utf8")}`;
}

export function hasUnrestoredPreprocessorDirectives(source: string): boolean {
  return source.includes(`${directiveMarker}(`);
}

/**
 * Keep the directives needed to discover active includes before Lua emission.
 * A TypeScript statement becomes a blank line; //--#include "x.lua" becomes
 * --#include "x.lua" at the same line number. Conditionals/defines remain active.
 * Minifier annotations require emitted Lua targets, and warnings belong to the
 * actual build, so both are omitted from this discovery pass.
 */
export function extractTypeScriptDeclarationDirectives(source: string): string {
  return source.split(/\r?\n/).map(line => {
    const directiveLine = line.trimStart();
    if (!directiveLine.startsWith("//--#")) return "";
    const luaLine = directiveLine.slice(2);
    const directiveName = typeScriptDirectivePattern.exec(line)?.[2];
    if (directiveName === "minify" || directiveName === "warning") return "";
    return luaLine;
  }).join("\n");
}
