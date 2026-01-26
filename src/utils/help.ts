import * as fs from "node:fs";
import * as path from "node:path";
import { buildInfo } from "../buildInfo";
import { getBuildVersionTag } from "./versionString";
import { applyTemplateVariables } from "./templates";

function loadHelpTemplate(templateName: string): string {
  const templatePath = path.resolve(__dirname, "..", "..", "templates", "help", `${templateName}.txt`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Help template not found: ${templatePath}`);
  }
  return fs.readFileSync(templatePath, "utf-8");
}

function renderHelpTemplate(templateName: string): string {
  const template = loadHelpTemplate(templateName);
  const variables: Record<string, string> = {
    VERSION: getBuildVersionTag(buildInfo),
    COMMIT_HASH: buildInfo.commitHash || "unknown",
    BUILD_DATE: buildInfo.buildDate || "unknown",
  };
  return applyTemplateVariables(template, variables);
}

export function printMainHelp(): void {
  const help = renderHelpTemplate("main");
  console.log(help);
}

export function printBuildHelp(): void {
  const help = renderHelpTemplate("build");
  console.log(help);
}

export function printRunHelp(): void {
  const help = renderHelpTemplate("run");
  console.log(help);
}

export function printWatchHelp(): void {
  const help = renderHelpTemplate("watch");
  console.log(help);
}

export function printInitHelp(): void {
  const help = renderHelpTemplate("init");
  console.log(help);
}

export function printTic80Help(): void {
  const help = renderHelpTemplate("tic80");
  console.log(help);
}
