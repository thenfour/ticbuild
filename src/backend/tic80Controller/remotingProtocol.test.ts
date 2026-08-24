import {
  decodeRemotingBinaryLiteral,
  decodeRemotingJsonBinaryLiteral,
  parseRemotingLine,
} from "./remotingProtocol";

function encodeBinaryLiteral(value: string): string {
  return `<${Buffer.from(value, "utf-8").toString("hex")}>`;
}

describe("parseRemotingLine", () => {
  it("parses response lines", () => {
    expect(parseRemotingLine('12 OK "hello"')).toEqual({
      kind: "response",
      id: 12,
      status: "OK",
      data: '"hello"',
    });
  });

  it("parses pushed event lines", () => {
    expect(parseRemotingLine('-1 trace "hello from tic80"')).toEqual({
      kind: "event",
      id: -1,
      eventType: "trace",
      data: '"hello from tic80"',
    });
  });

  it("rejects lines without an integer id", () => {
    expect(parseRemotingLine('abc OK "nope"')).toBeUndefined();
    expect(parseRemotingLine('1.5 OK "nope"')).toBeUndefined();
  });
});

describe("remoting binary literals", () => {
  it("decodes arbitrary bytes and UTF-8 JSON", () => {
    expect(decodeRemotingBinaryLiteral("<00 ff 7f>")).toEqual(Uint8Array.from([0, 255, 127]));
    expect(decodeRemotingJsonBinaryLiteral(encodeBinaryLiteral(JSON.stringify({ message: "héllo" })))).toEqual({
      message: "héllo",
    });
  });

  it("rejects malformed delimiters, hexadecimal, and UTF-8", () => {
    expect(() => decodeRemotingBinaryLiteral("00ff")).toThrow("binary literal");
    expect(() => decodeRemotingBinaryLiteral("<0g>")).toThrow("non-hexadecimal");
    expect(() => decodeRemotingJsonBinaryLiteral("<ff>")).toThrow();
  });
});
