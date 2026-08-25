import { decodeRawString } from "../lua/lua_utils";
import { encodePayloadText } from "./payloadTextEncoding";
import { encodePayloadOutput, gPayloadOutputEncodings } from "./payloadOutput";

describe("payload output formatting", () => {
  const bytes = Uint8Array.from([0x00, 0x01, 0x22, 0x5c, 0x7f, 0x80, 0xfe, 0xff]);

  it("emits the selected binary-safe text encoding directly", () => {
    for (const encoding of gPayloadOutputEncodings) {
      expect(encodePayloadOutput(bytes, encoding, false)).toBe(encodePayloadText(bytes, encoding));
    }
  });

  it("optionally wraps the encoded text as a directly usable Lua string literal", () => {
    for (const encoding of gPayloadOutputEncodings) {
      const encodedText = encodePayloadText(bytes, encoding);
      const luaLiteral = encodePayloadOutput(bytes, encoding, true);

      expect(decodeRawString(luaLiteral)).toBe(encodedText);
    }
  });
});
