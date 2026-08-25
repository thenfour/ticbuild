import { constants as zlibConstants, deflateSync } from "node:zlib";
import { zlibAsync as zopfliZlibAsync, ZopfliOptions } from "@gfx/zopfli";
import { toLuaStringLiteral } from "../../utils/lua/lua_fundamentals";
import { AliasPassReport, createEmptyAliasPassReport } from "../../utils/lua/lua_alias_shared";
import { OptimizationRuleOptions, processLuaWithReport } from "../../utils/lua/lua_processor";
import { LuaTransformMap } from "../../utils/lua/lua_transform_map";
import { Tic80CartChunkTypeKey } from "../../utils/tic80/tic80";
import { CoalesceBool } from "../../utils/utils";
import {
  ChunkDataResult,
  ExternalDependency,
  GeneratedLuaSource,
  ImportedResourceBase,
  ResourceViewBase,
} from "../ImportedResourceTypes";
import {
  LuaCodeImportResolver,
  LuaPreprocessResult,
  preprocessLuaCode,
} from "../luaPreprocessor";
import { CodeAssemblyOptions, LuaCompressionMode, LuaMinificationConfig } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import {
  createIdentitySourceMap,
  LuaPreprocessorSourceMap,
  mapPreprocessedOffset,
  SourceMapBuilder,
} from "../sourceMap";

export const LUA_RELEASE_OPTIMIZATION_OPTIONS: OptimizationRuleOptions = {
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
  globalSymbolsToRename: [],
  globalSymbolRenaming: "opt-in",
} as const;

export const MAX_OPTIMIZATION_OPTIONS: OptimizationRuleOptions = {
  stripComments: true,
  maxIndentLevel: 1,
  lineBehavior: "tight2",
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
  globalSymbolsToRename: [],
  globalSymbolRenaming: "opt-in",
} as const;

const zopfliMaxOptions: ZopfliOptions = {
  verbose: false,
  verbose_more: false,
  numiterations: 15,
  blocksplitting: true,
  blocksplittingmax: 15,
} as const;

// inputSource is Lua at the language-neutral pipeline boundary. For a Lua
// resource it is the source file; for future languages it is generated Lua.
export type CodeArtifacts = {
  inputSource: string;
  inputSourceMap: LuaPreprocessorSourceMap;
  preprocessedSource: string;
  preprocessedSourceMap: LuaPreprocessorSourceMap;
  minifiedSource: string;
  minifiedSourceMap: LuaPreprocessorSourceMap;
  minificationReport: AliasPassReport;
};

export type CodeSizeStats = {
  inputBytes: number;
  preprocessedBytes: number;
  minifiedBytes: number;
};

export class CodeResourceView extends ResourceViewBase {
  inputSource: string;
  inputSourceMap: LuaPreprocessorSourceMap;
  preprocessedSource: string;
  preprocessedSourceMap: LuaPreprocessorSourceMap;
  minifyAllowedGlobalNames: string[];
  minifyGlobalNamesToKeep: string[];
  private cachedMinifiedSource: string | null = null;
  private cachedMinifiedSourceMap: LuaPreprocessorSourceMap | null = null;
  private cachedMinificationReport: AliasPassReport | null = null;
  private cachedCompressedBytes: ChunkDataResult | null = null;
  private cachedCompressedSource: string | null = null;
  private cachedCompressionMode: LuaCompressionMode | null = null;
  private cachedMinifyEnabled: boolean | null = null;

  constructor(
    inputSource: string,
    preprocessedSource: string,
    minifyAllowedGlobalNames: string[] = [],
    inputSourceMap: LuaPreprocessorSourceMap = createIdentitySourceMap(inputSource, "<generated>"),
    preprocessedSourceMap: LuaPreprocessorSourceMap = createIdentitySourceMap(preprocessedSource, "<generated>"),
    minifyGlobalNamesToKeep: string[] = [],
  ) {
    super();
    this.inputSource = inputSource;
    this.inputSourceMap = inputSourceMap;
    this.preprocessedSource = preprocessedSource;
    this.preprocessedSourceMap = preprocessedSourceMap;
    this.minifyAllowedGlobalNames = minifyAllowedGlobalNames;
    this.minifyGlobalNamesToKeep = minifyGlobalNamesToKeep;
  }

