import { ExternalDependency, ImportedResourceBase } from "../ImportedResourceTypes";
import { ImportDefinition } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { loadTextImportData } from "../importUtils";
import { MaterializedImportSource } from "../importSources";

export class TextResource extends ImportedResourceBase {
  readonly data: Uint8Array;

  constructor(text: string, private readonly dependencies: ExternalDependency[]) {
    super();
    this.data = new TextEncoder().encode(text);
  }

  dump(): void {
    console.log(`TextResource dump, size: ${this.data.length}`);
  }

  getDependencyList(): ExternalDependency[] {
    return this.dependencies;
  }
}

export async function importTextResource(
  project: TicbuildProjectCore,
  spec: ImportDefinition,
  source?: MaterializedImportSource,
): Promise<TextResource> {
  const result = await loadTextImportData(project, spec, source);
  return new TextResource(result.data, result.dependencies);
}
