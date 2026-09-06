import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as cons from "../utils/console";
import { buildCore } from "./core";
import { projectCheckCommand, projectUpdateCommand } from "./projectFiles";

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function createManifest(dir: string, validProject: boolean): string {
  const manifestPath = path.join(dir, "project.ticbuild.jsonc");
  const manifest = validProject
    ? {
      $schema: "./.ticbuild/ticbuild.schema.json",
      buildConfiguration: "release",
      project: {
        name: "test",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "out.tic",
      },
      imports: [{ name: "main", path: "main.lua", kind: "LuaCode" }],
      assembly: { lua: { minify: false }, blocks: [{ asset: "main" }] },
    }
    : { $schema: "./.ticbuild/ticbuild.schema.json" };
  writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return manifestPath;
}

describe("project file commands", () => {
  const originalExitCode = process.exitCode;

  afterEach(() => {
    process.exitCode = originalExitCode;
    jest.restoreAllMocks();
  });

  it("returns a failing check status without writing, then updates the project", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-project-command-"));
    const manifestPath = createManifest(dir, false);
    jest.spyOn(cons, "warning").mockImplementation(() => undefined);
    jest.spyOn(cons, "error").mockImplementation(() => undefined);
    jest.spyOn(cons, "success").mockImplementation(() => undefined);

    try {
      const check = await projectCheckCommand(manifestPath);
      expect(check.needsUpdate).toBe(true);
      expect(process.exitCode).toBe(1);
      expect(fs.existsSync(path.join(dir, ".ticbuild"))).toBe(false);

      const update = await projectUpdateCommand(manifestPath);
      expect(update.changed).toBe(true);
      expect((await projectCheckCommand(manifestPath)).needsUpdate).toBe(false);
      expect(process.exitCode).toBe(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("does not provision project files as a build side effect", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-project-build-"));
    const manifestPath = createManifest(dir, true);
    writeFile(path.join(dir, "main.lua"), "print('ok')");

    try {
      await buildCore(manifestPath);
      expect(fs.existsSync(path.join(dir, ".ticbuild"))).toBe(false);
      expect(fs.existsSync(path.join(dir, ".env"))).toBe(false);
      expect(fs.existsSync(path.join(dir, ".vscode"))).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
