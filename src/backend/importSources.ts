import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import * as path from "node:path";
import * as cons from "../utils/console";
import { canonicalizePathKey, ensureDir, fileExists } from "../utils/fileSystem";
import { ExternalDependency } from "./ImportedResourceTypes";
import { ImportDefinition, kImportKind } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";

export type ImportSourcePlan =
  | {
    sourceKind: "path";
    filePath: string;
    watchDependencies: ExternalDependency[];
    generatedOutputs: string[];
  }
  | {
    sourceKind: "command";
    filePath: string;
    watchDependencies: ExternalDependency[];
    generatedOutputs: string[];
    executable: string;
    args: string[];
  }
  | {
    sourceKind: "value";
    value: string;
    watchDependencies: ExternalDependency[];
    generatedOutputs: string[];
  };

export type MaterializedImportSource = ImportSourcePlan;

export interface ImportSourceEngine {
  describe(project: TicbuildProjectCore, spec: ImportDefinition): ImportSourcePlan;
  materialize(project: TicbuildProjectCore, spec: ImportDefinition): Promise<MaterializedImportSource>;
}

function getPathDependencyReason(spec: ImportDefinition): string {
  switch (spec.kind) {
    case kImportKind.key.LuaCode:
      return "Imported Lua code file";
    case kImportKind.key.TypeScriptCode:
      return "Imported TypeScript code file";
    case kImportKind.key.Tic80Cartridge:
      return "Imported TIC-80 cartridge";
    case kImportKind.key.binary:
      return "Imported binary resource";
    case kImportKind.key.text:
      return "Imported text resource";
    default:
      return "Imported resource file";
  }
}

export class PathImportSourceEngine implements ImportSourceEngine {
  describe(project: TicbuildProjectCore, spec: ImportDefinition): ImportSourcePlan {
    const filePath = project.resolveImportPath(spec);
    return {
      sourceKind: "path",
      filePath,
      watchDependencies: [{ path: filePath, reason: getPathDependencyReason(spec) }],
      generatedOutputs: [],
    };
  }

  async materialize(project: TicbuildProjectCore, spec: ImportDefinition): Promise<MaterializedImportSource> {
    return this.describe(project, spec);
  }
}

export class InlineValueImportSourceEngine implements ImportSourceEngine {
  describe(project: TicbuildProjectCore, spec: ImportDefinition): ImportSourcePlan {
    if (spec.value === undefined) {
      throw new Error(`Import ${spec.name} is missing its inline value`);
    }
    return {
      sourceKind: "value",
      value: project.substituteVariables(spec.value),
      watchDependencies: [],
      generatedOutputs: [],
    };
  }

  async materialize(project: TicbuildProjectCore, spec: ImportDefinition): Promise<MaterializedImportSource> {
    return this.describe(project, spec);
  }
}

function renderCommand(executable: string, args: readonly string[]): string {
  return [executable, ...args].map((part) => JSON.stringify(part)).join(" ");
}

function resolveCommandProjectPath(project: TicbuildProjectCore, filePath: string): string {
  const substituted = project.substituteVariables(filePath);
  return path.normalize(path.isAbsolute(substituted) ? substituted : path.resolve(project.projectDir, substituted));
}

function renderProcessOutput(importName: string, output: string, log: (message: string) => void): void {
  for (const line of output.split(/\r?\n/)) {
    if (line.length > 0) {
      log(`[import:${importName}] ${line}`);
    }
  }
}

function waitForCommand(child: ChildProcessWithoutNullStreams, commandText: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer | string) => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk: Buffer | string) => stderr.push(Buffer.from(chunk)));
    child.once("error", (error) => reject(new Error(`Unable to start command ${commandText}: ${error.message}`)));
    child.once("close", (code, signal) => {
      const result = {
        stdout: Buffer.concat(stdout).toString("utf-8"),
        stderr: Buffer.concat(stderr).toString("utf-8"),
      };
      if (code !== 0) {
        const exitDescription = signal ? `signal ${signal}` : `exit code ${code ?? "unknown"}`;
        const stderrSuffix = result.stderr.trim().length > 0 ? `\n${result.stderr.trim()}` : "";
        reject(new Error(`Command ${commandText} failed with ${exitDescription}${stderrSuffix}`));
        return;
      }
      resolve(result);
    });
  });
}

export class CommandImportSourceEngine implements ImportSourceEngine {
  describe(project: TicbuildProjectCore, spec: ImportDefinition): ImportSourcePlan {
    const command = spec.command;
    if (!command) {
      throw new Error(`Import ${spec.name} is missing its command source`);
    }
    const executable = project.substituteVariables(command.executable);
    const args = (command.args ?? []).map((arg) => project.substituteVariables(arg));
    const filePath = resolveCommandProjectPath(project, command.outputFile);
    const watchDependencies = (command.fileDependencies ?? []).map((dependencyPath) => ({
      path: resolveCommandProjectPath(project, dependencyPath),
      reason: `Command import dependency for ${spec.name}`,
    }));
    return {
      sourceKind: "command",
      filePath,
      watchDependencies,
      generatedOutputs: [filePath],
      executable,
      args,
    };
  }

