import net from "node:net";
import * as readline from "node:readline";
import { DiscoveredTic80Session, listRunningDiscoveredSessions } from "../backend/tic80Controller/discovery";
import {
    decodeRemotingJsonBinaryLiteral,
    parseRemotingLine,
} from "../backend/tic80Controller/remotingProtocol";
import { decodeScriptErrorPayload } from "../backend/tic80Controller/scriptErrorProtocol";
import * as cons from "../utils/console";
import { findOptionValue } from "../utils/tic80/args";
import { sleep } from "../utils/utils";
import { renderScriptError, ScriptErrorSourceMapper } from "./scriptErrorPresentation";
import { tryCreateCurrentProjectScriptErrorSourceMaps } from "./scriptErrorSourceMapper";

export interface TerminalTarget {
    host: string;
    port: number;
}

export interface TerminalClientOptions {
    input?: NodeJS.ReadableStream;
    output?: NodeJS.WritableStream;
    terminal?: boolean;
    captureConsoleOutput?: boolean;
    keepOpenOnInputClose?: boolean;
    onInterrupt?: () => void;
    startupAttempts?: number;
    startupRetryDelayMs?: number;
    onStartupRetry?: (error: Error, failedAttempt: number, totalAttempts: number) => void;
    scriptErrorSourceMapper?: ScriptErrorSourceMapper;
}

export interface RunningTerminalClient {
    closed: Promise<void>;
}

const terminalEventTypes = ["trace", "cart_run", "lua_profiler_stopped", "script_error"] as const;
const terminalSubscriptionRequestId = 2147483647;
const terminalLastScriptErrorRequestId = 2147483646;
const terminalMaxAutomaticRequestId = 2147483645;
const terminalSubscriptionTimeoutMs = 5000;

function hasTerminalRequestId(line: string): boolean {
    return /^-?\d+(?:\s|$)/.test(line);
}

type TerminalResponsePresentation = "human" | "structured" | "raw";

type PendingTerminalRequest = {
    command: string;
    presentation: TerminalResponsePresentation;
};

interface ParsedTerminalRequest {
    id: number;
    request: PendingTerminalRequest;
    wireLine: string;
}

// Prefixes decorate the command token and are terminal-only; they are removed
// before sending the request to TIC-80. Examples: `!script_error_last` becomes
// `1 script_error_last`, and `42 #script_error_last` becomes
// `42 script_error_last`.
// technically request ids should be positive but no point enforcing that here.
function parseTerminalRequest(line: string): ParsedTerminalRequest | undefined {
    const match = /^(-?\d+)\s+([^\s]+)(.*)$/.exec(line);
    if (!match) {
        return undefined;
    }
    const id = Number(match[1]);
    if (!Number.isInteger(id)) {
        return undefined;
    }

    const decoratedCommand = match[2];
    const prefix = decoratedCommand[0];
    const presentation: TerminalResponsePresentation = prefix === "!"
        ? "structured"
        : prefix === "#"
            ? "raw"
            : "human";
    const command = presentation === "human"
        ? decoratedCommand
        : decoratedCommand.slice(1);
    if (command.length === 0) {
        return undefined;
    }

    return {
        id,
        request: { command: command.toLowerCase(), presentation },
        wireLine: `${match[1]} ${command}${match[3]}`,
    };
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

function asError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}

