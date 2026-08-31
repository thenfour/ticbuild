import { getErrorMessage } from "./errorHandling";

describe("getErrorMessage", () => {
  it("returns the message from Error instances", () => {
    expect(getErrorMessage(new Error("failure"))).toBe("failure");
  });

  it.each([
    ["a string", "a string"],
    [42, "42"],
    [null, "null"],
    [undefined, "undefined"],
  ])("converts a non-Error value to a string", (value, expected) => {
    expect(getErrorMessage(value)).toBe(expected);
  });
});
