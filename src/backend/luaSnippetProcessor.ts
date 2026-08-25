import * as path from "node:path";
import {
  CodeResourceView,
  LUA_RELEASE_OPTIMIZATION_OPTIONS,
  MAX_OPTIMIZATION_OPTIONS,
  resolveLuaMinificationOptions,
} from "./importers/CodeResource";
import { LuaMinificationConfig, Manifest } from "./manifestTypes";
import { preprocessLuaCode } from "./luaPreprocessor";
import { TicbuildProjectCore } from "./projectCore";
import { AliasPassReport } from "../utils/lua/lua_alias_shared";
import { luaOptimizationRules } from "../utils/lua/lua_optimizer_rules";
import { LuaProcessOptions, OptimizationRuleOptions } from "../utils/lua/lua_processor";
import { CoalesceBool } from "../utils/utils";

export type LuaSnippetSettings = {
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

export type LuaSnippetSizeStats = {
  inputBytes: number;
  preprocessedBytes: number;
  minifiedBytes: number;
};

export type LuaSnippetResult = {
  inputSource: string;
  preprocessedSource: string;
  minifiedSource: string;
  dependencies: string[];
  sizes: LuaSnippetSizeStats;
  minificationReport: AliasPassReport;
  effectiveOptions: OptimizationRuleOptions;
  ruleStates: LuaOptimizationRuleState[];
};

export type LuaSnippetProjectConfig = {
  projectName: string;
  manifestPath: string;
  buildConfig: string;
  settings: LuaSnippetSettings;
  presets: {
    project: OptimizationRuleOptions;
    release: OptimizationRuleOptions;
    max: OptimizationRuleOptions;
  };
  ruleStates: LuaOptimizationRuleState[];
};

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
  settings: LuaSnippetSettings,
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
  });
}

export function getLuaSnippetProjectConfig(baseCore: TicbuildProjectCore): LuaSnippetProjectConfig {
  const projectOptions = resolveLuaMinificationOptions(baseCore.manifest.assembly.lua?.minification);
  const settings: LuaSnippetSettings = {
    minifyEnabled: CoalesceBool(baseCore.manifest.assembly.lua?.minify, false),
    minificationOverrides: cloneOptimizationOptions(projectOptions),
  };

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
  };
}

export async function processLuaSnippet(
  source: string,
  baseCore: TicbuildProjectCore,
  settings: LuaSnippetSettings,
  sourcePath: string = path.join(baseCore.projectDir, "__lua_optimizer_playground__.lua"),
  processOptions: LuaProcessOptions = { parseFailure: "throw" },
): Promise<LuaSnippetResult> {
  const core = createLuaSnippetCore(baseCore, settings);
  const preprocessed = await preprocessLuaCode(core, source, sourcePath, {
    quietParseFailures: processOptions.parseFailure === "throw",
  });
  const view = new CodeResourceView(
    source,
    preprocessed.code,
    preprocessed.minifyAllowedGlobalNames,
    undefined,
    preprocessed.sourceMap,
    preprocessed.minifyGlobalNamesToKeep,
  );
  const artifacts = view.getArtifacts(core, processOptions);
  const effectiveOptions = resolveLuaMinificationOptions(
    core.manifest.assembly.lua?.minification,
    preprocessed.minifyAllowedGlobalNames,
    preprocessed.minifyGlobalNamesToKeep,
  );

  return {
    inputSource: source,
    preprocessedSource: preprocessed.code,
    minifiedSource: artifacts.minifiedSource,
    dependencies: preprocessed.dependencies,
    sizes: {
      inputBytes: utf8ByteLength(source),
      preprocessedBytes: utf8ByteLength(preprocessed.code),
      minifiedBytes: utf8ByteLength(artifacts.minifiedSource),
    },
    minificationReport: artifacts.minificationReport,
    effectiveOptions,
    ruleStates: getLuaOptimizationRuleStates(effectiveOptions),
  };
}
