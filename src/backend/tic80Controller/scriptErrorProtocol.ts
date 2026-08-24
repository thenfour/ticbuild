import {
  isRecord,
  requireBooleanProperty,
  requireIntegerProperty,
  requireStringProperty,
} from "../../utils/utils";
import { decodeRemotingJsonBinaryLiteral } from "./remotingProtocol";

export const SCRIPT_ERROR_SCHEMA_VERSION = 1 as const;

export interface ScriptErrorFrame {
  source: string;
  name: string;
  nameWhat: string;
  what: string;
  currentLine: number;
  lineDefined: number;
  lastLineDefined: number;
  parameterCount: number;
  upvalueCount: number;
  variadic: boolean;
  tailCall: boolean;
}

export interface ScriptErrorPayload {
  schemaVersion: typeof SCRIPT_ERROR_SCHEMA_VERSION;
  errorId: number;
  language: string;
  kind: string;
  phase: string;
  message: string;
  traceback: string;
  codeHash: string;
  framesTruncated: boolean;
  frames: ScriptErrorFrame[];
}

function parseFrame(value: unknown, frameIndex: number): ScriptErrorFrame {
  const objectName = `script_error frame[${frameIndex}]`;
  if (!isRecord(value)) {
    throw new Error(`${objectName} must be an object`);
  }
  return {
    source: requireStringProperty(value, "source", objectName),
    name: requireStringProperty(value, "name", objectName),
    nameWhat: requireStringProperty(value, "nameWhat", objectName),
    what: requireStringProperty(value, "what", objectName),
    currentLine: requireIntegerProperty(value, "currentLine", objectName),
    lineDefined: requireIntegerProperty(value, "lineDefined", objectName),
    lastLineDefined: requireIntegerProperty(value, "lastLineDefined", objectName),
    parameterCount: requireIntegerProperty(value, "parameterCount", objectName),
    upvalueCount: requireIntegerProperty(value, "upvalueCount", objectName),
    variadic: requireBooleanProperty(value, "variadic", objectName),
    tailCall: requireBooleanProperty(value, "tailCall", objectName),
  };
}

export function parseScriptErrorPayload(value: unknown): ScriptErrorPayload {
  if (!isRecord(value)) {
    throw new Error("script_error payload must be an object");
  }

  const schemaVersion = requireIntegerProperty(value, "schemaVersion", "script_error");
  if (schemaVersion !== SCRIPT_ERROR_SCHEMA_VERSION) {
    throw new Error(`Unsupported script_error schema version: ${schemaVersion}`);
  }
  if (!Array.isArray(value.frames)) {
    throw new Error("script_error field 'frames' must be an array");
  }

  return {
    schemaVersion: SCRIPT_ERROR_SCHEMA_VERSION,
    errorId: requireIntegerProperty(value, "errorId", "script_error"),
    language: requireStringProperty(value, "language", "script_error"),
    kind: requireStringProperty(value, "kind", "script_error"),
    phase: requireStringProperty(value, "phase", "script_error"),
    message: requireStringProperty(value, "message", "script_error"),
    traceback: requireStringProperty(value, "traceback", "script_error"),
    codeHash: requireStringProperty(value, "codeHash", "script_error"),
    framesTruncated: requireBooleanProperty(value, "framesTruncated", "script_error"),
    frames: value.frames.map(parseFrame),
  };
}

export function decodeScriptErrorPayload(data: string): ScriptErrorPayload | undefined {
  if (data.trim().length === 0) {
    return undefined;
  }
  return parseScriptErrorPayload(decodeRemotingJsonBinaryLiteral(data));
}

// Lua reports -1 when a frame has no active source line (native code for example).
// lineDefined is still useful for an inactive Lua function, so use it
// only when currentLine is unavailable. Both values are one-based when valid.
export function getScriptErrorFrameLine(frame: ScriptErrorFrame): number | undefined {
  if (frame.currentLine > 0) {
    return frame.currentLine;
  }
  return frame.lineDefined > 0 ? frame.lineDefined : undefined;
}
