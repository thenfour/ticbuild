// Selects the bundled or external TIC-80 using the project environment.

import { loadProjectEnvironment } from "./projectEnvironment";
import { VanillaTic80Controller } from "./tic80Controller/vanillaController";
import { CustomTic80Controller } from "./tic80Controller/customController";
import { ITic80Controller } from "./tic80Controller/tic80Controller";

export interface Tic80ControllerOptions {
  remotingVerbose?: boolean;
  environment?: NodeJS.ProcessEnv;
}

export function useExternalTic80(environment: NodeJS.ProcessEnv): boolean {
  // todo: simplify; don't need USE_EXTERNAL_TIC80. just check if TIC80_LOCATION is set.
  const value = environment.USE_EXTERNAL_TIC80;
  return value === "1" || value === "true";
}

export function createTic80Controller(
  projectDir: string,
  options?: Tic80ControllerOptions,
): ITic80Controller | undefined {
  const environment = options?.environment ?? loadProjectEnvironment(projectDir).processEnvironment;
  if (useExternalTic80(environment)) {
    return new VanillaTic80Controller(projectDir, environment);
  }

  // use the built-in custom build of TIC-80
  return new CustomTic80Controller(projectDir, {
    remotingVerbose: options?.remotingVerbose,
    environment,
  });
}
