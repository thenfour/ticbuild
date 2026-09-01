import * as path from "node:path";
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";
import { canonicalizePath, fileExists, toAbsoluteCanonicalPath } from "../../utils/fileSystem";
import { getPathRelativeToPackageRoot } from "../../utils/templates";
import * as cons from "../../utils/console";
import { ExternalDependency, GeneratedLuaSource } from "../ImportedResourceTypes";
import { TypeScriptImportConfig } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { createTypeScriptTranspilationOptions } from "./TypeScriptTranspilationOptions";
import { createTypeScriptStaticLinker, getCanonicalTSPathKey, isTypeScriptImplementationFile } from "./TypeScriptStaticLinker";
import { loadTypeScriptProjectConfig } from "./tsconfigUtils";
import { assert } from "../../utils/errorHandling";
import { LuaPreprocessorSourceMap, SourceMapBuilder } from "../sourceMap";
import { importSourceMapV3, KnownSourceFile } from "../sourceMapV3";
import { getLuaAssetDeclarationsPath } from "./LuaAssetTypeScriptModules";
import { createManifestCodeModuleCatalog } from "./ManifestCodeTypeScriptModules";
import { LuaDefinitionBlock } from "./TypeScriptLuaDeclarations";
import {
  emitTypeScriptManifestModuleDeclaration,
  getTypeScriptManifestDeclarationsPath,
  TypeScriptManifestModuleDeclaration,
} from "./TypeScriptManifestModules";

export type TypeScriptTranspileResult = GeneratedLuaSource & {
  luaDefinitionBlocks: readonly LuaDefinitionBlock[];
  typescriptManifestModuleDeclaration?: TypeScriptManifestModuleDeclaration;
};

const preprocessorMarker = "__TICBUILD_PREPROCESSOR_DIRECTIVE__";
const tic80CallbackNames = new Set(["TIC", "BOOT", "BDR", "SCN", "OVR", "MENU"]);
const preprocessorDirectivePattern =
  /^([ \t]*)\/\/(?:--)?#(pragma|define|undef|include|if|ifdef|ifndef|else|endif|warning|error|macro|endmacro|minify)\b(.*)$/;
const builtinsName = "tic80.d.ts";

function formatDiagnostic(diagnostic: ts.Diagnostic, projectDir: string): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (!diagnostic.file || diagnostic.start === undefined) {
    return message;
  }
  const location = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  const relativePath = path.relative(projectDir, diagnostic.file.fileName) || path.basename(diagnostic.file.fileName);
  return `${relativePath}:${location.line + 1}:${location.character + 1} - ${message}`;
}

function formatDiagnostics(diagnostics: readonly ts.Diagnostic[], projectDir: string): string {
  const lines = diagnostics.map((diagnostic) => formatDiagnostic(diagnostic, projectDir));
  return `TypeScript transpilation failed:\n${lines.map((line) => `  ${line}`).join("\n")}`;
}

