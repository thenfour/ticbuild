// not totally related to `sourceMap`; this is 
// https://tc39.es/ecma426/

import * as path from "node:path";
import { RawSourceMap, SourceMapConsumer, SourceMapGenerator } from "source-map";
import { canonicalizePath, toAbsoluteCanonicalPath } from "../utils/fileSystem";
import {
  LuaPreprocessorSourceMap,
  SourceMapBuilder,
  SourceMapSegment,
} from "./sourceMap";

export type KnownSourceFile = {
  filePath: string;
  content: string;
};

type RawSourceMapV3 = Omit<RawSourceMap, "version"> & {
  version: string | number;
};

type ResolvedSource = KnownSourceFile & {
  canonicalPath: string;
};

type OffsetMapping = {
  generatedOffset: number;
  generatedLine: number;
  source: ResolvedSource;
  originalOffset: number;
  originalName?: string;
};

function getLineStarts(content: string): number[] {
  const starts = [0];
  for (let i = 0; i < content.length; i++) {
    if (content.charCodeAt(i) === 10) {
      starts.push(i + 1);
    }
  }
  return starts;
}

function offsetToLineColumnFromStarts(
  contentLength: number,
  lineStarts: readonly number[],
  offset: number,
): { line: number; column: number } {
  const clampedOffset = Math.max(0, Math.min(offset, contentLength));
  let lo = 0;
  let hi = lineStarts.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (lineStarts[mid] <= clampedOffset) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  const lineIndex = Math.max(0, lo - 1);
  return { line: lineIndex + 1, column: clampedOffset - lineStarts[lineIndex] };
}

function lineColumnToOffset(
  content: string,
  lineStarts: readonly number[],
  oneBasedLine: number,
  column: number,
): number | null {
  const lineIndex = oneBasedLine - 1;
  if (lineIndex < 0 || lineIndex >= lineStarts.length || column < 0) {
    return null;
  }
  const lineStart = lineStarts[lineIndex];
  const lineEnd = lineIndex + 1 < lineStarts.length ? lineStarts[lineIndex + 1] : content.length;
  const offset = lineStart + column;
  return offset <= lineEnd ? offset : null;
}

