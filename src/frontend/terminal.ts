import net from "node:net";
import * as readline from "node:readline";
import { DiscoveredTic80Session, listRunningDiscoveredSessions } from "../backend/tic80Controller/discovery";
import { parseRemotingLine } from "../backend/tic80Controller/remotingProtocol";
import * as cons from "../utils/console";
import { findOptionValue } from "../utils/tic80/args";
import { sleep } from "../utils/utils";

export interface TerminalTarget {
    host: string;
    port: number;
}

export interface TerminalClientOptions {
    input?: NodeJS.ReadableStream;
    output?: NodeJS.WritableStream;
    terminal?: boolean;
}

const terminalEventTypes = ["trace", "cart_run", "lua_profiler_stopped", "script_error"] as const;
const terminalSubscriptionRequestId = 2147483647;
const terminalSubscriptionTimeoutMs = 5000;

function readLine(rl: readline.Interface, prompt: string): Promise<string | null> {
    return new Promise((resolve) => {
        const onLine = (input: string) => {
            cleanup();
            resolve(input);
        };
        const onClose = () => {
            cleanup();
            resolve(null);
        };
        const cleanup = () => {
            rl.removeListener("line", onLine);
            rl.removeListener("close", onClose);
        };

        rl.once("line", onLine);
        rl.once("close", onClose);
        rl.setPrompt(prompt);
        rl.prompt();
    });
}

function formatSessionSummary(session: DiscoveredTic80Session, index?: number): string {
    const started = session.startedAt || "(unknown)";
    const prefix = index === undefined ? "" : `${index + 1}. `;
    return `${prefix}${session.host}:${session.port} pid=${session.pid} started=${started} version=${session.remotingVersion} source=${session.source}`;
}

function createSocketLinePump(socket: net.Socket, onLine: (line: string) => void, onClosed: () => void): { close: () => void } {
    let buffer = "";
    let closed = false;

    const resolveClosed = () => {
        if (closed) {
            return;
        }
        closed = true;
        onClosed();
    };

    const onData = (chunk: Buffer) => {
        buffer += chunk.toString("ascii");
        let lineBreak = buffer.indexOf("\n");
        while (lineBreak !== -1) {
            const line = buffer.slice(0, lineBreak).replace(/\r$/, "");
            buffer = buffer.slice(lineBreak + 1);
            onLine(line);
            lineBreak = buffer.indexOf("\n");
        }
    };

    const onClose = () => {
        if (buffer.length > 0) {
            onLine(buffer);
            buffer = "";
        }
        resolveClosed();
    };

    socket.on("data", onData);
    socket.once("close", onClose);
    socket.once("error", onClose);

    return {
        close: () => {
            socket.removeListener("data", onData);
            socket.removeListener("close", onClose);
            socket.removeListener("error", onClose);
            resolveClosed();
        },
    };
}

// needed to manage incoming & outgoing lines while the
// user is typing a line in the terminal
class InteractiveTerminalOutput {
    private promptVisible = false;

    constructor(
        private readonly rl: readline.Interface,
        private readonly output: NodeJS.WritableStream,
        private readonly terminal: boolean,
    ) { }

    showPrompt(): void {
        if (!this.terminal) {
            return;
        }
        this.promptVisible = true;
        this.rl.setPrompt("> ");
        this.rl.prompt();
    }

    acceptInputLine(): void {
        this.promptVisible = false;
    }

    writeLine(line: string): void {
        let cursorPosition: { rows: number; cols: number } | undefined;
        if (this.promptVisible) {
            cursorPosition = this.rl.getCursorPos();
            readline.moveCursor(this.output, -cursorPosition.cols, -cursorPosition.rows);
            readline.clearScreenDown(this.output);
        }

        this.output.write(`${line}\n`);

        if (this.promptVisible && cursorPosition) {
            const promptAndLine = `${this.rl.getPrompt()}${this.rl.line}`;
            this.output.write(promptAndLine);

            const columns = (this.output as NodeJS.WriteStream).columns;
            if (Number.isInteger(columns) && columns > 0) {
                const endOffset = promptAndLine.length;
                const endPosition = {
                    rows: Math.floor(endOffset / columns),
                    cols: endOffset % columns,
                };
                readline.moveCursor(
                    this.output,
                    cursorPosition.cols - endPosition.cols,
                    cursorPosition.rows - endPosition.rows,
                );
            } else {
                readline.moveCursor(this.output, this.rl.cursor - this.rl.line.length, 0);
            }
        }
    }

