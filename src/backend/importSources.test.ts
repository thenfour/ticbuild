import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { loadAllImports } from "./importResources";
import { ImportSourceManager } from "./importSources";
import { Manifest } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";

function createProject(
  projectDir: string,
  imports: Manifest["imports"],
  processEnvironment?: NodeJS.ProcessEnv,
): TicbuildProjectCore {
  const mainImport = imports.find((importDef) => importDef.name === "main");
  const manifest: Manifest = {
    buildConfiguration: "release",
    project: {
      name: "command-import-test",
      binDir: "./bin",
      objDir: "./obj",
      outputCartName: "test.tic",
    },
    imports,
    assembly: { blocks: mainImport ? [{ asset: mainImport.name }] : [] },
  };
  return new TicbuildProjectCore({
    manifest,
    manifestPath: path.join(projectDir, "project.ticbuild.jsonc"),
    projectDir,
    buildConfigName: "release",
    processEnvironment,
  });
}

function nodeFileCommand(outputFile: string, data: number[], fileDependencies: string[] = []) {
  return {
    executable: process.execPath,
    args: [
      "-e",
      `require("fs").writeFileSync(process.argv[1], Buffer.from(${JSON.stringify(data)}))`,
      outputFile,
    ],
    outputFile,
    fileDependencies,
  };
}

