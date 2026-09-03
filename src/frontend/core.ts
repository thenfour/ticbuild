import { AssembleOutputResult, TicbuildProject } from "../backend/project";
import { buildProjectSymbolIndex } from "../backend/symbolIndex";
import { CodeResource, CodeSizeStats } from "../backend/importers/CodeResource";
import { Tic80Resource } from "../backend/importers/tic80CartImporter";
import { AssetReference, CodeAssemblyOptions } from "../backend/manifestTypes";
import { serializeSourceMapV3 } from "../backend/sourceMapV3";
import type { LuaPreprocessorSourceMap } from "../backend/sourceMap";
import * as cons from "../utils/console";
import { getErrorMessage } from "../utils/errorHandling";
import { ensureDir, fileExists, readTextFileAsync, writeBinaryFile, writeTextFile } from "../utils/fileSystem";
import { canonicalizePath } from "../utils/fileSystem";
import { formatBytes } from "../utils/utils";
import { TraceProfiler, TraceScope } from "../utils/traceProfiler";
import { kTic80CartChunkTypes, kTic80ExtendedCodeBankCount, Tic80CartChunkTypeKey } from "../utils/tic80/tic80";
import type { AliasPassReport, AliasRuleName } from "../utils/lua/lua_alias_shared";
import { CommandLineOptions, parseBuildOptions } from "./parseOptions";
import { appendFileSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import {
  BuildReporter,
  CartChunkUsageEntry,
  HumanBuildReporter,
  JsonlBuildReporter,
  LuaCodeSizeEntry,
  buildReportFileName,
  buildTraceFileName,
  reportCapturedConsoleMessage,
} from "./buildReporter";

type BuildReportSession = {
  reporter: BuildReporter;
  initialize: (filePath: string) => void;
  reportFailure: (error: unknown, tracePath?: string) => void;
  dispose: () => void;
};

export type BuildCoreResult = {
  project: TicbuildProject;
};


export function GetFinalLuaArtifactFileLeaf(name: string): string {
  return `${name}.02.minified.lua`;
}

function createBuildReportSession(selectedReporter: BuildReporter): BuildReportSession {
  const pendingBuildReportLines: string[] = [];
  let buildReportFilePath: string | undefined;
  const archivedReporter = new JsonlBuildReporter((line) => {
    if (buildReportFilePath === undefined) {
      pendingBuildReportLines.push(line);
      return;
    }
    appendFileSync(buildReportFilePath, `${line}\n`, "utf-8");
  });
  let renderingSelectedReporter = false;
  const reporter: BuildReporter = {
    name: selectedReporter.name,
    message: (message) => {
      archivedReporter.message(message);
      renderingSelectedReporter = true;
      try {
        selectedReporter.message(message);
      } finally {
        renderingSelectedReporter = false;
      }
    },
  };

  const previousConsoleMessageSink = cons.getConsoleMessageSink();
  const previousConsoleMessageObserver = cons.getConsoleMessageObserver();
  const captureLegacyConsoleMessage = (level: cons.ConsoleMessageLevel, message: string): void => {
    if (!renderingSelectedReporter) {
      reportCapturedConsoleMessage(reporter, level, message);
    }
  };

  if (selectedReporter.name === "jsonl") {
    cons.setConsoleMessageSink(captureLegacyConsoleMessage);
  } else {
    cons.setConsoleMessageObserver((level, message) => {
      previousConsoleMessageObserver?.(level, message);
      captureLegacyConsoleMessage(level, message);
    });
  }

  return {
    reporter,
    initialize: (filePath) => {
      writeFileSync(
        filePath,
        pendingBuildReportLines.length === 0 ? "" : `${pendingBuildReportLines.join("\n")}\n`,
        "utf-8",
      );
      pendingBuildReportLines.length = 0;
      buildReportFilePath = filePath;
    },
    reportFailure: (error, tracePath) => {
      if (buildReportFilePath === undefined) {
        return;
      }
      try {
        archivedReporter.message({
          type: "build.failed",
          data: {
            message: getErrorMessage(error),
            tracePath,
          },
          humanReadable: () => undefined,
        });
      } catch {
        // Preserve the original build failure if the archival write also fails.
      }
    },
    dispose: () => {
      cons.setConsoleMessageSink(previousConsoleMessageSink);
      cons.setConsoleMessageObserver(previousConsoleMessageObserver);
    },
  };
}

//////////////////////////////////////////////////////////////////////////////////////////
// wrapper around executeBuildCore that handles reporting, profiling, and trace file writing
export async function buildCore(
  manifestPath?: string,
  options?: CommandLineOptions,
  reporter: BuildReporter = new HumanBuildReporter(),
): Promise<BuildCoreResult> {
  const reportSession = createBuildReportSession(reporter);
  const profiler = new TraceProfiler();

  // forward declarations because we need to work cross-scope a lot here
  let traceFilePath: string | undefined;
  let writtenTraceFilePath: string | undefined;
  let executionResult: ExecuteBuildCoreResult | undefined;
  let failure: { error: unknown } | undefined;
  let totalDurationMs: number = 0;

  try {
    {
      using scope = profiler.mainTrack.enter("ticbuild build", { category: "build" });
      try {
        executionResult = await executeBuildCore(
          manifestPath,
          options,
          reportSession.reporter,
          reportSession.initialize,
          profiler,
          scope,
          (filePath) => { traceFilePath = filePath; }, // capture this even if an exception is thrown.
        );
        scope.setArgs({ outcome: "succeeded" });
      } catch (error) {
        scope.setArgs({ outcome: "failed" });
        failure = { error };
      }
      totalDurationMs = Math.round(profiler.getSpanDurationMs(scope));
    }

    if (traceFilePath) {
      try {
        await writeTextFile(traceFilePath, profiler.serialize(), "utf-8");
        writtenTraceFilePath = traceFilePath;
      } catch (error) {
        failure ??= { error };
      }
    }

    if (failure) {
      reportSession.reportFailure(failure.error, writtenTraceFilePath);
      throw failure.error;
    }
    if (!executionResult || !writtenTraceFilePath) {
      throw new Error("Build completed without initializing its output artifacts");
    }

    const completedBuild = executionResult;
    const completedTracePath = writtenTraceFilePath;
    reportSession.reporter.message({
      type: "build.completed",
      data: {
        durationMs: totalDurationMs,
        logPath: completedBuild.logFilePath,
        cartPath: completedBuild.outputFilePath,
        tracePath: completedTracePath,
      },
      humanReadable: () => {
        cons.success(`Build completed successfully in ${totalDurationMs}ms.`);
        cons.info(`  Log  : ${completedBuild.logFilePath}`);
        cons.info(`  Trace: ${completedTracePath}`);
        cons.info(`  Cart : ${completedBuild.outputFilePath}`);
      },
    });
    return { project: completedBuild.project };
  } finally {
    reportSession.dispose();
  }
}

type ExecuteBuildCoreResult = BuildCoreResult & {
  logFilePath: string;
  outputFilePath: string;
};

//////////////////////////////////////////////////////////////////////////////////////////
async function executeBuildCore(
  manifestPath: string | undefined,
  options: CommandLineOptions | undefined,
  reporter: BuildReporter,
  initializeBuildReport: (filePath: string) => void,
  profiler: TraceProfiler,
  buildScope: TraceScope,
  initializeBuildTrace: (filePath: string) => void,
): Promise<ExecuteBuildCoreResult> {
  const projectLoadOptions = parseBuildOptions(manifestPath, options);

  const project = buildScope.profileSync(
    "Load and resolve manifest",
    { category: "project" },
    () => TicbuildProject.loadFromManifest(projectLoadOptions),
  );

  buildScope.setArgs({
    projectName: project.resolvedCore.manifest.project.name,
    buildConfiguration: project.resolvedCore.selectedBuildConfig,
  });

  // Set up build log and structured report files.
  const objDir = await project.resolvedCore.resolveObjPath();
  await ensureDir(objDir);
  const logFilePath = project.resolvedCore.resolveObjPath(`build.log`);
  initializeBuildReport(project.resolvedCore.resolveObjPath(buildReportFileName));
  initializeBuildTrace(project.resolvedCore.resolveObjPath(buildTraceFileName));

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

  await buildScope.profileAsync("Prepare build workspace", { category: "project" }, async () => {
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
  });

  // import resources.
  reporter.message({
    type: "comment",
    data: {
      message: "Loading imported resources...",
    },
    humanReadable: () => cons.h1("Loading imported resources..."),
  });

  await buildScope.profileAsync("Process imports", { category: "imports" }, async (scope) => {
    await project.loadImports(profiler, scope);
  });

  warnExplicitCodeBanks(project, reporter);

  await buildScope.profileAsync("Produce development artifacts", { category: "development artifacts" }, async (scope) => {
    await writeDevelopmentArtifacts(project, reporter, profiler, scope);
  });

  // assemble output.
  const assemblyOutput = await buildScope.profileAsync(
    "Assemble cartridge",
    { category: "assembly" },
    (scope) => project.assembleOutput(profiler, scope),
  );

  warnDeprecatedChunks(assemblyOutput, reporter);
  warnNonstandardCodeExtensions(assemblyOutput, reporter);

  const outDir = await project.resolvedCore.resolveBinPath();
  await ensureDir(outDir);
  const outputFilePath = project.resolvedCore.getOutputFilePath();
  //cons.h1("Writing output TIC-80 cartridge to:");

  await buildScope.profileAsync(
    "Write cartridge",
    {
      category: "filesystem",
      args: { sizeBytes: assemblyOutput.output.length },
    },
    () => writeBinaryFile(outputFilePath, assemblyOutput.output),
  );

  logCartStats(assemblyOutput, reporter);

  return { project, logFilePath, outputFilePath };
}

async function writeDevelopmentArtifacts(
  project: TicbuildProject,
  reporter: BuildReporter,
  profiler: TraceProfiler,
  parentScope: TraceScope,
): Promise<void> {
  const importsLogPath = project.resolvedCore.resolveObjPath("imports.log");
  const importsLines: string[] = [];
  const resourceManager = project.resourceMgr!;
  for (const identifier of resourceManager.getDeclaredImportNames()) {
    const resource = resourceManager.items.get(identifier);
    if (!resource) {
      importsLines.push(
        resourceManager.isImportUsed(identifier)
          ? `Imported resource: ${identifier} (source consumed on demand)`
          : `Imported resource: ${identifier} (unused)`,
      );
      importsLines.push("");
      continue;
    }
    importsLines.push(`Imported resource: ${identifier} (${resource.constructor.name})`);
    importsLines.push(`  deps:`);
    for (const dep of resource.getDependencyList()) {
      importsLines.push(`    - ${dep.path} (${dep.reason})`);
    }

    if (resource instanceof CodeResource) {
      if (resource.hasCompletedCodePipeline()) {
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
        reportLuaMinification(reporter, identifier, artifacts.minificationReport);
        const writtenPaths = [
          ...await writeLuaStageArtifact(
            project,
            parentScope,
            identifier,
            "generated",
            artifacts.inputSource,
            artifacts.inputSourceMap,
          ),
          ...await writeLuaStageArtifact(
            project,
            parentScope,
            identifier,
            "preprocessed",
            artifacts.preprocessedSource,
            artifacts.preprocessedSourceMap,
          ),
          ...await writeLuaStageArtifact(
            project,
            parentScope,
            identifier,
            "minified",
            artifacts.minifiedSource,
            artifacts.minifiedSourceMap,
          ),
        ];
        for (const writtenPath of writtenPaths) {
          importsLines.push(`    Wrote: ${writtenPath}`);
        }
        appendLuaMinificationLog(importsLines, artifacts.minificationReport);
        if (compressedOutputs.length > 0) {
          const compressedPath = project.resolvedCore.resolveObjPath(`${identifier}.03.compressed.bin`);
          await writeBinaryFile(compressedPath, compressedOutputs[0].bytes);
          importsLines.push(`    Wrote: ${compressedPath}`);
        }
      } else if (resource.hasGeneratedLuaSource()) {
        const generated = await resource.getGeneratedLuaSource(project.resolvedCore);
        const writtenPaths = await writeLuaStageArtifact(
          project,
          parentScope,
          identifier,
          "generated",
          generated.source,
          generated.sourceMap,
        );
        for (const writtenPath of writtenPaths) {
          importsLines.push(`    Wrote: ${writtenPath}`);
        }
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
  const { symbolIndex, durationMs } = await parentScope.profileAsync("Build symbol index", {}, async (scope) => {
    const symbolIndex = await buildProjectSymbolIndex(project.resolvedCore, resourceManager);
    return {
      symbolIndex,
      durationMs: Math.round(profiler.getSpanDurationMs(scope)),
    };
  });
  importsLines.push(`Built symbol index in ${durationMs}ms.`);
  const symbolIndexPath = project.resolvedCore.resolveObjPath("symbols.index.json");
  await writeTextFile(symbolIndexPath, JSON.stringify(symbolIndex, null, 2), "utf-8");
  importsLines.push(`Symbol index: ${symbolIndexPath}`);

  await writeTextFile(importsLogPath, importsLines.join("\n"), "utf-8");
}

async function writeLuaStageArtifact(
  project: TicbuildProject,
  parentScope: TraceScope,
  identifier: string,
  stage: "generated" | "preprocessed" | "minified",
  source: string,
  sourceMap: LuaPreprocessorSourceMap,
): Promise<[string, string]> {
  const fileLeaf = stage === "generated"
    ? `${identifier}.00.generated.lua`
    : stage === "preprocessed"
      ? `${identifier}.01.preprocessed.lua`
      : GetFinalLuaArtifactFileLeaf(identifier);
  const filePath = project.resolvedCore.resolveObjPath(fileLeaf);
  const mapPath = `${filePath}.map`;
  await writeTextFile(filePath, source, "utf-8");
  await writeLuaSourceMapArtifact(
    parentScope,
    identifier,
    stage,
    sourceMap,
    source,
    filePath,
    mapPath,
  );
  return [filePath, mapPath];
}

async function writeLuaSourceMapArtifact(
  parentScope: TraceScope,
  resource: string,
  stage: "generated" | "preprocessed" | "minified",
  sourceMap: LuaPreprocessorSourceMap,
  source: string,
  generatedPath: string,
  mapPath: string,
): Promise<void> {
  const serialized = parentScope.profileSync(
    "Serialize Lua source map",
    {
      category: "source maps",
      args: {
        resource,
        stage,
        sourceCharacters: source.length,
        sourceMapSegments: sourceMap.segments.length,
        sourceFiles: Object.keys(sourceMap.sources ?? {}).length,
      },
    },
    (scope) => {
      const output = serializeSourceMapV3(sourceMap, source, generatedPath, mapPath);
      scope.setArgs({ outputCharacters: output.length });
      return output;
    },
  );
  await parentScope.profileAsync(
    "Write Lua source map",
    {
      category: "filesystem",
      args: {
        resource,
        stage,
        outputCharacters: serialized.length,
      },
    },
    () => writeTextFile(mapPath, serialized, "utf-8"),
  );
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

function omittedAliasSummary(report: AliasPassReport["constrainedFunctions"][number]): string {
  const ruleNames: AliasRuleName[] = ["aliasLiterals", "aliasRepeatedExpressions"];
  return ruleNames
    .filter((rule) => report.rules[rule].omitted > 0)
    .map((rule) => `${rule}=${report.rules[rule].omitted}`)
    .join(", ");
}

function reportLuaMinification(reporter: BuildReporter, importName: string, report: AliasPassReport): void {
  if (report.constrainedFunctions.length === 0) return;

  reporter.message({
    type: "lua.minification",
    data: {
      importName,
      localLimit: report.localLimit,
      constrainedFunctions: report.constrainedFunctions,
    },
    humanReadable: () => {
      report.constrainedFunctions.forEach((fn) => {
        const omittedBytes =
          fn.rules.aliasLiterals.estimatedBytesOmitted +
          fn.rules.aliasRepeatedExpressions.estimatedBytesOmitted;
        cons.warning(
          `Lua minification local budget reached in ${fn.functionName} ` +
          `(minifier input line ${fn.sourceLine}): ${fn.peakActiveLocals}/${fn.localLimit} active locals; ` +
          `omitted ${omittedAliasSummary(fn)} (${omittedBytes} estimated bytes not saved).`,
        );
        cons.info(
          `  Peak composition: ${fn.existingLocalsAtPeak} existing, ${fn.generatedLocalsAtPeak} generated. ` +
          `Reduce simultaneously active locals or narrow their scopes to admit more aliases.`,
        );
      });
    },
  });
}

function appendLuaMinificationLog(lines: string[], report: AliasPassReport): void {
  if (report.constrainedFunctions.length === 0) return;

  lines.push(`  Lua minification local budget:`);
  report.constrainedFunctions.forEach((fn) => {
    const omittedBytes =
      fn.rules.aliasLiterals.estimatedBytesOmitted + fn.rules.aliasRepeatedExpressions.estimatedBytesOmitted;
    lines.push(
      `    ${fn.functionName} (line ${fn.sourceLine}): peak ${fn.peakActiveLocals}/${fn.localLimit}; ` +
      `existing ${fn.existingLocalsAtPeak}; generated ${fn.generatedLocalsAtPeak}; ` +
      `omitted ${omittedAliasSummary(fn)}; estimated bytes not saved ${omittedBytes}`,
    );
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
  resource: CodeResource,
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
  stats: CodeSizeStats,
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
  stats: CodeSizeStats,
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

// returns a string like "50.0%" or "100.0%" or "" if capacity is 0
function formatPercent(size: number, capacity: number): string {
  if (capacity <= 0) return "";
  const pct = ((size / capacity) * 100).toFixed(1);
  return `${pct}%`;
}
