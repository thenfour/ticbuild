import { readTextFileAsync } from "../../utils/fileSystem";
import { GeneratedLuaSource } from "../ImportedResourceTypes";
import { ImportDefinition, TypeScriptImportConfig } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { CodeResource } from "./CodeResource";
import { transpileTypeScriptToLua } from "./TypeScriptTranspiler";
import { MaterializedImportSource, materializeImportSource, requireFileImportSource } from "../importSources";
import { LuaDefinitionBlock } from "./TypeScriptLuaDeclarations";

export class TypeScriptCodeResource extends CodeResource {
  private luaDefinitionBlocks: readonly LuaDefinitionBlock[] = [];

  constructor(
    filePath: string,
    sourceText: string,
    private readonly typescriptConfig?: TypeScriptImportConfig,
  ) {
    super(filePath, sourceText);
  }

  protected async generateLuaSource(project: TicbuildProjectCore): Promise<GeneratedLuaSource> {
    const result = transpileTypeScriptToLua(project, this.filePath, this.sourceText, this.typescriptConfig);
    this.luaDefinitionBlocks = result.luaDefinitionBlocks;
    return result;
  }

  getLuaDefinitionBlocks(): readonly LuaDefinitionBlock[] {
    return this.luaDefinitionBlocks;
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
