import * as cons from "../console";
import { getCombinedCodeBytes, parseTic80Cart } from "./cartLoader";
import { AssembleTic80Cart, serializeChunk } from "./cartWriter";

describe("TIC-80 cart unknown chunk types", () => {
  let warningSpy: jest.SpyInstance;

  beforeEach(() => {
    warningSpy = jest.spyOn(cons, "warning").mockImplementation(() => undefined);
  });

  afterEach(() => warningSpy.mockRestore());

  it.each([0, 20, 31])("preserves type %i, bank and exact payload while continuing to read code", (chunkType) => {
    const cart = parseTic80Cart(Uint8Array.from([
      (2 << 5) | 5, 1, 0, 0, 0x61,
      // Reserved bytes do not extend bank numbers for unknown chunk types.
      (7 << 5) | chunkType, 3, 0, 0xff, 0x42, 0, 0,
      (1 << 5) | 5, 1, 0, 0, 0x62,
    ]));

    expect(cart.chunks).toEqual([
      { chunkType: "CODE", bank: 2, data: Uint8Array.of(0x61) },
      { chunkType, bank: 7, data: Uint8Array.of(0x42, 0, 0) },
      { chunkType: "CODE", bank: 1, data: Uint8Array.of(0x62) },
    ]);
    expect(getCombinedCodeBytes(cart)).toEqual(Uint8Array.of(0x61, 0x62));
    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy).toHaveBeenCalledWith(
      `Unknown TIC-80 chunk type ${chunkType} at offset 5 (bank 7, 3 bytes); preserving payload`,
    );
  });

  it("retains distinct unknown types in the same bank", () => {
    const cart = parseTic80Cart(Uint8Array.from([
      (3 << 5) | 20, 1, 0, 0, 0x61,
      (3 << 5) | 31, 1, 0, 0, 0x62,
    ]));

    expect(cart.chunks).toEqual([
      { chunkType: 20, bank: 3, data: Uint8Array.of(0x61) },
      { chunkType: 31, bank: 3, data: Uint8Array.of(0x62) },
    ]);
    expect(warningSpy).toHaveBeenCalledTimes(2);
    expect(getCombinedCodeBytes(cart)).toBeNull();
  });

  it("preserves empty unknown chunks without consuming the next chunk", () => {
    const cart = parseTic80Cart(Uint8Array.from([
      31, 0, 0, 0,
      1, 1, 0, 0, 0x42,
    ]));

    expect(cart.chunks).toEqual([
      { chunkType: 31, bank: 0, data: new Uint8Array() },
      { chunkType: "TILES", bank: 0, data: Uint8Array.of(0x42) },
    ]);
  });

  it("still rejects a truncated unknown chunk payload", () => {
    expect(() => parseTic80Cart(Uint8Array.from([31, 2, 0, 0, 0x42])))
      .toThrow("Unexpected end of data while reading chunk data");
    expect(warningSpy).not.toHaveBeenCalled();
  });

  it("still rejects a truncated header after an unknown chunk", () => {
    expect(() => parseTic80Cart(Uint8Array.from([31, 1, 0, 0, 0x42, 1, 2])))
      .toThrow("Unexpected end of data while reading chunk header");
  });

  it("rejects serialization of preserved unknown chunks with an explicit error", async () => {
    const cart = parseTic80Cart(Uint8Array.from([31, 1, 0, 0, 0x42]));
    const chunk = cart.chunks[0];
    const error = "Unsupported chunk type for serialization: UNKNOWN(31)";

    expect(() => serializeChunk(chunk.chunkType, chunk.data, chunk.bank)).toThrow(error);
    await expect(AssembleTic80Cart(cart)).rejects.toThrow(error);
  });
});
