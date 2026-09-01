import * as path from "node:path";
import { RawSourceMap, SourceMapConsumer, SourceNode } from "source-map";
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";
import { canonicalizePath, toAbsoluteCanonicalPath } from "../../utils/fileSystem";
import {
  ManifestCodeModuleDefinition,
  MANIFEST_CODE_MODULE_PREFIX,
  parseManifestCodeModuleSpecifier,
} from "./ManifestCodeTypeScriptModules";
import {
  collectTypeScriptLuaDefinitionBlocks,
  LuaDefinitionBlock,
} from "./TypeScriptLuaDeclarations";
import { isLuaIdentifierName } from "../../utils/lua/lua_utils";

// todo: unify all these. search for ".tsx" to see what i mean.
export function isTypeScriptImplementationFile(fileName: string): boolean {
  const lower = fileName.toLowerCase(); // todo: this  is windows-only.
  return (lower.endsWith(".ts") || lower.endsWith(".tsx")) && !lower.endsWith(".d.ts");
}

// uses typescript path options
export function getCanonicalTSPathKey(filePath: string): string {
  const canonicalPath = canonicalizePath(filePath);
  return ts.sys.useCaseSensitiveFileNames ? canonicalPath : canonicalPath.toLowerCase();
}

/** Ensures an exported name can be emitted as `name = ...` instead of `_G[name]`. */
function validateLuaGlobalName(name: string, sourceFile: ts.SourceFile, projectDir: string): void {
  if (!isLuaIdentifierName(name)) {
    throw new Error(
      `TypeScript static linking failed: export '${name}' in ${displayPath(sourceFile.fileName, projectDir)} ` +
      "cannot be represented as a direct Lua global identifier",
    );
  }
}

// safety guard.
function isLuaNode(value: unknown): value is tstl.Node {
  return typeof value === "object" && value !== null && typeof (value as { kind?: unknown }).kind === "number";
}

type MutableSourceNode = {
  source?: string | null;
  children?: Array<string | MutableSourceNode>;
};

type StaticModule = {
  sourceFile: ts.SourceFile;
  dependencies: StaticModule[];
  manifestCodeDependencies: ManifestCodeDependency[];
  // import paths which TSTL would otherwise lower to require(). Keeping
  // these separate allows the linker to distinguish between TSTL's require()
  // and user-authored require() calls.
  linkSpecifiers: ReadonlySet<string>;
};

type ManifestCodeDependency = {
  importName: string;
  moduleSpecifier: string;
  exportedValueNames: readonly string[];
};

type PrintedStaticModule = {
  code: string;
  sourceMapNode: SourceNode;
};

export type TypeScriptStaticLinkResult = {
  source: string;
  sourceMapV3: string;
};

