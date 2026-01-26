import { defineEnum } from "../enum";
import { base85Plus1Decode, base85Plus1Encode } from "./b85";
import { decodeHexString, encodeHexString } from "./hex";
import { gSomaticLZDefaultConfig, lzCompress, lzDecompress } from "./lz";

export const kSourceEncoding = defineEnum({
  raw: { value: "raw", input: "bytes" },
  lz: { value: "lz", input: "bytes" },
  hex: { value: "hex", input: "string" },
  "b85+1": { value: "b85+1", input: "string" },
  "lz85+1": { value: "lz85+1", input: "string" },
} as const);

export type SourceEncodingKey = typeof kSourceEncoding.$key;
export type SourceEncodingInput = (typeof kSourceEncoding.infos)[number]["input"];

export type SourceEncodingCodec = {
  key: SourceEncodingKey;
  input: SourceEncodingInput;
  decodeFromBytes?: (data: Uint8Array) => Uint8Array;
  decodeFromString?: (text: string) => Uint8Array;
  encodeToString?: (data: Uint8Array) => string;
};

const sourceEncodings: Record<SourceEncodingKey, SourceEncodingCodec> = {
  raw: {
    key: "raw",
    input: "bytes",
    decodeFromBytes: (data) => data,
  },
  lz: {
    key: "lz",
    input: "bytes",
    decodeFromBytes: (data) => lzDecompress(data),
  },
  hex: {
    key: "hex",
    input: "string",
    decodeFromString: (text) => decodeHexString(text),
    encodeToString: (data) => encodeHexString(data),
  },
  "b85+1": {
    key: "b85+1",
    input: "string",
    decodeFromString: (text) => base85Plus1Decode(text),
    encodeToString: (data) => base85Plus1Encode(data),
  },
  "lz85+1": {
    key: "lz85+1",
    input: "string",
    decodeFromString: (text) => lzDecompress(base85Plus1Decode(text)),
    encodeToString: (data) => base85Plus1Encode(lzCompress(data, gSomaticLZDefaultConfig)),
  },
};

export function resolveSourceEncoding(encoding: string): SourceEncodingCodec {
  const info = kSourceEncoding.coerceByKey(encoding as SourceEncodingKey);
  if (!info) {
    throw new Error(`Unsupported source encoding: ${encoding}`);
  }
  return sourceEncodings[info.key];
}

export function decodeSourceDataFromBytes(encoding: SourceEncodingKey, data: Uint8Array): Uint8Array {
  const codec = sourceEncodings[encoding];
  if (!codec.decodeFromBytes) {
    throw new Error(`Source encoding ${encoding} expects string input`);
  }
  return codec.decodeFromBytes(data);
}

export function decodeSourceDataFromString(encoding: SourceEncodingKey, text: string): Uint8Array {
  const codec = sourceEncodings[encoding];
  if (!codec.decodeFromString) {
    throw new Error(`Source encoding ${encoding} expects binary input`);
  }
  return codec.decodeFromString(text);
}

export function encodeBinaryToString(encoding: SourceEncodingKey, data: Uint8Array): string {
  const codec = sourceEncodings[encoding];
  if (!codec.encodeToString) {
    throw new Error(`Source encoding ${encoding} does not support string encoding`);
  }
  return codec.encodeToString(data);
}

export function isStringSourceEncoding(encoding: SourceEncodingKey): boolean {
  return sourceEncodings[encoding].input === "string";
}
