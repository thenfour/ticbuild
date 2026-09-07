import * as ts from "typescript";
import { TraceScope } from "../../utils/traceProfiler";
import { ExternalDependency, ResourceManager } from "../ImportedResourceTypes";
import { LuaImportSourceResolver, preprocessTypeScriptDeclarationDirectives } from "../luaPreprocessor";
import { TicbuildProjectCore } from "../projectCore";
import {
  collectLuaAssetDeclarations, LuaAssetDeclarations, renderLuaAssetDeclarations,
  resolveDeclarationInclude, writeLuaAssetTypeScriptDeclarations,
} from "./LuaAssetTypeScriptModules";
import { LuaCodeResource } from "./LuaCodeImporter";
import { LuaTypeCatalog } from "./LuaTypeCatalog";
import { createManifestCodeModuleCatalog, MANIFEST_CODE_MODULE_PREFIX, ManifestCodeModuleDefinition } from "./ManifestCodeTypeScriptModules";
import { writeTypeScriptBuildConstants } from "./TypeScriptBuildConstants";
import { TypeScriptCodeResource } from "./TypeScriptCodeImporter";
import { TypeScriptDeclarationSources } from "./TypeScriptDeclarationSources";
import {
  emitTypeScriptManifestModuleDeclaration, renderTypeScriptManifestDeclarations,
  TypeScriptManifestModuleDeclaration, writeTypeScriptManifestDeclarations,
} from "./TypeScriptManifestModules";
import { createTypeScriptProgram, isGeneratedDeclarationFile, TypeScriptDeclarationContext } from "./TypeScriptProgram";
import { getCanonicalTSPathKey, isTypeScriptImplementationFile } from "./TypeScriptStaticLinker";
import { formatDiagnostics } from "./TypeScriptTranspiler";

type CodeEdge = { importName: string; typeOnly: boolean };
type TypeScriptSource = { fileName: string; sourceText: string; typeOnly: boolean };
type AnalysisProgram = { resource: TypeScriptCodeResource; context: ReturnType<typeof createTypeScriptProgram> };
type PreparedModule = { resource: TypeScriptCodeResource; declaration: TypeScriptManifestModuleDeclaration };

/** A build-scoped source graph. Declaration availability never depends on Lua emission. */
export class CodeDeclarationAnalysis {
  private readonly typeScript = new Map<string, TypeScriptCodeResource>();
  private readonly lua = new Map<string, LuaAssetDeclarations>();
  private readonly edges = new Map<string, CodeEdge[]>();
  private readonly manifestModules: ReadonlyMap<string, ManifestCodeModuleDefinition>;

  constructor(
    private readonly project: TicbuildProjectCore,
    private readonly resources: ResourceManager,
    private readonly resolveImportSource: LuaImportSourceResolver,
  ) {
    this.manifestModules = createManifestCodeModuleCatalog(project);
  }

  async prepare(roots: readonly string[], scope?: TraceScope): Promise<void> {
    await this.discoverResources(roots, scope);
    // Runtime cycles are checked separately; recursive type references are legal.
    const runtimeResources = new Set(roots.flatMap(root => this.runtimeOrder(root)));
    const entries = this.orderedTypeScriptResources();
    const analysisContext = this.createSourceAnalysisContext(entries);
    const programs = entries.map(resource => ({ resource, context: this.createProgram(resource, analysisContext) }));
    const sources = this.collectDeclarationSources(programs);

    const types = this.collectNamedTypes(programs, sources.getModuleNames());
    const lua = renderLuaAssetDeclarations(this.orderedLuaModules(), types);
    const additionalSources = types.getAdditionalTypeScriptSources();
    sources.addTypeAliases(additionalSources);

    const { prepared, typeOnlyDiagnostics } = this.emitDeclarations(
      entries, { ...analysisContext, lua, additionalSources }, sources, runtimeResources,
    );
    this.attachPreparedDeclarations(prepared, lua, sources);
    await this.writeEditorDeclarations(lua, prepared);
    this.throwOnErrors(ts.sortAndDeduplicateDiagnostics(typeOnlyDiagnostics));
  }

  private async discoverResources(roots: readonly string[], scope?: TraceScope): Promise<void> {
    for (const root of roots) await this.discoverResource(root, scope);
  }

