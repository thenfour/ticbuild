import { processLua, OptimizationRuleOptions } from "./lua_processor";

describe("Lua printer numeric literal formatting", () => {
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
      const input = "(a+b)[1]";
      const output = processLua(input, options);

      expect(output).toContain("(a+b)[1]");
    }
  });
});
