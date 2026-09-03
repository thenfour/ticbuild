// Generated-code location -> authored source location mapping.

import { hashTextSha1 } from "../utils/utils";

export type SourceMapSegmentKind = "identity" | "anchor";

export type SourceMapSegment = {
  ppBegin: number;
  ppEnd: number;
  originalFile: string;
  originalOffset: number;
  // not present in older serialized maps, where segments were always identity mappings.
  kind?: SourceMapSegmentKind;
  originalName?: string;
};

export type SourceMapSource = {
  charLength: number;
  hash: string;
  content: string;
};

export type LuaPreprocessorSourceMap = {
  preprocessedFile: {
    charLength: number;
    hash: string;
  };
  segments: SourceMapSegment[];
  sources?: Record<string, SourceMapSource>;
};

export type SourceMapLocation = {
  file: string;
  offset: number;
  name?: string;
};

export type SourceMapLineColumn = SourceMapLocation & {
  line: number;
  column: number;
};

export type SourceMapBias = "left" | "right";

export type SourceMapReplacement = {
  start: number;
  end: number;
  newLength: number;
  origin: SourceMapLocation | null;
};

function segmentKind(segment: SourceMapSegment): SourceMapSegmentKind {
  return segment.kind ?? "identity";
}

function locationWithinSegment(segment: SourceMapSegment, offset: number): SourceMapLocation {
  const location: SourceMapLocation = {
    file: segment.originalFile,
    offset:
      segmentKind(segment) === "identity"
        ? segment.originalOffset + (offset - segment.ppBegin)
        : segment.originalOffset,
  };
  if (segment.originalName !== undefined) {
    location.name = segment.originalName;
  }
  return location;
}

// Maps a generated/preprocessed file offset back to the authored source file and offset if possible.
// Left bias retains the historical behavior for exclusive range ends; right bias is appropriate for token starts.
export function mapPreprocessedOffset(
  map: LuaPreprocessorSourceMap,
  offset: number,
  bias: SourceMapBias = "left",
): SourceMapLocation | null {
  if (offset < 0 || offset > map.preprocessedFile.charLength) {
    return null;
  }

  const segments = map.segments;
  let lo = 0;
  let hi = segments.length - 1;
  let candidate = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (segments[mid].ppBegin <= offset) {
      candidate = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (candidate < 0) {
    return null;
  }

  if (bias === "left" && candidate > 0 && segments[candidate].ppBegin === offset) {
    const previous = segments[candidate - 1];
    if (previous.ppEnd === offset) {
      return locationWithinSegment(previous, offset);
    }
  }

  const segment = segments[candidate];
  if (offset >= segment.ppBegin && offset < segment.ppEnd) {
    return locationWithinSegment(segment, offset);
  }
  if (bias === "left" && offset === segment.ppEnd && segment.ppEnd > segment.ppBegin) {
    return locationWithinSegment(segment, offset);
  }
  return null;
}

export function getSourceMapSourceContent(map: LuaPreprocessorSourceMap, filePath: string): string | undefined {
  return map.sources?.[filePath]?.content;
}

export function mapPreprocessedOffsetToLineColumn(
  map: LuaPreprocessorSourceMap,
  offset: number,
  bias: SourceMapBias = "left",
): SourceMapLineColumn | null {
  const location = mapPreprocessedOffset(map, offset, bias);
  if (!location) {
    return null;
  }
  const content = getSourceMapSourceContent(map, location.file);
  if (content === undefined) {
    return { ...location, line: 1, column: location.offset };
  }
  const position = offsetToLineColumn(content, location.offset);
  return { ...location, ...position };
}

export function offsetToLineColumn(content: string, offset: number): { line: number; column: number } {
  const clampedOffset = Math.max(0, Math.min(offset, content.length));
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < clampedOffset; i++) {
    if (content.charCodeAt(i) === 10) {
      line++;
      lineStart = i + 1;
    }
  }
  return { line, column: clampedOffset - lineStart };
}

// Progressively builds a source map by appending mapped slices and splicing replacements.
export class SourceMapBuilder {
  private segments: SourceMapSegment[];
  private sources: Map<string, SourceMapSource>;
  private length: number;

  constructor(length = 0, segments: SourceMapSegment[] = [], sources: Record<string, SourceMapSource> = {}) {
    this.length = length;
    this.segments = segments.map((segment) => ({ ...segment }));
    this.sources = new Map(Object.entries(sources).map(([filePath, source]) => [filePath, { ...source }]));
  }

  static fromSourceMap(map: LuaPreprocessorSourceMap): SourceMapBuilder {
    return new SourceMapBuilder(map.preprocessedFile.charLength, map.segments, map.sources ?? {});
  }

