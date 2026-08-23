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
export class ResourceManager {
  items: Map<string, ImportedResourceBase>;
  // resource manager holds all the imported root resources (code files, imported carts.)
  constructor(items: Map<string, ImportedResourceBase>) {
    this.items = items;
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
    const resource = this.items.get(importName);
    if (!resource?.getGeneratedLuaSource) {
      // todo: emit warning or error; this is likely a mistake authors want to know about.
      return undefined;
    }
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
