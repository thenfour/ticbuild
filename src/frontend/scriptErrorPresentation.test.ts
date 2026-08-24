import {
  ScriptErrorFrame,
  ScriptErrorPayload,
} from "../backend/tic80Controller/scriptErrorProtocol";
import { renderScriptError, ScriptErrorSourceMapper } from "./scriptErrorPresentation";

function frame(overrides: Partial<ScriptErrorFrame> = {}): ScriptErrorFrame {
  return {
    source: "cart",
    name: "TIC",
    nameWhat: "global",
    what: "Lua",
    currentLine: 7,
    lineDefined: 3,
    lastLineDefined: 10,
    parameterCount: 0,
    upvalueCount: 0,
    variadic: false,
    tailCall: false,
    variablesCaptured: false,
    variablesTruncated: false,
    variables: [],
    ...overrides,
  };
}

function payload(overrides: Partial<ScriptErrorPayload> = {}): ScriptErrorPayload {
  return {
    schemaVersion: 1,
    errorId: 7,
    language: "lua",
    kind: "runtime",
    phase: "tic",
    message: "cart:7: boom",
    traceback: "cart:7: boom\nstack traceback:",
    codeHash: "md5:missing",
    framesTruncated: false,
    frames: [frame()],
    ...overrides,
  };
}

describe("script error presentation", () => {
  it("renders a mapped source location when one is available", () => {
    const mapper: ScriptErrorSourceMapper = {
      mapFrame: () => ({ filePath: "C:\\project\\src\\main.ts", line: 9, column: 8 }),
    };

    expect(renderScriptError(payload(), mapper)).toEqual([
      "Lua runtime error during tic: cart:7: boom",
      "  at TIC (C:\\project\\src\\main.ts:9:8)",
    ]);
  });

  it("labels the name-less Lua Debug frame categories explicitly", () => {
    const error = payload({
      frames: [
        frame({ name: "", what: "main" }),
        frame({ name: "", what: "C", source: "[C]", currentLine: -1, lineDefined: -1 }),
        frame({ name: "", what: "Lua" }),
        frame({ name: "", what: "future-category", currentLine: -1, lineDefined: -1 }),
      ],
    });

    expect(renderScriptError(error).slice(1)).toEqual([
      "  at <main> (cart:7)",
      "  at <native> ([C])",
      "  at <anonymous> (cart:7)",
      "  at <anonymous> (cart)",
    ]);
  });

  it("renders captured parameters, locals, and upvalues beneath their frame", () => {
    const error = payload({
      frames: [frame({
        variablesCaptured: true,
        variablesTruncated: true,
        variables: [
          {
            runtimeName: "dt",
            scope: "parameter",
            type: "number",
            display: "0.016",
            index: 1,
            valueTruncated: false,
          },
          {
            runtimeName: "items",
            scope: "local",
            type: "table",
            display: "{1, 2, 3, ...}",
            index: 2,
            valueTruncated: true,
          },
          {
            runtimeName: "config",
            scope: "upvalue",
            type: "table",
            display: "{speed=2}",
            index: 1,
            valueTruncated: false,
          },
        ],
      })],
    });

    expect(renderScriptError(error).slice(1)).toEqual([
      "  at TIC (cart:7)",
      "    variables:",
      "      parameter dt = 0.016",
      "      local items = {1, 2, 3, ...}  (value truncated)",
      "      upvalue config = {speed=2}",
      "      ... variables truncated by TIC-80",
    ]);
  });

  it("distinguishes a captured empty frame from one without a snapshot", () => {
    expect(renderScriptError(payload({
      frames: [frame({ variablesCaptured: true })],
    })).slice(1)).toEqual([
      "  at TIC (cart:7)",
      "    variables: (none)",
    ]);

    expect(renderScriptError(payload({
      frames: [frame({ variablesCaptured: false })],
    })).slice(1)).toEqual([
      "  at TIC (cart:7)",
    ]);
  });

  it("uses the traceback when structured frames are unavailable", () => {
    const error = payload({
      frames: [],
      framesTruncated: true,
      traceback: "cart:4: boom\nstack traceback:\n\tcart:4: in main chunk",
    });

    expect(renderScriptError(error).slice(1)).toEqual([
      "  stack traceback:",
      "  cart:4: in main chunk",
      "  ... stack trace truncated by TIC-80",
    ]);
  });
});
