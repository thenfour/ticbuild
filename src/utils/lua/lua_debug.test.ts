import { parseLuaErrorValueOrigin } from "./lua_debug";

describe("Lua error value-origin hints", () => {
  it.each([
    ["attempt to call a nil value (global 'missingFunction')", "global", "missingFunction"],
    ["attempt to perform arithmetic on a nil value (local 'amount')", "local", "amount"],
    ["attempt to index a nil value (upvalue 'state')", "upvalue", "state"],
    ["attempt to index a nil value (field 'items')", "field", "items"],
    ["attempt to call a nil value (method 'render')", "method", "render"],
  ])("parses the stock-Lua suffix in %s", (message, kind, symbol) => {
    expect(parseLuaErrorValueOrigin(message)).toEqual({ kind, symbol });
  });

  it.each([
    "(local 'amount') followed by unrelated text",
    "attempt to call a nil value (local \"amount\")",
    "attempt to call a nil value (parameter 'amount')",
    "attempt to call a string value (constant 'amount')",
    "ordinary error with no value origin",
  ])("does not broaden the heuristic to %s", (message) => {
    expect(parseLuaErrorValueOrigin(message)).toBeUndefined();
  });
});