function createSocketLinePump(
    socket: net.Socket,
    onLine: (line: string) => void,
    onClosed: (error?: Error) => void,
): { close: () => void } {
    let buffer = "";
    let closed = false;

    const resolveClosed = (error?: Error) => {
        if (closed) {
            return;
        }
        closed = true;
        onClosed(error);
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

    const onError = (error: Error) => {
        resolveClosed(asError(error));
    };

    socket.on("data", onData);
    socket.once("close", onClose);
    socket.once("error", onError);

    return {
        close: () => {
            socket.removeListener("data", onData);
            socket.removeListener("close", onClose);
            socket.removeListener("error", onError);
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
    registerCloseHandler: (handler: (error?: Error) => void) => () => void,
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
        unregisterCloseHandler = registerCloseHandler((error) => {
            const detail = error ? `: ${error.message}` : "";
            settle(() => reject(new Error(`Disconnected while subscribing to TIC-80 remoting events${detail}`)));
        });

        timeout = setTimeout(() => {
            settle(() => reject(new Error("Timed out subscribing to TIC-80 remoting events")));
        }, terminalSubscriptionTimeoutMs);

        const eventTypes = terminalEventTypes.join("|");
        socket.write(`${terminalSubscriptionRequestId} event_subscribe "${eventTypes}" 1\n`, "ascii");
    });
}

function requestLatestScriptError(
    socket: net.Socket,
    registerResponseHandler: (handler: (line: string) => boolean) => () => void,
    registerCloseHandler: (handler: (error?: Error) => void) => () => void,
    onResponse: (data: string | undefined, rawLine: string) => void,
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
            if (!parsed || parsed.kind !== "response" || parsed.id !== terminalLastScriptErrorRequestId) {
                return false;
            }
            onResponse(parsed.status.toUpperCase() === "OK" ? parsed.data : undefined, line);
            settle(resolve);
            return true;
        });
        unregisterCloseHandler = registerCloseHandler((error) => {
            const detail = error ? `: ${error.message}` : "";
            settle(() => reject(new Error(`Disconnected while requesting the latest TIC-80 script error${detail}`)));
        });
        timeout = setTimeout(() => {
            settle(() => reject(new Error("Timed out requesting the latest TIC-80 script error")));
        }, terminalSubscriptionTimeoutMs);

        socket.write(`${terminalLastScriptErrorRequestId} script_error_last\n`, "ascii");
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

