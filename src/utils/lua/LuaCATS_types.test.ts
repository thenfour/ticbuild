import { parseLuaDocLines } from "./LuaCATS";
import { parseCompleteLuaCatsType, parseLuaCatsType, renderLuaCatsTypeAsTypeScript } from "./LuaCATS_types";

describe("LuaCATS type expressions", () => {
  it("distinguishes a complete expression from a type followed by annotation prose", () => {
    expect(parseCompleteLuaCatsType("Vec2 | nil  ")?.kind).toBe("union");
    expect(parseCompleteLuaCatsType("Vec2 Selected point.")).toBeUndefined();
    expect(parseLuaCatsType("Vec2 Selected point.")?.type.kind).toBe("name");
  });

  it("keeps a spaced nested type separate from its description", () => {
    expect(parseLuaDocLines([
      "---@param values table<string, (Vec2 | nil)[]> Input values.",
      "---@return Vec2 | nil Selected value.",
    ])).toEqual({
      params: [{ name: "values", type: "table<string, (Vec2 | nil)[]>", description: "Input values." }],
      returnType: "Vec2 | nil", returnDescription: "Selected value.",
    });
  });

  it.each([
    ["Vec2", "Types.Vec2"],
    ["Vec2[]?", "((Types.Vec2)[]) | undefined"],
    ["(Vec2 | nil)[]", "((Types.Vec2) | (undefined))[]"],
    ["table<string, Vec2[]>", "Record<string, (Types.Vec2)[]>"],
    ["fun(value: Vec2, enabled?: boolean): Vec2 | nil", "(value: Types.Vec2, enabled?: boolean) => (Types.Vec2) | (undefined)"],
    ["{ value: Vec2, next?: Vec2 }", "{ value: Types.Vec2; next?: Types.Vec2 }"],
    ['"left|right" | "safe"', '("left|right") | ("safe")'],
    ["Box<Vec2>", "Types.Box<Types.Vec2>"],
  ])("preserves grouping and resolves nested names in %s", (text, expected) => {
    const parsed = parseLuaCatsType(text);
    expect(parsed?.end).toBe(text.length);
    expect(renderLuaCatsTypeAsTypeScript(parsed!.type, name => `Types.${name}`)).toBe(expected);
  });

  it.each(["(Vec2", "table<string,>", "Vec2 |", "fun(value Vec2)"])("rejects incomplete expressions: %s", text => {
    expect(parseLuaCatsType(text)).toBeUndefined();
  });
});
