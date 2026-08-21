import { deduceImportKindFromPath } from "./projectCore";

describe("deduceImportKindFromPath", () => {
  it("deduces TypeScriptCode for TypeScript implementation files", () => {
    expect(deduceImportKindFromPath("src/main.ts")).toBe("TypeScriptCode");
  });

  it("does not treat declaration files as executable TypeScript code", () => {
    expect(deduceImportKindFromPath("src/types.d.ts")).toBeUndefined();
  });
});