async function runTerminalClientCore(
    target: TerminalTarget,
    options: TerminalClientOptions,
    notifyReady: () => void,
): Promise<void> {
    const { host, port } = target;
    const socket = await connectSocket(host, port, 5000);

    const input = options.input ?? process.stdin;
    const output = options.output ?? process.stdout;
    const terminal = options.terminal ?? Boolean(
        (input as NodeJS.ReadStream).isTTY && (output as NodeJS.WriteStream).isTTY,
    );

    const rl = readline.createInterface({
        input,
        output,
        terminal,
    });

    const terminalOutput = new InteractiveTerminalOutput(rl, output, terminal);
    const seenScriptErrorIds = new Set<number>();

    // keep track of requests so we can match responses to them. required in order to know
    // how to format a response. e.g. script_error_last response formatting is defined
    // by its request, not response, but the formatting is on the response. so mapping needed.
    const pendingRequests = new Map<number, PendingTerminalRequest[]>();
    const enqueueRequest = (parsed: ParsedTerminalRequest) => {
        const queued = pendingRequests.get(parsed.id) ?? [];
        queued.push(parsed.request);
        pendingRequests.set(parsed.id, queued);
    };
    const takeRequest = (id: number): PendingTerminalRequest | undefined => {
        const queued = pendingRequests.get(id);
        if (!queued || queued.length === 0) {
            return undefined;
        }
        const request = queued.shift();
        if (queued.length === 0) {
            pendingRequests.delete(id);
        }
        return request;
    };
    const presentScriptError = (data: string | undefined, rawLine: string, deduplicate: boolean = true): void => {
        if (data === undefined) {
            terminalOutput.writeLine(rawLine);
            return;
        }
        try {
            const scriptError = decodeScriptErrorPayload(data);
            if (!scriptError || (deduplicate && seenScriptErrorIds.has(scriptError.errorId))) {
                return;
            }
            seenScriptErrorIds.add(scriptError.errorId);
            for (const renderedLine of renderScriptError(scriptError, options.scriptErrorSourceMapper)) {
                terminalOutput.writeLine(renderedLine);
            }
        } catch {
            // The terminal remains a lossless protocol viewer for malformed or newer payloads.
            terminalOutput.writeLine(rawLine);
        }
    };
    const presentStructuredScriptError = (data: string | undefined, rawLine: string): void => {
        if (data === undefined || data.trim().length === 0) {
            return;
        }
        try {
            // Structured presentation intentionally decodes only the remoting
            // binary/JSON envelope. It preserves every JSON field, including
            // fields a newer schema adds that this client does not understand.
            const value = decodeRemotingJsonBinaryLiteral(data);
            const json = JSON.stringify(value, undefined, 2);
            if (json === undefined) {
                throw new Error("Decoded remoting JSON value is not serializable");
            }
            for (const line of json.split("\n")) {
                terminalOutput.writeLine(line);
            }
        } catch {
            // Malformed or newer non-JSON values remain inspectable losslessly.
            terminalOutput.writeLine(rawLine);
        }
    };
    let inputHasClosed = false;
    let resolveInputClosed!: () => void;
    const inputClosed = new Promise<void>((resolve) => {
        resolveInputClosed = resolve;
    });
    rl.once("close", () => {
        inputHasClosed = true;
        terminalOutput.close();
        resolveInputClosed();
    });

    const previousConsoleMessageSink = cons.getConsoleMessageSink();
    const terminalConsoleMessageSink: cons.ConsoleMessageSink | undefined = options.captureConsoleOutput
        ? (_level, message, renderedMessage) => terminalOutput.writeLine(renderedMessage ?? message)
        : undefined;
    if (terminalConsoleMessageSink) {
        cons.setConsoleMessageSink(terminalConsoleMessageSink);
    }

    let disconnected = false;
    let terminalSocketError: Error | undefined;
    let resolveSocketClosed!: (error?: Error) => void;
    const socketClosed = new Promise<Error | undefined>((resolve) => {
        resolveSocketClosed = resolve;
    });
    const responseHandlers = new Set<(line: string) => boolean>();
    const closeHandlers = new Set<(error?: Error) => void>();
    const socketPump = createSocketLinePump(
        socket,
        (line) => {
            for (const handler of responseHandlers) {
                if (handler(line)) {
                    return;
                }
            }
            const parsed = parseRemotingLine(line);
            if (parsed?.kind === "event" && parsed.eventType.toLowerCase() === "script_error") {
                presentScriptError(parsed.data, line);
                return;
            }
            if (parsed?.kind === "response") {
                const request = takeRequest(parsed.id);
                if (request?.command === "script_error_last" && parsed.status.toUpperCase() === "OK") {
                    if (request.presentation === "raw") {
                        terminalOutput.writeLine(line);
                    } else if (request.presentation === "structured") {
                        presentStructuredScriptError(parsed.data, line);
                    } else {
                        presentScriptError(parsed.data, line, false);
                    }
                    return;
                }
            }
            terminalOutput.writeLine(line);
        },
        (error) => {
            disconnected = true;
            terminalSocketError = error;
            resolveSocketClosed(error);
            for (const handler of closeHandlers) {
                handler(error);
            }
            rl.close();
        },
    );

    rl.on("SIGINT", () => {
        if (options.onInterrupt) {
            options.onInterrupt();
        } else {
            rl.close();
        }
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

        // upon connect, a script error could have already occurred; this is a  convenient
        // best-effort way to show it to the user. they probably want to see that.
        await requestLatestScriptError(
            socket,
            (handler) => {
                responseHandlers.add(handler);
                return () => responseHandlers.delete(handler);
            },
            (handler) => {
                closeHandlers.add(handler);
                return () => closeHandlers.delete(handler);
            },
            presentScriptError,
        );

        if (disconnected) {
            throw new Error("Disconnected from TIC-80 remoting server");
        }

        cons.info(`Connected to ${host}:${port}. Type remoting commands like: ping  (Ctrl+C to quit)`);

        if (!inputHasClosed) {
            let nextRequestId = 1;
            rl.on("line", (line) => {
                terminalOutput.acceptInputLine();
                const commandLine = line.trim();
                if (commandLine.length > 0 && !disconnected) {
                    let requestLine: string;
                    if (hasTerminalRequestId(commandLine)) {
                        requestLine = commandLine;
                    } else {
                        requestLine = `${nextRequestId} ${commandLine}`;
                        nextRequestId = nextRequestId === terminalMaxAutomaticRequestId ? 1 : nextRequestId + 1;
                    }
                    const parsedRequest = parseTerminalRequest(requestLine);
                    const wireLine = parsedRequest?.wireLine ?? requestLine;
                    if (parsedRequest) {
                        enqueueRequest(parsedRequest);
                    }
                    socket.write(`${wireLine}\n`, "ascii");
                }
                terminalOutput.showPrompt();
            });
            terminalOutput.showPrompt();
        }
        notifyReady();

        if (options.keepOpenOnInputClose) {
            const socketError = await socketClosed;
            if (socketError) {
                throw socketError;
            }
        } else {
            await inputClosed;
            if (terminalSocketError) {
                throw terminalSocketError;
            }
        }
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
        if (terminalConsoleMessageSink && cons.getConsoleMessageSink() === terminalConsoleMessageSink) {
            cons.setConsoleMessageSink(previousConsoleMessageSink);
        }
    }
}

async function startTerminalClientAttempt(
    target: TerminalTarget,
    options: TerminalClientOptions,
): Promise<RunningTerminalClient> {
    let ready = false;
    let resolveReady!: () => void;
    let rejectReady!: (error: unknown) => void;
    const readyPromise = new Promise<void>((resolve, reject) => {
        resolveReady = resolve;
        rejectReady = reject;
    });

    const closed = runTerminalClientCore(target, options, () => {
        ready = true;
        resolveReady();
    });
    void closed.catch((error) => {
        if (!ready) {
            rejectReady(error);
        }
    });

    await readyPromise;
    return { closed };
}

export async function startTerminalClient(
    target: TerminalTarget,
    options: TerminalClientOptions = {},
): Promise<RunningTerminalClient> {
    const startupAttempts = Math.max(1, Math.trunc(options.startupAttempts ?? 1));
    const startupRetryDelayMs = Math.max(0, options.startupRetryDelayMs ?? 100);

    // can't guarantee the remoting server is ready to accept connections immediately
    // so use a retry mechanism.
    for (let attempt = 1; attempt <= startupAttempts; attempt += 1) {
        try {
            return await startTerminalClientAttempt(target, options);
        } catch (error) {
            const terminalError = asError(error);
            if (attempt >= startupAttempts) {
                throw terminalError;
            }
            options.onStartupRetry?.(terminalError, attempt, startupAttempts);
            await sleep(startupRetryDelayMs);
        }
    }

    throw new Error("Unable to start TIC-80 terminal");
}

export async function runTerminalClient(target: TerminalTarget, options: TerminalClientOptions = {}): Promise<void> {
    const terminal = await startTerminalClient(target, options);
    await terminal.closed;
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
    await runTerminalClient(target, { scriptErrorSourceMapper: tryCreateCurrentProjectScriptErrorSourceMaps() });
}

export async function attachTerminalToLaunchedTic80(
    preLaunchSessionKeys: Set<string>,
    launchArgs: string[],
    timeoutMs: number = 10000,
): Promise<void> {
    const explicitPort = findOptionValue(launchArgs, "--remoting-port");
    if (explicitPort) {
        const target = parseHostPort(`127.0.0.1:${explicitPort}`);
        await runTerminalClient(target, { scriptErrorSourceMapper: tryCreateCurrentProjectScriptErrorSourceMaps() });
        return;
    }

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const sessions = await listRunningDiscoveredSessions({ projectDir: process.cwd() });
        const launchedSession = sessions.find((session) => !preLaunchSessionKeys.has(session.key));
        if (launchedSession) {
            await runTerminalClient(
                { host: launchedSession.host, port: launchedSession.port },
                { scriptErrorSourceMapper: tryCreateCurrentProjectScriptErrorSourceMaps() },
            );
            return;
        }
        await sleep(250);
    }

    throw new Error("Timed out waiting for launched TIC-80 remoting session discovery");
}
