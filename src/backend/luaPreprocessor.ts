import * as luaparse from "luaparse";
import * as path from "node:path";
import { readBinaryFileAsync, readTextFileAsync, resolveFileWithSearchPaths } from "../utils/fileSystem";
import { toLuaStringLiteral } from "../utils/lua/lua_fundamentals";
import { stringValue } from "../utils/lua/lua_utils";
import { parseTic80Cart } from "../utils/tic80/cartLoader";
import { Tic80CartChunkTypeKey } from "../utils/tic80/tic80";
import { parseImportReference } from "./importUtils";
import { kImportKind } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";
import { parseLua } from "../utils/lua/lua_processor";
import * as cons from "../utils/console";
import {
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

export type LuaPreprocessorValue = string | number | boolean;

export type LuaPreprocessResult = {
  code: string;
  dependencies: string[];
  sourceMap: LuaPreprocessorSourceMap;
  preprocessorSymbols: PreprocessorSymbol[];
};

export type PreprocessorSymbol = {
  name: string;
  kind: "macro";
  sourceFile: string;
  offset: number;
};

type PreprocessorState = {
  defines: Map<string, LuaPreprocessorValue>;
  dependencies: Set<string>;
  pragmaOnceKeys: Set<string>;
  includeStack: string[];
  macros: Map<string, MacroDefinition>;
  macroSymbols: PreprocessorSymbol[];
};

type MacroDefinition = {
  name: string;
  params: string[];
  body: string;
  sourceFile: string;
  lineNumber: number;
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
): Promise<LuaPreprocessResult> {
  const state: PreprocessorState = {
    defines: new Map<string, LuaPreprocessorValue>(),
    dependencies: new Set<string>(),
    pragmaOnceKeys: new Set<string>(),
    includeStack: [],
    macros: new Map<string, MacroDefinition>(),
    macroSymbols: [],
  };

  const includeKey = makeIncludeKey(filePath, {});
  const rawResult = await processSource(project, source, filePath, includeKey, state, {});
  const expandedResult = expandMacros(project, rawResult, state.macros, filePath);
  const finalResult = await expandPreprocessorCalls(project, expandedResult, filePath, state);

  return {
    code: finalResult.code,
    dependencies: Array.from(state.dependencies.values()),
    sourceMap: finalResult.map.toSourceMap(finalResult.code),
    preprocessorSymbols: state.macroSymbols,
  };
}

type ProcessResult = {
  code: string;
  map: SourceMapBuilder;
};

async function processSource(
  project: TicbuildProjectCore,
  source: string,
  filePath: string,
  includeKey: string,
  state: PreprocessorState,
  inputOverrides: Record<string, LuaPreprocessorValue>,
  trackDependency: boolean = true,
): Promise<ProcessResult> {
  if (state.pragmaOnceKeys.has(includeKey)) {
    return { code: "", map: new SourceMapBuilder() };
  }
  if (state.includeStack.includes(includeKey)) {
    const cycle = [...state.includeStack, includeKey].join(" -> ");
    throw new Error(`Lua preprocessor include cycle detected: ${cycle}`);
  }

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
  let output = "";
  let lastEmittedOrigin: { file: string; offset: number } | null = null;

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

    const directiveMatch = line.match(/^\s*--#\s*(\w+)\s*(.*)$/);
    if (!directiveMatch) {
      if (isActive()) {
        if (output.length > 0) {
          output += "\n";
          const newlineOrigin = lastEmittedOrigin ?? { file: filePath, offset: lineInfo.startOffset };
          builder.appendOriginal("\n", newlineOrigin.file, newlineOrigin.offset);
        }
        output += line;
        builder.appendOriginal(line, filePath, lineInfo.startOffset);
        lastEmittedOrigin = { file: filePath, offset: lineInfo.endOffset };
      }
      continue;
    }

    const directive = directiveMatch[1];
    const rest = directiveMatch[2] || "";

    switch (directive) {
      case "macro": {
        const macroHeader = parseMacroHeader(rest, filePath, lineNumber);
        const nameOffset = findMacroNameOffset(line, lineInfo.startOffset, macroHeader.name);
        if (macroHeader.inlineBody !== undefined) {
          if (isActive()) {
            state.macros.set(macroHeader.name, {
              name: macroHeader.name,
              params: macroHeader.params,
              body: macroHeader.inlineBody,
              sourceFile: filePath,
              lineNumber,
            });
            state.macroSymbols.push({
              name: macroHeader.name,
              kind: "macro",
              sourceFile: filePath,
              offset: nameOffset,
            });
          }
          break;
        }

        const bodyResult = readMacroBody(lineTexts, i + 1, filePath, lineNumber);
        i = bodyResult.endIndex;
        if (isActive()) {
          const strippedBody = stripLuaCommentsPreserveNewlines(bodyResult.body);
          state.macros.set(macroHeader.name, {
            name: macroHeader.name,
            params: macroHeader.params,
            body: strippedBody,
            sourceFile: filePath,
            lineNumber,
          });
          state.macroSymbols.push({
            name: macroHeader.name,
            kind: "macro",
            sourceFile: filePath,
            offset: nameOffset,
          });
        }
        break;
      }
      case "endmacro": {
        throw new Error(formatError(filePath, lineNumber, `--#endmacro without matching --#macro`));
      }
      case "define": {
        if (!isActive()) {
          break;
        }
        const defineMatch = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:\s+(.*))?$/);
        if (!defineMatch) {
          throw new Error(formatError(filePath, lineNumber, `Invalid --#define syntax: ${line}`));
        }
        const name = defineMatch[1];
        const expr = defineMatch[2];
        if (!expr || expr.trim() === "") {
          localDefines.set(name, true);
        } else {
          const value = evaluateExpression(
            parseExpression(expr, filePath, lineNumber),
            localDefines,
            filePath,
            lineNumber,
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
          throw new Error(formatError(filePath, lineNumber, `Invalid --#undef syntax: ${line}`));
        }
        localDefines.delete(undefMatch[1]);
        break;
      }
      case "if": {
        const parentActive = isActive();
        let conditionMet = false;
        if (parentActive) {
          if (!rest || rest.trim() === "") {
            throw new Error(formatError(filePath, lineNumber, `Missing expression in --#if`));
          }
          const exprValue = evaluateExpression(
            parseExpression(rest, filePath, lineNumber),
            localDefines,
            filePath,
            lineNumber,
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
      case "else": {
        if (conditionalStack.length === 0) {
          throw new Error(formatError(filePath, lineNumber, `--#else without matching --#if`));
        }
        const top = conditionalStack[conditionalStack.length - 1];
        if (top.hasElse) {
          throw new Error(formatError(filePath, lineNumber, `Duplicate --#else for same --#if`));
        }
        top.hasElse = true;
        top.active = top.parentActive && !top.conditionMet;
        break;
      }
      case "endif": {
        if (conditionalStack.length === 0) {
          throw new Error(formatError(filePath, lineNumber, `--#endif without matching --#if`));
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
          throw new Error(formatError(filePath, lineNumber, `Invalid --#pragma syntax: ${line}`));
        }
        if (pragmaMatch[1] === "once") {
          state.pragmaOnceKeys.add(includeKey);
        } else {
          throw new Error(formatError(filePath, lineNumber, `Unknown pragma: ${pragmaMatch[1]}`));
        }
        break;
      }
      case "include": {
        if (!isActive()) {
          break;
        }
        const includeMatch = rest.trim().match(/^"([^"]+)"(.*)$/);
        if (!includeMatch) {
          throw new Error(formatError(filePath, lineNumber, `Invalid --#include syntax: ${line}`));
        }
        const includeTarget = includeMatch[1];
        const remainder = includeMatch[2] || "";
        const overrides = parseWithOverrides(remainder, localDefines, filePath, lineNumber);

        const included = await resolveInclude(project, includeTarget, filePath, overrides, state, lineNumber);
        if (included.code) {
          if (output.length > 0) {
            output += "\n";
            const newlineOrigin = lastEmittedOrigin ?? { file: filePath, offset: 0 };
            builder.appendOriginal("\n", newlineOrigin.file, newlineOrigin.offset);
          }
          output += included.code;
          builder.appendMap(included.map);
          const endOrigin = included.map.mapOffset(included.code.length);
          if (endOrigin) {
            lastEmittedOrigin = endOrigin;
          }
        }
        break;
      }
      case "error": {
        if (!isActive()) {
          break;
        }
        const message = rest.trim();
        if (!message) {
          throw new Error(formatError(filePath, lineNumber, `--#error encountered`));
        }
        throw new Error(formatError(filePath, lineNumber, message));
      }
      case "warning": {
        if (!isActive()) {
          break;
        }
        const message = rest.trim();
        if (!message) {
          cons.warning(formatError(filePath, lineNumber, `--#warning encountered`));
          break;
        }
        cons.warning(formatError(filePath, lineNumber, message));
        break;
      }
      default:
        throw new Error(formatError(filePath, lineNumber, `Unknown directive: --#${directive}`));
    }
  }

  if (conditionalStack.length > 0) {
    throw new Error(formatError(filePath, lines.length, `Unclosed --#if block`));
  }

  state.includeStack.pop();
  return { code: output, map: builder };
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

  const substituted = project.substituteVariables(includeTarget);
  let resolvedPath: string;

  const localFound = resolveFileWithSearchPaths(substituted, path.dirname(fromFile));
  if (localFound) {
    resolvedPath = localFound;
  } else {
    try {
      resolvedPath = project.resolveIncludePath(substituted);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(formatError(fromFile, lineNumber, message));
    }
  }
  const includeKey = makeIncludeKey(resolvedPath, overrides);

  if (state.pragmaOnceKeys.has(includeKey)) {
    return { code: "", map: new SourceMapBuilder() };
  }

  const source = await readTextFileAsync(resolvedPath);
  const included = await processSource(project, source, resolvedPath, includeKey, state, overrides);
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

  if (importDef.kind === kImportKind.key.LuaCode) {
    const resolvedPath = project.resolveImportPath(importDef);
    const includeKey = makeIncludeKey(resolvedPath, overrides);
    if (state.pragmaOnceKeys.has(includeKey)) {
      return { code: "", map: new SourceMapBuilder() };
    }
    const source = await readTextFileAsync(resolvedPath);
    const included = await processSource(project, source, resolvedPath, includeKey, state, overrides);
    return ensureTrailingNewline(included, resolvedPath);
  }

  if (importDef.kind === kImportKind.key.Tic80Cartridge) {
    const resolvedPath = project.resolveImportPath(importDef);
    const data = await readBinaryFileAsync(resolvedPath);
    const cart = parseTic80Cart(data);
    state.dependencies.add(resolvedPath);

    const availableChunks =
      importDef.chunks && importDef.chunks.length > 0 ? importDef.chunks : cart.chunks.map((chunk) => chunk.chunkType);

    const hasCode = availableChunks.includes("CODE");
    if (!hasCode) {
      throw new Error(formatError(resolvedPath, lineNumber, `No CODE chunk found in cart: ${importName}`));
    }

    let selectedChunk: Tic80CartChunkTypeKey = "CODE";
    if (chunkSpec) {
      if (chunkSpec !== "CODE") {
        throw new Error(formatError(resolvedPath, lineNumber, `Only CODE chunk is supported for include`));
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

    const codeChunk = cart.chunks.find((chunk) => chunk.chunkType === selectedChunk);
    if (!codeChunk) {
      throw new Error(formatError(resolvedPath, lineNumber, `Requested chunk ${selectedChunk} not found in cart`));
    }

    const decoder = new TextDecoder("utf-8");
    const source = decoder.decode(codeChunk.data);
    const includeKey = makeIncludeKey(`${includeTarget}:${selectedChunk}`, overrides);
    const included = await processSource(
      project,
      source,
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
  return { code: result.code + "\n", map };
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
    params,
    inlineBody: sanitizedInlineBody,
  };
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
  project: TicbuildProjectCore,
  result: ProcessResult,
  macros: Map<string, MacroDefinition>,
  filePath: string,
): ProcessResult {
  if (macros.size === 0) {
    return result;
  }

  let current = result;
  const maxPasses = 25;
  for (let pass = 0; pass < maxPasses; pass++) {
    const passResult = applyMacroPass(project, current, macros, filePath);
    if (!passResult.changed) {
      return current;
    }
    current = { code: passResult.code, map: passResult.map };
  }

  throw new Error(formatError(filePath, 1, `Macro expansion exceeded ${maxPasses} passes (possible recursion)`));
}

function applyMacroPass(
  project: TicbuildProjectCore,
  result: ProcessResult,
  macros: Map<string, MacroDefinition>,
  filePath: string,
): { code: string; map: SourceMapBuilder; changed: boolean } {
  const chunk = parseLua(result.code)!;
  const replacements: Array<{ start: number; end: number; text: string }> = [];

  walkLuaAst(chunk, (node, parent) => {
    if (node.type !== "CallExpression") {
      return;
    }
    const callNode = node as luaparse.CallExpression;
    if (callNode.base.type !== "Identifier") {
      return;
    }
    const macroDef = macros.get(callNode.base.name);
    if (!macroDef) {
      return;
    }

    const range = getRange(callNode, filePath);
    const lineNumber = getLineNumber(callNode, 1);
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
    const expanded = expandMacroBody(project, macroDef, argTexts, filePath, lineNumber);
    replacements.push({ start: range[0], end: range[1], text: expanded });
  });

  if (replacements.length === 0) {
    return { code: result.code, map: result.map, changed: false };
  }

  const sortedByStart = [...replacements].sort((a, b) => a.start - b.start || b.end - a.end);

  // filter out nested replacements; only keep outermost
  // this prevents overlapping edits
  const filtered: Array<{ start: number; end: number; text: string }> = [];
  let currentOuter: { start: number; end: number; text: string } | null = null;
  for (const rep of sortedByStart) {
    if (currentOuter && rep.start >= currentOuter.start && rep.end <= currentOuter.end) {
      continue;
    }
    filtered.push(rep);
    currentOuter = rep;
  }

  const sorted = filtered.sort((a, b) => b.start - a.start);
  const updated = applyReplacementsWithMap(result, sorted, filePath);
  return { code: updated.code, map: updated.map, changed: true };
}

function expandMacroBody(
  project: TicbuildProjectCore,
  macro: MacroDefinition,
  argTexts: string[],
  filePath: string,
  lineNumber: number,
): string {
  if (macro.params.length === 0) {
    return wrapMacroBody(macro.body);
  }

  const parsed = parseExpressionWithRanges(macro.body, macro.sourceFile, macro.lineNumber);
  const offset = "return ".length;
  const replacements: Array<{ start: number; end: number; text: string }> = [];

  walkLuaAst(parsed, (node, parent) => {
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
      start: range[0] - offset,
      end: range[1] - offset,
      // #14 we don't need overly aggressive parens, but here's where you'd put it if you wanted to (also see other #14 instances)
      text: `${argTexts[index]}`,
    });
  });

  if (replacements.length === 0) {
    return wrapMacroBody(macro.body);
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
): Promise<ProcessResult> {
  const chunk = parseLua(result.code)!;
  const replacements: Array<{ start: number; end: number; text: string }> = [];
  const tasks: Promise<void>[] = [];

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

  walkLuaAst(chunk, (node) => {
    if (node.type !== "CallExpression") {
      return;
    }
    const callNode = node as luaparse.CallExpression;
    if (callNode.base.type !== "Identifier") {
      return;
    }

    const fnName = callNode.base.name;
    if (fnName === "__EXPAND") {
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

          const bytes = await resolveImportBytes(
            project,
            importDef,
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
  });

  if (tasks.length === 0) {
    return result;
  }

  await Promise.all(tasks);

  if (replacements.length === 0) {
    return result;
  }

  const sorted = replacements.sort((a, b) => b.start - a.start);
  return applyReplacementsWithMap(result, sorted, filePath);
}

function applyReplacementsWithMap(
  result: ProcessResult,
  replacements: Array<{ start: number; end: number; text: string }>,
  filePath: string,
): ProcessResult {
  let out = result.code;
  for (const rep of replacements) {
    out = out.slice(0, rep.start) + rep.text + out.slice(rep.end);
    const origin = result.map.mapOffset(rep.start) ?? { file: filePath, offset: 0 };
    result.map.spliceRange(rep.start, rep.end, rep.text.length, origin);
  }
  return { code: out, map: result.map };
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

function parseExpressionWithRanges(body: string, filePath: string, lineNumber: number): luaparse.Node {
  try {
    const chunk = parseLua(`return ${body}`)!;
    if (chunk.body.length === 0 || chunk.body[0].type !== "ReturnStatement") {
      throw new Error("Invalid expression");
    }
    const returnStmt = chunk.body[0] as luaparse.ReturnStatement;
    if (returnStmt.arguments.length !== 1) {
      throw new Error("Expected single expression");
    }
    return returnStmt.arguments[0];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(formatError(filePath, lineNumber, `Failed to parse macro body: ${message}`));
  }
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
  if (parent.type === "TableKey") {
    const tableKey = parent as luaparse.TableKey;
    return tableKey.key === node;
  }
  if (parent.type === "MemberExpression") {
    const member = parent as luaparse.MemberExpression;
    return member.identifier === node;
  }
  return false;
}
