import * as path from "node:path";
import { AliasPassReport } from "../utils/lua/lua_alias_shared";
import { luaOptimizationRules } from "../utils/lua/lua_optimizer_rules";
import { LuaProcessOptions, OptimizationRuleOptions } from "../utils/lua/lua_processor";
import { CoalesceBool } from "../utils/utils";
import { toAbsoluteCanonicalPath } from "../utils/fileSystem";
import { GeneratedLuaSource } from "./ImportedResourceTypes";
import {
  CodeResourceView,
  LUA_RELEASE_OPTIMIZATION_OPTIONS,
  MAX_OPTIMIZATION_OPTIONS,
  resolveLuaMinificationOptions,
} from "./importers/CodeResource";
import { describeImportSource } from "./importSources";
import { transpileTypeScriptToLua } from "./importers/TypeScriptTranspiler";
import {
  kImportKind,
  LuaMinificationConfig,
  Manifest,
  TypeScriptImportConfig,
} from "./manifestTypes";
import { preprocessLuaCode } from "./luaPreprocessor";
import { TicbuildProjectCore } from "./projectCore";
import { createIdentitySourceMap } from "./sourceMap";

export type CodeSnippetLanguage = "lua" | "typescript";
export type CodeSnippetStage = "typescript" | "preprocessor" | "optimizer";

export type CodeSnippetSettings = {
  minifyEnabled: boolean;
  minificationOverrides: LuaMinificationConfig;
};

export type LuaOptimizationRuleState = {
  id: string;
  family: string;
  description: string;
  enabled: boolean;
  override: boolean | null;
};

export type TypeScriptSnippetProfile = {
  id: string;
  name: string;
  sourcePath: string;
  tsconfigPath?: string;
};

export type CodeSnippetSizeStats = {
  inputBytes: number;
  generatedBytes: number;
  preprocessedBytes: number;
  minifiedBytes: number;
};

export type LuaSnippetSizeStats = CodeSnippetSizeStats;

export type CodeSnippetResult = {
  language: CodeSnippetLanguage;
  sourcePath: string;
  authoredSource: string;
  // inputSource retains the CodeResource meaning: Lua at the language-neutral
  // pipeline boundary. For TypeScript this is the generated Lua source.
  inputSource: string;
  generatedLuaSource: string;
  preprocessedSource: string;
  minifiedSource: string;
  dependencies: string[];
  sizes: CodeSnippetSizeStats;
  minificationReport: AliasPassReport;
  effectiveOptions: OptimizationRuleOptions;
  ruleStates: LuaOptimizationRuleState[];
};

export type LuaSnippetResult = CodeSnippetResult;

export type CodeSnippetProjectConfig = {
  projectName: string;
  manifestPath: string;
  buildConfig: string;
  settings: CodeSnippetSettings;
  presets: {
    project: OptimizationRuleOptions;
    release: OptimizationRuleOptions;
    max: OptimizationRuleOptions;
  };
  ruleStates: LuaOptimizationRuleState[];
  typeScriptProfiles: TypeScriptSnippetProfile[];
  defaultTypeScriptProfileId: string;
};

export type LuaSnippetProjectConfig = CodeSnippetProjectConfig;

export type CodeSnippetRequest = {
  language: CodeSnippetLanguage;
  source: string;
  typeScriptProfileId?: string;
  sourcePath?: string;
};

export type CodeSnippetProcessOptions = LuaProcessOptions & {
  // Vite's ESM config runner cannot use the CLI's CommonJS __dirname-based
  // package lookup, so dev-server callers provide the same declaration path.
  typeScriptBuiltinsPath?: string;
};

const DEFAULT_TYPESCRIPT_PROFILE_ID = "defaults";

type ResolvedTypeScriptSnippetProfile = TypeScriptSnippetProfile & {
  typescriptConfig?: TypeScriptImportConfig;
};

export class CodeSnippetProcessingError extends Error {
  readonly stage: CodeSnippetStage;
  readonly index?: number;
  readonly line?: number;
  readonly column?: number;

