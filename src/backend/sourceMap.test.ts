import {
    assertSourceMapMatchesSource,
    createIdentitySourceMap,
    SourceMapBuilder,
    SourceMapReplacement,
    mapPreprocessedOffset,
    mapPreprocessedOffsetToLineColumn,
} from "./sourceMap";

describe("Source map builder", () => {
    it("should map appended original segments", () => {
        const builder = new SourceMapBuilder();
        builder.appendOriginal("abc", "src/a.lua", 0);
        builder.appendOriginal("def", "src/b.lua", 10);

        const map = builder.toSourceMap("abcdef");
        expect(map.preprocessedFile.charLength).toBe(6);

        const a0 = mapPreprocessedOffset(map, 0);
        const a2 = mapPreprocessedOffset(map, 2);
        const boundary = mapPreprocessedOffset(map, 3);
        const b0 = mapPreprocessedOffset(map, 4);
        const b2 = mapPreprocessedOffset(map, 5);

        expect(a0).toEqual({ file: "src/a.lua", offset: 0 });
        expect(a2).toEqual({ file: "src/a.lua", offset: 2 });
        expect(boundary).toEqual({ file: "src/a.lua", offset: 3 });
        expect(b0).toEqual({ file: "src/b.lua", offset: 11 });
        expect(b2).toEqual({ file: "src/b.lua", offset: 12 });
    });

    it("should splice replacements and remap offsets", () => {
        const builder = new SourceMapBuilder();
        builder.appendOriginal("hello", "src/a.lua", 0);
        builder.appendOriginal("world", "src/a.lua", 6);

        builder.spliceRange(2, 7, 2, { file: "src/a.lua", offset: 2 });
        const map = builder.toSourceMap("heXXrld");

        const start = mapPreprocessedOffset(map, 0);
        const middle = mapPreprocessedOffset(map, 2);
        const end = mapPreprocessedOffset(map, 6);

        expect(start).toEqual({ file: "src/a.lua", offset: 0 });
        expect(middle).toEqual({ file: "src/a.lua", offset: 2 });
        expect(end).toEqual({ file: "src/a.lua", offset: 10 });
    });

    it("anchors generated replacement text to one authored location", () => {
        const builder = new SourceMapBuilder();
        builder.appendOriginal("call()", "src/main.lua", 20, " ".repeat(20) + "call()");
        builder.spliceRange(0, 6, 12, { file: "src/main.lua", offset: 20 });
        const map = builder.toSourceMap("expandedLua!");

        expect(mapPreprocessedOffset(map, 0, "right")).toEqual({ file: "src/main.lua", offset: 20 });
        expect(mapPreprocessedOffset(map, 8, "right")).toEqual({ file: "src/main.lua", offset: 20 });
    });

    it("should batch non-overlapping replacements with the same mappings as descending splices", () => {
        const source = "abc__defgh!!ijk";
        const original = new SourceMapBuilder();
        original.appendOriginal("abc", "src/a.lua", 10);
        original.appendGenerated("__", null);
        original.appendOriginal("defgh", "src/b.lua", 20);
        original.appendGenerated("!!", { file: "src/generated.lua", offset: 99 });
        original.appendOriginal("ijk", "src/c.lua", 30);
        const originalMap = original.toSourceMap(source);
        const replacements: SourceMapReplacement[] = [
            { start: 0, end: 0, newLength: 2, origin: { file: "src/a.lua", offset: 10 } },
            { start: 2, end: 4, newLength: 1, origin: { file: "src/a.lua", offset: 12 } },
            { start: 7, end: 10, newLength: 0, origin: { file: "src/b.lua", offset: 22 } },
            { start: 12, end: 12, newLength: 3, origin: { file: "src/c.lua", offset: 30 } },
        ];

        const sequential = SourceMapBuilder.fromSourceMap(originalMap);
        for (const replacement of [...replacements].sort((a, b) => b.start - a.start)) {
            sequential.spliceRange(
                replacement.start,
                replacement.end,
                replacement.newLength,
                replacement.origin,
            );
        }
        const batched = SourceMapBuilder.fromSourceMap(originalMap);
        batched.spliceRanges(replacements);

        expect(batched.getCharLength()).toBe(sequential.getCharLength());
        expect(batched.getSegments()).toEqual(sequential.getSegments());
    });

    it("should reject overlapping batch replacement ranges", () => {
        const builder = new SourceMapBuilder();
        builder.appendOriginal("abcdef", "src/main.lua", 0);

        expect(() => builder.spliceRanges([
            { start: 1, end: 4, newLength: 1, origin: null },
            { start: 3, end: 5, newLength: 1, origin: null },
        ])).toThrow("Overlapping source-map replacement ranges");
    });

    it("copies mapped slices without attributing unmapped gaps", () => {
        const input = createIdentitySourceMap("first\nsecond", "src/main.lua");
        const builder = new SourceMapBuilder();
        builder.appendGenerated("prefix\n", null);
        builder.appendMappedSlice("second", input, 6);
        const map = builder.toSourceMap("prefix\nsecond");

        expect(mapPreprocessedOffset(map, 2, "right")).toBeNull();
        expect(mapPreprocessedOffset(map, 7, "right")).toEqual({ file: "src/main.lua", offset: 6 });
        expect(map.sources?.["src/main.lua"].content).toBe("first\nsecond");
    });

    it("maps sequential and out-of-order slices from the same input map", () => {
        const inputBuilder = new SourceMapBuilder();
        inputBuilder.appendOriginal("ab", "src/a.lua", 10, "          ab");
        inputBuilder.appendGenerated("--", { file: "src/generated.lua", offset: 30 });
        inputBuilder.appendOriginal("cd", "src/b.lua", 20, "                    cd");
        const input = inputBuilder.toSourceMap("ab--cd");

        const sequential = new SourceMapBuilder();
        sequential.appendMappedSlice("ab", input, 0);
        sequential.appendMappedSlice("--", input, 2);
        sequential.appendMappedSlice("cd", input, 4);
        expect(sequential.toSourceMap("ab--cd").segments).toEqual(input.segments);

        const outOfOrder = new SourceMapBuilder();
        outOfOrder.appendMappedSlice("cd", input, 4);
        outOfOrder.appendMappedSlice("ab", input, 0);
        const outOfOrderMap = outOfOrder.toSourceMap("cdab");
        expect(mapPreprocessedOffset(outOfOrderMap, 0, "right")).toEqual({ file: "src/b.lua", offset: 20 });
        expect(mapPreprocessedOffset(outOfOrderMap, 2, "right")).toEqual({ file: "src/a.lua", offset: 10 });
        expect(outOfOrderMap.sources?.["src/a.lua"].content).toBe("          ab");
        expect(outOfOrderMap.sources?.["src/b.lua"].content).toBe("                    cd");
    });

    it("maps offsets to line and column across LF and CRLF boundaries", () => {
        const map = createIdentitySourceMap("zero\r\none\ntwo", "src/main.lua");

        expect(mapPreprocessedOffsetToLineColumn(map, 4, "right")).toMatchObject({ line: 1, column: 4 });
        expect(mapPreprocessedOffsetToLineColumn(map, 5, "right")).toMatchObject({ line: 1, column: 5 });
        expect(mapPreprocessedOffsetToLineColumn(map, 6, "right")).toMatchObject({ line: 2, column: 0 });
        expect(mapPreprocessedOffsetToLineColumn(map, 10, "right")).toMatchObject({ line: 3, column: 0 });
    });

    it("detects a stale map at a mapped-code boundary", () => {
        const map = createIdentitySourceMap("original", "src/main.lua");
        expect(() => assertSourceMapMatchesSource(map, "changed")).toThrow(
            "Source map does not describe the supplied generated source",
        );
    });
});
