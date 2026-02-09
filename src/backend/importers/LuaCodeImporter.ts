// loads a Lua code file.
// sub assets are not supported.

import { deflateSync } from "node:zlib";
import { readTextFileAsync } from "../../utils/fileSystem";
import { toLuaStringLiteral } from "../../utils/lua/lua_fundamentals";
import { OptimizationRuleOptions, processLua } from "../../utils/lua/lua_processor";
import { Tic80CartChunkTypeKey } from "../../utils/tic80/tic80";
import { CoalesceBool } from "../../utils/utils";
import { ExternalDependency, ImportedResourceBase, ResourceViewBase } from "../ImportedResourceTypes";
import { preprocessLuaCode, LuaPreprocessResult } from "../luaPreprocessor";
import { ImportDefinition, LuaMinificationConfig } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";

const releaseOptions: OptimizationRuleOptions = {
  stripComments: true,
  //stripDebugBlocks: true,
  maxIndentLevel: 1,
  lineBehavior: "tight",
  maxLineLength: 180,
  aliasRepeatedExpressions: true,
  renameLocalVariables: true,
  aliasLiterals: true,
  packLocalDeclarations: true,
  simplifyExpressions: true,
  removeUnusedLocals: true,
  removeUnusedFunctions: false,
  functionNamesToKeep: ["TIC", "BDR", "SCN"],
  renameTableFields: false,
  tableEntryKeysToRename: [],
} as const;

export type LuaCodeArtifacts = {
  inputSource: string;
  preprocessedSource: string;
  minifiedSource: string;
  compressedBytes: Uint8Array;
};

export type LuaCodeSizeStats = {
  inputBytes: number;
  preprocessedBytes: number;
  minifiedBytes: number;
  compressedBytes: number;
};

export class LuaCodeResourceView extends ResourceViewBase {
  inputSource: string;
  preprocessedSource: string;
  private cachedMinifiedSource: string | null = null;
  private cachedCompressedBytes: Uint8Array | null = null;
  private cachedMinifyEnabled: boolean | null = null;

  constructor(inputSource: string, preprocessedSource: string) {
    super();
    this.inputSource = inputSource;
    this.preprocessedSource = preprocessedSource;
  }
  getDataForChunk(
    project: TicbuildProjectCore,
    chunkType: Tic80CartChunkTypeKey,
    options?: { emitGlobals?: boolean },
  ): Uint8Array {
    // TODO: validate ASCII. no high-bit chars.
    // convert to Uint8Array (ASCII)
    if (chunkType !== "CODE" && chunkType !== "CODE_COMPRESSED") {
      throw new Error(`LuaCodeResourceView only supports CODE or CODE_COMPRESSED chunks.`);
    }
    const minifyEnabled = CoalesceBool(project.manifest.assembly.lua?.minify, true);
    const emitGlobals = options?.emitGlobals !== false;
    const minifiedSource = this.getMinifiedSource(project, minifyEnabled, emitGlobals);

    if (chunkType === "CODE_COMPRESSED") {
      const compressed = this.getCompressedBytes(minifiedSource);
      if (compressed.length > 64 * 1024) {
        throw new Error(`Compressed code exceeds 64kb limit: ${compressed.length} bytes`);
      }
      return new Uint8Array(compressed);
    }

    const encoder = new TextEncoder();
    return encoder.encode(minifiedSource);
  }
  getSupportedChunkTypes(): Tic80CartChunkTypeKey[] {
    return ["CODE", "CODE_COMPRESSED"];
  }
  getParallelChunkTypes(): Tic80CartChunkTypeKey[] {
    // if requesting "all chunks", return this one. this is the canonical non-deprecated chunk.
    return ["CODE"];
  }

  getArtifacts(project: TicbuildProjectCore): LuaCodeArtifacts {
    const minifyEnabled = CoalesceBool(project.manifest.assembly.lua?.minify, true);
    const minifiedSource = this.getMinifiedSource(project, minifyEnabled, true);
    const compressedBytes = this.getCompressedBytes(minifiedSource);
    return {
      inputSource: this.inputSource,
      preprocessedSource: this.preprocessedSource,
      minifiedSource,
      compressedBytes,
    };
  }

  getSizeStats(project: TicbuildProjectCore): LuaCodeSizeStats {
    const artifacts = this.getArtifacts(project);
    const encoder = new TextEncoder();
    return {
      inputBytes: encoder.encode(artifacts.inputSource).length,
      preprocessedBytes: encoder.encode(artifacts.preprocessedSource).length,
      minifiedBytes: encoder.encode(artifacts.minifiedSource).length,
      compressedBytes: artifacts.compressedBytes.length,
    };
  }

