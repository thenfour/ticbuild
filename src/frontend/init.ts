// so yea i introduce YET another meta language.
// another variable substitution system; quite simple just for expanding templates:
// {{VARIABLE_NAME}} gets replaced with the string value.

import * as fs from "node:fs";
import * as path from "node:path";
import * as cons from "../utils/console";
import { copyFile, ensureDir, fileExists, isDirectory, isDirectoryEmpty } from "../utils/fileSystem";
import { applyTemplateVariables, getPathRelativeToTemplates, resolveTemplateDir } from "../utils/templates";

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
function containsTicbuildManifest(dirPath: string): boolean {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (containsTicbuildManifest(entryPath)) {
        return true;
      }
      continue;
    }
    if (entry.name.toLowerCase().endsWith(".ticbuild.jsonc")) {
      return true;
    }
  }
  return false;
}

/////////////////////////////////////////////////////////////////////////////////
function resolveAndValidateTemplateDir(templateOption: string): string {
  const isAbsolute = path.isAbsolute(templateOption);
  const templateDir = isAbsolute ? templateOption : resolveTemplateDir(templateOption);

  if (!isDirectory(templateDir)) {
    throw new Error(`Template path is not a directory: ${templateDir}`);
  }

  if (!containsTicbuildManifest(templateDir)) {
    throw new Error(`Template is missing *.ticbuild.jsonc: ${templateDir}`);
  }

  return templateDir;
}

/////////////////////////////////////////////////////////////////////////////////
export async function initCommand(targetDir?: string, options?: InitOptions): Promise<void> {
  const resolvedDir = path.resolve(process.cwd(), targetDir || ".");
  ensureDir(resolvedDir);

  if (!options?.force && !isDirectoryEmpty(resolvedDir)) {
    throw new Error(`Target directory is not empty: ${resolvedDir} (use --force to overwrite)`);
  }

  const projectName = options?.name?.trim() || path.basename(resolvedDir);
  const templateDir = resolveAndValidateTemplateDir(options?.template || "minimal");

  copyTemplateDir(templateDir, resolvedDir, { PROJECT_NAME: projectName }, options?.force === true);

  const schemaSourcePath = path.resolve(__dirname, "..", "..", "ticbuild.schema.json");
  const schemaTargetPath = path.join(resolvedDir, ".ticbuild/ticbuild.schema.json");
  copyFile(schemaSourcePath, schemaTargetPath, options?.force === true);

  // and copy the gitignore.
  const gitignoreSourcePath = getPathRelativeToTemplates("gitignore.template");
  const gitignoreTargetPath = path.join(resolvedDir, ".gitignore");
  copyFile(gitignoreSourcePath, gitignoreTargetPath, options?.force === true);

  // and vs code launch config
  const launchSourcePath = getPathRelativeToTemplates("vscode_launch.template.json");
  const launchTargetDir = path.join(resolvedDir, ".vscode");
  const launchTargetPath = path.join(launchTargetDir, "launch.json");
  ensureDir(launchTargetDir);
  copyFile(launchSourcePath, launchTargetPath, options?.force === true);

  cons.success(`Initialized ticbuild project in ${resolvedDir}`);
}
