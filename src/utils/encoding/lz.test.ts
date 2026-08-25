import {
  gTicbuildLZBaselineConfig,
  gTicbuildLZRLESearchPresets,
  gTicbuildLZSearchPresets,
  lzCompress,
  lzCompressBest,
  lzDecompress,
  lzRleCompressBest,
  lzRleDecompress,
  type LZCompressionPreset,
} from "./lz";

function expectBytesEqual(actual: Uint8Array, expected: Uint8Array): void {
  expect(Array.from(actual)).toEqual(Array.from(expected));
}

describe("LZ compression", () => {
  const payloads = [
    new Uint8Array(),
    new TextEncoder().encode("the quick brown fox jumps over the quick brown fox"),
    Uint8Array.from({ length: 4096 }, (_, index) => (index % 64 < 3 ? index & 0xff : 0)),
    Uint8Array.from({ length: 4096 }, (_, index) => index % 251),
  ];

  it("round-trips every search preset", () => {
    for (const preset of gTicbuildLZSearchPresets) {
      for (const payload of payloads) {
        expectBytesEqual(lzDecompress(lzCompress(payload, preset.config)), payload);
      }
    }
  });

  it("round-trips every LZRLE search preset", () => {
    for (const preset of gTicbuildLZRLESearchPresets) {
      for (const payload of payloads) {
        expectBytesEqual(lzRleDecompress(lzCompress(payload, preset.config)), payload);
      }
    }
  });

  it("uses RLE runs when they improve the complete stream", () => {
    const payload = Uint8Array.from({ length: 4096 }, () => 0x5a);
    const lz = lzCompressBest(payload);
    const lzrle = lzRleCompressBest(payload);

    expect(lzrle.data.length).toBeLessThan(lz.data.length);
    expect(lzrle.data[0]).toBe(0x81);
    expect(lzrle.config.useRLE).toBe(true);
    expectBytesEqual(lzRleDecompress(lzrle.data), payload);
  });

  it("keeps base LZ attempts in the LZRLE search so the extension cannot regress size", () => {
    for (const payload of payloads) {
      const lz = lzCompressBest(payload);
      const lzrle = lzRleCompressBest(payload);

      expect(lzrle.data.length).toBeLessThanOrEqual(lz.data.length);
      expectBytesEqual(lzRleDecompress(lzrle.data), payload);
    }
  });

  it("uses the smallest preset result and reports every attempt", () => {
    for (const payload of payloads) {
      const result = lzCompressBest(payload);
      const expectedLength = Math.min(...result.attempts.map((attempt) => attempt.byteLength));

      expect(result.data.length).toBe(expectedLength);
      expect(result.attempts.map((attempt) => attempt.presetName)).toEqual(
        gTicbuildLZSearchPresets.map((preset) => preset.name),
      );
      expect(result.data.length).toBeLessThanOrEqual(lzCompress(payload, gTicbuildLZBaselineConfig).length);
      expectBytesEqual(lzDecompress(result.data), payload);
    }
  });

  it("keeps the first preset when compressed sizes tie", () => {
    const presets: readonly LZCompressionPreset[] = [
      { name: "first", config: gTicbuildLZBaselineConfig },
      { name: "second", config: { windowSize: 16383, minMatchLength: 5, maxMatchLength: 16383, useRLE: false } },
    ];

    expect(lzCompressBest(new Uint8Array(), presets).presetName).toBe("first");
  });

  it("rejects an empty search portfolio", () => {
    expect(() => lzCompressBest(new Uint8Array(), [])).toThrow("requires at least one preset");
  });

  it("locks the evidence-derived preset matrix", () => {
    expect(gTicbuildLZSearchPresets).toEqual([
      { name: "baseline", config: { windowSize: 16, minMatchLength: 4, maxMatchLength: 30, useRLE: false } },
      { name: "near", config: { windowSize: 127, minMatchLength: 5, maxMatchLength: 30, useRLE: false } },
      { name: "short-match", config: { windowSize: 4095, minMatchLength: 3, maxMatchLength: 30, useRLE: false } },
      { name: "balanced", config: { windowSize: 16383, minMatchLength: 6, maxMatchLength: 1023, useRLE: false } },
      { name: "broad", config: { windowSize: 16383, minMatchLength: 5, maxMatchLength: 16383, useRLE: false } },
    ]);
  });

  it("pairs every evidence-derived preset with an RLE-enabled attempt", () => {
    expect(gTicbuildLZRLESearchPresets.map((preset) => preset.name)).toEqual([
      "baseline",
      "baseline+rle",
      "near",
      "near+rle",
      "short-match",
      "short-match+rle",
      "balanced",
      "balanced+rle",
      "broad",
      "broad+rle",
    ]);
    for (let index = 0; index < gTicbuildLZSearchPresets.length; index++) {
      const base = gTicbuildLZRLESearchPresets[index * 2];
      const rle = gTicbuildLZRLESearchPresets[index * 2 + 1];
      expect(base.config).toEqual(gTicbuildLZSearchPresets[index].config);
      expect(rle.config).toEqual({ ...base.config, useRLE: true });
    }
  });
});
