// importing -> ImportedResource -> assembly

import { assert } from "../utils/errorHandling";
import { ImportedResourceBase, ResourceManager } from "./ImportedResourceTypes";
import { importLuaCode, LuaCodeResource } from "./importers/LuaCodeImporter";
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
import { ImportDefinition, kImportKind } from "./manifestTypes";
import { TicbuildProjectCore, canonicalizeAssetImport } from "./projectCore";
import { ImportSourceManager, MaterializedImportSource } from "./importSources";
import { profileAsync, TraceProfiler, TraceScope, TraceTrack } from "../utils/traceProfiler";

export async function loadAllImports(
  project: TicbuildProjectCore,
  profiler?: TraceProfiler,
  parentScope?: TraceScope,
): Promise<ResourceManager> {
  const importDefinitions = new Map<string, ImportDefinition>();
  for (const importDef of project.manifest.imports) {
    if (!importDef.kind) {
      throw new Error(`Import ${importDef.name} is missing kind`);
    }
    assert(importDef.kind in kImportKind.key);
    if (importDefinitions.has(importDef.name)) {
      throw new Error(`Duplicate import name: ${importDef.name}`);
    }
    importDefinitions.set(importDef.name, importDef);
  }

  // Construction validates every declaration without reading sources or running commands.
  const sourceManager = new ImportSourceManager(project);
  const profileTracks = new Map<string, TraceTrack>();
  const getProfileTrack = (importName: string): TraceTrack | undefined => {
    let track = profileTracks.get(importName);
    if (!track) {
      track = profiler?.createTrack(`Import: ${importName}`);
      if (track) {
        profileTracks.set(importName, track);
      }
    }
    return track;
  };

  const items = new Map<string, ImportedResourceBase>();
  const loadTasks = new Map<string, Promise<ImportedResourceBase | undefined>>();
  const loadResource = (importName: string): Promise<ImportedResourceBase | undefined> => {
    const existing = items.get(importName);
    if (existing) {
      return Promise.resolve(existing);
    }
    let task = loadTasks.get(importName);
    if (!task) {
      task = (async () => {
        const importDef = importDefinitions.get(importName);
        if (!importDef) {
          return undefined;
        }
        const sourcePlan = sourceManager.describe(importName);
        const track = getProfileTrack(importName);
        const source = await profileAsync(
          track,
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
          () => sourceManager.materialize(importName),
        );
        if (!source) {
          throw new Error(`Import source not found: ${importName}`);
        }
        const resource = await profileAsync(
          track,
          "Load imported resource",
          {
            category: "imports",
            parent: parentScope,
            args: { importName: importDef.name, importKind: importDef.kind },
          },
          () => importResource(project, importDef, source),
        );
        if (resource instanceof CodeResource) {
          resource.setProfileTrack(track);
        }
        items.set(importName, resource);
        return resource;
      })();
      loadTasks.set(importName, task);
    }
    return task;
  };

  let prepareGeneratedLua = async (_resource: ImportedResourceBase): Promise<void> => undefined;
  const resourceManager = new ResourceManager(
    items,
    loadResource,
    (_importName, resource) => prepareGeneratedLua(resource),
    project.manifest.imports.map((importDef) => importDef.name),
    new Set(
      project.manifest.imports
        .filter((importDef) =>
          importDef.kind === kImportKind.key.LuaCode || importDef.kind === kImportKind.key.TypeScriptCode)
        .map((importDef) => importDef.name),
    ),
  );

  const resolveImportSource = (importName: string) => {
    resourceManager.markImportUsed(importName);
    return sourceManager.materialize(importName);
  };

  const typeScriptDeclarations = new Map<string, TypeScriptManifestModuleDeclaration>();
  const luaDeclarationImports = new Set<string>();
  let declarationFilesInitialized = false;
  let typeScriptGenerationQueue: Promise<void> = Promise.resolve();

  const prepareDeclarationFiles = async (requiredLuaImports: ReadonlySet<string>): Promise<void> => {
    let declarationsChanged = !declarationFilesInitialized;
    for (const importName of requiredLuaImports) {
      if (!luaDeclarationImports.has(importName)) {
        luaDeclarationImports.add(importName);
        declarationsChanged = true;
      }
    }
    if (!declarationsChanged) {
      return;
    }
    await profileAsync(
      parentScope,
      "Prepare Lua asset declarations",
      { category: "TypeScript declarations" },
      (scope) => prepareLuaAssetTypeScriptDeclarations(project, resourceManager, scope, luaDeclarationImports),
    );
    await profileAsync(
      parentScope,
      "Initialize TypeScript manifest declarations",
      { category: "TypeScript declarations" },
      () => writeTypeScriptManifestDeclarations(project.projectDir, Array.from(typeScriptDeclarations.values())),
    );
    declarationFilesInitialized = true;
  };

  const ensureTypeScriptGenerated = async (target: TypeScriptCodeResource): Promise<void> => {
    if (target.hasGeneratedLuaSource()) {
      return;
    }
    const task = typeScriptGenerationQueue.then(async () => {
      if (target.hasGeneratedLuaSource()) {
        return;
      }
      // The dependency scanner follows configured declaration roots. Clear
      // aggregate declarations from the previous build before they can create
      // stale manifest-module edges (including false self-cycles).
      await prepareDeclarationFiles(new Set());
      const { ordered, luaImports } = await collectReachableTypeScriptResources(project, resourceManager, target);
      await prepareDeclarationFiles(luaImports);
      for (const resource of ordered) {
        if (!resource.hasGeneratedLuaSource()) {
          await resource.getGeneratedLuaSource(project);
        }
        if (!typeScriptDeclarations.has(resource.manifestImportName)) {
          typeScriptDeclarations.set(resource.manifestImportName, resource.getTypeScriptManifestModuleDeclaration());
          await profileAsync(
            parentScope,
            "Update TypeScript manifest declarations",
            {
              category: "TypeScript declarations",
              args: { importName: resource.manifestImportName },
            },
            () => writeTypeScriptManifestDeclarations(project.projectDir, Array.from(typeScriptDeclarations.values())),
          );
        }
      }
    });
    typeScriptGenerationQueue = task.catch(() => undefined);
    await task;
  };

  prepareGeneratedLua = async (resource) => {
    if (resource instanceof TypeScriptCodeResource) {
      await ensureTypeScriptGenerated(resource);
    }
  };

  const assemblyRootNames = Array.from(new Set(
    project.manifest.assembly.blocks.map((block) => canonicalizeAssetImport(block.asset).import),
  ));
  const assemblyRoots = await Promise.all(assemblyRootNames.map(async (importName) => {
    const resource = await resourceManager.loadResource(importName);
    if (!resource) {
      throw new Error(`Imported resource not found: ${importName}`);
    }
    return resource;
  }));

  const initializeCodeRoot = async (resource: CodeResource) => {
    await prepareGeneratedLua(resource);
    await resource.initialize(
      project,
      (importName) => resourceManager.getGeneratedLuaSource(project, importName),
      resolveImportSource,
      parentScope,
    );
  };
  await Promise.all(
    assemblyRoots
      .filter((resource): resource is CodeResource => resource instanceof CodeResource)
      .map(initializeCodeRoot),
  );

  const hasTypeScriptDefinitions = project.manifest.imports.some(
    (importDef) => importDef.kind === kImportKind.key.TypeScriptCode,
  );
  if (hasTypeScriptDefinitions) {
    // Keep generated editor declaration files accurate even when no TypeScript
    // resource is reachable. Empty files are cheap and prevent stale symbols.
    await prepareDeclarationFiles(new Set());
    const generatedTypeScriptResources = Array.from(items.values()).filter(
      (resource): resource is TypeScriptCodeResource =>
        resource instanceof TypeScriptCodeResource && resource.hasGeneratedLuaSource(),
    );
    await profileAsync(
      parentScope,
      "Write Lua declarations for TypeScript",
      { category: "TypeScript declarations" },
      () => writeTypeScriptLuaDeclarations(
        project.projectDir,
        generatedTypeScriptResources.flatMap((resource) => resource.getLuaDefinitionBlocks()),
      ),
    );
  }

  return resourceManager;
}

