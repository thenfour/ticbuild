import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  checkProjectFiles,
  getBundledTic80DeclarationsPath,
  updateProjectFiles,
} from "./projectFiles";

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function createProject(schemaReference = "./.ticbuild/ticbuild.schema.json"): {
  dir: string;
  manifestPath: string;
} {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-project-files-"));
  const manifestPath = path.join(dir, "project.ticbuild.jsonc");
  writeFile(manifestPath, `{
    // Project file updates must work before full manifest validation.
    "$schema": ${JSON.stringify(schemaReference)}
  }`);
  return { dir, manifestPath };
}

describe("project files", () => {
  it("checks missing files without changing the project", async () => {
    const { dir, manifestPath } = createProject();
    try {
      const result = await checkProjectFiles(manifestPath);

      expect(result.needsUpdate).toBe(true);
      expect(result.files).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: "manifest-schema", policy: "managed", status: "missing" }),
        expect.objectContaining({ id: "tic80-typescript-declarations", policy: "managed", status: "missing" }),
        expect.objectContaining({ id: "environment", policy: "create-if-missing", status: "missing" }),
        expect.objectContaining({ id: "vscode-launch", policy: "create-if-missing", status: "missing" }),
      ]));
      expect(fs.existsSync(path.join(dir, ".ticbuild"))).toBe(false);
      expect(fs.existsSync(path.join(dir, ".env"))).toBe(false);
      expect(fs.existsSync(path.join(dir, ".vscode"))).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("updates managed files and creates missing seed files", async () => {
    const { dir, manifestPath } = createProject();
    try {
      const update = await updateProjectFiles(manifestPath);

      expect(update.changed).toBe(true);
      expect(update.files).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: "manifest-schema", action: "created" }),
        expect.objectContaining({ id: "tic80-typescript-declarations", action: "created" }),
        expect.objectContaining({ id: "environment", action: "created" }),
        expect.objectContaining({ id: "vscode-settings", action: "created" }),
      ]));
      expect(fs.readFileSync(path.join(dir, ".ticbuild", "ticbuild.schema.json"), "utf-8"))
        .toBe(fs.readFileSync(path.resolve(__dirname, "..", "..", "ticbuild.schema.json"), "utf-8"));
      expect(fs.readFileSync(path.join(dir, ".ticbuild", "declarations", "tic80.d.ts"), "utf-8"))
        .toBe(fs.readFileSync(getBundledTic80DeclarationsPath(), "utf-8"));
      expect((await checkProjectFiles(manifestPath)).needsUpdate).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("replaces outdated managed files but preserves every existing seed file", async () => {
    const { dir, manifestPath } = createProject();
    const schemaPath = path.join(dir, ".ticbuild", "ticbuild.schema.json");
    const declarationsPath = path.join(dir, ".ticbuild", "declarations", "tic80.d.ts");
    const envPath = path.join(dir, ".env");
    const settingsPath = path.join(dir, ".vscode", "settings.json");
    writeFile(schemaPath, "old schema");
    writeFile(declarationsPath, "old declarations");
    writeFile(envPath, "USER_ENV=preserved\n");
    writeFile(settingsPath, "user settings");

    try {
      const result = await updateProjectFiles(manifestPath);

      expect(result.files).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: "manifest-schema", action: "updated" }),
        expect.objectContaining({ id: "tic80-typescript-declarations", action: "updated" }),
        expect.objectContaining({ id: "environment", action: "unchanged" }),
        expect.objectContaining({ id: "vscode-settings", action: "unchanged" }),
        expect.objectContaining({ id: "vscode-extensions", action: "created" }),
      ]));
      expect(fs.readFileSync(envPath, "utf-8")).toBe("USER_ENV=preserved\n");
      expect(fs.readFileSync(settingsPath, "utf-8")).toBe("user settings");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("leaves a custom manifest schema entirely user-managed", async () => {
    const { dir, manifestPath } = createProject("./custom.schema.json");
    const customSchemaPath = path.join(dir, "custom.schema.json");
    writeFile(customSchemaPath, "custom schema");

    try {
      const result = await updateProjectFiles(manifestPath);
      const schema = result.files.find((file) => file.id === "manifest-schema");

      expect(schema).toMatchObject({ status: "unmanaged", action: "unmanaged" });
      expect(fs.readFileSync(customSchemaPath, "utf-8")).toBe("custom schema");
      expect(fs.existsSync(path.join(dir, ".ticbuild", "ticbuild.schema.json"))).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