  getCharLength(): number {
    return this.length;
  }

  getSegments(): SourceMapSegment[] {
    return this.segments;
  }

  registerSource(filePath: string, content: string): void {
    if (!filePath) {
      return;
    }
    const existing = this.sources.get(filePath);
    if (existing?.content === content) {
      return;
    }
    this.sources.set(filePath, {
      charLength: content.length,
      hash: hashTextSha1(content),
      content,
    });
  }

  appendOriginal(text: string, originalFile: string, originalOffset: number, sourceContent?: string): void {
    if (!text) {
      return;
    }
    if (sourceContent !== undefined) {
      this.registerSource(originalFile, sourceContent);
    }
    const start = this.length;
    const end = start + text.length;
    this.segments.push({
      ppBegin: start,
      ppEnd: end,
      originalFile,
      originalOffset,
      kind: "identity",
    });
    this.length = end;
  }

  appendGenerated(text: string, origin: SourceMapLocation | null): void {
    if (!text) {
      return;
    }
    const start = this.length;
    const end = start + text.length;
    if (origin?.file) {
      this.segments.push({
        ppBegin: start,
        ppEnd: end,
        originalFile: origin.file,
        originalOffset: origin.offset,
        kind: "anchor",
        originalName: origin.name,
      });
    }
    this.length = end;
  }

  // Appends text copied from a mapped input range. The text length must match the input range length.
  appendMappedSlice(text: string, inputMap: LuaPreprocessorSourceMap, inputStart: number): void {
    if (!text) {
      return;
    }
    const inputEnd = inputStart + text.length;
    if (inputStart < 0 || inputEnd > inputMap.preprocessedFile.charLength) {
      throw new Error(`Source-map slice ${inputStart}..${inputEnd} is outside input length ${inputMap.preprocessedFile.charLength}`);
    }

    for (const [filePath, source] of Object.entries(inputMap.sources ?? {})) {
      this.sources.set(filePath, { ...source });
    }

    const outputStart = this.length;
    let lo = 0;
    let hi = inputMap.segments.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (inputMap.segments[mid].ppEnd <= inputStart) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    for (let i = lo; i < inputMap.segments.length; i++) {
      const segment = inputMap.segments[i];
      if (segment.ppBegin >= inputEnd) {
        break;
      }
      const intersectionStart = Math.max(inputStart, segment.ppBegin);
      const intersectionEnd = Math.min(inputEnd, segment.ppEnd);
      if (intersectionStart >= intersectionEnd) {
        continue;
      }
      const kind = segmentKind(segment);
      this.segments.push({
        ppBegin: outputStart + (intersectionStart - inputStart),
        ppEnd: outputStart + (intersectionEnd - inputStart),
        originalFile: segment.originalFile,
        originalOffset:
          kind === "identity"
            ? segment.originalOffset + (intersectionStart - segment.ppBegin)
            : segment.originalOffset,
        kind,
        originalName: segment.originalName,
      });
    }
    this.length += text.length;
  }

  appendMap(other: SourceMapBuilder): void {
    if (other.length === 0) {
      return;
    }
    const offset = this.length;
    for (const segment of other.segments) {
      this.segments.push({
        ...segment,
        ppBegin: segment.ppBegin + offset,
        ppEnd: segment.ppEnd + offset,
      });
    }
    for (const [filePath, source] of other.sources) {
      this.sources.set(filePath, { ...source });
    }
    this.length += other.length;
  }

  mapOffset(offset: number, bias: SourceMapBias = "left"): SourceMapLocation | null {
    return mapPreprocessedOffset({
      preprocessedFile: { charLength: this.length, hash: "" },
      segments: this.segments,
    }, offset, bias);
  }

  // When text is replaced, retain surrounding mappings and anchor replacement text to its invocation.
  spliceRange(start: number, end: number, newLength: number, origin: SourceMapLocation | null): void {
    if (start > end) {
      return;
    }
    const delta = newLength - (end - start);
    const nextSegments: SourceMapSegment[] = [];

    for (const segment of this.segments) {
      const kind = segmentKind(segment);
      if (segment.ppEnd <= start) {
        nextSegments.push(segment);
        continue;
      }
      if (segment.ppBegin >= end) {
        nextSegments.push({
          ...segment,
          ppBegin: segment.ppBegin + delta,
          ppEnd: segment.ppEnd + delta,
        });
        continue;
      }

      if (segment.ppBegin < start) {
        nextSegments.push({
          ...segment,
          ppEnd: start,
        });
      }

      if (segment.ppEnd > end) {
        nextSegments.push({
          ...segment,
          ppBegin: end + delta,
          ppEnd: segment.ppEnd + delta,
          originalOffset:
            kind === "identity"
              ? segment.originalOffset + (end - segment.ppBegin)
              : segment.originalOffset,
        });
      }
    }

    if (newLength > 0 && origin?.file) {
      nextSegments.push({
        ppBegin: start,
        ppEnd: start + newLength,
        originalFile: origin.file,
        originalOffset: origin.offset,
        kind: "anchor",
      });
    }

    nextSegments.sort((a, b) => a.ppBegin - b.ppBegin || a.ppEnd - b.ppEnd);
    this.segments = nextSegments;
    this.length += delta;
  }