async function importResource(
  project: TicbuildProjectCore,
  importDef: ImportDefinition,
  source: MaterializedImportSource,
): Promise<ImportedResourceBase> {
  switch (importDef.kind) {
    case kImportKind.key.Tic80Cartridge:
      return importTic80Cart(project, importDef, source);
    case kImportKind.key.LuaCode:
      return importLuaCode(project, importDef, source);
    case kImportKind.key.TypeScriptCode:
      return importTypeScriptCode(project, importDef, source);
    case kImportKind.key.binary:
      return importBinaryResource(project, importDef, source);
    case kImportKind.key.text:
      return importTextResource(project, importDef, source);
    default:
      throw new Error(`Unsupported import kind: ${importDef.kind}`);
  }
}

async function collectReachableTypeScriptResources(
  project: TicbuildProjectCore,
  resources: ResourceManager,
  root: TypeScriptCodeResource,
): Promise<{ ordered: TypeScriptCodeResource[]; luaImports: Set<string> }> {
  const state = new Map<string, "visiting" | "visited">();
  const stack: string[] = [];
  const ordered: TypeScriptCodeResource[] = [];
  const luaImports = new Set<string>();

  const visit = async (resource: TypeScriptCodeResource): Promise<void> => {
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
    for (const dependency of resource.getManifestCodeDependencies(project)) {
      const dependencyResource = await resources.loadResource(dependency.importName);
      if (dependency.kind === kImportKind.key.LuaCode) {
        if (!(dependencyResource instanceof LuaCodeResource)) {
          throw new Error(`TypeScript manifest module '${name}' depends on missing LuaCode asset '${dependency.importName}'`);
        }
        luaImports.add(dependency.importName);
        continue;
      }
      if (!(dependencyResource instanceof TypeScriptCodeResource)) {
        throw new Error(`TypeScript manifest module '${name}' depends on missing TypeScriptCode asset '${dependency.importName}'`);
      }
      await visit(dependencyResource);
    }
    stack.pop();
    state.set(name, "visited");
    ordered.push(resource);
  };

  await visit(root);
  return { ordered, luaImports };
}
