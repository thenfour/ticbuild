import { AssembleOutputResult, TicbuildProject } from "../backend/project";
import { buildProjectSymbolIndex } from "../backend/symbolIndex";
import { LuaCodeResource, LuaCodeSizeStats } from "../backend/importers/LuaCodeImporter";
import { Tic80Resource } from "../backend/importers/tic80CartImporter";
import { AssetReference, CodeAssemblyOptions } from "../backend/manifestTypes";
import * as cons from "../utils/console";
import { ensureDir, fileExists, readTextFileAsync, writeBinaryFile, writeTextFile } from "../utils/fileSystem";
import { canonicalizePath } from "../utils/fileSystem";
import { formatBytes } from "../utils/utils";
import { kTic80CartChunkTypes, kTic80ExtendedCodeBankCount, Tic80CartChunkTypeKey } from "../utils/tic80/tic80";
import { CommandLineOptions, parseBuildOptions } from "./parseOptions";
import { writeFileSync } from "node:fs";
import * as path from "node:path";
import {
  BuildReporter,
  CartChunkUsageEntry,
  HumanBuildReporter,
  LuaCodeSizeEntry,
} from "./buildReporter";

export async function buildCore(
  manifestPath?: string,
  options?: CommandLineOptions,
  reporter: BuildReporter = new HumanBuildReporter(),
): Promise<void> {
  const buildStartTime = Date.now();
  let project: TicbuildProject;
  let projectLoadOptions = parseBuildOptions(manifestPath, options);

  const loadStartTime = Date.now();
  project = TicbuildProject.loadFromManifest(projectLoadOptions);
  const loadDuration = Date.now() - loadStartTime;

  // Set up build log file
  const objDir = await project.resolvedCore.resolveObjPath();
  await ensureDir(objDir);
  const logFilePath = project.resolvedCore.resolveObjPath(`build.log`);

  if (logFilePath) {
    // Initialize the log file from scratch otherwise you get a huge file over time.
    writeFileSync(logFilePath, "", "utf-8");
  }

  cons.setLogFile(logFilePath);

  const resolvedManifestSourcePath = project.resolvedCore.manifestPath;
  reporter.message({
    type: "project.loadedFrom",
    data: {
      manifestPath: resolvedManifestSourcePath,
    },
    humanReadable: () => {
      cons.h1("Project loaded from:");
      cons.info(`  ${resolvedManifestSourcePath}`);
    },
  });
  //cons.dim(`  (loaded in ${loadDuration}ms)`);

  await syncManifestSchema(project, reporter);

  // output variables
  const variablesOutputPath = project.resolvedCore.resolveObjPath("variables.json");
  const variablesObj: Record<string, string> = {};
  for (const [varName, varInfo] of project.resolvedCore.allVariables.entries()) {
    variablesObj[varName] = varInfo.resolvedValue;
  }
  await writeTextFile(variablesOutputPath, JSON.stringify(variablesObj, null, 2), "utf-8");

  const outputPath = project.resolvedCore.resolveObjPath("resolvedManifest.ticbuild.jsonc");
  reporter.message({
    type: "manifest.resolved",
    data: {
      resolvedManifestPath: outputPath,
    },
    humanReadable: () => {
      cons.h1("Outputting resolved manifest to");
      cons.info(`  ${outputPath}`);
    },
  });

  const json = JSON.stringify(project.resolvedCore.manifest, null, 2);
  const objDirPath = await project.resolvedCore.resolveObjPath();
  await ensureDir(objDirPath);
  await writeTextFile(outputPath, json, "utf-8");

  // import resources.
  reporter.message({
    type: "comment",
    data: {
      message: "Loading imported resources...",
    },
    humanReadable: () => cons.h1("Loading imported resources..."),
  });
  const importStartTime = Date.now();
  await project.loadImports();
  const importDuration = Date.now() - importStartTime;
  //cons.dim(`  (imported in ${importDuration}ms)`);

  warnExplicitCodeBanks(project, reporter);

  const importsLogPath = project.resolvedCore.resolveObjPath("imports.log");
  const importsLines: string[] = [];
  for (const [identifier, resource] of project.resourceMgr!.items.entries()) {
    importsLines.push(`Imported resource: ${identifier} (${resource.constructor.name})`);
    importsLines.push(`  deps:`);
    for (const dep of resource.getDependencyList()) {
      importsLines.push(`    - ${dep.path} (${dep.reason})`);
    }

    if (resource instanceof LuaCodeResource) {
      const codeRequests = getLuaCodeAssemblyRequests(project, identifier);
      const stats = resource.getCodeSizeStats(project.resolvedCore);
      const compressedOutputs = await getLuaCompressedCodeOutputs(project, resource, codeRequests);
      logLuaCodeSize(reporter, identifier, stats, codeRequests, compressedOutputs);

      importsLines.push(`  Code stats:`);
      importsLines.push(`    Input        : ${formatBytes(stats.inputBytes)}`);
      importsLines.push(`    Preprocessed : ${formatBytes(stats.preprocessedBytes)}`);
      importsLines.push(`    Minified     : ${formatBytes(stats.minifiedBytes)}`);
      if (compressedOutputs.length > 0) {
        importsLines.push(`    Compressed   : ${formatBytes(compressedOutputs[0].bytes.length)}`);
      }

      const artifacts = resource.getCodeArtifacts(project.resolvedCore);
      const preprocessedPath = project.resolvedCore.resolveObjPath(`${identifier}.01.preprocessed.lua`);
      const minifiedPath = project.resolvedCore.resolveObjPath(`${identifier}.02.minified.lua`);

      await writeTextFile(preprocessedPath, artifacts.preprocessedSource, "utf-8");
      await writeTextFile(minifiedPath, artifacts.minifiedSource, "utf-8");

      importsLines.push(`    Wrote: ${preprocessedPath}`);
      importsLines.push(`    Wrote: ${minifiedPath}`);
      if (compressedOutputs.length > 0) {
        const compressedPath = project.resolvedCore.resolveObjPath(`${identifier}.03.compressed.bin`);
        await writeBinaryFile(compressedPath, compressedOutputs[0].bytes);
        importsLines.push(`    Wrote: ${compressedPath}`);
      }
    }
    if (resource instanceof Tic80Resource) {
      const cartStatsLines = buildCartStatsLines(
        Array.from(resource.rootView.subAssets.entries()).map(([chunkType, data]) => ({
          chunkType,
          bank: 0,
          size: data.length,
        })),
        "  ",
      );
      if (cartStatsLines.length > 0) {
        importsLines.push(...cartStatsLines);
      }
    }
    importsLines.push("");
  }
  if (project.resourceMgr) {
    const startTime = Date.now();
    const symbolIndex = await buildProjectSymbolIndex(project.resolvedCore, project.resourceMgr);
    const duration = Date.now() - startTime;
    importsLines.push(`Built symbol index in ${duration}ms.`);
    const symbolIndexPath = project.resolvedCore.resolveObjPath("symbols.index.json");
    await writeTextFile(symbolIndexPath, JSON.stringify(symbolIndex, null, 2), "utf-8");
    importsLines.push(`Symbol index: ${symbolIndexPath}`);
  }

  await writeTextFile(importsLogPath, importsLines.join("\n"), "utf-8");

  // assemble output.
  const assembleStartTime = Date.now();
  const assemblyOutput = await project.assembleOutput();
  const { output, chunks } = assemblyOutput;
  const assembleDuration = Date.now() - assembleStartTime;

  warnDeprecatedChunks(assemblyOutput, reporter);
  warnNonstandardCodeExtensions(assemblyOutput, reporter);

  const outDir = await project.resolvedCore.resolveBinPath();
  await ensureDir(outDir);
  const outputFilePath = project.resolvedCore.getOutputFilePath();
  //cons.h1("Writing output TIC-80 cartridge to:");

  const writeStartTime = Date.now();
  await writeBinaryFile(outputFilePath, output);
  const writeDuration = Date.now() - writeStartTime;

  logCartStats(assemblyOutput, reporter);

  const totalDuration = Date.now() - buildStartTime;
  reporter.message({
    type: "build.completed",
    data: {
      durationMs: totalDuration,
      logPath: logFilePath,
      cartPath: outputFilePath,
    },
    humanReadable: () => {
      cons.success(`Build completed successfully in ${totalDuration}ms.`);
      cons.info(`  Log : ${logFilePath}`);
      cons.info(`  Cart: ${outputFilePath}`);
    },
  });
}

