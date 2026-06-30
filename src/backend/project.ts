import { assert } from "../utils/errorHandling";
import { AssembleTic80Cart } from "../utils/tic80/cartWriter";
import { kTic80CartChunkTypes, kTic80ExtendedCodeBankCount, Tic80CartChunk } from "../utils/tic80/tic80";
import { deepMergeObjects } from "../utils/utils";
import { ResourceManager } from "./ImportedResourceTypes";
import { loadAllImports } from "./importResources";
import { resolveAndLoadManifest } from "./manifestLoader";
import { AssemblyBlock, AssetReference, kImportKind, Manifest, ResolvedManifest } from "./manifestTypes";
import { calculateVars, canonicalizeAssetImport, deduceImportKindFromPath, TicbuildProjectCore } from "./projectCore";

export type TicbuildProjectLoadOptions = {
  manifestPath?: string | undefined;
  buildConfigName?: string | undefined;
  overrideVariables?: Record<string, string>;
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

  static loadFromManifest(options?: TicbuildProjectLoadOptions): TicbuildProject {
    const loadedManifest = resolveAndLoadManifest(options?.manifestPath);
    return new TicbuildProject(
      loadedManifest.manifest, //
      loadedManifest.filePath,
      loadedManifest.projectDir,
      options,
    );
  }

  private constructor(
    manifest: Manifest,
    manifestPath: string,
    projectDir: string,
    options?: TicbuildProjectLoadOptions,
  ) {
    this.unresolvedCore = new TicbuildProjectCore({
      manifest,
      manifestPath,
      projectDir,
      buildConfigName: options?.buildConfigName,
      overrideVariables: options?.overrideVariables,
    });

    const resolvedManifest = this.resolveManifest(manifestPath, projectDir, options);
    this.resolvedCore = new TicbuildProjectCore({
      manifest: resolvedManifest.manifest,
      manifestPath,
      projectDir,
      buildConfigName: options?.buildConfigName,
      overrideVariables: options?.overrideVariables,
    });
  }

  private resolveManifest(
    manifestPath: string,
    projectDir: string,
    options?: TicbuildProjectLoadOptions,
  ): ResolvedManifest {
    // avoid mutations
    const resolved: Manifest = this.unresolvedCore.clone().manifest;

    // in this process, avoid handling of specific fields; general behaviors are preferred
    // for maintainability.

    if (options?.buildConfigName) {
      const buildConfig = this.unresolvedCore.manifest.buildConfigurations?.[options.buildConfigName];
      if (!buildConfig) {
        throw new Error(`Build configuration not found: ${options.buildConfigName}`);
      }

      // for every leaf in project settings, override / add to resolved manifest
      // for example { project: { binDir: "..." } } overrides resolved.project.binDir
      // arrays are considered a leaf value. e.g., { project: { includeDirs: [...] } } substitutes the entire array.
      // we want to avoid handling specific cases; we want generic merge/override behavior.
      deepMergeObjects(resolved, buildConfig);

      // that makes it theoretically possible to override the assembly.blocks array too,
      // so we need to canonicalize asset references again after applying the build config.
    }

    // there's a special case to handle:
    // assembly.blocks[].asset supports a shorthand form.
    // canonical form:
    //   "asset": { "import": "music-imported-cart", "chunks": ["MUSIC_WAVEFORMS"] },
    // shorthand:
    //   "asset": "import:music-imported-cart:MUSIC_WAVEFORMS",
    for (const block of resolved.assembly.blocks) {
      block.asset = canonicalizeAssetImport(block.asset);
    }

    const calculatedVars = calculateVars(
      resolved,
      manifestPath,
      projectDir,
      options?.overrideVariables,
      options?.buildConfigName,
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
      variables: calculatedVars,
    };
  }

  async loadImports(): Promise<void> {
    this.resourceMgr = await loadAllImports(this.resolvedCore);
  }

  // takse a block def and returns the multiple chunks it may produce.
  private async assembleBlock(block: AssemblyBlock): Promise<Tic80CartChunk[]> {
    assert(!!this.resourceMgr);

    // for binary copy, just retrieve the asset data from the resource manager.
    const assetRef = block.asset as AssetReference;
    const resource = this.resourceMgr.items.get(assetRef.import);
    if (!resource) {
      throw new Error(`Imported resource not found: ${assetRef.import}`);
    }
    const view = resource.getView(this.resolvedCore, block.chunks);
    // extract the bins from the resource view and output as chunks.
    const outputChunks: Tic80CartChunk[] = [];
    const requestedChunks = block.chunks || view.getParallelChunkTypes();
    const bank = block.bank ?? 0;
    for (const chunkType of requestedChunks) {
      const data = await view.getDataForChunk(this.resolvedCore, chunkType, block.code);
      if (chunkType === "CODE") {
        const codeInfo = kTic80CartChunkTypes.byKey.CODE;
        const maxChunkSize = codeInfo.sizePerBank;
        const nativeBankCount = codeInfo.bankCount;
        const extendedCodeBanks = block.code?.extendedCodeBanks === true;
        const supportedBankCount = extendedCodeBanks ? kTic80ExtendedCodeBankCount : nativeBankCount;
        if (block.bank !== undefined) {
          if (bank >= nativeBankCount && !extendedCodeBanks) {
            throw new Error(
              `CODE bank ${bank} requires assembly.blocks[].code.extendedCodeBanks for the private TIC-80 build (stock TIC-80 supports banks 0..${
                nativeBankCount - 1
              })`,
            );
          }
          if (bank >= supportedBankCount) {
            throw new Error(`CODE bank ${bank} out of range (0..${supportedBankCount - 1})`);
          }
        }
        if (data.length > maxChunkSize) {
          if (block.bank !== undefined) {
            // it's confusing what you mean if you specify a bank here.
            // exceeding 1 bank = auto-split code into auto banks.
            throw new Error(`CODE chunk exceeds ${maxChunkSize} bytes but bank was specified`);
          }
          const bankCount = Math.ceil(data.length / maxChunkSize);
          if (bankCount > supportedBankCount) {
            throw new Error(
              extendedCodeBanks
                ? `CODE chunk requires ${bankCount} banks but extended CODE bank support allows only ${supportedBankCount}`
                : `CODE chunk requires ${bankCount} banks but TIC-80 supports only ${nativeBankCount}. Enable assembly.blocks[].code.extendedCodeBanks for the private TIC-80 build (up to ${kTic80ExtendedCodeBankCount} banks)`,
            );
          }
          for (let i = 0; i < bankCount; i++) {
            const start = i * maxChunkSize;
            const end = Math.min(start + maxChunkSize, data.length);
            outputChunks.push({
              chunkType,
              bank: bankCount - 1 - i,
              data: data.subarray(start, end),
            });
          }
          continue;
        }
      }
      if (chunkType === "CODE_COMPRESSED") {
        const compressedInfo = kTic80CartChunkTypes.byKey.CODE_COMPRESSED;
        const maxChunkSize = compressedInfo.sizePerBank;
        const nativeBankCount = compressedInfo.bankCount;
        const multiBankCompressedCode = block.code?.multiBankCompressedCode === true;
        const supportedBankCount = multiBankCompressedCode ? kTic80ExtendedCodeBankCount : nativeBankCount;
        if (block.bank !== undefined) {
          if (bank >= nativeBankCount && !multiBankCompressedCode) {
            throw new Error(
              `CODE_COMPRESSED bank ${bank} requires assembly.blocks[].code.multiBankCompressedCode for the private TIC-80 build (stock TIC-80 supports bank 0)`,
            );
          }
          if (bank >= supportedBankCount) {
            throw new Error(`CODE_COMPRESSED bank ${bank} out of range (0..${supportedBankCount - 1})`);
          }
        }
        if (data.length > maxChunkSize) {
          if (block.bank !== undefined) {
            throw new Error(`CODE_COMPRESSED chunk exceeds ${maxChunkSize} bytes but bank was specified`);
          }
          const bankCount = Math.ceil(data.length / maxChunkSize);
          if (bankCount > supportedBankCount) {
            throw new Error(
              multiBankCompressedCode
                ? `CODE_COMPRESSED chunk requires ${bankCount} banks but multi-bank compressed CODE support allows only ${supportedBankCount}`
                : `CODE_COMPRESSED chunk requires ${bankCount} banks but TIC-80 supports only ${nativeBankCount}. Enable assembly.blocks[].code.multiBankCompressedCode for the private TIC-80 build (up to ${kTic80ExtendedCodeBankCount} banks)`,
            );
          }
          for (let i = 0; i < bankCount; i++) {
            const start = i * maxChunkSize;
            const end = Math.min(start + maxChunkSize, data.length);
            outputChunks.push({
              chunkType,
              bank: bankCount - 1 - i,
              data: data.subarray(start, end),
            });
          }
          continue;
        }
      }
      outputChunks.push({
        chunkType,
        bank,
        data,
      });
    }
    return outputChunks;
  }

  async assembleOutput(): Promise<AssembleOutputResult> {
    if (!this.resourceMgr) {
      throw new Error("Resources not loaded. Call loadImports() before assembleOutput().");
    }
    const assembly = this.resolvedCore.manifest.assembly;
    const tasks: Promise<Tic80CartChunk[]>[] = [];
    for (const block of assembly.blocks) {
      // generate the binary output for each requested block.
      tasks.push(this.assembleBlock(block));
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
    const output = await AssembleTic80Cart({
      chunks: finalChunks,
      allowExtendedCodeBanks: usesExtendedCodeBanks,
      allowMultiBankCompressedCode: usesMultiBankCompressedCode,
    });

    return { output, chunks: finalChunks };
  }
}
