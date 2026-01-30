import { assert } from "../errorHandling";
import { trimTrailingZeros } from "../utils";
import { kTic80CartChunkTypes, Tic80Cart, Tic80CartChunk, Tic80CartChunkTypeKey } from "./tic80";

// each chunk consists of a 4-byte header, then chunk data.
// offset   bits      description
// -----------------------------------------
// 0        BBBC CCCC B = bank number (0..7), C = chunk type (0..31)
// 1..2     Sx16      S = size of chunk, 16-bit little-endian
// 3        Ux1       U = unused / reserved padding
// 4..      ...       chunk data
export function serializeChunk(chunkType: Tic80CartChunkTypeKey, data: Uint8Array, bank: number): Uint8Array {
  const chunkInfo = kTic80CartChunkTypes.coerceByKey(chunkType);
  if (!chunkInfo) {
    throw new Error(`Unknown chunk type key: ${chunkType}`);
  }
  if (!Number.isInteger(bank)) {
    throw new Error(`Bank index must be an integer for chunk ${chunkType}`);
  }
  if (bank < 0 || bank >= chunkInfo.bankCount) {
    throw new Error(`Bank index ${bank} out of range for chunk ${chunkType} (0..${chunkInfo.bankCount - 1})`);
  }
  const header = new Uint8Array(4);
  // first byte: BBBC CCCC
  assert(chunkInfo.value >= 0 && chunkInfo.value <= 31, `Chunk type value out of range: ${chunkInfo.value}`);
  header[0] = (bank << 5) | chunkInfo.value; // BBBC CCCC
  // size: Sx16
  const size = data.length;
  if (size > chunkInfo.sizePerBank) {
    throw new Error(`Chunk data too large: ${size} bytes (max 65535)`);
  }
  header[1] = size & 0xff;
  header[2] = (size >> 8) & 0xff;
  header[3] = 0; // unused / reserved
  return new Uint8Array([...header, ...data]);
}

export async function AssembleTic80Cart(input: Tic80Cart): Promise<Uint8Array> {
  // sanity check: no duplicate chunk types
  const seenChunkTypes = new Set<string>();
  for (const chunk of input.chunks) {
    const key = `${chunk.chunkType}@${chunk.bank}`;
    if (seenChunkTypes.has(key)) {
      throw new Error(`Duplicate chunk type in TIC-80 cart: ${chunk.chunkType} bank ${chunk.bank}`);
    }
    seenChunkTypes.add(key);
  }

  // put chunks in sort order. i don't know if that's necessary but let's play safe?
  // so start by attaching chunk info to each chunk.
  const chunksWithInfo: { chunk: Tic80CartChunk; info: typeof kTic80CartChunkTypes.$info }[] = input.chunks.map(
    (chunk) => {
      const info = kTic80CartChunkTypes.coerceByKey(chunk.chunkType);
      if (!info) {
        throw new Error(`Unknown chunk type key: ${chunk.chunkType}`);
      }
      return { chunk, info };
    },
  );

  // sort by chunk type value, then by bank
  chunksWithInfo.sort((a, b) => {
    const typeDelta = a.info.value - b.info.value;
    if (typeDelta !== 0) {
      return typeDelta;
    }
    return a.chunk.bank - b.chunk.bank;
  });

  // serialize each chunk
  const serializedChunks: Uint8Array[] = [];
  for (const { chunk } of chunksWithInfo) {
    const trimmedData = trimTrailingZeros(chunk.data);
    const serialized = serializeChunk(chunk.chunkType, trimmedData, chunk.bank);
    serializedChunks.push(serialized);
  }

  // concatenate all serialized chunks into a single Uint8Array
  let totalLength = 0;
  for (const chunk of serializedChunks) {
    totalLength += chunk.length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of serializedChunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
