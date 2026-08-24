import net from "node:net";
import { PassThrough } from "node:stream";
import * as cons from "../utils/console";
import { parseHostPort, runTerminalClient, startTerminalClient } from "./terminal";

function listen(server: net.Server): Promise<number> {
    return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            if (!address || typeof address === "string") {
                reject(new Error("Server did not bind to an IPv4 port"));
                return;
            }
            resolve(address.port);
        });
    });
}

function closeServer(server: net.Server): Promise<void> {
    return new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

function waitFor(condition: () => boolean, timeoutMs: number = 2000): Promise<void> {
    return new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const check = () => {
            if (condition()) {
                resolve();
                return;
            }
            if (Date.now() - startedAt >= timeoutMs) {
                reject(new Error("Timed out waiting for terminal test condition"));
                return;
            }
            setTimeout(check, 10);
        };
        check();
    });
}

describe("terminal host:port parsing", () => {
    it("parses valid host:port", () => {
        expect(parseHostPort("127.0.0.1:55000")).toEqual({ host: "127.0.0.1", port: 55000 });
    });

    it("throws for missing separator", () => {
        expect(() => parseHostPort("127.0.0.1")).toThrow("Invalid host:port");
    });

    it("throws for invalid port", () => {
        expect(() => parseHostPort("127.0.0.1:nope")).toThrow("Invalid port");
    });
});

