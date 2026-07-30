import { OptimizationRuleOptions, processLuaWithReport } from "./lua_processor";

function options(overrides: Partial<OptimizationRuleOptions> = {}): OptimizationRuleOptions {
  return {
    stripComments: true,
    maxIndentLevel: 1,
    lineBehavior: "tight",
    maxLineLength: 180,
    renameLocalVariables: false,
    aliasRepeatedExpressions: true,
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

function localNames(count: number, prefix = "value"): string {
  return Array.from({ length: count }, (_, index) => `${prefix}${index}`).join(",");
}

function calls(expression: string, count = 7): string {
  return Array.from({ length: count }, () => `${expression}()`).join("\n");
}

describe("Lua alias local-variable budget", () => {
  it("allows an alias that brings a function exactly to Lua's 200-local limit", () => {
    const input = `local ${localNames(199)}\n${calls("time")}`;

    const result = processLuaWithReport(input, options());

    expect(result.code).toContain("local _a=time");
    expect(result.report.constrainedFunctions).toEqual([]);
  });

  it("omits a profitable alias instead of creating the 201st active local", () => {
    const input = `local ${localNames(200)}\n${calls("time")}`;

    const result = processLuaWithReport(input, options());

    expect(result.code).not.toMatch(/local _[a-z]+=time/);
    expect(result.report.constrainedFunctions).toEqual([
      expect.objectContaining({
        functionName: "<main chunk>",
        localLimit: 200,
        peakActiveLocals: 200,
        existingLocalsAtPeak: 200,
        generatedLocalsAtPeak: 0,
        rules: {
          aliasLiterals: expect.objectContaining({ accepted: 0, omitted: 0 }),
          aliasRepeatedExpressions: expect.objectContaining({ accepted: 0, omitted: 1 }),
        },
      }),
    ]);
  });

  it("keeps the highest-saving alias when only one local slot remains", () => {
    const input = `
local ${localNames(199)}
${calls("time")}
${calls("math.sin")}
`;

    const result = processLuaWithReport(input, options());
    const report = result.report.constrainedFunctions[0];

    expect(result.code).toContain("local _a=math.sin");
    expect(result.code).not.toMatch(/local _[a-z]+=time/);
    expect(report.rules.aliasRepeatedExpressions).toMatchObject({
      accepted: 1,
      omitted: 1,
      estimatedBytesOmitted: 2,
    });
  });

  it("compares literal and expression aliases together instead of favoring rule order", () => {
    const input = `
local ${localNames(199)}
consume("abcdef")
consume("abcdef")
consume("abcdef")
${calls("math.sin")}
`;

    const result = processLuaWithReport(input, options({ aliasLiterals: true }));
    const report = result.report.constrainedFunctions[0];

    expect(result.code).toContain("local _a=math.sin");
    expect(result.code).not.toContain('local La="abcdef"');
    expect(report.rules.aliasLiterals).toMatchObject({
      accepted: 0,
      omitted: 1,
      estimatedBytesOmitted: 2,
    });
    expect(report.rules.aliasRepeatedExpressions.accepted).toBe(1);
  });

  it("reuses local capacity across disjoint lexical scopes", () => {
    const input = `
local ${localNames(199)}
do
  ${calls("time")}
end
do
  ${calls("math.sin")}
end
`;

    const result = processLuaWithReport(input, options());

    expect(result.code).toContain("do local _a=time");
    expect(result.code).toContain("do local _b=math.sin");
    expect(result.report.constrainedFunctions).toEqual([]);
  });

  it("counts implicit method parameters and hidden loop-control locals", () => {
    const methodParams = localNames(195, "parameter");
    const genericParams = localNames(196, "parameter");
    const input = `
function object:visit(${methodParams})
  for index = 1, 2 do
    ${calls("time")}
  end
end
function visitGeneric(${genericParams})
  for value in values do
    ${calls("math.sin")}
  end
end
`;

    const result = processLuaWithReport(input, options());

    expect(result.code).not.toMatch(/local _[a-z]+=(time|math\.sin)/);
    expect(result.report.constrainedFunctions).toEqual([
      expect.objectContaining({
        functionName: "object:visit",
        peakActiveLocals: 200,
        existingLocalsAtPeak: 200,
      }),
      expect.objectContaining({
        functionName: "visitGeneric",
        peakActiveLocals: 200,
        existingLocalsAtPeak: 200,
      }),
    ]);
  });

  it("keeps repeat-body locals active through the until condition", () => {
    const input = `
local ${localNames(199)}
repeat
  ${calls("time")}
  local marker = nextMarker()
until marker
`;

    const result = processLuaWithReport(input, options());

    expect(result.code).not.toMatch(/local _[a-z]+=time/);
    expect(result.report.constrainedFunctions[0]).toMatchObject({
      peakActiveLocals: 200,
      existingLocalsAtPeak: 200,
      generatedLocalsAtPeak: 0,
      rules: {
        aliasRepeatedExpressions: {
          omitted: 1,
        },
      },
    });
  });

  it("treats nested function bodies as independent local budgets", () => {
    const input = `
local ${localNames(200)}
function nested()
  ${calls("time")}
end
`;

    const result = processLuaWithReport(input, options());

    expect(result.code).toContain("function nested() local _a=time");
    expect(result.report.constrainedFunctions).toEqual([]);
  });
});
