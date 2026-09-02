import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { buildCommand } from "./build";
import {
  BuildMessage,
  HumanBuildReporter,
  JsonlBuildReporter,
  buildReportFileName,
  buildTraceFileName,
  buildReportVersion,
  createBuildReporter,
} from "./buildReporter";
import { buildCore } from "./core";
import * as cons from "../utils/console";
import { kTic80CartChunkTypes } from "../utils/tic80/tic80";
import type { ChromeTraceFile } from "../utils/traceProfiler";

type JsonlMessage = {
  version: number;
  type: string;
  data: Record<string, unknown>;
};

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function createTempProject(code: string = "print('ok')", minify = false): { dir: string; manifestPath: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-reporter-"));
  writeFile(path.join(dir, "main.lua"), code);
  const manifest = {
    buildConfiguration: "release",
    project: {
      name: "test",
      binDir: "./bin",
      objDir: "./obj",
      outputCartName: "out.tic",
      autoUpdateManifestSchema: false,
    },
    imports: [
      {
        name: "maincode",
        path: "main.lua",
        kind: "LuaCode",
      },
    ],
    assembly: {
      lua: {
        minify,
        ...(minify ? {
          minification: {
            removeUnusedLocals: false,
            // These tests intentionally saturate the authored-local budget.
            ruleOverrides: { "reduce.inline-immutable-scalars": false },
          },
        } : {}),
      },
      blocks: [
        {
          asset: "maincode",
          chunks: ["CODE"],
        },
      ],
    },
  };
  const manifestPath = path.join(dir, "project.ticbuild.jsonc");
  writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return { dir, manifestPath };
}

function createCollectingReporter(): { reporter: JsonlBuildReporter; messages: JsonlMessage[] } {
  const messages: JsonlMessage[] = [];
  const reporter = new JsonlBuildReporter((line) => messages.push(JSON.parse(line) as JsonlMessage));
  return { reporter, messages };
}

function readBuildReport(dir: string): JsonlMessage[] {
  return fs
    .readFileSync(path.join(dir, "obj", buildReportFileName), "utf-8")
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as JsonlMessage);
}

function readBuildTrace(dir: string): ChromeTraceFile {
  return JSON.parse(
    fs.readFileSync(path.join(dir, "obj", buildTraceFileName), "utf-8"),
  ) as ChromeTraceFile;
}

