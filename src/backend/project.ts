import * as cons from "../utils/console";
import { AssembleTic80Cart } from "../utils/tic80/cartWriter";
import { kTic80CartChunkTypes, Tic80CartChunk } from "../utils/tic80/tic80";
import { deepMergeObjects } from "../utils/utils";
import { assembleAsset } from "./assembly";
import { ResourceManager } from "./ImportedResourceTypes";
import { loadAllImports } from "./importResources";
import { resolveAndLoadManifest } from "./manifestLoader";
import { AssemblyBlock, kImportKind, Manifest, ResolvedManifest } from "./manifestTypes";
import { calculateVars, canonicalizeAssetImport, deduceImportKindFromPath, TicbuildProjectCore } from "./projectCore";
import { profileAsync, TraceProfiler, TraceScope, TraceTrack } from "../utils/traceProfiler";
import { loadProjectEnvironment, ProjectEnvironment } from "./projectEnvironment";
import { BuildReporter } from "../frontend/buildReporter";

export type TicbuildProjectLoadOptions = {
  manifestPath?: string | undefined;
  buildConfigName?: string | undefined;
  overrideVariables?: Record<string, string>;
  overrideEnvironment?: Record<string, string>;
  ambientEnvironment?: NodeJS.ProcessEnv;
};

export type AssembleOutputResult = {
  output: Uint8Array;
  chunks: Tic80CartChunk[];
};

///////////////////////////////////////////////////////////////////////////////////////////////////
export class TicbuildProject {
  unresolvedCore: TicbuildProjectCore; // core with raw manifest

  // an expression of the raw manifest,
  // - build configuration overrides applied.
  // - defaults applied
  // - inferences made
  // - imports resolved
  // - variables substituted
  resolvedCore: TicbuildProjectCore; // core with resolved manifest

  resourceMgr: ResourceManager | undefined;
  projectEnvironment: ProjectEnvironment;

  static loadFromManifest(options?: TicbuildProjectLoadOptions): TicbuildProject {
    const loadedManifest = resolveAndLoadManifest(options?.manifestPath);
    const projectEnvironment = loadProjectEnvironment(
      loadedManifest.projectDir,
      options?.ambientEnvironment,
      options?.overrideEnvironment,
    );
    return new TicbuildProject(
      loadedManifest.manifest, //
      loadedManifest.filePath,
      loadedManifest.projectDir,
      projectEnvironment,
      options,
    );
  }

  private constructor(
    manifest: Manifest,
    manifestPath: string,
    projectDir: string,
    projectEnvironment: ProjectEnvironment,
    options?: TicbuildProjectLoadOptions,
  ) {
    this.projectEnvironment = projectEnvironment;
    const effectiveBuildConfigName = options?.buildConfigName ?? manifest.buildConfiguration;

    this.unresolvedCore = new TicbuildProjectCore({
      manifest,
      manifestPath,
      projectDir,
      buildConfigName: effectiveBuildConfigName,
      overrideVariables: options?.overrideVariables,
      processEnvironment: projectEnvironment.processEnvironment,
    });

    const resolvedManifest = this.resolveManifest(
      manifestPath,
      projectDir,
      effectiveBuildConfigName,
      options?.overrideVariables,
    );
    this.resolvedCore = new TicbuildProjectCore({
      manifest: resolvedManifest.manifest,
      manifestPath,
      projectDir,
      buildConfigName: resolvedManifest.selectedBuildConfig,
      overrideVariables: options?.overrideVariables,
      processEnvironment: projectEnvironment.processEnvironment,
    });
  }

