import { AssembleTic80Cart } from "./cartWriter";
import { parseTic80Cart } from "./cartLoader";
import { Tic80CartChunk } from "./tic80";

describe("TIC-80 cart bank support", () => {
  it("should round-trip banked chunks", async () => {
    const chunks: Tic80CartChunk[] = [
      { chunkType: "CODE", bank: 0, data: new Uint8Array([1, 2, 3]) },
      { chunkType: "CODE", bank: 1, data: new Uint8Array([4, 5]) },
    ];

    const output = await AssembleTic80Cart({ chunks });
    const parsed = parseTic80Cart(output);

    expect(parsed.chunks).toHaveLength(2);
    expect(parsed.chunks[0].chunkType).toBe("CODE");
    expect(parsed.chunks[0].bank).toBe(0);
    expect(Array.from(parsed.chunks[0].data)).toEqual([1, 2, 3]);
    expect(parsed.chunks[1].chunkType).toBe("CODE");
    expect(parsed.chunks[1].bank).toBe(1);
    expect(Array.from(parsed.chunks[1].data)).toEqual([4, 5]);
  });

  it("should round-trip private extended CODE banks", async () => {
    const chunks: Tic80CartChunk[] = [{ chunkType: "CODE", bank: 8, data: new Uint8Array([1, 2, 3]) }];

    const output = await AssembleTic80Cart({ chunks, allowExtendedCodeBanks: true });
    const parsed = parseTic80Cart(output);

    expect(output[0]).toBe(5);
    expect(output[3]).toBe(1);
    expect(parsed.chunks).toHaveLength(1);
    expect(parsed.chunks[0].chunkType).toBe("CODE");
    expect(parsed.chunks[0].bank).toBe(8);
    expect(Array.from(parsed.chunks[0].data)).toEqual([1, 2, 3]);
  });

  it("should reject duplicate chunk type in same bank", async () => {
    const chunks: Tic80CartChunk[] = [
      { chunkType: "CODE", bank: 0, data: new Uint8Array([1]) },
      { chunkType: "CODE", bank: 0, data: new Uint8Array([2]) },
    ];

    await expect(AssembleTic80Cart({ chunks })).rejects.toThrow("Duplicate chunk type in TIC-80 cart: CODE bank 0");
  });

  it("should validate bank index against chunk capabilities", async () => {
    const chunks: Tic80CartChunk[] = [{ chunkType: "CODE_COMPRESSED", bank: 1, data: new Uint8Array([1]) }];

    await expect(AssembleTic80Cart({ chunks })).rejects.toThrow(
      "Bank index 1 out of range for chunk CODE_COMPRESSED (0..0)",
    );
  });

  it("should reject private extended CODE banks without opt-in", async () => {
    const chunks: Tic80CartChunk[] = [{ chunkType: "CODE", bank: 8, data: new Uint8Array([1]) }];

    await expect(AssembleTic80Cart({ chunks })).rejects.toThrow(
      "Bank index 8 out of range for chunk CODE (0..7). Enable allowExtendedCodeBanks",
    );
  });
});
