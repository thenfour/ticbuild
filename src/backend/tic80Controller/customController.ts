// this uses a forked custom build of TIC-80 that supports IPC.
// see: https://github.com/thenfour/TIC-80-ticbuild/blob/ticbuild-remoting/src/ticbuild_remoting/README.md

import { ChildProcess } from "node:child_process";
import { fileExists } from "../../utils/fileSystem";
import * as cons from "../../utils/console";
import { getPathRelativeToTemplates } from "../../utils/templates";
import { launchProcessReturnImmediately } from "../../utils/tic80/launch";
import { ITic80Controller } from "./tic80Controller";
import { Tic80RemotingClient } from "./remotingClient";

export class CustomTic80Controller implements ITic80Controller {
  private tic80Path: string;
  private tic80Process: ChildProcess | undefined;
  private client: Tic80RemotingClient | undefined;
  private readonly host = "127.0.0.1";
  private readonly port = 9977;
  private readonly remotingVerbose: boolean;

  constructor(projectDir: string, options?: { remotingVerbose?: boolean }) {
    this.tic80Path = getPathRelativeToTemplates("TIC-80-ticbuild/tic80.exe");
    if (!fileExists(this.tic80Path)) {
      throw new Error(`Custom TIC-80 executable not found: ${this.tic80Path}`);
    }
    this.remotingVerbose = !!options?.remotingVerbose;
  }

  async launchFireAndForget(cartPath?: string | undefined): Promise<void> {
    const args = ["--skip", `--remoting-port=${this.port}`];
    if (cartPath) {
      args.unshift(cartPath);
    }
    await launchProcessReturnImmediately(this.tic80Path, args);
  }

  async launchAndControlCart(cartPath: string): Promise<void> {
    await this.ensureProcessRunning();
    await this.ensureConnected();

    await this.client!.loadCart(cartPath, true);
    cons.dim(`[remoting] Loaded cart: ${cartPath}`);
  }

  async stop(): Promise<void> {
    if (this.client && this.client.isConnected()) {
      try {
        await this.client.quit();
      } catch (err) {
        cons.warning(`[remoting] Failed to send quit: ${err instanceof Error ? err.message : String(err)}`);
      }
      this.client.close();
    }
    this.client = undefined;

    if (this.tic80Process && !this.tic80Process.killed) {
      const process = this.tic80Process;
      this.tic80Process.kill();
      await this.waitForExit(process, 1000);
    }
    this.tic80Process = undefined;
  }

  private async ensureProcessRunning(): Promise<void> {
    if (this.tic80Process && !this.tic80Process.killed) {
      return;
    }

    const args = ["--skip", `--remoting-port=${this.port}`];
    this.tic80Process = await launchProcessReturnImmediately(this.tic80Path, args);

    this.tic80Process.on("exit", () => {
      this.tic80Process = undefined;
      if (this.client) {
        this.client.close();
        this.client = undefined;
      }
    });
  }

  private async ensureConnected(): Promise<void> {
    if (this.client && this.client.isConnected()) {
      return;
    }

    this.client = new Tic80RemotingClient(this.host, this.port, this.remotingVerbose);

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
}
