import { AssembleOutputResult, TicbuildProject } from "../backend/project";
import { LuaCodeResource } from "../backend/importers/LuaCodeImporter";
import { AssetReference } from "../backend/manifestTypes";
import * as cons from "../utils/console";
import { ensureDir, writeBinaryFile, writeTextFile } from "../utils/fileSystem";
import { formatBytes } from "../utils/utils";
import { kTic80CartChunkTypes } from "../utils/tic80/tic80";
import { CommandLineOptions, parseBuildOptions } from "./parseOptions";
import { writeFileSync } from "node:fs";

export async function buildCore(manifestPath?: string, options?: CommandLineOptions): Promise<void> {
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

  cons.h1("Project loaded from:");
  cons.info(`  ${project.resolvedCore.manifestPath}`);
  //cons.dim(`  (loaded in ${loadDuration}ms)`);

  // output variables
  const variablesOutputPath = project.resolvedCore.resolveObjPath("variables.json");
  const variablesObj: Record<string, string> = {};
  for (const [varName, varInfo] of project.resolvedCore.allVariables.entries()) {
    variablesObj[varName] = varInfo.resolvedValue;
  }
  await writeTextFile(variablesOutputPath, JSON.stringify(variablesObj, null, 2), "utf-8");

  const outputPath = project.resolvedCore.resolveObjPath("resolvedManifest.ticbuild.jsonc");
  cons.h1("Outputting resolved manifest to");
  cons.info(`  ${outputPath}`);

  const json = JSON.stringify(project.resolvedCore.manifest, null, 2);
  const objDirPath = await project.resolvedCore.resolveObjPath();
  await ensureDir(objDirPath);
  await writeTextFile(outputPath, json, "utf-8");

  // import resources.
  cons.h1("Loading imported resources...");
  const importStartTime = Date.now();
  await project.loadImports();
  const importDuration = Date.now() - importStartTime;
  //cons.dim(`  (imported in ${importDuration}ms)`);

  warnExplicitCodeBanks(project);

  const importsLogPath = project.resolvedCore.resolveObjPath("imports.log");
  const importsLines: string[] = [];
  for (const [identifier, resource] of project.resourceMgr!.items.entries()) {
    importsLines.push(`Imported resource: ${identifier} (${resource.constructor.name})`);
    importsLines.push(`  deps:`);
    for (const dep of resource.getDependencyList()) {
      importsLines.push(`    - ${dep.path} (${dep.reason})`);
    }

    if (resource instanceof LuaCodeResource) {
      const stats = resource.getCodeSizeStats(project.resolvedCore);
      importsLines.push(`  Code stats:`);
      importsLines.push(`    Input        : ${formatBytes(stats.inputBytes)}`);
      importsLines.push(`    Preprocessed : ${formatBytes(stats.preprocessedBytes)}`);
      importsLines.push(`    Minified     : ${formatBytes(stats.minifiedBytes)}`);
      importsLines.push(`    Compressed   : ${formatBytes(stats.compressedBytes)}`);

      const artifacts = resource.getCodeArtifacts(project.resolvedCore);
      const preprocessedPath = project.resolvedCore.resolveObjPath(`${identifier}.01.preprocessed.lua`);
      const minifiedPath = project.resolvedCore.resolveObjPath(`${identifier}.02.minified.lua`);
      const compressedPath = project.resolvedCore.resolveObjPath(`${identifier}.03.compressed.bin`);

      await writeTextFile(preprocessedPath, artifacts.preprocessedSource, "utf-8");
      await writeTextFile(minifiedPath, artifacts.minifiedSource, "utf-8");
      await writeBinaryFile(compressedPath, artifacts.compressedBytes);

      importsLines.push(`    Wrote: ${preprocessedPath}`);
      importsLines.push(`    Wrote: ${minifiedPath}`);
      importsLines.push(`    Wrote: ${compressedPath}`);
    }
    importsLines.push("");
  }
  await writeTextFile(importsLogPath, importsLines.join("\n"), "utf-8");

  // assemble output.
  const assembleStartTime = Date.now();
  const assemblyOutput = await project.assembleOutput();
  const { output, chunks } = assemblyOutput;
  const assembleDuration = Date.now() - assembleStartTime;

  warnDeprecatedChunks(assemblyOutput);

  const outDir = await project.resolvedCore.resolveBinPath();
  await ensureDir(outDir);
  const outputFilePath = project.resolvedCore.getOutputFilePath();
  //cons.h1("Writing output TIC-80 cartridge to:");

  const writeStartTime = Date.now();
  await writeBinaryFile(outputFilePath, output);
  const writeDuration = Date.now() - writeStartTime;

  logCartStats(assemblyOutput);

  const totalDuration = Date.now() - buildStartTime;
  cons.success(`Build completed successfully in ${totalDuration}ms.`);
  cons.info(`  Log : ${logFilePath}`);
  cons.info(`  Cart: ${outputFilePath}`);
}

function logCartStats(assemblyOutput: AssembleOutputResult): void {
  const sizeByType = new Map<string, number>();
  for (const chunk of assemblyOutput.chunks) {
    const key = formatChunkKey(chunk.chunkType, chunk.bank);
    sizeByType.set(key, (sizeByType.get(key) || 0) + chunk.data.length);
  }

  if (sizeByType.size === 0) {
    return;
  }

  const rows = Array.from(sizeByType.entries()).map(([chunkKey, size]) => {
    const { chunkType, bank } = parseChunkKey(chunkKey);
    const info = kTic80CartChunkTypes.coerceByKey(chunkType);
    const capacity = info ? info.sizePerBank : 0;
    return {
      chunkKey,
      size,
      capacity,
    };
  });

  const labelWidth = Math.max(...rows.map((r) => r.chunkKey.length), 5);
  const sizeWidth = Math.max(...rows.map((r) => formatBytes(r.size).length), 5);
  const capWidth = Math.max(...rows.map((r) => (r.capacity > 0 ? formatBytes(r.capacity).length : 3)), 3);
  cons.h1("Chunk usage:");
  for (const row of rows) {
    const label = row.chunkKey.padEnd(labelWidth, " ");
    const sizeStr = formatBytes(row.size).padStart(sizeWidth, " ");
    const capStrRaw = row.capacity > 0 ? formatBytes(row.capacity) : "n/a";
    const capStr = capStrRaw.padStart(capWidth, " ");
    const meter = row.capacity > 0 ? formatUsageMeter(row.size, row.capacity) : "";
    const usage = row.capacity > 0 ? `${meter} ${formatPercent(row.size, row.capacity)}` : "";
    cons.info(`  ${label}  ${sizeStr} / ${capStr}${usage ? " " + usage : ""}`);
  }

  // and show total cart stats
  cons.info(`Total cart size: ${formatBytes(assemblyOutput.output.length)}`);
}

function warnDeprecatedChunks(assemblyOutput: AssembleOutputResult): void {
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
    cons.warning(`Deprecated chunk emitted: ${key}`);
  }
}

// warn if any assembly blocks specify explicit banks for CODE chunks.
// generally you let ticbuild split code across multiple banks automatically.
// so specifying banks is weird, but technically allowed.
function warnExplicitCodeBanks(project: TicbuildProject): void {
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
    cons.warning(`Explicit bank specified for CODE chunk: ${key}`);
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
