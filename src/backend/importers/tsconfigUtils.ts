// Routines that dig into tsconfig internals. Keep this policy boundary
// defensive: tsconfig is an external, evolving format rather than a ticbuild
// manifest contract.

import * as path from "node:path";
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";
import * as cons from "../../utils/console";
import { toAbsoluteCanonicalPath } from "../../utils/fileSystem";
import { TypeScriptImportConfig } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";

export type LoadedTypeScriptProjectConfig = {
  options: tstl.CompilerOptions;
  declarationRootPaths: string[];
  configDependencies: string[];
};

export function loadTypeScriptProjectConfig(
  project: TicbuildProjectCore,
  config: TypeScriptImportConfig | undefined,
): LoadedTypeScriptProjectConfig {
  if (!config) {
    return {
      options: {},
      declarationRootPaths: [],
      configDependencies: [],
    };
  }

  const substitutedPath = project.substituteVariables(config.tsconfig);
  const configPath = toAbsoluteCanonicalPath(substitutedPath, project.projectDir);
  if (!ts.sys.fileExists(configPath)) {
    throw new Error(`TypeScript configuration file not found: ${configPath}`);
  }

  const configDependencies = new Set<string>();
  const trackedSystem: ts.System = {
    ...ts.sys,
    readFile(fileName, encoding) {
      const content = ts.sys.readFile(fileName, encoding);
      if (content !== undefined) {
        configDependencies.add(toAbsoluteCanonicalPath(fileName, project.projectDir));
      }
      return content;
    },
  };
  const parsed = tstl.parseConfigFileWithSystem(configPath, undefined, trackedSystem);
  if (parsed.errors.length > 0) {
    throw new Error(formatConfigDiagnostics(parsed.errors, project.projectDir));
  }
  if (parsed.projectReferences && parsed.projectReferences.length > 0) {
    throw new Error(`TypeScript project references are not supported yet: ${configPath}`);
  }

  const configuredOptions = parsed.options as tstl.CompilerOptions;
  rejectUnsupportedProjectOptions(configuredOptions, configPath);
  reportOwnedProjectOptions(configuredOptions, configPath, project.projectDir);

  return {
    options: configuredOptions,
    declarationRootPaths: parsed.fileNames
      .filter((fileName) => fileName.toLowerCase().endsWith(".d.ts"))
      .map((fileName) => toAbsoluteCanonicalPath(fileName, project.projectDir)),
    configDependencies: Array.from(configDependencies),
  };
}

function rejectUnsupportedProjectOptions(options: tstl.CompilerOptions, configPath: string): void {
  if (options.plugins && options.plugins.length > 0) {
    throw new Error(`TypeScript compiler plugins are not supported yet: ${configPath}`);
  }
  if (options.luaPlugins && options.luaPlugins.length > 0) {
    throw new Error(`TypeScriptToLua plugins are not supported yet: ${configPath}`);
  }
  if (options.noResolvePaths && options.noResolvePaths.length > 0) {
    throw new Error(`TypeScriptToLua noResolvePaths is not supported yet: ${configPath}`);
  }
}

function reportOwnedProjectOptions(options: tstl.CompilerOptions, configPath: string, projectDir: string): void {
  const ignored: string[] = [];
  const noteIf = (condition: boolean, name: string) => {
    if (condition) {
      ignored.push(name);
    }
  };

  noteIf(options.target !== undefined && options.target !== ts.ScriptTarget.ESNext, "compilerOptions.target");
  noteIf(options.noEmit === true, "compilerOptions.noEmit");
  noteIf(options.noEmitOnError === true, "compilerOptions.noEmitOnError");
  noteIf(options.emitDeclarationOnly === true, "compilerOptions.emitDeclarationOnly");
  noteIf(options.declaration === true, "compilerOptions.declaration");
  noteIf(options.declarationMap === true, "compilerOptions.declarationMap");
  noteIf(options.sourceMap === true, "compilerOptions.sourceMap");
  noteIf(options.inlineSourceMap === true, "compilerOptions.inlineSourceMap");
  noteIf(options.inlineSources === true, "compilerOptions.inlineSources");
  noteIf(options.outFile !== undefined, "compilerOptions.outFile");
  noteIf(options.outDir !== undefined, "compilerOptions.outDir");
  noteIf(options.declarationDir !== undefined, "compilerOptions.declarationDir");
  noteIf(options.incremental === true, "compilerOptions.incremental");
  noteIf(options.composite === true, "compilerOptions.composite");
  noteIf(options.tsBuildInfoFile !== undefined, "compilerOptions.tsBuildInfoFile");
  noteIf(options.luaTarget !== undefined && options.luaTarget !== tstl.LuaTarget.Lua53, "tstl.luaTarget");
  noteIf(
    options.luaLibImport !== undefined && options.luaLibImport !== tstl.LuaLibImportKind.Inline,
    "tstl.luaLibImport",
  );
  noteIf(options.luaBundle !== undefined, "tstl.luaBundle");
  noteIf(options.luaBundleEntry !== undefined, "tstl.luaBundleEntry");
  noteIf(options.noHeader === false, "tstl.noHeader");
  noteIf(options.noImplicitSelf === false, "tstl.noImplicitSelf");
  noteIf(options.noImplicitGlobalVariables === false, "tstl.noImplicitGlobalVariables");
  noteIf(options.sourceMapTraceback === true, "tstl.sourceMapTraceback");
  noteIf(options.buildMode !== undefined && options.buildMode !== tstl.BuildMode.Default, "tstl.buildMode");
  noteIf(options.extension !== undefined && options.extension !== ".lua", "tstl.extension");

  if (ignored.length > 0) {
    const displayPath = path.relative(projectDir, configPath) || path.basename(configPath);
    cons.warning(
      `TypeScript configuration ${displayPath} contains options controlled by ticbuild and ignored: ${ignored.join(", ")}`,
    );
  }
}

function formatConfigDiagnostics(diagnostics: readonly ts.Diagnostic[], projectDir: string): string {
  const lines = diagnostics.map((diagnostic) => formatConfigDiagnostic(diagnostic, projectDir));
  return `TypeScript configuration failed:\n${lines.map((line) => `  ${line}`).join("\n")}`;
}

function formatConfigDiagnostic(diagnostic: ts.Diagnostic, projectDir: string): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (!diagnostic.file || diagnostic.start === undefined) {
    return message;
  }
  const location = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  const relativePath = path.relative(projectDir, diagnostic.file.fileName) || path.basename(diagnostic.file.fileName);
  return `${relativePath}:${location.line + 1}:${location.character + 1} - ${message}`;
}
