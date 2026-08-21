import { readTextFileAsync } from "../../utils/fileSystem";
import { GeneratedLuaSource } from "../ImportedResourceTypes";
import { ImportDefinition } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { CodeResource } from "./CodeResource";

export class TypeScriptCodeResource extends CodeResource {
  constructor(filePath: string, sourceText: string) {
    super(filePath, sourceText);
  }

  protected async generateLuaSource(): Promise<GeneratedLuaSource> {
    throw new Error(
      `TypeScript transpilation WIP`,
    );
  }

  protected getInputDependencyReason(): string {
    return "Imported TypeScript code file";
  }
}

export async function importTypeScriptCode(
  project: TicbuildProjectCore,
  spec: ImportDefinition,
): Promise<TypeScriptCodeResource> {
  const filePath = project.resolveImportPath(spec);
  const source = await readTextFileAsync(filePath);
  return new TypeScriptCodeResource(filePath, source);
}
