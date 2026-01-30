import { defineEnum } from "../enum";
import { base85Plus1Decode, base85Plus1Encode } from "./b85";
import { decodeHexString, encodeHexString } from "./hex";
import { gSomaticLZDefaultConfig, lzCompress, lzDecompress } from "./lz";

export const kSourceEncoding = defineEnum({
  raw: { value: "raw", input: "bytes" },
  lz: { value: "lz", input: "bytes" },
  hex: { value: "hex", input: "string" },
  ascii: { value: "ascii", input: "string" },
  utf8: { value: "utf8", input: "string" },
  base64: { value: "base64", input: "string" },
  "b85+1": { value: "b85+1", input: "string" },
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
    decodeFromString: (text) => {
      const trimmed = text.trim();
      const cleaned = trimmed.startsWith("#") ? trimmed.substring(1) : trimmed;
      return decodeHexString(cleaned);
    },
    encodeToString: (data) => encodeHexString(data),
  },
  ascii: {
    key: "ascii",
    input: "string",
    decodeFromString: (text) => asciiToBytes(text),
    encodeToString: (data) => bytesToAscii(data),
  },
  utf8: {
    key: "utf8",
    input: "string",
    decodeFromString: (text) => new TextEncoder().encode(text),
    encodeToString: (data) => new TextDecoder("utf-8").decode(data),
  },
  base64: {
    key: "base64",
    input: "string",
    decodeFromString: (text) => Uint8Array.from(Buffer.from(text, "base64")),
    encodeToString: (data) => Buffer.from(data).toString("base64"),
  },
  "b85+1": {
    key: "b85+1",
    input: "string",
    decodeFromString: (text) => base85Plus1Decode(text),
    encodeToString: (data) => base85Plus1Encode(data),
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

function asciiToBytes(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code > 0x7f) {
      throw new Error(`ASCII encode: invalid codepoint ${code} at index ${i}`);
    }
    bytes[i] = code;
  }
  return bytes;
}

function bytesToAscii(data: Uint8Array): string {
  let out = "";
  for (let i = 0; i < data.length; i += 1) {
    const byte = data[i];
    if (byte > 0x7f) {
      throw new Error(`ASCII decode: invalid byte ${byte} at index ${i}`);
    }
    out += String.fromCharCode(byte);
  }
  return out;
}
