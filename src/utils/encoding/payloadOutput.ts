import { toLuaStringLiteral } from "../lua/lua_fundamentals";
import { encodePayloadText } from "./payloadTextEncoding";

export const gPayloadOutputEncodings = ["hex", "base64", "b85+1"] as const;
export type PayloadOutputEncoding = (typeof gPayloadOutputEncodings)[number];

export function encodePayloadOutput(
  data: Uint8Array,
  encoding: PayloadOutputEncoding,
  asLuaStringLiteral: boolean,
): string {
  const encodedText = encodePayloadText(data, encoding);
  return asLuaStringLiteral ? toLuaStringLiteral(encodedText) : encodedText;
}
