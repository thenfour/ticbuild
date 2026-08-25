// Loads Lua source into the language-neutral code pipeline.

import { readTextFileAsync } from "../../utils/fileSystem";
import { GeneratedLuaSource } from "../ImportedResourceTypes";
import { LuaPreprocessResult } from "../luaPreprocessor";
import { ImportDefinition } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { createIdentitySourceMap } from "../sourceMap";
import { MaterializedImportSource, materializeImportSource, requireFileImportSource } from "../importSources";
import {
  CodeResource,
} from "./CodeResource";

export class LuaCodeResource extends CodeResource {
  constructor(
    filePath: string,
    inputSource: string,
    preprocessedSource?: string,
    dependencies?: string[],
    preprocessResult?: LuaPreprocessResult,
  ) {
    super(
      filePath,
      inputSource,
      preprocessedSource !== undefined && dependencies && preprocessResult
        ? {
          generatedLuaSource: inputSource,
          generatedLuaSourceMap: createIdentitySourceMap(inputSource, filePath),
          dependencies,
          preprocessResult,
        }
        : undefined,
    );
  }

  protected async generateLuaSource(): Promise<GeneratedLuaSource> {
    return {
      source: this.sourceText,
      sourcePath: this.filePath,
      sourceMap: createIdentitySourceMap(this.sourceText, this.filePath),
      dependencies: [{ path: this.filePath, reason: this.getInputDependencyReason() }],
    };
  }

  protected getInputDependencyReason(): string {
    return "Imported Lua code file";
  }
}

export async function importLuaCode(
  project: TicbuildProjectCore,
  spec: ImportDefinition,
  materializedSource?: MaterializedImportSource,
): Promise<LuaCodeResource> {
  const sourceInfo = materializedSource ?? await materializeImportSource(project, spec);
  const filePath = requireFileImportSource(spec, sourceInfo);
  const source = await readTextFileAsync(filePath);
  const resource = new LuaCodeResource(filePath, source);
  resource.setImportSource(sourceInfo);
  return resource;
}
