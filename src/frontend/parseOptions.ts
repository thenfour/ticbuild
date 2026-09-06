import { TicbuildProjectLoadOptions } from "../backend/project";
import * as cons from "../utils/console";

// used for both --var
// and --env.
function parseKeyValueOverrides(values: string[], kind: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const valueText of values) {
    const equalIndex = valueText.indexOf("=");
    if (equalIndex === -1) {
      cons.warning(`Invalid ${kind} format: ${valueText} (expected key=value)`);
      continue;
    }
    const key = valueText.substring(0, equalIndex).trim();
    const value = valueText.substring(equalIndex + 1).trim();
    if (!key) {
      cons.warning(`Invalid ${kind} format: ${valueText} (empty key)`);
      continue;
    }
    result[key] = value;
  }
  return result;
}

export interface CommandLineOptions {
  mode?: string;
  var?: string[];
  env?: string[];
  reporter?: string;
  remotingVerbose?: boolean;
  onConnect?: string[];
  hideTraceContaining?: string;
  hideTraceMatching?: string;
}

export function parseBuildOptions(
  manifestPath?: string | undefined,
  cmd?: CommandLineOptions | undefined,
): TicbuildProjectLoadOptions {
  const options: TicbuildProjectLoadOptions = {
    manifestPath,
  };
  if (cmd?.mode) {
    options.buildConfigName = cmd.mode;
  }
  if (cmd?.var && cmd.var.length > 0) {
    options.overrideVariables = parseKeyValueOverrides(cmd.var, "variable");
  }
  if (cmd?.env && cmd.env.length > 0) {
    options.overrideEnvironment = parseKeyValueOverrides(cmd.env, "environment override");
  }
  return options;
}
