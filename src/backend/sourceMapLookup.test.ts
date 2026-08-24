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
      const generated = "TIC(); danger()\n";
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
      const rawMap = JSON.parse(generator.toString()) as Record<string, unknown>;
      rawMap.x_ticbuild = { generated: { hash: hashTextSha1(generated) } };
      fs.writeFileSync(mapPath, JSON.stringify(rawMap), "utf-8");

      const { lookup } = loadSourceMapArtifact({ generatedPath, mapPath });
      const expectedSourcePath = path.resolve(tempDir, "../src/main.ts");
      expect(lookup.findOriginalNameOnGeneratedLine(1, ["danger"])).toEqual({
        generatedLine: 1,
        generatedColumn: 8,
        filePath: expectedSourcePath,
        line: 9,
        column: 9,
        originalName: "danger",
      });
      expect(lookup.findMappingAtOrBefore(1, 7)?.originalName).toBe("TIC");
      expect(lookup.findMappingAtOrBefore(1, 8)?.originalName).toBe("danger");
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
