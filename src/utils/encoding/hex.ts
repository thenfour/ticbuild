// hex encoded string helpers
// e.g. "4a 6f 68 6e" <--> Uint8Array [0x4a, 0x6f, 0x68, 0x6e]

export function decodeHexString(input: string): Uint8Array {
  const trimmed = input.replace(/\s+/g, "");
  if (trimmed.length % 2 !== 0) {
    throw new Error(`hex decode: input length ${trimmed.length} is not even`);
  }

  const out = new Uint8Array(trimmed.length / 2);
  for (let i = 0; i < trimmed.length; i += 2) {
    const byteStr = trimmed.slice(i, i + 2);
    const value = Number.parseInt(byteStr, 16);
    if (Number.isNaN(value)) {
      throw new Error(`hex decode: invalid byte '${byteStr}' at index ${i}`);
    }
    out[i / 2] = value;
  }
  return out;
}

export function encodeHexString(data: Uint8Array): string {
  let out = "";
  for (const byte of data) {
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}