describe("import source engines", () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-command-import-"));
  });

  afterEach(() => {
    fs.rmSync(projectDir, { recursive: true, force: true });
  });

  it("materializes a command output while exposing only declared inputs as watch dependencies", async () => {
    fs.writeFileSync(path.join(projectDir, "source.png"), "source", "utf-8");
    const project = createProject(projectDir, [
      {
        name: "generated",
        kind: "binary",
        command: nodeFileCommand("generated/data.bin", [1, 2, 3], ["source.png"]),
      },
    ]);
    const manager = new ImportSourceManager(project);

    const source = await manager.materialize("generated");

    expect(source?.sourceKind).toBe("command");
    expect(Array.from(fs.readFileSync(path.join(projectDir, "generated", "data.bin")))).toEqual([1, 2, 3]);
    expect(manager.getDeclaredWatchDependencies()).toEqual([
      {
        path: path.join(projectDir, "source.png"),
        reason: "Command import dependency for generated",
      },
    ]);
    expect(source?.generatedOutputs).toEqual([path.join(projectDir, "generated", "data.bin")]);
  });

  it("passes the project environment to command imports", async () => {
    const project = createProject(
      projectDir,
      [
        {
          name: "generated",
          kind: "text",
          command: {
            executable: process.execPath,
            args: [
              "-e",
              'require("fs").writeFileSync(process.argv[1], process.env.PROJECT_VALUE)',
              "generated/value.txt",
            ],
            outputFile: "generated/value.txt",
          },
        },
      ],
      { PROJECT_VALUE: "from-project-environment" },
    );

    await new ImportSourceManager(project).materialize("generated");

    expect(fs.readFileSync(path.join(projectDir, "generated", "value.txt"), "utf-8")).toBe(
      "from-project-environment",
    );
  });

  it("does not execute commands while describing watch dependencies", () => {
    const markerPath = path.join(projectDir, "ran.txt");
    const project = createProject(projectDir, [
      {
        name: "generated",
        kind: "binary",
        command: {
          executable: process.execPath,
          args: ["-e", 'require("fs").writeFileSync("ran.txt", "yes")'],
          outputFile: "generated/data.bin",
          fileDependencies: ["source.png"],
        },
      },
    ]);

    const manager = new ImportSourceManager(project);
    manager.getDeclaredWatchDependencies();

    expect(fs.existsSync(markerPath)).toBe(false);
  });

  it("does not materialize an unused command import", async () => {
    const markerPath = path.join(projectDir, "unused-command-ran.txt");
    fs.writeFileSync(path.join(projectDir, "main.lua"), "print('root')", "utf-8");
    const project = createProject(projectDir, [
      { name: "main", kind: "LuaCode", path: "main.lua" },
      {
        name: "unused",
        kind: "binary",
        command: {
          executable: process.execPath,
          args: ["-e", 'require("fs").writeFileSync("unused-command-ran.txt", "yes")'],
          outputFile: "generated/unused.bin",
        },
      },
    ]);

    const resources = await loadAllImports(project);

    expect(fs.existsSync(markerPath)).toBe(false);
    expect(resources.items.has("unused")).toBe(false);
    expect(resources.isImportUsed("unused")).toBe(false);
  });

  it("materializes a command once when the asset is also consumed by Lua __IMPORT", async () => {
    const counterScript = [
      'const fs = require("fs")',
      'const countPath = "command-count.txt"',
      'const count = fs.existsSync(countPath) ? Number(fs.readFileSync(countPath, "utf-8")) + 1 : 1',
      'fs.writeFileSync(countPath, String(count))',
      'fs.mkdirSync("generated", { recursive: true })',
      'fs.writeFileSync("generated/data.bin", Buffer.from([4, 5, 6]))',
    ].join(";");
    fs.writeFileSync(
      path.join(projectDir, "main.lua"),
      'local generated = { __IMPORT("u8", "import:generated") }',
      "utf-8",
    );
    fs.writeFileSync(path.join(projectDir, "source.png"), "source", "utf-8");
    const project = createProject(projectDir, [
      { name: "main", kind: "LuaCode", path: "main.lua" },
      {
        name: "generated",
        kind: "binary",
        command: {
          executable: process.execPath,
          args: ["-e", counterScript],
          outputFile: "generated/data.bin",
          fileDependencies: ["source.png"],
        },
      },
    ]);

    const resources = await loadAllImports(project);

    expect(fs.readFileSync(path.join(projectDir, "command-count.txt"), "utf-8")).toBe("1");
    const dependencyPaths = resources.getDependencyList().map((dependency) => dependency.path);
    expect(dependencyPaths).toContain(path.join(projectDir, "source.png"));
    expect(dependencyPaths).not.toContain(path.join(projectDir, "generated", "data.bin"));
  });

  it("does not leak a command-generated Lua output into include watch dependencies", async () => {
    fs.writeFileSync(path.join(projectDir, "main.lua"), '--#include "import:generatedLua"', "utf-8");
    fs.writeFileSync(path.join(projectDir, "generator-input.txt"), "source", "utf-8");
    const generatorScript = [
      'const fs = require("fs")',
      'fs.mkdirSync("generated", { recursive: true })',
      'fs.writeFileSync("generated/helper.lua", "local helper = true")',
    ].join(";");
    const project = createProject(projectDir, [
      { name: "main", kind: "LuaCode", path: "main.lua" },
      {
        name: "generatedLua",
        kind: "LuaCode",
        command: {
          executable: process.execPath,
          args: ["-e", generatorScript],
          outputFile: "generated/helper.lua",
          fileDependencies: ["generator-input.txt"],
        },
      },
    ]);

    const resources = await loadAllImports(project);

    const dependencyPaths = resources.getDependencyList().map((dependency) => dependency.path);
    expect(dependencyPaths).toContain(path.join(projectDir, "generator-input.txt"));
    expect(dependencyPaths).not.toContain(path.join(projectDir, "generated", "helper.lua"));
  });

  it("rejects ambiguous and conflicting source ownership before executing commands", () => {
    const ambiguousProject = createProject(projectDir, [
      {
        name: "ambiguous",
        kind: "binary",
        path: "existing.bin",
        command: nodeFileCommand("generated/data.bin", [1]),
      },
    ]);
    expect(() => new ImportSourceManager(ambiguousProject)).toThrow("exactly one of path, value, or command");

    const conflictingProject = createProject(projectDir, [
      { name: "first", kind: "binary", command: nodeFileCommand("generated/data.bin", [1]) },
      { name: "second", kind: "binary", command: nodeFileCommand("generated/data.bin", [2]) },
    ]);
    expect(() => new ImportSourceManager(conflictingProject)).toThrow("produce the same output file");

    const selfWatchingProject = createProject(projectDir, [
      {
        name: "selfWatching",
        kind: "binary",
        command: nodeFileCommand("generated/data.bin", [1], ["generated/data.bin"]),
      },
    ]);
    expect(() => new ImportSourceManager(selfWatchingProject)).toThrow("must not also be a fileDependency");
  });

  it("fails when a successful command does not produce its declared output", async () => {
    const project = createProject(projectDir, [
      {
        name: "missing",
        kind: "binary",
        command: {
          executable: process.execPath,
          args: ["-e", "process.exit(0)"],
          outputFile: "generated/missing.bin",
        },
      },
    ]);

    await expect(new ImportSourceManager(project).materialize("missing")).rejects.toThrow("did not produce");
  });

  it("reports a command's nonzero exit and stderr", async () => {
    const project = createProject(projectDir, [
      {
        name: "failed",
        kind: "binary",
        command: {
          executable: process.execPath,
          args: ["-e", 'console.error("generator failed"); process.exit(7)'],
          outputFile: "generated/failed.bin",
        },
      },
    ]);

    await expect(new ImportSourceManager(project).materialize("failed")).rejects.toThrow(
      /exit code 7[\s\S]*generator failed/,
    );
  });
});