  // Applies non-overlapping ranges expressed against the current map in one ordered sweep.
  spliceRanges(replacements: readonly SourceMapReplacement[]): void {
    if (replacements.length === 0) {
      return;
    }

    const originalLength = this.length;
    const sorted = [...replacements].sort((a, b) => a.start - b.start || a.end - b.end);
    for (let i = 0; i < sorted.length; i++) {
      const replacement = sorted[i];
      if (
        replacement.start < 0
        || replacement.start > replacement.end
        || replacement.end > originalLength
        || replacement.newLength < 0
      ) {
        throw new Error(`Invalid source-map replacement range ${replacement.start}..${replacement.end}`);
      }
      const previous = sorted[i - 1];
      if (previous && (replacement.start < previous.end || replacement.start === previous.start)) {
        throw new Error(
          `Overlapping source-map replacement ranges ${previous.start}..${previous.end} and ${replacement.start}..${replacement.end}`,
        );
      }
    }

    const originalSegments = this.segments;
    const nextSegments: SourceMapSegment[] = [];
    let segmentIndex = 0;

    const appendMappedRange = (start: number, end: number, delta: number) => {
      if (start >= end) {
        return;
      }
      while (segmentIndex < originalSegments.length && originalSegments[segmentIndex].ppEnd <= start) {
        segmentIndex++;
      }
      while (segmentIndex < originalSegments.length) {
        const segment = originalSegments[segmentIndex];
        if (segment.ppBegin >= end) {
          break;
        }
        const intersectionStart = Math.max(start, segment.ppBegin);
        const intersectionEnd = Math.min(end, segment.ppEnd);
        if (intersectionStart < intersectionEnd) {
          nextSegments.push({
            ...segment,
            ppBegin: intersectionStart + delta,
            ppEnd: intersectionEnd + delta,
            originalOffset:
              segmentKind(segment) === "identity"
                ? segment.originalOffset + (intersectionStart - segment.ppBegin)
                : segment.originalOffset,
          });
        }
        if (segment.ppEnd > end) {
          break;
        }
        segmentIndex++;
      }
    };

    let sourceCursor = 0;
    let delta = 0;
    for (const replacement of sorted) {
      appendMappedRange(sourceCursor, replacement.start, delta);
      const outputStart = replacement.start + delta;
      if (replacement.newLength > 0 && replacement.origin?.file) {
        nextSegments.push({
          ppBegin: outputStart,
          ppEnd: outputStart + replacement.newLength,
          originalFile: replacement.origin.file,
          originalOffset: replacement.origin.offset,
          kind: "anchor",
        });
      }
      sourceCursor = replacement.end;
      delta += replacement.newLength - (replacement.end - replacement.start);
    }
    appendMappedRange(sourceCursor, originalLength, delta);

    this.segments = nextSegments;
    this.length = originalLength + delta;
  }

  toSourceMap(code: string): LuaPreprocessorSourceMap {
    if (code.length !== this.length) {
      throw new Error(`Source-map builder length ${this.length} does not match generated source length ${code.length}`);
    }
    return {
      preprocessedFile: {
        charLength: code.length,
        hash: hashTextSha1(code),
      },
      segments: this.segments.map((segment) => ({ ...segment })),
      sources: Object.fromEntries(Array.from(this.sources, ([filePath, source]) => [filePath, { ...source }])),
    };
  }
}

export function createIdentitySourceMap(source: string, filePath: string): LuaPreprocessorSourceMap {
  const builder = new SourceMapBuilder();
  builder.appendOriginal(source, filePath, 0, source);
  return builder.toSourceMap(source);
}

export function assertSourceMapMatchesSource(map: LuaPreprocessorSourceMap, source: string): void {
  if (map.preprocessedFile.charLength !== source.length || map.preprocessedFile.hash !== hashTextSha1(source)) {
    throw new Error("Source map does not describe the supplied generated source");
  }
}
