#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { runLuaMinifierBenchmark, formatLuaMinifierBenchmark } = require("../dist/benchmarks/luaMinifiers");
const { MAX_OPTIMIZATION_OPTIONS } = require("../dist/backend/importers/CodeResource");
const { processLua } = require("../dist/utils/lua/lua_processor");
const luamin = require("luamin");

const repoRoot = path.resolve(__dirname, "..");
const defaultFixtureRoot = path.join(repoRoot, "benchmarks", "lua-minifiers", "fixtures");
const darkluaConfigPath = path.join(repoRoot, "benchmarks", "lua-minifiers", "darklua.json");

function usage() {
  return [
    "Usage: npm run benchmark:lua-minifiers -- [options] [file-or-directory ...]",
    "",
    "Options:",
    "  --json <path>  Save the full benchmark report as JSON.",
    "  --help         Show this help.",
    "",
    "With no input paths, the checked-in benchmark fixtures are used. Directories",
    "are searched recursively for .lua files.",
  ].join("\n");
}

function parseArguments(argv) {
  const inputs = [];
  let jsonPath;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") return { help: true, inputs };
    if (argument === "--json") {
      jsonPath = argv[++index];
      if (!jsonPath) throw new Error("--json requires an output path");
      continue;
    }
    if (argument.startsWith("-")) throw new Error(`Unknown option: ${argument}`);
    inputs.push(argument);
  }
  return { help: false, inputs, jsonPath };
}

function collectLuaFiles(inputPath) {
  const absolutePath = path.resolve(inputPath);
  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) {
    if (path.extname(absolutePath).toLowerCase() !== ".lua") {
      throw new Error(`Benchmark input is not a .lua file: ${inputPath}`);
    }
    return [absolutePath];
  }
  if (!stat.isDirectory()) throw new Error(`Benchmark input is not a file or directory: ${inputPath}`);
  return fs
    .readdirSync(absolutePath, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(absolutePath, entry.name);
      if (entry.isDirectory()) return collectLuaFiles(entryPath);
      return entry.isFile() && path.extname(entry.name).toLowerCase() === ".lua" ? [entryPath] : [];
    })
    .sort((left, right) => left.localeCompare(right));
}

function loadFixtures(inputPaths) {
  const usingDefaults = inputPaths.length === 0;
  const roots = usingDefaults ? [defaultFixtureRoot] : inputPaths;
  const files = roots.flatMap(collectLuaFiles);
  return files.map((file) => ({
    id: (usingDefaults ? path.relative(defaultFixtureRoot, file) : path.relative(process.cwd(), file)).replaceAll(
      "\\",
      "/",
    ),
    source: fs.readFileSync(file, "utf8"),
  }));
}

function probeCommand(command) {
  const result = spawnSync(command, ["--version"], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error && result.error.code === "ENOENT") return undefined;
  return {
    command,
    version: `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim().split(/\r?\n/)[0] || "version unknown",
  };
}

function runCommand(command, args, toolLabel) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = `${result.stderr ?? ""}\n${result.stdout ?? ""}`.trim();
    throw new Error(`${toolLabel} exited with code ${result.status}${detail ? `: ${detail}` : ""}`);
  }
}

function withTemporaryFiles(prefix, source, action) {
  const tempRoot = path.resolve(os.tmpdir());
  const directory = fs.mkdtempSync(path.join(tempRoot, prefix));
  const resolvedDirectory = path.resolve(directory);
  if (path.dirname(resolvedDirectory) !== tempRoot || !path.basename(resolvedDirectory).startsWith(prefix)) {
    throw new Error(`Refusing to use unexpected temporary directory: ${resolvedDirectory}`);
  }
  const inputPath = path.join(resolvedDirectory, "input.lua");
  const outputPath = path.join(resolvedDirectory, "output.lua");
  try {
    fs.writeFileSync(inputPath, source, "utf8");
    action(inputPath, outputPath);
    return fs.readFileSync(outputPath, "utf8");
  } finally {
    fs.rmSync(resolvedDirectory, { recursive: true, force: true });
  }
}

function externalTools() {
  const darkluaCommand = process.env.DARKLUA_BIN || "darklua";
  const darklua = probeCommand(darkluaCommand);
  const luasrcdietCommand = process.env.LUASRCDIET_BIN || "luasrcdiet";
  const luasrcdiet = probeCommand(luasrcdietCommand);

  return [
    darklua
      ? {
          id: "darklua",
          label: "darklua",
          version: `${darklua.version.replace(/^darklua\s+/i, "")} process/dense`,
          available: true,
          minify: (source) =>
            withTemporaryFiles("ticbuild-darklua-", source, (inputPath, outputPath) => {
              runCommand(darklua.command, ["process", inputPath, outputPath, "--config", darkluaConfigPath], "darklua");
            }),
        }
      : {
          id: "darklua",
          label: "darklua",
          available: false,
          reason: "not found on PATH; install it or set DARKLUA_BIN",
        },
    luasrcdiet
      ? {
          id: "luasrcdiet",
          label: "LuaSrcDiet",
          version: luasrcdiet.version,
          available: true,
          minify: (source) =>
            withTemporaryFiles("ticbuild-luasrcdiet-", source, (inputPath, outputPath) => {
              runCommand(luasrcdiet.command, ["--maximum", inputPath, "-o", outputPath], "LuaSrcDiet");
            }),
        }
      : {
          id: "luasrcdiet",
          label: "LuaSrcDiet",
          available: false,
          reason: "not found on PATH; install it or set LUASRCDIET_BIN",
        },
  ];
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const packageJson = require(path.join(repoRoot, "package.json"));
  const luaminPackageJson = require("luamin/package.json");
  const fixtures = loadFixtures(args.inputs);
  const tools = [
    {
      id: "ticbuild",
      label: "ticbuild",
      version: `${packageJson.version} release`,
      available: true,
      minify: (source) => processLua(source, MAX_OPTIMIZATION_OPTIONS),
    },
    {
      id: "luamin",
      label: "luamin",
      version: luaminPackageJson.version,
      available: true,
      minify: (source) => luamin.minify(source),
    },
    ...externalTools(),
  ];

  const report = await runLuaMinifierBenchmark(fixtures, tools);
  process.stdout.write(`${formatLuaMinifierBenchmark(report)}\n`);

  if (args.jsonPath) {
    const outputPath = path.resolve(args.jsonPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(
      outputPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          platform: `${process.platform}-${process.arch}`,
          nodeVersion: process.version,
          ...report,
        },
        undefined,
        2,
      )}\n`,
      "utf8",
    );
    process.stdout.write(`\nJSON report: ${outputPath}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
  process.exitCode = 1;
});
