import {
  checkProjectFiles,
  ProjectFileInspection,
  ProjectFilesCheckResult,
  ProjectFilesUpdateResult,
  updateProjectFiles,
} from "../backend/projectFiles";
import * as cons from "../utils/console";

function describeFile(file: ProjectFileInspection): string {
  const policy = file.policy === "managed" ? "managed" : "create if missing";
  return `${file.projectRelativePath} (${policy})`;
}

export async function projectCheckCommand(manifestPath?: string): Promise<ProjectFilesCheckResult> {
  const result = await checkProjectFiles(manifestPath);
  cons.h1(`Checking project files for ${result.projectDir}`);
  for (const file of result.files) {
    switch (file.status) {
      case "current":
        cons.dim(`  current: ${describeFile(file)}`);
        break;
      case "missing":
        cons.warning(`Missing project file: ${describeFile(file)}`);
        break;
      case "outdated":
        cons.warning(`Outdated project file: ${describeFile(file)}`);
        break;
      case "unmanaged":
        cons.info(`  unmanaged: ${file.detail ?? describeFile(file)}`);
        break;
    }
  }

  if (result.needsUpdate) {
    cons.error("Project files need updating. Run 'ticbuild project update'.");
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
    cons.success("Project files are current.");
  }
  return result;
}

export async function projectUpdateCommand(manifestPath?: string): Promise<ProjectFilesUpdateResult> {
  const result = await updateProjectFiles(manifestPath);
  cons.h1(`Updating project files for ${result.projectDir}`);
  for (const file of result.files) {
    switch (file.action) {
      case "created":
        cons.info(`  created: ${describeFile(file)}`);
        break;
      case "updated":
        cons.info(`  updated: ${describeFile(file)}`);
        break;
      case "unchanged":
        cons.dim(`  unchanged: ${describeFile(file)}`);
        break;
      case "unmanaged":
        cons.info(`  unmanaged: ${file.detail ?? describeFile(file)}`);
        break;
    }
  }
  cons.success(result.changed ? "Project files updated." : "Project files are already current.");
  return result;
}
