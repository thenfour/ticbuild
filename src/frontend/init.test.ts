import * as childProcess from "node:child_process";
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
      eslint: buildInfo.eslintVersion,
      ticbuild: `^${buildInfo.version}`,
      typescript: buildInfo.typescriptVersion,
      "typescript-eslint": buildInfo.typescriptEslintVersion,
    });
    expect(packageJson.engines.node).toBe("^20.19.0 || ^22.13.0 || >=24");
    expect(packageJson.scripts).toMatchObject({
      build: "ticbuild build",
      watch: "ticbuild watch",
      typecheck: "tsc --noEmit",
      lint: "eslint src",
      check: "npm run typecheck && npm run lint",
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
    expect(config.config.compilerOptions.lib).toEqual(["ESNext"]);
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, tempDir, undefined, configPath);
    const program = ts.createProgram(parsed.fileNames, parsed.options);
    const errors = ts
      .getPreEmitDiagnostics(program)
      .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);

    expect(errors.map(formatDiagnostic)).toEqual([]);
    expect(JSON.parse(fs.readFileSync(path.join(tempDir, ".vscode", "extensions.json"), "utf-8"))).toEqual({
      recommendations: ["dbaeumer.vscode-eslint"],
    });
  });

  it("lints JavaScript-to-Lua semantic hazards without making them build steps", async () => {
    await initCommand(tempDir, { name: "typed-game", template: "typescript" });
    installDeclarationTestFixture(tempDir);
    installLintTestFixture(tempDir);

    expect(await lintRuleIds(tempDir)).toEqual([]);

    fs.writeFileSync(
      path.join(tempDir, "src", "main.ts"),
      [
        "const score: number = 0;",
        "const expected: number = 1;",
        'const label: string = "";',
        "if (score) cls(0);",
        "if (label) cls(1);",
        "if (score == expected) cls(1);",
        "export function TIC(): void {}",
      ].join("\n"),
      "utf-8",
    );

    const ruleIds = await lintRuleIds(tempDir);
    expect(ruleIds.filter((ruleId) => ruleId === "@typescript-eslint/strict-boolean-expressions")).toHaveLength(2);
    expect(ruleIds).toContain("eqeqeq");
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

function installLintTestFixture(projectDir: string): void {
  const source = path.resolve(__dirname, "..", "..", "node_modules", "typescript-eslint");
  const target = path.join(projectDir, "node_modules", "typescript-eslint");
  fs.symlinkSync(source, target, "junction");
}

async function lintRuleIds(projectDir: string): Promise<(string | null)[]> {
  const eslintCliPath = path.resolve(__dirname, "..", "..", "node_modules", "eslint", "bin", "eslint.js");
  const result = childProcess.spawnSync(process.execPath, [eslintCliPath, "src", "--format", "json"], {
    cwd: projectDir,
    encoding: "utf-8",
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(result.stderr || result.stdout || `ESLint exited with status ${result.status}`);
  }
  const reports = JSON.parse(result.stdout) as Array<{ messages: Array<{ ruleId: string | null }> }>;
  return reports.flatMap((report) => report.messages.map((message) => message.ruleId));
}

function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  return ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
}
