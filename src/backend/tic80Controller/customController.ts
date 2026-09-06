// this uses a forked custom build of TIC-80 that supports IPC.
// see: https://github.com/thenfour/TIC-80-ticbuild/blob/ticbuild-remoting/src/ticbuild_remoting/README.md

import { ChildProcess } from "node:child_process";
import { fileExists } from "../../utils/fileSystem";
import * as cons from "../../utils/console";
import { getErrorMessage } from "../../utils/errorHandling";
import { getPathRelativeToTemplates } from "../../utils/templates";
import { findOptionValue, mergeTic80Args } from "../../utils/tic80/args";
import { launchProcessReturnImmediately } from "../../utils/tic80/launch";
import { ITic80Controller, Tic80RemotingReadyHandler } from "./tic80Controller";
import { Tic80RemotingClient } from "./remotingClient";
import { findRandomFreePortInRange } from "./netUtils";

const TICBUILD_PORT_RANGE_START = 55000;
const TICBUILD_PORT_RANGE_END = 56000;

export class CustomTic80Controller implements ITic80Controller {
  private tic80Path: string;
  private tic80Process: ChildProcess | undefined;
  private client: Tic80RemotingClient | undefined;
  private readonly host = "127.0.0.1";
  private port: number | undefined;
  private readonly remotingVerbose: boolean;
  private environment: NodeJS.ProcessEnv;
  private exitHandlers: Set<() => void> = new Set();
  private remotingReadyHandlers: Set<Tic80RemotingReadyHandler> = new Set();
  private suppressExitSignal = false;

  private projectDir: string;

  constructor(projectDir: string, options?: { remotingVerbose?: boolean; environment?: NodeJS.ProcessEnv }) {
    // todo: consider allowing the TIC-80 path to be overridden via env just like the vanilla controller does.
    this.tic80Path = getPathRelativeToTemplates("TIC-80-ticbuild/tic80.exe");
    this.projectDir = projectDir;
    //assert that project dir is absolute & exists
    if (!fileExists(this.projectDir)) {
      throw new Error(`Project directory not found: ${this.projectDir}`);
    }

    if (!fileExists(this.tic80Path)) {
      throw new Error(`Custom TIC-80 executable not found: ${this.tic80Path}`);
    }
    this.remotingVerbose = !!options?.remotingVerbose;
    this.environment = options?.environment ?? process.env;
  }

  setEnvironment(environment: NodeJS.ProcessEnv): void {
    this.environment = environment;
  }

  private GetArgsForRemotingSession(): string[] {
    return [`--skip`, `--remoting-port=${this.port}`, `--remote-session-location=${this.projectDir}\\.ticbuild\\remoting\\sessions`];
  }

  async launchFireAndForget(cartPath?: string | undefined, userArgs: string[] = []): Promise<void> {
    this.applyRemotingPortOverride(userArgs);
    await this.ensurePortSelected();
    const port = this.port!;
    const mergedArgs = mergeTic80Args(this.GetArgsForRemotingSession(), userArgs);
    const args = cartPath ? [cartPath, ...mergedArgs] : mergedArgs;
    await launchProcessReturnImmediately(this.tic80Path, args, this.environment);
  }

  async launchAndControlCart(cartPath: string, userArgs: string[] = []): Promise<void> {
    const launchedNewProcess = await this.ensureProcessRunning(userArgs);
    await this.ensureConnected();
    await this.notifyRemotingReady();

    await this.client!.loadCart(cartPath, true);
    cons.dim(launchedNewProcess
      ? `[remoting] TIC-80 launched with cart: ${cartPath}`
      : `[remoting] Loaded cart: ${cartPath}`);
  }

  async stop(): Promise<void> {
    if (this.client && this.client.isConnected()) {
      try {
        await this.client.quit();
      } catch (err) {
        cons.warning(`[remoting] Failed to send quit: ${getErrorMessage(err)}`);
      }
      this.client.close();
    }
    this.client = undefined;

    if (this.tic80Process && !this.tic80Process.killed) {
      const process = this.tic80Process;
      this.suppressExitSignal = true;
      this.tic80Process.kill();
      await this.waitForExit(process, 1000);
    }
    this.suppressExitSignal = false;
    this.tic80Process = undefined;
  }

  private async ensureProcessRunning(userArgs: string[] = []): Promise<boolean> {
    if (this.tic80Process && !this.tic80Process.killed) {
      return false;
    }

    this.applyRemotingPortOverride(userArgs);
    await this.ensurePortSelected();
    const port = this.port!;
    const mergedArgs = mergeTic80Args(this.GetArgsForRemotingSession(), userArgs);
    this.tic80Process = await launchProcessReturnImmediately(this.tic80Path, mergedArgs, this.environment);
    const processRef = this.tic80Process;
    if (processRef) {
      processRef.once("exit", () => this.handleProcessExit(processRef));
      processRef.once("close", () => this.handleProcessExit(processRef));
    }

    return true;
  }

  onExit(handler: () => void): void {
    this.exitHandlers.add(handler);
  }

  onRemotingReady(handler: Tic80RemotingReadyHandler): void {
    this.remotingReadyHandlers.add(handler);
  }

  private async notifyRemotingReady(): Promise<void> {
    const target = { host: this.host, port: this.port! };
    for (const handler of this.remotingReadyHandlers) {
      await handler(target);
    }
  }

  private handleProcessExit(processRef: ChildProcess): void {
    if (this.tic80Process !== processRef) {
      return;
    }
    this.tic80Process = undefined;
    if (this.client) {
      this.client.close();
      this.client = undefined;
    }
    if (this.suppressExitSignal) {
      return;
    }
    for (const handler of this.exitHandlers) {
      handler();
    }
  }

  private async ensureConnected(): Promise<void> {
    if (this.client && this.client.isConnected()) {
      return;
    }

    await this.ensurePortSelected();

    const port = this.port!;
    this.client = new Tic80RemotingClient(this.host, port, this.remotingVerbose);

    await this.connectWithRetry(5000, 100);
    const hello = await this.client.hello();
    cons.info(`[remoting] Connected: ${hello}`);
  }

  private async connectWithRetry(timeoutMs: number, intervalMs: number): Promise<void> {
    const start = Date.now();
    let lastError: Error | undefined;
    while (Date.now() - start < timeoutMs) {
      try {
        await this.client!.connect(1000);
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
    throw lastError ?? new Error("Failed to connect to remoting server");
  }

  private async waitForExit(process: ChildProcess, timeoutMs: number): Promise<void> {
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

  private async ensurePortSelected(): Promise<void> {
    if (this.port !== undefined) {
      return;
    }
    this.port = await findRandomFreePortInRange(TICBUILD_PORT_RANGE_START, TICBUILD_PORT_RANGE_END, this.host);
  }

  private applyRemotingPortOverride(userArgs: string[]): void {
    const portValue = findOptionValue(userArgs, "--remoting-port");
    if (!portValue) {
      return;
    }
    const port = Number(portValue);
    if (!Number.isFinite(port) || port <= 0 || port >= 65536) {
      cons.warning(`[remoting] Invalid --remoting-port value: ${portValue}`);
      return;
    }
    this.port = port;
  }
}
