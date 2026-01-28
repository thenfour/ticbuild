import * as fs from "node:fs";
import * as path from "node:path";
import * as cons from "../utils/console";
import { containsTicbuildManifest, getTemplatesRootDir } from "../utils/templates";

export async function templateListCommand(): Promise<void> {
  const templatesRoot = getTemplatesRootDir();

  if (!fs.existsSync(templatesRoot) || !fs.statSync(templatesRoot).isDirectory()) {
    throw new Error(`Templates directory not found: ${templatesRoot}`);
  }

  const entries = fs.readdirSync(templatesRoot, { withFileTypes: true });
  const templateNames: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const entryPath = path.join(templatesRoot, entry.name);
    if (containsTicbuildManifest(entryPath)) {
      templateNames.push(entry.name);
    }
  }

  templateNames.sort((a, b) => a.localeCompare(b));

  if (templateNames.length === 0) {
    cons.warning("No templates found.");
    return;
  }

  cons.h1("Available templates:");
  for (const name of templateNames) {
    cons.info(`  ${name}`);
  }
}
