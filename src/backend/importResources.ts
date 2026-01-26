// importing -> ImportedResource -> assembly

import { assert } from "../utils/errorHandling";
import { ImportedResourceBase, ResourceManager } from "./ImportedResourceTypes";
import { importLuaCode } from "./importers/LuaCodeImporter";
import { importBinaryResource } from "./importers/binaryResourceImporter";
import { importTextResource } from "./importers/textResourceImporter";
import { importTic80Cart } from "./importers/tic80CartImporter";
import { kImportKind } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";

//
export async function loadAllImports(project: TicbuildProjectCore): Promise<ResourceManager> {
  //  scan imports, select appropriate importer for each import,
  //  invoke importer to get ImportedResourceBase
  //  store in map of identifier -> ImportedResourceBase
  const tasks = [];
  for (const importDef of project.manifest.imports) {
    if (!importDef.kind) {
      throw new Error(`Import ${importDef.name} is missing kind`);
    }
    assert(importDef.kind in kImportKind.key);
    const key = importDef.name;
    switch (importDef.kind) {
      case kImportKind.key.Tic80Cartridge:
        // invoke tic80 cart importer
        const tic80ImportTask = importTic80Cart(project, importDef);
        tasks.push(tic80ImportTask);
        break;
      case kImportKind.key.LuaCode:
        // invoke lua code importer
        const luaCodeImportTask = importLuaCode(project, importDef);
        tasks.push(luaCodeImportTask);
        break;
      case kImportKind.key.binary: {
        const binaryImportTask = importBinaryResource(project, importDef);
        tasks.push(binaryImportTask);
        break;
      }
      case kImportKind.key.text: {
        const textImportTask = importTextResource(project, importDef);
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

  return new ResourceManager(items);
}