  private async discoverResource(name: string, scope?: TraceScope): Promise<void> {
    if (this.edges.has(name)) return;
    const definition = this.manifestModules.get(name);
    if (!definition) return;
    // Register the node before descending so type-only cycles terminate discovery.
    const edges: CodeEdge[] = [];
    this.edges.set(name, edges);
    const resource = await this.resources.loadResource(name);
    if (resource instanceof TypeScriptCodeResource) {
      this.typeScript.set(name, resource);
      edges.push(...await this.discoverTypeScriptDependencies(resource));
    } else if (resource instanceof LuaCodeResource && definition.kind === "LuaCode") {
      const module = await collectLuaAssetDeclarations(
        this.project, this.resources, { ...definition, kind: "LuaCode" }, scope, this.resolveImportSource,
      );
      this.lua.set(name, module);
      edges.push(...Array.from(module.codeImports, importName => ({ importName, typeOnly: false })));
      resource.setDeclarationDependencies(module.dependencies.map(file => ({ path: file, reason: "Lua preprocessor dependency" })));
    }
    for (const edge of edges) await this.discoverResource(edge.importName, scope);
  }

  private async discoverTypeScriptDependencies(resource: TypeScriptCodeResource): Promise<CodeEdge[]> {
    const sources: TypeScriptSource[] = [];
    const edges: CodeEdge[] = [...resource.getManifestCodeDependencies(this.project, (fileName, sourceText, typeOnly) => {
      if (isTypeScriptImplementationFile(fileName)) sources.push({ fileName, sourceText, typeOnly });
    })];
    for (const source of sources) edges.push(...await this.discoverPreprocessorIncludes(source));
    return edges;
  }

  private async discoverPreprocessorIncludes(source: TypeScriptSource): Promise<CodeEdge[]> {
    const edges: CodeEdge[] = [];
    await preprocessTypeScriptDeclarationDirectives(this.project, source.sourceText, source.fileName, {
      resolveImportSource: this.resolveImportSource,
      resolveCodeImport: async importName => {
        edges.push({ importName, typeOnly: source.typeOnly });
        return resolveDeclarationInclude(this.project, this.resources, importName);
      },
    });
    return edges;
  }

  private orderedTypeScriptResources(): TypeScriptCodeResource[] {
    return Array.from(this.typeScript.values()).sort((a, b) => a.manifestImportName.localeCompare(b.manifestImportName));
  }

  private orderedLuaModules(): LuaAssetDeclarations[] {
    return Array.from(this.lua.values()).sort((a, b) => a.definition.importName.localeCompare(b.definition.importName));
  }

  private createSourceAnalysisContext(entries: readonly TypeScriptCodeResource[]): TypeScriptDeclarationContext {
    const sources = new Map(entries.map(resource => [
      `${MANIFEST_CODE_MODULE_PREFIX}${resource.manifestImportName}`,
      { filePath: resource.filePath, sourceText: resource.sourceText },
    ]));
    return { lua: "", typescript: "", sources };
  }

  private createProgram(resource: TypeScriptCodeResource, declarations: TypeScriptDeclarationContext) {
    return createTypeScriptProgram(
      this.project, resource.filePath, resource.sourceText, resource.typescriptConfig, undefined, declarations,
    );
  }

  private collectDeclarationSources(programs: readonly AnalysisProgram[]): TypeScriptDeclarationSources {
    return new TypeScriptDeclarationSources(this.project.projectDir, programs.map(({ resource, context }) => ({
      importName: resource.manifestImportName, entryFilePath: resource.filePath, program: context.program,
    })));
  }

  private collectNamedTypes(programs: readonly AnalysisProgram[], moduleNames: ReadonlyMap<string, string>): LuaTypeCatalog {
    const types = new LuaTypeCatalog(this.project.projectDir);
    for (const module of this.orderedLuaModules()) {
      types.addLuaTypes(module.definition.moduleSpecifier, module.types, module.declarations.map(item => item.name));
    }
    for (const { context } of programs) types.addTypeScriptProgram(context.program, moduleNames);
    return types;
  }

  private emitDeclarations(
    entries: readonly TypeScriptCodeResource[],
    declarations: TypeScriptDeclarationContext,
    sources: TypeScriptDeclarationSources,
    runtimeResources: ReadonlySet<TypeScriptCodeResource>,
  ): { prepared: PreparedModule[]; typeOnlyDiagnostics: ts.Diagnostic[] } {
    const prepared: PreparedModule[] = [];
    const typeOnlyDiagnostics: ts.Diagnostic[] = [];
    const moduleNames = sources.getModuleNames();
    for (const resource of entries) {
      const context = this.createProgram(resource, declarations);
      const ownedFiles = sources.getOwnedFileKeys(resource.manifestImportName);
      const declaration = this.emitResourceDeclaration(resource, context, moduleNames, ownedFiles);
      if (!runtimeResources.has(resource)) {
        typeOnlyDiagnostics.push(...collectOwnedSourceDiagnostics(context.program, ownedFiles));
      }
      resource.setDeclarationDependencies(this.collectWatchDependencies(context));
      prepared.push({ resource, declaration });
    }
    return { prepared, typeOnlyDiagnostics };
  }

