import * as luaparse from "luaparse";
import * as path from "node:path";
import { isSameFileLocation, readBinaryFileAsync, readTextFileAsync, resolveFileWithSearchPaths } from "../utils/fileSystem";
import { toLuaStringLiteral } from "../utils/lua/lua_fundamentals";
import { stringValue } from "../utils/lua/lua_utils";
import { decompressCodeBytes, getCombinedCodeBytes, parseTic80Cart } from "../utils/tic80/cartLoader";
import { Tic80CartChunkTypeKey } from "../utils/tic80/tic80";
import { parseImportReference } from "./importUtils";
import { kImportKind, PreprocessorValue } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";
import { parseLua, parseLuaQuiet } from "../utils/lua/lua_processor";
import { collectDocCommentAbove } from "../utils/lua/lua_doc";
import * as cons from "../utils/console";
import { getErrorMessage } from "../utils/errorHandling";
import {
  assertSourceMapMatchesSource,
  createIdentitySourceMap,
  mapPreprocessedOffset,
  mapPreprocessedOffsetToLineColumn,
  SourceMapBuilder,
  LuaPreprocessorSourceMap,
} from "./sourceMap";
import {
  encodeBytesWithDestSpec,
  encodeLiteralToBytes,
  normalizeEmptySpec,
  splitPipelineSpec,
  resolveImportBytes,
} from "./luaEncode";
import { GeneratedLuaSource } from "./ImportedResourceTypes";
import { MaterializedImportSource, materializeImportSource, requireFileImportSource } from "./importSources";
import { profileAsync, profileSync, TraceScope } from "../utils/traceProfiler";
import { getResolvedPreprocessorDefines } from "./preprocessorDefines";


export type LuaPreprocessorValue = PreprocessorValue;

export type LuaPreprocessResult = {
  code: string;
  dependencies: string[];
  sourceMap: LuaPreprocessorSourceMap;
  preprocessorSymbols: PreprocessorSymbol[];
  minifyAllowedGlobalNames: string[];
  minifyGlobalNamesToKeep: string[];
};

export type LuaCodeImportResolver = (importName: string) => Promise<GeneratedLuaSource | undefined>;
export type LuaImportSourceResolver = (importName: string) => Promise<MaterializedImportSource | undefined>;

export type LuaPreprocessorOptions = {
  resolveCodeImport?: LuaCodeImportResolver;
  resolveImportSource?: LuaImportSourceResolver;
  sourceMap?: LuaPreprocessorSourceMap;
  quietParseFailures?: boolean;
  profileScope?: TraceScope;
};

export type PreprocessorSymbol = {
  name: string;
  kind: "macro";
  invocationStyle: MacroInvocationStyle;
  sourceFile: string;
  offset: number;
  params: string[];
  docLines?: string[];
};

export type MacroInvocationStyle = "object" | "function";

type MacroBodyKind = "empty" | "expression" | "statements";

type PreprocessorState = {
  defines: Map<string, LuaPreprocessorValue>;
  dependencies: Set<string>;
  pragmaOnceKeys: Set<string>;
  includeStack: string[];
  macroSymbols: PreprocessorSymbol[];
  minifyAllowedGlobalNames: string[];
  minifyGlobalNamesToKeep: string[];
  resolveCodeImport?: LuaCodeImportResolver;
  resolveImportSource: LuaImportSourceResolver;
  diagnostics: SourceProcessingDiagnostics;
};

type SourceProcessingDiagnostics = {
  sourcesProcessed: number;
  sourceCharacters: number;
  includeDirectives: number;
  fileIncludes: number;
  codeImportIncludes: number;
  cartridgeCodeIncludes: number;
  pragmaOnceSkips: number;
};

type MinifyRenameDirective = "allow_rename" | "no_rename";

type PendingMinifyRename = {
  option: MinifyRenameDirective;
  filePath: string;
  lineNumber: number;
};

type MacroDefinition = {
  name: string;
  invocationStyle: MacroInvocationStyle;
  params: string[];
  body: string;
  bodyKind: MacroBodyKind;
  bodyAst: luaparse.Node | null;
  bodyRangeOffset: number;
  sourceFile: string;
  lineNumber: number;
};

type MacroDefinitionEvent = {
  // Offset in the flattened ProcessResult.code where this definition becomes active.
  // Events stay in source order so definitions at the same offset resolve last-one-wins.
  offset: number;
  definition: MacroDefinition;
};

type ConditionFrame = {
  parentActive: boolean;
  conditionMet: boolean;
  active: boolean;
  hasElse: boolean;
};

export async function preprocessLuaCode(
  project: TicbuildProjectCore,
  source: string,
  filePath: string,
  options: LuaPreprocessorOptions = {},
): Promise<LuaPreprocessResult> {
  const manifestDefines = getResolvedPreprocessorDefines(project);
  const fallbackImportSources = new Map<string, Promise<MaterializedImportSource>>();
  const resolveImportSource: LuaImportSourceResolver = options.resolveImportSource ?? (async (importName) => {
    const importDef = project.manifest.imports.find((candidate) => candidate.name === importName);
    if (!importDef) {
      return undefined;
    }
    let source = fallbackImportSources.get(importName);
    if (!source) {
      source = materializeImportSource(project, importDef);
      fallbackImportSources.set(importName, source);
    }
    return await source;
  });
  const state: PreprocessorState = {
    defines: new Map<string, LuaPreprocessorValue>(Object.entries(manifestDefines)),
    dependencies: new Set<string>(),
    pragmaOnceKeys: new Set<string>(),
    includeStack: [],
    macroSymbols: [],
    minifyAllowedGlobalNames: [],
    minifyGlobalNamesToKeep: [],
    resolveCodeImport: options.resolveCodeImport,
    resolveImportSource,
    diagnostics: {
      sourcesProcessed: 0,
      sourceCharacters: 0,
      includeDirectives: 0,
      fileIncludes: 0,
      codeImportIncludes: 0,
      cartridgeCodeIncludes: 0,
      pragmaOnceSkips: 0,
    },
  };

  const includeKey = makeIncludeKey(filePath, {});
  const inputSourceMap = options.sourceMap ?? createIdentitySourceMap(source, filePath);
  assertSourceMapMatchesSource(inputSourceMap, source);
  const rawResult = await profileAsync(
    options.profileScope,
    "Resolve Lua includes and directives",
    {
      category: "Lua preprocessing",
      args: { inputCharacters: source.length },
    },
    async (scope) => {
      const result = await processSource(project, source, inputSourceMap, filePath, includeKey, state, {});
      scope?.setArgs({
        outputCharacters: result.code.length,
        sourceMapSegments: result.map.getSegments().length,
        macroDefinitions: result.macroDefinitions.length,
        ...state.diagnostics,
      });
      return result;
    },
  );
  const expandedResult = expandMacros(rawResult, filePath, options.profileScope);
  const finalResult = await expandPreprocessorCalls(
    project,
    expandedResult,
    filePath,
    state,
    options.quietParseFailures ?? false,
    options.profileScope,
  );
  const sourceMap = profileSync(
    options.profileScope,
    "Finalize Lua source map",
    {
      category: "Lua preprocessing",
      args: {
        outputCharacters: finalResult.code.length,
        sourceMapSegments: finalResult.map.getSegments().length,
      },
    },
    () => finalResult.map.toSourceMap(finalResult.code),
  );

  return {
    code: finalResult.code,
    dependencies: Array.from(state.dependencies.values()),
    sourceMap,
    preprocessorSymbols: state.macroSymbols,
    minifyAllowedGlobalNames: Array.from(new Set(state.minifyAllowedGlobalNames)),
    minifyGlobalNamesToKeep: Array.from(new Set(state.minifyGlobalNamesToKeep)),
  };
}

type ProcessResult = {
  code: string;
  map: SourceMapBuilder;
  macroDefinitions: MacroDefinitionEvent[];
};

