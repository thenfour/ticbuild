// a lower-level layer to avoid circular dependencies.
// provides the basic utils required to execute builds.

import { canonicalizePath, isAbsolutePath, joinPathParts, resolveFileWithSearchPaths } from "../utils/fileSystem";
import { Tic80CartChunkTypeKey } from "../utils/tic80/tic80";
import { extractVariablesFromObject } from "../utils/utils";
import { AssetReference, ImportDefinition, kImportKind, Manifest, VariableInfo } from "./manifestTypes";

export function deduceImportKindFromPath(path: string | undefined): string | undefined {
  if (!path) {
    return undefined;
  }
  if (path.endsWith(".tic")) {
    return kImportKind.key.Tic80Cartridge;
  }
  if (path.endsWith(".lua")) {
    return kImportKind.key.LuaCode;
  }
  return undefined;
}

// export function deduceAssemblerKindFromAssetReference(assetRef: AssetReference): string | undefined {
//   const importKind = assetRef.import;
//   if (importKind === kImportKind.key.LuaCode) {
//     return kAssemblerKind.key.LuaCode;
//   }
//   // simple for now.
//   return kAssemblerKind.key.BinaryCopy;
// }

// "import:name.here"
// "import:music-imported-cart:MUSIC_WAVEFORMS"
// "import:music-imported-cart:MUSIC_WAVEFORMS,CODE,SPRITES"
export function canonicalizeAssetImport(asset: string | AssetReference): AssetReference {
  if (typeof asset !== "string") {
    return asset; // assume already canonical
  }

  // Handle shorthand: "import:music-imported-cart:MUSIC_WAVEFORMS,CODE,SPRITES"
  if (!asset.startsWith("import:")) {
    //throw new Error(`Invalid asset import shorthand: ${asset}`);
    return { import: asset };
  }
  const parts = asset.split(":");
  // if (parts.length < 2) {
  //   throw new Error(`Invalid asset import shorthand: ${asset}`);
  // }

  const importName = parts[1];
  const chunks: undefined | Tic80CartChunkTypeKey[] =
    parts.length > 2 ? (parts[2].split(",") as Tic80CartChunkTypeKey[]) : undefined;

  return {
    import: importName,
    chunks,
  };
}

// similar to visual studio's $(VariableName) substitution.
// recursive substitution is possible; throws if circular.
// prioritizes build config overrides if selected.
export function substituteVariables(manifest: Manifest, s: string): string {
  let result = s;
  const varPattern = /\$\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  const seenVars = new Set<string>();
  while ((match = varPattern.exec(result)) !== null) {
    const varName = match[1];
    if (seenVars.has(varName)) {
      throw new Error(`Circular variable reference detected for variable: ${varName}`);
    }
    seenVars.add(varName);

    const varValue = manifest.variables?.[varName];
    if (varValue === undefined) {
      throw new Error(`Undefined variable: ${varName}`);
    }
    result = result.replace(match[0], varValue);
    varPattern.lastIndex = 0; // reset to start for next iteration
  }
  return result;
}

// processes on demand (not cached)
function calculateAllVariables(manifest: Manifest): Map<string, VariableInfo> {
  const ret = new Map<string, VariableInfo>();
  for (const [name, rawValue] of Object.entries(manifest.variables || {})) {
    const resolvedValue = substituteVariables(manifest, rawValue);
    ret.set(name, { name, rawValue, resolvedValue });
  }
  return ret;
}

export function calculateVars(
  manifest: Manifest,
  manifestPath: string,
  projectDir: string,
  overrideVariables?: Record<string, string>,
  buildConfigName?: string,
) {
  // add variables for non-array leafs in the build config.
  // for example { project: { binDir: "..." } } adds a variable "project.binDir"
  // { assembly: { lua: { minify: true } } } adds "assembly.lua.minify" etc.
  // but any array encountered is not processed for variables.
  manifest.variables = manifest.variables || {};
  // todo: possibly support ignored paths (right now all vars are basically duplicated as "var" and "variables.var".)
  const extractedVars = extractVariablesFromObject(manifest);
  for (const [k, v] of extractedVars.entries()) {
    manifest.variables[k] = v;
  }

  // apply override variables from options
  if (overrideVariables) {
    for (const [key, value] of Object.entries(overrideVariables)) {
      manifest.variables[key] = value;
    }
  }

  const setAutomaticVariable = (name: string, value: string) => {
    manifest.variables![name] = value;
  };

  setAutomaticVariable("project.manifestPath", manifestPath);
  setAutomaticVariable("project.projectDir", projectDir);
  setAutomaticVariable("buildConfiguration", buildConfigName || "release");

  // should be the last step so all variables are as ready as possible for substitution
  const calculatedVars = calculateAllVariables(manifest);
  return calculatedVars;
}

