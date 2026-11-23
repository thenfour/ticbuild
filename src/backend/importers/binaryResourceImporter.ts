import { ExternalDependency, ImportedResourceBase } from "../ImportedResourceTypes";
import { ImportDefinition } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { loadBinaryImportData } from "../importUtils";
import { MaterializedImportSource } from "../importSources";

export class BinaryResource extends ImportedResourceBase {
  constructor(
    readonly data: Uint8Array,
    private readonly dependencies: ExternalDependency[],
  ) {
    super();
  }

  dump(): void {
    console.log(`BinaryResource dump, size: ${this.data.length}`);
  }

  getDependencyList(): ExternalDependency[] {
    return this.dependencies;
  }
}

export async function importBinaryResource(
  project: TicbuildProjectCore,
  spec: ImportDefinition,
  source?: MaterializedImportSource,
): Promise<BinaryResource> {
  const result = await loadBinaryImportData(project, spec, source);
  return new BinaryResource(result.data, result.dependencies);
}
