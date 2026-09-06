export type ProjectFilePolicy = "managed" | "create-if-missing";

export interface ProjectFileInventoryEntry {
  projectRelativePath: string;
  sourceRelativePath: string;
  policy: ProjectFilePolicy;
}

export const projectFileInventory = {
  "manifest-schema": {
    projectRelativePath: ".ticbuild/ticbuild.schema.json",
    sourceRelativePath: "ticbuild.schema.json",
    policy: "managed",
  },
  "tic80-typescript-declarations": {
    projectRelativePath: ".ticbuild/declarations/tic80.d.ts",
    sourceRelativePath: "templates/declarations/tic80.d.ts",
    policy: "managed",
  },
  environment: {
    projectRelativePath: ".env",
    sourceRelativePath: "templates/env.template",
    policy: "create-if-missing",
  },
  "vscode-launch": {
    projectRelativePath: ".vscode/launch.json",
    sourceRelativePath: "templates/vscode_launch.template.json",
    policy: "create-if-missing",
  },
  "vscode-settings": {
    projectRelativePath: ".vscode/settings.json",
    sourceRelativePath: "templates/vscode_settings.template.json",
    policy: "create-if-missing",
  },
  "vscode-extensions": {
    projectRelativePath: ".vscode/extensions.json",
    sourceRelativePath: "templates/vscode_extensions.template.json",
    policy: "create-if-missing",
  },
} as const satisfies Readonly<Record<string, ProjectFileInventoryEntry>>;

export type ProjectFileId = keyof typeof projectFileInventory;