function isNodeModulesPath(fileName: string): boolean {
  return canonicalizePath(fileName).split(path.sep).some((part) => part.toLowerCase() === "node_modules");
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export function transpileTypeScriptToLua(
  project: TicbuildProjectCore,
  entryFilePath: string,
  entrySource: string,
  typescriptConfig?: TypeScriptImportConfig,
  builtinsPathOverride?: string,
  manifestImportName?: string,
): TypeScriptTranspileResult {
  const builtinsPath = canonicalizePath(builtinsPathOverride ?? getPathRelativeToPackageRoot(builtinsName));
  const configuredProject = loadTypeScriptProjectConfig(project, typescriptConfig);
  const options = createTypeScriptTranspilationOptions(configuredProject.options);
  const luaAssetDeclarationsPath = getLuaAssetDeclarationsPath(project.projectDir);
  const typeScriptManifestDeclarationsPath = getTypeScriptManifestDeclarationsPath(project.projectDir);
  const generatedDeclarationRoots = [luaAssetDeclarationsPath, typeScriptManifestDeclarationsPath].filter(fileExists);

  const compilerHost = createCompilerHost(options, entryFilePath, entrySource);
  const program = ts.createProgram(
    distinctTSPaths([
      entryFilePath,
      builtinsPath,
      ...configuredProject.declarationRootPaths,
      ...generatedDeclarationRoots,
    ]),
    options,
    compilerHost,
  );
  const staticLinker = createTypeScriptStaticLinker(
    program,
    compilerHost,
    entryFilePath,
    project.projectDir,
    new Set(findDeclaredCallbacks(entrySource, entryFilePath)),
    createManifestCodeModuleCatalog(project),
  );
  const emitReadDependencies = new Set<string>();
  const emitHost: tstl.EmitHost = {
    directoryExists: ts.sys.directoryExists,
    fileExists: ts.sys.fileExists,
    getCurrentDirectory: () => project.projectDir,
    readFile(fileName) {
      const content = ts.sys.readFile(fileName);
      if (content !== undefined) {
        emitReadDependencies.add(toAbsoluteCanonicalPath(fileName, project.projectDir));
      }
      return content;
    },
    writeFile: ts.sys.writeFile,
  };

  const emitResult = new tstl.Transpiler({ emitHost }).emit({
    program,
    plugins: [staticLinker.plugin],
    writeFile() { },
  });
  const diagnostics = ts.sortAndDeduplicateDiagnostics([
    ...ts.getPreEmitDiagnostics(program),
    ...emitResult.diagnostics,
  ]);
  const errors = diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (errors.length > 0) {
    throw new Error(formatDiagnostics(errors, project.projectDir));
  }
  for (const warning of diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Warning)) {
    cons.warning(`TypeScript transpilation warning: ${formatDiagnostic(warning, project.projectDir)}`);
  }

  const manifestDeclaration = manifestImportName
    ? emitTypeScriptManifestModuleDeclaration(
      program,
      compilerHost,
      entryFilePath,
      manifestImportName,
      project.projectDir,
    )
    : undefined;
  const declarationErrors = manifestDeclaration?.diagnostics.filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  ) ?? [];
  if (declarationErrors.length > 0 || (manifestImportName && !manifestDeclaration?.declaration)) {
    throw new Error(
      declarationErrors.length > 0
        ? formatDiagnostics(declarationErrors, project.projectDir)
        : `TypeScript declaration emit failed for manifest import '${manifestImportName}'`,
    );
  }

  const linked = staticLinker.link();
  const emittedMap = importSourceMapV3(
    linked.source,
    linked.sourceMapV3,
    collectKnownSourceFiles(program, entryFilePath, entrySource),
    project.projectDir,
  );
  const restored = restoreTicbuildMarkers(linked.source, emittedMap);
  const dependencies = collectDependencies(
    program,
    builtinsPath,
    emitReadDependencies,
    project.projectDir,
    configuredProject.configDependencies,
    generatedDeclarationRoots,
  );
  return {
    source: restored.source,
    sourcePath: entryFilePath,
    sourceMap: restored.sourceMap,
    dependencies,
    luaDefinitionBlocks: staticLinker.getLuaDefinitionBlocks(),
    typescriptManifestModuleDeclaration: manifestDeclaration?.declaration,
  };
}

function collectKnownSourceFiles(
  program: ts.Program,
  entryFilePath: string,
  entrySource: string,
): KnownSourceFile[] {
  const canonicalEntryPath = getCanonicalTSPathKey(entryFilePath);
  const sources: KnownSourceFile[] = [];
  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile || !isTypeScriptImplementationFile(sourceFile.fileName)) {
      continue;
    }
    const content = getCanonicalTSPathKey(sourceFile.fileName) === canonicalEntryPath
      ? entrySource
      : ts.sys.readFile(sourceFile.fileName);
    if (content !== undefined) {
      sources.push({ filePath: sourceFile.fileName, content });
    }
  }
  return sources;
}

// uses typescript path options
function distinctTSPaths(paths: readonly string[]): string[] {
  const seen = new Set<string>();
  return paths.filter((filePath) => {
    const key = getCanonicalTSPathKey(filePath);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function createCompilerHost(
  options: tstl.CompilerOptions,
  entryFilePath: string,
  entrySource: string,
): ts.CompilerHost {
  const host = ts.createCompilerHost(options);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  const canonicalEntryPath = getCanonicalTSPathKey(entryFilePath);

  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
    const isEntry = getCanonicalTSPathKey(fileName) === canonicalEntryPath;
    if (isEntry) {
      const transformed = preserveTicbuildDirectives(entrySource);
      return ts.createSourceFile(fileName, transformed, languageVersion, true, ts.ScriptKind.TS);
    }

    const original = originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
    if (!original || original.isDeclarationFile || !isTypeScriptImplementationFile(fileName)) {
      return original;
    }

    const transformed = preserveTicbuildDirectives(original.text);
    // todo: unify all these kinds of checks. search for ".tsx" to see what i mean.
    const scriptKind = fileName.toLowerCase().endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    return ts.createSourceFile(fileName, transformed, languageVersion, true, scriptKind);
  };
  return host;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function preserveTicbuildDirectives(source: string): string {
  // convert preprocessor directive lines to a marker with the directive payload base64-encoded.
  // e.g.,
  // //#include "foo.lua"
  // becomes
  // __TICBUILD_PREPROCESSOR_DIRECTIVE__("IyNpbmNsdWRlICJmb28ubHVhIg==");
  return source
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(preprocessorDirectivePattern);
      if (!match) {
        return line;
      }
      const [, indent, directive, remainder] = match;
      const payload = Buffer.from(`#${directive}${remainder}`, "utf8").toString("base64");
      return `${indent}${preprocessorMarker}("${payload}");`;
    })
    .join("\n");
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function findDeclaredCallbacks(source: string, fileName: string): string[] {
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const callbacks = new Set<string>();
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name && tic80CallbackNames.has(statement.name.text)) {
      callbacks.add(statement.name.text);
      continue;
    }
    if (!ts.isVariableStatement(statement)) {
      continue;
    }
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && tic80CallbackNames.has(declaration.name.text)) {
        callbacks.add(declaration.name.text);
      }
    }
  }
  return Array.from(callbacks);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type TextReplacement = {
  start: number;
  end: number;
  text: string;
};