describe("Build reporters", () => {
  it("renders human messages and preserves human-only output", () => {
    const reporter = new HumanBuildReporter();
    const rendered: string[] = [];
    const messages: BuildMessage[] = [
      {
        type: "comment",
        data: { message: "structured" },
        humanReadable: () => rendered.push("structured"),
      },
      {
        type: null,
        humanReadable: () => rendered.push("human-only"),
      },
    ];

    messages.forEach((message) => reporter.message(message));

    expect(rendered).toEqual(["structured", "human-only"]);
  });

  it("writes versioned JSONL and omits human-only messages", () => {
    const lines: string[] = [];
    const reporter = new JsonlBuildReporter((line) => lines.push(line));
    const humanReadable = jest.fn();

    reporter.message({
      type: "comment",
      data: { message: "hello" },
      humanReadable,
    });
    reporter.message({
      type: null,
      humanReadable,
    });

    expect(lines).toEqual([
      JSON.stringify({
        version: buildReportVersion,
        type: "comment",
        data: { message: "hello" },
      }),
    ]);
    expect(humanReadable).not.toHaveBeenCalled();
  });

  it("rejects unsupported reporter names", () => {
    expect(() => createBuildReporter("xml")).toThrow("Unsupported build reporter 'xml'");
  });

  it("emits structured build values without invoking human rendering", async () => {
    const { dir, manifestPath } = createTempProject();
    const { reporter, messages } = createCollectingReporter();
    const h1Spy = jest.spyOn(cons, "h1").mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(cons, "info").mockImplementation(() => undefined);
    const successSpy = jest.spyOn(cons, "success").mockImplementation(() => undefined);

    try {
      await buildCore(manifestPath, undefined, reporter);

      expect(messages.map((message) => message.type)).toEqual([
        "project.loadedFrom",
        "manifest.resolved",
        "comment",
        "lua.codeSize",
        "cart.usage",
        "build.completed",
      ]);
      expect(messages.every((message) => message.version === buildReportVersion)).toBe(true);
      const codeInfo = kTic80CartChunkTypes.byKey.CODE;
      expect(messages.find((message) => message.type === "lua.codeSize")?.data).toMatchObject({
        importName: "maincode",
        chunks: [
          {
            chunkType: "CODE",
            capacityBytes: codeInfo.sizePerBank * codeInfo.bankCount,
            banksUsed: 1,
            banksAvailable: 8,
          },
        ],
      });
      expect(messages.find((message) => message.type === "build.completed")?.data).toMatchObject({
        cartPath: path.join(dir, "bin", "out.tic"),
        logPath: path.join(dir, "obj", "build.log"),
        tracePath: path.join(dir, "obj", buildTraceFileName),
      });
      const trace = readBuildTrace(dir);
      expect(trace.displayTimeUnit).toBe("ms");
      expect(trace.traceEvents).toEqual(expect.arrayContaining([
        expect.objectContaining({ ph: "M", name: "process_name", args: { name: "ticbuild" } }),
        expect.objectContaining({ ph: "M", name: "thread_name", args: { name: "Build overview" } }),
        expect.objectContaining({ ph: "M", name: "thread_name", args: { name: "Import: maincode" } }),
        expect.objectContaining({ ph: "X", name: "ticbuild build", args: expect.objectContaining({ outcome: "succeeded" }) }),
        expect.objectContaining({ ph: "X", name: "Process imports" }),
        expect.objectContaining({ ph: "X", name: "Produce development artifacts" }),
        expect.objectContaining({ ph: "X", name: "Assemble cartridge" }),
        expect.objectContaining({ ph: "X", name: "Write cartridge" }),
      ]));
      expect(readBuildReport(dir)).toEqual(messages);
      expect(h1Spy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(successSpy).not.toHaveBeenCalled();
    } finally {
      h1Spy.mockRestore();
      infoSpy.mockRestore();
      successSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("always writes the structured build report when using the human reporter", async () => {
    const { dir, manifestPath } = createTempProject();
    const previousObserver = cons.getConsoleMessageObserver();

    try {
      await buildCore(manifestPath, undefined, new HumanBuildReporter());

      expect(readBuildReport(dir).map((message) => message.type)).toEqual([
        "project.loadedFrom",
        "manifest.resolved",
        "comment",
        "lua.codeSize",
        "cart.usage",
        "build.completed",
      ]);
      expect(cons.getConsoleMessageObserver()).toBe(previousObserver);
    } finally {
      cons.setConsoleMessageObserver(previousObserver);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("captures legacy warnings as JSONL diagnostics", async () => {
    const { dir, manifestPath } = createTempProject("--#warning reporter warning\nprint('ok')");
    const { reporter, messages } = createCollectingReporter();
    const previousExitCode = process.exitCode;
    const previousSink = cons.getConsoleMessageSink();
    process.exitCode = undefined;

    try {
      await buildCommand(manifestPath, { reporter: "jsonl" }, reporter);

      expect(messages).toContainEqual({
        version: buildReportVersion,
        type: "diagnostic",
        data: {
          severity: "warning",
          message: expect.stringContaining("reporter warning"),
        },
      });
      expect(messages[messages.length - 1]?.type).toBe("build.completed");
      expect(readBuildReport(dir)).toEqual(messages);
      expect(process.exitCode).toBeUndefined();
      expect(cons.getConsoleMessageSink()).toBe(previousSink);
    } finally {
      process.exitCode = previousExitCode;
      cons.setConsoleMessageSink(previousSink);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("archives legacy warnings once while preserving human reporting", async () => {
    const { dir, manifestPath } = createTempProject("--#warning reporter warning\nprint('ok')");
    const previousSink = cons.getConsoleMessageSink();
    const renderedMessages: { level: cons.ConsoleMessageLevel; message: string }[] = [];
    cons.setConsoleMessageSink((level, message) => renderedMessages.push({ level, message }));

    try {
      await buildCore(manifestPath, undefined, new HumanBuildReporter());

      const messages = readBuildReport(dir);
      expect(messages.map((message) => message.type)).toEqual([
        "project.loadedFrom",
        "manifest.resolved",
        "comment",
        "diagnostic",
        "lua.codeSize",
        "cart.usage",
        "build.completed",
      ]);
      expect(messages.filter((message) => message.type === "diagnostic")).toEqual([
        {
          version: buildReportVersion,
          type: "diagnostic",
          data: {
            severity: "warning",
            message: expect.stringContaining("reporter warning"),
          },
        },
      ]);
      expect(
        renderedMessages.filter(
          ({ level, message }) => level === "warning" && message.includes("reporter warning"),
        ),
      ).toHaveLength(1);
    } finally {
      cons.setConsoleMessageSink(previousSink);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports aliases omitted because Lua's local-variable limit was reached", async () => {
    const names = Array.from({ length: 200 }, (_, index) => `value${index}`).join(",");
    const uses = Array.from({ length: 7 }, () => "time()").join("\n");
    const code = `local ${names}\n${uses}\nreturn ${names}`;
    const { dir, manifestPath } = createTempProject(code, true);
    const { reporter, messages } = createCollectingReporter();

    try {
      await buildCore(manifestPath, undefined, reporter);

      expect(messages.find((message) => message.type === "lua.minification")?.data).toMatchObject({
        importName: "maincode",
        localLimit: 200,
        constrainedFunctions: [
          {
            functionName: "<main chunk>",
            peakActiveLocals: 200,
            existingLocalsAtPeak: 200,
            generatedLocalsAtPeak: 0,
            rules: {
              aliasRepeatedExpressions: {
                omitted: 1,
              },
            },
          },
        ],
      });
      expect(fs.readFileSync(path.join(dir, "obj", "imports.log"), "utf-8")).toContain(
        "Lua minification local budget",
      );
      const traceEvents = readBuildTrace(dir).traceEvents;
      expect(traceEvents.filter((event) => event.name === "Lua minification")).toHaveLength(1);
      expect(traceEvents).toEqual(expect.arrayContaining([
        expect.objectContaining({ ph: "X", name: "Parse Lua" }),
        expect.objectContaining({ ph: "X", name: "Optimize Lua AST" }),
        expect.objectContaining({ ph: "X", name: "Print and map Lua" }),
      ]));
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("renders local-budget constraints as actionable human warnings", async () => {
    const names = Array.from({ length: 200 }, (_, index) => `value${index}`).join(",");
    const uses = Array.from({ length: 7 }, () => "time()").join("\n");
    const { dir, manifestPath } = createTempProject(`local ${names}\n${uses}\nreturn ${names}`, true);
    const warningSpy = jest.spyOn(cons, "warning").mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(cons, "info").mockImplementation(() => undefined);

    try {
      await buildCore(manifestPath, undefined, new HumanBuildReporter());

      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining("200/200 active locals"));
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining("aliasRepeatedExpressions=1"));
      expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("Reduce simultaneously active locals"));
    } finally {
      warningSpy.mockRestore();
      infoSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("emits a terminal failure message and sets the exit code", async () => {
    const { reporter, messages } = createCollectingReporter();
    const previousExitCode = process.exitCode;
    const previousSink = cons.getConsoleMessageSink();
    process.exitCode = undefined;

    try {
      await buildCommand(path.join(os.tmpdir(), "missing-project.ticbuild.jsonc"), { reporter: "jsonl" }, reporter);

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        version: buildReportVersion,
        type: "build.failed",
        data: {
          message: expect.any(String),
        },
      });
      expect(process.exitCode).toBe(1);
      expect(cons.getConsoleMessageSink()).toBe(previousSink);
    } finally {
      process.exitCode = previousExitCode;
      cons.setConsoleMessageSink(previousSink);
    }
  });

  it("ends the archived report with a failure after the obj directory is resolved", async () => {
    const { dir, manifestPath } = createTempProject();
    const previousExitCode = process.exitCode;
    process.exitCode = undefined;
    fs.rmSync(path.join(dir, "main.lua"));

    try {
      await buildCommand(manifestPath, undefined, new HumanBuildReporter());

      const messages = readBuildReport(dir);
      expect(messages[messages.length - 1]).toMatchObject({
        version: buildReportVersion,
        type: "build.failed",
        data: {
          message: expect.any(String),
          tracePath: path.join(dir, "obj", buildTraceFileName),
        },
      });
      expect(readBuildTrace(dir).traceEvents).toContainEqual(expect.objectContaining({
        ph: "X",
        name: "ticbuild build",
        args: expect.objectContaining({ outcome: "failed" }),
      }));
      expect(process.exitCode).toBe(1);
    } finally {
      process.exitCode = previousExitCode;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
