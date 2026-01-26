import { kTic80CartChunkTypes, Tic80CartChunkTypeKey } from "../../utils/tic80/tic80";
import { ExternalDependency, ImportedResourceBase, ResourceViewBase } from "../ImportedResourceTypes";
import { ImportDefinition } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { loadBinaryImportData } from "../importUtils";

export class BinaryResourceView extends ResourceViewBase {
  private data: Uint8Array;

  constructor(data: Uint8Array) {
    super();
    this.data = data;
  }

  getDataForChunk(project: TicbuildProjectCore, chunkType: Tic80CartChunkTypeKey): Uint8Array {
    return this.data;
  }

  getSupportedChunkTypes(): Tic80CartChunkTypeKey[] {
    return kTic80CartChunkTypes.keys as Tic80CartChunkTypeKey[];
  }

  getParallelChunkTypes(): Tic80CartChunkTypeKey[] {
    throw new Error(`Binary resources require explicit chunks in assembly blocks`);
  }
}

export class BinaryResource extends ImportedResourceBase {
  view: BinaryResourceView;
  dependencies: ExternalDependency[];
  sizeBytes: number;

  constructor(data: Uint8Array, dependencies: ExternalDependency[]) {
    super();
    this.view = new BinaryResourceView(data);
    this.dependencies = dependencies;
    this.sizeBytes = data.length;
  }

  dump(): void {
    console.log(`BinaryResource dump, size: ${this.sizeBytes}`);
  }

  getView(project: TicbuildProjectCore, chunks?: Tic80CartChunkTypeKey[]) {
    if (!chunks || chunks.length === 0) {
      return this.view;
    }
    return this.view;
  }

  getDependencyList(): ExternalDependency[] {
    return this.dependencies;
  }
}

export async function importBinaryResource(
  project: TicbuildProjectCore,
  spec: ImportDefinition,
): Promise<BinaryResource> {
  const result = await loadBinaryImportData(project, spec);
  const dependencies: ExternalDependency[] = result.dependencies.map((path) => ({
    path,
    reason: "Imported binary resource",
  }));
  return new BinaryResource(result.data, dependencies);
}
