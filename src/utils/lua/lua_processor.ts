import * as luaparse from "luaparse";
import { renameLocalVariablesInAST } from "./lua_renamer";
import { literalAliasStrategy } from "./lua_alias_literals";
import { repeatedExpressionAliasStrategy } from "./lua_alias_expressions";
import {
  AliasPassReport,
  AliasStrategy,
  createEmptyAliasPassReport,
  runAliasPasses,
} from "./lua_alias_shared";
import { packLocalDeclarationsInAST } from "./lua_pack_locals";
import { simplifyExpressionsInAST } from "./lua_simplify";
import { removeUnusedLocalsInAST } from "./lua_remove_unused_locals";
import { removeUnusedFunctionsInAST } from "./lua_remove_unused_functions";
import { renameTableFieldsInAST } from "./lua_rename_table_fields";
import { renameAllowedTableKeysInAST } from "./lua_rename_allowed_table_keys";
import { renameAllowedGlobalsInAST } from "./lua_rename_allowed_globals";
import { extractLuaBlocks } from "./lua_fundamentals";
import { annotateLuaAstOrigins } from "./lua_ast_provenance";
import { createLuaPrintTransformMap } from "./lua_print_trace";
import { unparseLua } from "./lua_printer";
import type { LuaLineBehavior, LuaPrinterOptions } from "./lua_printer";
import {
  LuaTransformMap,
  LuaTransformMapBuilder,
} from "./lua_transform_map";

export { LuaPrinter } from "./lua_printer";
export { unparseLua };
export type { LuaLineBehavior };

export type OptimizationRuleOptions = LuaPrinterOptions & {
  stripComments: boolean; //
  //stripDebugBlocks: boolean; //
  renameLocalVariables: boolean;
  aliasRepeatedExpressions: boolean;

  // literal values like "hello" or numbers like 65535 that appear enough times can be
  // replaced with a local variable to save space.
  // * only done for values that appear enough times to offset the cost of the local declaration.
  // * alias declaration placed in the narrowest possible scope that contains all uses.
  aliasLiterals: boolean;

  // Simplify expressions by folding constants and propagating simple constant locals.
  // * folds basic arithmetic, boolean logic, and string concatenation when operands are literals.
  // * propagates locals that are assigned literal values until they are reassigned or shadowed.
  simplifyExpressions: boolean;

  // Remove local declarations that are never referenced (and whose initializers are side-effect free).
  removeUnusedLocals: boolean;

  // Remove unused function declarations (global and local) when safe.
  // Uses a conservative approach and always preserves functions in functionNamesToKeep.
  removeUnusedFunctions: boolean;

  // Names of functions that must not be removed.
  // Intended for entrypoints and externally-referenced API surfaces.
  functionNamesToKeep: string[];

  // Rename table literal field names when safe (non-escaping locals, string/identifier keys only).
  renameTableFields: boolean;

  // Globally rename specific table entry keys (string/identifier keys and member/index accesses) to short names.
  // Intended for callers that know these keys are safe to minify even when the table escapes.
  tableEntryKeysToRename: string[];

  // Explicit global names eligible for renaming in opt-in or opt-out mode.
  globalSymbolsToRename?: string[];

  // Controls whether global renaming is disabled, uses only the explicit allow-list, or
  // automatically renames globals defined in this code unless they are kept.
  globalSymbolRenaming?: "off" | "opt-in" | "opt-out";

  // Globals that must retain their authored names. Takes precedence over rename candidates.
  globalSymbolsToKeep?: string[];

  // Merge consecutive local declarations into one using packing.
  // e.g.,
  // local a=1
  // local b=2
  // ->
  // local a,b = 1,2
  // (18 chars -> 15)
  //
  // we should be conservative in choosing to apply this treatment:
  // * must be consecutive to guarantee no side-effects or dependencies in between.
  // * it's NOT safe when there are any intervening statements with side effects.
  // * or any dependencies between the variables being declared. like,
  //   local a = 1
  //   local b = a + c
  //   -> cannot be packed.
  //   local a, b = 1, a + c -- does not work because 'a' is not defined yet
  // * or if any of the variables are used before all are declared. this is non-trivial because you could
  //   have:
  //   local a = 1
  //   local b = doSomething() -- 'a' is used in doSomething()
  // so we skip packing in that case.
  packLocalDeclarations: boolean;

  // NOTE: so much lua code is `local`, `function`, `end`, and it's very tempting to attempt to
  // inline function calls. but it's way too difficult / complex to do in a minifier; basically anything other than the most
  // simple tiny case has side-effects we can't guarantee won't break.
};

