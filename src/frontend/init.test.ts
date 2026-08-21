import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as ts from "typescript";
import { buildInfo } from "../buildInfo";
import * as cons from "../utils/console";
import { initCommand } from "./init";

describe("ticbuild init", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-init-"));
    jest.spyOn(cons, "success").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("creates a TypeScript project whose declarations resolve in a conventional TypeScript program", async () => {
    await initCommand(tempDir, { name: "Typed Game", template: "typescript" });

    const packageJson = JSON.parse(fs.readFileSync(path.join(tempDir, "package.json"), "utf-8"));
    expect(packageJson.name).toBe("typed-game");
    expect(packageJson.devDependencies).toEqual({
      ticbuild: `^${buildInfo.version}`,
      typescript: buildInfo.typescriptVersion,
    });
    expect(fs.readFileSync(path.join(tempDir, "project.ticbuild.jsonc"), "utf-8")).toContain(
      '"name": "Typed Game"',
    );
    expect(fs.readFileSync(path.join(tempDir, "src", "ticbuild-env.d.ts"), "utf-8")).toContain(
      'import "ticbuild/tic80"',
    );

    installDeclarationTestFixture(tempDir);

    const configPath = path.join(tempDir, "tsconfig.json");
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    expect(config.error).toBeUndefined();
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, tempDir, undefined, configPath);
    const program = ts.createProgram(parsed.fileNames, parsed.options);
    const errors = ts
      .getPreEmitDiagnostics(program)
      .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);

    expect(errors.map(formatDiagnostic)).toEqual([]);
  });
});

function installDeclarationTestFixture(projectDir: string): void {
  const packageDir = path.join(projectDir, "node_modules", "ticbuild");
  fs.mkdirSync(packageDir, { recursive: true });
  fs.copyFileSync(path.resolve(__dirname, "..", "..", "tic80.d.ts"), path.join(packageDir, "tic80.d.ts"));
  fs.writeFileSync(path.join(packageDir, "package.json"), JSON.stringify({ name: "ticbuild" }), "utf-8");

  const languageExtensionsSource = path.resolve(
    __dirname,
    "..",
    "..",
    "node_modules",
    "@typescript-to-lua",
    "language-extensions",
  );
  const languageExtensionsTarget = path.join(
    projectDir,
    "node_modules",
    "@typescript-to-lua",
    "language-extensions",
  );
  fs.cpSync(languageExtensionsSource, languageExtensionsTarget, { recursive: true });
}

function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  return ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
}
