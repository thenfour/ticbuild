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
import { profileAsync, TraceProfiler, TraceScope, TraceTrack } from "../utils/traceProfiler";

//
export async function loadAllImports(
  project: TicbuildProjectCore,
  profiler?: TraceProfiler,
  parentScope?: TraceScope,
): Promise<ResourceManager> {
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
  const profileTracks = new Map<string, TraceTrack>();
  for (const importDef of project.manifest.imports) {
    const track = profiler?.createTrack(`Import: ${importDef.name}`);
    if (track) {
      profileTracks.set(importDef.name, track);
    }
  }
  const materializedSources = await Promise.all(
    project.manifest.imports.map(async (importDef) => {
      const sourcePlan = sourceManager.describe(importDef.name);
      using _profileScope = profileTracks.get(importDef.name)?.enter(
        sourcePlan?.sourceKind === "command" ? "Run command import" : "Materialize import source",
        {
          category: sourcePlan?.sourceKind === "command" ? "external command" : "imports",
          parent: parentScope,
          args: {
            importName: importDef.name,
            importKind: importDef.kind,
            sourceKind: sourcePlan?.sourceKind,
          },
        },
      );
      const source = await sourceManager.materialize(importDef.name);
      if (!source) {
        throw new Error(`Import source not found: ${importDef.name}`);
      }
      return source;
    }),
  );
  const tasks = project.manifest.imports.map(async (importDef, importIndex): Promise<ImportedResourceBase> => {
    const source: MaterializedImportSource = materializedSources[importIndex];
    using _profileScope = profileTracks.get(importDef.name)?.enter("Load imported resource", {
      category: "imports",
      parent: parentScope,
      args: { importName: importDef.name, importKind: importDef.kind },
    });
    switch (importDef.kind) {
      case kImportKind.key.Tic80Cartridge:
        return await importTic80Cart(project, importDef, source);
      case kImportKind.key.LuaCode:
        return await importLuaCode(project, importDef, source);
      case kImportKind.key.TypeScriptCode:
        return await importTypeScriptCode(project, importDef, source);
      case kImportKind.key.binary:
        return await importBinaryResource(project, importDef, source);
      case kImportKind.key.text:
        return await importTextResource(project, importDef, source);
      default:
        throw new Error(`Unsupported import kind: ${importDef.kind}`);
    }
  });

  const importedResources = await Promise.all(tasks);
  const items = new Map<string, ImportedResourceBase>();
  for (let i = 0; i < importedResources.length; i++) {
    const importDef = project.manifest.imports[i];
    const resource = importedResources[i];
    items.set(importDef.name, resource);
    if (resource instanceof CodeResource) {
      resource.setProfileTrack(profileTracks.get(importDef.name));
    }
  }

  const resourceManager = new ResourceManager(items);

  // TypeScript needs to see Lua module defs on the first build. Build
  // their declarations after all raw resources exist, but before any code
  // resource starts the language-specific generation pipeline.
  await profileAsync(
    parentScope,
    "Prepare Lua asset declarations",
    {
      category: "TypeScript declarations",
    },
    () => prepareLuaAssetTypeScriptDeclarations(project, resourceManager),
  );

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
    parentScope,
  );

  // Manifest-backed TypeScript modules need their dependency declarations on
  // the first build. Compile them dependency-first, refreshing the aggregate
  // declaration catalog after each completed resource.
  const manifestDeclarations: TypeScriptManifestModuleDeclaration[] = [];
  if (typeScriptResources.length > 0) {
    await profileAsync(
      parentScope,
      "Initialize TypeScript manifest declarations",
      {
        category: "TypeScript declarations",
      },
      () => writeTypeScriptManifestDeclarations(project.projectDir, manifestDeclarations),
    );
    for (const resource of orderTypeScriptResources(project, typeScriptResources)) {
      await initializeCodeResource(resource);
      manifestDeclarations.push(resource.getTypeScriptManifestModuleDeclaration());
      await profileAsync(
        parentScope,
        "Update TypeScript manifest declarations",
        {
          category: "TypeScript declarations",
          args: { importName: resource.manifestImportName },
        },
        () => writeTypeScriptManifestDeclarations(project.projectDir, manifestDeclarations),
      );
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
    await profileAsync(
      parentScope,
      "Write Lua declarations for TypeScript",
      { category: "TypeScript declarations" },
      () => writeTypeScriptLuaDeclarations(
        project.projectDir,
        typeScriptResources.flatMap((resource) => resource.getLuaDefinitionBlocks()),
      ),
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
