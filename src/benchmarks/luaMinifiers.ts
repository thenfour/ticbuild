import { constants as zlibConstants, deflateSync } from "node:zlib";
import * as luaparse from "luaparse";
import { getErrorMessage } from "../utils/errorHandling";

export type LuaMinifierBenchmarkFixture = {
  id: string;
  source: string;
};

export type AvailableLuaMinifierBenchmarkTool = {
  id: string;
  label: string;
  version: string;
  available: true;
  minify(source: string, fixtureId: string): string | Promise<string>;
};

export type UnavailableLuaMinifierBenchmarkTool = {
  id: string;
  label: string;
  version?: string;
  available: false;
  reason: string;
};

export type LuaMinifierBenchmarkTool =
  | AvailableLuaMinifierBenchmarkTool
  | UnavailableLuaMinifierBenchmarkTool;

export type LuaMinifierFixtureResult = {
  fixtureId: string;
  inputBytes: number;
  inputZlibBytes: number;
  outputBytes?: number;
  outputZlibBytes?: number;
  error?: string;
};

export type LuaMinifierToolResult = {
  id: string;
  label: string;
  version?: string;
  available: boolean;
  reason?: string;
  fixtures: LuaMinifierFixtureResult[];
  outputBytes?: number;
  outputZlibBytes?: number;
};

export type LuaMinifierBenchmarkReport = {
  inputBytes: number;
  inputZlibBytes: number;
  fixtures: Array<{
    id: string;
    inputBytes: number;
    inputZlibBytes: number;
  }>;
  tools: LuaMinifierToolResult[];
};

function zlibMaxBytes(source: string): number {
  return deflateSync(Buffer.from(source), {
    level: zlibConstants.Z_BEST_COMPRESSION,
    memLevel: zlibConstants.Z_MAX_MEMLEVEL,
    windowBits: zlibConstants.Z_MAX_WINDOWBITS,
    strategy: zlibConstants.Z_DEFAULT_STRATEGY,
  }).byteLength;
}

function validateLua(source: string, description: string): void {
  try {
    luaparse.parse(source, { luaVersion: "5.3" });
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(`${description} is not valid Lua 5.3: ${message}`);
  }
}

function percentageChange(output: number, input: number): string {
  if (input === 0) return "0.0%";
  const change = ((output - input) / input) * 100;
  return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
}

function percentageOver(value: number, best: number): string {
  if (value === best) return "best";
  if (best === 0) return "n/a";
  return `+${(((value - best) / best) * 100).toFixed(1)}%`;
}

function markdownTable(headers: string[], rows: string[][]): string {
  const widths = headers.map((header, column) =>
    Math.max(header.length, ...rows.map((row) => row[column]?.length ?? 0)),
  );
  const formatRow = (row: string[]): string =>
    `| ${row.map((cell, column) => cell.padEnd(widths[column])).join(" | ")} |`;
  return [
    formatRow(headers),
    `| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`,
    ...rows.map(formatRow),
  ].join("\n");
}

export async function runLuaMinifierBenchmark(
  fixtures: LuaMinifierBenchmarkFixture[],
  tools: LuaMinifierBenchmarkTool[],
): Promise<LuaMinifierBenchmarkReport> {
  if (fixtures.length === 0) throw new Error("At least one Lua benchmark fixture is required");

  const fixtureIds = new Set<string>();
  const measuredFixtures = fixtures.map((fixture) => {
    if (!fixture.id) throw new Error("Lua benchmark fixture IDs must not be empty");
    if (fixtureIds.has(fixture.id)) throw new Error(`Duplicate Lua benchmark fixture ID: ${fixture.id}`);
    fixtureIds.add(fixture.id);
    validateLua(fixture.source, `Benchmark fixture ${fixture.id}`);
    return {
      ...fixture,
      inputBytes: Buffer.byteLength(fixture.source),
      inputZlibBytes: zlibMaxBytes(fixture.source),
    };
  });

  const toolIds = new Set<string>();
  for (const tool of tools) {
    if (toolIds.has(tool.id)) throw new Error(`Duplicate Lua benchmark tool ID: ${tool.id}`);
    toolIds.add(tool.id);
  }

  const toolResults: LuaMinifierToolResult[] = [];
  for (const tool of tools) {
    if (!tool.available) {
      toolResults.push({
        id: tool.id,
        label: tool.label,
        version: tool.version,
        available: false,
        reason: tool.reason,
        fixtures: [],
      });
      continue;
    }

    const fixtureResults: LuaMinifierFixtureResult[] = [];
    for (const fixture of measuredFixtures) {
      const baseResult = {
        fixtureId: fixture.id,
        inputBytes: fixture.inputBytes,
        inputZlibBytes: fixture.inputZlibBytes,
      };
      try {
        const output = await tool.minify(fixture.source, fixture.id);
        validateLua(output, `${tool.label} output for ${fixture.id}`);
        fixtureResults.push({
          ...baseResult,
          outputBytes: Buffer.byteLength(output),
          outputZlibBytes: zlibMaxBytes(output),
        });
      } catch (error) {
        fixtureResults.push({
          ...baseResult,
          error: getErrorMessage(error),
        });
      }
    }

    const completed = fixtureResults.every((fixture) => fixture.error === undefined);
    toolResults.push({
      id: tool.id,
      label: tool.label,
      version: tool.version,
      available: true,
      fixtures: fixtureResults,
      outputBytes: completed
        ? fixtureResults.reduce((sum, fixture) => sum + (fixture.outputBytes ?? 0), 0)
        : undefined,
      outputZlibBytes: completed
        ? fixtureResults.reduce((sum, fixture) => sum + (fixture.outputZlibBytes ?? 0), 0)
        : undefined,
    });
  }

  return {
    inputBytes: measuredFixtures.reduce((sum, fixture) => sum + fixture.inputBytes, 0),
    inputZlibBytes: measuredFixtures.reduce((sum, fixture) => sum + fixture.inputZlibBytes, 0),
    fixtures: measuredFixtures.map(({ id, inputBytes, inputZlibBytes }) => ({
      id,
      inputBytes,
      inputZlibBytes,
    })),
    tools: toolResults,
  };
}

