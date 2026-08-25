import { base85Plus1Decode, base85Plus1Encode } from "./b85";
import { base64Decode, base64Encode } from "./base64";
import { decodeHexString, encodeHexString } from "./hex";

export const gPayloadTextEncodings = ["hex", "utf8", "base64", "b85+1"] as const;
export type PayloadTextEncoding = (typeof gPayloadTextEncodings)[number];

const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

export function decodePayloadText(text: string, encoding: PayloadTextEncoding): Uint8Array {
  switch (encoding) {
    case "hex":
      return decodeHexString(text);
    case "utf8":
      return new TextEncoder().encode(text);
    case "base64":
      return base64Decode(text);
    case "b85+1":
      return base85Plus1Decode(text.trim());
  }
}

export function encodePayloadText(data: Uint8Array, encoding: PayloadTextEncoding): string {
  switch (encoding) {
    case "hex":
      return encodeHexString(data);
    case "utf8":
      return utf8Decoder.decode(data);
    case "base64":
      return base64Encode(data);
    case "b85+1":
      return base85Plus1Encode(data);
  }
}

export function convertPayloadText(
  text: string,
  sourceEncoding: PayloadTextEncoding,
  destinationEncoding: PayloadTextEncoding,
): string {
  return encodePayloadText(decodePayloadText(text, sourceEncoding), destinationEncoding);
}
