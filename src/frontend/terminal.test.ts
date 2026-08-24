import net from "node:net";
import { PassThrough } from "node:stream";
import * as cons from "../utils/console";
import { ScriptErrorPayload } from "../backend/tic80Controller/scriptErrorProtocol";
import { parseHostPort, runTerminalClient, startTerminalClient } from "./terminal";
import { ScriptErrorSourceMapper } from "./scriptErrorPresentation";

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

function pumpSocketLines(socket: net.Socket, onLine: (line: string) => void): void {
    let buffer = "";
    socket.on("data", (chunk) => {
        buffer += chunk.toString("ascii");
        let newlineIndex = buffer.indexOf("\n");
        while (newlineIndex >= 0) {
            const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
            buffer = buffer.slice(newlineIndex + 1);
            onLine(line);
            newlineIndex = buffer.indexOf("\n");
        }
    });
}

function acknowledgeTerminalSetupLine(socket: net.Socket, line: string, onSubscribed?: () => void): boolean {
    const id = line.split(/\s+/, 1)[0];
    if (line.includes(" event_subscribe ")) {
        socket.write(`${id} OK\n`);
        onSubscribed?.();
        return true;
    }
    if (line.endsWith(" script_error_last")) {
        socket.write(`${id} OK\n`);
        return true;
    }
    return false;
}

