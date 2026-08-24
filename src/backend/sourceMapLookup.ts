// api/utils for actually using symbol source maps to convert runtime
// error frame info to authored original source locations.

import * as fs from "node:fs";
import * as path from "node:path";
import { RawSourceMap, SourceMapConsumer } from "source-map";
import { hashTextSha1, isRecord } from "../utils/utils";

export interface SourceMapArtifactPaths {
  generatedPath: string;
  mapPath: string;
}

// Public locations use one-based lines and columns, matching terminal/editor
// locations. Conversion from Source Map v3's zero-based columns happens once
// while the index is built.
export interface SourceMapOriginalLocation {
  filePath: string;
  line: number;
  column: number;
  originalName?: string;
}

export interface IndexedSourceMapping extends SourceMapOriginalLocation {
  generatedLine: number;
  generatedColumn: number;
}

type SerializedSourceMap = RawSourceMap & {
  x_ticbuild?: {
    generated?: {
      hash?: string;
    };
  };
};

export class SourceMapLookup {
  private readonly mappingsByGeneratedLine: ReadonlyMap<number, readonly IndexedSourceMapping[]>;
  private readonly namedMappingsByGeneratedLine: ReadonlyMap<number, ReadonlyMap<string, IndexedSourceMapping>>;

  constructor(mappings: readonly IndexedSourceMapping[]) {
    const mutableLines = new Map<number, IndexedSourceMapping[]>();
    const mutableNames = new Map<number, Map<string, IndexedSourceMapping>>();
    for (const mapping of mappings) {
      const lineMappings = mutableLines.get(mapping.generatedLine) ?? [];
      lineMappings.push(mapping);
      mutableLines.set(mapping.generatedLine, lineMappings);

      if (mapping.originalName) {
        const lineNames = mutableNames.get(mapping.generatedLine) ?? new Map<string, IndexedSourceMapping>();
        // Source maps are generated-column ordered. preserving the first mapping
        // for a name preserves deterministic ordering when a symbol occurs
        // more than once on a packed generated line.
        if (!lineNames.has(mapping.originalName)) {
          lineNames.set(mapping.originalName, mapping);
        }
        mutableNames.set(mapping.generatedLine, lineNames);
      }
    }
    this.mappingsByGeneratedLine = mutableLines;
    this.namedMappingsByGeneratedLine = mutableNames;
  }

  getMappingsForGeneratedLine(generatedLine: number): readonly IndexedSourceMapping[] {
    return this.mappingsByGeneratedLine.get(generatedLine) ?? [];
  }

  findOriginalNameOnGeneratedLine(
    generatedLine: number,
    preferredOriginalNames: readonly string[],
  ): IndexedSourceMapping | undefined {
    const namedMappings = this.namedMappingsByGeneratedLine.get(generatedLine);
    if (!namedMappings) {
      return undefined;
    }
    for (const name of preferredOriginalNames) {
      const mapping = namedMappings.get(name);
      if (mapping) {
        return mapping;
      }
    }
    return undefined;
  }

  findMappingAtOrBefore(
    generatedLine: number,
    oneBasedGeneratedColumn: number,
  ): IndexedSourceMapping | undefined {
    const mappings = this.getMappingsForGeneratedLine(generatedLine);
    let result: IndexedSourceMapping | undefined;
    for (const mapping of mappings) {
      if (mapping.generatedColumn > oneBasedGeneratedColumn) {
        break;
      }
      result = mapping;
    }
    return result;
  }

  firstMappingOnGeneratedLine(generatedLine: number): IndexedSourceMapping | undefined {
    return this.getMappingsForGeneratedLine(generatedLine)[0];
  }
}

export interface LoadedSourceMapArtifact {
  generatedBytes: Buffer;
  lookup: SourceMapLookup;
}

function readExpectedGeneratedHash(raw: SerializedSourceMap): string | undefined {
  const ticbuild = raw.x_ticbuild;
  if (!ticbuild || !isRecord(ticbuild.generated)) {
    return undefined;
  }
  const hash = ticbuild.generated.hash;
  if (hash !== undefined && typeof hash !== "string") {
    throw new Error("Source map x_ticbuild.generated.hash must be a string");
  }
  return hash;
}

export function loadSourceMapArtifact(artifact: SourceMapArtifactPaths): LoadedSourceMapArtifact {
  const generatedBytes = fs.readFileSync(artifact.generatedPath);
  const generatedCode = generatedBytes.toString("utf-8");
  const raw = JSON.parse(fs.readFileSync(artifact.mapPath, "utf-8")) as SerializedSourceMap;
  const expectedGeneratedHash = readExpectedGeneratedHash(raw);
  if (expectedGeneratedHash && expectedGeneratedHash !== hashTextSha1(generatedCode)) {
    throw new Error(`Source map does not match generated file: ${artifact.mapPath}`);
  }

  const mappings: IndexedSourceMapping[] = [];
  const consumer = new SourceMapConsumer(raw);
  consumer.eachMapping((mapping) => {
    if (!mapping.source || mapping.originalLine <= 0 || mapping.generatedLine <= 0) {
      return;
    }
    mappings.push({
      generatedLine: mapping.generatedLine,
      generatedColumn: mapping.generatedColumn + 1,
      filePath: path.resolve(path.dirname(artifact.mapPath), mapping.source),
      line: mapping.originalLine,
      column: mapping.originalColumn + 1,
      originalName: mapping.name || undefined,
    });
  }, undefined, SourceMapConsumer.GENERATED_ORDER);

  return { generatedBytes, lookup: new SourceMapLookup(mappings) };
}
