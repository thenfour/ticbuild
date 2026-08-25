/*

Plain Lua table decoder sketch. This handles both LZ and LZRLE streams; LZ
streams never contain the 0x81 branch. The checked copy/paste reference is
documented in README.md under "LZ and LZRLE stream format".

local function lz_varint(src, si)
  local value, factor = 0, 1
  while true do
    local byte = src[si]
    if byte == nil then error("truncated LZ varint") end
    si = si + 1
    value = value + (byte % 0x80) * factor
    if byte < 0x80 then return value, si end
    factor = factor * 0x80
  end
end

function unlzrle(src)
  local dst = {}
  local si = 1
  while si <= #src do
    local tag = src[si]
    si = si + 1
    if tag == 0x00 then
      local length
      length, si = lz_varint(src, si)
      if si + length - 1 > #src then error("truncated LZ literal") end
      for _ = 1, length do
        dst[#dst + 1] = src[si]
        si = si + 1
      end
    elseif tag == 0x80 then
      local length, distance
      length, si = lz_varint(src, si)
      distance, si = lz_varint(src, si)
      if distance < 1 or distance > #dst then error("invalid LZ distance") end
      for _ = 1, length do
        dst[#dst + 1] = dst[#dst - distance + 1]
      end
    elseif tag == 0x81 then
      local length
      length, si = lz_varint(src, si)
      local value = src[si]
      if value == nil then error("truncated LZRLE run") end
      si = si + 1
      for _ = 1, length do dst[#dst + 1] = value end
    else
      error("unknown LZ tag: " .. tag)
    end
  end
  return dst
end

*/

// LZ tune for
// * window size (max dist) (smaller = smaller decoder); prob around 16.
// * minimum match length (there's a sweet spot between backrefs & literals -- probably 3 or 4)
// * max len -- there's diminishing returns after a certain point but doesn't matter much. probably around 18-20.
// *

export interface LZConfig {
  readonly windowSize: number; // how far back matches can refer (e.g. 16..4096)
  readonly minMatchLength: number; // emit a match only if >= this (e.g. 3..6)
  readonly maxMatchLength: number; // cap match length (e.g. 18..258)
  readonly useRLE: boolean; // enable 0x81 opcode (repeat byte)
}

export interface LZCompressionPreset {
  readonly name: string;
  readonly config: LZConfig;
}

export interface LZCompressionAttempt {
  readonly presetName: string;
  readonly config: LZConfig;
  readonly byteLength: number;
}

export interface LZCompressionResult {
  readonly data: Uint8Array;
  readonly presetName: string;
  readonly config: LZConfig;
  readonly attempts: readonly LZCompressionAttempt[];
}

/** ---- Varint (unsigned LEB128) ---- */
function writeVarint(out: number[], x: number) {
  // x must be >= 0 and <= 2^31-ish; good enough for asset sizes
  while (x >= 0x80) {
    out.push((x & 0x7f) | 0x80);
    x >>>= 7;
  }
  out.push(x);
}

function readVarint(data: Uint8Array, i: number): { value: number; next: number } {
  let x = 0;
  let shift = 0;
  while (true) {
    if (i >= data.length) throw new Error("truncated varint");
    const b = data[i++];
    x |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) break;
    shift += 7;
    if (shift > 35) throw new Error("varint too large");
  }
  return { value: x >>> 0, next: i };
}

/** Roughly how many bytes a varint would take (for cheap cost comparisons). */
function varintSize(x: number): number {
  let n = 1;
  while (x >= 0x80) {
    n++;
    x >>>= 7;
  }
  return n;
}

/** ---- Decompress ---- */
export function lzDecompress(encoded: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;

  while (i < encoded.length) {
    const tag = encoded[i++];

    if (tag === 0x00) {
      const r = readVarint(encoded, i);
      i = r.next;
      const len = r.value;
      if (i + len > encoded.length) throw new Error("truncated literal run");
      for (let j = 0; j < len; j++) out.push(encoded[i++]);
    } else if (tag === 0x80) {
      const rl = readVarint(encoded, i);
      i = rl.next;
      const rd = readVarint(encoded, i);
      i = rd.next;
      const len = rl.value;
      const dist = rd.value;

      if (dist <= 0 || dist > out.length) throw new Error("invalid match distance");
      for (let j = 0; j < len; j++) {
        out.push(out[out.length - dist]);
      }
    } else if (tag === 0x81) {
      const rl = readVarint(encoded, i);
      i = rl.next;
      const len = rl.value;
      if (i >= encoded.length) throw new Error("truncated rle");
      const v = encoded[i++];
      for (let j = 0; j < len; j++) out.push(v);
    } else {
      throw new Error(`unknown tag 0x${tag.toString(16)}`);
    }
  }

  return Uint8Array.from(out);
}

