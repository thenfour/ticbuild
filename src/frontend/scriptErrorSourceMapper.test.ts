import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { SourceMapGenerator } from "source-map";
import {
  ScriptErrorFrame,
  ScriptErrorPayload,
} from "../backend/tic80Controller/scriptErrorProtocol";
import { hashBytesMd5, hashTextSha1 } from "../utils/utils";
import { ScriptErrorSourceMapRegistry } from "./scriptErrorSourceMapper";

function frame(overrides: Partial<ScriptErrorFrame> = {}): ScriptErrorFrame {
  return {
    source: "cart",
    name: "",
    nameWhat: "",
    what: "Lua",
    currentLine: 1,
    lineDefined: 1,
    lastLineDefined: 1,
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
    message: "cart:1: attempt to perform arithmetic on a nil value (local 'amount')",
    traceback: "stack traceback:",
    codeHash: "md5:missing",
    framesTruncated: false,
    frames: [frame()],
    ...overrides,
  };
}

describe("script-error source mapping", () => {
  it("prefers structured native-frame names, then bounded Lua message hints", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-script-error-map-"));
    try {
      const generatedPath = path.join(tempDir, "maincode.02.minified.lua");
      const mapPath = `${generatedPath}.map`;
      const generated = [
        "TIC(); danger(); amount = amount + 1; local a=1; local b=a+1",
        "local function c() end",
        "",
      ].join("\n");
      const generatedBytes = Buffer.from(generated, "utf-8");
      fs.writeFileSync(generatedPath, generatedBytes);

      const generator = new SourceMapGenerator({ file: path.basename(generatedPath) });
      generator.addMapping({
        generated: { line: 1, column: 0 },
        original: { line: 3, column: 0 },
        source: "src/main.ts",
        name: "TIC",
      });
      generator.addMapping({
        generated: { line: 1, column: 7 },
        original: { line: 9, column: 8 },
        source: "src/main.ts",
        name: "danger",
      });
      generator.addMapping({
        generated: { line: 1, column: 17 },
        original: { line: 12, column: 6 },
        source: "src/main.ts",
        name: "amount",
      });
      generator.addMapping({
        generated: { line: 1, column: generated.indexOf("local a") + "local ".length },
        original: { line: 15, column: 8 },
        source: "src/main.ts",
        name: "lut",
      });
      generator.addMapping({
        generated: { line: 1, column: generated.indexOf("local b") + "local ".length },
        original: { line: 16, column: 8 },
        source: "src/main.ts",
        name: "x",
      });
      generator.addMapping({
        generated: { line: 2, column: "local function ".length },
        original: { line: 20, column: 9 },
        source: "src/main.ts",
        name: "AUtilFunction",
      });
      const rawMap = JSON.parse(generator.toString()) as Record<string, unknown>;
      rawMap.x_ticbuild = { generated: { hash: hashTextSha1(generated) } };
      fs.writeFileSync(mapPath, JSON.stringify(rawMap), "utf-8");

      const registry = new ScriptErrorSourceMapRegistry();
      expect(registry.replaceFromArtifacts([{ generatedPath, mapPath }])).toBe(1);
      const codeHash = hashBytesMd5(generatedBytes);
      const nativeLeaf = frame({
        source: "[C]",
        name: "danger",
        nameWhat: "global",
        what: "C",
        currentLine: -1,
        lineDefined: -1,
      });

      const structured = registry.mapFrame(payload({
        codeHash,
        message: "cart:1: misleading fallback (local 'amount')",
        frames: [nativeLeaf, frame()],
      }), 1);
      expect(structured).toMatchObject({ line: 9, column: 9, originalName: "danger" });

      const fuzzyFallback = registry.mapFrame(payload({ codeHash }), 0);
      expect(fuzzyFallback).toMatchObject({ line: 12, column: 7, originalName: "amount" });

      const nonLua = registry.mapFrame(payload({ codeHash, language: "javascript" }), 0);
      expect(nonLua).toMatchObject({ line: 3, column: 1, originalName: "TIC" });

      const variableError = payload({
        codeHash,
        frames: [frame({
          name: "c",
          lineDefined: 1,
          lastLineDefined: 2,
          variablesCaptured: true,
          variables: [
            {
              runtimeName: "a",
              scope: "local",
              type: "table",
              display: "{1,2,3}",
              index: 1,
              valueTruncated: false,
            },
            {
              runtimeName: "b",
              scope: "local",
              type: "nil",
              display: "nil",
              index: 2,
              valueTruncated: false,
            },
          ],
        })],
      });
      expect(registry.mapVariableName(variableError, 0, 0)).toBe("lut");
      expect(registry.mapVariableName(variableError, 0, 1)).toBe("x");
      expect(registry.mapFrameName(variableError, 0)).toBe("AUtilFunction");

      expect(registry.mapFrame(payload({ codeHash: "md5:stale" }), 0)).toBeUndefined();
      expect(registry.mapFrameName(payload({ codeHash: "md5:stale" }), 0)).toBeUndefined();
      expect(registry.mapVariableName(payload({ codeHash: "md5:stale" }), 0, 0)).toBeUndefined();
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
