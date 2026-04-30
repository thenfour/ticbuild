import { parseRemotingLine } from "./remotingProtocol";

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