function getBundledManifestSchemaPath(): string {
  return path.resolve(__dirname, "..", "..", "ticbuild.schema.json");
}

function getManagedManifestSchemaPath(project: TicbuildProject): string {
  return canonicalizePath(path.join(project.resolvedCore.projectDir, ".ticbuild", "ticbuild.schema.json"));
}

function reportDiagnostic(reporter: BuildReporter, severity: "warning" | "error", message: string): void {
  reporter.message({
    type: "diagnostic",
    data: {
      severity,
      message,
    },
    humanReadable: () => {
      if (severity === "warning") {
        cons.warning(message);
      } else {
        cons.error(message);
      }
    },
  });
}

async function syncManifestSchema(project: TicbuildProject, reporter: BuildReporter): Promise<void> {
  if (project.resolvedCore.manifest.project.autoUpdateManifestSchema === false) {
    return;
  }

  const bundledSchemaPath = getBundledManifestSchemaPath();
  const bundledSchema = await readTextFileAsync(bundledSchemaPath, "utf-8");
  const managedSchemaPath = getManagedManifestSchemaPath(project);

  const schemaRef = project.resolvedCore.manifest.$schema;
  const resolvedSchemaPath = schemaRef ? canonicalizePath(project.resolvedCore.resolveProjectPath(schemaRef)) : managedSchemaPath;
  const usesManagedSchemaPath = resolvedSchemaPath === managedSchemaPath;

  if (!usesManagedSchemaPath) {
    if (!fileExists(resolvedSchemaPath)) {
      reportDiagnostic(reporter, "warning", `Manifest $schema points elsewhere and is missing: ${schemaRef}`);
      return;
    }

    const existingSchema = await readTextFileAsync(resolvedSchemaPath, "utf-8");
    if (existingSchema !== bundledSchema) {
      reportDiagnostic(reporter, "warning", `Manifest $schema points elsewhere and differs from bundled schema: ${schemaRef}`);
    }
    return;
  }

  if (fileExists(managedSchemaPath)) {
    const existingSchema = await readTextFileAsync(managedSchemaPath, "utf-8");
    if (existingSchema === bundledSchema) {
      return;
    }
  }

  await ensureDir(path.dirname(managedSchemaPath));
  await writeTextFile(managedSchemaPath, bundledSchema, "utf-8");
  const message = `Synced manifest schema: ${managedSchemaPath}`;
  reporter.message({
    type: "comment",
    data: {
      message,
    },
    humanReadable: () => cons.info(message),
  });
}

