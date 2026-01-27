// so yea i introduce YET another meta language.
// another variable substitution system; quite simple just for expanding templates:
// {{VARIABLE_NAME}} gets replaced with the string value.

import * as fs from "node:fs";
import * as path from "node:path";

export function applyTemplateVariables(template: string, variables: Record<string, string>): string {
  let output = template;
  for (const [key, value] of Object.entries(variables)) {
    output = output.split(`{{${key}}}`).join(value);
  }
  return output;
}

// does not check for existence
export function getPathRelativeToTemplates(more: string): string {
  const fullpath = path.resolve(__dirname, "..", "..", "templates", more);
  return fullpath;
}

export function resolveTemplateDir(name: string): string {
  const templateDir = getPathRelativeToTemplates(name);
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template not found: ${templateDir}`);
  }
  return templateDir;
}
