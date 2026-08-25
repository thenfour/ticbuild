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
    canonicalizeSyntax: false,
    simplifyControlFlow: false,
    ruleOverrides: {},
    ...overrides,
  };
}

describe("Lua optimizer source mapping", () => {
  it.each(["pretty", "tight", "tight2", "single-line-blocks", "traceable"] as const)(
    "retains the authored name and position for a renamed local in %s mode",
    (lineBehavior) => {
      const input = "local playerPosition=time()\nprint(playerPosition)";
      const result = processLuaWithReport(input, options({ renameLocalVariables: true, lineBehavior }));
      const renamedOffset = lineBehavior === "traceable"
        ? result.code.indexOf("local a=") + "local ".length
        : result.code.indexOf("local a") + "local ".length;

      if (lineBehavior === "traceable") {
        expect(result.code).toContain("local a=\ntime()");
      } else {
        expect(result.code).toContain("local a=time()");
      }
      expect(mapLuaTransformOffset(result.transformMap, renamedOffset, "right")).toEqual({
        offset: input.indexOf("playerPosition"),
        originalName: "playerPosition",
      });
    },
  );

  it("retains distinct authored names when sibling scopes reuse a generated name", () => {
    const input = "do\nlocal first=1\nprint(first)\nend\ndo\nlocal second=2\nprint(second)\nend";
    const result = processLuaWithReport(input, options({ renameLocalVariables: true }));
    const firstOffset = result.code.indexOf("local a") + "local ".length;
    const secondOffset = result.code.indexOf("local a", firstOffset + 1) + "local ".length;

    expect(secondOffset).toBeGreaterThan(firstOffset);
    expect(mapLuaTransformOffset(result.transformMap, firstOffset, "right")?.originalName).toBe("first");
    expect(mapLuaTransformOffset(result.transformMap, secondOffset, "right")?.originalName).toBe("second");
  });

  it("maps a traceable operator line to its authored expression", () => {
    const input = "local x=lut[9]\npoke(x+1,42)";
    const result = processLuaWithReport(input, options({ lineBehavior: "traceable" }));
    const operatorOffset = result.code.indexOf("\n+\n") + 1;

    expect(operatorOffset).toBeGreaterThan(0);
    expect(mapLuaTransformOffset(result.transformMap, operatorOffset, "right")?.offset).toBe(
      input.indexOf("x+1"),
    );
  });

  it("keeps a traceable closing index delimiter mapped to the indexed expression", () => {
    const input = "local x=lut[9]";
    const result = processLuaWithReport(input, options({ lineBehavior: "traceable" }));
    const closingBracketOffset = result.code.indexOf("\n]\n") + 1;

    expect(result.code).toContain("local x=\nlut[\n9\n]");
    expect(closingBracketOffset).toBeGreaterThan(0);
    expect(mapLuaTransformOffset(result.transformMap, closingBracketOffset, "right")?.offset).toBe(
      input.indexOf("lut[9]"),
    );
  });

  it("anchors a folded literal to the expression that produced it", () => {
    const input = "local result=(1+2)*3\nprint(result)";
    const result = processLuaWithReport(input, options({
      simplifyExpressions: true,
      ruleOverrides: { "reduce.inline-immutable-scalars": false },
    }));
    const foldedOffset = result.code.indexOf("=9") + 1;

    expect(foldedOffset).toBeGreaterThan(0);
    expect(mapLuaTransformOffset(result.transformMap, foldedOffset, "right")?.offset).toBe(
      input.indexOf("(1+2)*3"),
    );
  });

  it("anchors an inlined scalar to the reference it replaces", () => {
    const input = 'local value="hi"\nprint(value)';
    const result = processLuaWithReport(input, options({ simplifyExpressions: true }));
    const literalOffset = result.code.indexOf('"hi"');

    expect(result.code).toContain('print("hi")');
    expect(mapLuaTransformOffset(result.transformMap, literalOffset, "right")?.offset).toBe(
      input.lastIndexOf("value"),
    );
  });

  it("anchors an inlined alias name to the reference it replaces", () => {
    const input = "local object=make()\nlocal alias=object\nuse(alias)";
    const result = processLuaWithReport(input, options({
      ruleOverrides: { "reduce.inline-immutable-aliases": true },
    }));
    const replacementOffset = result.code.indexOf("object", result.code.indexOf("use("));

    expect(result.code).toContain("use(object)");
    expect(mapLuaTransformOffset(result.transformMap, replacementOffset, "right")).toEqual({
      offset: input.lastIndexOf("alias"),
      originalName: "alias",
    });
  });

  it("keeps a moved single-use expression anchored to its initializer", () => {
    const input = "local value=left+right\nreturn value";
    const result = processLuaWithReport(input, options({
      ruleOverrides: { "reduce.inline-single-use-expressions": true },
    }));
    const expressionOffset = result.code.indexOf("left+right");

    expect(result.code).toContain("return left+right");
    expect(mapLuaTransformOffset(result.transformMap, expressionOffset, "right")?.offset).toBe(
      input.indexOf("left+right"),
    );
  });

  it("maps canonical member syntax to the authored string key", () => {
    const input = 'local value=source["field"]';
    const result = processLuaWithReport(input, options({ canonicalizeSyntax: true }));
    const fieldOffset = result.code.indexOf(".field") + 1;

    expect(result.code).toContain("source.field");
    expect(mapLuaTransformOffset(result.transformMap, fieldOffset, "right")).toEqual({
      offset: input.indexOf('"field"'),
      originalName: "field",
    });
  });

  it("maps a canonical bare table key to the authored computed key", () => {
    const input = 'local value={["field"]=1}';
    const result = processLuaWithReport(input, options({ canonicalizeSyntax: true }));
    const fieldOffset = result.code.indexOf("field");

    expect(result.code).toContain("{field=1}");
    expect(mapLuaTransformOffset(result.transformMap, fieldOffset, "right")).toEqual({
      offset: input.indexOf('"field"'),
      originalName: "field",
    });
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

  it.each(["tight", "tight2", "traceable"] as const)(
    "maps reinserted minification-off blocks line by line in %s mode",
    (lineBehavior) => {
      const input = [
        "-- MINIFICATION OFF",
        "local keepFormatting = 1",
        "print(keepFormatting)",
        "-- MINIFICATION ON",
        "print('after')",
      ].join("\n");
      const result = processLuaWithReport(input, options({ lineBehavior }));
      const restoredOffset = result.code.indexOf("print(keepFormatting)");

      expect(restoredOffset).toBeGreaterThanOrEqual(0);
      expect(result.code).not.toContain("__SOMATIC_DISABLED_MINIFICATION_BLOCK_");
      expect(mapLuaTransformOffset(result.transformMap, restoredOffset, "right")?.offset).toBe(
        input.indexOf("print(keepFormatting)"),
      );
    },
  );
});