function logCartStats(assemblyOutput: AssembleOutputResult, reporter: BuildReporter): void {
  const cartUsage = buildCartUsage(
    assemblyOutput.chunks.map((chunk) => ({
      chunkType: chunk.chunkType,
      bank: chunk.bank,
      size: chunk.data.length,
    })),
    assemblyOutput.output.length,
  );
  const cartStatsLines = formatCartUsageLines(cartUsage, "");
  if (cartStatsLines.length === 0) {
    return;
  }
  reporter.message({
    type: "cart.usage",
    data: cartUsage,
    humanReadable: () => {
      cons.h1(cartStatsLines[0]);
      for (const line of cartStatsLines.slice(1)) {
        cons.info(line);
      }
    },
  });
}

function buildCartStatsLines(
  chunks: { chunkType: string; bank: number; size: number }[],
  indent: string,
  totalSizeOverride?: number,
): string[] {
  return formatCartUsageLines(buildCartUsage(chunks, totalSizeOverride), indent);
}

function buildCartUsage(
  chunks: { chunkType: string; bank: number; size: number }[],
  totalSizeOverride?: number,
): { chunks: CartChunkUsageEntry[]; totalSizeBytes: number } {
  if (chunks.length === 0) {
    return {
      chunks: [],
      totalSizeBytes: totalSizeOverride ?? 0,
    };
  }

  const sizeByType = new Map<string, number>();
  for (const chunk of chunks) {
    const key = formatChunkKey(chunk.chunkType, chunk.bank);
    sizeByType.set(key, (sizeByType.get(key) || 0) + chunk.size);
  }

  const rows: CartChunkUsageEntry[] = Array.from(sizeByType.entries()).map(([chunkKey, size]) => {
    const { chunkType, bank } = parseChunkKey(chunkKey);
    const info = kTic80CartChunkTypes.coerceByKey(chunkType);
    return {
      chunkType,
      bank,
      sizeBytes: size,
      capacityBytes: info ? info.sizePerBank : null,
    };
  });

  const totalSize = totalSizeOverride ?? chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  return {
    chunks: rows,
    totalSizeBytes: totalSize,
  };
}

