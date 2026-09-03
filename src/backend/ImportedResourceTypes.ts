// importing -> ImportedResource -> assembly

import { Tic80CartChunkTypeKey } from "../utils/tic80/tic80";
import { AssetReference, CodeAssemblyOptions } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";
import { LuaPreprocessorSourceMap } from "./sourceMap";

export type ExternalDependency = {
  path: string;
  reason: string;
};

export type ChunkDataResult = Uint8Array | Promise<Uint8Array>;

// the output of a Lua code resource, hand off to the Lua-only pipeline.
// for lua code resources this is the unchanged source text.
export type GeneratedLuaSource = {
  source: string;
  sourcePath: string;
  sourceMap: LuaPreprocessorSourceMap;
  dependencies?: ExternalDependency[];
  generatedOutputs?: string[];
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export abstract class ResourceViewBase {
  abstract getDataForChunk(
    project: TicbuildProjectCore,
    chunkType: Tic80CartChunkTypeKey,
    options?: CodeAssemblyOptions,
  ): ChunkDataResult;
  abstract getSupportedChunkTypes(): Tic80CartChunkTypeKey[];
  abstract getParallelChunkTypes(): Tic80CartChunkTypeKey[];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export abstract class ImportedResourceBase {
  abstract dump(): void;

  // if chunks is omitted, returns view for entire resource.
  abstract getView(project: TicbuildProjectCore, chunks?: Tic80CartChunkTypeKey[]): ResourceViewBase;

  abstract getDependencyList(): ExternalDependency[];

  // for resources which produce Lua.
  // Lets --#include "import:..." resolve code without knowing which source language produced it.
  getGeneratedLuaSource?(project: TicbuildProjectCore): Promise<GeneratedLuaSource>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type ImportedResourceLoader = (importName: string) => Promise<ImportedResourceBase | undefined>;
export type GeneratedLuaPreparation = (
  importName: string,
  resource: ImportedResourceBase,
) => Promise<void>;

export class ResourceManager {

  // `items` contains materialized resources only. Manifest imports are definitions;
  // the loader materializes on demand (__IMPORT, inclusion, assembly reference)
  items: Map<string, ImportedResourceBase>;
  private readonly usedImportNames = new Set<string>();

  constructor(
    items: Map<string, ImportedResourceBase>,
    private readonly loadResourceImpl?: ImportedResourceLoader,
    private readonly prepareGeneratedLua?: GeneratedLuaPreparation,
    private readonly declaredImportNames: readonly string[] = Array.from(items.keys()),
    private readonly generatedLuaImportNames?: ReadonlySet<string>,
  ) {
    this.items = items;
    for (const name of items.keys()) {
      this.usedImportNames.add(name);
    }
  }

  async loadResource(importName: string): Promise<ImportedResourceBase | undefined> {
    const existing = this.items.get(importName);
    if (existing) {
      this.usedImportNames.add(importName);
      return existing;
    }
    const resource = await this.loadResourceImpl?.(importName);
    if (resource) {
      this.items.set(importName, resource);
      this.usedImportNames.add(importName);
    }
    return resource;
  }

  markImportUsed(importName: string): void {
    this.usedImportNames.add(importName);
  }

  isImportUsed(importName: string): boolean {
    return this.usedImportNames.has(importName);
  }

  getDeclaredImportNames(): readonly string[] {
    return this.declaredImportNames;
  }

  getResourceView(project: TicbuildProjectCore, spec: AssetReference): ResourceViewBase {
    const resource = this.items.get(spec.import);
    if (!resource) {
      throw new Error(`Resource not found: ${spec.import}`);
    }
    return resource.getView(project, spec.chunks);
  }

  async getGeneratedLuaSource(
    project: TicbuildProjectCore,
    importName: string,
  ): Promise<GeneratedLuaSource | undefined> {
    if (this.generatedLuaImportNames && !this.generatedLuaImportNames.has(importName)) {
      return undefined;
    }
    const resource = await this.loadResource(importName);
    if (!resource?.getGeneratedLuaSource) {
      // todo: emit warning or error; this is likely a mistake authors want to know about.
      return undefined;
    }
    await this.prepareGeneratedLua?.(importName, resource);
    return await resource.getGeneratedLuaSource(project);
  }

  getDependencyList(): ExternalDependency[] {
    const dependencies: ExternalDependency[] = [];
    for (const resource of this.items.values()) {
      dependencies.push(...resource.getDependencyList());
    }
    return dependencies;
  }
}
