import * as fs from "node:fs";
import * as path from "node:path";
import { buildCore } from "./core";

describe("TypeScript example project", () => {
  const exampleDir = path.resolve(__dirname, "..", "..", "examples", "typescript1");
  const buildDir = path.join(exampleDir, "build");

  afterEach(() => {
    fs.rmSync(buildDir, { recursive: true, force: true });
  });

  it("builds through its explicit tsconfig and publishes exports to Lua", async () => {
    fs.rmSync(buildDir, { recursive: true, force: true });

    await buildCore(path.join(exampleDir, "project.ticbuild.jsonc"));

    const preprocessedLua = fs.readFileSync(
      path.join(buildDir, "release-obj", "LuaMain.01.preprocessed.lua"),
      "utf-8",
    );
    expect(preprocessedLua).toContain('_G["typescriptTick"] = ____entry["typescriptTick"]');
    expect(preprocessedLua).toContain("function ____exports.typescriptTick()");
    expect(preprocessedLua).toContain("typescriptTick()");
    expect(preprocessedLua).not.toContain("return ____entry");
    expect(fs.existsSync(path.join(buildDir, "release-bin", "typescript1.tic"))).toBe(true);
  });
});