export function parseLua(code: string): luaparse.Chunk | null {
  //console.log(code);
  try {
    const ast = luaparse.parse(code, {
      luaVersion: "5.3", // TIC-80 is 5.3-ish
      comments: true,
      locations: true,
      ranges: true,
    });
    return ast;
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

export function processLuaWithReport(code: string, ruleOptions: OptimizationRuleOptions): LuaProcessResult {
  // Apply optimization rules
  //const options = {...DEFAULT_OPTIMIZATION_RULES, ...ruleOptions};

  // Strip debug blocks and lines before parsing (line-based string matching)
  let processedCode = code;
  const preparationMap = LuaTransformMapBuilder.identity(code.length);
  processedCode = disambiguateNumericConcat(processedCode, preparationMap);
  // if (ruleOptions.stripDebugBlocks) {
  //    // Strip debug blocks
  //    processedCode = replaceLuaBlock(processedCode, "-- BEGIN_DEBUG_ONLY", "-- END_DEBUG_ONLY", "");

  //    // Strip individual lines marked with -- DEBUG_ONLY
  //    const eol = processedCode.includes("\r\n") ? "\r\n" : "\n";
  //    const lines = processedCode.split(eol);
  //    const filteredLines = lines.filter(line => !line.includes("-- DEBUG_ONLY"));
  //    processedCode = filteredLines.join(eol);
  // }

  // Honor explicit directives to keep certain regions verbatim
  // doing this at text level for simplification and because the printer can reformat everything.
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

  let ast = parseLua(processedCode);
  if (!ast) {
    console.error("Failed to parse Lua code; returning original code.");
    return {
      code,
      report: createEmptyAliasPassReport(),
      transformMap: LuaTransformMapBuilder.identity(code.length).toMap(),
    };
  }
  annotateLuaAstOrigins(ast, preparationMap.toMap(), code);
  //console.log("Parsed Lua AST:", ast);

  if (ruleOptions.stripComments) {
    ast.comments = [];
  }

  if (ruleOptions.simplifyExpressions) {
    ast = simplifyExpressionsInAST(ast);
  }

  if (ruleOptions.removeUnusedLocals) {
    ast = removeUnusedLocalsInAST(ast);
  }

  if (ruleOptions.removeUnusedFunctions) {
    ast = removeUnusedFunctionsInAST(ast, {
      functionNamesToKeep: ruleOptions.functionNamesToKeep,
    });
  }

  const aliasStrategies: AliasStrategy[] = [];
  if (ruleOptions.aliasLiterals) aliasStrategies.push(literalAliasStrategy);
  if (ruleOptions.aliasRepeatedExpressions) aliasStrategies.push(repeatedExpressionAliasStrategy);
  const aliasResult = runAliasPasses(ast, aliasStrategies);
  ast = aliasResult.ast;

  if (ruleOptions.packLocalDeclarations) {
    ast = packLocalDeclarationsInAST(ast);
  }

  if (ruleOptions.renameLocalVariables) {
    ast = renameLocalVariablesInAST(ast);
  }

  const globalSymbolRenaming = ruleOptions.globalSymbolRenaming ?? "opt-in";
  if (globalSymbolRenaming !== "off") {
    ast = renameAllowedGlobalsInAST(ast, {
      mode: globalSymbolRenaming,
      namesToRename: ruleOptions.globalSymbolsToRename,
      namesToKeep: [
        ...(ruleOptions.functionNamesToKeep ?? []),
        ...(ruleOptions.globalSymbolsToKeep ?? []),
      ],
    });
  }

  if (ruleOptions.tableEntryKeysToRename && ruleOptions.tableEntryKeysToRename.length > 0) {
    ast = renameAllowedTableKeysInAST(ast, ruleOptions.tableEntryKeysToRename);
  }

  if (ruleOptions.renameTableFields) {
    ast = renameTableFieldsInAST(ast);
  }

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
    report: aliasResult.report,
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
