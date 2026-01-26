import { buildCore } from "./core";
import { CommandLineOptions } from "./parseOptions";

export async function buildCommand(manifestPath?: string, options?: CommandLineOptions): Promise<void> {
  buildCore(manifestPath, options);
}
