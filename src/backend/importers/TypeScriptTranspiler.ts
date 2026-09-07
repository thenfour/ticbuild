import * as path from "node:path";
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";
import * as cons from "../../utils/console";
import { assert } from "../../utils/errorHandling";
import { canonicalizePath, toAbsoluteCanonicalPath } from "../../utils/fileSystem";
import { profileSync, type TraceTrack } from "../../utils/traceProfiler";
import { ExternalDependency, GeneratedLuaSource } from "../ImportedResourceTypes";
import { TypeScriptImportConfig } from "../manifestTypes";
import { getResolvedPreprocessorDefines } from "../preprocessorDefines";
import { hasUnrestoredPreprocessorDirectives, restoreTypeScriptPreprocessorDirective } from "../luaPreprocessorSyntax";
import { TicbuildProjectCore } from "../projectCore";
import { LuaPreprocessorSourceMap, SourceMapBuilder } from "../sourceMap";
import { importSourceMapV3, KnownSourceFile } from "../sourceMapV3";
import { createManifestCodeModuleCatalog } from "./ManifestCodeTypeScriptModules";
import { createTypeScriptConstantPlugin } from "./TypeScriptConstantPlugin";
import { LuaDefinitionBlock } from "./TypeScriptLuaDeclarations";
import { createTypeScriptProgram, TypeScriptDeclarationContext } from "./TypeScriptProgram";
import { createTypeScriptStaticLinker, getCanonicalTSPathKey, isTypeScriptImplementationFile } from "./TypeScriptStaticLinker";

export type TypeScriptTranspileResult = GeneratedLuaSource & {
  luaDefinitionBlocks: readonly LuaDefinitionBlock[];
};

const tic80CallbackNames = new Set(["TIC", "BOOT", "BDR", "SCN", "OVR", "MENU"]);
function formatDiagnostic(diagnostic: ts.Diagnostic, projectDir: string): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (!diagnostic.file || diagnostic.start === undefined) {
    return message;
  }
  const location = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  const relativePath = path.relative(projectDir, diagnostic.file.fileName) || path.basename(diagnostic.file.fileName);
  return `${relativePath}:${location.line + 1}:${location.character + 1} - ${message}`;
}

export function formatDiagnostics(diagnostics: readonly ts.Diagnostic[], projectDir: string): string {
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
  profileTrack?: TraceTrack,
  declarations?: TypeScriptDeclarationContext,
): TypeScriptTranspileResult {
  const definedNames = new Set(Object.keys(getResolvedPreprocessorDefines(project)));
  const {
    configuredProject,
    generatedDeclarationRoots,
    program,
    staticLinker,
  } = profileSync(profileTrack, "Create TypeScript program", { category: "TypeScript" }, () => {
    const context = createTypeScriptProgram(project, entryFilePath, entrySource, typescriptConfig, builtinsPathOverride, declarations);
    const { configuredProject, generatedDeclarationRoots, compilerHost, program } = context;
    const staticLinker = createTypeScriptStaticLinker(
      program,
      compilerHost,
      entryFilePath,
      project.projectDir,
      new Set(findDeclaredCallbacks(entrySource, entryFilePath)),
      createManifestCodeModuleCatalog(project),
    );
    return {
        configuredProject,
      generatedDeclarationRoots,
      compilerHost,
      program,
      staticLinker,
    };
  });
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

  profileSync(profileTrack, "Transpile TypeScript to Lua", { category: "TypeScript" }, () => {
    const emitResult = new tstl.Transpiler({ emitHost }).emit({
      program,
      plugins: [
        createTypeScriptConstantPlugin(definedNames, (value) => project.substituteVariables(value)),
        staticLinker.plugin,
      ],
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
  });

  const { restored, dependencies } = profileSync(
    profileTrack,
    "Link generated Lua",
    { category: "TypeScript" },
    (scope) => {
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
        emitReadDependencies,
        project.projectDir,
        configuredProject.configDependencies,
        generatedDeclarationRoots,
      );
      scope?.setArgs({ outputCharacters: restored.source.length });
      return { restored, dependencies };
    },
  );
  return {
    source: restored.source,
    sourcePath: entryFilePath,
    sourceMap: restored.sourceMap,
    dependencies,
    luaDefinitionBlocks: staticLinker.getLuaDefinitionBlocks(),
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
  const lines = splitLinesWithOffsets(luaSource);
  const replacements: TextReplacement[] = [];
  for (const line of lines) {
    const directive = restoreTypeScriptPreprocessorDirective(line.text);
    if (directive !== undefined) {
      replacements.push({
        start: line.start,
        end: line.end,
        text: directive,
      });
      continue;
    }
  }
  const restored = applyMappedReplacements(luaSource, sourceMap, replacements);
  assert(
    !hasUnrestoredPreprocessorDirectives(restored.source),
    "TypeScript transpilation left an internal ticbuild marker in emitted Lua",
  );
  return restored;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function collectDependencies(
  program: ts.Program,
  emitReadDependencies: Set<string>,
  projectDir: string,
  configDependencies: readonly string[],
  generatedDeclarationPaths: readonly string[],
): ExternalDependency[] {
  const dependencies = new Map<string, string>();
  const canonicalGeneratedDeclarationPaths = new Set(generatedDeclarationPaths.map(getCanonicalTSPathKey));
  for (const sourceFile of program.getSourceFiles()) {
    if (!program.isSourceFileDefaultLibrary(sourceFile)) {
      const dependencyPath = toAbsoluteCanonicalPath(sourceFile.fileName, projectDir);
      const dependencyKey = getCanonicalTSPathKey(dependencyPath);
      if (
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