  private emitResourceDeclaration(
    resource: TypeScriptCodeResource,
    context: AnalysisProgram["context"],
    moduleNames: ReadonlyMap<string, string>,
    ownedFiles: ReadonlySet<string>,
  ): TypeScriptManifestModuleDeclaration {
    const emitted = emitTypeScriptManifestModuleDeclaration(
      context.program, context.compilerHost, resource.filePath, resource.manifestImportName,
      this.project.projectDir, moduleNames, ownedFiles,
    );
    this.throwOnErrors(emitted.diagnostics);
    if (!emitted.declaration) {
      throw new Error(`TypeScript declaration emit failed for manifest import '${resource.manifestImportName}'`);
    }
    return emitted.declaration;
  }

  private collectWatchDependencies(context: AnalysisProgram["context"]): ExternalDependency[] {
    const entries = new Map(Array.from(this.typeScript.values(), resource => [getCanonicalTSPathKey(resource.filePath), resource]));
    const dependencies: ExternalDependency[] = [];
    for (const source of context.program.getSourceFiles()) {
      if (!isWatchableCompilerSource(this.project.projectDir, context.program, source)) continue;
      const resource = entries.get(getCanonicalTSPathKey(source.fileName));
      // A command-produced entry is watched through its authored inputs, not its
      // generated output. Relative compiler sources are ordinary file dependencies.
      const authoredDependencies = resource?.getSourceDependencies() ??
        [{ path: source.fileName, reason: "TypeScript compiler dependency" }];
      dependencies.push(...authoredDependencies);
    }
    for (const file of context.configuredProject.configDependencies) {
      dependencies.push({ path: file, reason: "TypeScript project configuration" });
    }
    return dependencies;
  }

  private attachPreparedDeclarations(prepared: readonly PreparedModule[], lua: string, sources: TypeScriptDeclarationSources): void {
    for (const { resource, declaration } of prepared) {
      const otherDeclarations = prepared
        .filter(item => item.resource !== resource)
        .map(item => item.declaration);
      // References into this compilation use original source symbols, especially
      // for classes with private members. Only other owners use emitted mirrors.
      resource.setPreparedDeclarations(declaration, {
        lua,
        typescript: renderTypeScriptManifestDeclarations(otherDeclarations),
        sources: sources.getOwnedModuleSources(resource.manifestImportName),
      });
    }
  }

  private async writeEditorDeclarations(lua: string, prepared: readonly PreparedModule[]): Promise<void> {
    await writeTypeScriptBuildConstants(this.project);
    await writeLuaAssetTypeScriptDeclarations(this.project.projectDir, lua);
    await writeTypeScriptManifestDeclarations(this.project.projectDir, prepared.map(item => item.declaration));
  }

  private throwOnErrors(diagnostics: readonly ts.Diagnostic[]): void {
    const errors = diagnostics.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error);
    if (errors.length) throw new Error(formatDiagnostics(errors, this.project.projectDir));
  }

  private runtimeOrder(root: string): TypeScriptCodeResource[] {
    const visited = new Set<string>();
    const stack: string[] = [];
    const ordered: TypeScriptCodeResource[] = [];
    const visit = (name: string) => {
      const cycleStart = stack.indexOf(name);
      if (cycleStart >= 0) {
        const cycle = [...stack.slice(cycleStart), name].join(" -> ");
        throw new Error(`TypeScript manifest module cycles are not supported: ${cycle}`);
      }
      if (visited.has(name)) return;
      visited.add(name);
      stack.push(name);
      for (const edge of this.edges.get(name) ?? []) {
        if (!edge.typeOnly) visit(edge.importName);
      }
      stack.pop();
      const resource = this.typeScript.get(name);
      if (resource) ordered.push(resource);
    };
    visit(root);
    return ordered;
  }

  async generate(resource: TypeScriptCodeResource): Promise<void> {
    for (const dependency of this.runtimeOrder(resource.manifestImportName)) {
      await dependency.getGeneratedLuaSource(this.project);
    }
  }
}

function collectOwnedSourceDiagnostics(program: ts.Program, ownedFiles: ReadonlySet<string>): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = [];
  for (const source of program.getSourceFiles()) {
    if (!ownedFiles.has(getCanonicalTSPathKey(source.fileName))) continue;
    diagnostics.push(...program.getSyntacticDiagnostics(source), ...program.getSemanticDiagnostics(source));
  }
  return diagnostics;
}

function isWatchableCompilerSource(projectDir: string, program: ts.Program, source: ts.SourceFile): boolean {
  return !isGeneratedDeclarationFile(projectDir, source.fileName) &&
    !program.isSourceFileDefaultLibrary(source) &&
    !source.fileName.replace(/\\/g, "/").includes("/node_modules/");
}
