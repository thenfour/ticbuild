import net from "node:net";
import * as readline from "node:readline";
import { DiscoveredTic80Session, listRunningDiscoveredSessions } from "../backend/tic80Controller/discovery";
import * as cons from "../utils/console";
import { findOptionValue } from "../utils/tic80/args";
import { sleep } from "../utils/utils";

export interface TerminalTarget {
    host: string;
    port: number;
}

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

function createSocketLineReader(socket: net.Socket): { readNextLine: () => Promise<string | null>; close: () => void } {
    let buffer = "";
    let closed = false;
    const pending: Array<(value: string | null) => void> = [];
    const queued: string[] = [];

    const flushLine = (value: string) => {
        if (pending.length > 0) {
            const resolver = pending.shift()!;
            resolver(value);
            return;
        }
        queued.push(value);
    };

    const resolveClosed = () => {
        if (closed) {
            return;
        }
        closed = true;
        while (pending.length > 0) {
            const resolver = pending.shift()!;
            resolver(null);
        }
    };

    const onData = (chunk: Buffer) => {
        buffer += chunk.toString("ascii");
        let lineBreak = buffer.indexOf("\n");
        while (lineBreak !== -1) {
            const line = buffer.slice(0, lineBreak).replace(/\r$/, "");
            buffer = buffer.slice(lineBreak + 1);
            flushLine(line);
            lineBreak = buffer.indexOf("\n");
        }
    };

    const onClose = () => {
        if (buffer.length > 0) {
            flushLine(buffer);
            buffer = "";
        }
        resolveClosed();
    };

    socket.on("data", onData);
    socket.once("close", onClose);
    socket.once("error", onClose);

    return {
        readNextLine: async () => {
            if (queued.length > 0) {
                return queued.shift()!;
            }
            if (closed) {
                return null;
            }
            return new Promise<string | null>((resolve) => {
                pending.push(resolve);
            });
        },
        close: () => {
            socket.removeListener("data", onData);
            socket.removeListener("close", onClose);
            socket.removeListener("error", onClose);
            resolveClosed();
        },
    };
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

export async function runTerminalClient(target: TerminalTarget): Promise<void> {
    const { host, port } = target;
    const socket = await connectSocket(host, port, 5000);
    const socketReader = createSocketLineReader(socket);

    cons.info(`Connected to ${host}:${port}. Type lines like: 1 ping  (Ctrl+C to quit)`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });

    rl.on("SIGINT", () => {
        rl.close();
    });

    try {
        while (true) {
            const line = await readLine(rl, "> ");
            if (line === null) {
                break;
            }
            if (line.trim().length === 0) {
                continue;
            }

            socket.write(`${line}\n`, "ascii");
            const response = await socketReader.readNextLine();
            if (response === null) {
                throw new Error("Disconnected from TIC-80 remoting server");
            }
            process.stdout.write(`${response}\n`);
        }
    } finally {
        rl.close();
        socketReader.close();
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
