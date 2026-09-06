import * as fs from "node:fs";
import * as path from "node:path";
import { parse } from "dotenv";

// todo: this could be made more general to allow things like .env.development, .env.production, etc.
export const PROJECT_ENV_FILE_NAMES = [".env", ".env.local"] as const;

export interface ProjectEnvironment {
  /** Environment inherited by project-owned child processes. */
  processEnvironment: NodeJS.ProcessEnv;
}

export function getProjectEnvironmentPaths(projectDir: string): string[] {
  return PROJECT_ENV_FILE_NAMES.map((fileName) => path.join(projectDir, fileName));
}

function readEnvironmentFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return parse(fs.readFileSync(filePath, "utf-8"));
}

export function loadProjectEnvironment(
  projectDir: string,
  ambientEnvironment: NodeJS.ProcessEnv = process.env,
  overrideEnvironment?: Record<string, string>,
): ProjectEnvironment {
  const [envPath, envLocalPath] = getProjectEnvironmentPaths(projectDir);
  const declaredVariables = {
    ...readEnvironmentFile(envPath),
    ...readEnvironmentFile(envLocalPath),
  };

  const processEnvironment: NodeJS.ProcessEnv = { ...declaredVariables };
  for (const [name, value] of Object.entries(ambientEnvironment)) {
    if (value !== undefined) {
      processEnvironment[name] = value;
    }
  }
  for (const [name, value] of Object.entries(overrideEnvironment ?? {})) {
    processEnvironment[name] = value;
  }

  return { processEnvironment };
}
