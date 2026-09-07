import { collectLuaCatsNamedTypes } from "./LuaCATS_declarations";
import { renderLuaCatsTypeAsTypeScript } from "./LuaCATS_types";

describe("LuaCATS declaration blocks", () => {
  it("keeps nested parent arguments separate and locates the header in CRLF source", () => {
    const prefix = "-- Intro\r\n";
    const source = prefix + [
      "---@class (exact) Box<T>: Base<table<string, T>>, Positioned",
      "---@field private next? Box<T> Next box.",
      "local box = {}",
      "---@field ignored number",
    ].join("\r\n");
    const declarations = collectLuaCatsNamedTypes(source);
    expect(declarations).toHaveLength(1);
    expect(declarations[0].offset).toBe(prefix.length);
    const type = declarations[0].declaration;
    expect(type.name).toBe("Box");
    expect(type.parameters).toEqual(["T"]);
    expect(type.parents.map(parent => renderLuaCatsTypeAsTypeScript(parent, name => name)))
      .toEqual(["Base<Record<string, T>>", "Positioned"]);
    expect(type.fields.map(field => ({ name: field.name, optional: field.optional })))
      .toEqual([{ name: "next", optional: true }]);
  });

  it("collects multiline aliases without treating a quoted pipe as a union separator", () => {
    const declarations = collectLuaCatsNamedTypes([
      "---@alias Direction",
      "---| 'left|right'",
      "---| 'up'",
      "local direction = 'up'",
      "---| 'ignored'",
    ].join("\n"));
    expect(declarations).toHaveLength(1);
    expect(renderLuaCatsTypeAsTypeScript(declarations[0].declaration.type!, name => name))
      .toBe("('left|right') | ('up')");
  });
});
