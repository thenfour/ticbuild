import { OptimizationRuleOptions, processLua } from "./lua_processor";

const options: OptimizationRuleOptions = {
  stripComments: true,
  maxIndentLevel: 1,
  lineBehavior: "tight",
  maxLineLength: 180,
  renameLocalVariables: true,
  aliasRepeatedExpressions: false,
  aliasLiterals: false,
  packLocalDeclarations: false,
  simplifyExpressions: false,
  removeUnusedLocals: false,
  removeUnusedFunctions: false,
  functionNamesToKeep: [],
  renameTableFields: false,
  tableEntryKeysToRename: [],
};

describe("lexically scoped generated local names", () => {
  it("uses the full first-character alphabet before longer local names", () => {
    const originalNames = Array.from({ length: 54 }, (_, index) => `originalName${index}`);
    const output = processLua(`local ${originalNames.join(",")}`, options).trim();
    const expectedNames = [
      ..."abcdefghijklmnopqrstuvwxyz",
      ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      "_",
      "aa",
    ];

    expect(output).toBe(`local ${expectedNames.join(",")}`);
  });

  it("reuses names in sibling blocks", () => {
    const input = `
do
  local first = 1
  print(first)
end
do
  local second = 2
  print(second)
end
`;

    expect(processLua(input, options)).toContain("do local a=1 print(a) end do local a=2 print(a) end");
  });

  it("reuses parameter names in sibling function bodies", () => {
    const input = `
function first(longName)
  return longName
end
function second(otherName)
  return otherName
end
`;

    const output = processLua(input, options);
    expect(output).toContain("function first(a) return a end");
    expect(output).toContain("function second(a) return a end");
  });

  it("keeps a local function name distinct from its recursive body bindings", () => {
    const input = `
local function recurse(count)
  if count > 0 then
    return recurse(count - 1)
  end
  return count
end
return recurse(2)
`;

    expect(processLua(input, options).trim()).toBe(
      "local function a(b) if b>0 then return a(b-1) end return b end return a(2)",
    );
  });

  it("can reuse a later local name inside its initializer function", () => {
    const input = `
local outer = 1
local callback = function(inner)
  return outer + inner
end
return callback(2)
`;

    expect(processLua(input, options).replace(/\s+/g, " ").trim()).toBe(
      "local a=1 local b=function(b) return a+b end return b(2)",
    );
  });

  it("does not reuse an active ancestor name in a nested scope", () => {
    const input = `
local outer = 1
do
  local inner = outer + 1
  print(outer, inner)
end
return outer
`;

    expect(processLua(input, options).trim()).toBe(
      "local a=1 do local b=a+1 print(a,b) end return a",
    );
  });

  it("reuses a child name after that child scope ends", () => {
    const input = `
do
  local inside = 1
  print(inside)
end
local outside = 2
return outside
`;

    expect(processLua(input, options).trim()).toBe(
      "do local a=1 print(a) end local a=2 return a",
    );
  });

  it("does not leak an if-clause local mapping outside its clause", () => {
    const input = `
if condition then
  local value = 1
  print(value)
end
return value
`;

    expect(processLua(input, options).trim()).toBe(
      "if condition then local a=1 print(a) end return value",
    );
  });

  it("does not leak a while-body local mapping outside the loop", () => {
    const input = `
while condition do
  local value = 1
  print(value)
  break
end
return value
`;

    expect(processLua(input, options).trim()).toBe(
      "while condition do local a=1 print(a) break end return value",
    );
  });

  it("keeps repeat locals visible through until but not afterward", () => {
    const input = `
repeat
  local value = nextValue()
until value
return value
`;

    expect(processLua(input, options).trim()).toBe(
      "repeat local a=nextValue() until a return value",
    );
  });
});
