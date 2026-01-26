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
