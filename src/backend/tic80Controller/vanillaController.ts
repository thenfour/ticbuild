import { fileExists } from "../../utils/fileSystem";
import { getErrorMessage } from "../../utils/errorHandling";
import { mergeTic80Args } from "../../utils/tic80/args";
import { launchProcessReturnImmediately } from "../../utils/tic80/launch";
import { getWindowPosition, setWindowPosition, waitForWindow, WindowPlacement } from "../../utils/windowPosition";
import { ITic80Controller } from "./tic80Controller";
import { ChildProcess } from "node:child_process";

// prio highest to lowest:
// - Environment variable TIC80_LOCATION
// - bundled location (not relevant here because this is only for vanilla/stock)
// - not explicit (uses windows standard lookup CWD/ PATH)
function resolveVanillaTic80Path(environment: NodeJS.ProcessEnv): string {
  const envLocation = environment.TIC80_LOCATION;
  if (envLocation) {
    if (fileExists(envLocation)) {
      return envLocation;
    }
  }
  return "tic80";
}

export class VanillaTic80Controller implements ITic80Controller {
  tic80Path: string;
  connectToPort: number = 9977;
  private tic80Process: ChildProcess | undefined;
  private exitHandlers: Set<() => void> = new Set();
  private suppressExitSignal = false;
  private environment: NodeJS.ProcessEnv;

  private async waitForExit(process: ChildProcess, timeoutMs: number): Promise<void> {
    // Best-effort: detached/unref'd processes may not always emit in time.
    await new Promise<void>((resolve) => {
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      process.once("exit", settle);
      process.once("close", settle);
      setTimeout(settle, timeoutMs);
    });
  }

  constructor(_projectDir: string, environment: NodeJS.ProcessEnv = process.env) {
    this.environment = environment;
    this.tic80Path = resolveVanillaTic80Path(environment);
  }

  setEnvironment(environment: NodeJS.ProcessEnv): void {
    this.environment = environment;
    this.tic80Path = resolveVanillaTic80Path(environment);
  }

  async launchFireAndForget(cartPath?: string | undefined, userArgs: string[] = []): Promise<void> {
    const mergedArgs = mergeTic80Args(["--skip"], userArgs);
    const args = cartPath ? [cartPath, ...mergedArgs] : mergedArgs;
    // Fire-and-forget: do not keep a PID/handle (works even when parent exits).
    await launchProcessReturnImmediately(this.tic80Path, args, this.environment);
  }

  async stop(): Promise<void> {
    if (this.tic80Process && !this.tic80Process.killed) {
      const prev = this.tic80Process;
      this.suppressExitSignal = true;
      this.tic80Process.kill();
      await this.waitForExit(prev, 750);
    }
    this.suppressExitSignal = false;
    this.tic80Process = undefined;
  }

  // for vanilla, this needs to launch the process, we should keep the handle
  // so we can stop it (kill it), and we can get the PID for window management
  // for saving & restoring window position.
  async launchAndControlCart(cartPath: string, userArgs: string[] = []): Promise<void> {
    // If already running, restart it (vanilla TIC-80 has no reload IPC).
    // Window position management is a controller-specific hack and lives here.
    let savedWindowPosition: WindowPlacement | null = null;
    const existingPid = this.tic80Process?.pid;
    if (existingPid && process.platform === "win32") {
      console.log(`[VanillaController] Attempting to save window position for PID ${existingPid}`);
      try {
        savedWindowPosition = await getWindowPosition(existingPid);
        if (savedWindowPosition) {
          console.log(
            `[VanillaController] Saved window position: (${savedWindowPosition.x}, ${savedWindowPosition.y}) ${savedWindowPosition.width}x${savedWindowPosition.height}`,
          );
        } else {
          console.log(`[VanillaController] No window position returned`);
        }
      } catch (err) {
        console.log(
          `[VanillaController] Failed to save window position: ${getErrorMessage(err)}`,
        );
        savedWindowPosition = null;
      }
    } else {
      console.log(
        `[VanillaController] Skipping window save (existingPid=${existingPid}, platform=${process.platform})`,
      );
    }

    await this.stop();

    const mergedArgs = mergeTic80Args(["--skip"], userArgs);
    const args = cartPath ? [cartPath, ...mergedArgs] : mergedArgs;

    this.tic80Process = await launchProcessReturnImmediately(this.tic80Path, args, this.environment);

    const processRef = this.tic80Process;
    if (processRef) {
      processRef.once("exit", () => this.handleProcessExit(processRef));
      processRef.once("close", () => this.handleProcessExit(processRef));
    }

    const newPid = this.tic80Process?.pid;
    console.log(`[VanillaController] New TIC-80 PID: ${newPid}`);
    if (savedWindowPosition && newPid && process.platform === "win32") {
      console.log(`[VanillaController] Waiting for window to appear for PID ${newPid}...`);
      const windowFound = await waitForWindow(newPid, 3000);
      console.log(`[VanillaController] Window found: ${windowFound}`);
      if (windowFound) {
        console.log(`[VanillaController] Restoring window position...`);
        await setWindowPosition(newPid, savedWindowPosition);
        console.log(`[VanillaController] Window position restored`);
      }
    } else {
      console.log(
        `[VanillaController] Skipping window restore (savedPosition=${!!savedWindowPosition}, newPid=${newPid}, platform=${process.platform})`,
      );
    }
  }

  onExit(handler: () => void): void {
    this.exitHandlers.add(handler);
  }

  private handleProcessExit(processRef: ChildProcess): void {
    if (this.tic80Process !== processRef) {
      return;
    }
    this.tic80Process = undefined;
    if (this.suppressExitSignal) {
      return;
    }
    for (const handler of this.exitHandlers) {
      handler();
    }
  }
}