function formatCartUsageLines(
  usage: { chunks: CartChunkUsageEntry[]; totalSizeBytes: number },
  indent: string,
): string[] {
  if (usage.chunks.length === 0) {
    return [];
  }

  const labelWidth = Math.max(...usage.chunks.map((row) => formatChunkKey(row.chunkType, row.bank).length), 5);
  const sizeWidth = Math.max(...usage.chunks.map((row) => formatBytes(row.sizeBytes).length), 5);
  const capWidth = Math.max(
    ...usage.chunks.map((row) => (row.capacityBytes !== null ? formatBytes(row.capacityBytes).length : 3)),
    3,
  );

  const lines: string[] = [];
  lines.push(`${indent}Chunk usage:`);
  for (const row of usage.chunks) {
    const label = formatChunkKey(row.chunkType, row.bank).padEnd(labelWidth, " ");
    const sizeStr = formatBytes(row.sizeBytes).padStart(sizeWidth, " ");
    const capStrRaw = row.capacityBytes !== null ? formatBytes(row.capacityBytes) : "n/a";
    const capStr = capStrRaw.padStart(capWidth, " ");
    const meter = row.capacityBytes !== null ? formatUsageMeter(row.sizeBytes, row.capacityBytes) : "";
    const usageText = row.capacityBytes !== null ? `${meter} ${formatPercent(row.sizeBytes, row.capacityBytes)}` : "";
    lines.push(`${indent}  ${label}  ${sizeStr} / ${capStr}${usageText ? " " + usageText : ""}`);
  }
  lines.push(`${indent}Total cart size: ${formatBytes(usage.totalSizeBytes)}`);
  return lines;
}

function warnDeprecatedChunks(assemblyOutput: AssembleOutputResult, reporter: BuildReporter): void {
  const warned = new Set<string>();
  for (const chunk of assemblyOutput.chunks) {
    const info = kTic80CartChunkTypes.coerceByKey(chunk.chunkType);
    if (!info || !info.deprecated) {
      continue;
    }
    const key = formatChunkKey(chunk.chunkType, chunk.bank);
    if (warned.has(key)) {
      continue;
    }
    warned.add(key);
    reportDiagnostic(reporter, "warning", `Deprecated chunk emitted: ${key}`);
  }
}

function warnNonstandardCodeExtensions(assemblyOutput: AssembleOutputResult, reporter: BuildReporter): void {
  const nativeCodeBankCount = kTic80CartChunkTypes.byKey.CODE.bankCount;
  const extendedCodeBank = assemblyOutput.chunks
    .filter((chunk) => chunk.chunkType === "CODE" && chunk.bank >= nativeCodeBankCount)
    .reduce((maxBank, chunk) => Math.max(maxBank, chunk.bank), -1);
  if (extendedCodeBank >= 0) {
    reportDiagnostic(
      reporter,
      "warning",
      `Non-standard TIC-80 extension used: CODE emits bank ${extendedCodeBank}. Stock TIC-80 supports CODE banks 0..${nativeCodeBankCount - 1
      }; this cart requires the private TIC-80 build.`,
    );
  }

  const nativeCompressedBankCount = kTic80CartChunkTypes.byKey.CODE_COMPRESSED.bankCount;
  const compressedCodeChunks = assemblyOutput.chunks.filter(
    (chunk) => chunk.chunkType === "CODE_COMPRESSED" && chunk.bank >= nativeCompressedBankCount,
  );
  if (compressedCodeChunks.length === 0) {
    return;
  }
  const maxCompressedBank = compressedCodeChunks.reduce((maxBank, chunk) => Math.max(maxBank, chunk.bank), -1);
  reportDiagnostic(
    reporter,
    "warning",
    `Non-standard TIC-80 extension used: CODE_COMPRESSED emits bank ${maxCompressedBank}. Stock TIC-80 supports one CODE_COMPRESSED chunk; this cart requires the private TIC-80 build.`,
  );
}

type LuaCodeAssemblyRequest = {
  chunkType: Tic80CartChunkTypeKey;
  codeOptions?: CodeAssemblyOptions;
};

type LuaCompressedCodeOutput = {
  bytes: Uint8Array;
  compressionMode: string;
  multiBankCompressedCode: boolean;
};

function getLuaCodeAssemblyRequests(project: TicbuildProject, identifier: string): LuaCodeAssemblyRequest[] {
  const requests: LuaCodeAssemblyRequest[] = [];
  for (const block of project.resolvedCore.manifest.assembly.blocks) {
    const assetRef = block.asset as AssetReference;
    if (assetRef.import !== identifier) {
      continue;
    }
    const requestedChunks = block.chunks || ["CODE"];
    for (const chunkType of requestedChunks) {
      if (chunkType === "CODE" || chunkType === "CODE_COMPRESSED") {
        requests.push({
          chunkType,
          codeOptions: block.code,
        });
      }
    }
  }
  return requests;
}

