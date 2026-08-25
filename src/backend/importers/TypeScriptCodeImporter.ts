import { readTextFileAsync } from "../../utils/fileSystem";
import { GeneratedLuaSource } from "../ImportedResourceTypes";
import { ImportDefinition, TypeScriptImportConfig } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { CodeResource } from "./CodeResource";
import { transpileTypeScriptToLua } from "./TypeScriptTranspiler";
import { MaterializedImportSource, materializeImportSource, requireFileImportSource } from "../importSources";

export class TypeScriptCodeResource extends CodeResource {
  constructor(
    filePath: string,
    sourceText: string,
    private readonly typescriptConfig?: TypeScriptImportConfig,
  ) {
    super(filePath, sourceText);
  }

  protected async generateLuaSource(project: TicbuildProjectCore): Promise<GeneratedLuaSource> {
    return transpileTypeScriptToLua(project, this.filePath, this.sourceText, this.typescriptConfig);
  }

  protected getInputDependencyReason(): string {
    return "Imported TypeScript code file";
  }

  supportsLuaSymbolIndex(): boolean {
    return false;
  }
}

export async function importTypeScriptCode(
  project: TicbuildProjectCore,
  spec: ImportDefinition,
  materializedSource?: MaterializedImportSource,
): Promise<TypeScriptCodeResource> {
  const sourceInfo = materializedSource ?? await materializeImportSource(project, spec);
  const filePath = requireFileImportSource(spec, sourceInfo);
  const source = await readTextFileAsync(filePath);
  const resource = new TypeScriptCodeResource(filePath, source, spec.typescript);
  resource.setImportSource(sourceInfo);
  return resource;
}
