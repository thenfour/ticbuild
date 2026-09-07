import {
  extractTypeScriptDeclarationDirectives, hasUnrestoredPreprocessorDirectives,
  preserveTypeScriptPreprocessorDirectives, restoreTypeScriptPreprocessorDirective,
} from "./luaPreprocessorSyntax";

describe("TypeScript preprocessor directive bridge", () => {
  it("keeps discovery directives at their original line numbers", () => {
    const source = [
      "const value = 1;",
      "//--#ifdef DEBUG",
      '  //--#include "import:debug"',
      "//--#warning debug build",
      "//--#minify no_rename",
      "//--#endif",
      "// An ordinary comment",
    ].join("\r\n");
    expect(extractTypeScriptDeclarationDirectives(source)).toBe([
      "", "--#ifdef DEBUG", '--#include "import:debug"', "", "", "--#endif", "",
    ].join("\n"));
  });

  it("round-trips directive payloads with quotes, Unicode and indentation", () => {
    const directive = '  //--#include "assets/café.lua"';
    const preserved = preserveTypeScriptPreprocessorDirectives(directive);
    // TSTL emits the marker as a standalone Lua call without the TS semicolon.
    const emitted = preserved.slice(0, -1);
    expect(hasUnrestoredPreprocessorDirectives(emitted)).toBe(true);
    expect(restoreTypeScriptPreprocessorDirective(emitted)).toBe('  --#include "assets/café.lua"');
    expect(restoreTypeScriptPreprocessorDirective('print("ordinary Lua")')).toBeUndefined();
    expect(preserveTypeScriptPreprocessorDirectives("//--#unrecognized payload")).toBe("//--#unrecognized payload");
  });
});
