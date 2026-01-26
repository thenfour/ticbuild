// so yea i introduce YET another meta language.
// another variable substitution system; quite simple just for expanding templates:
// {{VARIABLE_NAME}} gets replaced with the string value.

import * as fs from "node:fs";
import * as path from "node:path";
import * as cons from "../utils/console";
import { copyFile, ensureDir, fileExists, isDirectoryEmpty } from "../utils/fileSystem";
import { applyTemplateVariables, resolveTemplateDir } from "../utils/templates";

export type InitOptions = {
  name?: string;
  force?: boolean;
  template?: string; // one of the subdirs in "templates"
};

/////////////////////////////////////////////////////////////////////////////////
function copyTemplateEntry(
  sourcePath: string,
  targetPath: string,
  variables: Record<string, string>,
  force: boolean,
): void {
  if (!force && fileExists(targetPath)) {
    throw new Error(`File already exists: ${targetPath} (use --force to overwrite)`);
  }

  if (isTemplateTextFile(sourcePath)) {
    const content = fs.readFileSync(sourcePath, "utf-8");
    const rendered = applyTemplateVariables(content, variables);
    ensureDir(path.dirname(targetPath));
    fs.writeFileSync(targetPath, rendered, "utf-8");
    return;
  }

  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

/////////////////////////////////////////////////////////////////////////////////
function copyTemplateDir(
  sourceDir: string,
  targetDir: string,
  variables: Record<string, string>,
  force: boolean,
): void {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      ensureDir(targetPath);
      copyTemplateDir(sourcePath, targetPath, variables, force);
      continue;
    }

    copyTemplateEntry(sourcePath, targetPath, variables, force);
  }
}

/////////////////////////////////////////////////////////////////////////////////
function isTemplateTextFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const templateExtensions = new Set([".jsonc", ".json", ".lua", ".md", ".txt"]);
  return templateExtensions.has(ext);
}

/////////////////////////////////////////////////////////////////////////////////
export async function initCommand(targetDir?: string, options?: InitOptions): Promise<void> {
  const resolvedDir = path.resolve(process.cwd(), targetDir || ".");
  ensureDir(resolvedDir);

  if (!options?.force && !isDirectoryEmpty(resolvedDir)) {
    throw new Error(`Target directory is not empty: ${resolvedDir} (use --force to overwrite)`);
  }

  const projectName = options?.name?.trim() || path.basename(resolvedDir);
  const templateDir = resolveTemplateDir(options?.template || "minimal");

  copyTemplateDir(templateDir, resolvedDir, { PROJECT_NAME: projectName }, options?.force === true);

  const schemaSourcePath = path.resolve(__dirname, "..", "..", "ticbuild.schema.json");
  const schemaTargetPath = path.join(resolvedDir, "ticbuild.schema.json");
  copyFile(schemaSourcePath, schemaTargetPath, options?.force === true);

  cons.success(`Initialized ticbuild project in ${resolvedDir}`);
}
