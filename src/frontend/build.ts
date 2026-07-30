import { buildCore } from "./core";
import { CommandLineOptions } from "./parseOptions";
import { BuildReporter, createBuildReporter } from "./buildReporter";
import * as cons from "../utils/console";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// routes console messages to the reporter, if the reporter is jsonl, otherwise just logs to console.
function reportCapturedConsoleMessage(
  reporter: BuildReporter,
  level: cons.ConsoleMessageLevel,
  message: string,
): void {
  if (level === "warning" || level === "error") {
    reporter.message({
      type: "diagnostic",
      data: {
        severity: level,
        message,
      },
      humanReadable: () => undefined,
    });
    return;
  }

  reporter.message({
    type: "comment",
    data: {
      message,
    },
    humanReadable: () => undefined,
  });
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

  const previousConsoleMessageSink = cons.getConsoleMessageSink();
  if (reporter.name === "jsonl") {
    cons.setConsoleMessageSink((level, message) => reportCapturedConsoleMessage(reporter, level, message));
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
  } finally {
    // for non-jsonl this is a nop
    cons.setConsoleMessageSink(previousConsoleMessageSink);
  }
}
