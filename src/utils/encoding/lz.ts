/*

Lua reference decoder (peek - poke)



-- Read unsigned LEB128 varint from memory.
-- base:   start address of encoded stream
-- si:     current offset (0-based) into the stream
-- srcLen: total length of the encoded stream (in bytes)
-- Returns: value, next_si
local function varint(base, si, srcLen)
	local x, f = 0, 1
	while true do
		local b = peek(base + si)
		si = si + 1
		x = x + (b % 0x80) * f
		if b < 0x80 then
			return x, si
		end
		f = f * 0x80
	end
end

-- LZ-Decompress from [src .. src+srcLen-1] into [dst ..).
-- Returns number of decompressed bytes written.
local function lzdm(src, srcLen, dst)
	local si, di = 0, 0
	while si < srcLen do
		local t = peek(src + si)
		si = si + 1
		if t == 0 then
			local l
			l, si = varint(src, si, srcLen)
			for j = 1, l do
				poke(dst + di, peek(src + si))
				si = si + 1
				di = di + 1
			end
		else
			local l, d
			l, si = varint(src, si, srcLen)
			d, si = varint(src, si, srcLen)
			for j = 1, l do
				poke(dst + di, peek(dst + di - d))
				di = di + 1
			end
		end
	end
	return di
end


*/

// LZ tune for
// * window size (max dist) (smaller = smaller decoder); prob around 16.
// * minimum match length (there's a sweet spot between backrefs & literals -- probably 3 or 4)
// * max len -- there's diminishing returns after a certain point but doesn't matter much. probably around 18-20.
// *

export interface LZConfig {
  windowSize: number; // how far back matches can refer (e.g. 16..4096)
  minMatchLength: number; // emit a match only if >= this (e.g. 3..6)
  maxMatchLength: number; // cap match length (e.g. 18..258)
  useRLE: boolean; // enable 0x81 opcode (repeat byte)
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
export const gSomaticLZDefaultConfig: LZConfig = {
  windowSize: 16,
  minMatchLength: 4,
  maxMatchLength: 30,
  useRLE: false,
};

/** ---- Compress (greedy) ---- */
export function lzCompress(input: Uint8Array, cfg: LZConfig): Uint8Array {
  const { windowSize, minMatchLength, maxMatchLength, useRLE } = cfg;

  if (windowSize < 1) throw new Error("windowSize must be >= 1");
  if (minMatchLength < 2) throw new Error("minMatchLength should be >= 2 (usually 3)");
  if (maxMatchLength < minMatchLength) throw new Error("maxMatchLength must be >= minMatchLength");

  const out: number[] = [];
  const lits: number[] = [];

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

    // Simple brute-force search. For tuning/testing this is fine.
    for (let dist = 1; dist <= maxDist; dist++) {
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
      emitMatch(useLen, bestDist);
      i += useLen;
    } else if (choose === "RLE") {
      emitRLE(useLen, input[i]);
      i += useLen;
    } else {
      // Shouldn't happen given canMatch/canRLE checks, but keep safe:
      lits.push(input[i++]);
    }
  }

  flushLits();
  return Uint8Array.from(out);
}
