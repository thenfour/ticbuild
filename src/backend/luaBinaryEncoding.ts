import { toLuaStringLiteral } from "../utils/lua/lua_fundamentals";
import { base85Plus1Encode } from "../utils/encoding/b85";
import { encodeHexString } from "../utils/encoding/hex";
import { gSomaticLZDefaultConfig, lzCompress } from "../utils/encoding/lz";

export type BinaryOutputEncoding =
  | "u8"
  | "s8"
  | "u16le"
  | "s16le"
  | "u16be"
  | "s16be"
  | "u24le"
  | "s24le"
  | "u24be"
  | "s24be"
  | "u32le"
  | "s32le"
  | "u32be"
  | "s32be"
  | "ascii"
  | "utf8"
  | "base64"
  | "hex"
  | "b85+1";

const stringEncodings = new Set<BinaryOutputEncoding>([
  "hex",
  "b85+1",
  "ascii",
  "utf8",
  "base64",
]);
type TableEncodingConfig = {
  bytes: number;
  signed: boolean;
  endian: "le" | "be";
};

const tableEncodings: Record<string, TableEncodingConfig> = {
  u8: { bytes: 1, signed: false, endian: "le" },
  s8: { bytes: 1, signed: true, endian: "le" },
  u16le: { bytes: 2, signed: false, endian: "le" },
  s16le: { bytes: 2, signed: true, endian: "le" },
  u16be: { bytes: 2, signed: false, endian: "be" },
  s16be: { bytes: 2, signed: true, endian: "be" },
  u24le: { bytes: 3, signed: false, endian: "le" },
  s24le: { bytes: 3, signed: true, endian: "le" },
  u24be: { bytes: 3, signed: false, endian: "be" },
  s24be: { bytes: 3, signed: true, endian: "be" },
  u32le: { bytes: 4, signed: false, endian: "le" },
  s32le: { bytes: 4, signed: true, endian: "le" },
  u32be: { bytes: 4, signed: false, endian: "be" },
  s32be: { bytes: 4, signed: true, endian: "be" },
};

export function normalizeBinaryOutputEncoding(raw: string): BinaryOutputEncoding {
  const normalized = raw.trim().toLowerCase() as BinaryOutputEncoding;
  if (!isBinaryOutputEncoding(normalized)) {
    throw new Error(`Unsupported binary output encoding: ${raw}`);
  }
  return normalized;
}

export function isBinaryOutputEncoding(value: string): value is BinaryOutputEncoding {
  return value in tableEncodings || stringEncodings.has(value as BinaryOutputEncoding);
}

export function isStringBinaryOutputEncoding(value: BinaryOutputEncoding): boolean {
  return stringEncodings.has(value);
}

export function encodeBinaryAsLuaLiteral(data: Uint8Array, encoding: BinaryOutputEncoding): string {
  if (stringEncodings.has(encoding)) {
    const encoded = encodeBinaryAsString(data, encoding);
    return toLuaStringLiteral(encoded);
  }

  const config = tableEncodings[encoding];
  if (!config) {
    throw new Error(`Unsupported binary table encoding: ${encoding}`);
  }

  if (data.length % config.bytes !== 0) {
    throw new Error(`Binary data length ${data.length} is not divisible by ${config.bytes} for encoding ${encoding}`);
  }

  const values: number[] = [];
  for (let offset = 0; offset < data.length; offset += config.bytes) {
    const unsigned = readUnsigned(data, offset, config.bytes, config.endian);
    values.push(config.signed ? toSigned(unsigned, config.bytes * 8) : unsigned);
  }

  return `{${values.join(",")}}`;
}

export function encodeBinaryAsLuaValues(data: Uint8Array, encoding: BinaryOutputEncoding): string {
  if (stringEncodings.has(encoding)) {
    const encoded = encodeBinaryAsString(data, encoding);
    return toLuaStringLiteral(encoded);
  }

  const values = decodeBinaryToValues(data, encoding);
  return values.join(",");
}

export function decodeBinaryToValues(data: Uint8Array, encoding: BinaryOutputEncoding): number[] {
  const config = tableEncodings[encoding];
  if (!config) {
    throw new Error(`Unsupported binary numeric encoding: ${encoding}`);
  }

  if (data.length % config.bytes !== 0) {
    throw new Error(`Binary data length ${data.length} is not divisible by ${config.bytes} for encoding ${encoding}`);
  }

  const values: number[] = [];
  for (let offset = 0; offset < data.length; offset += config.bytes) {
    const unsigned = readUnsigned(data, offset, config.bytes, config.endian);
    values.push(config.signed ? toSigned(unsigned, config.bytes * 8) : unsigned);
  }
  return values;
}

export function getNumericEncodingInfo(
  encoding: BinaryOutputEncoding,
): { bitWidth: number; signed: boolean } | null {
  const config = tableEncodings[encoding];
  if (!config) {
    return null;
  }
  return { bitWidth: config.bytes * 8, signed: config.signed };
}

export function encodeBinaryAsString(data: Uint8Array, encoding: BinaryOutputEncoding): string {
  switch (encoding) {
    case "hex":
      return encodeHexString(data);
    case "ascii":
      return bytesToAscii(data);
    case "utf8":
      return new TextDecoder("utf-8").decode(data);
    case "base64":
      return Buffer.from(data).toString("base64");
    case "b85+1":
      return base85Plus1Encode(data);
    default:
      throw new Error(`Unsupported string encoding: ${encoding}`);
  }
}

function readUnsigned(data: Uint8Array, offset: number, bytes: number, endian: "le" | "be"): number {
  let value = 0;
  if (endian === "le") {
    for (let i = 0; i < bytes; i++) {
      value += data[offset + i] * 2 ** (8 * i);
    }
  } else {
    for (let i = 0; i < bytes; i++) {
      value = value * 256 + data[offset + i];
    }
  }
  return value;
}

function toSigned(value: number, bitWidth: number): number {
  const signBit = 2 ** (bitWidth - 1);
  if (value >= signBit) {
    const mask = 2 ** bitWidth;
    return value - mask;
  }
  return value;
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