  async materialize(project: TicbuildProjectCore, spec: ImportDefinition): Promise<MaterializedImportSource> {
    const plan = this.describe(project, spec);
    if (plan.sourceKind !== "command") {
      throw new Error(`Internal error: command source plan expected for import ${spec.name}`);
    }

    ensureDir(path.dirname(plan.filePath));
    const commandText = renderCommand(plan.executable, plan.args);
    cons.info(`Running command import ${spec.name}: ${commandText}`);
    const child = spawn(plan.executable, plan.args, {
      cwd: project.projectDir,
      env: project.processEnvironment,
      shell: false,
      windowsHide: true,
    });
    const output = await waitForCommand(child, commandText);
    renderProcessOutput(spec.name, output.stdout, cons.info);
    renderProcessOutput(spec.name, output.stderr, cons.warning);

    if (!fileExists(plan.filePath)) {
      throw new Error(`Command import ${spec.name} completed successfully but did not produce ${plan.filePath}`);
    }
    return plan;
  }
}

const pathImportSourceEngine = new PathImportSourceEngine();
const inlineValueImportSourceEngine = new InlineValueImportSourceEngine();
const commandImportSourceEngine = new CommandImportSourceEngine();

function selectImportSourceEngine(spec: ImportDefinition): ImportSourceEngine {
  const sourceKeys = [spec.path !== undefined, spec.value !== undefined, spec.command !== undefined].filter(Boolean).length;
  if (sourceKeys !== 1) {
    throw new Error(`Import ${spec.name} must specify exactly one of path, value, or command`);
  }
  if (spec.command !== undefined) {
    return commandImportSourceEngine;
  }
  if (spec.path !== undefined) {
    return pathImportSourceEngine;
  }
  return inlineValueImportSourceEngine;
}

export function describeImportSource(project: TicbuildProjectCore, spec: ImportDefinition): ImportSourcePlan {
  return selectImportSourceEngine(spec).describe(project, spec);
}

export function materializeImportSource(
  project: TicbuildProjectCore,
  spec: ImportDefinition,
): Promise<MaterializedImportSource> {
  return selectImportSourceEngine(spec).materialize(project, spec);
}

export class ImportSourceManager {
  private readonly plans = new Map<string, ImportSourcePlan>();
  private readonly materialized = new Map<string, Promise<MaterializedImportSource>>();

  constructor(private readonly project: TicbuildProjectCore) {
    const generatedOutputOwners = new Map<string, string>();
    const pathSourceOwners = new Map<string, string[]>();

    for (const spec of project.manifest.imports) {
      if (this.plans.has(spec.name)) {
        throw new Error(`Duplicate import name: ${spec.name}`);
      }
      const plan = describeImportSource(project, spec);
      this.plans.set(spec.name, plan);
      if (plan.sourceKind === "path") {
        const key = canonicalizePathKey(plan.filePath);
        const owners = pathSourceOwners.get(key) ?? [];
        owners.push(spec.name);
        pathSourceOwners.set(key, owners);
      }
      for (const outputPath of plan.generatedOutputs) {
        const key = canonicalizePathKey(outputPath);
        const existingOwner = generatedOutputOwners.get(key);
        if (existingOwner) {
          throw new Error(`Command imports ${existingOwner} and ${spec.name} produce the same output file: ${outputPath}`);
        }
        generatedOutputOwners.set(key, spec.name);
        if (plan.watchDependencies.some((dependency) => canonicalizePathKey(dependency.path) === key)) {
          throw new Error(`Command import ${spec.name} outputFile must not also be a fileDependency: ${outputPath}`);
        }
      }
    }

    for (const [outputKey, commandOwner] of generatedOutputOwners) {
      const pathOwners = pathSourceOwners.get(outputKey);
      if (pathOwners) {
        throw new Error(
          `Command import ${commandOwner} output is also consumed by path import ${pathOwners.join(", ")}; cross-import generation is not supported`,
        );
      }
    }
  }

  describe(importName: string): ImportSourcePlan | undefined {
    return this.plans.get(importName);
  }

  getDeclaredWatchDependencies(): ExternalDependency[] {
    return Array.from(this.plans.values()).flatMap((plan) => plan.watchDependencies);
  }

  materialize(importName: string): Promise<MaterializedImportSource | undefined> {
    const spec = this.project.manifest.imports.find((candidate) => candidate.name === importName);
    if (!spec) {
      return Promise.resolve(undefined);
    }
    let task = this.materialized.get(importName);
    if (!task) {
      task = materializeImportSource(this.project, spec);
      this.materialized.set(importName, task);
    }
    return task;
  }
}

export function requireFileImportSource(spec: ImportDefinition, source: MaterializedImportSource): string {
  if (source.sourceKind === "value") {
    throw new Error(`Import ${spec.name} of kind ${spec.kind ?? "unknown"} does not support an inline value source`);
  }
  return source.filePath;
}
