import {
  getScriptErrorFrameLine,
  ScriptErrorFrame,
  ScriptErrorPayload,
} from "../backend/tic80Controller/scriptErrorProtocol";
import { SourceMapOriginalLocation } from "../backend/sourceMapLookup";
import {
  LUA_LANGUAGE_DISPLAY_NAME,
  LUA_LANGUAGE_ID,
  LUA_NATIVE_FRAME_SOURCE,
  LuaFrameWhat,
} from "../utils/lua/lua_debug";

export interface ScriptErrorSourceMapper {
  mapFrame(error: ScriptErrorPayload, frameIndex: number): SourceMapOriginalLocation | undefined;
  mapVariableName?(
    error: ScriptErrorPayload,
    frameIndex: number,
    variableIndex: number,
  ): string | undefined;
}

function frameName(frame: ScriptErrorFrame): string {
  if (frame.name) {
    return frame.name;
  }

  // see: lua_getinfo
  switch (frame.what) {
    case LuaFrameWhat.MainChunk:
      return "<main>";
    case LuaFrameWhat.NativeFunction:
      return "<native>";
    default:
      return "<anonymous>";
  }
}

function runtimeFrameLocation(frame: ScriptErrorFrame): string {
  if (frame.what === LuaFrameWhat.NativeFunction || frame.source === LUA_NATIVE_FRAME_SOURCE) {
    return LUA_NATIVE_FRAME_SOURCE;
  }
  const line = getScriptErrorFrameLine(frame);
  return line ? `${frame.source}:${line}` : frame.source;
}

function renderFrameVariables(
  error: ScriptErrorPayload,
  frameIndex: number,
  sourceMapper?: ScriptErrorSourceMapper,
): string[] {
  const frame = error.frames[frameIndex];
  if (!frame.variablesCaptured) {
    return [];
  }
  if (frame.variables.length === 0 && !frame.variablesTruncated) {
    return ["    variables: (none)"];
  }

  const lines = ["    variables:"];
  for (let variableIndex = 0; variableIndex < frame.variables.length; variableIndex += 1) {
    const variable = frame.variables[variableIndex];
    const displayName = sourceMapper?.mapVariableName?.(error, frameIndex, variableIndex)
      ?? variable.runtimeName;
    const truncation = variable.valueTruncated ? "  (value truncated)" : "";
    lines.push(
      `      ${variable.scope} ${displayName} = ${variable.display}${truncation}`,
    );
  }
  if (frame.variablesTruncated) {
    lines.push("      ... variables truncated by TIC-80");
  }
  return lines;
}

export function renderScriptError(
  error: ScriptErrorPayload,
  sourceMapper?: ScriptErrorSourceMapper,
): string[] {
  const context = error.phase ? ` during ${error.phase}` : "";
  const languageName = error.language === LUA_LANGUAGE_ID
    ? LUA_LANGUAGE_DISPLAY_NAME
    : error.language;
  const lines = [`${languageName} ${error.kind} error${context}: ${error.message}`];

  for (let i = 0; i < error.frames.length; i += 1) {
    const frame = error.frames[i];
    const mapped = sourceMapper?.mapFrame(error, i);
    const location = mapped
      ? `${mapped.filePath}:${mapped.line}:${mapped.column}`
      : runtimeFrameLocation(frame);
    lines.push(`  at ${frameName(frame)} (${location})`);
    lines.push(...renderFrameVariables(error, i, sourceMapper));
  }

  if (error.frames.length === 0 && error.traceback) {
    const tracebackLines = error.traceback.split(/\r?\n/).slice(1).filter((line) => line.length > 0);
    lines.push(...tracebackLines.map((line) => `  ${line.trimStart()}`));
  }
  if (error.framesTruncated) {
    lines.push("  ... stack trace truncated by TIC-80");
  }
  return lines;
}
