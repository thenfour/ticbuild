import {
  decodeScriptErrorPayload,
  getScriptErrorFrameLine,
  ScriptErrorPayload,
} from "./scriptErrorProtocol";

function payload(): ScriptErrorPayload {
  return {
    schemaVersion: 1,
    errorId: 7,
    language: "lua",
    kind: "runtime",
    phase: "tic",
    message: "erreur hétérogène",
    traceback: "stack traceback:",
    codeHash: "md5:abc",
    framesTruncated: false,
    frames: [{
      source: "cart",
      name: "TIC",
      nameWhat: "global",
      what: "Lua",
      currentLine: 9,
      lineDefined: 3,
      lastLineDefined: 10,
      parameterCount: 0,
      upvalueCount: 0,
      variadic: false,
      tailCall: false,
      variablesCaptured: true,
      variablesTruncated: false,
      variables: [{
        runtimeName: "speed",
        scope: "local",
        type: "number",
        display: "3.5",
        index: 1,
        valueTruncated: false,
      }],
    }],
  };
}

function encodePayload(value: unknown): string {
  return `<${Buffer.from(JSON.stringify(value), "utf-8").toString("hex")}>`;
}

describe("script_error protocol", () => {
  it("decodes and validates a schema-v1 payload after remoting binary decoding", () => {
    const expected = payload();
    expect(decodeScriptErrorPayload(encodePayload(expected))).toEqual(expected);
    expect(decodeScriptErrorPayload("  ")).toBeUndefined();
  });

  it("rejects unsupported schemas and non-integer numeric fields", () => {
    expect(() => decodeScriptErrorPayload(encodePayload({ ...payload(), schemaVersion: 2 })))
      .toThrow("Unsupported script_error schema version: 2");
    expect(() => decodeScriptErrorPayload(encodePayload({ ...payload(), errorId: 1.5 })))
      .toThrow("script_error field 'errorId' must be a safe integer");
  });

  it("validates frame variable snapshots and accepts legacy schema-v1 frames", () => {
    const malformed = payload();
    malformed.frames[0].variables[0].valueTruncated = "no" as unknown as boolean;
    expect(() => decodeScriptErrorPayload(encodePayload(malformed)))
      .toThrow("script_error frame[0] variable[0] field 'valueTruncated' must be a boolean");

    const legacy = JSON.parse(JSON.stringify(payload())) as Record<string, unknown>;
    const legacyFrame = (legacy.frames as Array<Record<string, unknown>>)[0];
    delete legacyFrame.variablesCaptured;
    delete legacyFrame.variablesTruncated;
    delete legacyFrame.variables;
    expect(decodeScriptErrorPayload(encodePayload(legacy))?.frames[0]).toMatchObject({
      variablesCaptured: false,
      variablesTruncated: false,
      variables: [],
    });
  });

  it("uses currentLine, then lineDefined, and rejects Lua's unavailable line sentinel", () => {
    const value = payload().frames[0];
    expect(getScriptErrorFrameLine(value)).toBe(9);
    expect(getScriptErrorFrameLine({ ...value, currentLine: -1 })).toBe(3);
    expect(getScriptErrorFrameLine({ ...value, currentLine: -1, lineDefined: -1 })).toBeUndefined();
  });
});