async function processSource(
  project: TicbuildProjectCore,
  source: string,
  inputSourceMap: LuaPreprocessorSourceMap,
  filePath: string,
  includeKey: string,
  state: PreprocessorState,
  inputOverrides: Record<string, LuaPreprocessorValue>,
  trackDependency: boolean = true,
): Promise<ProcessResult> {
  if (state.pragmaOnceKeys.has(includeKey)) {
    state.diagnostics.pragmaOnceSkips++;
    return { code: "", map: new SourceMapBuilder(), macroDefinitions: [] };
  }
  if (state.includeStack.includes(includeKey)) {
    const cycle = [...state.includeStack, includeKey].join(" -> ");
    throw new Error(`Lua preprocessor include cycle detected: ${cycle}`);
  }
  state.diagnostics.sourcesProcessed++;
  state.diagnostics.sourceCharacters += source.length;

  state.includeStack.push(includeKey);
  if (trackDependency) {
    state.dependencies.add(filePath);
  }

  const hasOverrides = Object.keys(inputOverrides).length > 0;
  const localDefines = hasOverrides ? new Map(state.defines) : state.defines;
  if (hasOverrides) {
    for (const [key, value] of Object.entries(inputOverrides)) {
      localDefines.set(key, value);
    }
  }

  const conditionalStack: ConditionFrame[] = [];
  const builder = new SourceMapBuilder();
  const macroDefinitions: MacroDefinitionEvent[] = [];
  let output = "";
  let lastEmittedOrigin: { file: string; offset: number } | null = null;
  let pendingMinifyRename: PendingMinifyRename | null = null;

  // helper to check if current line is in active conditional block
  const isActive = (): boolean => {
    if (conditionalStack.length === 0) {
      return true;
    }
    return conditionalStack[conditionalStack.length - 1].active;
  };

  const lines = splitLinesWithOffsets(source);
  const lineTexts = lines.map((info) => info.text);
  for (let i = 0; i < lines.length; i++) {
    const lineInfo = lines[i];
    const line = lineInfo.text;
    const lineNumber = i + 1;
    const authoredLineLocation = mapPreprocessedOffsetToLineColumn(inputSourceMap, lineInfo.startOffset, "right");
    const authoredFilePath = authoredLineLocation?.file ?? filePath;
    const authoredLineNumber = authoredLineLocation?.line ?? lineNumber;

    const directiveMatch = line.match(/^\s*--#\s*(\w+)\s*(.*)$/);
    if (!directiveMatch) {
      if (isActive()) {
        if (pendingMinifyRename && !isIgnorableMinifyTargetLine(line)) {
          const targetName = parseMinifyRenameTarget(line);
          if (!targetName) {
            throw new Error(formatError(
              pendingMinifyRename.filePath,
              pendingMinifyRename.lineNumber,
              minifyTargetError(pendingMinifyRename.option),
            ));
          }
          if (pendingMinifyRename.option === "allow_rename") {
            state.minifyAllowedGlobalNames.push(targetName);
          } else {
            state.minifyGlobalNamesToKeep.push(targetName);
          }
          pendingMinifyRename = null;
        }
        if (output.length > 0) {
          output += "\n";
          const newlineOrigin = lastEmittedOrigin ?? mapPreprocessedOffset(inputSourceMap, lineInfo.startOffset, "right");
          builder.appendGenerated("\n", newlineOrigin);
        }
        output += line;
        builder.appendMappedSlice(line, inputSourceMap, lineInfo.startOffset);
        lastEmittedOrigin = mapPreprocessedOffset(inputSourceMap, lineInfo.endOffset, "left");
      }
      continue;
    }

    const directive = directiveMatch[1];
    const rest = directiveMatch[2] || "";

    switch (directive) {
      case "macro": {
        const macroHeader = parseMacroHeader(rest, authoredFilePath, authoredLineNumber);
        const nameOffset = findMacroNameOffset(line, lineInfo.startOffset, macroHeader.name);
        const nameOrigin = mapPreprocessedOffset(inputSourceMap, nameOffset, "right");
        const docLines = collectDocCommentAbove(lineTexts, i);
        if (macroHeader.inlineBody !== undefined) {
          if (isActive()) {
            const definition = createMacroDefinition(
              macroHeader,
              macroHeader.inlineBody,
              authoredFilePath,
              authoredLineNumber,
            );
            macroDefinitions.push({
              offset: output.length,
              definition,
            });
            state.macroSymbols.push({
              name: macroHeader.name,
              kind: "macro",
              invocationStyle: macroHeader.invocationStyle,
              sourceFile: nameOrigin?.file ?? authoredFilePath,
              offset: nameOrigin?.offset ?? nameOffset,
              params: macroHeader.params,
              docLines,
            });
          }
          break;
        }

        const bodyResult = readMacroBody(lineTexts, i + 1, authoredFilePath, authoredLineNumber);
        i = bodyResult.endIndex;
        if (isActive()) {
          const strippedBody = stripLuaCommentsPreserveNewlines(bodyResult.body);
          const definition = createMacroDefinition(
            macroHeader,
            strippedBody,
            authoredFilePath,
            authoredLineNumber,
          );
          macroDefinitions.push({
            offset: output.length,
            definition,
          });
          state.macroSymbols.push({
            name: macroHeader.name,
            kind: "macro",
            invocationStyle: macroHeader.invocationStyle,
            sourceFile: nameOrigin?.file ?? authoredFilePath,
            offset: nameOrigin?.offset ?? nameOffset,
            params: macroHeader.params,
            docLines,
          });
        }
        break;
      }
      case "endmacro": {
        throw new Error(formatError(authoredFilePath, authoredLineNumber, `--#endmacro without matching --#macro`));
      }
      case "minify": {
        if (!isActive()) {
          break;
        }
        const minifyOption = stripTrailingLineComment(rest).trim();
        if (minifyOption !== "allow_rename" && minifyOption !== "no_rename") {
          throw new Error(formatError(authoredFilePath, authoredLineNumber, `Unsupported --#minify option: ${minifyOption}`));
        }
        if (pendingMinifyRename) {
          throw new Error(formatError(
            authoredFilePath,
            authoredLineNumber,
            `--#minify ${pendingMinifyRename.option} cannot be repeated before a target declaration`,
          ));
        }
        pendingMinifyRename = {
          option: minifyOption,
          filePath: authoredFilePath,
          lineNumber: authoredLineNumber,
        };
        break;
      }
      case "define": {
        if (!isActive()) {
          break;
        }
        const defineMatch = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:\s+(.*))?$/);
        if (!defineMatch) {
          throw new Error(formatError(authoredFilePath, authoredLineNumber, `Invalid --#define syntax: ${line}`));
        }
        const name = defineMatch[1];
        const expr = defineMatch[2];
        if (!expr || expr.trim() === "") {
          localDefines.set(name, true);
        } else {
          const value = evaluateExpression(
            parseExpression(expr, authoredFilePath, authoredLineNumber),
            localDefines,
            authoredFilePath,
            authoredLineNumber,
          );
          localDefines.set(name, value);
        }
        break;
      }
      case "undef": {
        if (!isActive()) {
          break;
        }
        const undefMatch = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)$/);
        if (!undefMatch) {
          throw new Error(formatError(authoredFilePath, authoredLineNumber, `Invalid --#undef syntax: ${line}`));
        }
        localDefines.delete(undefMatch[1]);
        break;
      }
      case "if": {
        const parentActive = isActive();
        let conditionMet = false;
        if (parentActive) {
          if (!rest || rest.trim() === "") {
            throw new Error(formatError(authoredFilePath, authoredLineNumber, `Missing expression in --#if`));
          }
          const exprValue = evaluateExpression(
            parseExpression(rest, authoredFilePath, authoredLineNumber),
            localDefines,
            authoredFilePath,
            authoredLineNumber,
          );
          conditionMet = isTruthy(exprValue);
        }
        conditionalStack.push({
          parentActive,
          conditionMet,
          active: parentActive && conditionMet,
          hasElse: false,
        });
        break;
      }
      case "ifdef": {
        const parentActive = isActive();
        let conditionMet = false;
        if (parentActive) {
          const ifdefMatch = rest.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)$/);
          if (!ifdefMatch) {
            throw new Error(formatError(authoredFilePath, authoredLineNumber, `Invalid --#ifdef syntax: ${line}`));
          }
          conditionMet = localDefines.has(ifdefMatch[1]);
        }
        conditionalStack.push({
          parentActive,
          conditionMet,
          active: parentActive && conditionMet,
          hasElse: false,
        });
        break;
      }
      case "ifndef": {
        const parentActive = isActive();
        let conditionMet = false;
        if (parentActive) {
          const ifndefMatch = rest.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)$/);
          if (!ifndefMatch) {
            throw new Error(formatError(authoredFilePath, authoredLineNumber, `Invalid --#ifndef syntax: ${line}`));
          }
          conditionMet = !localDefines.has(ifndefMatch[1]);
        }
        conditionalStack.push({
          parentActive,
          conditionMet,
          active: parentActive && conditionMet,
          hasElse: false,
        });
        break;
      }
      case "else": {
        if (conditionalStack.length === 0) {
          throw new Error(formatError(authoredFilePath, authoredLineNumber, `--#else without matching --#if`));
        }
        const top = conditionalStack[conditionalStack.length - 1];
        if (top.hasElse) {
          throw new Error(formatError(authoredFilePath, authoredLineNumber, `Duplicate --#else for same --#if`));
        }
        top.hasElse = true;
        top.active = top.parentActive && !top.conditionMet;
        break;
      }
      case "endif": {
        if (conditionalStack.length === 0) {
          throw new Error(formatError(authoredFilePath, authoredLineNumber, `--#endif without matching --#if`));
        }
        conditionalStack.pop();
        break;
      }
      case "pragma": {
        if (!isActive()) {
          break;
        }
        const pragmaMatch = rest.trim().match(/^(\w+)$/);
        if (!pragmaMatch) {
          throw new Error(formatError(authoredFilePath, authoredLineNumber, `Invalid --#pragma syntax: ${line}`));
        }
        if (pragmaMatch[1] === "once") {
          state.pragmaOnceKeys.add(includeKey);
        } else {
          throw new Error(formatError(authoredFilePath, authoredLineNumber, `Unknown pragma: ${pragmaMatch[1]}`));
        }
        break;
      }
      case "include": {
        if (!isActive()) {
          break;
        }
        state.diagnostics.includeDirectives++;
        const includeMatch = rest.trim().match(/^"([^"]+)"(.*)$/);
        if (!includeMatch) {
          throw new Error(formatError(authoredFilePath, authoredLineNumber, `Invalid --#include syntax: ${line}`));
        }
        const includeTarget = includeMatch[1];
        const remainder = includeMatch[2] || "";
        const overrides = parseWithOverrides(remainder, localDefines, authoredFilePath, authoredLineNumber);

        const included = await resolveInclude(
          project,
          includeTarget,
          authoredFilePath,
          overrides,
          state,
          authoredLineNumber,
        );
        let includedOffset = output.length;
        if (included.code) {
          if (output.length > 0) {
            output += "\n";
            const newlineOrigin = lastEmittedOrigin ?? { file: authoredFilePath, offset: authoredLineLocation?.offset ?? 0 };
            builder.appendGenerated("\n", newlineOrigin);
          }
          includedOffset = output.length;
          output += included.code;
          builder.appendMap(included.map);
          const endOrigin = included.map.mapOffset(included.code.length);
          if (endOrigin) {
            lastEmittedOrigin = endOrigin;
          }
        }
        for (const event of included.macroDefinitions) {
          macroDefinitions.push({
            offset: includedOffset + event.offset,
            definition: event.definition,
          });
        }
        break;
      }
      case "error": {
        if (!isActive()) {
          break;
        }
        const message = rest.trim();
        if (!message) {
          throw new Error(formatError(authoredFilePath, authoredLineNumber, `--#error encountered`));
        }
        throw new Error(formatError(authoredFilePath, authoredLineNumber, message));
      }
      case "warning": {
        if (!isActive()) {
          break;
        }
        const message = rest.trim();
        if (!message) {
          cons.warning(formatError(authoredFilePath, authoredLineNumber, `--#warning encountered`));
          break;
        }
        cons.warning(formatError(authoredFilePath, authoredLineNumber, message));
        break;
      }
      default:
        throw new Error(formatError(authoredFilePath, authoredLineNumber, `Unknown directive: --#${directive}`));
    }
  }

  if (conditionalStack.length > 0) {
    throw new Error(formatError(filePath, lines.length, `Unclosed --#if block`));
  }

  if (pendingMinifyRename) {
    throw new Error(formatError(
      pendingMinifyRename.filePath,
      pendingMinifyRename.lineNumber,
      minifyTargetError(pendingMinifyRename.option),
    ));
  }

  state.includeStack.pop();
  return { code: output, map: builder, macroDefinitions };
}

function isIgnorableMinifyTargetLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.length === 0 || trimmed.startsWith("--");
}

function stripTrailingLineComment(text: string): string {
  return text.replace(/\s*--.*$/, "");
}

function minifyTargetError(option: MinifyRenameDirective): string {
  return `--#minify ${option} must be followed by a simple global function or assignment`;
}

function parseMinifyRenameTarget(line: string): string | null {
  const functionMatch = line.match(/^\s*function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
  if (functionMatch) {
    return functionMatch[1];
  }

  const assignmentMatch = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  if (assignmentMatch) {
    return assignmentMatch[1];
  }

  return null;
}

async function resolveInclude(
  project: TicbuildProjectCore,
  includeTarget: string,
  fromFile: string,
  overrides: Record<string, LuaPreprocessorValue>,
  state: PreprocessorState,
  lineNumber: number,
): Promise<ProcessResult> {
  if (includeTarget.startsWith("import:")) {
    return await resolveImportInclude(project, includeTarget, overrides, state, lineNumber);
  }
  state.diagnostics.fileIncludes++;

  const substituted = project.substituteVariables(includeTarget);
  let resolvedPath: string;

  const localFound = resolveFileWithSearchPaths(substituted, path.dirname(fromFile));
  if (localFound) {
    resolvedPath = localFound;
  } else {
    try {
      resolvedPath = project.resolveIncludePath(substituted);
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(formatError(fromFile, lineNumber, message));
    }
  }
  const includeKey = makeIncludeKey(resolvedPath, overrides);

  if (state.pragmaOnceKeys.has(includeKey)) {
    state.diagnostics.pragmaOnceSkips++;
    return { code: "", map: new SourceMapBuilder(), macroDefinitions: [] };
  }

  const source = await readTextFileAsync(resolvedPath);
  const included = await processSource(
    project,
    source,
    createIdentitySourceMap(source, resolvedPath),
    resolvedPath,
    includeKey,
    state,
    overrides,
  );
  return ensureTrailingNewline(included, resolvedPath);
}

async function resolveImportInclude(
  project: TicbuildProjectCore,
  includeTarget: string,
  overrides: Record<string, LuaPreprocessorValue>,
  state: PreprocessorState,
  lineNumber: number,
): Promise<ProcessResult> {
  const ref = parseImportReference(includeTarget);
  const importName = ref.importName;
  const chunkSpec = ref.chunkSpec;

  const importDef = project.manifest.imports.find((imp) => imp.name === importName);
  if (!importDef) {
    throw new Error(formatError("<include>", lineNumber, `Import not found: ${importName}`));
  }

  const generatedLua = await state.resolveCodeImport?.(importName);
  if (generatedLua) {
    state.diagnostics.codeImportIncludes++;
    if (chunkSpec) {
      throw new Error(
        formatError(generatedLua.sourcePath, lineNumber, `Code imports do not support a chunk selector`),
      );
    }
    for (const dependency of generatedLua.dependencies ?? []) {
      state.dependencies.add(dependency.path);
    }
    const includeKey = makeIncludeKey(generatedLua.sourcePath, overrides);
    if (state.pragmaOnceKeys.has(includeKey)) {
      state.diagnostics.pragmaOnceSkips++;
      return { code: "", map: new SourceMapBuilder(), macroDefinitions: [] };
    }
    const included = await processSource(
      project,
      generatedLua.source,
      generatedLua.sourceMap,
      generatedLua.sourcePath,
      includeKey,
      state,
      overrides,
      !(generatedLua.generatedOutputs ?? []).some((outputPath) => isSameFileLocation(outputPath, generatedLua.sourcePath)),
    );
    return ensureTrailingNewline(included, generatedLua.sourcePath);
  }

  if (importDef.kind === kImportKind.key.Tic80Cartridge) {
    state.diagnostics.cartridgeCodeIncludes++;
    const importSource = await state.resolveImportSource(importName);
    if (!importSource) {
      throw new Error(formatError("<include>", lineNumber, `Import source not found: ${importName}`));
    }
    const resolvedPath = requireFileImportSource(importDef, importSource);
    const data = await readBinaryFileAsync(resolvedPath);
    const cart = parseTic80Cart(data);
    for (const dependency of importSource.watchDependencies) {
      state.dependencies.add(dependency.path);
    }

    const availableChunks =
      importDef.chunks && importDef.chunks.length > 0
        ? importDef.chunks
        : Array.from(new Set(cart.chunks.map((chunk) => chunk.chunkType)));

    const hasCode = availableChunks.includes("CODE") || availableChunks.includes("CODE_COMPRESSED");
    if (!hasCode) {
      throw new Error(formatError(resolvedPath, lineNumber, `No CODE or CODE_COMPRESSED chunk found in cart: ${importName}`));
    }

    let selectedChunk: Tic80CartChunkTypeKey = availableChunks.includes("CODE") ? "CODE" : "CODE_COMPRESSED";
    if (chunkSpec) {
      if (chunkSpec !== "CODE" && chunkSpec !== "CODE_COMPRESSED") {
        throw new Error(formatError(resolvedPath, lineNumber, `Only CODE or CODE_COMPRESSED chunk is supported for include`));
      }
      selectedChunk = chunkSpec as Tic80CartChunkTypeKey;
      if (!availableChunks.includes(selectedChunk)) {
        throw new Error(
          formatError(resolvedPath, lineNumber, `Requested chunk ${selectedChunk} not available in import`),
        );
      }
    } else if (availableChunks.length > 1) {
      throw new Error(
        formatError(
          resolvedPath,
          lineNumber,
          `Import ${importName} contains multiple chunks. Specify :CODE explicitly in include.`,
        ),
      );
    }

    const decoder = new TextDecoder("utf-8");
    let sourceBytes: Uint8Array | null = null;
    if (selectedChunk === "CODE") {
      sourceBytes = getCombinedCodeBytes(cart);
    } else {
      const compressedChunk = cart.chunks.find((chunk) => chunk.chunkType === "CODE_COMPRESSED");
      sourceBytes = compressedChunk ? decompressCodeBytes(compressedChunk.data) : null;
    }

    if (!sourceBytes) {
      throw new Error(formatError(resolvedPath, lineNumber, `Requested chunk ${selectedChunk} not found in cart`));
    }

    const source = decoder.decode(sourceBytes);
    const includeKey = makeIncludeKey(`${includeTarget}:${selectedChunk}`, overrides);
    const included = await processSource(
      project,
      source,
      createIdentitySourceMap(source, `${includeTarget}:${selectedChunk}`),
      `${includeTarget}:${selectedChunk}`,
      includeKey,
      state,
      overrides,
      false,
    );
    return ensureTrailingNewline(included, `${includeTarget}:${selectedChunk}`);
  }

  throw new Error(formatError("<include>", lineNumber, `Unsupported import kind: ${importDef.kind}`));
}

function parseWithOverrides(
  remainder: string,
  defines: Map<string, LuaPreprocessorValue>,
  filePath: string,
  lineNumber: number,
): Record<string, LuaPreprocessorValue> {
  const match = remainder.match(/\bwith\s*(\{[\s\S]*\})\s*(?:--.*)?$/);
  if (!match) {
    return {};
  }
  const tableText = match[1];
  const expr = parseExpression(tableText, filePath, lineNumber);
  if (expr.type !== "TableConstructorExpression") {
    throw new Error(formatError(filePath, lineNumber, `Invalid with-clause expression`));
  }
  return evaluateTable(expr, defines, filePath, lineNumber);
}

function parseExpression(exprText: string, filePath: string, lineNumber: number): luaparse.Expression {
  try {
    const chunk = parseLua(`return ${exprText}`)!;
    if (chunk.body.length === 0 || chunk.body[0].type !== "ReturnStatement") {
      throw new Error("Invalid expression");
    }
    const returnStmt = chunk.body[0];
    if (returnStmt.arguments.length !== 1) {
      throw new Error("Expected single expression");
    }
    return returnStmt.arguments[0];
  } catch (error) {
    throw new Error(formatError(filePath, lineNumber, `Failed to parse expression: ${exprText}`));
  }
}

// alternatively i could actually RUN the Lua but it's not trivial and would be slow.
// turns out not to be so bad to just evaluate off the AST.
function evaluateExpression(
  expr: luaparse.Expression,
  defines: Map<string, LuaPreprocessorValue>,
  filePath: string,
  lineNumber: number,
): LuaPreprocessorValue {
  switch (expr.type) {
    case "NumericLiteral":
      return expr.value;
    case "StringLiteral": {
      const value = stringValue(expr);
      if (value === null) {
        throw new Error(formatError(filePath, lineNumber, `Invalid string literal`));
      }
      return value;
    }
    case "BooleanLiteral":
      return expr.value;
    case "Identifier": {
      if (!defines.has(expr.name)) {
        throw new Error(formatError(filePath, lineNumber, `Undefined preprocessor symbol: ${expr.name}`));
      }
      return defines.get(expr.name)!;
    }
    case "UnaryExpression": {
      const arg = evaluateExpression(expr.argument, defines, filePath, lineNumber);
      switch (expr.operator) {
        case "not":
          return !isTruthy(arg);
        case "-":
          return -asNumber(arg, filePath, lineNumber);
        default:
          throw new Error(formatError(filePath, lineNumber, `Unsupported unary operator: ${expr.operator}`));
      }
    }
    case "BinaryExpression": {
      const left = evaluateExpression(expr.left, defines, filePath, lineNumber);
      const right = evaluateExpression(expr.right, defines, filePath, lineNumber);
      switch (expr.operator) {
        case "+":
          return asNumber(left, filePath, lineNumber) + asNumber(right, filePath, lineNumber);
        case "-":
          return asNumber(left, filePath, lineNumber) - asNumber(right, filePath, lineNumber);
        case "*":
          return asNumber(left, filePath, lineNumber) * asNumber(right, filePath, lineNumber);
        case "/":
          return asNumber(left, filePath, lineNumber) / asNumber(right, filePath, lineNumber);
        case "%":
          return asNumber(left, filePath, lineNumber) % asNumber(right, filePath, lineNumber);
        case "..":
          return String(left) + String(right);
        case "==":
          return left === right;
        case "~=":
          return left !== right;
        case "<":
          return compareValues(left, right, filePath, lineNumber, (a, b) => a < b);
        case "<=":
          return compareValues(left, right, filePath, lineNumber, (a, b) => a <= b);
        case ">":
          return compareValues(left, right, filePath, lineNumber, (a, b) => a > b);
        case ">=":
          return compareValues(left, right, filePath, lineNumber, (a, b) => a >= b);
        default:
          throw new Error(formatError(filePath, lineNumber, `Unsupported binary operator: ${expr.operator}`));
      }
    }
    case "LogicalExpression": {
      const left = evaluateExpression(expr.left, defines, filePath, lineNumber);
      if (expr.operator === "and") {
        return isTruthy(left) ? evaluateExpression(expr.right, defines, filePath, lineNumber) : left;
      }
      if (expr.operator === "or") {
        return isTruthy(left) ? left : evaluateExpression(expr.right, defines, filePath, lineNumber);
      }
      throw new Error(formatError(filePath, lineNumber, `Unsupported logical operator: ${expr.operator}`));
    }
    case "CallExpression": {
      if (expr.base.type !== "Identifier" || expr.base.name !== "defined") {
        throw new Error(formatError(filePath, lineNumber, `Unsupported function call in preprocessor expression`));
      }
      if (expr.arguments.length !== 1) {
        throw new Error(formatError(filePath, lineNumber, `defined() expects exactly one argument`));
      }
      const arg = expr.arguments[0];
      if (arg.type === "Identifier") {
        return defines.has(arg.name);
      }
      if (arg.type === "StringLiteral") {
        const value = stringValue(arg);
        if (value === null) {
          throw new Error(formatError(filePath, lineNumber, `Invalid string literal in defined()`));
        }
        return defines.has(value);
      }
      throw new Error(formatError(filePath, lineNumber, `defined() argument must be an identifier or string literal`));
    }
    default:
      throw new Error(formatError(filePath, lineNumber, `Unsupported expression type: ${expr.type}`));
  }
}

// evaluates a table constructor expression into a key-value map
// used for with-clause parsing in include directives
function evaluateTable(
  expr: luaparse.TableConstructorExpression,
  defines: Map<string, LuaPreprocessorValue>,
  filePath: string,
  lineNumber: number,
): Record<string, LuaPreprocessorValue> {
  const result: Record<string, LuaPreprocessorValue> = {};
  for (const field of expr.fields) {
    switch (field.type) {
      case "TableKeyString": {
        const key = field.key.name;
        const value = evaluateExpression(field.value, defines, filePath, lineNumber);
        result[key] = value;
        break;
      }
      case "TableKey": {
        if (field.key.type !== "StringLiteral") {
          throw new Error(formatError(filePath, lineNumber, `Only string keys are supported in with-clause`));
        }
        const key = stringValue(field.key);
        if (key === null) {
          throw new Error(formatError(filePath, lineNumber, `Invalid string key in with-clause`));
        }
        const value = evaluateExpression(field.value, defines, filePath, lineNumber);
        result[key] = value;
        break;
      }
      default:
        throw new Error(formatError(filePath, lineNumber, `Unsupported with-clause field type: ${field.type}`));
    }
  }
  return result;
}

function compareValues(
  left: LuaPreprocessorValue,
  right: LuaPreprocessorValue,
  filePath: string,
  lineNumber: number,
  comparator: (a: number | string, b: number | string) => boolean,
): boolean {
  if (typeof left === "number" && typeof right === "number") {
    return comparator(left, right);
  }
  if (typeof left === "string" && typeof right === "string") {
    return comparator(left, right);
  }
  throw new Error(formatError(filePath, lineNumber, `Comparison requires both values to be numbers or strings`));
}

// ensures the value is a number; throws otherwise
// used in expression evaluation
function asNumber(value: LuaPreprocessorValue, filePath: string, lineNumber: number): number {
  if (typeof value !== "number") {
    throw new Error(formatError(filePath, lineNumber, `Expected number but got ${typeof value}`));
  }
  return value;
}

function isTruthy(value: LuaPreprocessorValue): boolean {
  return value !== false;
}

function ensureTrailingNewline(result: ProcessResult, filePath: string): ProcessResult {
  if (result.code.endsWith("\n")) {
    return result;
  }
  const origin = result.map.mapOffset(result.code.length) ?? { file: filePath, offset: 0 };
  const map = new SourceMapBuilder();
  map.appendMap(result.map);
  map.appendGenerated("\n", origin);
  return { code: result.code + "\n", map, macroDefinitions: result.macroDefinitions };
}

type LongBracketInfo = {
  equalsCount: number;
  length: number;
  close: string;
};

function readLongBracketOpen(text: string, index: number): LongBracketInfo | null {
  if (text[index] !== "[") {
    return null;
  }
  let j = index + 1;
  while (j < text.length && text[j] === "=") {
    j++;
  }
  if (j < text.length && text[j] === "[") {
    const equalsCount = j - index - 1;
    const close = "]" + "=".repeat(equalsCount) + "]";
    return { equalsCount, length: j - index + 1, close };
  }
  return null;
}

function stripLuaCommentsPreserveNewlines(source: string): string {
  let out = "";
  let i = 0;
  let state: "normal" | "single" | "double" | "long-string" | "line-comment" | "block-comment" = "normal";
  let longClose = "";

  while (i < source.length) {
    const ch = source[i];

    if (state === "normal") {
      if (ch === "-" && source[i + 1] === "-") {
        const longOpen = readLongBracketOpen(source, i + 2);
        if (longOpen) {
          state = "block-comment";
          longClose = longOpen.close;
          i += 2 + longOpen.length;
          continue;
        }
        state = "line-comment";
        i += 2;
        continue;
      }

      if (ch === '"' || ch === "'") {
        state = ch === '"' ? "double" : "single";
        out += ch;
        i++;
        continue;
      }

      if (ch === "[") {
        const longOpen = readLongBracketOpen(source, i);
        if (longOpen) {
          state = "long-string";
          longClose = longOpen.close;
          out += source.slice(i, i + longOpen.length);
          i += longOpen.length;
          continue;
        }
      }

      out += ch;
      i++;
      continue;
    }

    if (state === "single" || state === "double") {
      const quote = state === "single" ? "'" : '"';
      if (ch === "\\" && i + 1 < source.length) {
        out += source.slice(i, i + 2);
        i += 2;
        continue;
      }
      out += ch;
      i++;
      if (ch === quote) {
        state = "normal";
      }
      continue;
    }

    if (state === "long-string") {
      if (longClose && source.startsWith(longClose, i)) {
        out += longClose;
        i += longClose.length;
        state = "normal";
        continue;
      }
      out += ch;
      i++;
      continue;
    }

    if (state === "line-comment") {
      if (ch === "\r" && source[i + 1] === "\n") {
        out += "\r\n";
        i += 2;
        state = "normal";
        continue;
      }
      if (ch === "\n" || ch === "\r") {
        out += ch;
        i++;
        state = "normal";
        continue;
      }
      i++;
      continue;
    }

    if (state === "block-comment") {
      if (longClose && source.startsWith(longClose, i)) {
        i += longClose.length;
        state = "normal";
        continue;
      }
      if (ch === "\r" && source[i + 1] === "\n") {
        out += "\r\n";
        i += 2;
        continue;
      }
      if (ch === "\n" || ch === "\r") {
        out += ch;
        i++;
        continue;
      }
      i++;
      continue;
    }
  }

  return out;
}


// unique key for an include based on file path and overrides
// used for pragma once and cycle detection
function makeIncludeKey(filePath: string, overrides: Record<string, LuaPreprocessorValue>): string {
  const keys = Object.keys(overrides).sort();
  if (keys.length === 0) {
    return filePath;
  }
  const serialized = keys.map((key) => `${key}=${String(overrides[key])}`).join(";");
  return `${filePath}::${serialized}`;
}

function formatError(filePath: string, lineNumber: number, message: string): string {
  return `[LuaPreprocessor] ${filePath}:${lineNumber} ${message}`;
}

type MacroHeader = {
  name: string;
  invocationStyle: MacroInvocationStyle;
  params: string[];
  inlineBody?: string;
};

function parseMacroHeader(rest: string, filePath: string, lineNumber: number): MacroHeader {
  const sanitized = stripLuaCommentsPreserveNewlines(rest).trim();
  // name(params...) => inlineBody
  const headerMatch = sanitized.match(/^([A-Za-z_][A-Za-z0-9_]*)(\s*\(([^)]*)\))?\s*(?:=>\s*(.*))?$/);
  if (!headerMatch) {
    throw new Error(formatError(filePath, lineNumber, `Invalid --#macro syntax: ${rest}`));
  }
  const name = headerMatch[1];
  const invocationStyle: MacroInvocationStyle = headerMatch[2] === undefined ? "object" : "function";
  const paramList = headerMatch[3];
  const inlineBody = headerMatch[4];
  const params = paramList
    ? paramList
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
    : [];
  const sanitizedInlineBody =
    inlineBody !== undefined ? stripLuaCommentsPreserveNewlines(inlineBody).trim() : undefined;
  return {
    name,
    invocationStyle,
    params,
    inlineBody: sanitizedInlineBody,
  };
}

