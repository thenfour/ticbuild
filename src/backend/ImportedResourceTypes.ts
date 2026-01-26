// importing -> ImportedResource -> assembly

import { Tic80CartChunkTypeKey } from "../utils/tic80/tic80";
import { AssetReference, CodeAssemblyOptions } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";

export type ExternalDependency = {
  path: string;
  reason: string;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export abstract class ResourceViewBase {
  abstract getDataForChunk(
    project: TicbuildProjectCore,
    chunkType: Tic80CartChunkTypeKey,
    options?: CodeAssemblyOptions,
  ): Uint8Array;
  abstract getSupportedChunkTypes(): Tic80CartChunkTypeKey[];
  abstract getParallelChunkTypes(): Tic80CartChunkTypeKey[];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export abstract class ImportedResourceBase {
  abstract dump(): void;

  // if chunks is omitted, returns view for entire resource.
  abstract getView(project: TicbuildProjectCore, chunks?: Tic80CartChunkTypeKey[]): ResourceViewBase;

  abstract getDependencyList(): ExternalDependency[];
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

  getDependencyList(): ExternalDependency[] {
    const dependencies: ExternalDependency[] = [];
    for (const resource of this.items.values()) {
      dependencies.push(...resource.getDependencyList());
    }
    return dependencies;
  }
}
