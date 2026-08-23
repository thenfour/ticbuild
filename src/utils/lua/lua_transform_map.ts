export type LuaTransformSegmentKind = "identity" | "anchor";

// Maps a transformed Lua output range back to an offset in the Lua text supplied
// to the transformation. It deliberately has no file or Source Map v3 concepts.
export type LuaTransformSegment = {
  outputBegin: number;
  outputEnd: number;
  inputOffset: number;
  kind: LuaTransformSegmentKind;
  originalName?: string;
};

export type LuaTransformMap = {
  inputLength: number;
  outputLength: number;
  segments: LuaTransformSegment[];
};

export type LuaTransformLocation = {
  offset: number;
  originalName?: string;
};

export type LuaTransformBias = "left" | "right";

function locationWithinSegment(segment: LuaTransformSegment, offset: number): LuaTransformLocation {
  return {
    offset: segment.kind === "identity"
      ? segment.inputOffset + (offset - segment.outputBegin)
      : segment.inputOffset,
    originalName: segment.originalName,
  };
}

export function mapLuaTransformOffset(
  map: LuaTransformMap,
  offset: number,
  bias: LuaTransformBias = "left",
): LuaTransformLocation | null {
  if (offset < 0 || offset > map.outputLength) {
    return null;
  }

  let lo = 0;
  let hi = map.segments.length - 1;
  let candidate = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (map.segments[mid].outputBegin <= offset) {
      candidate = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (candidate < 0) {
    return null;
  }

  if (bias === "left" && candidate > 0 && map.segments[candidate].outputBegin === offset) {
    const previous = map.segments[candidate - 1];
    if (previous.outputEnd === offset) {
      return locationWithinSegment(previous, offset);
    }
  }

  const segment = map.segments[candidate];
  if (offset >= segment.outputBegin && offset < segment.outputEnd) {
    return locationWithinSegment(segment, offset);
  }
  if (bias === "left" && offset === segment.outputEnd && segment.outputEnd > segment.outputBegin) {
    return locationWithinSegment(segment, offset);
  }
  return null;
}

export class LuaTransformMapBuilder {
  private readonly inputLength: number;
  private outputLength = 0;
  private segments: LuaTransformSegment[] = [];

  constructor(inputLength: number) {
    this.inputLength = inputLength;
  }

  static identity(length: number): LuaTransformMapBuilder {
    const builder = new LuaTransformMapBuilder(length);
    if (length > 0) {
      builder.appendIdentity(length, 0);
    }
    return builder;
  }

  static fromMap(map: LuaTransformMap): LuaTransformMapBuilder {
    const builder = new LuaTransformMapBuilder(map.inputLength);
    builder.outputLength = map.outputLength;
    builder.segments = map.segments.map((segment) => ({ ...segment }));
    return builder;
  }

  getOutputLength(): number {
    return this.outputLength;
  }

  mapOffset(offset: number, bias: LuaTransformBias = "left"): LuaTransformLocation | null {
    return mapLuaTransformOffset({
      inputLength: this.inputLength,
      outputLength: this.outputLength,
      segments: this.segments,
    }, offset, bias);
  }

  appendUnmapped(length: number): void {
    this.outputLength += length;
  }

  appendIdentity(length: number, inputOffset: number, originalName?: string): void {
    if (length <= 0) {
      return;
    }
    this.segments.push({
      outputBegin: this.outputLength,
      outputEnd: this.outputLength + length,
      inputOffset,
      kind: "identity",
      originalName,
    });
    this.outputLength += length;
  }

  appendAnchor(length: number, inputOffset: number, originalName?: string): void {
    if (length <= 0) {
      return;
    }
    this.segments.push({
      outputBegin: this.outputLength,
      outputEnd: this.outputLength + length,
      inputOffset,
      kind: "anchor",
      originalName,
    });
    this.outputLength += length;
  }

  appendMappedSlice(length: number, inputMap: LuaTransformMap, inputStart: number): void {
    if (length <= 0) {
      return;
    }
    const inputEnd = inputStart + length;
    if (inputStart < 0 || inputEnd > inputMap.outputLength) {
      throw new Error(`Lua transform slice ${inputStart}..${inputEnd} is outside output length ${inputMap.outputLength}`);
    }
    const outputStart = this.outputLength;
    for (const segment of inputMap.segments) {
      if (segment.outputEnd <= inputStart) {
        continue;
      }
      if (segment.outputBegin >= inputEnd) {
        break;
      }
      const begin = Math.max(segment.outputBegin, inputStart);
      const end = Math.min(segment.outputEnd, inputEnd);
      if (begin >= end) {
        continue;
      }
      this.segments.push({
        outputBegin: outputStart + (begin - inputStart),
        outputEnd: outputStart + (end - inputStart),
        inputOffset: segment.kind === "identity"
          ? segment.inputOffset + (begin - segment.outputBegin)
          : segment.inputOffset,
        kind: segment.kind,
        originalName: segment.originalName,
      });
    }
    this.outputLength += length;
  }

  spliceRange(
    start: number,
    end: number,
    replacementLength: number,
    origin: LuaTransformLocation | null,
    kind: LuaTransformSegmentKind = "anchor",
  ): void {
    if (start < 0 || start > end || end > this.outputLength) {
      throw new Error(`Invalid Lua transform splice ${start}..${end} for output length ${this.outputLength}`);
    }
    const delta = replacementLength - (end - start);
    const next: LuaTransformSegment[] = [];
    for (const segment of this.segments) {
      if (segment.outputEnd <= start) {
        next.push(segment);
        continue;
      }
      if (segment.outputBegin >= end) {
        next.push({
          ...segment,
          outputBegin: segment.outputBegin + delta,
          outputEnd: segment.outputEnd + delta,
        });
        continue;
      }
      if (segment.outputBegin < start) {
        next.push({ ...segment, outputEnd: start });
      }
      if (segment.outputEnd > end) {
        next.push({
          ...segment,
          outputBegin: end + delta,
          outputEnd: segment.outputEnd + delta,
          inputOffset: segment.kind === "identity"
            ? segment.inputOffset + (end - segment.outputBegin)
            : segment.inputOffset,
        });
      }
    }
    if (replacementLength > 0 && origin) {
      next.push({
        outputBegin: start,
        outputEnd: start + replacementLength,
        inputOffset: origin.offset,
        kind,
        originalName: origin.originalName,
      });
    }
    next.sort((a, b) => a.outputBegin - b.outputBegin || a.outputEnd - b.outputEnd);
    this.segments = next;
    this.outputLength += delta;
  }

  toMap(): LuaTransformMap {
    let previousEnd = 0;
    for (const segment of this.segments) {
      if (
        segment.outputBegin < previousEnd ||
        segment.outputEnd <= segment.outputBegin ||
        segment.outputEnd > this.outputLength ||
        segment.inputOffset < 0 ||
        segment.inputOffset > this.inputLength
      ) {
        throw new Error("Lua transform map contains an invalid or overlapping segment");
      }
      previousEnd = segment.outputEnd;
    }
    return {
      inputLength: this.inputLength,
      outputLength: this.outputLength,
      segments: this.segments.map((segment) => ({ ...segment })),
    };
  }
}