function createMacroDefinition(
  header: MacroHeader,
  body: string,
  sourceFile: string,
  lineNumber: number,
): MacroDefinition {
  const parsedBody = parseMacroBody(body, sourceFile, lineNumber);
  if (header.invocationStyle === "object" && parsedBody.kind !== "expression") {
    throw new Error(
      formatError(sourceFile, lineNumber, `Object-like macro ${header.name} must have exactly one Lua expression`),
    );
  }
  return {
    name: header.name,
    invocationStyle: header.invocationStyle,
    params: header.params,
    body,
    bodyKind: parsedBody.kind,
    bodyAst: parsedBody.ast,
    bodyRangeOffset: parsedBody.rangeOffset,
    sourceFile,
    lineNumber,
  };
}

type ParsedMacroBody = {
  kind: MacroBodyKind;
  ast: luaparse.Node | null;
  rangeOffset: number;
};

function parseMacroBody(body: string, filePath: string, lineNumber: number): ParsedMacroBody {
  if (body.trim().length === 0) {
    return { kind: "empty", ast: null, rangeOffset: 0 };
  }

  const expressionPrefix = "return ";
  try {
    const expressionChunk = parseLuaChunkWithRanges(expressionPrefix + body);
    if (
      expressionChunk.body.length === 1
      && expressionChunk.body[0].type === "ReturnStatement"
      && expressionChunk.body[0].arguments.length === 1
    ) {
      return {
        kind: "expression",
        ast: expressionChunk.body[0].arguments[0],
        rangeOffset: expressionPrefix.length,
      };
    }
  } catch {
    // A statement list is the other supported non-empty body form.
  }

  try {
    return { kind: "statements", ast: parseLuaChunkWithRanges(body), rangeOffset: 0 };
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(formatError(filePath, lineNumber, `Failed to parse macro body: ${message}`));
  }
}

