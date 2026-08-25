import { base64Decode, base64Encode } from "./base64";
import {
  convertPayloadText,
  decodePayloadText,
  encodePayloadText,
  type PayloadTextEncoding,
} from "./payloadTextEncoding";

function expectBytesEqual(actual: Uint8Array, expected: Uint8Array): void {
  expect(Array.from(actual)).toEqual(Array.from(expected));
}

describe("payload text encodings", () => {
  const bytes = Uint8Array.from([0x00, 0x01, 0x7f, 0x80, 0xfe, 0xff]);

  it("round-trips binary-safe encodings", () => {
    for (const encoding of ["hex", "base64", "b85+1"] satisfies PayloadTextEncoding[]) {
      expectBytesEqual(decodePayloadText(encodePayloadText(bytes, encoding), encoding), bytes);
    }
  });

  it("converts UTF-8 text between the supported binary-safe encodings", () => {
    const source = "Héllo, TIC-80!";
    const base85 = convertPayloadText(source, "utf8", "b85+1");
    const base64 = convertPayloadText(base85, "b85+1", "base64");

    expect(convertPayloadText(base64, "base64", "utf8")).toBe(source);
  });

  it("rejects bytes that are not valid UTF-8", () => {
    expect(() => encodePayloadText(Uint8Array.from([0x80]), "utf8")).toThrow();
  });

  it("implements strict, whitespace-tolerant base64", () => {
    expect(base64Encode(new TextEncoder().encode("hello"))).toBe("aGVsbG8=");
    expect(new TextDecoder().decode(base64Decode("aGVs\n bG8="))).toBe("hello");
    expect(() => base64Decode("aGVsbG8")).toThrow("multiple of 4");
    expect(() => base64Decode("aGV$bG8=")).toThrow("invalid");
  });
});
