import { TicbuildProject } from "../backend/project";
import { resolveTic80Location } from "../backend/tic80Resolver";
import * as cons from "../utils/console";
import { launchProcessReturnImmediately } from "../utils/tic80/launch";
import { buildCore } from "./core";
import { CommandLineOptions, parseBuildOptions } from "./parseOptions";

export async function runCommand(manifestPath?: string, options?: CommandLineOptions): Promise<void> {
  cons.info("ticbuild: run command");

  // First, build the project
  await buildCore(manifestPath, options);

  // Get the output file path
  const projectLoadOptions = parseBuildOptions(manifestPath, options);
  const project = TicbuildProject.loadFromManifest(projectLoadOptions);
  const outputFilePath = project.resolvedCore.getOutputFilePath();

  // Resolve TIC-80 location
  const tic80Location = resolveTic80Location(project.resolvedCore.projectDir);
  if (!tic80Location) {
    cons.error(
      "TIC-80 executable not found. Please install TIC-80 and ensure it is in your PATH, or set TIC80_LOCATION in .env/.env.local.",
    );
    process.exit(1);
  }

  // Launch TIC-80 with the built cartridge
  cons.info("Launching TIC-80 with built cartridge...");
  cons.bold(`  ${outputFilePath}`);
  await launchProcessReturnImmediately(tic80Location.path, [outputFilePath, "--skip"]);
  cons.success("TIC-80 launched successfully.");
}
