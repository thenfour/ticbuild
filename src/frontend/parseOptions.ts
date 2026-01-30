import { TicbuildProjectLoadOptions } from "../backend/project";
import * as cons from "../utils/console";

function parseVariableOverrides(vars: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const varStr of vars) {
    const equalIndex = varStr.indexOf("=");
    if (equalIndex === -1) {
      cons.warning(`Invalid variable format: ${varStr} (expected key=value)`);
      continue;
    }
    const key = varStr.substring(0, equalIndex).trim();
    const value = varStr.substring(equalIndex + 1).trim();
    if (!key) {
      cons.warning(`Invalid variable format: ${varStr} (empty key)`);
      continue;
    }
    result[key] = value;
  }
  return result;
}

export interface CommandLineOptions {
  mode?: string;
  var?: string[];
  remotingVerbose?: boolean;
  multiLine?: boolean;
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
    options.overrideVariables = parseVariableOverrides(cmd.var);
  }
  return options;
}
