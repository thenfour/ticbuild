// importing -> ImportedResource -> assembly

import { assert } from "../utils/errorHandling";
import { ImportedResourceBase, ResourceManager } from "./ImportedResourceTypes";
import { importLuaCode } from "./importers/LuaCodeImporter";
import { CodeResource } from "./importers/CodeResource";
import { importTypeScriptCode, TypeScriptCodeResource } from "./importers/TypeScriptCodeImporter";
import { prepareLuaAssetTypeScriptDeclarations } from "./importers/LuaAssetTypeScriptModules";
import { writeTypeScriptLuaDeclarations } from "./importers/TypeScriptLuaDeclarations";
import {
  TypeScriptManifestModuleDeclaration,
  writeTypeScriptManifestDeclarations,
} from "./importers/TypeScriptManifestModules";
import { importBinaryResource } from "./importers/binaryResourceImporter";
import { importTextResource } from "./importers/textResourceImporter";
import { importTic80Cart } from "./importers/tic80CartImporter";
import { kImportKind } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";
import { ImportSourceManager, MaterializedImportSource } from "./importSources";

//
export async function loadAllImports(project: TicbuildProjectCore): Promise<ResourceManager> {
  //  scan imports, select appropriate importer for each import,
  //  invoke importer to get ImportedResourceBase
  //  store in map of identifier -> ImportedResourceBase
  for (const importDef of project.manifest.imports) {
    if (!importDef.kind) {
      throw new Error(`Import ${importDef.name} is missing kind`);
    }
    assert(importDef.kind in kImportKind.key);
  }

  const sourceManager = new ImportSourceManager(project);
  const materializedSources = await Promise.all(
    project.manifest.imports.map(async (importDef) => {
      const source = await sourceManager.materialize(importDef.name);
      if (!source) {
        throw new Error(`Import source not found: ${importDef.name}`);
      }
      return source;
    }),
  );
  const tasks: Promise<ImportedResourceBase>[] = [];
  for (let importIndex = 0; importIndex < project.manifest.imports.length; importIndex++) {
    const importDef = project.manifest.imports[importIndex];
    const source: MaterializedImportSource = materializedSources[importIndex];
    switch (importDef.kind) {
      case kImportKind.key.Tic80Cartridge:
        const tic80ImportTask = importTic80Cart(project, importDef, source);
        tasks.push(tic80ImportTask);
        break;
      case kImportKind.key.LuaCode:
        const luaCodeImportTask = importLuaCode(project, importDef, source);
        tasks.push(luaCodeImportTask);
        break;
      case kImportKind.key.TypeScriptCode:
        const typeScriptCodeImportTask = importTypeScriptCode(project, importDef, source);
        tasks.push(typeScriptCodeImportTask);
        break;
      case kImportKind.key.binary: {
        const binaryImportTask = importBinaryResource(project, importDef, source);
        tasks.push(binaryImportTask);
        break;
      }
      case kImportKind.key.text: {
        const textImportTask = importTextResource(project, importDef, source);
        tasks.push(textImportTask);
        break;
      }
      default:
        throw new Error(`Unsupported import kind: ${importDef.kind}`);
    }
  }

  const importedResources = await Promise.all(tasks);
  const items = new Map<string, ImportedResourceBase>();
  for (let i = 0; i < importedResources.length; i++) {
    const importDef = project.manifest.imports[i];
    const resource = importedResources[i];
    items.set(importDef.name, resource);
  }

  const resourceManager = new ResourceManager(items);

  // TypeScript needs to see Lua module defs on the first build. Build
  // their declarations after all raw resources exist, but before any code
  // resource starts the language-specific generation pipeline.
  await prepareLuaAssetTypeScriptDeclarations(project, resourceManager);

  // code resources may have a processing step to be done here to generate its lua output.
  // (e.g. typescript transpilation)
  const codeResources = Array.from(items.values()).filter(
    (resource): resource is CodeResource => resource instanceof CodeResource,
  );
  const typeScriptResources: TypeScriptCodeResource[] = codeResources.filter(
    (resource): resource is TypeScriptCodeResource => resource instanceof TypeScriptCodeResource,
  );
  const initializeCodeResource = (resource: CodeResource) => resource.initialize(
    project,
    (importName) => resourceManager.getGeneratedLuaSource(project, importName),
    (importName) => sourceManager.materialize(importName),
  );

  // Manifest-backed TypeScript modules need their dependency declarations on
  // the first build. Compile them dependency-first, refreshing the aggregate
  // declaration catalog after each completed resource.
  const manifestDeclarations: TypeScriptManifestModuleDeclaration[] = [];
  if (typeScriptResources.length > 0) {
    await writeTypeScriptManifestDeclarations(project.projectDir, manifestDeclarations);
    for (const resource of orderTypeScriptResources(project, typeScriptResources)) {
      await initializeCodeResource(resource);
      manifestDeclarations.push(resource.getTypeScriptManifestModuleDeclaration());
      await writeTypeScriptManifestDeclarations(project.projectDir, manifestDeclarations);
    }
  }

  const typeScriptResourceSet = new Set<CodeResource>(typeScriptResources);
  await Promise.all(
    codeResources
      .filter((resource) => !typeScriptResourceSet.has(resource))
      .map(initializeCodeResource),
  );

  // write .d.lua for typescript code resources to give visiblity to Lua
  if (typeScriptResources.length > 0) {
    await writeTypeScriptLuaDeclarations(
      project.projectDir,
      typeScriptResources.flatMap((resource) => resource.getLuaDefinitionBlocks()),
    );
  }

  return resourceManager;
}

// rearrange based on dependencies.
function orderTypeScriptResources(
  project: TicbuildProjectCore,
  resources: readonly TypeScriptCodeResource[],
): TypeScriptCodeResource[] {
  const byName = new Map(resources.map((resource) => [resource.manifestImportName, resource] as const));
  const dependencies = new Map(
    resources.map((resource) => [
      resource.manifestImportName,
      resource.getTypeScriptManifestDependencies(project),
    ] as const),
  );
  const state = new Map<string, "visiting" | "visited">();
  const stack: string[] = [];
  const ordered: TypeScriptCodeResource[] = [];

  const visit = (resource: TypeScriptCodeResource) => {
    const name = resource.manifestImportName;
    const currentState = state.get(name);
    if (currentState === "visited") {
      return;
    }
    if (currentState === "visiting") {
      const cycleStart = stack.indexOf(name);
      const cycle = [...stack.slice(cycleStart), name].join(" -> ");
      throw new Error(`TypeScript manifest module cycles are not supported: ${cycle}`);
    }
    state.set(name, "visiting");
    stack.push(name);
    for (const dependencyName of dependencies.get(name) ?? []) {
      const dependency = byName.get(dependencyName);
      if (!dependency) {
        throw new Error(`TypeScript manifest module '${name}' depends on missing TypeScriptCode asset '${dependencyName}'`);
      }
      visit(dependency);
    }
    stack.pop();
    state.set(name, "visited");
    ordered.push(resource);
  };

  for (const resource of resources) {
    visit(resource);
  }
  return ordered;
}
