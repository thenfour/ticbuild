import * as path from "node:path";
import { SourceMapGenerator } from "source-map";
import { createIdentitySourceMap, mapPreprocessedOffset, SourceMapBuilder } from "./sourceMap";
import { importSourceMapV3, serializeSourceMapV3 } from "./sourceMapV3";

describe("Source Map v3 adapter", () => {
  it("serializes standard sidecars with authored source content and exact ticbuild segments", () => {
    const projectDir = path.resolve("C:/project");
    const sourcePath = path.join(projectDir, "src", "main.lua");
    const generatedPath = path.join(projectDir, "build", "main.01.preprocessed.lua");
    const mapPath = `${generatedPath}.map`;
    const code = "local value = 1\n";
    const parsed = JSON.parse(serializeSourceMapV3(
      createIdentitySourceMap(code, sourcePath),
      code,
      generatedPath,
      mapPath,
    ));

    expect(parsed).toMatchObject({
      version: 3,
      file: "main.01.preprocessed.lua",
      sourcesContent: [code],
      x_ticbuild: {
        version: 1,
        offsetEncoding: "utf-16",
      },
    });
    expect(parsed.sources[0]).toBe("../src/main.lua");
    expect(parsed.x_ticbuild.segments[0]).toMatchObject({
      ppBegin: 0,
      ppEnd: code.length,
      originalFile: "../src/main.lua",
      originalOffset: 0,
      kind: "identity",
    });
  });

  it("imports generated line-column anchors as authored offsets", () => {
    const projectDir = path.resolve("C:/project");
    const sourcePath = path.join(projectDir, "src", "main.ts");
    const source = "first\nconst value = 1;\n";
    const generated = "header\n    value\n";
    const generator = new SourceMapGenerator({ file: "bundle.lua" });
    generator.addMapping({
      generated: { line: 2, column: 4 },
      original: { line: 2, column: 6 },
      source: "src/main.ts",
      name: "value",
    });
    generator.setSourceContent("src/main.ts", source);

    const map = importSourceMapV3(
      generated,
      generator.toString(),
      [{ filePath: sourcePath, content: source }],
      projectDir,
    );
    expect(mapPreprocessedOffset(map, generated.indexOf("value"), "right")).toEqual({
      file: sourcePath,
      offset: source.indexOf("value"),
      name: "value",
    });
    expect(mapPreprocessedOffset(map, generated.indexOf("header"), "right")).toBeNull();
  });

  it("round-trips original symbol names through Source Map v3", () => {
    const projectDir = path.resolve("C:/project");
    const sourcePath = path.join(projectDir, "src", "main.lua");
    const source = "local playerPosition = 1\n";
    const generated = "local a=1\n";
    const builder = new SourceMapBuilder();
    builder.registerSource(sourcePath, source);
    builder.appendGenerated("local ", null);
    builder.appendGenerated("a", {
      file: sourcePath,
      offset: source.indexOf("playerPosition"),
      name: "playerPosition",
    });
    builder.appendGenerated("=1\n", null);
    const generatedPath = path.join(projectDir, "build", "main.02.minified.lua");
    const parsed = JSON.parse(serializeSourceMapV3(
      builder.toSourceMap(generated),
      generated,
      generatedPath,
      `${generatedPath}.map`,
    ));

    expect(parsed.names).toContain("playerPosition");
    expect(parsed.x_ticbuild.segments).toContainEqual(expect.objectContaining({
      originalName: "playerPosition",
    }));
  });
});