  private resolveManifest(
    manifestPath: string,
    projectDir: string,
    buildConfigName: string,
    overrideVariables?: Record<string, string>,
  ): ResolvedManifest {
    // avoid mutations
    const resolved: Manifest = this.unresolvedCore.clone().manifest;
    const baseBuildConfigName = this.unresolvedCore.manifest.buildConfiguration;

    if (this.unresolvedCore.manifest.buildConfigurations?.[baseBuildConfigName]) {
      throw new Error(
        `Base build configuration '${baseBuildConfigName}' must not also appear in buildConfigurations`,
      );
    }

    // in this process, avoid handling of specific fields; general behaviors are preferred
    // for maintainability.

    if (buildConfigName !== baseBuildConfigName) {
      const buildConfig = this.unresolvedCore.manifest.buildConfigurations?.[buildConfigName];
      if (!buildConfig) {
        throw new Error(`Build configuration not found: ${buildConfigName}`);
      }

      // for every leaf in project settings, override / add to resolved manifest
      // for example { project: { binDir: "..." } } overrides resolved.project.binDir
      // arrays are considered a leaf value. e.g., { project: { includeDirs: [...] } } substitutes the entire array.
      // we want to avoid handling specific cases; we want generic merge/override behavior.
      deepMergeObjects(resolved, buildConfig);

      // remove defines on null
      for (const [name, value] of Object.entries(buildConfig.preprocessor?.defines ?? {})) {
        if (value === null) {
          delete resolved.preprocessor?.defines?.[name];
        }
      }

      // that makes it theoretically possible to override the assembly.blocks array too,
      // so we need to canonicalize asset references again after applying the build config.
    }

    // there's a special case to handle:
    // assembly.blocks[].asset supports a shorthand form.
    // canonical form:
    //   "asset": { "import": "music-imported-cart", "chunks": ["WAVEFORMS"], "bank": 2 },
    // shorthand:
    //   "asset": "import:music-imported-cart:WAVEFORMS:2",
    for (const block of resolved.assembly.blocks) {
      block.asset = canonicalizeAssetImport(block.asset);
    }

    const calculatedVars = calculateVars(
      resolved,
      manifestPath,
      projectDir,
      buildConfigName,
      overrideVariables,
      this.projectEnvironment.processEnvironment,
    );

    // ensure all imports have "kind" -- deduce if missing.
    for (const importDef of resolved.imports) {
      if (!importDef.kind) {
        if (!importDef.path) {
          throw new Error(`Import ${importDef.name} must specify kind when no path is provided`);
        }
        const deducedKind = deduceImportKindFromPath(importDef.path);
        if (!deducedKind) {
          throw new Error(
            `Could not deduce import kind from path: ${importDef.path} (please specify explicitly in manifest)`,
          );
        }
        const coerced = kImportKind.coerceByKey(deducedKind);
        if (!coerced) {
          throw new Error(`Deduced import kind is invalid: ${deducedKind} (please specify explicitly in manifest)`);
        }
        importDef.kind = coerced.key;
      }
    }

    return {
      manifest: resolved, //
      selectedBuildConfig: buildConfigName,
      variables: calculatedVars,
    };
  }

  async loadImports(reporter: BuildReporter, profiler?: TraceProfiler, parentScope?: TraceScope): Promise<void> {
    this.resourceMgr = await loadAllImports(this.resolvedCore, reporter, profiler, parentScope);
  }

  // assemble one block def, return multiple produced output payloads.
  // note: A CODE payload can emit several physical chunks.
  private async assembleBlock(
    block: AssemblyBlock,
    profileTrack?: TraceTrack,
    parentScope?: TraceScope,
  ): Promise<Tic80CartChunk[]> {
    const asset = canonicalizeAssetImport(block.asset);
    using _profileScope = profileTrack?.enter("Assemble block", {
      category: "assembly",
      parent: parentScope,
      args: {
        importName: asset.import,
        chunkTypes: block.chunks?.join(",") ?? "default",
        bank: block.bank ?? "automatic",
      },
    });
    const resource = this.resourceMgr?.items.get(asset.import);
    if (!resource) {
      throw new Error(`Imported resource not found: ${asset.import}`);
    }
    return await assembleAsset(this.resolvedCore, resource, asset, block);
  }

  async assembleOutput(profiler?: TraceProfiler, parentScope?: TraceScope): Promise<AssembleOutputResult> {
    if (!this.resourceMgr) {
      throw new Error("Resources not loaded. Call loadImports() before assembleOutput().");
    }
    const assembly = this.resolvedCore.manifest.assembly;
    const tasks: Promise<Tic80CartChunk[]>[] = [];
    for (let blockIndex = 0; blockIndex < assembly.blocks.length; blockIndex++) {
      const block = assembly.blocks[blockIndex];
      if (block.chunks?.length === 0) { // note: unspecified chunks is still valid, but chunks:[] is not.
        cons.warning(`Assembly block ${blockIndex + 1} has an empty chunks list and produces no output`);
        continue;
      }
      // generate the binary output for each requested block.
      const profileTrack = profiler?.createTrack(`Assembly block ${blockIndex + 1}`);
      tasks.push(this.assembleBlock(block, profileTrack, parentScope));
    }

    // write the final output cartridge
    const results = await Promise.all(tasks);

    const finalChunks: Tic80CartChunk[] = [];
    for (const chunkList of results) {
      finalChunks.push(...chunkList);
    }
    const usesExtendedCodeBanks = finalChunks.some(
      (chunk) => chunk.chunkType === "CODE" && chunk.bank >= kTic80CartChunkTypes.byKey.CODE.bankCount,
    );
    const usesMultiBankCompressedCode = finalChunks.some(
      (chunk) =>
        chunk.chunkType === "CODE_COMPRESSED" && chunk.bank >= kTic80CartChunkTypes.byKey.CODE_COMPRESSED.bankCount,
    );

    // generate final tic80 cart binary
    const output = await profileAsync(
      parentScope,
      "Serialize cartridge chunks",
      {
        category: "assembly",
        args: { chunkCount: finalChunks.length },
      },
      () => AssembleTic80Cart({
        chunks: finalChunks,
        allowExtendedCodeBanks: usesExtendedCodeBanks,
        allowMultiBankCompressedCode: usesMultiBankCompressedCode,
      }),
    );

    return { output, chunks: finalChunks };
  }
}
