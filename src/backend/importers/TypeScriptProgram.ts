import * as path from "node:path";
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";
import { canonicalizePath, fileExists } from "../../utils/fileSystem";
import { TypeScriptImportConfig } from "../manifestTypes";
import { preserveTypeScriptPreprocessorDirectives } from "../luaPreprocessorSyntax";
import { TicbuildProjectCore } from "../projectCore";
import { getBundledTic80DeclarationsPath, getProjectTic80DeclarationsPath } from "../projectFiles";
import { getLuaAssetDeclarationsPath } from "./LuaAssetTypeScriptModules";
import { loadTypeScriptProjectConfig } from "./tsconfigUtils";
import { getTypeScriptBuildConstantsPath, renderTypeScriptBuildConstants } from "./TypeScriptBuildConstants";
import { getTypeScriptManifestDeclarationsPath } from "./TypeScriptManifestModules";
import { getCanonicalTSPathKey, isTypeScriptImplementationFile } from "./TypeScriptStaticLinker";
import { createTypeScriptTranspilationOptions } from "./TypeScriptTranspilationOptions";

export type TypeScriptDeclarationContext = {
  lua: string;
  typescript: string;
  /** All reachable modules during analysis; the current owner's modules during emission. */
  sources?: ReadonlyMap<string, { filePath: string; sourceText: string }>;
  additionalSources?: ReadonlyMap<string, string>;
};

export function isGeneratedDeclarationFile(projectDir: string, fileName: string): boolean {
  const relative = path.relative(path.join(projectDir, ".ticbuild", "declarations"), fileName);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function createTypeScriptProgram(
  project: TicbuildProjectCore,
  entryFilePath: string,
  entrySource: string,
  typescriptConfig?: TypeScriptImportConfig,
  builtinsPathOverride?: string,
  declarations?: TypeScriptDeclarationContext,
) {
  // Fresh projects can compile before `project update` installs editor declarations.
  const projectBuiltinsPath = getProjectTic80DeclarationsPath(project.projectDir);
  const builtinsPath = canonicalizePath(builtinsPathOverride ?? (
    fileExists(projectBuiltinsPath) ? projectBuiltinsPath : getBundledTic80DeclarationsPath()
  ));
  const configuredProject = loadTypeScriptProjectConfig(project, typescriptConfig);
  const options = createTypeScriptTranspilationOptions(configuredProject.options);
  const luaPath = getLuaAssetDeclarationsPath(project.projectDir);
  const manifestPath = getTypeScriptManifestDeclarationsPath(project.projectDir);
  const constantsPath = getTypeScriptBuildConstantsPath(project.projectDir);
  const generatedDeclarationRoots = [luaPath, manifestPath, constantsPath]
    .filter(file => declarations || file === constantsPath || fileExists(file));
  const virtualSources = new Map([[constantsPath, renderTypeScriptBuildConstants(project)]]);
  if (declarations) {
    virtualSources.set(luaPath, declarations.lua);
    virtualSources.set(manifestPath, declarations.typescript);
    for (const source of declarations.sources?.values() ?? []) virtualSources.set(source.filePath, source.sourceText);
    for (const [file, text] of declarations.additionalSources ?? []) virtualSources.set(file, text);
  }
  const compilerHost = createCompilerHost(options, entryFilePath, entrySource, virtualSources);
  if (declarations) {
    ignoreStaleGeneratedDeclarations(compilerHost, project.projectDir, builtinsPath, virtualSources);
  }
  if (declarations?.sources) {
    resolveCurrentSourceModules(compilerHost, options, declarations.sources);
  }
  const program = ts.createProgram(Array.from(new Set([
    entryFilePath, builtinsPath,
    ...configuredProject.declarationRootPaths.filter(file => !declarations || !isGeneratedDeclarationFile(project.projectDir, file)),
    ...generatedDeclarationRoots,
  ])), options, compilerHost);
  return { builtinsPath, configuredProject, generatedDeclarationRoots, compilerHost, program };
}

/** Current virtual declarations supersede previous builds, even through triple-slash references. */
function ignoreStaleGeneratedDeclarations(
  host: ts.CompilerHost,
  projectDir: string,
  builtinsPath: string,
  virtualSources: ReadonlyMap<string, string>,
): void {
  const getSourceFile = host.getSourceFile.bind(host);
  const currentFiles = new Set(Array.from(virtualSources.keys(), getCanonicalTSPathKey));
  currentFiles.add(getCanonicalTSPathKey(builtinsPath));
  host.getSourceFile = (fileName, ...args) => {
    if (isGeneratedDeclarationFile(projectDir, fileName) && !currentFiles.has(getCanonicalTSPathKey(fileName))) {
      return ts.createSourceFile(fileName, "", args[0], true);
    }
    return getSourceFile(fileName, ...args);
  };
}

/** Manifest imports resolve to current source symbols during declaration analysis. */
function resolveCurrentSourceModules(
  host: ts.CompilerHost,
  options: ts.CompilerOptions,
  sources: NonNullable<TypeScriptDeclarationContext["sources"]>,
): void {
  host.resolveModuleNames = (names, containingFile) => names.map(name => {
    const source = sources.get(name);
    if (source) {
      return { resolvedFileName: source.filePath, extension: ts.Extension.Ts, isExternalLibraryImport: false };
    }
    return ts.resolveModuleName(name, containingFile, options, host).resolvedModule;
  });
}

export function createCompilerHost(
  options: tstl.CompilerOptions,
  entryFilePath: string,
  entrySource: string,
  virtualSources: ReadonlyMap<string, string>,
): ts.CompilerHost {
  const host = ts.createCompilerHost(options);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  const canonicalEntryPath = getCanonicalTSPathKey(entryFilePath);
  const canonicalVirtualSources = new Map(
    Array.from(virtualSources, ([fileName, source]) => [getCanonicalTSPathKey(fileName), { fileName, source }]),
  );

  const originalReadFile = host.readFile.bind(host);
  const originalFileExists = host.fileExists.bind(host);
  host.readFile = fileName => canonicalVirtualSources.get(getCanonicalTSPathKey(fileName))?.source ?? originalReadFile(fileName);
  host.fileExists = fileName => canonicalVirtualSources.has(getCanonicalTSPathKey(fileName)) || originalFileExists(fileName);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
    const isEntry = getCanonicalTSPathKey(fileName) === canonicalEntryPath;
    if (isEntry) {
      const transformed = preserveTypeScriptPreprocessorDirectives(canonicalVirtualSources.get(canonicalEntryPath)?.source ?? entrySource);
      return ts.createSourceFile(fileName, transformed, languageVersion, true, ts.ScriptKind.TS);
    }

    const virtualSource = canonicalVirtualSources.get(getCanonicalTSPathKey(fileName));
    if (virtualSource) {
      const text = isTypeScriptImplementationFile(fileName) ? preserveTypeScriptPreprocessorDirectives(virtualSource.source) : virtualSource.source;
      return ts.createSourceFile(virtualSource.fileName, text, languageVersion, true, ts.ScriptKind.TS);
    }

    const original = originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
    if (!original || original.isDeclarationFile || !isTypeScriptImplementationFile(fileName)) {
      return original;
    }

    const transformed = preserveTypeScriptPreprocessorDirectives(original.text);
    // todo: unify all these kinds of checks. search for ".tsx" to see what i mean.
    const scriptKind = fileName.toLowerCase().endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    return ts.createSourceFile(fileName, transformed, languageVersion, true, scriptKind);
  };
  return host;
}

