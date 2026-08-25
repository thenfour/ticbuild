import { toLuaStringLiteral } from "./lua_fundamentals";
import { OptimizationRuleOptions, processLua } from "./lua_processor";
import { decodeRawString } from "./lua_utils";

const printOnlyOptions: OptimizationRuleOptions = {
  stripComments: false,
  maxIndentLevel: 50,
  lineBehavior: "pretty",
  maxLineLength: 120,
  renameLocalVariables: false,
  aliasRepeatedExpressions: false,
  aliasLiterals: false,
  simplifyExpressions: false,
  removeUnusedLocals: false,
  removeUnusedFunctions: false,
  functionNamesToKeep: [],
  renameTableFields: false,
  tableEntryKeysToRename: [],
  packLocalDeclarations: false,
};

describe("compact Lua string literals", () => {
  it("uses quotes for ordinary text and long brackets when escaping costs more", () => {
    expect(toLuaStringLiteral("ordinary")).toBe('"ordinary"');
    expect(toLuaStringLiteral('a"b')).toBe('"a\\"b"');

    const troublesome = '"""\\\\payload]]tail';
    const literal = toLuaStringLiteral(troublesome);
    expect(literal).toBe(`[=[${troublesome}]=]`);
    expect(decodeRawString(literal)).toBe(troublesome);
  });

  it("selects the smallest valid long-bracket delimiter", () => {
    expect(toLuaStringLiteral('"""')).toBe(`[["""]]`);
    expect(toLuaStringLiteral('""""" ]]')).toBe(`[=[""""" ]]]=]`);
    expect(toLuaStringLiteral('""""""" ]] and ]=]')).toBe(`[==[""""""" ]] and ]=]]==]`);
  });

  it("does not form a premature terminator across the payload boundary", () => {
    for (let suffixEqualsCount = 0; suffixEqualsCount < 5; suffixEqualsCount++) {
      const embeddedTerminators = Array.from(
        { length: suffixEqualsCount },
        (_, equalsCount) => `]${"=".repeat(equalsCount)}]`,
      ).join(" payload ");
      const value = [
        '"'.repeat(5 + suffixEqualsCount * 2),
        embeddedTerminators,
        `tail]${"=".repeat(suffixEqualsCount)}`,
      ].filter(Boolean).join(" ");
      const delimiterEquals = "=".repeat(suffixEqualsCount + 1);
      const literal = `[${delimiterEquals}[${value}]${delimiterEquals}]`;

      expect(toLuaStringLiteral(value)).toBe(literal);
      expect(decodeRawString(literal)).toBe(value);
    }
  });

  it("rewrites parsed quoted literals when the long-bracket form is shorter", () => {
    const value = '"""\\\\payload]]tail';
    const literal = toLuaStringLiteral(value);
    const output = processLua(`local payload=${JSON.stringify(value)}\n`, printOnlyOptions);

    expect(output).toContain(literal);
    expect(output).not.toContain(JSON.stringify(value));
  });

  it("keeps a shorter source spelling and escaped control bytes", () => {
    const output = processLua(`local quote='a"b'\nlocal newline="a\\nb"\n`, printOnlyOptions);

    expect(output).toContain(`quote='a"b'`);
    expect(output).toContain(`newline="a\\nb"`);
  });

  it("compacts ASCII Lua escapes without changing high-byte escape semantics", () => {
    const output = processLua(String.raw`local quotes="\x22\x22\x22"
local byte="\xFF\"\"\""
`, printOnlyOptions);

    expect(output).toContain(`quotes=[["""]]`);
    expect(output).toContain(String.raw`byte="\xFF\"\"\""`);
  });
});
