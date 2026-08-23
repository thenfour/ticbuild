import { readTextFileAsync } from "../../utils/fileSystem";
import { GeneratedLuaSource } from "../ImportedResourceTypes";
import { ImportDefinition, TypeScriptImportConfig } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { CodeResource } from "./CodeResource";
import { transpileTypeScriptToLua } from "./TypeScriptTranspiler";

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
): Promise<TypeScriptCodeResource> {
  const filePath = project.resolveImportPath(spec);
  const source = await readTextFileAsync(filePath);
  return new TypeScriptCodeResource(filePath, source, spec.typescript);
}
