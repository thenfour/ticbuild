import * as luaparse from "luaparse";
import { createEmptyAliasPassReport } from "./lua_alias_shared";
import type { AliasPassReport } from "./lua_alias_shared";
import { extractLuaBlocks } from "./lua_fundamentals";
import { annotateLuaAstOrigins } from "./lua_ast_provenance";
import { optimizeLuaAst } from "./lua_optimizer";
import type { OptimizationRuleOptions } from "./lua_optimizer_types";
import { createLuaPrintTransformMap } from "./lua_print_trace";
import { unparseLua } from "./lua_printer";
import type { LuaLineBehavior } from "./lua_printer";
import {
  LuaTransformMap,
  LuaTransformMapBuilder,
} from "./lua_transform_map";

export { LuaPrinter } from "./lua_printer";
export { unparseLua };
export type { LuaLineBehavior, OptimizationRuleOptions };

function parseLuaOrThrow(code: string): luaparse.Chunk {
  return luaparse.parse(code, {
    luaVersion: "5.3", // TIC-80 is 5.3-ish
    comments: true,
    locations: true,
    ranges: true,
  });
}

export function parseLuaQuiet(code: string): luaparse.Chunk | null {
  try {
    return parseLuaOrThrow(code);
  } catch {
    return null;
  }
}

export function parseLua(code: string): luaparse.Chunk | null {
  //console.log(code);
  try {
    return parseLuaOrThrow(code);
  } catch (error) {
    console.error("Error parsing Lua code:", error);
    console.log("Lua code:\n", code);
  }

  return null;
}

export type LuaProcessResult = {
  code: string;
  report: AliasPassReport;
  transformMap: LuaTransformMap;
};

export type LuaProcessOptions = {
  parseFailure?: "return-original" | "throw";
};

export function processLuaWithReport(
  code: string,
  ruleOptions: OptimizationRuleOptions,
  processOptions: LuaProcessOptions = {},
): LuaProcessResult {
  let processedCode = code;
  const preparationMap = LuaTransformMapBuilder.identity(code.length);
  processedCode = disambiguateNumericConcat(processedCode, preparationMap);

  // Hide verbatim regions because every AST printer is allowed to reformat them.
  const disableMinify = extractLuaBlocks(
    processedCode,
    "-- MINIFICATION OFF",
    "-- MINIFICATION ON",
    (i) => `__SOMATIC_DISABLED_MINIFICATION_BLOCK_${i}__()`,
    { strict: false },
  );
  const disabledBlockOrigins = new Map(disableMinify.blocks.map((block) => [
    block.placeholder,
    preparationMap.mapOffset(block.sourceContentBegin, "right")?.offset ?? 0,
  ]));
  for (const block of [...disableMinify.blocks].sort((a, b) => b.sourceBegin - a.sourceBegin)) {
    const origin = preparationMap.mapOffset(block.sourceBegin, "right");
    preparationMap.spliceRange(
      block.sourceBegin,
      block.sourceEnd,
      block.replacementLength,
      origin,
      "anchor",
    );
  }
  processedCode = disableMinify.code;

  let ast: luaparse.Chunk | null;
  if (processOptions.parseFailure === "throw") {
    ast = parseLuaOrThrow(processedCode);
  } else {
    ast = parseLua(processedCode);
  }
  if (!ast) {
    console.error("Failed to parse Lua code; returning original code.");
    return {
      code,
      report: createEmptyAliasPassReport(),
      transformMap: LuaTransformMapBuilder.identity(code.length).toMap(),
    };
  }
  annotateLuaAstOrigins(ast, preparationMap.toMap(), code);
  const optimizationResult = optimizeLuaAst(ast, ruleOptions);
  ast = optimizationResult.ast;

  const minified = unparseLua(ast, ruleOptions);
  const emittedAst = parseLua(minified);
  if (!emittedAst) {
    throw new Error("Lua printer produced output that could not be parsed for source mapping");
  }
  const printedMap = createLuaPrintTransformMap(ast, emittedAst, code, minified);
  const restored = reinsertDisableMinificationBlocksWithMap(
    minified,
    printedMap,
    disableMinify.blocks.map((block) => ({
      placeholder: block.placeholder,
      content: block.content,
      inputContentBegin: disabledBlockOrigins.get(block.placeholder) ?? 0,
    })),
  );
  return {
    code: restored.code,
    report: optimizationResult.report,
    transformMap: restored.transformMap,
  };
}

