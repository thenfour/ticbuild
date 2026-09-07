import { readTextFileAsync } from "../../utils/fileSystem";
import { GeneratedLuaSource } from "../ImportedResourceTypes";
import { MaterializedImportSource, materializeImportSource, requireFileImportSource } from "../importSources";
import { ImportDefinition, TypeScriptImportConfig } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { CodeResource } from "./CodeResource";
import { LuaDefinitionBlock } from "./TypeScriptLuaDeclarations";
import {
  collectTypeScriptManifestCodeDependencies,
  collectTypeScriptManifestDependencies,
  ManifestCodeDependency,
  TypeScriptManifestModuleDeclaration,
} from "./TypeScriptManifestModules";
import { TypeScriptDeclarationContext } from "./TypeScriptProgram";
import { transpileTypeScriptToLua } from "./TypeScriptTranspiler";

export class TypeScriptCodeResource extends CodeResource {
  private luaDefinitionBlocks: readonly LuaDefinitionBlock[] = [];
  private typescriptManifestModuleDeclaration: TypeScriptManifestModuleDeclaration | undefined;
  private declarationContext: TypeScriptDeclarationContext | undefined;

  constructor(
    readonly manifestImportName: string,
    filePath: string,
    sourceText: string,
    readonly typescriptConfig?: TypeScriptImportConfig,
  ) {
    super(filePath, sourceText);
  }

  protected async generateLuaSource(project: TicbuildProjectCore): Promise<GeneratedLuaSource> {
    const result = transpileTypeScriptToLua(
      project,
      this.filePath,
      this.sourceText,
      this.typescriptConfig,
      undefined,
      this.profileTrack,
      this.declarationContext,
    );
    this.luaDefinitionBlocks = result.luaDefinitionBlocks;
    return result;
  }

  getLuaDefinitionBlocks(): readonly LuaDefinitionBlock[] {
    return this.luaDefinitionBlocks;
  }

  setPreparedDeclarations(declaration: TypeScriptManifestModuleDeclaration, context: TypeScriptDeclarationContext): void {
    this.typescriptManifestModuleDeclaration = declaration;
    this.declarationContext = context;
  }

  getTypeScriptManifestDependencies(project: TicbuildProjectCore): readonly string[] {
    return collectTypeScriptManifestDependencies(project, this.filePath, this.sourceText, this.typescriptConfig);
  }

  getManifestCodeDependencies(
    project: TicbuildProjectCore,
    onSource?: (fileName: string, sourceText: string, typeOnly: boolean) => void,
  ): readonly ManifestCodeDependency[] {
    return collectTypeScriptManifestCodeDependencies(project, this.filePath, this.sourceText, this.typescriptConfig, onSource);
  }

  getTypeScriptManifestModuleDeclaration(): TypeScriptManifestModuleDeclaration {
    if (!this.typescriptManifestModuleDeclaration) {
      throw new Error(`TypeScript manifest declarations are not available for '${this.manifestImportName}'`);
    }
    return this.typescriptManifestModuleDeclaration;
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
  const resource = new TypeScriptCodeResource(spec.name, filePath, source, spec.typescript);
  resource.setImportSource(sourceInfo);
  return resource;
}