export type TypeScriptStaticLinker = {
  plugin: tstl.Plugin;
  getLuaDefinitionBlocks(): readonly LuaDefinitionBlock[];
  link(): TypeScriptStaticLinkResult;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// creates a TSTL plugin, used to capture TSTL's module output and rewrite it in a way
// that ticbuild wants. Mostly this is done to remove the TSTL module plumbing
// (____exports tables, require() calls, etc) and replace it with simpler flatter
// Lua. It makes sacrifices for some things like dynamic imports, name collisions, but this
// is acceptable.
// 
// it's not 100% clean code; we depend on TSTL's ast structure and code generation details.
export function createTypeScriptStaticLinker(
  program: ts.Program,
  compilerHost: ts.CompilerHost,
  entryFilePath: string,
  projectDir: string,
  entryCallbackNames: ReadonlySet<string>,
  manifestCodeModules: ReadonlyMap<string, ManifestCodeModuleDefinition>,
): TypeScriptStaticLinker {
  const modules = createStaticModuleOrder(program, compilerHost, entryFilePath, projectDir, manifestCodeModules);
  validateGlobalExports(program, modules, entryFilePath, entryCallbackNames, projectDir);

  const modulesByKey = new Map(
    modules.map((module) => [getCanonicalTSPathKey(module.sourceFile.fileName), module] as const),
  );
  const printedModules = new Map<string, PrintedStaticModule>();
  const printer = tstl.createPrinter([]);

  const plugin: tstl.Plugin = {
    // afterPrint is the last point where TSTL exposes both Lua AST and mapped
    // SourceNodes, and is still early enough to bypass its runtime bundler.
    afterPrint(currentProgram, _options, emitHost, files) {
      printedModules.clear();
      for (const file of files) {
        const implementationSources = (file.sourceFiles ?? []).filter(
          (sourceFile) => isTypeScriptImplementationFile(sourceFile.fileName),
        );
        if (!file.luaAst || implementationSources.length !== 1) {
          continue;
        }

        const sourceFile = implementationSources[0];
        const sourceKey = getCanonicalTSPathKey(sourceFile.fileName);
        const module = modulesByKey.get(sourceKey);
        if (!module) {
          continue;
        }

        const callbacks = sourceKey === getCanonicalTSPathKey(entryFilePath) ? entryCallbackNames : new Set<string>();
        const linkedAst = lowerStaticModule(file.luaAst, callbacks, module.linkSpecifiers);
        const printed = printer(currentProgram, emitHost, file.fileName, linkedAst);
        const sourceMapNode = SourceNode.fromStringWithSourceMap(
          printed.code,
          new SourceMapConsumer(JSON.parse(printed.sourceMap) as RawSourceMap),
        );
        rewriteSourceNodePath(
          sourceMapNode as unknown as MutableSourceNode,
          toAbsoluteCanonicalPath(sourceFile.fileName, projectDir),
        );
        printedModules.set(sourceKey, {
          code: printed.code,
          sourceMapNode,
        });

        // TSTL dependency resolution runs after this hook. Give it the lowered
        // source too, so it does not try to resolve the requires we have linked.
        file.luaAst = linkedAst;
        file.code = printed.code;
        file.sourceMap = printed.sourceMap;
        file.sourceMapNode = printed.sourceMapNode;
      }
    },
  };

  return {
    plugin,
    getLuaDefinitionBlocks() {
      const entrySourceFile = program.getSourceFile(entryFilePath);
      if (!entrySourceFile) {
        throw new Error(`TypeScript static linking failed: entry source was not found: ${entryFilePath}`);
      }
      return collectTypeScriptLuaDefinitionBlocks(
        program,
        modules.map((module) => module.sourceFile),
        entrySourceFile,
        entryCallbackNames,
        projectDir,
      );
    },
    // Linking is deliberately separate from afterPrint: TSTL must finish the
    // emit pass first so diagnostics are available before this output is used.
    link() {
      const missing = modules.filter(
        (module) => !printedModules.has(getCanonicalTSPathKey(module.sourceFile.fileName)),
      );
      if (missing.length > 0) {
        throw new Error(
          `TypeScript static linking failed: no Lua output was produced for ${missing
            .map((module) => displayPath(module.sourceFile.fileName, projectDir))
            .join(", ")}`,
        );
      }

      const combined = new SourceNode();
      const emittedManifestCode = new Set<string>();
      // Preserve mapped SourceNode children rather than flattening them to text.
      const add = (chunk: string | SourceNode) => {
        // source-map 0.6 accepts SourceNode children at runtime, though its
        // declaration only exposes the string overload.
        (combined.add as unknown as (value: string | SourceNode) => void)(chunk);
      };
      for (const module of modules) {
        for (const dependency of module.manifestCodeDependencies) {
          if (emittedManifestCode.has(dependency.importName)) {
            continue;
          }
          emittedManifestCode.add(dependency.importName);
          add(`--#include ${JSON.stringify(`import:${dependency.importName}`)}\n`);
        }
        const printed = printedModules.get(getCanonicalTSPathKey(module.sourceFile.fileName))!;
        add("do\n");
        add(printed.sourceMapNode);
        if (!printed.code.endsWith("\n")) {
          add("\n");
        }
        add("end\n");
      }
      const linked = combined.toStringWithSourceMap({ file: "__ticbuild_typescript_linked.lua" });
      return {
        source: linked.code,
        sourceMapV3: linked.map.toString(),
      };
    },
  };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DFS through module dependencies, validating, returning stable dependency-first order.
function createStaticModuleOrder(
  program: ts.Program,
  compilerHost: ts.CompilerHost,
  entryFilePath: string,
  projectDir: string,
  manifestCodeModules: ReadonlyMap<string, ManifestCodeModuleDefinition>,
): StaticModule[] {
  const entryFile = program.getSourceFile(entryFilePath);
  if (!entryFile) {
    throw new Error(`TypeScript static linking failed: entry source was not found: ${entryFilePath}`);
  }

  const modules = new Map<string, StaticModule>();
  // Intern a graph node before recursing so cyclic references resolve to the
  // same object and can be diagnosed by the later DFS.
  const getModule = (sourceFile: ts.SourceFile): StaticModule => {
    const key = getCanonicalTSPathKey(sourceFile.fileName);
    let module = modules.get(key);
    if (!module) {
      module = { sourceFile, dependencies: [], manifestCodeDependencies: [], linkSpecifiers: new Set<string>() };
      modules.set(key, module);
      const collected = collectStaticDependencies(
        program,
        compilerHost,
        sourceFile,
        projectDir,
        manifestCodeModules,
      );
      module.linkSpecifiers = collected.linkSpecifiers;
      module.manifestCodeDependencies = collected.manifestCodeDependencies;
      module.dependencies = collected.dependencies.map(getModule);
    }
    return module;
  };

  const entryModule = getModule(entryFile);
  const state = new Map<StaticModule, "visiting" | "visited">();
  const stack: StaticModule[] = [];
  const ordered: StaticModule[] = [];
  // Post-order DFS naturally places every dependency before its importer.
  const visit = (module: StaticModule) => {
    const currentState = state.get(module);
    if (currentState === "visited") {
      return;
    }
    if (currentState === "visiting") {
      const cycleStart = stack.indexOf(module);
      const cycle = [...stack.slice(cycleStart), module]
        .map((item) => displayPath(item.sourceFile.fileName, projectDir))
        .join(" -> ");
      throw new Error(`TypeScript static linking failed: module cycles are not supported yet: ${cycle}`);
    }
    state.set(module, "visiting");
    stack.push(module);
    for (const dependency of module.dependencies) {
      visit(dependency);
    }
    stack.pop();
    state.set(module, "visited");
    ordered.push(module);
  };
  visit(entryModule);
  return ordered;
}

// walks the source file AST to find imports/exports,
// resolves, validates, and returns the implementation source files
function collectStaticDependencies(
  program: ts.Program,
  compilerHost: ts.CompilerHost,
  sourceFile: ts.SourceFile,
  projectDir: string,
  manifestCodeModules: ReadonlyMap<string, ManifestCodeModuleDefinition>,
): {
  dependencies: ts.SourceFile[];
  manifestCodeDependencies: ManifestCodeDependency[];
  linkSpecifiers: ReadonlySet<string>;
} {
  const dependencies: ts.SourceFile[] = [];
  const manifestCodeDependencies = new Map<string, ManifestCodeDependency>();
  const linkSpecifiers = new Set<string>();

  // Resolve one runtime edge and classify declaration-only targets as Lua
  // interop contracts rather than executable modules.
  const addModuleDependency = (specifier: ts.Expression, hasRuntimeBindings: boolean, description: string) => {
    if (!ts.isStringLiteralLike(specifier)) {
      throwStaticLinkError(sourceFile, specifier, `${description} must use a string-literal module path`, projectDir);
    }
    linkSpecifiers.add(specifier.text);
    const manifestImportName = parseManifestCodeModuleSpecifier(specifier.text);
    if (specifier.text.startsWith(MANIFEST_CODE_MODULE_PREFIX)) {
      if (!manifestImportName) {
        throwStaticLinkError(
          sourceFile,
          specifier,
          `invalid manifest code module '${specifier.text}'; expected '${MANIFEST_CODE_MODULE_PREFIX}<manifest import name>'`,
          projectDir,
        );
      }
      const definition = manifestCodeModules.get(manifestImportName);
      if (!definition) {
        throwStaticLinkError(
          sourceFile,
          specifier,
          `'${specifier.text}' does not name a manifest LuaCode or TypeScriptCode asset`,
          projectDir,
        );
      }
      if (description === "re-export") {
        throwStaticLinkError(sourceFile, specifier, "re-exporting manifest code assets is not supported yet", projectDir);
      }
      manifestCodeDependencies.set(definition.importName, {
        importName: definition.importName,
        moduleSpecifier: definition.moduleSpecifier,
        exportedValueNames: getModuleValueExportNames(program, specifier),
      });
      return;
    }
    const resolved = ts.resolveModuleName(
      specifier.text,
      sourceFile.fileName,
      program.getCompilerOptions(),
      compilerHost,
    ).resolvedModule;
    if (!resolved) {
      // TypeScript compiler is more precise for ordinary unresolved symbols
      return;
    }
    const resolvedSource = program.getSourceFile(resolved.resolvedFileName);
    if (!resolvedSource || resolvedSource.isDeclarationFile) {
      if (!hasRuntimeBindings) {
        throwStaticLinkError(
          sourceFile,
          specifier,
          `${description} resolves only to declarations and cannot provide runtime side effects`,
          projectDir,
        );
      }
      if (!specifier.text.startsWith(".")) {
        throwStaticLinkError(
          sourceFile,
          specifier,
          `runtime imports from declaration-only package '${specifier.text}' are not supported; use ambient globals or a relative Lua interop declaration`,
          projectDir,
        );
      }
      // A relative .d.ts module is a Lua interop contract. Its named imports
      // are rewritten to identifiers expected to exist in the linked Lua chunk.
      return;
    }
    if (!isTypeScriptImplementationFile(resolvedSource.fileName)) {
      throwStaticLinkError(
        sourceFile,
        specifier,
        `${description} resolved to unsupported runtime source ${resolvedSource.fileName}`,
        projectDir,
      );
    }
    dependencies.push(resolvedSource);
  };

  // Dynamic imports can occur below top-level statements, unlike static imports.
  const inspectDynamicImport = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      throwStaticLinkError(sourceFile, node, "dynamic import() is not supported", projectDir);
    }
    ts.forEachChild(node, inspectDynamicImport);
  };

  for (const statement of sourceFile.statements) {
    inspectDynamicImport(statement);
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;
      if (clause?.isTypeOnly) {
        continue;
      }
      if (clause?.name) {
        throwStaticLinkError(sourceFile, clause.name, "default imports are not supported", projectDir);
      }
      if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
        throwStaticLinkError(sourceFile, clause.namedBindings, "namespace imports are not supported", projectDir);
      }
      const runtimeBindings = clause?.namedBindings && ts.isNamedImports(clause.namedBindings)
        ? clause.namedBindings.elements.filter((element) => !element.isTypeOnly)
        : [];
      const hasRuntimeBindings = runtimeBindings.length > 0;
      if (clause && !hasRuntimeBindings) {
        continue;
      }
      addModuleDependency(statement.moduleSpecifier, hasRuntimeBindings, "import");
      continue;
    }
    if (ts.isExportAssignment(statement)) {
      throwStaticLinkError(sourceFile, statement, "default exports and export assignments are not supported", projectDir);
    }
    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly) {
        continue;
      }
      if (!statement.exportClause) {
        throwStaticLinkError(sourceFile, statement, "export * is not supported", projectDir);
      }
      if (ts.isNamespaceExport(statement.exportClause)) {
        throwStaticLinkError(sourceFile, statement.exportClause, "namespace exports are not supported", projectDir);
      }
      const runtimeExports = statement.exportClause.elements.filter((element) => !element.isTypeOnly);
      if (runtimeExports.some((element) => element.name.text === "default")) {
        throwStaticLinkError(sourceFile, statement, "default exports are not supported", projectDir);
      }
      if (statement.moduleSpecifier && runtimeExports.length > 0) {
        addModuleDependency(statement.moduleSpecifier, true, "re-export");
      }
    }
  }
  return {
    dependencies: distinctModules(dependencies),
    manifestCodeDependencies: Array.from(manifestCodeDependencies.values()),
    linkSpecifiers,
  };
}