  getDataForChunk(
    project: TicbuildProjectCore,
    chunkType: Tic80CartChunkTypeKey,
    options?: CodeAssemblyOptions,
  ): ChunkDataResult {
    // TODO: validate ASCII. no high-bit chars.
    if (chunkType !== "CODE" && chunkType !== "CODE_COMPRESSED") {
      throw new Error(`CodeResourceView only supports CODE or CODE_COMPRESSED chunks.`);
    }
    const minifyEnabled = CoalesceBool(project.manifest.assembly.lua?.minify, true);
    const emitGlobals = options?.emitGlobals !== false;
    const minifiedSource = this.getMinifiedResult(project, minifyEnabled, emitGlobals).source;

    if (chunkType === "CODE_COMPRESSED") {
      const compressionMode = normalizeCompressionMode(options?.compressionMode);
      const compressed = this.getCompressedBytes(minifiedSource, compressionMode);
      if (compressed instanceof Promise) {
        return compressed.then((bytes) => new Uint8Array(bytes));
      }
      return new Uint8Array(compressed);
    }

    return new TextEncoder().encode(minifiedSource);
  }

  getSupportedChunkTypes(): Tic80CartChunkTypeKey[] {
    return ["CODE", "CODE_COMPRESSED"];
  }

  getParallelChunkTypes(): Tic80CartChunkTypeKey[] {
    return ["CODE"];
  }

  getArtifacts(project: TicbuildProjectCore): CodeArtifacts {
    const minifyEnabled = CoalesceBool(project.manifest.assembly.lua?.minify, true);
    const minified = this.getMinifiedResult(project, minifyEnabled, true);
    return {
      inputSource: this.inputSource,
      inputSourceMap: this.inputSourceMap,
      preprocessedSource: this.preprocessedSource,
      preprocessedSourceMap: this.preprocessedSourceMap,
      minifiedSource: minified.source,
      minifiedSourceMap: minified.sourceMap,
      minificationReport: minified.report,
    };
  }

  getSizeStats(project: TicbuildProjectCore): CodeSizeStats {
    const artifacts = this.getArtifacts(project);
    const encoder = new TextEncoder();
    return {
      inputBytes: encoder.encode(artifacts.inputSource).length,
      preprocessedBytes: encoder.encode(artifacts.preprocessedSource).length,
      minifiedBytes: encoder.encode(artifacts.minifiedSource).length,
    };
  }

  private getMinifiedResult(
    project: TicbuildProjectCore,
    minifyEnabled: boolean,
    emitGlobals: boolean,
  ): { source: string; sourceMap: LuaPreprocessorSourceMap; report: AliasPassReport } {
    if (
      this.cachedMinifyEnabled === minifyEnabled &&
      this.cachedMinifiedSource !== null &&
      this.cachedMinifiedSourceMap !== null &&
      this.cachedMinificationReport !== null &&
      emitGlobals
    ) {
      return {
        source: this.cachedMinifiedSource,
        sourceMap: this.cachedMinifiedSourceMap,
        report: this.cachedMinificationReport,
      };
    }

    const globalsHeader = emitGlobals ? this.createGlobalsHeader(project) : "";
    let code = globalsHeader + this.preprocessedSource;
    let sourceMap = prependGeneratedText(globalsHeader, this.preprocessedSource, this.preprocessedSourceMap);
    let report = createEmptyAliasPassReport();
    if (minifyEnabled) {
      const options = buildMinificationOptions(
        project.manifest.assembly.lua?.minification,
        this.minifyAllowedGlobalNames,
        this.minifyGlobalNamesToKeep,
      );
      const processed = processLuaWithReport(code, options);
      code = processed.code;
      sourceMap = composeLuaTransformSourceMap(processed.transformMap, code, sourceMap);
      report = processed.report;
    }
    const metadataHeader = this.createMetadataHeader(project);
    sourceMap = prependGeneratedText(metadataHeader, code, sourceMap);
    code = metadataHeader + code;

    if (emitGlobals) {
      this.cachedMinifyEnabled = minifyEnabled;
      this.cachedMinifiedSource = code;
      this.cachedMinifiedSourceMap = sourceMap;
      this.cachedMinificationReport = report;
      this.cachedCompressedBytes = null;
      this.cachedCompressedSource = null;
      this.cachedCompressionMode = null;
    }
    return { source: code, sourceMap, report };
  }