async function getLuaCompressedCodeOutputs(
  project: TicbuildProject,
  resource: LuaCodeResource,
  codeRequests: LuaCodeAssemblyRequest[],
): Promise<LuaCompressedCodeOutput[]> {
  const outputs: LuaCompressedCodeOutput[] = [];
  const seenModes = new Set<string>();
  for (const request of codeRequests) {
    if (request.chunkType !== "CODE_COMPRESSED") {
      continue;
    }
    const compressionMode = request.codeOptions?.compressionMode ?? "default";
    const multiBankCompressedCode = request.codeOptions?.multiBankCompressedCode === true;
    const outputKey = `${compressionMode}:${multiBankCompressedCode ? "multi" : "single"}`;
    if (seenModes.has(outputKey)) {
      continue;
    }
    seenModes.add(outputKey);
    const view = resource.getView(project.resolvedCore, ["CODE_COMPRESSED"]);
    const bytes = await view.getDataForChunk(project.resolvedCore, "CODE_COMPRESSED", request.codeOptions);
    outputs.push({ bytes, compressionMode, multiBankCompressedCode });
  }
  return outputs;
}

function logLuaCodeSize(
  reporter: BuildReporter,
  identifier: string,
  stats: LuaCodeSizeStats,
  codeRequests: LuaCodeAssemblyRequest[],
  compressedOutputs: LuaCompressedCodeOutput[],
): void {
  const report = buildLuaCodeSizeReport(identifier, stats, codeRequests, compressedOutputs);
  if (!report) {
    return;
  }
  reporter.message({
    type: "lua.codeSize",
    data: {
      importName: identifier,
      chunks: report.chunks,
    },
    humanReadable: () => {
      cons.h1(report.lines[0]);
      for (const line of report.lines.slice(1)) {
        cons.info(line);
      }
    },
  });
}

function buildLuaCodeSizeReport(
  identifier: string,
  stats: LuaCodeSizeStats,
  codeRequests: LuaCodeAssemblyRequest[],
  compressedOutputs: LuaCompressedCodeOutput[],
): { lines: string[]; chunks: LuaCodeSizeEntry[] } | undefined {
  if (codeRequests.length === 0) {
    return undefined;
  }

  const codeInfo = kTic80CartChunkTypes.byKey.CODE;
  const compressedInfo = kTic80CartChunkTypes.byKey.CODE_COMPRESSED;
  const extendedCodeBanks = codeRequests.some(
    (request) => request.chunkType === "CODE" && request.codeOptions?.extendedCodeBanks === true,
  );
  const codeBankLimit = extendedCodeBanks ? kTic80ExtendedCodeBankCount : codeInfo.bankCount;
  const codeCapacity = codeInfo.sizePerBank * codeBankLimit;
  const codeBankCount = Math.max(1, Math.ceil(stats.minifiedBytes / codeInfo.sizePerBank));
  let codeBankNote = `${codeBankCount > codeBankLimit ? "requires" : "uses"} ${codeBankCount} ${codeBankCount === 1 ? "bank" : "banks"
    } / ${codeBankLimit}`;
  if (!extendedCodeBanks && codeBankCount > codeInfo.bankCount && codeBankCount <= kTic80ExtendedCodeBankCount) {
    codeBankNote += `; enable code.extendedCodeBanks for private TIC-80`;
  } else if (extendedCodeBanks && codeBankCount > codeInfo.bankCount) {
    codeBankNote += `; non-standard, stock TIC-80 max ${codeInfo.bankCount}`;
  }

  const rows: Array<LuaCodeSizeEntry & { label: string; note: string }> = [
    {
      chunkType: "CODE",
      label: "CODE",
      sizeBytes: stats.minifiedBytes,
      capacityBytes: codeCapacity,
      banksUsed: codeBankCount,
      banksAvailable: codeBankLimit,
      note: codeBankNote,
    },
    ...compressedOutputs.map((output) => {
      const compressedBankLimit = output.multiBankCompressedCode
        ? kTic80ExtendedCodeBankCount
        : compressedInfo.bankCount;
      const compressedCapacity = compressedInfo.sizePerBank * compressedBankLimit;
      const compressedBankCount = Math.max(1, Math.ceil(output.bytes.length / compressedInfo.sizePerBank));
      let compressedBankNote = `${output.compressionMode} zlib output; ${compressedBankCount > compressedBankLimit ? "requires" : "uses"
        } ${compressedBankCount} ${compressedBankCount === 1 ? "bank" : "banks"} / ${compressedBankLimit}`;
      if (
        !output.multiBankCompressedCode &&
        compressedBankCount > compressedInfo.bankCount &&
        compressedBankCount <= kTic80ExtendedCodeBankCount
      ) {
        compressedBankNote += `; enable code.multiBankCompressedCode for private TIC-80`;
      } else if (output.multiBankCompressedCode && compressedBankCount > compressedInfo.bankCount) {
        compressedBankNote += `; non-standard, stock TIC-80 max ${compressedInfo.bankCount}`;
      }
      return {
        chunkType: "CODE_COMPRESSED" as const,
        label: "CODE_COMPRESSED",
        sizeBytes: output.bytes.length,
        capacityBytes: compressedCapacity,
        banksUsed: compressedBankCount,
        banksAvailable: compressedBankLimit,
        compressionMode: output.compressionMode,
        note: compressedBankNote,
      };
    }),
  ];

  const labelWidth = Math.max(...rows.map((row) => row.label.length));
  const sizeWidth = Math.max(...rows.map((row) => formatBytes(row.sizeBytes).length));
  const capWidth = Math.max(...rows.map((row) => formatBytes(row.capacityBytes).length));
  const lines = [`Lua code size: ${identifier}`];
  for (const row of rows) {
    const label = row.label.padEnd(labelWidth, " ");
    const size = formatBytes(row.sizeBytes).padStart(sizeWidth, " ");
    const capacity = formatBytes(row.capacityBytes).padStart(capWidth, " ");
    lines.push(`  ${label}  ${size} / ${capacity}  ${row.note}`);
  }
  return {
    lines,
    chunks: rows.map(({ label, note, ...entry }) => entry),
  };
}

