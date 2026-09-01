import { renderTypeScriptLuaDeclarations } from "./TypeScriptLuaDeclarations";

describe("TypeScript Lua declarations", () => {
  it("orders types before globals while keeping their identities structural", () => {
    const rendered = renderTypeScriptLuaDeclarations([
      { kind: "global", name: "Shared", code: "Shared = nil" },
      { kind: "type", name: "Shared", code: "---@alias Shared string" },
    ]);

    expect(rendered.indexOf("---@alias Shared string")).toBeLessThan(rendered.indexOf("Shared = nil"));
  });

  it("deduplicates identical definitions by kind and name", () => {
    const rendered = renderTypeScriptLuaDeclarations([
      { kind: "global", name: "Value", code: "Value = nil" },
      { kind: "global", name: "Value", code: "Value = nil" },
    ]);

    expect(rendered.match(/Value = nil/g)).toHaveLength(1);
  });

  it.each([
    ["global", "TypeScript resources both declare Lua global 'Shared'"],
    ["type", "TypeScript resources emit conflicting Lua type 'Shared'"],
  ] as const)("reports conflicting %s definitions semantically", (kind, expectedMessage) => {
    expect(() => renderTypeScriptLuaDeclarations([
      { kind, name: "Shared", code: "left" },
      { kind, name: "Shared", code: "right" },
    ])).toThrow(expectedMessage);
  });
});