    close(): void {
        this.promptVisible = false;
    }
}

function subscribeToTerminalEvents(
    socket: net.Socket,
    registerResponseHandler: (handler: (line: string) => boolean) => () => void,
    registerCloseHandler: (handler: () => void) => () => void,
): Promise<void> {
    return new Promise((resolve, reject) => {
        let settled = false;
        let timeout: NodeJS.Timeout;
        let unregisterResponseHandler = () => { };
        let unregisterCloseHandler = () => { };
        const settle = (callback: () => void) => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timeout);
            unregisterResponseHandler();
            unregisterCloseHandler();
            callback();
        };

        unregisterResponseHandler = registerResponseHandler((line) => {
            const parsed = parseRemotingLine(line);
            if (!parsed || parsed.kind !== "response" || parsed.id !== terminalSubscriptionRequestId) {
                return false;
            }

            if (parsed.status.toUpperCase() === "OK") {
                settle(resolve);
            } else {
                settle(() => reject(new Error(parsed.data || "Failed to subscribe to TIC-80 remoting events")));
            }
            return true;
        });
        unregisterCloseHandler = registerCloseHandler(() => {
            settle(() => reject(new Error("Disconnected while subscribing to TIC-80 remoting events")));
        });

        timeout = setTimeout(() => {
            settle(() => reject(new Error("Timed out subscribing to TIC-80 remoting events")));
        }, terminalSubscriptionTimeoutMs);

        const eventTypes = terminalEventTypes.join("|");
        socket.write(`${terminalSubscriptionRequestId} event_subscribe "${eventTypes}" 1\n`, "ascii");
    });
}

export function parseHostPort(hostPortValue: string): TerminalTarget {
    const value = hostPortValue.trim();
    if (!value) {
        throw new Error("Host/port cannot be empty");
    }

    const separator = value.lastIndexOf(":");
    if (separator <= 0 || separator === value.length - 1) {
        throw new Error(`Invalid host:port value '${hostPortValue}'`);
    }

    const host = value.slice(0, separator).trim();
    const portValue = value.slice(separator + 1).trim();
    const port = Number(portValue);

    if (!host) {
        throw new Error(`Invalid host in '${hostPortValue}'`);
    }
    if (!Number.isInteger(port) || port <= 0 || port >= 65536) {
        throw new Error(`Invalid port in '${hostPortValue}'`);
    }

    return { host, port };
}

async function chooseDiscoveredSession(sessions: DiscoveredTic80Session[]): Promise<DiscoveredTic80Session | undefined> {
    cons.info("Multiple TIC-80 remoting sessions discovered:");
    for (let i = 0; i < sessions.length; i += 1) {
        cons.info(`  ${formatSessionSummary(sessions[i], i)}`);
    }

    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        throw new Error("Multiple sessions found but terminal is not interactive; specify host:port explicitly");
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });

    try {
        while (true) {
            const response = await readLine(rl, "Select session number (blank to cancel): ");
            if (response === null) {
                return undefined;
            }
            const trimmed = response.trim();
            if (trimmed.length === 0) {
                return undefined;
            }
            const selected = Number(trimmed);
            if (!Number.isInteger(selected) || selected < 1 || selected > sessions.length) {
                cons.warning(`Invalid selection: ${trimmed}`);
                continue;
            }
            return sessions[selected - 1];
        }
    } finally {
        rl.close();
    }
}

async function resolveTerminalTarget(hostPort?: string): Promise<TerminalTarget | undefined> {
    if (hostPort) {
        return parseHostPort(hostPort);
    }

    const sessions = await listRunningDiscoveredSessions({ projectDir: process.cwd() });
    if (sessions.length === 0) {
        cons.info("No discovered TIC-80 remoting sessions found.");
        return undefined;
    }

    if (sessions.length === 1) {
        const only = sessions[0];
        cons.info(`Auto-connecting to ${only.host}:${only.port} (pid=${only.pid})`);
        return { host: only.host, port: only.port };
    }

    const selected = await chooseDiscoveredSession(sessions);
    if (!selected) {
        return undefined;
    }
    return { host: selected.host, port: selected.port };
}