  private getMinifiedSource(project: TicbuildProjectCore, minifyEnabled: boolean, emitGlobals: boolean): string {
    if (this.cachedMinifyEnabled === minifyEnabled && this.cachedMinifiedSource && emitGlobals) {
      return this.cachedMinifiedSource;
    }

    let code = emitGlobals ? this.injectGlobals(project, this.preprocessedSource) : this.preprocessedSource;
    if (minifyEnabled) {
      const options = buildMinificationOptions(project.manifest.assembly.lua?.minification);
      code = processLua(code, options);
    }

    if (emitGlobals) {
      this.cachedMinifyEnabled = minifyEnabled;
      this.cachedMinifiedSource = code;
      this.cachedCompressedBytes = null;
    }
    return code;
  }

  private getCompressedBytes(minifiedSource: string): Uint8Array {
    if (this.cachedCompressedBytes) {
      return this.cachedCompressedBytes;
    }
    const encoder = new TextEncoder();
    const rawBytes = encoder.encode(minifiedSource);
    const compressed = deflateSync(Buffer.from(rawBytes));
    this.cachedCompressedBytes = new Uint8Array(compressed);
    return this.cachedCompressedBytes;
  }

  private injectGlobals(project: TicbuildProjectCore, source: string): string {
    let header = "";
    if (project.manifest.assembly.lua?.globals) {
      const globals = project.manifest.assembly.lua.globals;
      for (const [varName, varValue] of Object.entries(globals)) {
        let luaValue: string;
        if (typeof varValue === "string") {
          const substituted = project.substituteVariables(varValue);
          luaValue = toLuaStringLiteral(substituted);
        } else if (typeof varValue === "boolean") {
          luaValue = varValue ? "true" : "false";
        } else if (typeof varValue === "number") {
          luaValue = String(varValue);
        } else {
          throw new Error(`Unsupported global variable type for ${varName}: ${typeof varValue}`);
        }
        header += `local ${varName} = ${luaValue}\n`;
      }
      if (header) {
        header += "\n";
      }
    }
    return header + source;
  }
}

function buildMinificationOptions(overrides?: LuaMinificationConfig): OptimizationRuleOptions {
  if (!overrides) {
    return { ...releaseOptions };
  }
  const options: OptimizationRuleOptions = { ...releaseOptions, ...overrides };
  return options;
}

export class LuaCodeResource extends ImportedResourceBase {
  view: LuaCodeResourceView;
  filePath: string;
  dependencies: string[];
  preprocessResult: LuaPreprocessResult;

  constructor(
    filePath: string,
    inputSource: string,
    preprocessedSource: string,
    dependencies: string[],
    preprocessResult: LuaPreprocessResult,
  ) {
    super();
    this.view = new LuaCodeResourceView(inputSource, preprocessedSource);
    this.filePath = filePath;
    this.dependencies = dependencies;
    this.preprocessResult = preprocessResult;
  }

  dump(): void {
    console.log(`LuaCodeResource dump for file: ${this.filePath}`);
    // put on 1 line, show max 200 chars
    const singleLine = this.view.preprocessedSource.replace(/\r?\n/g, " ");
    const preview = singleLine.length > 200 ? singleLine.substring(0, 200) + "..." : singleLine;
    console.log(`  Content preview: ${preview}`);
  }

  getCodeArtifacts(project: TicbuildProjectCore): LuaCodeArtifacts {
    return this.view.getArtifacts(project);
  }

  getCodeSizeStats(project: TicbuildProjectCore): LuaCodeSizeStats {
    return this.view.getSizeStats(project);
  }

  getView(project: TicbuildProjectCore, chunks?: Tic80CartChunkTypeKey[]) {
    if (!chunks) {
      return this.view;
    }
    if (chunks.length !== 1 || (chunks[0] !== "CODE" && chunks[0] !== "CODE_COMPRESSED")) {
      throw new Error(`LuaCodeResource only supports CODE or CODE_COMPRESSED chunk view.`);
    }
    return this.view;
  }

  getDependencyList(): ExternalDependency[] {
    const uniqueDeps = Array.from(new Set(this.dependencies));
    return uniqueDeps.map((path) => ({
      path,
      reason: path === this.filePath ? "Imported Lua code file" : "Lua preprocessor dependency",
    }));
  }

  getPreprocessResult(): LuaPreprocessResult {
    return this.preprocessResult;
  }
}

// spec is assumed to be in the project.
export async function importLuaCode(project: TicbuildProjectCore, spec: ImportDefinition): Promise<LuaCodeResource> {
  const path = project.resolveImportPath(spec);
  const textContent = await readTextFileAsync(path); // reads as utf-8 text, but NB: tic80 only supports ASCII.

  const preprocessResult = await preprocessLuaCode(project, textContent, path);
  const preprocessedSource = preprocessResult.code;

  return new LuaCodeResource(path, textContent, preprocessedSource, preprocessResult.dependencies, preprocessResult);
}
