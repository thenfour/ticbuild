import { TicbuildProject } from "../backend/project";
import { createTic80Controller } from "../backend/tic80Resolver";
import * as cons from "../utils/console";
import { buildCore } from "./core";
import { CommandLineOptions, parseBuildOptions } from "./parseOptions";

export async function runCommand(
  manifestPath?: string,
  options?: CommandLineOptions,
  tic80Args: string[] = [],
): Promise<void> {
  cons.info("ticbuild: run command");

  // First, build the project
  await buildCore(manifestPath, options);

  // Get the output file path
  const projectLoadOptions = parseBuildOptions(manifestPath, options);
  const project = TicbuildProject.loadFromManifest(projectLoadOptions);
  const outputFilePath = project.resolvedCore.getOutputFilePath();

  const tic80Controller = createTic80Controller(project.resolvedCore.projectDir);
  if (!tic80Controller) {
    cons.error("Failed to resolve TIC-80 controller");
    process.exit(1);
  }

  cons.info("Launching TIC-80 with built cartridge...");
  cons.bold(`  ${outputFilePath}`);

  await tic80Controller.launchFireAndForget(outputFilePath, tic80Args);
}
