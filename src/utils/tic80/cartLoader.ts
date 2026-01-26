import { readUint16LE } from "../bin";
import { kTic80CartChunkTypes, Tic80Cart, Tic80CartChunk } from "./tic80";

// each chunk consists of a 4-byte header, then chunk data.
// offset   bits      description
// -----------------------------------------
// 0        BBBC CCCC B = bank number (0..7), C = chunk type (0..31)
// 1..2     Sx16      S = size of chunk, 16-bit little-endian
// 3        Ux1       U = unused / reserved padding
// 4..      ...       chunk data

function parseThisChunk(data: Uint8Array, offset: number): { chunk: Tic80CartChunk; nextOffset: number } {
  if (offset + 4 > data.length) {
    throw new Error("Unexpected end of data while reading chunk header");
  }
  const headerByte = data[offset];
  const chunkTypeValue = headerByte & 0x1f;
  const bank = headerByte >> 5;
  const size = readUint16LE(data, offset + 1);
  const nextOffset = offset + 4 + size;
  if (nextOffset > data.length) {
    throw new Error("Unexpected end of data while reading chunk data");
  }
  const chunkData = data.subarray(offset + 4, nextOffset);
  const chunkTypeKey = kTic80CartChunkTypes.coerceByValue(chunkTypeValue)?.key;
  if (!chunkTypeKey) {
    throw new Error(`Unknown chunk type: ${chunkTypeValue}`);
  }
  return {
    chunk: {
      chunkType: chunkTypeKey,
      bank,
      data: chunkData,
    },
    nextOffset,
  };
}

export function parseTic80Cart(data: Uint8Array): Tic80Cart {
  const chunks: Tic80CartChunk[] = [];
  let offset = 0;
  while (offset < data.length) {
    const { chunk, nextOffset } = parseThisChunk(data, offset);
    chunks.push(chunk);
    offset = nextOffset;
  }

  // // dump
  // console.log(`Parsed TIC-80 cart with ${chunks.length} chunks:`);
  // for (const chunk of chunks) {
  //   console.log(`Chunk: ${chunk.chunkType}, size: ${chunk.data.length}`);
  // }

  return { chunks };
}
