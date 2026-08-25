import { processLua, OptimizationRuleOptions } from "./lua_processor";

describe("Lua base language support", () => {
  it("should parse integer division operator without errors", () => {
    const options: OptimizationRuleOptions = {
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
    };

    const input = "local z = 5//2";
    const output = processLua(input, options);

    expect(output).toContain("5//2");
  });
});

describe("Lua traceable printer", () => {
  const traceableOptions: OptimizationRuleOptions = {
    stripComments: false,
    maxIndentLevel: 1,
    lineBehavior: "traceable",
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
  };

  it("keeps one diagnostic anchor per line while grouping structural punctuation", () => {
    const input = [
      "-- keep this",
      "function TIC(a,b)",
      "  local x=lut[9]",
      "  poke(x+1,42)",
      "end",
    ].join("\n");

    expect(processLua(input, traceableOptions).trimEnd().split("\n")).toEqual([
      "-- keep this",
      "function TIC(",
      "a,",
      "b)",
      "local x=",
      "lut[",
      "9",
      "]",
      "poke(",
      "x",
      "+",
      "1,",
      "42)",
      "end",
    ]);
  });

  it("groups call and member scaffolding without grouping parenthesized expressions", () => {
    const input = [
      "local function apply(value)",
      "  return (value+1).field:method(value)",
      "end",
    ].join("\n");

    expect(processLua(input, traceableOptions).trimEnd().split("\n")).toEqual([
      "local function apply(",
      "value)",
      "return",
      "(",
      "value",
      "+",
      "1",
      ")",
      ".field",
      ":method(",
      "value)",
      "end",
    ]);
  });
});