  private getCompressedBytes(minifiedSource: string, compressionMode: "default" | "zlib-max"): Uint8Array;
  private getCompressedBytes(minifiedSource: string, compressionMode: "zopfli"): Promise<Uint8Array>;
  private getCompressedBytes(minifiedSource: string, compressionMode: LuaCompressionMode): ChunkDataResult;
  private getCompressedBytes(minifiedSource: string, compressionMode: LuaCompressionMode): ChunkDataResult {
    if (
      this.cachedCompressedBytes &&
      this.cachedCompressedSource === minifiedSource &&
      this.cachedCompressionMode === compressionMode
    ) {
      return this.cachedCompressedBytes;
    }
    const rawBytes = new TextEncoder().encode(minifiedSource);
    const compressed =
      compressionMode === "zopfli"
        ? zopfliZlibAsync(rawBytes, zopfliMaxOptions).then((bytes) => new Uint8Array(bytes))
        : new Uint8Array(
          compressionMode === "zlib-max"
            ? deflateSync(Buffer.from(rawBytes), {
              level: zlibConstants.Z_BEST_COMPRESSION,
              memLevel: zlibConstants.Z_MAX_MEMLEVEL,
              windowBits: zlibConstants.Z_MAX_WINDOWBITS,
              strategy: zlibConstants.Z_DEFAULT_STRATEGY,
            })
            : deflateSync(Buffer.from(rawBytes)),
        );
    this.cachedCompressedBytes = compressed;
    this.cachedCompressedSource = minifiedSource;
    this.cachedCompressionMode = compressionMode;
    return this.cachedCompressedBytes;
  }

