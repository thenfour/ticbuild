// TODO: make this structured to actually run some rules.

import { defineEnum } from "../utils/enum";
import { OptimizationRuleOptions } from "../utils/lua/lua_processor";
import { SourceEncodingKey } from "../utils/encoding/codecRegistry";
import { Tic80CartChunkTypeKey } from "../utils/tic80/tic80";

// TIC-80 cartridge chunk types.
// https://github.com/nesbox/TIC-80/wiki/.tic-File-Format

// importers... maybe an enum later?
export const kImportKind = defineEnum({
  LuaCode: {
    value: "LuaCode",
  },
  Tic80Cartridge: {
    value: "Tic80Cartridge",
  },
  binary: {
    value: "binary",
  },
  text: {
    value: "text",
  },
} as const); // "LuaCode" | "Tic80Cartridge";

export type ImportKindKey = typeof kImportKind.$key;

export interface ProjectConfig {
  name: string;
  launchArgs?: string[];
  includeDirs?: string[];
  importDirs?: string[];
  binDir: string;
  objDir: string;
  outputCartName: string;
}

export interface ImportDefinition {
  name: string;
  path?: string;
  kind?: ImportKindKey;
  chunks?: Tic80CartChunkTypeKey[];
  sourceEncoding?: SourceEncodingKey;
  value?: string;
}

// specifies a view of an imported resource; containing possibly a subset of its supported chunks.
export interface AssetReference {
  import: string;
  chunks?: Tic80CartChunkTypeKey[]; // if omitted, "all" chunks are assumed
}

export interface AssemblyBlock {
  chunks?: Tic80CartChunkTypeKey[];
  bank?: number;
  asset: string | AssetReference;
  code?: CodeAssemblyOptions;
}

export type CodeAssemblyOptions = {
  emitGlobals?: boolean;
};

export type LuaMinificationConfig = Partial<OptimizationRuleOptions>;

export interface LuaAssemblyConfig {
  minify?: boolean;
  minification?: LuaMinificationConfig;
  globals?: Record<string, string | number | boolean>;
}

export interface AssemblyConfig {
  lua?: LuaAssemblyConfig;
  blocks: AssemblyBlock[];
}

export interface BuildConfiguration {
  project?: Partial<ProjectConfig>;
  variables?: Record<string, string>;
  assembly?: Partial<AssemblyConfig>;
}

export interface Manifest {
  project: ProjectConfig;
  variables?: Record<string, string>;
  imports: ImportDefinition[];
  assembly: AssemblyConfig;
  buildConfigurations?: Record<string, BuildConfiguration>;
}

export type VariableInfo = {
  name: string;
  rawValue: string; // value as specified in manifest
  resolvedValue: string; // variables substituted
};

// result of processing the raw manifest to ensure defaults, auto variables,
// substituting variables, deducing kinds, etc....
export type ResolvedManifest = {
  manifest: Manifest;
  selectedBuildConfig?: string | undefined;
  variables: Map<string, VariableInfo>;
};

export const kCommonVariables = defineEnum({
  projectDir: { value: "project.projectDir" },
  manifestPath: { value: "project.manifestPath" },
  outputCartName: { value: "project.outputCartName" },
} as const);