export function processLua(code: string, ruleOptions: OptimizationRuleOptions): string {
  return processLuaWithReport(code, ruleOptions).code;
}

function disambiguateNumericConcat(code: string, transformMap: LuaTransformMapBuilder): string {
  // Insert a space before concatenation when a numeric literal is immediately followed by `..`.
  // Examples: `15.."x"` -> `15 .."x"`, `.15.."x"` -> `.15 .."x"`
  const insertions: number[] = [];
  const pattern = /(\d(?:\.\d+)?|\.\d+)\.\./g;
  for (const match of code.matchAll(pattern)) {
    insertions.push((match.index ?? 0) + match[1].length);
  }
  let output = code;
  for (const offset of insertions.sort((a, b) => b - a)) {
    const origin = transformMap.mapOffset(offset, "right");
    output = output.slice(0, offset) + " " + output.slice(offset);
    transformMap.spliceRange(offset, offset, 1, origin, "anchor");
  }
  return output;
}

type DisabledMinificationBlock = {
  placeholder: string; //
  content: string;
  inputContentBegin: number;
};

// Escape special characters in a string for use in a RegExp
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function appendNormalizedBlock(
  builder: LuaTransformMapBuilder,
  content: string,
  inputContentBegin: number,
): string {
  const normalized = content.replace(/\r?\n/g, "\n").replace(/\n+$/g, "");
  builder.appendAnchor(1, inputContentBegin);
  let sourceOffset = 0;
  const lines = normalized.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    builder.appendIdentity(line.length, inputContentBegin + sourceOffset);
    sourceOffset += line.length;
    if (i < lines.length - 1) {
      builder.appendAnchor(1, inputContentBegin + sourceOffset);
      if (content.startsWith("\r\n", sourceOffset)) {
        sourceOffset += 2;
      } else if (content[sourceOffset] === "\n" || content[sourceOffset] === "\r") {
        sourceOffset++;
      }
    }
  }
  builder.appendAnchor(1, inputContentBegin + sourceOffset);
  return `\n${normalized}\n`;
}

function reinsertDisableMinificationBlocksWithMap(
  source: string,
  transformMap: LuaTransformMap,
  blocks: DisabledMinificationBlock[],
): { code: string; transformMap: LuaTransformMap } {
  if (blocks.length === 0) {
    return { code: source, transformMap };
  }

  const replacements = blocks.flatMap((block) => {
    const placeholderIdentifier = block.placeholder.endsWith("()")
      ? block.placeholder.slice(0, -2)
      : null;
    const placeholderPattern = placeholderIdentifier
      // Printer modes may place whitespace between the placeholder call tokens.
      // Match the token sequence as one placeholder statement in every mode.
      ? `${escapeRegExp(placeholderIdentifier)}\\s*\\(\\s*\\)`
      : escapeRegExp(block.placeholder);
    const pattern = new RegExp(`[\\t ]*${placeholderPattern}[\\t ]*`, "g");
    const match = pattern.exec(source);
    return match
      ? [{ start: match.index, end: match.index + match[0].length, block }]
      : [];
  }).sort((a, b) => a.start - b.start);

  const builder = new LuaTransformMapBuilder(transformMap.inputLength);
  let output = "";
  let cursor = 0;
  for (const replacement of replacements) {
    const prefix = source.slice(cursor, replacement.start);
    output += prefix;
    builder.appendMappedSlice(prefix.length, transformMap, cursor);
    output += appendNormalizedBlock(
      builder,
      replacement.block.content,
      replacement.block.inputContentBegin,
    );
    cursor = replacement.end;
  }
  const suffix = source.slice(cursor);
  output += suffix;
  builder.appendMappedSlice(suffix.length, transformMap, cursor);
  return { code: output, transformMap: builder.toMap() };
}
