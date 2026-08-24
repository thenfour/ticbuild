import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { SourceMapGenerator } from "source-map";
import { hashTextSha1 } from "../utils/utils";
import { loadSourceMapArtifact } from "./sourceMapLookup";

describe("source-map lookup", () => {
  it("indexes one-based generated/editor locations and original symbols", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-source-map-"));
    try {
      const generatedPath = path.join(tempDir, "output.lua");
      const mapPath = `${generatedPath}.map`;
      const generated = [
        "TIC(); danger()",
        "local a=1",
        "print(a)",
        "function f(a) return a end",
        "",
      ].join("\n");
      fs.writeFileSync(generatedPath, generated, "utf-8");

      const generator = new SourceMapGenerator({ file: path.basename(generatedPath) });
      generator.addMapping({
        generated: { line: 1, column: 0 },
        original: { line: 3, column: 2 },
        source: "../src/main.ts",
        name: "TIC",
      });
      generator.addMapping({
        generated: { line: 1, column: 7 },
        original: { line: 9, column: 8 },
        source: "../src/main.ts",
        name: "danger",
      });
      generator.addMapping({
        generated: { line: 2, column: 6 },
        original: { line: 12, column: 6 },
        source: "../src/main.ts",
        name: "playerPosition",
      });
      generator.addMapping({
        generated: { line: 3, column: 6 },
        original: { line: 13, column: 2 },
        source: "../src/main.ts",
        name: "playerPosition",
      });
      generator.addMapping({
        generated: { line: 4, column: 11 },
        original: { line: 20, column: 12 },
        source: "../src/main.ts",
        name: "amount",
      });
      const rawMap = JSON.parse(generator.toString()) as Record<string, unknown>;
      rawMap.x_ticbuild = { generated: { hash: hashTextSha1(generated) } };
      fs.writeFileSync(mapPath, JSON.stringify(rawMap), "utf-8");

      const { lookup } = loadSourceMapArtifact({ generatedPath, mapPath });
      const expectedSourcePath = path.resolve(tempDir, "../src/main.ts");
      expect(lookup.findOriginalNameOnGeneratedLine(1, ["danger"])).toEqual({
        generatedLine: 1,
        generatedColumn: 8,
        generatedName: "danger",
        filePath: expectedSourcePath,
        line: 9,
        column: 9,
        originalName: "danger",
      });
      expect(lookup.findMappingAtOrBefore(1, 7)?.originalName).toBe("TIC");
      expect(lookup.findMappingAtOrBefore(1, 8)?.originalName).toBe("danger");
      expect(lookup.findOriginalNameForGeneratedIdentifier("a")).toBeUndefined();
      expect(lookup.findOriginalNameForGeneratedIdentifier(
        "a",
        { startLine: 2, endLine: 3 },
      )).toBe("playerPosition");
      expect(lookup.findOriginalNameForGeneratedIdentifier(
        "a",
        { startLine: 4, endLine: 4 },
      )).toBe("amount");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("rejects a map whose recorded generated-file hash is stale", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-source-map-stale-"));
    try {
      const generatedPath = path.join(tempDir, "output.lua");
      const mapPath = `${generatedPath}.map`;
      fs.writeFileSync(generatedPath, "new output", "utf-8");
      fs.writeFileSync(mapPath, JSON.stringify({
        version: 3,
        sources: [],
        names: [],
        mappings: "",
        x_ticbuild: { generated: { hash: hashTextSha1("old output") } },
      }), "utf-8");

      expect(() => loadSourceMapArtifact({ generatedPath, mapPath }))
        .toThrow(`Source map does not match generated file: ${mapPath}`);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
