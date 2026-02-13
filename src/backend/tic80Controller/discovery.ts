import * as fs from "node:fs";
import * as path from "node:path";

export interface DiscoveredTic80Session {
    pid: number;
    host: string;
    port: number;
    startedAt: string;
    remotingVersion: string;
    source: "global" | "project";
    filePath: string;
    fileModifiedAtMs: number;
    key: string;
}

export interface DiscoveryOptions {
    projectDir?: string;
    localAppData?: string;
    isPidRunning?: (pid: number) => boolean;
}

type SourceDescriptor = {
    source: "global" | "project";
    directoryPath: string;
};

const SESSION_FILE_PATTERN = /^tic80-remote\.(\d+)\.json$/i;

function getSourceDirectories(options?: DiscoveryOptions): SourceDescriptor[] {
    const localAppData = options?.localAppData ?? process.env.LOCALAPPDATA;
    const directories: SourceDescriptor[] = [];

    if (localAppData) {
        directories.push({
            source: "global",
            directoryPath: path.join(localAppData, "TIC-80", "remoting", "sessions"),
        });
    }

    if (options?.projectDir) {
        directories.push({
            source: "project",
            directoryPath: path.join(options.projectDir, ".ticbuild", "remoting", "sessions"),
        });
    }

    return directories;
}

function parseSessionJson(content: string): Omit<DiscoveredTic80Session, "source" | "filePath" | "fileModifiedAtMs" | "key"> | null {
    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch {
        return null;
    }

    if (!parsed || typeof parsed !== "object") {
        return null;
    }

    const record = parsed as Record<string, unknown>;
    const pid = Number(record.pid);
    const host = typeof record.host === "string" ? record.host.trim() : "";
    const port = Number(record.port);
    const startedAt = typeof record.startedAt === "string" ? record.startedAt : "";
    const remotingVersion = typeof record.remotingVersion === "string" ? record.remotingVersion : "";

    if (!Number.isInteger(pid) || pid <= 0) {
        return null;
    }
    if (!host) {
        return null;
    }
    if (!Number.isInteger(port) || port <= 0 || port >= 65536) {
        return null;
    }
    if (!startedAt) {
        return null;
    }
    if (!remotingVersion) {
        return null;
    }

    return {
        pid,
        host,
        port,
        startedAt,
        remotingVersion,
    };
}

function parseStartedAtMs(session: Pick<DiscoveredTic80Session, "startedAt">): number {
    const startedAtMs = Date.parse(session.startedAt);
    return Number.isFinite(startedAtMs) ? startedAtMs : 0;
}

function compareSessionsMostRecentFirst(a: DiscoveredTic80Session, b: DiscoveredTic80Session): number {
    const startedAtDelta = parseStartedAtMs(b) - parseStartedAtMs(a);
    if (startedAtDelta !== 0) {
        return startedAtDelta;
    }

    const modifiedDelta = b.fileModifiedAtMs - a.fileModifiedAtMs;
    if (modifiedDelta !== 0) {
        return modifiedDelta;
    }

    return b.pid - a.pid;
}

function defaultIsPidRunning(pid: number): boolean {
    try {
        process.kill(pid, 0);
        return true;
    } catch (err) {
        const code = (err as NodeJS.ErrnoException | undefined)?.code;
        if (code === "EPERM") {
            return true;
        }
        return false;
    }
}

export async function readDiscoveredSessions(options?: DiscoveryOptions): Promise<DiscoveredTic80Session[]> {
    const directories = getSourceDirectories(options);
    const sessionsByKey = new Map<string, DiscoveredTic80Session>();

    for (const descriptor of directories) {
        let entries: fs.Dirent[];
        try {
            entries = await fs.promises.readdir(descriptor.directoryPath, { withFileTypes: true });
        } catch {
            continue;
        }

        for (const entry of entries) {
            if (!entry.isFile()) {
                continue;
            }
            if (!SESSION_FILE_PATTERN.test(entry.name)) {
                continue;
            }

            const filePath = path.join(descriptor.directoryPath, entry.name);

            let content: string;
            let stats: fs.Stats;
            try {
                [content, stats] = await Promise.all([
                    fs.promises.readFile(filePath, "utf-8"),
                    fs.promises.stat(filePath),
                ]);
            } catch {
                continue;
            }

            const parsed = parseSessionJson(content);
            if (!parsed) {
                continue;
            }

            const key = `${parsed.pid}|${parsed.host}|${parsed.port}`;
            const discovered: DiscoveredTic80Session = {
                ...parsed,
                source: descriptor.source,
                filePath,
                fileModifiedAtMs: stats.mtimeMs,
                key,
            };

            const existing = sessionsByKey.get(key);
            if (!existing || compareSessionsMostRecentFirst(discovered, existing) < 0) {
                sessionsByKey.set(key, discovered);
            }
        }
    }

    return Array.from(sessionsByKey.values()).sort(compareSessionsMostRecentFirst);
}

export async function listRunningDiscoveredSessions(options?: DiscoveryOptions): Promise<DiscoveredTic80Session[]> {
    const sessions = await readDiscoveredSessions(options);
    const isPidRunning = options?.isPidRunning ?? defaultIsPidRunning;
    return sessions.filter((session) => isPidRunning(session.pid));
}