// warn if any assembly blocks specify explicit banks for CODE chunks.
// generally you let ticbuild split code across multiple banks automatically.
// so specifying banks is weird, but technically allowed.
function warnExplicitCodeBanks(project: TicbuildProject, reporter: BuildReporter): void {
  if (!project.resourceMgr) {
    return;
  }

  for (const block of project.resolvedCore.manifest.assembly.blocks) {
    if (block.bank === undefined) {
      continue;
    }

    let emitsCode = false;
    if (block.chunks) {
      emitsCode = block.chunks.includes("CODE");
    } else {
      const assetRef = block.asset as AssetReference;
      const resource = project.resourceMgr.items.get(assetRef.import);
      if (!resource) {
        continue;
      }
      try {
        const view = resource.getView(project.resolvedCore, block.chunks);
        emitsCode = view.getParallelChunkTypes().includes("CODE");
      } catch {
        emitsCode = false;
      }
    }

    if (!emitsCode) {
      continue;
    }

    const key = formatChunkKey("CODE", block.bank);
    reportDiagnostic(reporter, "warning", `Explicit bank specified for CODE chunk: ${key}`);
  }
}

function formatChunkKey(chunkType: string, bank: number): string {
  return bank === 0 ? chunkType : `${chunkType}#${bank}`;
}

function parseChunkKey(chunkKey: string): { chunkType: string; bank: number } {
  const hashIndex = chunkKey.lastIndexOf("#");
  if (hashIndex < 0) {
    return { chunkType: chunkKey, bank: 0 };
  }
  const chunkType = chunkKey.slice(0, hashIndex);
  const bankText = chunkKey.slice(hashIndex + 1);
  const bank = Number.parseInt(bankText, 10);
  return { chunkType, bank: Number.isFinite(bank) ? bank : 0 };
}

/*
other options

[##########----------]

[■■■■■■■□□□]

|███████████████-----|

█████▒▒▒▒▒ 50%

［ ￭￭￭￭￭･････ ］


*/
function formatUsageMeter(size: number, capacity: number, width: number = 20): string {
  const ratio = capacity > 0 ? Math.min(size / capacity, 1) : 0;
  const filled = Math.ceil(ratio * width); // round up to show progress even for small sizes
  const bar = "#".repeat(filled) + "-".repeat(width - filled);
  return `[${bar}]`;
}

function formatPercent(size: number, capacity: number): string {
  if (capacity <= 0) return "";
  const pct = ((size / capacity) * 100).toFixed(1);
  return `${pct}%`;
}