export type TicbuildProjectCoreOptions = {
  manifest: Manifest;
  manifestPath: string;
  projectDir: string;
  buildConfigName?: string | undefined;
  overrideVariables?: Record<string, string>;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
export class TicbuildProjectCore {
  manifest: Manifest;
  manifestPath: string;
  projectDir: string;
  selectedBuildConfig: string | undefined;
  overrideVariables: Record<string, string>;

  // calculated
  allVariables: Map<string, VariableInfo>;

  constructor(options: TicbuildProjectCoreOptions) {
    this.manifest = options.manifest;
    this.manifestPath = canonicalizePath(options.manifestPath);
    this.projectDir = canonicalizePath(options.projectDir);
    this.selectedBuildConfig = options.buildConfigName;
    this.overrideVariables = options.overrideVariables || {};

    this.allVariables = calculateAllVariables(this.manifest);
  }

  toDataObject(): object {
    return {
      manifest: this.manifest,
      manifestPath: this.manifestPath,
      projectDir: this.projectDir,
      selectedBuildConfig: this.selectedBuildConfig,
      overrideVariables: this.overrideVariables,
    };
  }

  static fromDataObject(obj: any): TicbuildProjectCore {
    const core = new TicbuildProjectCore({
      manifest: obj.manifest,
      manifestPath: obj.manifestPath,
      projectDir: obj.projectDir,
      buildConfigName: obj.selectedBuildConfig,
      overrideVariables: obj.overrideVariables,
    });
    core.allVariables = calculateAllVariables(core.manifest);
    return core;
  }

  clone(): TicbuildProjectCore {
    const dataObj = this.toDataObject();
    return TicbuildProjectCore.fromDataObject(dataObj);
  }

  // path can be absolute; it's returned.
  // path can contain variables; they are resolved relative to projectDir.
  resolveProjectPath(path: string): string {
    return this.resolveVariablePath(path, "project.projectDir");
  }

  // not defined whether this outputs a path with trailing slash or not.
  resolveObjPath(pathRelativeToObjDir?: string | undefined): string {
    return this.resolveVariablePath(pathRelativeToObjDir, "project.objDir");
  }

  resolveBinPath(pathRelativeToBinDir?: string | undefined): string {
    return this.resolveVariablePath(pathRelativeToBinDir, "project.binDir");
  }

  private makeAbsolutePath(relativeOrAbsolutePath: string): string {
    if (isAbsolutePath(relativeOrAbsolutePath)) {
      return canonicalizePath(relativeOrAbsolutePath);
    }
    return canonicalizePath(joinPathParts([this.projectDir, relativeOrAbsolutePath]));
  }

  private resolveVariablePath(relativePath: string | undefined, varName: string): string {
    const varInfo = this.allVariables.get(varName);
    if (!varInfo) {
      throw new Error(`Variable not found: ${varName}`);
    }
    if (!relativePath) {
      // did not specify relative path; just return the variable's resolved value
      return this.makeAbsolutePath(varInfo.resolvedValue);
    }
    relativePath = this.substituteVariables(relativePath);
    return this.makeAbsolutePath(joinPathParts([varInfo.resolvedValue, relativePath]));
  }

  resolveImportPath(importPath: ImportDefinition): string {
    if (!importPath.path) {
      throw new Error(`Import definition missing path: ${importPath.name}`);
    }

    const resolvedPath = substituteVariables(this.manifest, importPath.path);

    // If absolute path, use it directly
    if (isAbsolutePath(resolvedPath)) {
      return canonicalizePath(resolvedPath);
    }

    // Try to resolve using importDirs search paths
    const importDirs = this.manifest.project.importDirs?.map((s) => this.substituteVariables(s));
    const foundPath = resolveFileWithSearchPaths(resolvedPath, this.projectDir, importDirs);

    if (foundPath) {
      return foundPath;
    }

    // Not found in search paths, throw error with helpful message
    const searchedPaths = [this.projectDir];
    if (importDirs) {
      for (const dir of importDirs) {
        searchedPaths.push(isAbsolutePath(dir) ? dir : joinPathParts([this.projectDir, dir]));
      }
    }

    throw new Error(
      `Import file not found: ${resolvedPath}\n` + `Searched in:\n` + searchedPaths.map((p) => `  - ${p}`).join("\n"),
    );
  }

  resolveIncludePath(includePath: string): string {
    const resolvedPath = this.substituteVariables(includePath);
    if (isAbsolutePath(resolvedPath)) {
      return canonicalizePath(resolvedPath);
    }

    const includeDirs = this.manifest.project.includeDirs?.map((s) => this.substituteVariables(s)) || [];
    const foundPath = resolveFileWithSearchPaths(resolvedPath, this.projectDir, includeDirs);
    if (foundPath) {
      return foundPath;
    }

    const searchedPaths = [this.projectDir, ...includeDirs.map((dir) => joinPathParts([this.projectDir, dir]))];
    throw new Error(
      `Include file not found: ${resolvedPath}\n` + `Searched in:\n` + searchedPaths.map((p) => `  - ${p}`).join("\n"),
    );
  }

  // and some helpers.
  substituteVariables(s: string): string {
    return substituteVariables(this.manifest, s);
  }
  getOutputFilePath(): string {
    const leaf = this.substituteVariables(this.manifest.project.outputCartName);
    return this.resolveBinPath(leaf);
  }
}
