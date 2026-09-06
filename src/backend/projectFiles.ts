import * as path from "node:path";
import { parse as parseJsonc, ParseError } from "jsonc-parser";
import {
  canonicalizePath,
  ensureDir,
  fileExists,
  isSameFileLocation,
  readTextFileAsync,
  writeTextFile,
} from "../utils/fileSystem";
import {
  projectFileInventory,
  ProjectFileId,
  ProjectFileInventoryEntry,
  ProjectFilePolicy,
} from "../projectFileInventory";
import { getPathRelativeToPackageRoot } from "../utils/templates";
import { resolveManifestPath } from "./manifestLoader";

export type { ProjectFilePolicy } from "../projectFileInventory";
export type ProjectFileStatus = "current" | "missing" | "outdated" | "unmanaged";
export type ProjectFileUpdateAction = "unchanged" | "created" | "updated" | "unmanaged";

export interface ProjectFileInspection {
  id: ProjectFileId;
  projectPath: string;
  projectRelativePath: string;
  policy: ProjectFilePolicy;
  status: ProjectFileStatus;
  detail?: string;
}

export interface ProjectFilesCheckResult {
  manifestPath: string;
  projectDir: string;
  files: ProjectFileInspection[];
  needsUpdate: boolean;
}

export interface ProjectFileUpdate extends ProjectFileInspection {
  action: ProjectFileUpdateAction;
}

export interface ProjectFilesUpdateResult {
  manifestPath: string;
  projectDir: string;
  files: ProjectFileUpdate[];
  changed: boolean;
}

type ProjectFileDefinition = {
  id: ProjectFileId;
  sourcePath: string;
} & ProjectFileInventoryEntry;

export function getProjectTic80DeclarationsPath(projectDir: string): string {
  return canonicalizePath(path.join(
    projectDir,
    projectFileInventory["tic80-typescript-declarations"].projectRelativePath,
  ));
}

export function getBundledTic80DeclarationsPath(): string {
  return getPathRelativeToPackageRoot(
    projectFileInventory["tic80-typescript-declarations"].sourceRelativePath,
  );
}

async function readManifestSchemaReference(manifestPath: string): Promise<string | undefined> {
  const source = await readTextFileAsync(manifestPath, "utf-8");
  const errors: ParseError[] = [];
  const parsed = parseJsonc(source, errors, { allowTrailingComma: true });
  if (errors.length > 0 || typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Cannot inspect project files because the manifest is not valid JSONC: ${manifestPath}`);
  }
  const schemaReference = (parsed as Record<string, unknown>).$schema;
  return typeof schemaReference === "string" ? schemaReference : undefined;
}

async function resolveProjectFileDefinitions(
  manifestPath: string,
  projectDir: string,
): Promise<Array<ProjectFileDefinition & { unmanagedDetail?: string }>> {
  const schemaReference = await readManifestSchemaReference(manifestPath);
  const managedSchemaPath = path.join(
    projectDir,
    projectFileInventory["manifest-schema"].projectRelativePath,
  );
  const resolvedSchemaPath = schemaReference === undefined
    ? managedSchemaPath
    : path.resolve(projectDir, schemaReference);

  const entries = Object.entries(projectFileInventory) as Array<[
    ProjectFileId,
    ProjectFileInventoryEntry,
  ]>;
  return entries.map(([id, inventoryEntry]) => {
    const definition: ProjectFileDefinition = {
      id,
      ...inventoryEntry,
      sourcePath: getPathRelativeToPackageRoot(inventoryEntry.sourceRelativePath),
    };
    if (definition.id !== "manifest-schema" || isSameFileLocation(resolvedSchemaPath, managedSchemaPath)) {
      return definition;
    }
    return {
      ...definition,
      unmanagedDetail: `Manifest $schema is user-managed: ${schemaReference}`,
    };
  });
}

export async function checkProjectFiles(manifestPath?: string): Promise<ProjectFilesCheckResult> {
  const resolvedManifestPath = resolveManifestPath(manifestPath);
  const projectDir = path.dirname(resolvedManifestPath);
  const definitions = await resolveProjectFileDefinitions(resolvedManifestPath, projectDir);
  const files: ProjectFileInspection[] = [];

  for (const definition of definitions) {
    const projectPath = canonicalizePath(path.join(projectDir, definition.projectRelativePath));
    const base = {
      id: definition.id,
      projectPath,
      projectRelativePath: definition.projectRelativePath,
      policy: definition.policy,
    };

    if (definition.unmanagedDetail) {
      files.push({ ...base, status: "unmanaged", detail: definition.unmanagedDetail });
      continue;
    }
    if (!fileExists(projectPath)) {
      files.push({ ...base, status: "missing" });
      continue;
    }
    if (definition.policy === "create-if-missing") {
      files.push({ ...base, status: "current" });
      continue;
    }

    const [expected, actual] = await Promise.all([
      readTextFileAsync(definition.sourcePath, "utf-8"),
      readTextFileAsync(projectPath, "utf-8"),
    ]);
    files.push({ ...base, status: expected === actual ? "current" : "outdated" });
  }

  return {
    manifestPath: resolvedManifestPath,
    projectDir,
    files,
    needsUpdate: files.some((file) => file.status === "missing" || file.status === "outdated"),
  };
}

export async function updateProjectFiles(manifestPath?: string): Promise<ProjectFilesUpdateResult> {
  const check = await checkProjectFiles(manifestPath);
  const definitions = await resolveProjectFileDefinitions(check.manifestPath, check.projectDir);
  const definitionsById = new Map(definitions.map((definition) => [definition.id, definition]));
  const files: ProjectFileUpdate[] = [];

  for (const inspection of check.files) {
    let action: ProjectFileUpdateAction = inspection.status === "unmanaged" ? "unmanaged" : "unchanged";
    if (inspection.status === "missing" || inspection.status === "outdated") {
      const definition = definitionsById.get(inspection.id);
      if (!definition || definition.unmanagedDetail) {
        throw new Error(`Project file definition is unavailable: ${inspection.id}`);
      }
      const content = await readTextFileAsync(definition.sourcePath, "utf-8");
      ensureDir(path.dirname(inspection.projectPath));
      await writeTextFile(inspection.projectPath, content, "utf-8");
      action = inspection.status === "missing" ? "created" : "updated";
    }
    files.push({ ...inspection, action });
  }

  return {
    manifestPath: check.manifestPath,
    projectDir: check.projectDir,
    files,
    changed: files.some((file) => file.action === "created" || file.action === "updated"),
  };
}