describe("Lua printer numeric literal formatting with simplifyExpressions", () => {
  it("should keep leading zero after string concatenation", () => {
    const options: OptimizationRuleOptions = {
      stripComments: true,
      maxIndentLevel: 1,
      lineBehavior: "tight",
      maxLineLength: 180,
      renameLocalVariables: false,
      aliasRepeatedExpressions: false,
      aliasLiterals: false,
      packLocalDeclarations: false,
      simplifyExpressions: true,
      removeUnusedLocals: false,
      removeUnusedFunctions: false,
      functionNamesToKeep: [],
      renameTableFields: false,
      tableEntryKeysToRename: [],
    };

    {
      const input = 'local s="str"..(1/4)';
      const output = processLua(input, options);

      expect(output).toContain('"str"..0.25');
    }
    {
      // integers don't need leading zero
      const input = 'local s="str"..10';
      const output = processLua(input, options);

      expect(output).toContain('"str"..10');
    }
    {
      const input = `print("x="..(.25))`;
      const output = processLua(input, options);

      expect(output).toContain('"x="..0.25');
    }
    {
      const input = `local t = 0.25 print("t=" .. t)`;
      const output = processLua(input, options);

      // i see:
      // local t=.25 print(\"t=\"...25..\"\")
      expect(output).toContain('t="..0.25');
    }
  });

  describe("Lua printer numeric literal formatting with no rules enabled", () => {
    it("should keep leading zero after string concatenation", () => {
      const options: OptimizationRuleOptions = {
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
      };

      {
        const input = 'print("x"..(10))';
        const output = processLua(input, options);

        expect(output).toContain('print("x"..10)');
      }

      {
        const input = 'print((10).."x")';
        const output = processLua(input, options);

        expect(output).toContain('print((10).."x")');
      }
      {
        const input = 'print("x"..(0.15))';
        const output = processLua(input, options);

        expect(output).toContain('print("x"..0.15)');
      }
      {
        const input = 'print("x"..y/0.15)';
        const output = processLua(input, options);

        expect(output).toContain('print("x"..y/.15)');
      }
      {
        const input = 'print(y/0.15.."x")';
        const output = processLua(input, options);

        // this is a compromise. ideally we would print y/.15.."x"
        // the decimal point is already parsed so the concat operator
        // is not ambiguous here. too much complexity to try and minify that.
        expect(output).toContain('print(y/(.15).."x")');
      }
      {
        // this is a fun one. it could be solved in various ways:
        // print((y/15).."x")
        // print(y/(15).."x")
        // print(y/15 .."x") -- see the space

        // currently we produce print(y/15.."x"), which is just invalid because the 15 is next to the ..
        // and Lua wants to treat that as a decimal point, causing a syntax error.
        const input = 'print(y/15.."x")';
        const output = processLua(input, options);

        expect(output).toContain('print(y/(15).."x")');
      }
    });
  });

  it("should use parenthesis when a numeric literal precedes a string concatenation operator", () => {
    const options: OptimizationRuleOptions = {
      stripComments: true,
      maxIndentLevel: 1,
      lineBehavior: "tight",
      maxLineLength: 180,
      renameLocalVariables: false,
      aliasRepeatedExpressions: false,
      aliasLiterals: false,
      packLocalDeclarations: false,
      simplifyExpressions: true,
      removeUnusedLocals: false,
      removeUnusedFunctions: false,
      functionNamesToKeep: [],
      renameTableFields: false,
      tableEntryKeysToRename: [],
    };

    {
      // the following produces a syntax error in parenthesis-less form:
      // 4.."hello" is a syntax error; Lua treats the .. as a decimal point.
      // so as we print lua make sure we don't produce this case.
      const input = "print((4) .. y)";
      const output = processLua(input, options);

      expect(output).toContain("(4)..y");
    }

    {
      const input = `local y = 4 print(y.."")`;
      const output = processLua(input, options);

      expect(output).toContain(`(4)..""`);
    }

    {
      // having a decimal point doesn't change anything here. Lua parser still
      // cannot handle it so parenthesis are needed.
      const input = `local y = 4.2 print(y.."")`;
      const output = processLua(input, options);

      expect(output).toContain(`(4.2)..""`);
    }
  });

  it("should prefer exponential notation when shorter", () => {
    const options: OptimizationRuleOptions = {
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
    };

    {
      const input = "local x = 1e18";
      const output = processLua(input, options);

      expect(output).toContain("x=1e18");
    }

    {
      const input = "local x = 12000000000";
      const output = processLua(input, options);

      expect(output).toContain("x=12e9");
    }

    {
      const input = "local x = -12000000000";
      const output = processLua(input, options);

      expect(output).toContain("x=-12e9");
    }

    {
      const input = "local x = -0.00012";
      const output = processLua(input, options);

      expect(output).toContain("x=-1.2e-4");
    }

    {
      const input = "local x = 0.00012";
      const output = processLua(input, options);

      expect(output).toContain("x=1.2e-4");
    }
  });
});

describe("Lua expression simplification", () => {
  const options: OptimizationRuleOptions = {
    stripComments: true,
    maxIndentLevel: 1,
    lineBehavior: "tight",
    maxLineLength: 180,
    renameLocalVariables: false,
    aliasRepeatedExpressions: false,
    aliasLiterals: false,
    packLocalDeclarations: false,
    simplifyExpressions: true,
    removeUnusedLocals: false,
    removeUnusedFunctions: false,
    functionNamesToKeep: [],
    renameTableFields: false,
    tableEntryKeysToRename: [],
  };

  it("should preserve named table field names while simplifying their values", () => {
    const input = `
local key = "close"
local lines = {}
lines[#lines + 1] = { key = key, value = key }
`;

    const output = processLua(input, options);

    expect(output).toContain('lines[#lines+1]={key="close",value="close"}');
  });

  it("should still simplify computed table keys", () => {
    const input = `
local key = "close"
local value = "line"
local entry = { [key] = value }
`;

    const output = processLua(input, options);

    expect(output).toContain('entry={["close"]="line"}');
  });
});