function getModuleValueExportNames(program: ts.Program, moduleSpecifier: ts.StringLiteralLike): string[] {
  const checker = program.getTypeChecker();
  let moduleSymbol = checker.getSymbolAtLocation(moduleSpecifier);
  if (moduleSymbol?.flags && moduleSymbol.flags & ts.SymbolFlags.Alias) {
    moduleSymbol = checker.getAliasedSymbol(moduleSymbol);
  }
  if (!moduleSymbol) {
    return [];
  }
  return checker.getExportsOfModule(moduleSymbol)
    .filter((symbol) => {
      const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      return (target.flags & ts.SymbolFlags.Value) !== 0;
    })
    .map((symbol) => symbol.name);
}

function distinctModules(modules: readonly ts.SourceFile[]): ts.SourceFile[] {
  const seen = new Set<string>();
  return modules.filter((module) => {
    const key = getCanonicalTSPathKey(module.fileName);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// because of the flattened shape of the link output, we have constraints on what
// can be exported beyond that of native ts (e.g. name collision between 2 modules)
// perform that validation here.
function validateGlobalExports(
  program: ts.Program,
  modules: readonly StaticModule[],
  entryFilePath: string,
  entryCallbackNames: ReadonlySet<string>,
  projectDir: string,
): void {
  const checker = program.getTypeChecker();
  const owners = new Map<string, { sourceFile: ts.SourceFile; target: ts.Symbol }>();
  for (const module of modules) {
    const moduleSymbol = checker.getSymbolAtLocation(module.sourceFile);
    if (!moduleSymbol) {
      continue;
    }
    for (const exportedSymbol of checker.getExportsOfModule(moduleSymbol)) {
      if (exportedSymbol.name === "default" || exportedSymbol.name === "export=") {
        continue;
      }
      const target = exportedSymbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(exportedSymbol)
        : exportedSymbol;
      if ((target.flags & ts.SymbolFlags.Value) === 0) {
        continue;
      }
      validateLuaGlobalName(exportedSymbol.name, module.sourceFile, projectDir);
      const existing = owners.get(exportedSymbol.name);
      if (existing && existing.target !== target) {
        throw new Error(
          `TypeScript static linking failed: exported Lua global '${exportedSymbol.name}' is declared by both ` +
          `${displayPath(existing.sourceFile.fileName, projectDir)} and ${displayPath(module.sourceFile.fileName, projectDir)}`,
        );
      }
      owners.set(exportedSymbol.name, { sourceFile: module.sourceFile, target });
    }
  }

  const entryFile = program.getSourceFile(entryFilePath);
  if (!entryFile) {
    return;
  }
  for (const callbackName of entryCallbackNames) {
    validateLuaGlobalName(callbackName, entryFile, projectDir);
    const existing = owners.get(callbackName);
    if (existing && getCanonicalTSPathKey(existing.sourceFile.fileName) !== getCanonicalTSPathKey(entryFile.fileName)) {
      throw new Error(
        `TypeScript static linking failed: Lua global callback '${callbackName}' in ` +
        `${displayPath(entryFile.fileName, projectDir)} conflicts with an export from ` +
        displayPath(existing.sourceFile.fileName, projectDir),
      );
    }
  }

  const manifestCodeOwners = new Map<string, string>();
  for (const module of modules) {
    for (const dependency of module.manifestCodeDependencies) {
      for (const globalName of dependency.exportedValueNames) {
        validateLuaGlobalName(globalName, module.sourceFile, projectDir);
        const typescriptOwner = owners.get(globalName);
        if (typescriptOwner) {
          throw new Error(
            `TypeScript static linking failed: manifest code asset '${dependency.importName}' and ` +
            `${displayPath(typescriptOwner.sourceFile.fileName, projectDir)} both declare Lua global '${globalName}'`,
          );
        }
        if (entryCallbackNames.has(globalName)) {
          throw new Error(
            `TypeScript static linking failed: manifest code asset '${dependency.importName}' conflicts with ` +
            `Lua global callback '${globalName}' in ${displayPath(entryFile.fileName, projectDir)}`,
          );
        }
        const existingAsset = manifestCodeOwners.get(globalName);
        if (existingAsset && existingAsset !== dependency.importName) {
          throw new Error(
            `TypeScript static linking failed: manifest code assets '${existingAsset}' and '${dependency.importName}' ` +
            `both declare Lua global '${globalName}'`,
          );
        }
        manifestCodeOwners.set(globalName, dependency.importName);
      }
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// rewrites a TSTL module AST into a static Lua code fragment.
// three passes are required:
// - discover module tables
// - bind their local aliases to global export names
// - remove plumbing and rewrite all remaining references
function lowerStaticModule(
  file: tstl.File,
  callbackNames: ReadonlySet<string>,
  linkSpecifiers: ReadonlySet<string>,
): tstl.File {
  const moduleTableNames = new Set<string>();
  const moduleTableSymbols = new Set<tstl.SymbolId>();
  const globalAliases = new Map<tstl.SymbolId, string>();

  // Named re-exports are emitted by TSTL in a nested do block, so module
  // plumbing has to be discovered throughout the file rather than only among
  // its top-level statements.
  visitStatementLists(file, (statements) => {
    for (const statement of statements) {
      const requiredModule = getRequiredModuleDeclaration(statement, linkSpecifiers);
      if (!requiredModule) {
        continue;
      }
      moduleTableNames.add(requiredModule.identifier.text);
      if (requiredModule.identifier.symbolId !== undefined) {
        moduleTableSymbols.add(requiredModule.identifier.symbolId);
      }
    }
  });

  visitStatementLists(file, (statements) => {
    for (const statement of statements) {
      const alias = getStaticAliasDeclaration(statement, moduleTableNames, moduleTableSymbols);
      if (alias?.local.symbolId !== undefined) {
        globalAliases.set(alias.local.symbolId, alias.globalName);
      }
      const exportAlias = getExportAliasDeclaration(statement);
      if (exportAlias?.local.symbolId !== undefined) {
        globalAliases.set(exportAlias.local.symbolId, exportAlias.globalName);
      }
    }
  });

  visitStatementLists(file, (statements, isTopLevel) => {
    const keptStatements: tstl.Statement[] = [];
    for (const statement of statements) {
      if (isTopLevel && (isExportsTableDeclaration(statement) || isExportsReturn(statement))) {
        continue;
      }
      if (
        getRequiredModuleDeclaration(statement, linkSpecifiers) ||
        isBareRequireStatement(statement, linkSpecifiers) ||
        getStaticAliasDeclaration(statement, moduleTableNames, moduleTableSymbols) ||
        getExportAliasDeclaration(statement)
      ) {
        continue;
      }
      if (
        isTopLevel &&
        tstl.isVariableDeclarationStatement(statement) &&
        statement.left.length === 1 &&
        statement.right?.length === 1 &&
        callbackNames.has(statement.left[0].text)
      ) {
        const local = statement.left[0];
        if (local.symbolId !== undefined) {
          globalAliases.set(local.symbolId, local.text);
        }
        const promoted = tstl.createAssignmentStatement(local, statement.right[0]);
        copyStatementMetadata(statement, promoted);
        keptStatements.push(promoted);
        continue;
      }
      keptStatements.push(statement);
    }
    statements.splice(0, statements.length, ...keptStatements);
  });

  file.statements = file.statements.map((statement) =>
    rewriteLuaNode(statement, moduleTableNames, moduleTableSymbols, globalAliases),
  );
  return file;
}

// Visits every statement array in a Lua file, including blocks and function
// bodies. TSTL places named re-export plumbing inside a nested do block, so 
// recursion necessary.
function visitStatementLists(
  file: tstl.File,
  visitor: (statements: tstl.Statement[], isTopLevel: boolean) => void,
): void {
  // TSTL's AST has no generic visitor, so recurse through node-valued fields
  // while giving statement arrays a mutable, purpose-specific callback.
  const visitNode = (node: tstl.Node, isFile: boolean) => {
    const record = node as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      if (key === "statements" && Array.isArray(value)) {
        visitor(value as tstl.Statement[], isFile);
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          if (isLuaNode(item)) {
            visitNode(item, false);
          }
        }
      } else if (isLuaNode(value)) {
        visitNode(value, false);
      }
    }
  };
  visitNode(file, true);
}

// Matches TSTL's per-module `local ____exports = {}` initializer.
function isExportsTableDeclaration(statement: tstl.Statement): boolean {
  return (
    tstl.isVariableDeclarationStatement(statement) &&
    statement.left.length === 1 &&
    statement.left[0].text === "____exports" &&
    statement.right?.length === 1 &&
    tstl.isTableExpression(statement.right[0])
  );
}

// Matches TSTL's final `return ____exports` module result.
function isExportsReturn(statement: tstl.Statement): boolean {
  return (
    tstl.isReturnStatement(statement) &&
    statement.expressions.length === 1 &&
    tstl.isIdentifier(statement.expressions[0]) &&
    statement.expressions[0].text === "____exports"
  );
}

// Recognizes a TSTL-generated `local module = require("xyz")` declaration,
// restricted to specifiers found in this module's TypeScript syntax.
function getRequiredModuleDeclaration(
  statement: tstl.Statement,
  linkSpecifiers: ReadonlySet<string>,
): { identifier: tstl.Identifier; moduleName: string } | undefined {
  if (
    !tstl.isVariableDeclarationStatement(statement) ||
    statement.left.length !== 1 ||
    statement.right?.length !== 1
  ) {
    return undefined;
  }
  const moduleName = getRequireModuleName(statement.right[0]);
  return moduleName === undefined || !linkSpecifiers.has(moduleName)
    ? undefined
    : { identifier: statement.left[0], moduleName };
}

// Recognizes a generated side-effect require belonging to a static import.
function isBareRequireStatement(statement: tstl.Statement, linkSpecifiers: ReadonlySet<string>): boolean {
  if (!tstl.isExpressionStatement(statement)) {
    return false;
  }
  const moduleName = getRequireModuleName(statement.expression);
  return moduleName !== undefined && linkSpecifiers.has(moduleName);
}

// Returns the string argument of a simple Lua `require("...")` call.
function getRequireModuleName(expression: tstl.Expression): string | undefined {
  if (
    !tstl.isCallExpression(expression) ||
    !tstl.isIdentifier(expression.expression) ||
    expression.expression.text !== "require" ||
    expression.params.length !== 1 ||
    !tstl.isStringLiteral(expression.params[0])
  ) {
    return undefined;
  }
  return expression.params[0].value;
}

// Matches TSTL's named-import alias form, such as
// `local draw = ____scene.draw`, and returns its eventual global name.
function getStaticAliasDeclaration(
  statement: tstl.Statement,
  moduleTableNames: ReadonlySet<string>,
  moduleTableSymbols: ReadonlySet<tstl.SymbolId>,
): { local: tstl.Identifier; globalName: string } | undefined {
  if (
    !tstl.isVariableDeclarationStatement(statement) ||
    statement.left.length !== 1 ||
    statement.right?.length !== 1
  ) {
    return undefined;
  }
  const globalName = getModulePropertyName(statement.right[0], moduleTableNames, moduleTableSymbols);
  return globalName === undefined ? undefined : { local: statement.left[0], globalName };
}

// Matches a local alias back to the exports table. TSTL emits this for some
// declarations, notably classes, after assigning the exported value.
function getExportAliasDeclaration(
  statement: tstl.Statement,
): { local: tstl.Identifier; globalName: string } | undefined {
  if (
    !tstl.isVariableDeclarationStatement(statement) ||
    statement.left.length !== 1 ||
    statement.right?.length !== 1
  ) {
    return undefined;
  }
  const globalName = getExportsPropertyName(statement.right[0]);
  return globalName === undefined ? undefined : { local: statement.left[0], globalName };
}

// Extracts `name` from TSTL's `____exports.name` table access.
function getExportsPropertyName(expression: tstl.Expression): string | undefined {
  if (
    !tstl.isTableIndexExpression(expression) ||
    !tstl.isIdentifier(expression.table) ||
    expression.table.text !== "____exports" ||
    !tstl.isStringLiteral(expression.index)
  ) {
    return undefined;
  }
  return expression.index.value;
}

// Extracts an imported name from a previously identified module-table access.
function getModulePropertyName(
  expression: tstl.Expression,
  moduleTableNames: ReadonlySet<string>,
  moduleTableSymbols: ReadonlySet<tstl.SymbolId>,
): string | undefined {
  if (
    !tstl.isTableIndexExpression(expression) ||
    !tstl.isIdentifier(expression.table) ||
    !isModuleTableIdentifier(expression.table, moduleTableNames, moduleTableSymbols) ||
    !tstl.isStringLiteral(expression.index)
  ) {
    return undefined;
  }
  return expression.index.value;
}

function isModuleTableIdentifier(
  identifier: tstl.Identifier,
  moduleTableNames: ReadonlySet<string>,
  moduleTableSymbols: ReadonlySet<tstl.SymbolId>,
): boolean {
  return (
    moduleTableNames.has(identifier.text) ||
    (identifier.symbolId !== undefined && moduleTableSymbols.has(identifier.symbolId))
  );
}

// recursively replaces
// - `____exports.name` with `name`
// - `module.name` with `name`
// - local aliases of the above with `name`
function rewriteLuaNode<T extends tstl.Node>(
  node: T,
  moduleTableNames: ReadonlySet<string>,
  moduleTableSymbols: ReadonlySet<tstl.SymbolId>,
  globalAliases: ReadonlyMap<tstl.SymbolId, string>,
): T {
  if (tstl.isTableIndexExpression(node)) {
    const globalName = getExportsPropertyName(node) ?? getModulePropertyName(node, moduleTableNames, moduleTableSymbols);
    if (globalName !== undefined) {
      return createMappedGlobalIdentifier(globalName, node) as unknown as T;
    }
  }
  if (tstl.isIdentifier(node) && node.symbolId !== undefined) {
    const globalName = globalAliases.get(node.symbolId);
    if (globalName !== undefined) {
      return createMappedGlobalIdentifier(globalName, node, node.originalName ?? node.text) as unknown as T;
    }
  }

  const mutable = node as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(mutable)) {
    if (Array.isArray(value)) {
      mutable[key] = value.map((item) =>
        isLuaNode(item) ? rewriteLuaNode(item, moduleTableNames, moduleTableSymbols, globalAliases) : item,
      );
    } else if (isLuaNode(value)) {
      mutable[key] = rewriteLuaNode(value, moduleTableNames, moduleTableSymbols, globalAliases);
    }
  }
  return node;
}

// associate a new global identifier with the original authored position and
// symbol name for source maps and minifier rename tracking
function createMappedGlobalIdentifier(
  globalName: string,
  sourceNode: tstl.Node,
  originalName = globalName,
): tstl.Identifier {
  const identifier = tstl.createIdentifier(globalName, undefined, undefined, originalName);
  identifier.flags = sourceNode.flags;
  identifier.line = sourceNode.line;
  identifier.column = sourceNode.column;
  return identifier;
}

// preserves comments and mapping coordinates when changing statement kind
function copyStatementMetadata(source: tstl.Statement, target: tstl.Statement): void {
  target.flags = source.flags;
  target.line = source.line;
  target.column = source.column;
  target.leadingComments = source.leadingComments;
  target.trailingComments = source.trailingComments;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function throwStaticLinkError(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  message: string,
  projectDir: string,
): never {
  const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  throw new Error(
    `TypeScript static linking failed: ${displayPath(sourceFile.fileName, projectDir)}:${location.line + 1}:${location.character + 1} - ${message}`,
  );
}

// for diagnostics prefer a project-relative path
function displayPath(fileName: string, projectDir: string): string {
  return path.relative(projectDir, fileName) || path.basename(fileName);
}

// rewrites module-relative paths -> absolute paths so they are uniquely/distinguishably keyed
function rewriteSourceNodePath(node: MutableSourceNode, sourcePath: string): void {
  if (node.source !== null && node.source !== undefined) {
    node.source = sourcePath;
  }
  for (const child of node.children ?? []) {
    if (typeof child !== "string") {
      rewriteSourceNodePath(child, sourcePath);
    }
  }
}