function normalizeComparisonPath(filePath: string): string {
  const normalized = canonicalizePath(filePath).replace(/\\/g, "/");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function resolveMappedSource(
  mappedSource: string,
  knownSources: readonly ResolvedSource[],
  projectDir: string,
): ResolvedSource | undefined {
  const comparison = normalizeComparisonPath(mappedSource);
  const directCandidates = [
    comparison,
    normalizeComparisonPath(toAbsoluteCanonicalPath(mappedSource, projectDir)),
  ];
  const direct = knownSources.find((source) => directCandidates.includes(normalizeComparisonPath(source.canonicalPath)));
  if (direct) {
    return direct;
  }

  const suffix = `/${comparison.replace(/^\.\//, "")}`;
  const suffixMatches = knownSources.filter((source) => normalizeComparisonPath(source.canonicalPath).endsWith(suffix));
  if (suffixMatches.length === 1) {
    return suffixMatches[0];
  }

  const baseName = path.basename(comparison);
  const baseNameMatches = knownSources.filter(
    (source) => path.basename(normalizeComparisonPath(source.canonicalPath)) === baseName,
  );
  return baseNameMatches.length === 1 ? baseNameMatches[0] : undefined;
}

// Converts TypeScriptToLua's bundled Source Map v3 output to ticbuild's offset map.
export function importSourceMapV3(
  generatedCode: string,
  rawMapJson: string,
  sourceFiles: readonly KnownSourceFile[],
  projectDir: string,
): LuaPreprocessorSourceMap {
  const rawMap = JSON.parse(rawMapJson) as RawSourceMapV3;
  const consumer = new SourceMapConsumer(rawMap as RawSourceMap);
  const generatedLineStarts = getLineStarts(generatedCode);
  const knownSources: ResolvedSource[] = sourceFiles.map((source) => ({
    ...source,
    canonicalPath: toAbsoluteCanonicalPath(source.filePath, projectDir),
  }));
  const sourceLineStarts = new Map(knownSources.map((source) => [source.canonicalPath, getLineStarts(source.content)]));
  const mappings: OffsetMapping[] = [];

  consumer.eachMapping((mapping) => {
    if (!mapping.source || mapping.originalLine <= 0 || mapping.generatedLine <= 0) {
      return;
    }
    const source = resolveMappedSource(mapping.source, knownSources, projectDir);
    if (!source) {
      return;
    }
    const generatedOffset = lineColumnToOffset(
      generatedCode,
      generatedLineStarts,
      mapping.generatedLine,
      mapping.generatedColumn,
    );
    const originalOffset = lineColumnToOffset(
      source.content,
      sourceLineStarts.get(source.canonicalPath)!,
      mapping.originalLine,
      mapping.originalColumn,
    );
    if (generatedOffset === null || originalOffset === null) {
      return;
    }
    mappings.push({
      generatedOffset,
      generatedLine: mapping.generatedLine,
      source,
      originalOffset,
      originalName: mapping.name || undefined,
    });
  }, undefined, SourceMapConsumer.GENERATED_ORDER);

  const distinctMappings = mappings.filter(
    (mapping, index) => index === 0 || mapping.generatedOffset !== mappings[index - 1].generatedOffset,
  );
  const segments: SourceMapSegment[] = [];
  for (let i = 0; i < distinctMappings.length; i++) {
    const mapping = distinctMappings[i];
    const next = distinctMappings[i + 1];
    const lineIndex = mapping.generatedLine - 1;
    const lineEnd = lineIndex + 1 < generatedLineStarts.length
      ? generatedLineStarts[lineIndex + 1]
      : generatedCode.length;
    const end = next && next.generatedLine === mapping.generatedLine
      ? Math.min(next.generatedOffset, lineEnd)
      : lineEnd;
    if (end <= mapping.generatedOffset) {
      continue;
    }
    segments.push({
      ppBegin: mapping.generatedOffset,
      ppEnd: end,
      originalFile: mapping.source.canonicalPath,
      originalOffset: mapping.originalOffset,
      kind: "anchor",
      originalName: mapping.originalName,
    });
  }

  const builder = new SourceMapBuilder(generatedCode.length, segments);
  for (const source of knownSources) {
    builder.registerSource(source.canonicalPath, source.content);
  }
  return builder.toSourceMap(generatedCode);
}

function toPortableSourcePath(filePath: string, mapFilePath: string): string {
  if (!path.isAbsolute(filePath)) {
    return filePath.replace(/\\/g, "/");
  }
  return path.relative(path.dirname(mapFilePath), filePath).replace(/\\/g, "/");
}

function addMappingAtOffset(
  generator: SourceMapGenerator,
  map: LuaPreprocessorSourceMap,
  generatedCode: string,
  mapFilePath: string,
  segment: SourceMapSegment,
  generatedOffset: number,
  generatedLineStarts: readonly number[],
  sourceLineStarts: ReadonlyMap<string, readonly number[]>,
): void {
  const sourceContent = map.sources?.[segment.originalFile]?.content;
  const originalLineStarts = sourceLineStarts.get(segment.originalFile);
  if (sourceContent === undefined || !originalLineStarts) {
    return;
  }
  const generated = offsetToLineColumnFromStarts(generatedCode.length, generatedLineStarts, generatedOffset);
  const originalOffset = segment.kind === "anchor"
    ? segment.originalOffset
    : segment.originalOffset + (generatedOffset - segment.ppBegin);
  const original = offsetToLineColumnFromStarts(sourceContent.length, originalLineStarts, originalOffset);
  generator.addMapping({
    generated: { line: generated.line, column: generated.column },
    original: { line: original.line, column: original.column },
    source: toPortableSourcePath(segment.originalFile, mapFilePath),
    name: segment.originalName,
  });
}

export function serializeSourceMapV3(
  map: LuaPreprocessorSourceMap,
  generatedCode: string,
  generatedFilePath: string,
  mapFilePath: string,
): string {
  const generator = new SourceMapGenerator({ file: path.basename(generatedFilePath) });
  const generatedLineStarts = getLineStarts(generatedCode);
  const sourceLineStarts = new Map(
    Object.entries(map.sources ?? {}).map(([filePath, source]) => [filePath, getLineStarts(source.content)]),
  );
  for (const segment of map.segments) {
    addMappingAtOffset(
      generator,
      map,
      generatedCode,
      mapFilePath,
      segment,
      segment.ppBegin,
      generatedLineStarts,
      sourceLineStarts,
    );
    for (let offset = segment.ppBegin; offset < segment.ppEnd; offset++) {
      if (generatedCode.charCodeAt(offset) === 10 && offset + 1 < segment.ppEnd) {
        addMappingAtOffset(
          generator,
          map,
          generatedCode,
          mapFilePath,
          segment,
          offset + 1,
          generatedLineStarts,
          sourceLineStarts,
        );
      }
    }
  }
  for (const [filePath, source] of Object.entries(map.sources ?? {})) {
    generator.setSourceContent(toPortableSourcePath(filePath, mapFilePath), source.content);
  }

  const standardMap = JSON.parse(generator.toString()) as Record<string, unknown>;
  standardMap.x_ticbuild = {
    version: 1,
    offsetEncoding: "utf-16",
    generated: map.preprocessedFile,
    segments: map.segments.map((segment) => ({
      ...segment,
      originalFile: toPortableSourcePath(segment.originalFile, mapFilePath),
      kind: segment.kind ?? "identity",
    })),
  };
  return JSON.stringify(standardMap, null, 2);
}