function parseLuaChunkWithRanges(code: string): luaparse.Chunk {
  return luaparse.parse(code, {
    luaVersion: "5.3",
    comments: true,
    locations: true,
    ranges: true,
  });
}

function readMacroBody(
  lines: string[],
  startIndex: number,
  filePath: string,
  lineNumber: number,
): { body: string; endIndex: number } {
  const bodyLines: string[] = [];
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    // check for --#endmacro
    const match = line.match(/^\s*--#\s*(\w+)\s*(.*)$/);
    if (match) {
      if (match[1] === "endmacro") {
        return { body: bodyLines.join("\n"), endIndex: i };
      }
      if (match[1] === "macro") {
        throw new Error(formatError(filePath, lineNumber, `Nested --#macro is not supported`));
      }
    }
    bodyLines.push(line);
  }

  throw new Error(formatError(filePath, lineNumber, `Unclosed --#macro block`));
}

function expandMacros(
  result: ProcessResult,
  filePath: string,
  parentScope?: TraceScope,
): ProcessResult {
  return profileSync(
    parentScope,
    "Expand Lua macros",
    {
      category: "Lua preprocessing",
      args: {
        inputCharacters: result.code.length,
        inputSourceMapSegments: result.map.getSegments().length,
        macroDefinitions: result.macroDefinitions.length,
      },
    },
    (scope) => {
      if (result.macroDefinitions.length === 0) {
        scope?.setArgs({ passesAttempted: 0, expansionPasses: 0, replacements: 0 });
        return result;
      }

      let current = result;
      let passesAttempted = 0;
      let expansionPasses = 0;
      let replacementCount = 0;
      const maxPasses = 25;
      for (let pass = 0; pass < maxPasses; pass++) {
        const passResult = profileSync(
          scope,
          "Lua macro expansion pass",
          {
            category: "Lua preprocessing",
            args: {
              pass: pass + 1,
              inputCharacters: current.code.length,
              inputSourceMapSegments: current.map.getSegments().length,
            },
          },
          (passScope) => {
            const expanded = applyMacroPass(current, filePath, passScope);
            passScope?.setArgs({
              changed: expanded.changed,
              replacements: expanded.replacementCount,
              outputCharacters: expanded.code.length,
              outputSourceMapSegments: expanded.map.getSegments().length,
            });
            return expanded;
          },
        );
        passesAttempted++;
        replacementCount += passResult.replacementCount;
        if (!passResult.changed) {
          scope?.setArgs({
            passesAttempted,
            expansionPasses,
            replacements: replacementCount,
            outputCharacters: current.code.length,
            outputSourceMapSegments: current.map.getSegments().length,
          });
          return current;
        }
        expansionPasses++;
        current = {
          code: passResult.code,
          map: passResult.map,
          macroDefinitions: passResult.macroDefinitions,
        };
      }

      scope?.setArgs({
        passesAttempted,
        expansionPasses,
        replacements: replacementCount,
        outputCharacters: current.code.length,
        outputSourceMapSegments: current.map.getSegments().length,
      });
      throw new Error(formatError(filePath, 1, `Macro expansion exceeded ${maxPasses} passes (possible recursion)`));
    }
  );
}

