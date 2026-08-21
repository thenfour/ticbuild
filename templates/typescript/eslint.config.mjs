import tseslint from "typescript-eslint";

export default [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // JavaScript and Lua disagree about whether 0, NaN, and "" are truthy.
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowNumber: false,
          allowString: false,
        },
      ],
      // TypeScriptToLua emits both == and === as strict Lua equality.
      eqeqeq: ["error", "always"],
    },
  },
];