  constructor(stage: CodeSnippetStage, cause: unknown) {
    const record = isRecord(cause) ? cause : undefined;
    super(typeof record?.message === "string" ? record.message : String(cause));
    this.name = typeof record?.name === "string" ? record.name : "Error";
    this.stage = stage;
    this.index = typeof record?.index === "number" ? record.index : undefined;
    this.line = typeof record?.line === "number" ? record.line : undefined;
    this.column = typeof record?.column === "number" ? record.column : undefined;
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepCloneManifest(manifest: Manifest): Manifest {
  return JSON.parse(JSON.stringify(manifest)) as Manifest;
}

function cloneOptimizationOptions(options: OptimizationRuleOptions): OptimizationRuleOptions {
  return {
    ...options,
    functionNamesToKeep: [...options.functionNamesToKeep],
    tableEntryKeysToRename: [...options.tableEntryKeysToRename],
    globalSymbolsToRename: [...(options.globalSymbolsToRename ?? [])],
    globalSymbolsToKeep: [...(options.globalSymbolsToKeep ?? [])],
    ruleOverrides: { ...(options.ruleOverrides ?? {}) },
  };
}

function utf8ByteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

export function getLuaOptimizationRuleStates(options: OptimizationRuleOptions): LuaOptimizationRuleState[] {
  const ruleOverrides = options.ruleOverrides as Readonly<Record<string, boolean>> | undefined;
  return luaOptimizationRules.map((rule) => {
    const override = ruleOverrides?.[rule.id] ?? null;
    return {
      id: rule.id,
      family: rule.family,
      description: rule.description,
      enabled: override ?? rule.defaultEnabled(options),
      override,
    };
  });
}

export function createLuaSnippetCore(
  baseCore: TicbuildProjectCore,
  settings: CodeSnippetSettings,
): TicbuildProjectCore {
  const manifest = deepCloneManifest(baseCore.manifest);
  if (!manifest.assembly.lua) {
    manifest.assembly.lua = {};
  }

  manifest.assembly.lua.minify = settings.minifyEnabled;
  manifest.assembly.lua.minification = {
    ...(manifest.assembly.lua.minification ?? {}),
    ...settings.minificationOverrides,
  };

  return new TicbuildProjectCore({
    manifest,
    manifestPath: baseCore.manifestPath,
    projectDir: baseCore.projectDir,
    buildConfigName: baseCore.selectedBuildConfig,
    overrideVariables: baseCore.overrideVariables,
    processEnvironment: baseCore.processEnvironment,
  });
}

function getTypeScriptProfiles(baseCore: TicbuildProjectCore): ResolvedTypeScriptSnippetProfile[] {
  const profiles: ResolvedTypeScriptSnippetProfile[] = [{
    id: DEFAULT_TYPESCRIPT_PROFILE_ID,
    name: "Built-in defaults",
    sourcePath: path.join(baseCore.projectDir, "__typescript_playground__.ts"),
  }];

  for (const importDefinition of baseCore.manifest.imports) {
    if (importDefinition.kind !== kImportKind.key.TypeScriptCode) {
      continue;
    }
    const source = describeImportSource(baseCore, importDefinition);
    if (source.sourceKind === "value") {
      throw new Error(`TypeScript import ${importDefinition.name} requires a file-backed source`);
    }
    profiles.push({
      id: `import:${importDefinition.name}`,
      name: importDefinition.name,
      sourcePath: source.filePath,
      tsconfigPath: importDefinition.typescript
        ? toAbsoluteCanonicalPath(
          baseCore.substituteVariables(importDefinition.typescript.tsconfig),
          baseCore.projectDir,
        )
        : undefined,
      typescriptConfig: importDefinition.typescript,
    });
  }
  return profiles;
}

export function getCodeSnippetProjectConfig(baseCore: TicbuildProjectCore): CodeSnippetProjectConfig {
  const projectOptions = resolveLuaMinificationOptions(baseCore.manifest.assembly.lua?.minification);
  const settings: CodeSnippetSettings = {
    minifyEnabled: CoalesceBool(baseCore.manifest.assembly.lua?.minify, false),
    minificationOverrides: cloneOptimizationOptions(projectOptions),
  };
  const typeScriptProfiles = getTypeScriptProfiles(baseCore);

  return {
    projectName: baseCore.manifest.project.name,
    manifestPath: baseCore.manifestPath,
    buildConfig: baseCore.selectedBuildConfig,
    settings,
    presets: {
      project: cloneOptimizationOptions(projectOptions),
      release: cloneOptimizationOptions(LUA_RELEASE_OPTIMIZATION_OPTIONS),
      max: cloneOptimizationOptions(MAX_OPTIMIZATION_OPTIONS),
    },
    ruleStates: getLuaOptimizationRuleStates(projectOptions),
    typeScriptProfiles: typeScriptProfiles.map(({ typescriptConfig: _typescriptConfig, ...profile }) => profile),
    defaultTypeScriptProfileId: typeScriptProfiles[1]?.id ?? DEFAULT_TYPESCRIPT_PROFILE_ID,
  };
}

export const getLuaSnippetProjectConfig = getCodeSnippetProjectConfig;

function resolveTypeScriptProfile(
  baseCore: TicbuildProjectCore,
  profileId: string | undefined,
): ResolvedTypeScriptSnippetProfile {
  const profiles = getTypeScriptProfiles(baseCore);
  const selectedId = profileId ?? profiles[1]?.id ?? DEFAULT_TYPESCRIPT_PROFILE_ID;
  const profile = profiles.find((candidate) => candidate.id === selectedId);
  if (!profile) {
    throw new Error(`TypeScript playground profile not found: ${selectedId}`);
  }
  return profile;
}

function generateLuaSource(
  request: CodeSnippetRequest,
  core: TicbuildProjectCore,
  processOptions: CodeSnippetProcessOptions,
): GeneratedLuaSource {
  if (request.language === "lua") {
    const sourcePath = request.sourcePath ?? path.join(core.projectDir, "__lua_optimizer_playground__.lua");
    return {
      source: request.source,
      sourcePath,
      sourceMap: createIdentitySourceMap(request.source, sourcePath),
    };
  }

  const profile = resolveTypeScriptProfile(core, request.typeScriptProfileId);
  try {
    return transpileTypeScriptToLua(
      core,
      profile.sourcePath,
      request.source,
      profile.typescriptConfig,
      processOptions.typeScriptBuiltinsPath,
    );
  } catch (error) {
    throw new CodeSnippetProcessingError("typescript", error);
  }
}

function collectDependencies(generated: GeneratedLuaSource, preprocessedDependencies: readonly string[]): string[] {
  return Array.from(new Set([
    ...(generated.dependencies ?? []).map((dependency) => dependency.path),
    ...preprocessedDependencies,
  ]));
}

export async function processCodeSnippet(
  request: CodeSnippetRequest,
  baseCore: TicbuildProjectCore,
  settings: CodeSnippetSettings,
  processOptions: CodeSnippetProcessOptions = { parseFailure: "throw" },
): Promise<CodeSnippetResult> {
  const core = createLuaSnippetCore(baseCore, settings);
  const generated = generateLuaSource(request, core, processOptions);

  let preprocessed;
  try {
    preprocessed = await preprocessLuaCode(core, generated.source, generated.sourcePath, {
      sourceMap: generated.sourceMap,
      quietParseFailures: processOptions.parseFailure === "throw",
    });
  } catch (error) {
    throw new CodeSnippetProcessingError("preprocessor", error);
  }

  const view = new CodeResourceView(
    generated.source,
    preprocessed.code,
    preprocessed.minifyAllowedGlobalNames,
    generated.sourceMap,
    preprocessed.sourceMap,
    preprocessed.minifyGlobalNamesToKeep,
  );

  let artifacts;
  try {
    artifacts = view.getArtifacts(core, processOptions);
  } catch (error) {
    throw new CodeSnippetProcessingError("optimizer", error);
  }

  const effectiveOptions = resolveLuaMinificationOptions(
    core.manifest.assembly.lua?.minification,
    preprocessed.minifyAllowedGlobalNames,
    preprocessed.minifyGlobalNamesToKeep,
  );

  return {
    language: request.language,
    sourcePath: generated.sourcePath,
    authoredSource: request.source,
    inputSource: generated.source,
    generatedLuaSource: generated.source,
    preprocessedSource: preprocessed.code,
    minifiedSource: artifacts.minifiedSource,
    dependencies: collectDependencies(generated, preprocessed.dependencies),
    sizes: {
      inputBytes: utf8ByteLength(request.source),
      generatedBytes: utf8ByteLength(generated.source),
      preprocessedBytes: utf8ByteLength(preprocessed.code),
      minifiedBytes: utf8ByteLength(artifacts.minifiedSource),
    },
    minificationReport: artifacts.minificationReport,
    effectiveOptions,
    ruleStates: getLuaOptimizationRuleStates(effectiveOptions),
  };
}

// used only by repl which is lua-only.
export function processLuaSnippet(
  source: string,
  baseCore: TicbuildProjectCore,
  settings: CodeSnippetSettings,
  sourcePath: string = path.join(baseCore.projectDir, "__lua_optimizer_playground__.lua"),
  processOptions: LuaProcessOptions = { parseFailure: "throw" },
): Promise<LuaSnippetResult> {
  return processCodeSnippet(
    { language: "lua", source, sourcePath },
    baseCore,
    settings,
    processOptions,
  );
}
