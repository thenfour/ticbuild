import { fileExists, findExecutableInPath } from "../../utils/fileSystem";
import { launchProcessReturnImmediately } from "../../utils/tic80/launch";
import { ITic80Controller } from "./tic80Controller";
import { ChildProcess } from "node:child_process";

export interface Tic80Location {
  path: string;
  source: "env" | "path";
}

function resolveExternalTic80Location(projectDir: string): Tic80Location | undefined {
  const envLocation = process.env.TIC80_LOCATION;
  if (envLocation) {
    if (fileExists(envLocation)) {
      return { path: envLocation, source: "env" };
    }
  }

  // Search in PATH
  const pathLocation = findExecutableInPath("tic80");
  if (pathLocation) {
    return { path: pathLocation, source: "path" };
  }

  return undefined;
}

export class VanillaTic80Controller implements ITic80Controller {
  tic80Path: string;
  connectToPort: number = 9977;
  private tic80Process: ChildProcess | undefined;

  constructor(projectDir: string) {
    const location = resolveExternalTic80Location(projectDir);
    if (!location) {
      throw new Error("External TIC-80 executable not found");
    }
    this.tic80Path = location.path;
  }

  async launchFireAndForget(cartPath?: string | undefined): Promise<void> {
    const args = ["--skip"];
    if (cartPath) {
      args.unshift(cartPath);
    }
    // Fire-and-forget: do not keep a PID/handle (works even when parent exits).
    await launchProcessReturnImmediately(this.tic80Path, args);
  }

  async stop(): Promise<void> {
    if (this.tic80Process && !this.tic80Process.killed) {
      this.tic80Process.kill();
    }
    this.tic80Process = undefined;
  }

  async launchAndControlCart(cartPath: string): Promise<void> {
    // todo.
  }
}