export function formatLuaMinifierBenchmark(report: LuaMinifierBenchmarkReport): string {
  const completedTools = report.tools.filter(
    (tool): tool is LuaMinifierToolResult & { outputBytes: number; outputZlibBytes: number } =>
      tool.outputBytes !== undefined && tool.outputZlibBytes !== undefined,
  );
  const bestBytes = Math.min(...completedTools.map((tool) => tool.outputBytes));
  const bestZlibBytes = Math.min(...completedTools.map((tool) => tool.outputZlibBytes));

  const summaryRows = report.tools.map((tool) => {
    const name = tool.version ? `${tool.label} ${tool.version}` : tool.label;
    if (!tool.available) return [name, "unavailable", "", "", ""];
    if (tool.outputBytes === undefined || tool.outputZlibBytes === undefined) {
      const passed = tool.fixtures.filter((fixture) => fixture.error === undefined).length;
      return [name, `error (${passed}/${tool.fixtures.length})`, "", "", ""];
    }
    return [
      name,
      tool.outputBytes.toLocaleString("en-US"),
      percentageChange(tool.outputBytes, report.inputBytes),
      tool.outputZlibBytes.toLocaleString("en-US"),
      `${percentageOver(tool.outputBytes, bestBytes)} raw / ${percentageOver(tool.outputZlibBytes, bestZlibBytes)} zlib`,
    ];
  });

  const fixtureRows: string[][] = [];
  for (const fixture of report.fixtures) {
    for (const tool of report.tools) {
      const result = tool.fixtures.find((candidate) => candidate.fixtureId === fixture.id);
      if (!result) continue;
      fixtureRows.push([
        fixture.id,
        tool.label,
        result.error ?? result.outputBytes?.toLocaleString("en-US") ?? "",
        result.error ? "" : result.outputZlibBytes?.toLocaleString("en-US") ?? "",
      ]);
    }
  }

  const unavailable = report.tools
    .filter((tool) => !tool.available)
    .map((tool) => `- ${tool.label}: ${tool.reason}`);
  const errors = report.tools.flatMap((tool) =>
    tool.fixtures
      .filter((fixture) => fixture.error !== undefined)
      .map((fixture) => `- ${tool.label} / ${fixture.fixtureId}: ${fixture.error}`),
  );

  const sections = [
    `Lua minifier output-size benchmark (${report.fixtures.length} fixtures, ${report.inputBytes.toLocaleString("en-US")} input bytes)`,
    "",
    markdownTable(
      ["Tool", "Raw bytes", "vs input", "zlib-max bytes", "vs best"],
      summaryRows,
    ),
  ];
  if (fixtureRows.length > 0) {
    sections.push("", "Per fixture", "", markdownTable(["Fixture", "Tool", "Raw bytes", "zlib-max bytes"], fixtureRows));
  }
  if (unavailable.length > 0) sections.push("", "Unavailable tools", "", ...unavailable);
  if (errors.length > 0) sections.push("", "Errors", "", ...errors);
  return sections.join("\n");
}