describe("Lua printer parenthesis handling", () => {
  const options: OptimizationRuleOptions = {
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
  };

  it("should preserve left-associative grouping when right operand has equal precedence", () => {
    const input = "local z = ((yi > y) ~= (yj > y))";
    const output = processLua(input, options);

    expect(output).toContain("z=yi>y~=(yj>y)");
  });

  it("should parenthesize non-prefix expressions before accessors and calls", () => {
    {
      const input = "v=({0,8,2,10})[1]";
      const output = processLua(input, options);

      expect(output).toContain("({0,8,2,10})[1]");
    }

    {
      const input = "local g=(function() trace(1) end)()";
      const output = processLua(input, options);

      expect(output).toContain("(function()");
      expect(output).toContain("end)()");
    }

    {
      const input = '("hello"):upper()';
      const output = processLua(input, options);

      expect(output).toContain('("hello"):upper()');
    }

    {
      const input = "local x = (a+b)[1]";
      const output = processLua(input, options);

      expect(output).toContain("(a+b)[1]");
    }
  });

  it("should preserve right-associative grouping when left operand has equal precedence", () => {
    {
      const input = "local z = (a^b)^c";
      const output = processLua(input, options);

      expect(output).toContain("(a^b)^c");
    }

    {
      const input = "local z = a^b^c";
      const output = processLua(input, options);

      expect(output).toContain("a^b^c");
    }

    {
      const input = "local s = (a..b)..c";
      const output = processLua(input, options);

      expect(output).toContain("(a..b)..c");
    }

    {
      const input = "local s = a..b..c";
      const output = processLua(input, options);

      expect(output).toContain("a..b..c");
    }
  });
});

