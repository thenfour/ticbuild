// Searches for TIC-80 in the following order:
// 1. TIC80_LOCATION environment variable from .env/.env.local
// 2. tic80 or tic80.exe in PATH

import { config } from "dotenv";
import * as path from "path";

import { getPathRelativeToTemplates } from "../utils/templates";
import { VanillaTic80Controller } from "./tic80Controller/vanillaController";
import { CustomTic80Controller } from "./tic80Controller/customController";
import { ITic80Controller } from "./tic80Controller/tic80Controller";

export function createTic80Controller(projectDir: string): ITic80Controller | undefined {
  // Load .env first, then .env.local (which overrides)
  const envPath = path.join(projectDir, ".env");
  const envLocalPath = path.join(projectDir, ".env.local");
  config({ path: envPath });
  config({ path: envLocalPath });

  const useExternalPath = process.env.USE_EXTERNAL_TIC80;
  if (useExternalPath === "1" || useExternalPath === "true") {
    return new VanillaTic80Controller(projectDir);
  }

  // use the built-in custom build of TIC-80
  return new CustomTic80Controller(projectDir);
}
