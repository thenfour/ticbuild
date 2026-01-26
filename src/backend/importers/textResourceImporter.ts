import { kTic80CartChunkTypes, Tic80CartChunkTypeKey } from "../../utils/tic80/tic80";
import { ExternalDependency, ImportedResourceBase, ResourceViewBase } from "../ImportedResourceTypes";
import { ImportDefinition } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { loadTextImportData } from "../importUtils";

export class TextResourceView extends ResourceViewBase {
  private text: string;
  private bytes: Uint8Array;

  constructor(text: string) {
    super();
    this.text = text;
    const encoder = new TextEncoder();
    this.bytes = encoder.encode(text);
  }

  getDataForChunk(project: TicbuildProjectCore, chunkType: Tic80CartChunkTypeKey): Uint8Array {
    return this.bytes;
  }

  getSupportedChunkTypes(): Tic80CartChunkTypeKey[] {
    return kTic80CartChunkTypes.keys as Tic80CartChunkTypeKey[];
  }

  getParallelChunkTypes(): Tic80CartChunkTypeKey[] {
    throw new Error(`Text resources require explicit chunks in assembly blocks`);
  }
}

export class TextResource extends ImportedResourceBase {
  view: TextResourceView;
  dependencies: ExternalDependency[];
  sizeBytes: number;

  constructor(text: string, dependencies: ExternalDependency[]) {
    super();
    this.view = new TextResourceView(text);
    this.dependencies = dependencies;
    this.sizeBytes = new TextEncoder().encode(text).length;
  }

  dump(): void {
    console.log(`TextResource dump, size: ${this.sizeBytes}`);
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

export async function importTextResource(project: TicbuildProjectCore, spec: ImportDefinition): Promise<TextResource> {
  const result = await loadTextImportData(project, spec);
  const dependencies: ExternalDependency[] = result.dependencies.map((path) => ({
    path,
    reason: "Imported text resource",
  }));
  return new TextResource(result.data, dependencies);
}
