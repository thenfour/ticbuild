import { SourceMapBuilder, mapPreprocessedOffset } from "./sourceMap";

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
});