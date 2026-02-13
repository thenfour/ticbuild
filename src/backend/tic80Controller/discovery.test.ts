import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { listRunningDiscoveredSessions, readDiscoveredSessions } from "./discovery";

function writeJson(filePath: string, value: unknown): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(value), "utf-8");
}

describe("discovery", () => {
    it("reads and merges sessions from global and project sources ordered by recent startedAt", async () => {
        const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-discovery-"));
        const localAppData = path.join(tempRoot, "localappdata");
        const projectDir = path.join(tempRoot, "project");

        try {
            writeJson(path.join(localAppData, "TIC-80", "remoting", "sessions", "tic80-remote.100.json"), {
                pid: 100,
                host: "127.0.0.1",
                port: 55100,
                startedAt: "2026-01-01T10:00:00.000Z",
                remotingVersion: "v1",
            });

            writeJson(path.join(projectDir, ".ticbuild", "remoting", "sessions", "tic80-remote.200.json"), {
                pid: 200,
                host: "127.0.0.1",
                port: 55200,
                startedAt: "2026-01-01T12:00:00.000Z",
                remotingVersion: "v1",
            });

            const sessions = await readDiscoveredSessions({ localAppData, projectDir });

            expect(sessions).toHaveLength(2);
            expect(sessions[0].pid).toBe(200);
            expect(sessions[1].pid).toBe(100);
            expect(sessions[0].source).toBe("project");
            expect(sessions[1].source).toBe("global");
        } finally {
            fs.rmSync(tempRoot, { recursive: true, force: true });
        }
    });

    it("ignores malformed discovery json files", async () => {
        const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-discovery-"));
        const localAppData = path.join(tempRoot, "localappdata");

        try {
            writeJson(path.join(localAppData, "TIC-80", "remoting", "sessions", "tic80-remote.100.json"), {
                pid: 100,
                host: "127.0.0.1",
                port: 55100,
                startedAt: "2026-01-01T10:00:00.000Z",
                remotingVersion: "v1",
            });

            writeJson(path.join(localAppData, "TIC-80", "remoting", "sessions", "tic80-remote.101.json"), {
                pid: "not-a-number",
                host: "127.0.0.1",
                port: 55101,
                startedAt: "2026-01-01T11:00:00.000Z",
                remotingVersion: "v1",
            });

            fs.writeFileSync(
                path.join(localAppData, "TIC-80", "remoting", "sessions", "tic80-remote.102.json"),
                "{ broken json",
                "utf-8",
            );

            const sessions = await readDiscoveredSessions({ localAppData });
            expect(sessions).toHaveLength(1);
            expect(sessions[0].pid).toBe(100);
        } finally {
            fs.rmSync(tempRoot, { recursive: true, force: true });
        }
    });

    it("filters to running sessions when requested", async () => {
        const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-discovery-"));
        const localAppData = path.join(tempRoot, "localappdata");

        try {
            writeJson(path.join(localAppData, "TIC-80", "remoting", "sessions", "tic80-remote.301.json"), {
                pid: 301,
                host: "127.0.0.1",
                port: 55301,
                startedAt: "2026-01-01T11:00:00.000Z",
                remotingVersion: "v1",
            });

            writeJson(path.join(localAppData, "TIC-80", "remoting", "sessions", "tic80-remote.302.json"), {
                pid: 302,
                host: "127.0.0.1",
                port: 55302,
                startedAt: "2026-01-01T11:30:00.000Z",
                remotingVersion: "v1",
            });

            const sessions = await listRunningDiscoveredSessions({
                localAppData,
                isPidRunning: (pid) => pid === 302,
            });

            expect(sessions).toHaveLength(1);
            expect(sessions[0].pid).toBe(302);
        } finally {
            fs.rmSync(tempRoot, { recursive: true, force: true });
        }
    });
});
