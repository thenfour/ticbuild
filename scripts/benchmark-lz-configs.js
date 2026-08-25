#!/usr/bin/env node

// benchmarks / searches for best LZ configuration matrix across various payloads.

const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const {
  gTicbuildLZBaselineConfig,
  gTicbuildLZRLESearchPresets,
  gTicbuildLZSearchPresets,
  lzCompress,
  lzCompressBest,
  lzDecompress,
  lzRleCompressBest,
} = require("../dist/utils/encoding/lz");

const repoRoot = path.resolve(__dirname, "..");
const textEncoder = new TextEncoder();

function parseArguments(argv) {
  let jsonPath;
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === "--json") {
      jsonPath = argv[++index];
      if (!jsonPath) throw new Error("--json requires an output path");
    } else if (argument === "--help" || argument === "-h") {
      return { help: true };
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  return { help: false, jsonPath };
}

function makeRandomGenerator(initialSeed = 0x12345678) {
  let seed = initialSeed >>> 0;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed >>> 24;
  };
}

function buildCorpus() {
  const payloads = [];
  const add = (id, data) => payloads.push({ id, data: data instanceof Uint8Array ? data : new Uint8Array(data) });
  const addTextFile = (relativePath) => {
    add(relativePath, textEncoder.encode(fs.readFileSync(path.join(repoRoot, relativePath), "utf8")));
  };

  for (const relativePath of [
    "benchmarks/lua-minifiers/fixtures/algorithms.lua",
    "benchmarks/lua-minifiers/fixtures/data-model.lua",
    "benchmarks/lua-minifiers/fixtures/tic80-cart.lua",
    "tic80.d.ts",
    "example.ticbuild.jsonc",
    "README.md",
  ]) {
    addTextFile(relativePath);
  }

  for (const relativePath of [
    "benchmarks/lua-minifiers/fixtures/packageDemo.lua",
    "benchmarks/lua-minifiers/fixtures/spaceLogistics-RC0.lua",
  ]) {
    const data = textEncoder.encode(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
    for (const [label, start] of [
      ["start", 0],
      ["middle", Math.floor(data.length / 2)],
      ["end", Math.max(0, data.length - 65536)],
    ]) {
      add(`${relativePath} ${label}`, data.slice(start, start + 65536));
    }
  }

  const randomByte = makeRandomGenerator();
  for (const length of [512, 2048, 16384]) {
    add(`random ${length}`, Uint8Array.from({ length }, randomByte));
  }
  for (const alphabetSize of [2, 4, 16, 64]) {
    add(
      `alphabet ${alphabetSize}`,
      Uint8Array.from({ length: 4096 }, () => randomByte() % alphabetSize),
    );
  }
  for (const spacing of [8, 16, 37, 64]) {
    const data = new Uint8Array(4096);
    for (let index = 0; index < data.length; index += spacing) {
      data[index] = randomByte();
      data[index + 1] = randomByte();
      data[index + 2] = randomByte();
    }
    add(`sparse ${spacing}`, data);
  }
  for (const period of [1, 3, 16, 64, 256, 1024]) {
    const pattern = Uint8Array.from({ length: period }, randomByte);
    const data = Uint8Array.from({ length: Math.max(4096, period * 3) }, (_, index) => pattern[index % period]);
    add(`period ${period}`, data);
  }
  for (const distance of [64, 128, 512, 2048, 8192]) {
    const block = Uint8Array.from({ length: distance }, randomByte);
    const data = new Uint8Array(distance * 2);
    data.set(block);
    data.set(block, distance);
    add(`far repeat ${distance}`, data);
  }
  for (const width of [8, 32, 192]) {
    const data = new Uint8Array(width * 64);
    for (let row = 0; row < 64; row++) {
      for (let column = 0; column < width; column++) {
        data[row * width + column] = row % 7 === 0 || column < 3 ? randomByte() % 32 : 0;
      }
    }
    add(`records ${width}`, data);
  }

  return payloads;
}

function buildEvidenceGrid(useRLE = false) {
  const configs = [];
  for (const windowSize of [16, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383]) {
    for (const minMatchLength of [3, 4, 5, 6, 7]) {
      for (const maxMatchLength of [30, 63, 127, 255, 1023, 4095, 16383]) {
        configs.push({ windowSize, minMatchLength, maxMatchLength, useRLE });
      }
    }
  }
  return configs;
}

function sameBytes(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function formatConfig(config) {
  return `${config.windowSize}/${config.minMatchLength}/${config.maxMatchLength}${config.useRLE ? "+rle" : ""}`;
}

function main() {
  const args = parseArguments(process.argv.slice(2));
  if (args.help) {
    process.stdout.write("Usage: npm run benchmark:lz-configs -- [--json path]\n");
    return;
  }

  const corpus = buildCorpus();
  const grid = buildEvidenceGrid();
  const lzrleGrid = grid.flatMap((config) => [config, { ...config, useRLE: true }]);
  const started = performance.now();
  const rows = corpus.map((payload) => {
    const baseline = lzCompress(payload.data, gTicbuildLZBaselineConfig);
    const production = lzCompressBest(payload.data);
    const lzrleProduction = lzRleCompressBest(payload.data);
    const gridAttempts = grid.map((config) => ({ config, bytes: lzCompress(payload.data, config).length }));
    const lzrleGridAttempts = lzrleGrid.map((config) => ({ config, bytes: lzCompress(payload.data, config).length }));
    const gridBest = gridAttempts.reduce((best, attempt) => (attempt.bytes < best.bytes ? attempt : best));
    const lzrleGridBest = lzrleGridAttempts.reduce((best, attempt) => (attempt.bytes < best.bytes ? attempt : best));
    if (!sameBytes(lzDecompress(production.data), payload.data)) {
      throw new Error(`Production search failed to round-trip ${payload.id}`);
    }
    if (!sameBytes(lzDecompress(lzrleProduction.data), payload.data)) {
      throw new Error(`LZRLE production search failed to round-trip ${payload.id}`);
    }
    return {
      id: payload.id,
      rawBytes: payload.data.length,
      baselineBytes: baseline.length,
      productionBytes: production.data.length,
      productionPreset: production.presetName,
      gridBestBytes: gridBest.bytes,
      gridBestConfig: gridBest.config,
      lzrleProductionBytes: lzrleProduction.data.length,
      lzrleProductionPreset: lzrleProduction.presetName,
      lzrleGridBestBytes: lzrleGridBest.bytes,
      lzrleGridBestConfig: lzrleGridBest.config,
    };
  });
  const elapsedMs = performance.now() - started;
  const totals = rows.reduce(
    (result, row) => ({
      rawBytes: result.rawBytes + row.rawBytes,
      baselineBytes: result.baselineBytes + row.baselineBytes,
      productionBytes: result.productionBytes + row.productionBytes,
      gridBestBytes: result.gridBestBytes + row.gridBestBytes,
      lzrleProductionBytes: result.lzrleProductionBytes + row.lzrleProductionBytes,
      lzrleGridBestBytes: result.lzrleGridBestBytes + row.lzrleGridBestBytes,
    }),
    {
      rawBytes: 0,
      baselineBytes: 0,
      productionBytes: 0,
      gridBestBytes: 0,
      lzrleProductionBytes: 0,
      lzrleGridBestBytes: 0,
    },
  );

  process.stdout.write(
    [
      `LZ configuration benchmark: ${grid.length} LZ / ${lzrleGrid.length} LZRLE grid configs x ${corpus.length} payloads in ${elapsedMs.toFixed(1)} ms`,
      `LZ presets: ${gTicbuildLZSearchPresets.map((preset) => `${preset.name}=${formatConfig(preset.config)}`).join(", ")}`,
      `LZRLE presets: ${gTicbuildLZRLESearchPresets.map((preset) => `${preset.name}=${formatConfig(preset.config)}`).join(", ")}`,
      "",
      "payload | raw | LZ production | LZ grid best | LZ gap | LZRLE production | LZRLE grid best | LZRLE gap",
      ...rows.map(
        (row) =>
          `${row.id} | ${row.rawBytes} | ${row.productionBytes} (${row.productionPreset}) | ` +
          `${row.gridBestBytes} (${formatConfig(row.gridBestConfig)}) | ${row.productionBytes - row.gridBestBytes} | ` +
          `${row.lzrleProductionBytes} (${row.lzrleProductionPreset}) | ` +
          `${row.lzrleGridBestBytes} (${formatConfig(row.lzrleGridBestConfig)}) | ` +
          `${row.lzrleProductionBytes - row.lzrleGridBestBytes}`,
      ),
      "",
      `TOTAL | ${totals.rawBytes} | ${totals.productionBytes} | ${totals.gridBestBytes} | ` +
        `${totals.productionBytes - totals.gridBestBytes} | ${totals.lzrleProductionBytes} | ` +
        `${totals.lzrleGridBestBytes} | ${totals.lzrleProductionBytes - totals.lzrleGridBestBytes}`,
    ].join("\n") + "\n",
  );

  if (args.jsonPath) {
    const outputPath = path.resolve(args.jsonPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(
      outputPath,
      `${JSON.stringify({
        generatedAt: new Date().toISOString(),
        elapsedMs,
        presets: gTicbuildLZSearchPresets,
        lzrlePresets: gTicbuildLZRLESearchPresets,
        totals,
        rows,
      }, null, 2)}\n`,
      "utf8",
    );
    process.stdout.write(`JSON report: ${outputPath}\n`);
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
  process.exitCode = 1;
}
