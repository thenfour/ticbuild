import { assert } from "../errorHandling";
import {
  formatTic80CartChunkType,
  kTic80CartChunkTypes,
  kTic80ExtendedCodeBankCount,
  Tic80Cart,
  Tic80CartChunk,
  Tic80CartChunkType,
} from "./tic80";

// each chunk consists of a 4-byte header, then chunk data.
// offset   bits      description
// -----------------------------------------
// 0        BBBC CCCC B = bank number (0..7), C = chunk type (0..31)
// 1..2     Sx16      S = size of chunk, 16-bit little-endian
// 3        Ux1       U = unused / reserved padding. Private extended code chunks use this as bank bit 3.
// 4..      ...       chunk data
type SerializeChunkOptions = {
  allowExtendedCodeBanks?: boolean;
  allowMultiBankCompressedCode?: boolean;
};

export function serializeChunk(
  chunkType: Tic80CartChunkType,
  data: Uint8Array,
  bank: number,
  options?: SerializeChunkOptions,
): Uint8Array {
  const chunkInfo = kTic80CartChunkTypes.coerceByKey(chunkType);
  if (!chunkInfo) {
    throw new Error(`Unsupported chunk type for serialization: ${formatTic80CartChunkType(chunkType)}`);
  }
  if (!Number.isInteger(bank)) {
    throw new Error(`Bank index must be an integer for chunk ${chunkType}`);
  }
  const bankCount =
    (chunkType === "CODE" && options?.allowExtendedCodeBanks) ||
      (chunkType === "CODE_COMPRESSED" && options?.allowMultiBankCompressedCode)
      ? kTic80ExtendedCodeBankCount
      : chunkInfo.bankCount;
  if (bank < 0 || bank >= bankCount) {
    const baseMessage = `Bank index ${bank} out of range for chunk ${chunkType} (0..${bankCount - 1})`;
    if (chunkType === "CODE" && !options?.allowExtendedCodeBanks) {
      throw new Error(
        `${baseMessage}. Enable allowExtendedCodeBanks to write private extended CODE banks (0..${kTic80ExtendedCodeBankCount - 1
        })`,
      );
    }
    if (chunkType === "CODE_COMPRESSED" && !options?.allowMultiBankCompressedCode) {
      throw new Error(
        `${baseMessage}. Enable allowMultiBankCompressedCode to write private multi-bank CODE_COMPRESSED chunks (0..${kTic80ExtendedCodeBankCount - 1
        })`,
      );
    }
    throw new Error(baseMessage);
  }
  const size = data.length;
  if (size > chunkInfo.sizePerBank) {
    throw new Error(`${chunkType} data too large: ${size} bytes (max ${chunkInfo.sizePerBank})`);
  }
  if (chunkType === "CODE" && size === 0) {
    throw new Error("Cannot write an empty CODE chunk. A zero size field encodes 65536 bytes.");
  }
  const chunk = new Uint8Array(4 + size);
  // first byte: BBBC CCCC
  assert(chunkInfo.value >= 0 && chunkInfo.value <= 31, `Chunk type value out of range: ${chunkInfo.value}`);
  chunk[0] = ((bank & 0x7) << 5) | chunkInfo.value; // BBBC CCCC
  // size: Sx16
  chunk[1] = size & 0xff;
  chunk[2] = (size >> 8) & 0xff;
  chunk[3] =
    (chunkType === "CODE" && options?.allowExtendedCodeBanks) ||
      (chunkType === "CODE_COMPRESSED" && options?.allowMultiBankCompressedCode)
      ? bank >> 3
      : 0;
  chunk.set(data, 4);
  return chunk;
}

export async function AssembleTic80Cart(input: Tic80Cart): Promise<Uint8Array> {
  // A cartridge can have one payload at each chunk type and bank.
  const seenChunkTypes = new Set<string>();
  for (const chunk of input.chunks) {
    const key = `${chunk.chunkType}@${chunk.bank}`;
    if (seenChunkTypes.has(key)) {
      throw new Error(`Duplicate chunk type in TIC-80 cart: ${formatTic80CartChunkType(chunk.chunkType)} bank ${chunk.bank}`);
    }
    seenChunkTypes.add(key);
  }

  // put chunks in sort order. i don't know if that's necessary but let's play safe?
  // so start by attaching chunk info to each chunk.
  const chunksWithInfo: { chunk: Tic80CartChunk; info: typeof kTic80CartChunkTypes.$info }[] = input.chunks.map(
    (chunk) => {
      const info = kTic80CartChunkTypes.coerceByKey(chunk.chunkType);
      if (!info) {
        throw new Error(`Unsupported chunk type for serialization: ${formatTic80CartChunkType(chunk.chunkType)}`);
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
    // note that tic-80 cart chunks can skip/trim/elide trailing zeros in the payload.
    // that could be done here but for simplicity for the moment i just output the same payload as incoming.
    // later if i support generating chunks then this behavior can be placed back.
    const serialized = serializeChunk(chunk.chunkType, chunk.data, chunk.bank, {
      allowExtendedCodeBanks: input.allowExtendedCodeBanks,
      allowMultiBankCompressedCode: input.allowMultiBankCompressedCode,
    });
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
