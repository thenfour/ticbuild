import { appendFileSync, writeFileSync } from "node:fs";
import { getLuaCodeOutputType } from "../backend/assembly";
import { CodeResource, CodeSizeStats } from "../backend/importers/CodeResource";
import { Tic80Resource } from "../backend/importers/tic80CartImporter";
import { CodeAssemblyOptions } from "../backend/manifestTypes";
import { AssembleOutputResult, TicbuildProject } from "../backend/project";
import { canonicalizeAssetImport } from "../backend/projectCore";
import type { LuaPreprocessorSourceMap } from "../backend/sourceMap";
import { serializeSourceMapV3 } from "../backend/sourceMapV3";
import { buildProjectSymbolIndex } from "../backend/symbolIndex";
import * as cons from "../utils/console";
import { getErrorMessage } from "../utils/errorHandling";
import { ensureDir, writeBinaryFile, writeTextFile } from "../utils/fileSystem";
import type { AliasPassReport, AliasRuleName } from "../utils/lua/lua_alias_shared";
import { formatTic80CartChunkType, kTic80CartChunkTypes, kTic80ExtendedCodeBankCount, Tic80CartChunkTypeKey } from "../utils/tic80/tic80";
import { TraceProfiler, TraceScope } from "../utils/traceProfiler";
import { formatBytes } from "../utils/utils";
import {
  BuildReporter,
  buildReportFileName,
  buildTraceFileName,
  HumanBuildReporter,
  JsonlBuildReporter,
  LuaCodeSizeEntry,
  reportCapturedConsoleMessage,
} from "./buildReporter";
import { buildCartStatsLines, buildCartUsage, formatCartUsageLines, formatChunkKey } from "./cartUsage";
import { CommandLineOptions, parseBuildOptions } from "./parseOptions";

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
    // output variables
    const variablesOutputPath = project.resolvedCore.resolveObjPath("variables.json");
    const variablesObj: Record<string, string> = {};
    for (const [varName, varInfo] of project.resolvedCore.allVariables.entries()) {
      variablesObj[varName] = varInfo.resolvedValue;
    }
    await writeTextFile(variablesOutputPath, JSON.stringify(variablesObj, null, 2), "utf-8");

    const outputPath = project.resolvedCore.resolveObjPath("resolvedManifest.ticbuild.jsonc");

    reporter.message({
      type: "project.buildMode",
      data: {
        mode: project.resolvedCore.selectedBuildConfig,
      },
      humanReadable: () => {
        cons.h1("Using build mode:");
        cons.info(`  ${project.resolvedCore.selectedBuildConfig}`);
      },
    });

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
    await project.loadImports(reporter, profiler, scope);
  });

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
        resource.chunks.map(({ chunkType, bank, data }) => ({
          chunkType: formatTic80CartChunkType(chunkType),
          bank,
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

function logCartStats(assemblyOutput: AssembleOutputResult, reporter: BuildReporter): void {
  const cartUsage = buildCartUsage(
    assemblyOutput.chunks.map((chunk) => ({
      chunkType: formatTic80CartChunkType(chunk.chunkType),
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

function warnDeprecatedChunks(assemblyOutput: AssembleOutputResult, reporter: BuildReporter): void {
  const warned = new Set<string>();
  for (const chunk of assemblyOutput.chunks) {
    const info = kTic80CartChunkTypes.coerceByKey(chunk.chunkType);
    if (!info || !info.deprecated) {
      continue;
    }
    const key = formatChunkKey(formatTic80CartChunkType(chunk.chunkType), chunk.bank);
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
    const assetRef = canonicalizeAssetImport(block.asset);
    if (assetRef.import !== identifier) {
      continue;
    }
    const chunkType = getLuaCodeOutputType(block, assetRef);
    if (chunkType !== undefined) {
      requests.push({ chunkType, codeOptions: block.code });
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
    const bytes = await resource.view.getDataForChunk(project.resolvedCore, "CODE_COMPRESSED", request.codeOptions);
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