describe("terminal remoting session", () => {
    it("auto-subscribes and renders pushed events before receiving user input", async () => {
        const receivedLines: string[] = [];
        const server = net.createServer((socket) => {
            let buffer = "";
            socket.on("data", (chunk) => {
                buffer += chunk.toString("ascii");
                let newlineIndex = buffer.indexOf("\n");
                while (newlineIndex >= 0) {
                    const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
                    buffer = buffer.slice(newlineIndex + 1);
                    receivedLines.push(line);

                    if (line.includes(" event_subscribe ")) {
                        const id = line.split(/\s+/, 1)[0];
                        socket.write(`${id} OK\n`);
                        socket.write('-1 trace "hello from tic80"\n');
                    } else if (line === "1 ping") {
                        socket.write("1 OK PONG\n");
                    }
                    newlineIndex = buffer.indexOf("\n");
                }
            });
        });
        const port = await listen(server);
        const input = new PassThrough();
        const output = new PassThrough();
        let rendered = "";
        output.on("data", (chunk) => {
            rendered += chunk.toString("utf8");
        });

        const terminalPromise = runTerminalClient(
            { host: "127.0.0.1", port },
            { input, output, terminal: false },
        );

        try {
            await waitFor(() => rendered.includes('-1 trace "hello from tic80"'));
            input.write("1 ping\n");
            await waitFor(() => rendered.includes("1 OK PONG"));

            expect(receivedLines).toEqual([
                '2147483647 event_subscribe "trace|cart_run|lua_profiler_stopped|script_error" 1',
                "1 ping",
            ]);
            expect(rendered).toContain('-1 trace "hello from tic80"\n');
            expect(rendered).toContain("1 OK PONG\n");
            expect(rendered).not.toContain("2147483647 OK");
        } finally {
            input.end();
            await terminalPromise;
            await closeServer(server);
        }
    });

    it("redraws partially typed input after a pushed event", async () => {
        let connectedSocket: net.Socket | undefined;
        const server = net.createServer((socket) => {
            connectedSocket = socket;
            let buffer = "";
            socket.on("data", (chunk) => {
                buffer += chunk.toString("ascii");
                const newlineIndex = buffer.indexOf("\n");
                if (newlineIndex < 0) {
                    return;
                }
                const line = buffer.slice(0, newlineIndex);
                buffer = buffer.slice(newlineIndex + 1);
                if (line.includes(" event_subscribe ")) {
                    const id = line.split(/\s+/, 1)[0];
                    socket.write(`${id} OK\n`);
                }
            });
        });
        const port = await listen(server);
        const input = new PassThrough() as PassThrough & { isTTY: boolean; setRawMode: (mode: boolean) => void };
        const output = new PassThrough() as PassThrough & { isTTY: boolean; columns: number; rows: number };
        input.isTTY = true;
        input.setRawMode = () => {};
        output.isTTY = true;
        output.columns = 80;
        output.rows = 24;
        let rendered = "";
        output.on("data", (chunk) => {
            rendered += chunk.toString("utf8");
        });

        const terminalPromise = runTerminalClient(
            { host: "127.0.0.1", port },
            { input, output, terminal: true },
        );

        try {
            await waitFor(() => rendered.includes("> "));
            input.write("partial");
            await waitFor(() => rendered.includes("partial"));
            connectedSocket!.write('-1 trace "async"\n');
            await waitFor(() => rendered.includes('-1 trace "async"'));

            const eventOffset = rendered.indexOf('-1 trace "async"');
            expect(rendered.indexOf("partial", eventOffset)).toBeGreaterThan(eventOffset);
        } finally {
            input.end();
            await terminalPromise;
            await closeServer(server);
        }
    });

    it("routes surrounding console output through the interactive writer while embedded", async () => {
        const server = net.createServer((socket) => {
            socket.once("data", (chunk) => {
                const line = chunk.toString("ascii").trim();
                const id = line.split(/\s+/, 1)[0];
                socket.write(`${id} OK\n`);
            });
        });
        const port = await listen(server);
        const input = new PassThrough();
        const output = new PassThrough();
        let rendered = "";
        output.on("data", (chunk) => {
            rendered += chunk.toString("utf8");
        });
        const previousSink = cons.getConsoleMessageSink();

        const terminal = await startTerminalClient(
            { host: "127.0.0.1", port },
            { input, output, terminal: false, captureConsoleOutput: true },
        );

        try {
            cons.warning("watch build warning");
            await waitFor(() => rendered.includes("WARNING: watch build warning"));
        } finally {
            input.end();
            await terminal.closed;
            await closeServer(server);
        }

        expect(cons.getConsoleMessageSink()).toBe(previousSink);
    });

    it("keeps streaming events after embedded stdin closes", async () => {
        let connectedSocket: net.Socket | undefined;
        const server = net.createServer((socket) => {
            connectedSocket = socket;
            socket.once("data", (chunk) => {
                const line = chunk.toString("ascii").trim();
                const id = line.split(/\s+/, 1)[0];
                socket.write(`${id} OK\n`);
            });
        });
        const port = await listen(server);
        const input = new PassThrough();
        const output = new PassThrough();
        let rendered = "";
        output.on("data", (chunk) => {
            rendered += chunk.toString("utf8");
        });

        const terminal = await startTerminalClient(
            { host: "127.0.0.1", port },
            { input, output, terminal: false, keepOpenOnInputClose: true },
        );

        input.end();
        connectedSocket!.write('-1 trace "after eof"\n');
        await waitFor(() => rendered.includes('-1 trace "after eof"'));
        connectedSocket!.end();
        await terminal.closed;
        await closeServer(server);
    });

    it("retries a transient reset while subscribing and reports the socket error", async () => {
        let connectionCount = 0;
        const server = net.createServer((socket) => {
            connectionCount += 1;
            socket.once("data", (chunk) => {
                if (connectionCount === 1) {
                    socket.resetAndDestroy();
                    return;
                }
                const line = chunk.toString("ascii").trim();
                const id = line.split(/\s+/, 1)[0];
                socket.write(`${id} OK\n`);
            });
        });
        const port = await listen(server);
        const input = new PassThrough();
        const output = new PassThrough();
        const retryErrors: Error[] = [];

        const terminal = await startTerminalClient(
            { host: "127.0.0.1", port },
            {
                input,
                output,
                terminal: false,
                startupAttempts: 2,
                startupRetryDelayMs: 0,
                onStartupRetry: (error) => retryErrors.push(error),
            },
        );

        expect(connectionCount).toBe(2);
        expect(retryErrors).toHaveLength(1);
        expect(retryErrors[0].message).toContain("Disconnected while subscribing");
        expect(retryErrors[0].message).toContain("ECONNRESET");

        input.end();
        await terminal.closed;
        await closeServer(server);
    });

    it("reports a socket reset after the terminal is ready", async () => {
        let connectedSocket: net.Socket | undefined;
        const server = net.createServer((socket) => {
            connectedSocket = socket;
            socket.once("data", (chunk) => {
                const line = chunk.toString("ascii").trim();
                const id = line.split(/\s+/, 1)[0];
                socket.write(`${id} OK\n`);
            });
        });
        const port = await listen(server);
        const input = new PassThrough();
        const output = new PassThrough();

        const terminal = await startTerminalClient(
            { host: "127.0.0.1", port },
            { input, output, terminal: false },
        );

        connectedSocket!.resetAndDestroy();
        await expect(terminal.closed).rejects.toThrow("ECONNRESET");
        await closeServer(server);
    });
});
