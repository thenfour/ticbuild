// preprocessed lua location : file + offset mapping.

import { hashTextSha1 } from "../utils/utils";

export type SourceMapSegment = {
    ppBegin: number;
    ppEnd: number;
    originalFile: string;
    originalOffset: number;
};

export type LuaPreprocessorSourceMap = {
    preprocessedFile: {
        charLength: number;
        hash: string;
    };
    segments: SourceMapSegment[];
};

export type SourceMapLocation = {
    file: string;
    offset: number;
};

// Maps a preprocessed file offset back to the original source file and offset if possible.
export function mapPreprocessedOffset(map: LuaPreprocessorSourceMap, offset: number): SourceMapLocation | null {
    if (offset < 0) {
        return null;
    }
    const segments = map.segments;
    let lo = 0;
    let hi = segments.length - 1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const seg = segments[mid];
        if (offset < seg.ppBegin) {
            hi = mid - 1;
            continue;
        }
        if (offset > seg.ppEnd) {
            lo = mid + 1;
            continue;
        }
        if (offset === seg.ppEnd && offset > seg.ppBegin) {
            return { file: seg.originalFile, offset: seg.originalOffset + (offset - seg.ppBegin) };
        }
        if (offset >= seg.ppBegin && offset < seg.ppEnd) {
            return { file: seg.originalFile, offset: seg.originalOffset + (offset - seg.ppBegin) };
        }
        break;
    }

    return null;
}

// progressively builds a source map by appending segments and splicing as needed when text is replaced.
// as the preprocessor advances through the file, it appends segments here.
export class SourceMapBuilder {
    private segments: SourceMapSegment[] = [];
    private length = 0;

    // length of the preprocessed code
    getCharLength(): number {
        return this.length;
    }

    // access to raw segments
    getSegments(): SourceMapSegment[] {
        return this.segments;
    }

    appendOriginal(text: string, originalFile: string, originalOffset: number): void {
        if (!text) {
            return;
        }
        const start = this.length;
        const end = start + text.length;
        this.segments.push({ ppBegin: start, ppEnd: end, originalFile, originalOffset });
        this.length = end;
    }

    appendGenerated(text: string, origin: SourceMapLocation | null): void {
        if (!text) {
            return;
        }
        const start = this.length;
        const end = start + text.length;
        const originalFile = origin?.file ?? "";
        const originalOffset = origin?.offset ?? 0;
        this.segments.push({ ppBegin: start, ppEnd: end, originalFile, originalOffset });
        this.length = end;
    }

    appendMap(other: SourceMapBuilder): void {
        if (other.length === 0) {
            return;
        }
        const offset = this.length;
        for (const seg of other.segments) {
            this.segments.push({
                ppBegin: seg.ppBegin + offset,
                ppEnd: seg.ppEnd + offset,
                originalFile: seg.originalFile,
                originalOffset: seg.originalOffset,
            });
        }
        this.length += other.length;
    }

    mapOffset(offset: number): SourceMapLocation | null {
        const map = this.toSourceMap("");
        return mapPreprocessedOffset(map, offset);
    }

    // when text is replaced in the preprocessed code, we need to splice the source map segments accordingly.
    spliceRange(start: number, end: number, newLength: number, origin: SourceMapLocation | null): void {
        if (start > end) {
            return;
        }
        const delta = newLength - (end - start);
        const nextSegments: SourceMapSegment[] = [];

        for (const seg of this.segments) {
            if (seg.ppEnd <= start) {
                nextSegments.push(seg);
                continue;
            }
            if (seg.ppBegin >= end) {
                nextSegments.push({
                    ppBegin: seg.ppBegin + delta,
                    ppEnd: seg.ppEnd + delta,
                    originalFile: seg.originalFile,
                    originalOffset: seg.originalOffset,
                });
                continue;
            }

            if (seg.ppBegin < start) {
                nextSegments.push({
                    ppBegin: seg.ppBegin,
                    ppEnd: start,
                    originalFile: seg.originalFile,
                    originalOffset: seg.originalOffset,
                });
            }

            if (seg.ppEnd > end) {
                const originalOffset = seg.originalOffset + (end - seg.ppBegin);
                nextSegments.push({
                    ppBegin: end + delta,
                    ppEnd: seg.ppEnd + delta,
                    originalFile: seg.originalFile,
                    originalOffset,
                });
            }
        }

        if (newLength > 0) {
            const startOffset = start;
            const file = origin?.file ?? "";
            const offset = origin?.offset ?? 0;
            nextSegments.push({
                ppBegin: startOffset,
                ppEnd: startOffset + newLength,
                originalFile: file,
                originalOffset: offset,
            });
        }

        nextSegments.sort((a, b) => a.ppBegin - b.ppBegin);
        this.segments = nextSegments;
        this.length += delta;
    }

    toSourceMap(code: string): LuaPreprocessorSourceMap {
        return {
            preprocessedFile: {
                charLength: code.length,
                hash: hashTextSha1(code),
            },
            segments: this.segments,
        };
    }
}