// note that the playroutine's LZ decoder may need to be modified if this changes.
// for example it does NOT support RLE (0x81) opcodes.
// Also the window size affects decoder memory usage.
export const gTicbuildLZBaselineConfig: LZConfig = {
  windowSize: 16,
  minMatchLength: 4,
  maxMatchLength: 30,
  useRLE: false,
};

// this set was chosen based on evidence from
// npm run benchmark:lz-configs
// The 16383 limits stay within two unsigned LEB128 bytes;
// candidates beyond that point cost more to encode have diminishing gains.
// Keep the baseline first so equal-size results retain the smallest historical window.
export const gTicbuildLZSearchPresets: readonly LZCompressionPreset[] = [
  { name: "baseline", config: gTicbuildLZBaselineConfig },
  {
    name: "near",
    config: { windowSize: 127, minMatchLength: 5, maxMatchLength: 30, useRLE: false },
  },
  {
    name: "short-match",
    config: { windowSize: 4095, minMatchLength: 3, maxMatchLength: 30, useRLE: false },
  },
  {
    name: "balanced",
    config: { windowSize: 16383, minMatchLength: 6, maxMatchLength: 1023, useRLE: false },
  },
  {
    name: "broad",
    config: { windowSize: 16383, minMatchLength: 5, maxMatchLength: 16383, useRLE: false },
  },
];

// LZRLE is LZ with the 0x81 repeat-byte opcode
// - a valid stream does not have to contain one.
// Search both forms of every preset.
// Keeping the base attempt first means
// RLE is selected only when it makes the complete stream strictly smaller.
export const gTicbuildLZRLESearchPresets: readonly LZCompressionPreset[] = gTicbuildLZSearchPresets.flatMap(
  (preset) => [
    preset,
    {
      name: `${preset.name}+rle`,
      config: { ...preset.config, useRLE: true },
    },
  ],
);

