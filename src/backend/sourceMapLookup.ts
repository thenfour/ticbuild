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
  generatedName?: string;
}

export interface GeneratedLineRange {
  startLine: number;
  endLine: number;
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
  private readonly mappingsByGeneratedName: ReadonlyMap<string, readonly IndexedSourceMapping[]>;

  constructor(mappings: readonly IndexedSourceMapping[]) {
    const mutableLines = new Map<number, IndexedSourceMapping[]>();
    const mutableNames = new Map<number, Map<string, IndexedSourceMapping>>();
    const mutableGeneratedNames = new Map<string, IndexedSourceMapping[]>();
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
      if (mapping.generatedName && mapping.originalName) {
        const generatedNameMappings = mutableGeneratedNames.get(mapping.generatedName) ?? [];
        generatedNameMappings.push(mapping);
        mutableGeneratedNames.set(mapping.generatedName, generatedNameMappings);
      }
    }
    this.mappingsByGeneratedLine = mutableLines;
    this.namedMappingsByGeneratedLine = mutableNames;
    this.mappingsByGeneratedName = mutableGeneratedNames;
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

  findOriginalNameForGeneratedIdentifier(
    generatedName: string,
    range?: GeneratedLineRange,
  ): string | undefined {
    const mappings = this.mappingsByGeneratedName.get(generatedName) ?? [];
    const originalNames = new Set<string>();
    for (const mapping of mappings) {
      if (range
        && (mapping.generatedLine < range.startLine || mapping.generatedLine > range.endLine)) {
        continue;
      }
      if (mapping.originalName) {
        originalNames.add(mapping.originalName);
      }
    }

    // A generated spelling can be reused by third-party producers or by
    // unminified code in unrelated scopes. Only return a name when the selected
    // frame range makes the authored binding unambiguous.
    return originalNames.size === 1 ? originalNames.values().next().value : undefined;
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

// read a symbol name from code.
function readGeneratedIdentifier(
  generatedLines: readonly string[],
  oneBasedLine: number,
  zeroBasedColumn: number,
): string | undefined {
  const line = generatedLines[oneBasedLine - 1];
  if (line === undefined || zeroBasedColumn < 0 || zeroBasedColumn >= line.length) {
    return undefined;
  }

  return /^[A-Za-z_][A-Za-z0-9_]*/.exec(line.slice(zeroBasedColumn))?.[0];
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
  const generatedLines = generatedCode.split(/\r?\n/);
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
      generatedName: mapping.name
        ? readGeneratedIdentifier(generatedLines, mapping.generatedLine, mapping.generatedColumn)
        : undefined,
    });
  }, undefined, SourceMapConsumer.GENERATED_ORDER);

  return { generatedBytes, lookup: new SourceMapLookup(mappings) };
}