describe("Lua aliasing table constructor keys", () => {
  function aliasOptions(overrides: Partial<OptimizationRuleOptions>): OptimizationRuleOptions {
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

  it("should not rewrite named table fields that match aliased globals", () => {
    const options = aliasOptions({
      aliasRepeatedExpressions: true,
    });

    const input = `
local somatic_transport = {
  time = {
    demoMillis = 0,
  },
  prevWallMillis = time(),
}
local a = time()
local b = time()
local c = time()
local d = time()
local e = time()
local f = time()
local g = time()
somatic_transport.time.demoMillis = somatic_transport.time.demoMillis + 1
`;

    const output = processLua(input, options);

    expect(output).toContain("local _a=time");
    expect(output).toContain("time={demoMillis=0}");
    expect(output).not.toContain("_a={demoMillis=0}");
    expect(output).toContain("somatic_transport.time.demoMillis");
  });

  it("should not count named table fields as repeated global expression uses", () => {
    const options = aliasOptions({
      aliasRepeatedExpressions: true,
    });

    const input = `
local a = { time = 1 }
local b = { time = 2 }
local c = { time = 3 }
local d = { time = 4 }
local e = { time = 5 }
local f = { time = 6 }
local g = { time = 7 }
return a.time + b.time + c.time + d.time + e.time + f.time + g.time
`;

    const output = processLua(input, options);

    expect(output).not.toContain("local _a=time");
    expect(output).toContain("time=1");
    expect(output).toContain("return a.time+b.time+c.time+d.time+e.time+f.time+g.time");
  });

  it("should still alias computed table keys during expression aliasing", () => {
    const options = aliasOptions({
      aliasRepeatedExpressions: true,
    });

    const input = `
local a = { [time] = 1 }
local b = { [time] = 2 }
local c = { [time] = 3 }
local d = { [time] = 4 }
local e = { [time] = 5 }
local f = { [time] = 6 }
local g = { [time] = 7 }
return a[time] + b[time] + c[time] + d[time] + e[time] + f[time] + g[time]
`;

    const output = processLua(input, options);

    expect(output).toContain("local _a=time");
    expect(output).toContain("[_a]=1");
    expect(output).toContain("return a[_a]+b[_a]+c[_a]+d[_a]+e[_a]+f[_a]+g[_a]");
  });

  it("should preserve named table fields during literal aliasing", () => {
    const options = aliasOptions({
      aliasLiterals: true,
    });

    const input = `
local t = {
  label = "shared-value",
  other = "shared-value",
}
local a = "shared-value"
local b = "shared-value"
return t.label .. t.other .. a .. b
`;

    const output = processLua(input, options);

    expect(output).toContain('local La="shared-value"');
    expect(output).toContain("label=La");
    expect(output).toContain("other=La");
    expect(output).toContain("return t.label..t.other..a..b");
  });

  it("should still alias computed table keys during literal aliasing", () => {
    const options = aliasOptions({
      aliasLiterals: true,
    });

    const input = `
local t = {
  ["shared-value"] = "shared-value",
}
local a = "shared-value"
local b = "shared-value"
return t["shared-value"] .. a .. b
`;

    const output = processLua(input, options);

    expect(output).toContain('local La="shared-value"');
    expect(output).toContain("[La]=La");
    expect(output).toContain("return t[La]..a..b");
  });
});

describe("Lua allowed global symbol renaming", () => {
  function renameGlobalOptions(overrides: Partial<OptimizationRuleOptions> = {}): OptimizationRuleOptions {
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

  it("should remain opt-in when no global renaming mode is specified", () => {
    const input = `
function Demo_LongName()
  return 1
end
return Demo_LongName()
`;

    const output = processLua(input, renameGlobalOptions());

    expect(output).toContain("function Demo_LongName()");
    expect(output).toContain("return Demo_LongName()");
  });

  it("should automatically rename globals defined in opt-out mode", () => {
    const input = `
function Internal_LongFunction()
  return Internal_LongValue
end
Internal_LongValue = 3
return Internal_LongFunction()
`;

    const output = processLua(input, renameGlobalOptions({
      globalSymbolRenaming: "opt-out",
    }));

    expect(output).not.toContain("Internal_LongFunction");
    expect(output).not.toContain("Internal_LongValue");
    expect(output).toMatch(/function [A-Za-z_][A-Za-z0-9_]*\(\)/);
  });

  it("should not rename read-only runtime globals in opt-out mode", () => {
    const input = `
function Internal_LongHelper()
  return math.floor(time())
end
return Internal_LongHelper() + cls()
`;

    const output = processLua(input, renameGlobalOptions({
      globalSymbolRenaming: "opt-out",
    }));

    expect(output).not.toContain("Internal_LongHelper");
    expect(output).toContain("math.floor(time())");
    expect(output).toContain("cls()");
  });

  it("should preserve selected globals in opt-out mode", () => {
    const input = `
function Public_LongApi()
  return Internal_LongHelper()
end
function Internal_LongHelper()
  return 1
end
return Public_LongApi()
`;

    const output = processLua(input, renameGlobalOptions({
      globalSymbolRenaming: "opt-out",
      globalSymbolsToKeep: ["Public_LongApi"],
    }));

    expect(output).toContain("function Public_LongApi()");
    expect(output).toContain("return Public_LongApi()");
    expect(output).not.toContain("Internal_LongHelper");
  });

  it("should keep protected callbacks in opt-out mode", () => {
    const input = `
function TIC()
  Internal_LongHelper()
end
function Internal_LongHelper() end
`;

    const output = processLua(input, renameGlobalOptions({
      globalSymbolRenaming: "opt-out",
    }));

    expect(output).toContain("function TIC()");
    expect(output).not.toContain("Internal_LongHelper");
  });

  it("should not rename globals when global symbol renaming is off", () => {
    const input = `
function Demo_LongName()
  return 1
end
return Demo_LongName()
`;

    const output = processLua(input, renameGlobalOptions({
      globalSymbolRenaming: "off",
      globalSymbolsToRename: ["Demo_LongName"],
    }));

    expect(output).toContain("function Demo_LongName()");
    expect(output).toContain("return Demo_LongName()");
  });

  it("should not treat assignments to locals as global definitions in opt-out mode", () => {
    const input = `
local Local_LongName = 0
Local_LongName = 1
Global_LongName = 2
return Local_LongName + Global_LongName
`;

    const output = processLua(input, renameGlobalOptions({
      globalSymbolRenaming: "opt-out",
    }));

    expect(output).toContain("local Local_LongName=0 Local_LongName=1");
    expect(output).not.toContain("Global_LongName");
  });

  it("gives the shortest name to the most frequently referenced allowed global", () => {
    const infrequentNames = Array.from({ length: 53 }, (_, index) => `InfrequentGlobal${index}`);
    const namesToRename = [...infrequentNames, "FrequentGlobal"];
    const input = `
${namesToRename.map(name => `${name}=0`).join("\n")}
local function useShadow(InfrequentGlobal0)
  return InfrequentGlobal0 + InfrequentGlobal0 + InfrequentGlobal0 + InfrequentGlobal0
end
return FrequentGlobal + FrequentGlobal + FrequentGlobal
`;
    const output = processLua(input, renameGlobalOptions({ globalSymbolsToRename: namesToRename }));

    expect(output).toContain("b=0 c=0");
    expect(output).toContain("aa=0 a=0 local function useShadow(InfrequentGlobal0)");
    expect(output).toContain("return a+a+a");
  });

  it("should rename explicitly allowed global function declarations and references", () => {
    const input = `
function Demo_LongName(n)
  if n > 0 then
    return Demo_LongName(n - 1)
  end
  return 0
end
return Demo_LongName(3)
`;

    const output = processLua(input, renameGlobalOptions({
      globalSymbolsToRename: ["Demo_LongName"],
    }));

    expect(output).toContain("function a(n)");
    expect(output).toContain("return a(n-1)");
    expect(output).toContain("return a(3)");
    expect(output).not.toContain("Demo_LongName");
  });

  it("should rename explicitly allowed global assignments and references", () => {
    const input = `
Demo_AssignedLongName = function()
  return 1
end
return Demo_AssignedLongName()
`;

    const output = processLua(input, renameGlobalOptions({
      globalSymbolsToRename: ["Demo_AssignedLongName"],
    }));

    expect(output).toContain("a=function()");
    expect(output).toContain("return a()");
    expect(output).not.toContain("Demo_AssignedLongName");
  });

  it("should respect local and parameter shadowing", () => {
    const input = `
function Demo_LongName()
  return 1
end
local function useLocal()
  local Demo_LongName = 2
  return Demo_LongName
end
local function useParam(Demo_LongName)
  return Demo_LongName
end
return Demo_LongName() + useLocal() + useParam(3)
`;

    const output = processLua(input, renameGlobalOptions({
      globalSymbolsToRename: ["Demo_LongName"],
    }));

    expect(output).toContain("function a()");
    expect(output).toContain("local Demo_LongName=2");
    expect(output).toContain("local function useParam(Demo_LongName)");
    expect(output).toContain("return a()+useLocal()+useParam(3)");
  });

  it("should keep repeat locals shadowing an allowed global through until", () => {
    const input = `
function Demo_LongName()
  return 1
end
repeat
  local Demo_LongName = nextValue()
until Demo_LongName
return Demo_LongName()
`;

    const output = processLua(input, renameGlobalOptions({
      globalSymbolsToRename: ["Demo_LongName"],
    }));

    expect(output).toContain("repeat local Demo_LongName=nextValue() until Demo_LongName");
    expect(output).toContain("return a()");
  });

  it("should not rewrite table field names or member names", () => {
    const input = `
function Demo_LongName() end
local t = {
  Demo_LongName = Demo_LongName,
  [Demo_LongName] = Demo_LongName,
}
obj.Demo_LongName = Demo_LongName
return t.Demo_LongName + t[Demo_LongName]
`;

    const output = processLua(input, renameGlobalOptions({
      globalSymbolsToRename: ["Demo_LongName"],
    }));

    expect(output).toContain("Demo_LongName=a");
    expect(output).toContain("[a]=a");
    expect(output).toContain("obj.Demo_LongName=a");
    expect(output).toContain("return t.Demo_LongName+t[a]");
  });

  it("should keep protected entrypoint names even when explicitly allowed", () => {
    const input = `
function TIC()
end
TIC()
`;

    const output = processLua(input, renameGlobalOptions({
      functionNamesToKeep: ["TIC"],
      globalSymbolsToRename: ["TIC"],
    }));

    expect(output).toContain("function TIC()");
    expect(output).toContain("TIC()");
  });
});