/** ---- Compress (greedy) ---- */
export function lzCompress(input: Uint8Array, cfg: LZConfig): Uint8Array {
  const { windowSize, minMatchLength, maxMatchLength, useRLE } = cfg;

  if (windowSize < 1) throw new Error("windowSize must be >= 1");
  if (minMatchLength < 2) throw new Error("minMatchLength should be >= 2 (usually 3)");
  if (maxMatchLength < minMatchLength) throw new Error("maxMatchLength must be >= minMatchLength");

  const out: number[] = [];
  const lits: number[] = [];
  const matchPositions = new Map<number, number[]>();
  const matchKeyLength = Math.min(minMatchLength, 3);

  function getMatchKey(position: number): number | undefined {
    if (position + matchKeyLength > input.length) return undefined;
    let key = 0;
    for (let offset = 0; offset < matchKeyLength; offset++) {
      key = (key << 8) | input[position + offset];
    }
    return key;
  }

  function addMatchPosition(position: number) {
    const key = getMatchKey(position);
    if (key === undefined) return;
    const positions = matchPositions.get(key);
    if (positions) {
      positions.push(position);
    } else {
      matchPositions.set(key, [position]);
    }
  }

  function addMatchPositions(start: number, length: number) {
    for (let position = start; position < start + length; position++) {
      addMatchPosition(position);
    }
  }

  function flushLits() {
    if (lits.length === 0) return;
    out.push(0x00);
    writeVarint(out, lits.length);
    out.push(...lits);
    lits.length = 0;
  }

  function emitMatch(len: number, dist: number) {
    out.push(0x80);
    writeVarint(out, len);
    writeVarint(out, dist);
  }

  function emitRLE(len: number, value: number) {
    out.push(0x81);
    writeVarint(out, len);
    out.push(value);
  }

  // Estimate encoded size of candidates (to choose between LZ vs RLE vs literals).
  const matchCost = (len: number, dist: number) => 1 + varintSize(len) + varintSize(dist); // 0x80 + len + dist
  const rleCost = (len: number) => 1 + varintSize(len) + 1; // 0x81 + len + value
  const litCost = (len: number) => 1 + varintSize(len) + len; // 0x00 + len + bytes

  let i = 0;
  while (i < input.length) {
    // Optional: detect RLE run at i
    let rleLen = 0;
    if (useRLE) {
      const v = input[i];
      let k = i + 1;
      const cap = Math.min(input.length, i + maxMatchLength);
      while (k < cap && input[k] === v) k++;
      rleLen = k - i;
    }

    // Find best LZ match (greedy longest within window, capped)
    let bestLen = 0;
    let bestDist = 0;

    const maxDist = Math.min(windowSize, i);
    const maxLenCap = Math.min(maxMatchLength, input.length - i);

    // Only positions with the same first 2-3 bytes can satisfy minMatchLength.
    // Visit them nearest-first to preserve the output of the former exhaustive
    // distance scan while avoiding work on impossible matches.
    const key = getMatchKey(i);
    const candidates = key === undefined ? undefined : matchPositions.get(key);
    for (let candidateIndex = (candidates?.length ?? 0) - 1; candidateIndex >= 0; candidateIndex--) {
      const dist = i - candidates![candidateIndex];
      if (dist > maxDist) break;
      let len = 0;
      // Compare input[i + len] vs input[i + len - dist]
      while (len < maxLenCap && input[i + len] === input[i + len - dist]) len++;
      if (len > bestLen) {
        bestLen = len;
        bestDist = dist;
        if (bestLen === maxLenCap) break; // can't do better
      }
    }

    const canMatch = bestLen >= minMatchLength;
    const canRLE = useRLE && rleLen >= minMatchLength;

    if (!canMatch && !canRLE) {
      // literal byte
      addMatchPosition(i);
      lits.push(input[i++]);
      // optional: keep literals from growing too huge (not necessary, but keeps memory tame)
      if (lits.length >= 1 << 15) flushLits();
      continue;
    }

    // Choose best operation by cost-per-byte-saved. We'll compare:
    // - LZ match candidate (if any)
    // - RLE candidate (if any)
    // - otherwise literals
    //
    // For fairness, we compare costs for encoding exactly N bytes of output.
    // For LZ, N = bestLen; for RLE, N = rleLen.
    //
    // If both exist, we can also clamp to the same N and compare, but
    // typically you want the op that encodes MORE bytes cheaply.
    let choose: "LZ" | "RLE" | "LIT" = "LIT";
    let useLen = 1;

    // Start with "literal run" as baseline (encode next byte as literal; we'll accumulate)
    let bestScore = Infinity;

    if (canMatch) {
      const len = Math.min(bestLen, maxLenCap);
      const cost = matchCost(len, bestDist);
      const score = cost / len; // lower is better
      bestScore = score;
      choose = "LZ";
      useLen = len;
    }

    if (canRLE) {
      const len = Math.min(rleLen, maxLenCap);
      const cost = rleCost(len);
      const score = cost / len;
      // Prefer RLE if it wins on score, or ties but is longer (often helps)
      if (score < bestScore || (score === bestScore && len > useLen)) {
        bestScore = score;
        choose = "RLE";
        useLen = len;
      }
    }

    // Emit chosen op
    flushLits();
    if (choose === "LZ") {
      addMatchPositions(i, useLen);
      emitMatch(useLen, bestDist);
      i += useLen;
    } else if (choose === "RLE") {
      addMatchPositions(i, useLen);
      emitRLE(useLen, input[i]);
      i += useLen;
    } else {
      // Shouldn't happen given canMatch/canRLE checks, but keep safe:
      addMatchPosition(i);
      lits.push(input[i++]);
    }
  }

  flushLits();
  return Uint8Array.from(out);
}

// finds the best compression result from the preset set
export function lzCompressBest(
  input: Uint8Array,
  presets: readonly LZCompressionPreset[] = gTicbuildLZSearchPresets,
): LZCompressionResult {
  if (presets.length === 0) {
    throw new Error("LZ compression search requires at least one preset");
  }

  const attempts: LZCompressionAttempt[] = [];
  let bestData: Uint8Array | undefined;
  let bestPreset: LZCompressionPreset | undefined;

  for (const preset of presets) {
    const data = lzCompress(input, preset.config);
    attempts.push({
      presetName: preset.name,
      config: preset.config,
      byteLength: data.length,
    });
    if (!bestData || data.length < bestData.length) {
      bestData = data;
      bestPreset = preset;
    }
  }

  return {
    data: bestData!,
    presetName: bestPreset!.name,
    config: bestPreset!.config,
    attempts,
  };
}

export function lzRleCompressBest(input: Uint8Array): LZCompressionResult {
  return lzCompressBest(input, gTicbuildLZRLESearchPresets);
}

export function lzRleDecompress(encoded: Uint8Array): Uint8Array {
  return lzDecompress(encoded);
}
