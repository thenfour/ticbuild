import { kImportKind } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";

export const MANIFEST_CODE_MODULE_PREFIX = "ticbuild-assets/";

export type ManifestCodeModuleDefinition = {
  importName: string;
  moduleSpecifier: string;
  kind: "LuaCode" | "TypeScriptCode";
};

// "ticbuild-assets/my-import" -> "my-import"
export function parseManifestCodeModuleSpecifier(specifier: string): string | undefined {
  if (!specifier.startsWith(MANIFEST_CODE_MODULE_PREFIX)) {
    return undefined;
  }
  const importName = specifier.slice(MANIFEST_CODE_MODULE_PREFIX.length);
  // Accept only a manifest import name, not paths or package-like lookalikes.
  return importName.length > 0 && !/[/:]/.test(importName) ? importName : undefined;
}

export function createManifestCodeModuleCatalog(
  project: TicbuildProjectCore,
): ReadonlyMap<string, ManifestCodeModuleDefinition> {
  const result = new Map<string, ManifestCodeModuleDefinition>();
  for (const importDef of project.manifest.imports) {
    if (importDef.kind !== kImportKind.key.LuaCode && importDef.kind !== kImportKind.key.TypeScriptCode) {
      continue;
    }
    result.set(importDef.name, {
      importName: importDef.name,
      moduleSpecifier: `${MANIFEST_CODE_MODULE_PREFIX}${importDef.name}`,
      kind: importDef.kind,
    });
  }
  return result;
}
