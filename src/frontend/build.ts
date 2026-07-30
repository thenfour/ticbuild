import { buildCore } from "./core";
import { CommandLineOptions } from "./parseOptions";
import { BuildReporter, createBuildReporter } from "./buildReporter";
import * as cons from "../utils/console";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function buildCommand(
  manifestPath?: string,
  options?: CommandLineOptions,
  reporterOverride?: BuildReporter,
): Promise<void> {
  let reporter: BuildReporter;
  try {
    reporter = reporterOverride ?? createBuildReporter(options?.reporter);
  } catch (error) {
    cons.error(getErrorMessage(error));
    process.exitCode = 1;
    return;
  }

  try {
    await buildCore(manifestPath, options, reporter);
  } catch (error) {
    const message = getErrorMessage(error);
    // important to output a deterministic msg for machine readers.
    reporter.message({
      type: "build.failed",
      data: {
        message,
      },
      humanReadable: () => {
        cons.error("Build failed:");
        cons.error(message);
      },
    });
    process.exitCode = 1;
  }
}
