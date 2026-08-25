const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function base64Encode(data: Uint8Array): string {
  let output = "";
  for (let index = 0; index < data.length; index += 3) {
    const remaining = data.length - index;
    const value = (data[index] << 16) | ((data[index + 1] ?? 0) << 8) | (data[index + 2] ?? 0);
    output += BASE64_ALPHABET[(value >>> 18) & 0x3f];
    output += BASE64_ALPHABET[(value >>> 12) & 0x3f];
    output += remaining > 1 ? BASE64_ALPHABET[(value >>> 6) & 0x3f] : "=";
    output += remaining > 2 ? BASE64_ALPHABET[value & 0x3f] : "=";
  }
  return output;
}

export function base64Decode(input: string): Uint8Array {
  const text = input.replace(/\s+/g, "");
  if (text.length === 0) return new Uint8Array();
  if (text.length % 4 !== 0) {
    throw new Error(`base64 decode: input length ${text.length} is not a multiple of 4`);
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(text)) {
    throw new Error("base64 decode: input contains invalid characters or padding");
  }

  const firstPadding = text.indexOf("=");
  const padding = firstPadding === -1 ? 0 : text.length - firstPadding;
  const outputLength = (text.length / 4) * 3 - padding;
  const output = new Uint8Array(outputLength);
  let outputIndex = 0;

  for (let index = 0; index < text.length; index += 4) {
    const c0 = BASE64_ALPHABET.indexOf(text[index]);
    const c1 = BASE64_ALPHABET.indexOf(text[index + 1]);
    const c2 = text[index + 2] === "=" ? 0 : BASE64_ALPHABET.indexOf(text[index + 2]);
    const c3 = text[index + 3] === "=" ? 0 : BASE64_ALPHABET.indexOf(text[index + 3]);
    if (c0 < 0 || c1 < 0 || c2 < 0 || c3 < 0) {
      throw new Error("base64 decode: input contains invalid characters");
    }
    const value = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;
    if (outputIndex < output.length) output[outputIndex++] = (value >>> 16) & 0xff;
    if (outputIndex < output.length) output[outputIndex++] = (value >>> 8) & 0xff;
    if (outputIndex < output.length) output[outputIndex++] = value & 0xff;
  }

  return output;
}