function applyMacroPass(
  result: ProcessResult,
  filePath: string,
  parentScope?: TraceScope,
): ProcessResult & { changed: boolean; replacementCount: number } {
  const chunk = profileSync(
    parentScope,
    "Parse Lua for macro expansion",
    {
      category: "Lua preprocessing",
      args: { inputCharacters: result.code.length },
    },
    () => parseLuaForMacroExpansion(result.code, filePath),
  );
  const replacements: Array<{ start: number; end: number; text: string }> = [];
  let identifierNodes = 0;
  let callExpressionNodes = 0;
  let definitionLookups = 0;

  const filtered = profileSync(
    parentScope,
    "Find Lua macro expansions",
    {
      category: "Lua preprocessing",
      args: { macroDefinitions: result.macroDefinitions.length },
    },
    (scope) => {
      walkLuaAst(chunk, (node, parent) => {
        if (node.type === "Identifier") {
          identifierNodes++;
          if (isIdentifierKeyPosition(node, parent)) {
            return;
          }
          const range = getRange(node, filePath);
          definitionLookups++;
          const macroDef = findMacroDefinitionAtOffset(result.macroDefinitions, node.name, range[0]);
          if (!macroDef || macroDef.invocationStyle !== "object") {
            return;
          }
          replacements.push({
            start: range[0],
            end: range[1],
            text: expandMacroBody(macroDef, []),
          });
          return;
        }

        if (node.type !== "CallExpression") {
          return;
        }
        callExpressionNodes++;
        const callNode = node as luaparse.CallExpression;
        if (callNode.base.type !== "Identifier") {
          return;
        }
        const range = getRange(callNode, filePath);
        definitionLookups++;
        const macroDef = findMacroDefinitionAtOffset(result.macroDefinitions, callNode.base.name, range[0]);
        if (!macroDef || macroDef.invocationStyle !== "function") {
          return;
        }

        const lineNumber = getLineNumber(callNode, 1);
        if (macroDef.bodyKind !== "expression" && parent?.type !== "CallStatement") {
          const bodyLabel = macroDef.bodyKind === "empty" ? "Empty" : "Statement-list";
          throw new Error(
            formatError(
              filePath,
              lineNumber,
              `${bodyLabel} macro ${macroDef.name} can only be used as a standalone call statement`,
            ),
          );
        }
        const args = callNode.arguments || [];
        if (args.length !== macroDef.params.length) {
          throw new Error(
            formatError(
              filePath,
              lineNumber,
              `Macro ${macroDef.name} expects ${macroDef.params.length} args but got ${args.length}`,
            ),
          );
        }

        const argTexts = args.map((arg) =>
          stripLuaCommentsPreserveNewlines(sliceRange(result.code, getRange(arg, filePath))),
        );
        const expanded = expandMacroBody(macroDef, argTexts);
        replacements.push({ start: range[0], end: range[1], text: expanded });
      });

      const sortedByStart = [...replacements].sort((a, b) => a.start - b.start || b.end - a.end);

      // filter out nested replacements; only keep outermost
      // this prevents overlapping edits
      const nonOverlapping: Array<{ start: number; end: number; text: string }> = [];
      let currentOuter: { start: number; end: number; text: string } | null = null;
      for (const rep of sortedByStart) {
        if (currentOuter && rep.start >= currentOuter.start && rep.end <= currentOuter.end) {
          continue;
        }
        nonOverlapping.push(rep);
        currentOuter = rep;
      }
      scope?.setArgs({
        identifierNodes,
        callExpressionNodes,
        definitionLookups,
        replacementsFound: replacements.length,
        replacementsApplied: nonOverlapping.length,
      });
      return nonOverlapping;
    },
  );

  if (filtered.length === 0) {
    return { ...result, changed: false, replacementCount: 0 };
  }

  const sorted = filtered.sort((a, b) => b.start - a.start);
  const updated = applyReplacementsWithMap(result, sorted, filePath, parentScope);
  return { ...updated, changed: true, replacementCount: sorted.length };
}

function parseLuaForMacroExpansion(code: string, filePath: string): luaparse.Chunk {
  try {
    return parseLuaChunkWithRanges(code);
  } catch (error) {
    const errorWithLine = error as { line?: unknown };
    const lineNumber = typeof errorWithLine.line === "number" ? errorWithLine.line : 1;
    const message = getErrorMessage(error);
    throw new Error(formatError(filePath, lineNumber, `Failed to parse Lua while expanding macros: ${message}`));
  }
}

function findMacroDefinitionAtOffset(
  events: MacroDefinitionEvent[],
  name: string,
  invocationOffset: number,
): MacroDefinition | undefined {
  let found: MacroDefinition | undefined;
  for (const event of events) {
    if (event.offset > invocationOffset) {
      break;
    }
    if (event.definition.name === name) {
      found = event.definition;
    }
  }
  return found;
}