function connectSocket(host: string, port: number, timeoutMs: number): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        let settled = false;

        const settle = (callback: () => void) => {
            if (settled) {
                return;
            }
            settled = true;
            callback();
        };

        const timeout = setTimeout(() => {
            settle(() => {
                socket.destroy();
                reject(new Error(`Timed out connecting to ${host}:${port}`));
            });
        }, timeoutMs);

        socket.once("connect", () => {
            settle(() => {
                clearTimeout(timeout);
                resolve(socket);
            });
        });

        socket.once("error", (err) => {
            settle(() => {
                clearTimeout(timeout);
                reject(err instanceof Error ? err : new Error(String(err)));
            });
        });

        socket.connect(port, host);
    });
}

export async function runTerminalClient(target: TerminalTarget, options: TerminalClientOptions = {}): Promise<void> {
    const { host, port } = target;
    const socket = await connectSocket(host, port, 5000);

    const input = options.input ?? process.stdin;
    const output = options.output ?? process.stdout;
    const terminal = options.terminal ?? Boolean(
        (input as NodeJS.ReadStream).isTTY && (output as NodeJS.WriteStream).isTTY,
    );

    cons.info(`Connected to ${host}:${port}. Type lines like: 1 ping  (Ctrl+C to quit)`);

    const rl = readline.createInterface({
        input,
        output,
        terminal,
    });

    const terminalOutput = new InteractiveTerminalOutput(rl, output, terminal);

    let disconnected = false;
    const responseHandlers = new Set<(line: string) => boolean>();
    const closeHandlers = new Set<() => void>();
    const socketPump = createSocketLinePump(
        socket,
        (line) => {
            for (const handler of responseHandlers) {
                if (handler(line)) {
                    return;
                }
            }
            terminalOutput.writeLine(line);
        },
        () => {
            disconnected = true;
            for (const handler of closeHandlers) {
                handler();
            }
            rl.close();
        },
    );

    rl.on("SIGINT", () => {
        rl.close();
    });

    try {
        if (disconnected) {
            throw new Error("Disconnected from TIC-80 remoting server");
        }

        await subscribeToTerminalEvents(
            socket,
            (handler) => {
                responseHandlers.add(handler);
                return () => responseHandlers.delete(handler);
            },
            (handler) => {
                closeHandlers.add(handler);
                return () => closeHandlers.delete(handler);
            },
        );

        if (disconnected) {
            throw new Error("Disconnected from TIC-80 remoting server");
        }

        await new Promise<void>((resolve) => {
            rl.on("line", (line) => {
                terminalOutput.acceptInputLine();
                if (line.trim().length > 0 && !disconnected) {
                    socket.write(`${line}\n`, "ascii");
                }
                terminalOutput.showPrompt();
            });
            rl.once("close", resolve);
            terminalOutput.showPrompt();
        });
    } finally {
        responseHandlers.clear();
        closeHandlers.clear();
        terminalOutput.close();
        rl.close();
        socketPump.close();
        if (!socket.destroyed) {
            socket.end();
            socket.destroy();
        }
    }
}

export async function discoCommand(): Promise<void> {
    const sessions = await listRunningDiscoveredSessions({ projectDir: process.cwd() });
    if (sessions.length === 0) {
        cons.info("No discovered TIC-80 remoting sessions found.");
        return;
    }

    cons.info(`Discovered ${sessions.length} TIC-80 remoting session(s):`);
    for (let i = 0; i < sessions.length; i += 1) {
        cons.info(`  ${formatSessionSummary(sessions[i], i)}`);
    }
}

export async function terminalCommand(hostPort?: string): Promise<void> {
    const target = await resolveTerminalTarget(hostPort);
    if (!target) {
        return;
    }
    await runTerminalClient(target);
}

export async function attachTerminalToLaunchedTic80(
    preLaunchSessionKeys: Set<string>,
    launchArgs: string[],
    timeoutMs: number = 10000,
): Promise<void> {
    const explicitPort = findOptionValue(launchArgs, "--remoting-port");
    if (explicitPort) {
        const target = parseHostPort(`127.0.0.1:${explicitPort}`);
        await runTerminalClient(target);
        return;
    }

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const sessions = await listRunningDiscoveredSessions({ projectDir: process.cwd() });
        const launchedSession = sessions.find((session) => !preLaunchSessionKeys.has(session.key));
        if (launchedSession) {
            await runTerminalClient({ host: launchedSession.host, port: launchedSession.port });
            return;
        }
        await sleep(250);
    }

    throw new Error("Timed out waiting for launched TIC-80 remoting session discovery");
}
