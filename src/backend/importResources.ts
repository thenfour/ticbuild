// importing -> ImportedResource -> assembly

import { assert } from "../utils/errorHandling";
import { profileAsync, TraceProfiler, TraceScope, TraceTrack } from "../utils/traceProfiler";
import { ImportedResourceBase, ResourceManager } from "./ImportedResourceTypes";
import { ImportSourceManager, MaterializedImportSource } from "./importSources";
import { CodeDeclarationAnalysis } from "./importers/CodeDeclarationAnalysis";
import { CodeResource } from "./importers/CodeResource";
import { importLuaCode } from "./importers/LuaCodeImporter";
import { importTypeScriptCode, TypeScriptCodeResource } from "./importers/TypeScriptCodeImporter";
import { writeTypeScriptLuaDeclarations } from "./importers/TypeScriptLuaDeclarations";
import { importBinaryResource } from "./importers/binaryResourceImporter";
import { importTextResource } from "./importers/textResourceImporter";
import { importTic80Cart } from "./importers/tic80CartImporter";
import { ImportDefinition, kImportKind } from "./manifestTypes";
import { canonicalizeAssetImport, TicbuildProjectCore } from "./projectCore";

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

  const declarationAnalysis = new CodeDeclarationAnalysis(project, resourceManager, resolveImportSource);
  prepareGeneratedLua = async resource => {
    if (resource instanceof TypeScriptCodeResource) await declarationAnalysis.generate(resource);
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

  const hasTypeScriptDefinitions = project.manifest.imports.some(importDef => importDef.kind === kImportKind.key.TypeScriptCode);
  if (hasTypeScriptDefinitions) {
    await profileAsync(parentScope, "Analyze code declarations", { category: "TypeScript declarations" },
      scope => declarationAnalysis.prepare(assemblyRootNames, scope));
  }

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

  if (hasTypeScriptDefinitions) {
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