function expandMacroBody(
  macro: MacroDefinition,
  argTexts: string[],
): string {
  const wrappedBody = wrapMacroBody(macro.body);
  if (wrappedBody.length === 0) {
    // empty macro bodies should be explicitly supported for things like ASSERT or NOP-like macros.
    return "";
  }

  if (macro.params.length === 0) {
    return wrappedBody;
  }

  if (!macro.bodyAst) {
    throw new Error(formatError(macro.sourceFile, macro.lineNumber, `Macro ${macro.name} has no parsed body`));
  }
  const replacements: Array<{ start: number; end: number; text: string }> = [];

  walkLuaAst(macro.bodyAst, (node, parent) => {
    if (node.type !== "Identifier") {
      return;
    }
    if (isIdentifierKeyPosition(node, parent)) {
      return;
    }
    const index = macro.params.indexOf(node.name);
    if (index < 0) {
      return;
    }
    const range = getRange(node, macro.sourceFile);
    replacements.push({
      start: range[0] - macro.bodyRangeOffset,
      end: range[1] - macro.bodyRangeOffset,
      // #14 we don't need overly aggressive parens, but here's where you'd put it if you wanted to (also see other #14 instances)
      text: `${argTexts[index]}`,
    });
  });

  if (replacements.length === 0) {
    return wrappedBody;
  }

  const sorted = replacements.sort((a, b) => b.start - a.start);
  let out = macro.body;
  for (const rep of sorted) {
    out = out.slice(0, rep.start) + rep.text + out.slice(rep.end);
  }

  return wrapMacroBody(out);
}

function wrapMacroBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    return "";
  }
  // #14 we don't need overly aggressive parens, but here's where you'd put it if you wanted to (also see other #14 instances)
  return `${trimmed}`;
}

async function expandPreprocessorCalls(
  project: TicbuildProjectCore,
  result: ProcessResult,
  filePath: string,
  state: PreprocessorState,
  quietParseFailures: boolean,
  parentScope?: TraceScope,
): Promise<ProcessResult> {
  return profileAsync(
    parentScope,
    "Expand Lua preprocessor calls",
    {
      category: "Lua preprocessing",
      args: {
        inputCharacters: result.code.length,
        inputSourceMapSegments: result.map.getSegments().length,
      },
    },
    (scope) => expandPreprocessorCallsCore(project, result, filePath, state, quietParseFailures, scope),
  );
}

async function expandPreprocessorCallsCore(
  project: TicbuildProjectCore,
  result: ProcessResult,
  filePath: string,
  state: PreprocessorState,
  quietParseFailures: boolean,
  parentScope?: TraceScope,
): Promise<ProcessResult> {
  const chunk = profileSync(
    parentScope,
    "Parse Lua for preprocessor calls",
    {
      category: "Lua preprocessing",
      args: { inputCharacters: result.code.length },
    },
    () => (quietParseFailures ? parseLuaQuiet(result.code) : parseLua(result.code))!,
  );
  const replacements: Array<{ start: number; end: number; text: string }> = [];
  const tasks: Promise<void>[] = [];
  let callExpressionNodes = 0;
  let expandCalls = 0;
  let importCalls = 0;
  let encodeCalls = 0;

  const addReplacement = (node: luaparse.Node, text: string) => {
    const range = getRange(node, filePath);
    replacements.push({ start: range[0], end: range[1], text });
  };

  const getStringLiteralArg = (
    callNode: luaparse.CallExpression,
    index: number,
    fnName: string,
  ): { value: string; lineNumber: number } => {
    const lineNumber = getLineNumber(callNode, 1);
    const arg = callNode.arguments[index];
    if (!arg || arg.type !== "StringLiteral") {
      throw new Error(formatError(filePath, lineNumber, `${fnName} argument ${index + 1} must be a string literal`));
    }
    const rawValue = stringValue(arg);
    if (rawValue === null) {
      throw new Error(formatError(filePath, lineNumber, `Invalid string literal in ${fnName}`));
    }
    return { value: rawValue, lineNumber };
  };

  const getStringOrNilArg = (
    callNode: luaparse.CallExpression,
    index: number,
    fnName: string,
  ): { value: string | null; lineNumber: number } => {
    const lineNumber = getLineNumber(callNode, 1);
    const arg = callNode.arguments[index];
    if (!arg) {
      throw new Error(formatError(filePath, lineNumber, `${fnName} argument ${index + 1} is missing`));
    }
    if (arg.type === "NilLiteral") {
      return { value: null, lineNumber };
    }
    if (arg.type !== "StringLiteral") {
      throw new Error(formatError(filePath, lineNumber, `${fnName} argument ${index + 1} must be a string literal`));
    }
    const rawValue = stringValue(arg);
    if (rawValue === null) {
      throw new Error(formatError(filePath, lineNumber, `Invalid string literal in ${fnName}`));
    }
    return { value: rawValue, lineNumber };
  };

  const resolveImportDefinition = (importName: string, lineNumber: number) => {
    const importDef = project.manifest.imports.find((imp) => imp.name === importName);
    if (!importDef) {
      throw new Error(formatError(filePath, lineNumber, `Import not found: ${importName}`));
    }
    return importDef;
  };

  const visitCall = (node: luaparse.Node) => {
    if (node.type !== "CallExpression") {
      return;
    }
    callExpressionNodes++;
    const callNode = node as luaparse.CallExpression;
    if (callNode.base.type !== "Identifier") {
      return;
    }

    const fnName = callNode.base.name;
    if (fnName === "__EXPAND") {
      expandCalls++;
      tasks.push(
        (async () => {
          const lineNumber = getLineNumber(callNode, 1);
          if (callNode.arguments.length !== 1) {
            throw new Error(formatError(filePath, lineNumber, `__EXPAND expects exactly one argument`));
          }
          const arg = getStringLiteralArg(callNode, 0, "__EXPAND");
          const substituted = project.substituteVariables(arg.value);
          const literal = toLuaStringLiteral(substituted);
          addReplacement(callNode, literal);
        })(),
      );
      return;
    }

    if (fnName === "__IMPORT") {
      importCalls++;
      tasks.push(
        (async () => {
          const lineNumber = getLineNumber(callNode, 1);
          if (callNode.arguments.length !== 2) {
            throw new Error(formatError(filePath, lineNumber, `__IMPORT expects exactly two arguments`));
          }

          const pipelineArg = getStringLiteralArg(callNode, 0, "__IMPORT");
          const importArgRaw = getStringLiteralArg(callNode, 1, "__IMPORT").value;

          const importSpec = project.substituteVariables(importArgRaw);
          if (!importSpec.startsWith("import:")) {
            throw new Error(formatError(filePath, lineNumber, `__IMPORT requires an import reference`));
          }
          const ref = parseImportReference(importSpec);

          const importDef = resolveImportDefinition(ref.importName, lineNumber);
          const pipelineSpec = project.substituteVariables(pipelineArg.value);
          const split = splitPipelineSpec(pipelineSpec, true, filePath, lineNumber, formatError);
          const resolvedSourceSpec = normalizeEmptySpec(project.substituteVariables(split.sourceSpecRaw || ""));
          const importSource = await state.resolveImportSource(ref.importName);
          if (!importSource) {
            throw new Error(formatError(filePath, lineNumber, `Import source not found: ${ref.importName}`));
          }

          const bytes = await resolveImportBytes(
            project,
            importDef,
            importSource,
            resolvedSourceSpec,
            ref.chunkSpec,
            (dep) => state.dependencies.add(dep),
            filePath,
            lineNumber,
            formatError,
          );

          const destSpec = project.substituteVariables(split.destSpecRaw);
          const output = encodeBytesWithDestSpec(bytes, destSpec, filePath, lineNumber, formatError);
          addReplacement(callNode, output);
        })(),
      );
      return;
    }

    if (fnName === "__ENCODE") {
      encodeCalls++;
      tasks.push(
        (async () => {
          const lineNumber = getLineNumber(callNode, 1);
          if (callNode.arguments.length !== 2) {
            throw new Error(formatError(filePath, lineNumber, `__ENCODE expects exactly two arguments`));
          }
          const pipelineArg = getStringLiteralArg(callNode, 0, "__ENCODE");
          const valueArg = getStringLiteralArg(callNode, 1, "__ENCODE");

          const pipelineSpec = project.substituteVariables(pipelineArg.value);
          const split = splitPipelineSpec(pipelineSpec, false, filePath, lineNumber, formatError);
          const sourceSpec = project.substituteVariables(split.sourceSpecRaw || "");
          const destSpec = project.substituteVariables(split.destSpecRaw);
          const sourceValue = project.substituteVariables(valueArg.value);

          // don't support this, because it conflicts with a literal string that starts with "import:"
          if (sourceValue.startsWith("import:")) {
            throw new Error(formatError(filePath, lineNumber, `__ENCODE does not accept import references; use __IMPORT`));
          }

          const bytes = encodeLiteralToBytes(sourceSpec, sourceValue, filePath, lineNumber, formatError);
          const output = encodeBytesWithDestSpec(bytes, destSpec, filePath, lineNumber, formatError);
          addReplacement(callNode, output);
        })(),
      );
    }
  };

  profileSync(
    parentScope,
    "Find Lua preprocessor calls",
    { category: "Lua preprocessing" },
    (scope) => {
      walkLuaAst(chunk, visitCall);
      scope?.setArgs({
        callExpressionNodes,
        preprocessorCalls: expandCalls + importCalls + encodeCalls,
        expandCalls,
        importCalls,
        encodeCalls,
      });
    },
  );

  if (tasks.length === 0) {
    parentScope?.setArgs({
      callExpressionNodes,
      preprocessorCalls: 0,
      expandCalls: 0,
      importCalls: 0,
      encodeCalls: 0,
      replacements: 0,
      outputCharacters: result.code.length,
      outputSourceMapSegments: result.map.getSegments().length,
    });
    return result;
  }

  await profileAsync(
    parentScope,
    "Complete Lua preprocessor calls",
    {
      category: "Lua preprocessing",
      args: { preprocessorCalls: tasks.length },
    },
    async (scope) => {
      await Promise.all(tasks);
      scope?.setArgs({ replacements: replacements.length });
    },
  );

  if (replacements.length === 0) {
    parentScope?.setArgs({
      callExpressionNodes,
      preprocessorCalls: expandCalls + importCalls + encodeCalls,
      expandCalls,
      importCalls,
      encodeCalls,
      replacements: 0,
      outputCharacters: result.code.length,
      outputSourceMapSegments: result.map.getSegments().length,
    });
    return result;
  }

  const sorted = replacements.sort((a, b) => b.start - a.start);
  const updated = applyReplacementsWithMap(result, sorted, filePath, parentScope);
  parentScope?.setArgs({
    callExpressionNodes,
    preprocessorCalls: expandCalls + importCalls + encodeCalls,
    expandCalls,
    importCalls,
    encodeCalls,
    replacements: replacements.length,
    outputCharacters: updated.code.length,
    outputSourceMapSegments: updated.map.getSegments().length,
  });
  return updated;
}