function encodedScriptError(errorId: number): string {
    const payload: ScriptErrorPayload = {
        schemaVersion: 1,
        errorId,
        language: "lua",
        kind: "runtime",
        phase: "tic",
        message: "cart:4: boom",
        traceback: "cart:4: boom\nstack traceback:",
        codeHash: "md5:test",
        framesTruncated: false,
        frames: [{
            source: "cart",
            name: "TIC",
            nameWhat: "global",
            what: "Lua",
            currentLine: 4,
            lineDefined: 3,
            lastLineDefined: 6,
            parameterCount: 0,
            upvalueCount: 0,
            variadic: false,
            tailCall: false,
            variablesCaptured: true,
            variablesTruncated: false,
            variables: [{
                runtimeName: "b",
                scope: "local",
                type: "nil",
                display: "nil",
                index: 2,
                valueTruncated: false,
            }],
        }],
    };
    return `<${Buffer.from(JSON.stringify(payload), "utf-8").toString("hex")}>`;
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
            pumpSocketLines(socket, (line) => {
                receivedLines.push(line);
                if (acknowledgeTerminalSetupLine(socket, line, () => {
                        socket.write('-1 trace "hello from tic80"\n');
                })) {
                    return;
                }
                if (line.endsWith(" ping")) {
                    const id = line.split(/\s+/, 1)[0];
                    socket.write(`${id} OK PONG\n`);
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
            input.write("ping\n");
            await waitFor(() => rendered.includes("1 OK PONG"));
            input.write("42 ping\n");
            await waitFor(() => rendered.includes("42 OK PONG"));

            expect(receivedLines).toEqual([
                '2147483647 event_subscribe "trace|cart_run|lua_profiler_stopped|script_error" 1',
                "2147483646 script_error_last",
                "1 ping",
                "42 ping",
            ]);
            expect(rendered).toContain('-1 trace "hello from tic80"\n');
            expect(rendered).toContain("1 OK PONG\n");
            expect(rendered).toContain("42 OK PONG\n");
            expect(rendered).not.toContain("2147483647 OK");
        } finally {
            input.end();
            await terminalPromise;
            await closeServer(server);
        }
    });

    it("supports structured and raw response presentation prefixes", async () => {
        const scriptError = encodedScriptError(23);
        const receivedLines: string[] = [];
        const server = net.createServer((socket) => {
            pumpSocketLines(socket, (line) => {
                receivedLines.push(line);
                const id = line.split(/\s+/, 1)[0];
                if (line.includes(" event_subscribe ")) {
                    socket.write(`${id} OK\n`);
                } else if (id === "2147483646" && line.endsWith(" script_error_last")) {
                    socket.write(`${id} OK\n`);
                } else if (line.endsWith(" script_error_last")) {
                    socket.write(`${id} OK ${scriptError}\n`);
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

        const terminal = await startTerminalClient(
            { host: "127.0.0.1", port },
            { input, output, terminal: false },
        );

        const structuredOffset = rendered.length;
        input.write("!script_error_last\n");
        await waitFor(() => rendered.slice(structuredOffset).includes('"errorId": 23'));
        const structuredOutput = rendered.slice(structuredOffset);
        expect(receivedLines).toContain("1 script_error_last");
        expect(structuredOutput).toContain('{\n  "schemaVersion": 1,');
        expect(structuredOutput).toContain('  "frames": [');
        expect(structuredOutput).not.toContain(scriptError);
        expect(structuredOutput).not.toContain("Lua runtime error");

        const rawOffset = rendered.length;
        input.write("42 #script_error_last\n");
        await waitFor(() => rendered.slice(rawOffset).includes(`42 OK ${scriptError}`));
        expect(receivedLines).toContain("42 script_error_last");
        expect(rendered.slice(rawOffset)).toContain(`42 OK ${scriptError}\n`);

        input.end();
        await terminal.closed;
        await closeServer(server);
    });

    it("redraws partially typed input after a pushed event", async () => {
        let connectedSocket: net.Socket | undefined;
        const server = net.createServer((socket) => {
            connectedSocket = socket;
            pumpSocketLines(socket, (line) => {
                acknowledgeTerminalSetupLine(socket, line);
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
            pumpSocketLines(socket, (line) => {
                acknowledgeTerminalSetupLine(socket, line);
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
            pumpSocketLines(socket, (line) => {
                acknowledgeTerminalSetupLine(socket, line);
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

    it("deduplicates automatic recovery against the event but repeats an explicitly requested error", async () => {
        const firstError = encodedScriptError(1);
        let connectedSocket: net.Socket | undefined;
        const server = net.createServer((socket) => {
            connectedSocket = socket;
            pumpSocketLines(socket, (line) => {
                const id = line.split(/\s+/, 1)[0];
                if (line.includes(" event_subscribe ")) {
                    socket.write(`${id} OK\n`);
                } else if (line.endsWith(" script_error_last")) {
                    socket.write(`${id} OK ${firstError}\n`);
                    if (id === "2147483646") {
                        socket.write(`-1 script_error ${firstError}\n`);
                    }
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
        const sourceMapper: ScriptErrorSourceMapper = {
            mapFrame: () => ({ filePath: "C:\\project\\src\\main.ts", line: 12, column: 5 }),
            mapFrameName: () => "AuthoredTIC",
            mapVariableName: () => "x",
        };

        const terminal = await startTerminalClient(
            { host: "127.0.0.1", port },
            { input, output, terminal: false, scriptErrorSourceMapper: sourceMapper },
        );

        expect(rendered.match(/Lua runtime error during tic/g)).toHaveLength(1);
        expect(rendered).toContain("  at AuthoredTIC (C:\\project\\src\\main.ts:12:5)\n");
        expect(rendered).toContain("      local x = nil\n");
        expect(rendered).not.toContain(firstError);

        input.write("script_error_last\n");
        await waitFor(() => rendered.match(/Lua runtime error during tic/g)?.length === 2);
        expect(rendered).not.toContain(firstError);

        input.end();
        await terminal.closed;
        connectedSocket?.destroy();
        await closeServer(server);
    });

    it("preserves malformed script_error events as raw protocol lines", async () => {
        let connectedSocket: net.Socket | undefined;
        const server = net.createServer((socket) => {
            connectedSocket = socket;
            pumpSocketLines(socket, (line) => {
                acknowledgeTerminalSetupLine(socket, line);
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
            { input, output, terminal: false },
        );

        connectedSocket!.write("-9 script_error <zz>\n");
        await waitFor(() => rendered.includes("-9 script_error <zz>\n"));

        input.end();
        await terminal.closed;
        connectedSocket?.destroy();
        await closeServer(server);
    });

    it("retries a transient reset while subscribing and reports the socket error", async () => {
        let connectionCount = 0;
        const server = net.createServer((socket) => {
            connectionCount += 1;
            const shouldReset = connectionCount === 1;
            pumpSocketLines(socket, (line) => {
                if (shouldReset) {
                    socket.resetAndDestroy();
                    return;
                }
                acknowledgeTerminalSetupLine(socket, line);
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
            pumpSocketLines(socket, (line) => {
                acknowledgeTerminalSetupLine(socket, line);
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