  private createGlobalsHeader(project: TicbuildProjectCore): string {
    let header = "";
    if (project.manifest.assembly.lua?.globals) {
      const globals = project.manifest.assembly.lua.globals;
      for (const [varName, varValue] of Object.entries(globals)) {
        let luaValue: string;
        if (typeof varValue === "string") {
          luaValue = toLuaStringLiteral(project.substituteVariables(varValue));
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
    return header;
  }

  private createMetadataHeader(project: TicbuildProjectCore): string {
    const metadata = project.manifest.project.metadata;
    if (!metadata) {
      return "";
    }

    const entries = Object.entries(metadata);
    if (entries.length === 0) {
      return "";
    }

    const maxKeyLength = entries.reduce((longest, [key]) => Math.max(longest, key.length), 0);
    const lines = entries.map(([key, value]) => {
      const substitutedValue = project.substituteVariables(value);
      if (substitutedValue.includes("\n") || substitutedValue.includes("\r")) {
        throw new Error(`Project metadata ${key} must be a single line`);
      }
      const spacing = " ".repeat(maxKeyLength - key.length + 1);
      return `-- ${key}:${spacing}${substitutedValue}`;
    });

    return `${lines.join("\n")}\n\n`;
  }
}

function prependGeneratedText(
  prefix: string,
  source: string,
  sourceMap: LuaPreprocessorSourceMap,
): LuaPreprocessorSourceMap {
  if (!prefix) {
    return sourceMap;
  }
  const builder = new SourceMapBuilder(0, [], sourceMap.sources ?? {});
  builder.appendGenerated(prefix, null);
  builder.appendMappedSlice(source, sourceMap, 0);
  return builder.toSourceMap(prefix + source);
}

function composeLuaTransformSourceMap(
  transform: LuaTransformMap,
  output: string,
  inputMap: LuaPreprocessorSourceMap,
): LuaPreprocessorSourceMap {
  if (transform.inputLength !== inputMap.preprocessedFile.charLength || transform.outputLength !== output.length) {
    throw new Error("Lua minifier source map does not match its input or output source");
  }
  const builder = new SourceMapBuilder(0, [], inputMap.sources ?? {});
  let cursor = 0;
  for (const segment of transform.segments) {
    if (segment.outputBegin > cursor) {
      builder.appendGenerated(output.slice(cursor, segment.outputBegin), null);
    }
    const inputOrigin = mapPreprocessedOffset(inputMap, segment.inputOffset, "right");
    const authoredName = segment.originalName === undefined
      ? undefined
      : inputOrigin?.name ?? segment.originalName;
    builder.appendGenerated(
      output.slice(segment.outputBegin, segment.outputEnd),
      inputOrigin
        ? { file: inputOrigin.file, offset: inputOrigin.offset, name: authoredName }
        : null,
    );
    cursor = segment.outputEnd;
  }
  if (cursor < output.length) {
    builder.appendGenerated(output.slice(cursor), null);
  }
  return builder.toSourceMap(output);
}

function buildMinificationOptions(
  overrides?: LuaMinificationConfig,
  minifyAllowedGlobalNames: string[] = [],
  minifyGlobalNamesToKeep: string[] = [],
): OptimizationRuleOptions {
  const {
    renameSpecifiedGlobalSymbols,
    ...canonicalOverrides
  } = overrides ?? {};
  const options: OptimizationRuleOptions = {
    ...LUA_RELEASE_OPTIMIZATION_OPTIONS,
    ...canonicalOverrides,
  };
  options.globalSymbolRenaming = canonicalOverrides.globalSymbolRenaming
    ?? (renameSpecifiedGlobalSymbols === false ? "off" : "opt-in");
  options.globalSymbolsToRename = [
    ...(canonicalOverrides.globalSymbolsToRename
      ?? LUA_RELEASE_OPTIMIZATION_OPTIONS.globalSymbolsToRename
      ?? []),
    ...minifyAllowedGlobalNames,
  ];
  options.globalSymbolsToKeep = [
    ...(canonicalOverrides.globalSymbolsToKeep
      ?? LUA_RELEASE_OPTIMIZATION_OPTIONS.globalSymbolsToKeep
      ?? []),
    ...minifyGlobalNamesToKeep,
  ];
  return options;
}

function normalizeCompressionMode(mode: LuaCompressionMode | undefined): LuaCompressionMode {
  if (!mode) {
    return "default";
  }
  if (mode === "default" || mode === "zlib-max" || mode === "zopfli") {
    return mode;
  }
  throw new Error(`Unsupported Lua compression mode: ${mode}`);
}

export type InitializedCodeResource = {
  generatedLuaSource: string;
  generatedLuaSourceMap: LuaPreprocessorSourceMap;
  dependencies: string[];
  preprocessResult: LuaPreprocessResult;
};

export abstract class CodeResource extends ImportedResourceBase {
  readonly filePath: string;
  readonly sourceText: string;
  dependencies: string[] = [];
  private dependencyReasons = new Map<string, string>();
  private codeView: CodeResourceView | undefined;
  private preprocessResult: LuaPreprocessResult | undefined;
  private generatedLuaPromise: Promise<GeneratedLuaSource> | undefined;

  protected constructor(filePath: string, sourceText: string, initialized?: InitializedCodeResource) {
    super();
    this.filePath = filePath;
    this.sourceText = sourceText;
    if (initialized) {
      this.setPreprocessResult(
        initialized.generatedLuaSource,
        initialized.generatedLuaSourceMap,
        initialized.dependencies,
        initialized.preprocessResult,
      );
    }
  }

  protected abstract generateLuaSource(project: TicbuildProjectCore): Promise<GeneratedLuaSource>;
  protected abstract getInputDependencyReason(): string;

  async getGeneratedLuaSource(project: TicbuildProjectCore): Promise<GeneratedLuaSource> {
    if (!this.generatedLuaPromise) {
      this.generatedLuaPromise = this.generateLuaSource(project);
    }
    return await this.generatedLuaPromise;
  }

  async initialize(project: TicbuildProjectCore, resolveCodeImport: LuaCodeImportResolver): Promise<void> {
    if (this.codeView) {
      return;
    }
    const generated = await this.getGeneratedLuaSource(project);
    const preprocessResult = await preprocessLuaCode(project, generated.source, generated.sourcePath, {
      resolveCodeImport,
      sourceMap: generated.sourceMap,
    });
    const dependencyPaths = [
      ...(generated.dependencies?.map((dependency) => dependency.path) ?? []),
      ...preprocessResult.dependencies,
    ];
    this.setPreprocessResult(
      generated.source,
      generated.sourceMap,
      dependencyPaths,
      preprocessResult,
      generated.dependencies,
    );
  }

  get view(): CodeResourceView {
    if (!this.codeView) {
      throw new Error(`${this.constructor.name} has not completed the Lua code pipeline.`);
    }
    return this.codeView;
  }

  dump(): void {
    console.log(`${this.constructor.name} dump for file: ${this.filePath}`);
    const singleLine = this.view.preprocessedSource.replace(/\r?\n/g, " ");
    const preview = singleLine.length > 200 ? singleLine.substring(0, 200) + "..." : singleLine;
    console.log(`  Content preview: ${preview}`);
  }

  getCodeArtifacts(project: TicbuildProjectCore): CodeArtifacts {
    return this.view.getArtifacts(project);
  }

  getCodeSizeStats(project: TicbuildProjectCore): CodeSizeStats {
    return this.view.getSizeStats(project);
  }

  getView(project: TicbuildProjectCore, chunks?: Tic80CartChunkTypeKey[]): ResourceViewBase {
    if (chunks && (chunks.length !== 1 || (chunks[0] !== "CODE" && chunks[0] !== "CODE_COMPRESSED"))) {
      throw new Error(`${this.constructor.name} only supports CODE or CODE_COMPRESSED chunk view.`);
    }
    return this.view;
  }

  getDependencyList(): ExternalDependency[] {
    const uniqueDeps = Array.from(new Set(this.dependencies));
    return uniqueDeps.map((dependencyPath) => ({
      path: dependencyPath,
      reason:
        dependencyPath === this.filePath
          ? this.getInputDependencyReason()
          : (this.dependencyReasons.get(dependencyPath) ?? "Lua preprocessor dependency"),
    }));
  }

  getPreprocessResult(): LuaPreprocessResult {
    if (!this.preprocessResult) {
      throw new Error(`${this.constructor.name} has not completed the Lua code pipeline.`);
    }
    return this.preprocessResult;
  }

  supportsLuaSymbolIndex(): boolean {
    return true;
  }

  private setPreprocessResult(
    generatedLuaSource: string,
    generatedLuaSourceMap: LuaPreprocessorSourceMap,
    dependencies: string[],
    preprocessResult: LuaPreprocessResult,
    dependencyReasons: ExternalDependency[] = [],
  ): void {
    this.dependencies = dependencies;
    this.dependencyReasons = new Map(dependencyReasons.map((dependency) => [dependency.path, dependency.reason]));
    this.preprocessResult = preprocessResult;
    this.codeView = new CodeResourceView(
      generatedLuaSource,
      preprocessResult.code,
      preprocessResult.minifyAllowedGlobalNames,
      generatedLuaSourceMap,
      preprocessResult.sourceMap,
      preprocessResult.minifyGlobalNamesToKeep,
    );
  }
}