function applyReplacementsWithMap(
  result: ProcessResult,
  replacements: Array<{ start: number; end: number; text: string }>,
  filePath: string,
  parentScope?: TraceScope,
): ProcessResult {
  return profileSync(
    parentScope,
    "Apply Lua replacements",
    {
      category: "Lua preprocessing",
      args: {
        replacements: replacements.length,
        inputCharacters: result.code.length,
        inputSourceMapSegments: result.map.getSegments().length,
        macroDefinitions: result.macroDefinitions.length,
        replacedCharacters: replacements.reduce((total, rep) => total + rep.end - rep.start, 0),
        insertedCharacters: replacements.reduce((total, rep) => total + rep.text.length, 0),
      },
    },
    (scope) => {
      // original implementation was inefficient:
      // for each replacement,
      // {
      //   perform the replacement via (slice begin + text + slice end)
      //   update the source map via mapOffset and result.map.spliceRange()
      //   -> spliceRange visits every segment to update offsets
      //      so every segment is just getting pushed and pushed over and over again.
      //      more efficient to build a map of all replacements, and apply in one sweep.
      // }

      const ascending = [...replacements].sort((a, b) => a.start - b.start || a.end - b.end);
      // build list of origins
      const mappedReplacements = ascending.map((replacement) => ({
        start: replacement.start,
        end: replacement.end,
        newLength: replacement.text.length,
        origin: result.map.mapOffset(replacement.start, "right") ?? { file: filePath, offset: 0 },
      }));

      // apply replacements in one go, building the output string in a stream of chunks
      const outputParts: string[] = [];
      let sourceCursor = 0;
      for (const replacement of ascending) {
        outputParts.push(result.code.slice(sourceCursor, replacement.start), replacement.text);
        sourceCursor = replacement.end;
      }
      outputParts.push(result.code.slice(sourceCursor));
      const out = outputParts.join("");

      // update the map also in one go using all the mapped replacements
      result.map.spliceRanges(mappedReplacements);

      // update macro definition offsets based on the replacements
      const descending = [...ascending].reverse();
      const macroDefinitions = result.macroDefinitions.map((event) => {
        let offset = event.offset;
        for (const replacement of descending) {
          offset = mapOffsetThroughReplacement(
            offset,
            replacement.start,
            replacement.end,
            replacement.text.length,
          );
        }
        return {
          offset,
          definition: event.definition,
        };
      });
      scope?.setArgs({
        outputCharacters: out.length,
        outputSourceMapSegments: result.map.getSegments().length,
      });
      return { code: out, map: result.map, macroDefinitions };
    },
  );
}

function mapOffsetThroughReplacement(offset: number, start: number, end: number, replacementLength: number): number {
  if (offset <= start) {
    return offset;
  }
  if (offset >= end) {
    return offset + replacementLength - (end - start);
  }
  return start + replacementLength;
}

type LineInfo = {
  text: string;
  startOffset: number;
  endOffset: number;
};

function splitLinesWithOffsets(source: string): LineInfo[] {
  const lines: LineInfo[] = [];
  let i = 0;
  if (source.length === 0) {
    return [{ text: "", startOffset: 0, endOffset: 0 }];
  }
  while (i < source.length) {
    const startOffset = i;
    while (i < source.length && source[i] !== "\n" && source[i] !== "\r") {
      i++;
    }
    const endOffset = i;
    if (i < source.length && source[i] === "\r" && source[i + 1] === "\n") {
      i += 2;
    } else if (i < source.length) {
      i++;
    }
    lines.push({
      text: source.slice(startOffset, endOffset),
      startOffset,
      endOffset,
    });
  }
  if (source.endsWith("\n") || source.endsWith("\r")) {
    lines.push({ text: "", startOffset: source.length, endOffset: source.length });
  }
  return lines;
}

function findMacroNameOffset(line: string, lineStartOffset: number, name: string): number {
  const index = line.indexOf(name);
  if (index < 0) {
    return lineStartOffset;
  }
  return lineStartOffset + index;
}

function getRange(node: luaparse.Node, filePath: string): [number, number] {
  const withRange = node as { range?: [number, number] };
  if (!withRange.range) {
    throw new Error(formatError(filePath, 1, `Missing range for Lua node`));
  }
  return withRange.range;
}

function getLineNumber(node: luaparse.Node, fallback: number): number {
  const withLoc = node as { loc?: { start: { line: number } } };
  return withLoc.loc?.start.line ?? fallback;
}

function sliceRange(source: string, range: [number, number]): string {
  return source.slice(range[0], range[1]);
}

function walkLuaAst(
  node: unknown,
  visit: (node: luaparse.Node, parent: luaparse.Node | null) => void,
  parent: luaparse.Node | null = null,
): void {
  if (!isLuaNode(node)) {
    return;
  }
  visit(node, parent);

  const record = node as unknown as Record<string, unknown>;
  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        walkLuaAst(item, visit, node);
      }
    } else if (isLuaNode(value)) {
      walkLuaAst(value, visit, node);
    }
  }
}

function isLuaNode(value: unknown): value is luaparse.Node {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as { type?: unknown };
  return typeof record.type === "string";
}

function isIdentifierKeyPosition(node: luaparse.Identifier, parent: luaparse.Node | null): boolean {
  if (!parent) {
    return false;
  }
  if (parent.type === "TableKeyString") {
    const tableKey = parent as luaparse.TableKeyString;
    return tableKey.key === node;
  }
  if (parent.type === "MemberExpression") {
    const member = parent as luaparse.MemberExpression;
    return member.identifier === node;
  }
  return false;
}