function splitLinesWithOffsets(source: string): Array<{ text: string; start: number; end: number }> {
  const lines: Array<{ text: string; start: number; end: number }> = [];
  let offset = 0;
  for (const text of source.split(/\r\n|\n|\r/)) {
    lines.push({ text, start: offset, end: offset + text.length });
    offset += text.length;
    if (offset < source.length) {
      offset += source.startsWith("\r\n", offset) ? 2 : 1;
    }
  }
  return lines;
}

function applyMappedReplacements(
  source: string,
  sourceMap: LuaPreprocessorSourceMap,
  replacements: readonly TextReplacement[],
): { source: string; sourceMap: LuaPreprocessorSourceMap } {
  let output = source;
  const builder = SourceMapBuilder.fromSourceMap(sourceMap);
  for (const replacement of [...replacements].sort((a, b) => b.start - a.start)) {
    const origin = builder.mapOffset(replacement.start, "right");
    output = output.slice(0, replacement.start) + replacement.text + output.slice(replacement.end);
    builder.spliceRange(replacement.start, replacement.end, replacement.text.length, origin);
  }
  return { source: output, sourceMap: builder.toSourceMap(output) };
}

function restoreTicbuildMarkers(
  luaSource: string,
  sourceMap: LuaPreprocessorSourceMap,
): { source: string; sourceMap: LuaPreprocessorSourceMap } {
  const directiveCall = new RegExp(
    `^([ \\t]*)${preprocessorMarker}\\("([A-Za-z0-9+/=]+)"\\)[ \\t]*$`,
  );
  const lines = splitLinesWithOffsets(luaSource);
  const replacements: TextReplacement[] = [];
  for (const line of lines) {
    const directiveMatch = line.text.match(directiveCall);
    if (directiveMatch) {
      const [, indent, payload] = directiveMatch;
      replacements.push({
        start: line.start,
        end: line.end,
        text: `${indent}--${Buffer.from(payload, "base64").toString("utf8")}`,
      });
      continue;
    }
  }
  const restored = applyMappedReplacements(luaSource, sourceMap, replacements);
  assert(
    !restored.source.includes(`${preprocessorMarker}(`),
    "TypeScript transpilation left an internal ticbuild marker in emitted Lua",
  );
  return restored;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function collectDependencies(
  program: ts.Program,
  builtinsPath: string,
  emitReadDependencies: Set<string>,
  projectDir: string,
  configDependencies: readonly string[],
  generatedDeclarationPaths: readonly string[],
): ExternalDependency[] {
  const dependencies = new Map<string, string>();
  const canonicalBuiltinsPath = getCanonicalTSPathKey(builtinsPath);
  const canonicalGeneratedDeclarationPaths = new Set(generatedDeclarationPaths.map(getCanonicalTSPathKey));
  for (const sourceFile of program.getSourceFiles()) {
    if (!program.isSourceFileDefaultLibrary(sourceFile)) {
      const dependencyPath = toAbsoluteCanonicalPath(sourceFile.fileName, projectDir);
      const dependencyKey = getCanonicalTSPathKey(dependencyPath);
      if (
        dependencyKey !== canonicalBuiltinsPath &&
        !canonicalGeneratedDeclarationPaths.has(dependencyKey) &&
        !isNodeModulesPath(dependencyPath)
      ) {
        dependencies.set(dependencyPath, "TypeScript compiler dependency");
      }
    }
  }
  for (const dependencyPath of emitReadDependencies) {
    if (
      !canonicalGeneratedDeclarationPaths.has(getCanonicalTSPathKey(dependencyPath)) &&
      !isNodeModulesPath(dependencyPath)
    ) {
      dependencies.set(dependencyPath, "TypeScript compiler dependency");
    }
  }

  for (const dependencyPath of configDependencies) {
    dependencies.set(dependencyPath, "TypeScript project configuration");
  }
  return Array.from(dependencies, ([dependencyPath, reason]) => ({
    path: dependencyPath,
    reason,
  }));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
