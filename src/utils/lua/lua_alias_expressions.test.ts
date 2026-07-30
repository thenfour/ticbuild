import { processLua, OptimizationRuleOptions } from "./lua_processor";

describe("Lua repeated expression alias lexical bindings", () => {
  const options: OptimizationRuleOptions = {
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
  };

  function repeatedCalls(expression: string, count = 7, prefix = "globalUse"): string {
    return Array.from({ length: count }, (_, index) => `local ${prefix}${index}=${expression}()`).join("\n");
  }

  function repeatedTerms(identifier: string, count: number): string {
    return Array.from({ length: count }, () => identifier).join("+");
  }

  it("aliases genuine globals without including shadowed parameter uses in their scope", () => {
    const input = `
local function readClock()
  ${repeatedCalls("time")}
  return globalUse0
end
local function readParameter(time)
  return time
end
return readClock(), readParameter(42)
`;

    const output = processLua(input, options);
    const readClockIndex = output.indexOf("local function readClock()");
    const aliasIndex = output.indexOf("local _a=time");
    const readParameterIndex = output.indexOf("local function readParameter(time)");

    expect(aliasIndex).toBeGreaterThan(readClockIndex);
    expect(aliasIndex).toBeLessThan(readParameterIndex);
    expect(output).toContain("local function readParameter(time) return time end");
    expect(output).not.toContain("local function readParameter(time) return _a end");
  });

  it("does not count shadowed parameters as global alias candidates", () => {
    const input = `
local function sum(time)
  return ${repeatedTerms("time", 12)}
end
return sum(1)
`;

    const output = processLua(input, options);

    expect(output).not.toMatch(/local _[a-z]+=time/);
    expect(output).toContain(`return ${repeatedTerms("time", 12)}`);
  });

  it("evaluates local initializers before introducing their bindings", () => {
    const input = `
${repeatedCalls("time")}
local time = time()
local localValue = time
return localValue
`;

    const output = processLua(input, options);

    expect(output).toContain("local _a=time");
    expect(output).toContain("local time=_a()");
    expect(output).toContain("local localValue=time");
  });

  it("preserves locals captured by nested functions", () => {
    const input = `
${repeatedCalls("time")}
local function makeReader()
  local time = 42
  local function read()
    return time
  end
  return read
end
return makeReader()
`;

    const output = processLua(input, options);

    expect(output).toContain("local _a=time");
    expect(output).toContain("local time=42");
    expect(output).toContain("local function read() return time end");
  });

  it("preserves bindings introduced by anonymous function parameters", () => {
    const input = `
${repeatedCalls("key", 14)}
local callback = function(key)
  return key
end
return callback
`;

    const output = processLua(input, options);

    expect(output).toContain("local _a=key");
    expect(output).toContain("local callback=function(key)");
    expect(output).toContain("return key");
  });

  it("preserves local function bindings that shadow safe globals", () => {
    const input = `
${repeatedCalls("time")}
local function time()
  return 42
end
local localValue = time()
return localValue
`;

    const output = processLua(input, options);

    expect(output).toContain("local _a=time");
    expect(output).toContain("local function time()");
    expect(output).toContain("local localValue=time()");
  });

  it("does not rewrite local assignment targets", () => {
    const input = `
local function triangleWave(phase)
  local tri
  if phase < 0.5 then
    tri = phase * 4 - 1
  else
    tri = 3 - phase * 4
  end
  return ${repeatedTerms("tri", 12)}
end
return triangleWave(0.25)
`;

    const output = processLua(input, options);

    expect(output).not.toMatch(/local _[a-z]+=tri/);
    expect(output).toContain("tri=phase*4-1");
    expect(output).toContain("tri=3-phase*4");
    expect(output).toContain(`return ${repeatedTerms("tri", 12)}`);
  });

  it("preserves numeric and generic for-loop bindings", () => {
    const input = `
local function visit(items)
  for key = 1, 2 do
    consume(${repeatedTerms("key", 14)})
  end
  for line in items do
    consume(${repeatedTerms("line", 8)})
  end
end
return visit
`;

    const output = processLua(input, options);

    expect(output).not.toMatch(/local _[a-z]+=(key|line)/);
    expect(output).toContain(`consume(${repeatedTerms("key", 14)})`);
    expect(output).toContain(`consume(${repeatedTerms("line", 8)})`);
  });

  it("keeps repeat-body locals visible in the until condition", () => {
    const input = `
${repeatedCalls("key", 14)}
repeat
  local key = nextKey()
  consume(key)
until key
`;

    const output = processLua(input, options);

    expect(output).toContain("local _a=key");
    expect(output).toContain("local key=nextKey()");
    expect(output).toContain("consume(key)");
    expect(output).toContain("until key");
  });

  it("restores the outer binding after leaving a nested block", () => {
    const input = `
${repeatedCalls("line")}
do
  local line = "local"
  consume(line)
end
local outside = line
return outside
`;

    const output = processLua(input, options);

    expect(output).toContain("local _a=line");
    expect(output).toContain('local line="local"');
    expect(output).toContain("consume(line)");
    expect(output).toContain("local outside=_a");
  });

  it("does not treat members of a shadowed library base as global expressions", () => {
    const input = `
local function useLocalMath()
  local math = {
    sin = function(value)
      return value
    end,
  }
  return math.sin(1) + math.sin(2) + math.sin(3) + math.sin(4)
end
return useLocalMath()
`;

    const output = processLua(input, options);

    expect(output).not.toMatch(/local _[a-z]+=math\.sin/);
    expect(output).toContain("return math.sin(1)+math.sin(2)+math.sin(3)+math.sin(4)");
  });

  it("chooses generated alias names that cannot collide with user bindings", () => {
    const input = `
local _a = "user value"
${repeatedCalls("time")}
return _a
`;

    const output = processLua(input, options);
    const aliasMatch = output.match(/local ([A-Za-z_][A-Za-z0-9_]*)=time(?=\s|$)/);
    const aliasName = aliasMatch?.[1];

    expect(aliasName).toBeDefined();
    expect(aliasName).not.toBe("_a");
    expect(output).toContain(`local globalUse0=${aliasName}()`);
    expect(output).toContain('local _a="user value"');
    expect(output).toContain("return _a");
  });
});
