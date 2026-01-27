import net from "node:net";
import * as cons from "../../utils/console";

export interface RemotingResponse {
  id: number;
  status: "OK" | "ERR";
  data: string;
}

export class Tic80RemotingClient {
  private socket: net.Socket | undefined;
  private buffer = "";
  private nextId = 1;
  private pending = new Map<
    number,
    { resolve: (value: RemotingResponse) => void; reject: (error: Error) => void; timeout: NodeJS.Timeout }
  >();

  constructor(
    private host: string,
    private port: number,
    private verbose: boolean,
  ) {}

  isConnected(): boolean {
    return !!this.socket && !this.socket.destroyed;
  }

  async connect(timeoutMs: number = 5000): Promise<void> {
    if (this.isConnected()) {
      return;
    }

    this.socket = new net.Socket();
    this.socket.setNoDelay(true);
    this.socket.on("data", (data) => this.onData(data));
    this.socket.on("close", () => this.cleanupPending(new Error("Remoting socket closed")));
    this.socket.on("error", (err) => this.cleanupPending(err));

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timed out connecting to TIC-80 remoting at ${this.host}:${this.port}`));
      }, timeoutMs);

      this.socket!.once("connect", () => {
        clearTimeout(timer);
        resolve();
      });

      this.socket!.once("error", (err) => {
        clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      });

      this.socket!.connect(this.port, this.host);
    });
  }

  async hello(): Promise<string> {
    const response = await this.sendCommand("hello");
    return response.data;
  }

  async loadCart(cartPath: string, runAfterLoad: boolean = true): Promise<void> {
    const pathArg = this.encodeString(cartPath);
    const runArg = runAfterLoad ? "1" : "0";
    await this.sendCommand("load", `${pathArg} ${runArg}`);
  }

  async quit(): Promise<void> {
    await this.sendCommand("quit");
  }

  close(): void {
    if (this.socket && !this.socket.destroyed) {
      this.socket.end();
      this.socket.destroy();
    }
  }

  private encodeString(value: string): string {
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `"${escaped}"`;
  }

  private async sendCommand(command: string, args: string = ""): Promise<RemotingResponse> {
    if (!this.socket || this.socket.destroyed) {
      throw new Error("Remoting socket is not connected");
    }

    const id = this.nextId++;
    const line = `${id} ${command}${args ? ` ${args}` : ""}\n`;
    const responsePromise = new Promise<RemotingResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timed out waiting for response to '${command}'`));
      }, 5000);
      this.pending.set(id, { resolve, reject, timeout });
    });

    if (this.verbose) {
      cons.dim(`[remoting] >> ${line.trim()}`);
    }
    this.socket.write(line, "utf8");
    return responsePromise;
  }

  private onData(chunk: Buffer): void {
    this.buffer += chunk.toString("utf8");
    let newlineIndex = this.buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const rawLine = this.buffer.slice(0, newlineIndex).trim();
      this.buffer = this.buffer.slice(newlineIndex + 1);
      if (rawLine.length > 0) {
        this.handleLine(rawLine);
      }
      newlineIndex = this.buffer.indexOf("\n");
    }
  }

  private handleLine(line: string): void {
    if (this.verbose) {
      cons.dim(`[remoting] << ${line}`);
    }
    if (line.startsWith("@")) {
      cons.dim(`[remoting] event: ${line}`);
      return;
    }

    const match = /^([^\s]+)\s+([^\s]+)\s*(.*)$/.exec(line);
    if (!match) {
      cons.warning(`[remoting] Unparseable response: ${line}`);
      return;
    }

    const idValue = match[1];
    const status = match[2].toUpperCase() as "OK" | "ERR";
    const data = match[3] ?? "";
    const id = Number(idValue);
    if (!Number.isFinite(id)) {
      cons.warning(`[remoting] Non-numeric response id: ${line}`);
      return;
    }

    const pending = this.pending.get(id);
    if (!pending) {
      cons.warning(`[remoting] No pending request for id ${id}: ${line}`);
      return;
    }

    clearTimeout(pending.timeout);
    this.pending.delete(id);

    if (status === "OK") {
      pending.resolve({ id, status, data });
    } else {
      pending.reject(new Error(data || `Remoting command failed for id ${id}`));
    }
  }

  private cleanupPending(error: Error): void {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timeout);
      pending.reject(error);
    }
    this.pending.clear();
  }
}
