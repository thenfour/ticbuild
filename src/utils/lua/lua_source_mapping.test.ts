import { OptimizationRuleOptions, processLuaWithReport } from "./lua_processor";
import { mapLuaTransformOffset } from "./lua_transform_map";

function options(overrides: Partial<OptimizationRuleOptions> = {}): OptimizationRuleOptions {
  return {
    stripComments: true,
    maxIndentLevel: 1,
    lineBehavior: "tight",
    maxLineLength: 180,
    renameLocalVariables: false,
    aliasRepeatedExpressions: false,
    aliasLiterals: false,
    packLocalDeclarations: false,
    simplifyExpressions: false,
    removeUnusedLocals: false,
    removeUnusedFunctions: false,
    functionNamesToKeep: [],
    renameTableFields: false,
    tableEntryKeysToRename: [],
    ...overrides,
  };
}

describe("Lua optimizer source mapping", () => {
  it.each(["pretty", "tight", "single-line-blocks"] as const)(
    "retains the authored name and position for a renamed local in %s mode",
    (lineBehavior) => {
      const input = "local playerPosition=time()\nprint(playerPosition)";
      const result = processLuaWithReport(input, options({ renameLocalVariables: true, lineBehavior }));
      const renamedOffset = result.code.indexOf("local a") + "local ".length;

      expect(result.code).toContain("local a=time()");
      expect(mapLuaTransformOffset(result.transformMap, renamedOffset, "right")).toEqual({
        offset: input.indexOf("playerPosition"),
        originalName: "playerPosition",
      });
    },
  );

  it("anchors a folded literal to the expression that produced it", () => {
    const input = "local result=(1+2)*3\nprint(result)";
    const result = processLuaWithReport(input, options({ simplifyExpressions: true }));
    const foldedOffset = result.code.indexOf("=9") + 1;

    expect(foldedOffset).toBeGreaterThan(0);
    expect(mapLuaTransformOffset(result.transformMap, foldedOffset, "right")?.offset).toBe(
      input.indexOf("(1+2)*3"),
    );
  });

  it("does not pretend a generated alias is an authored symbol", () => {
    const input = Array.from({ length: 8 }, (_, index) => `local value${index}=time()`).join("\n");
    const result = processLuaWithReport(input, options({ aliasRepeatedExpressions: true }));
    const aliasOffset = result.code.indexOf("_a");
    const location = mapLuaTransformOffset(result.transformMap, aliasOffset, "right");

    expect(aliasOffset).toBeGreaterThanOrEqual(0);
    expect(location?.offset).toBe(input.indexOf("time"));
    expect(location?.originalName).toBeUndefined();
  });

  it("preserves identifier origins when packing local declarations", () => {
    const input = "local first=1\nlocal second=2\nprint(first+second)";
    const result = processLuaWithReport(input, options({ packLocalDeclarations: true }));
    const secondOffset = result.code.indexOf("second");

    expect(result.code).toContain("local first,second=1,2");
    expect(mapLuaTransformOffset(result.transformMap, secondOffset, "right")).toEqual({
      offset: input.indexOf("second"),
      originalName: "second",
    });
  });

  it("maps reinserted minification-off blocks line by line", () => {
    const input = [
      "-- MINIFICATION OFF",
      "local keepFormatting = 1",
      "print(keepFormatting)",
      "-- MINIFICATION ON",
      "print('after')",
    ].join("\n");
    const result = processLuaWithReport(input, options());
    const restoredOffset = result.code.indexOf("print(keepFormatting)");

    expect(restoredOffset).toBeGreaterThanOrEqual(0);
    expect(mapLuaTransformOffset(result.transformMap, restoredOffset, "right")?.offset).toBe(
      input.indexOf("print(keepFormatting)"),
    );
  });
});
