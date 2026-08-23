import {
    assertSourceMapMatchesSource,
    createIdentitySourceMap,
    SourceMapBuilder,
    mapPreprocessedOffset,
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

    it("detects a stale map at a mapped-code boundary", () => {
        const map = createIdentitySourceMap("original", "src/main.lua");
        expect(() => assertSourceMapMatchesSource(map, "changed")).toThrow(
            "Source map does not describe the supplied generated source",
        );
    });
});
