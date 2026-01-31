import { toLuaStringLiteral } from "../utils/lua/lua_fundamentals";
import { base85Plus1Encode } from "../utils/encoding/b85";
import { encodeHexString } from "../utils/encoding/hex";

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
  | "f16le"
  | "f16be"
  | "f32le"
  | "f32be"
  | "f64le"
  | "f64be"
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
type IntEncodingConfig = {
  bytes: number;
  signed: boolean;
  endian: "le" | "be";
};

type FloatEncodingConfig = {
  bytes: number;
  endian: "le" | "be";
  expBits: number;
  mantissaBits: number;
};

const intEncodings: Record<string, IntEncodingConfig> = {
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

const floatEncodings: Record<string, FloatEncodingConfig> = {
  f16le: { bytes: 2, endian: "le", expBits: 5, mantissaBits: 10 },
  f16be: { bytes: 2, endian: "be", expBits: 5, mantissaBits: 10 },
  f32le: { bytes: 4, endian: "le", expBits: 8, mantissaBits: 23 },
  f32be: { bytes: 4, endian: "be", expBits: 8, mantissaBits: 23 },
  f64le: { bytes: 8, endian: "le", expBits: 11, mantissaBits: 52 },
  f64be: { bytes: 8, endian: "be", expBits: 11, mantissaBits: 52 },
};

export function normalizeBinaryOutputEncoding(raw: string): BinaryOutputEncoding {
  const normalized = raw.trim().toLowerCase() as BinaryOutputEncoding;
  if (!isBinaryOutputEncoding(normalized)) {
    throw new Error(`Unsupported binary output encoding: ${raw}`);
  }
  return normalized;
}

export function isBinaryOutputEncoding(value: string): value is BinaryOutputEncoding {
  return value in intEncodings || value in floatEncodings || stringEncodings.has(value as BinaryOutputEncoding);
}

export function isStringBinaryOutputEncoding(value: BinaryOutputEncoding): boolean {
  return stringEncodings.has(value);
}

export function isNumericBinaryOutputEncoding(value: BinaryOutputEncoding): boolean {
  return !stringEncodings.has(value);
}

export function encodeBinaryAsLuaLiteral(data: Uint8Array, encoding: BinaryOutputEncoding): string {
  if (stringEncodings.has(encoding)) {
    const encoded = encodeBinaryAsString(data, encoding);
    return toLuaStringLiteral(encoded);
  }

  const config = intEncodings[encoding];
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
  const intConfig = intEncodings[encoding];
  if (intConfig) {
    if (data.length % intConfig.bytes !== 0) {
      throw new Error(
        `Binary data length ${data.length} is not divisible by ${intConfig.bytes} for encoding ${encoding}`,
      );
    }

    const values: number[] = [];
    for (let offset = 0; offset < data.length; offset += intConfig.bytes) {
      const unsigned = readUnsigned(data, offset, intConfig.bytes, intConfig.endian);
      values.push(intConfig.signed ? toSigned(unsigned, intConfig.bytes * 8) : unsigned);
    }
    return values;
  }

  const floatConfig = floatEncodings[encoding];
  if (floatConfig) {
    return decodeFloats(data, floatConfig);
  }

  throw new Error(`Unsupported binary numeric encoding: ${encoding}`);
}

export type ValueEncodingInfo =
  | { kind: "int"; bitWidth: number; signed: boolean }
  | { kind: "float"; bitWidth: number };

export function getNumericEncodingInfo(encoding: BinaryOutputEncoding): ValueEncodingInfo | null {
  const intConfig = intEncodings[encoding];
  if (intConfig) {
    return { kind: "int", bitWidth: intConfig.bytes * 8, signed: intConfig.signed };
  }
  const floatConfig = floatEncodings[encoding];
  if (floatConfig) {
    return { kind: "float", bitWidth: floatConfig.bytes * 8 };
  }
  return null;
}

export function encodeValuesToBytes(values: number[], encoding: BinaryOutputEncoding): Uint8Array {
  const intConfig = intEncodings[encoding];
  if (intConfig) {
    const bytes = new Uint8Array(values.length * intConfig.bytes);
    for (let i = 0; i < values.length; i += 1) {
      const unsigned = toUnsignedInteger(values[i], intConfig.bytes * 8, intConfig.signed);
      writeUnsigned(bytes, i * intConfig.bytes, intConfig.bytes, intConfig.endian, unsigned);
    }
    return bytes;
  }

  const floatConfig = floatEncodings[encoding];
  if (floatConfig) {
    return encodeFloats(values, floatConfig);
  }

  throw new Error(`Unsupported numeric encoding: ${encoding}`);
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

function writeUnsigned(
  data: Uint8Array,
  offset: number,
  bytes: number,
  endian: "le" | "be",
  value: number,
): void {
  if (endian === "le") {
    for (let i = 0; i < bytes; i++) {
      data[offset + i] = (value >> (8 * i)) & 0xff;
    }
  } else {
    for (let i = 0; i < bytes; i++) {
      data[offset + (bytes - 1 - i)] = (value >> (8 * i)) & 0xff;
    }
  }
}

function toSigned(value: number, bitWidth: number): number {
  const signBit = 2 ** (bitWidth - 1);
  if (value >= signBit) {
    const mask = 2 ** bitWidth;
    return value - mask;
  }
  return value;
}

function toUnsignedInteger(value: number, bitWidth: number, signed: boolean): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Value ${value} is not finite`);
  }
  if (!Number.isInteger(value)) {
    throw new Error(`Value ${value} is not an integer`);
  }

  if (signed) {
    const min = -(2 ** (bitWidth - 1));
    const max = 2 ** (bitWidth - 1) - 1;
    if (value < min || value > max) {
      throw new Error(`Value ${value} is out of range for signed ${bitWidth}-bit integer`);
    }
    return value < 0 ? value + 2 ** bitWidth : value;
  }

  const max = 2 ** bitWidth - 1;
  if (value < 0 || value > max) {
    throw new Error(`Value ${value} is out of range for unsigned ${bitWidth}-bit integer`);
  }
  return value;
}

function decodeFloats(data: Uint8Array, config: FloatEncodingConfig): number[] {
  if (data.length % config.bytes !== 0) {
    throw new Error(`Binary data length ${data.length} is not divisible by ${config.bytes}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const values: number[] = [];
  for (let offset = 0; offset < data.length; offset += config.bytes) {
    const littleEndian = config.endian === "le";
    if (config.bytes === 4) {
      values.push(view.getFloat32(offset, littleEndian));
    } else if (config.bytes === 8) {
      values.push(view.getFloat64(offset, littleEndian));
    } else {
      const bits = view.getUint16(offset, littleEndian);
      values.push(float16ToFloat32(bits));
    }
  }
  return values;
}

function encodeFloats(values: number[], config: FloatEncodingConfig): Uint8Array {
  const data = new Uint8Array(values.length * config.bytes);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  for (let i = 0; i < values.length; i += 1) {
    const offset = i * config.bytes;
    const littleEndian = config.endian === "le";
    if (config.bytes === 4) {
      view.setFloat32(offset, values[i], littleEndian);
    } else if (config.bytes === 8) {
      view.setFloat64(offset, values[i], littleEndian);
    } else {
      const bits = float32ToFloat16(values[i]);
      view.setUint16(offset, bits, littleEndian);
    }
  }
  return data;
}

function float32ToFloat16(value: number): number {
  if (Number.isNaN(value)) {
    return 0x7e00;
  }
  if (value === Infinity) {
    return 0x7c00;
  }
  if (value === -Infinity) {
    return 0xfc00;
  }

  const floatView = new DataView(new ArrayBuffer(4));
  floatView.setFloat32(0, value, true);
  const bits = floatView.getUint32(0, true);

  const sign = (bits >> 16) & 0x8000;
  let exp = (bits >> 23) & 0xff;
  let mantissa = bits & 0x7fffff;

  if (exp === 0) {
    return sign;
  }

  exp = exp - 127 + 15;
  if (exp >= 0x1f) {
    return sign | 0x7c00;
  }

  if (exp <= 0) {
    if (exp < -10) {
      return sign;
    }
    mantissa = (mantissa | 0x800000) >> (1 - exp);
    return sign | ((mantissa + 0x1000) >> 13);
  }

  return sign | (exp << 10) | ((mantissa + 0x1000) >> 13);
}

function float16ToFloat32(bits: number): number {
  const sign = (bits & 0x8000) << 16;
  let exp = (bits >> 10) & 0x1f;
  let mantissa = bits & 0x3ff;

  if (exp === 0) {
    if (mantissa === 0) {
      return sign ? -0 : 0;
    }
    exp = 1;
    while ((mantissa & 0x400) === 0) {
      mantissa <<= 1;
      exp -= 1;
    }
    mantissa &= 0x3ff;
  } else if (exp === 0x1f) {
    if (mantissa === 0) {
      return sign ? -Infinity : Infinity;
    }
    return NaN;
  }

  const exp32 = exp - 15 + 127;
  const bits32 = sign | (exp32 << 23) | (mantissa << 13);
  const view = new DataView(new ArrayBuffer(4));
  view.setUint32(0, bits32, true);
  return view.getFloat32(0, true);
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
