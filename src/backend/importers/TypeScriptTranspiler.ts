import * as path from "node:path";
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";
import { canonicalizePath, toAbsoluteCanonicalPath } from "../../utils/fileSystem";
import { getPathRelativeToPackageRoot } from "../../utils/templates";
import * as cons from "../../utils/console";
import { ExternalDependency, GeneratedLuaSource } from "../ImportedResourceTypes";
import { TypeScriptImportConfig } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { createTypeScriptTranspilationOptions } from "./TypeScriptTranspilationOptions";
import { loadTypeScriptProjectConfig } from "./tsconfigUtils";
import { assert } from "../../utils/errorHandling";

const preprocessorMarker = "__TICBUILD_PREPROCESSOR_DIRECTIVE__";
const exportGlobalMarker = "__TICBUILD_EXPORT_GLOBAL__";
const bundleFileName = "__ticbuild_typescript_bundle.lua";
const tic80CallbackNames = new Set(["TIC", "BOOT", "BDR", "SCN", "OVR", "MENU"]);
const preprocessorDirectivePattern =
  /^([ \t]*)\/\/(?:--)?#(pragma|define|undef|include|if|ifdef|ifndef|else|endif|warning|error|macro|endmacro|minify)\b(.*)$/;

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

function isTypeScriptImplementationFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return (lower.endsWith(".ts") || lower.endsWith(".tsx")) && !lower.endsWith(".d.ts");
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
): GeneratedLuaSource {
  const builtinsPath = canonicalizePath(getPathRelativeToPackageRoot("tic80.d.ts"));
  const configuredProject = loadTypeScriptProjectConfig(project, typescriptConfig);
  const options = createTypeScriptTranspilationOptions(configuredProject.options, {
    entryFilePath,
    bundleFileName,
  });

  const compilerHost = createCompilerHost(options, entryFilePath, entrySource);
  const program = ts.createProgram(
    distinctTSPaths([entryFilePath, builtinsPath, ...configuredProject.declarationRootPaths]),
    options,
    compilerHost,
  );
  const exportedValueNames = getEntryExportedValueNames(program, entryFilePath);
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

  const emittedLua = new Map<string, string>();
  const emitResult = new tstl.Transpiler({ emitHost }).emit({
    program,
    writeFile(fileName, data) {
      if (fileName.toLowerCase().endsWith(".lua")) {
        emittedLua.set(canonicalizePath(fileName), data);
      }
    },
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

  if (emittedLua.size !== 1) {
    throw new Error(
      `TypeScript transpilation for ${entryFilePath} produced ${emittedLua.size} Lua files; expected one bundled output.`,
    );
  }

  const luaSource = restoreTicbuildMarkers(Array.from(emittedLua.values())[0], exportedValueNames);
  const dependencies = collectDependencies(
    program,
    builtinsPath,
    emitReadDependencies,
    project.projectDir,
    configuredProject.configDependencies,
  );
  return {
    source: luaSource,
    sourcePath: entryFilePath,
    dependencies,
  };
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

// uses typescript path options
function getCanonicalTSPathKey(filePath: string): string {
  const canonicalPath = canonicalizePath(filePath);
  return ts.sys.useCaseSensitiveFileNames ? canonicalPath : canonicalPath.toLowerCase();
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
      const transformed = preserveTicbuildDirectives(entrySource, fileName, true);
      return ts.createSourceFile(fileName, transformed, languageVersion, true, ts.ScriptKind.TS);
    }

    const original = originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
    if (!original || original.isDeclarationFile || !isTypeScriptImplementationFile(fileName)) {
      return original;
    }

    const transformed = preserveTicbuildDirectives(original.text, fileName, false);
    const scriptKind = fileName.toLowerCase().endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    return ts.createSourceFile(fileName, transformed, languageVersion, true, scriptKind);
  };
  return host;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function preserveTicbuildDirectives(source: string, fileName: string, isEntry: boolean): string {
  const transformed = source
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

  if (!isEntry) {
    return transformed;
  }

  const callbacks = findDeclaredCallbacks(source, fileName);
  if (callbacks.length === 0) {
    return transformed;
  }
  const exports = callbacks.map((name) => `${exportGlobalMarker}("${name}", ${name});`).join("\n");
  return `${transformed}\n${exports}\n`;
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
function getEntryExportedValueNames(program: ts.Program, entryFilePath: string): string[] {
  const sourceFile = program.getSourceFile(entryFilePath);
  if (!sourceFile) {
    return [];
  }
  const moduleSymbol = program.getTypeChecker().getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) {
    return [];
  }

  const checker = program.getTypeChecker();
  return checker
    .getExportsOfModule(moduleSymbol)
    .filter((symbol) => symbol.name !== "default" && symbol.name !== "export=")
    .filter((symbol) => {
      const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      return (target.flags & ts.SymbolFlags.Value) !== 0;
    })
    .map((symbol) => symbol.name);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function restoreTicbuildMarkers(luaSource: string, exportedValueNames: readonly string[]): string {
  const directiveCall = new RegExp(
    `^([ \\t]*)${preprocessorMarker}\\("([A-Za-z0-9+/=]+)"\\)[ \\t]*$`,
  );
  // must be able to match 
  // __TICBUILD_EXPORT_GLOBAL__("TIC", ____exports.TIC);
  // as well as
  // __TICBUILD_EXPORT_GLOBAL__("TIC", TIC);
  const exportCall = new RegExp(
    `^([ \\t]*)${exportGlobalMarker}\\("([A-Z]+)",[ \\t]*(.+)\\)[ \\t]*$`,
  );

  const lines = luaSource
    .split(/\r?\n/)
    .map((line) => {
      const directiveMatch = line.match(directiveCall);
      if (directiveMatch) {
        const [, indent, payload] = directiveMatch;
        return `${indent}--${Buffer.from(payload, "base64").toString("utf8")}`;
      }
      const exportMatch = line.match(exportCall);
      if (exportMatch) {
        const [, indent, globalName, valueExpression] = exportMatch;
        return `${indent}_G["${globalName}"] = ${valueExpression}`;
      }
      return line;
    });

  const leakedMarkerLine = lines.find(
    (line) => line.includes(`${preprocessorMarker}(`) || line.includes(`${exportGlobalMarker}(`),
  );

  assert(leakedMarkerLine === undefined, "TypeScript transpilation left an internal ticbuild marker in emitted Lua");

  // A ticbuild code resource is composed into a cartridge chunk rather than
  // loaded as a Lua module. Publish the entry module's named value exports as
  // Lua globals, then remove TSTL's final return so Lua may follow this include.
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().length === 0) {
      continue;
    }
    if (lines[i].trim() === "return ____entry") {
      const indent = lines[i].match(/^[ \t]*/)?.[0] ?? "";
      lines.splice(
        i,
        1,
        ...exportedValueNames.map((name) => {
          const luaName = JSON.stringify(name);
          return `${indent}_G[${luaName}] = ____entry[${luaName}]`;
        }),
      );
    }
    break;
  }
  return lines.join("\n");
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function collectDependencies(
  program: ts.Program,
  builtinsPath: string,
  emitReadDependencies: Set<string>,
  projectDir: string,
  configDependencies: readonly string[],
): ExternalDependency[] {
  const dependencies = new Map<string, string>();
  const canonicalBuiltinsPath = getCanonicalTSPathKey(builtinsPath);
  for (const sourceFile of program.getSourceFiles()) {
    if (!program.isSourceFileDefaultLibrary(sourceFile)) {
      const dependencyPath = toAbsoluteCanonicalPath(sourceFile.fileName, projectDir);
      if (getCanonicalTSPathKey(dependencyPath) !== canonicalBuiltinsPath && !isNodeModulesPath(dependencyPath)) {
        dependencies.set(dependencyPath, "TypeScript compiler dependency");
      }
    }
  }
  for (const dependencyPath of emitReadDependencies) {
    if (!isNodeModulesPath(dependencyPath)) {
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
