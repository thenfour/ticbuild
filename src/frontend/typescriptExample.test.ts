import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as cons from "../utils/console";
import { buildCore } from "./core";
import { initCommand } from "./init";
import * as packageInstaller from "./packageInstaller";

describe("TypeScript project template", () => {
  let exampleDir: string;

  beforeEach(() => {
    exampleDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-template-"));
    jest.spyOn(cons, "success").mockImplementation(() => undefined);
    jest.spyOn(packageInstaller, "installProjectDependencies").mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(exampleDir, { recursive: true, force: true });
  });

  it("initializes and builds a runnable exported TIC callback", async () => {
    await initCommand(exampleDir, { name: "typescript1", template: "typescript" });
    await buildCore(path.join(exampleDir, "project.ticbuild.jsonc"));

    const preprocessedLua = fs.readFileSync(
      path.join(exampleDir, "build", "release-obj", "maincode.01.preprocessed.lua"),
      "utf-8",
    );
    expect(preprocessedLua).toContain("function ____exports.TIC()");
    expect(preprocessedLua).toContain('_G["TIC"] = ____exports.TIC');
    expect(preprocessedLua).toContain('_G["TIC"] = ____entry["TIC"]');
    expect(preprocessedLua).not.toContain("__TICBUILD_EXPORT_GLOBAL__");
    expect(preprocessedLua).not.toContain("return ____entry");
    const generatedPath = path.join(exampleDir, "build", "release-obj", "maincode.00.generated.lua");
    const generatedMapPath = `${generatedPath}.map`;
    const preprocessedMapPath = path.join(
      exampleDir,
      "build",
      "release-obj",
      "maincode.01.preprocessed.lua.map",
    );
    expect(fs.existsSync(generatedPath)).toBe(true);
    expect(fs.existsSync(generatedMapPath)).toBe(true);
    expect(fs.existsSync(preprocessedMapPath)).toBe(true);
    const preprocessedMap = JSON.parse(fs.readFileSync(preprocessedMapPath, "utf-8"));
    expect(preprocessedMap.version).toBe(3);
    expect(preprocessedMap.file).toBe("maincode.01.preprocessed.lua");
    expect(preprocessedMap.sources.some((source: string) => source.endsWith("src/main.ts"))).toBe(true);
    expect(preprocessedMap.sourcesContent).toContainEqual(expect.stringContaining("export function TIC"));
    expect(preprocessedMap.x_ticbuild).toMatchObject({ version: 1, offsetEncoding: "utf-16" });
    expect(preprocessedMap.x_ticbuild.segments.length).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(exampleDir, "build", "release-bin", "typescript1.tic"))).toBe(true);
  });
});
