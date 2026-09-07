import * as path from "node:path";
import * as ts from "typescript";
import { MANIFEST_CODE_MODULE_PREFIX } from "./ManifestCodeTypeScriptModules";
import { getTypeScriptPrivateModuleName } from "./TypeScriptManifestModules";
import { isGeneratedDeclarationFile, TypeScriptDeclarationContext } from "./TypeScriptProgram";
import { getCanonicalTSPathKey, isTypeScriptImplementationFile } from "./TypeScriptStaticLinker";

type DeclarationSource = {
  filePath: string;
  sourceText: string;
  moduleName?: string;
  owner?: string;
};

type SourceProgram = { importName: string; entryFilePath: string; program: ts.Program };

/** Relate each compiler source to its generated module name and owning resource. */
export class TypeScriptDeclarationSources {
  private readonly sources = new Map<string, DeclarationSource>();

  constructor(projectDir: string, programs: readonly SourceProgram[]) {
    // Manifest entries keep their public names even when another entry reaches
    // them first through a relative import.
    for (const { importName, entryFilePath } of programs) {
      this.sources.set(getCanonicalTSPathKey(entryFilePath), {
        filePath: entryFilePath, sourceText: "",
        moduleName: `${MANIFEST_CODE_MODULE_PREFIX}${importName}`, owner: importName,
      });
    }
    for (const entry of programs) this.collectProgramSources(projectDir, entry);
  }

  getModuleNames(): ReadonlyMap<string, string> {
    const names = new Map<string, string>();
    for (const [file, source] of this.sources) {
      if (source.moduleName) names.set(file, source.moduleName);
    }
    return names;
  }

  getOwnedFileKeys(importName: string): ReadonlySet<string> {
    const files = new Set<string>();
    for (const [file, source] of this.sources) {
      if (source.owner === importName) files.add(file);
    }
    return files;
  }

  getOwnedModuleSources(importName: string): TypeScriptDeclarationContext["sources"] {
    const modules = new Map<string, DeclarationSource>();
    for (const source of this.sources.values()) {
      if (source.owner === importName && source.moduleName) modules.set(source.moduleName, source);
    }
    return modules;
  }

  addTypeAliases(additionalSources: ReadonlyMap<string, string>): void {
    for (const [filePath, sourceText] of additionalSources) {
      const key = getCanonicalTSPathKey(filePath);
      this.sources.set(key, { ...this.sources.get(key), filePath, sourceText });
    }
  }

  private collectProgramSources(projectDir: string, entry: SourceProgram): void {
    for (const sourceFile of entry.program.getSourceFiles()) {
      const key = getCanonicalTSPathKey(sourceFile.fileName);
      const source: DeclarationSource = {
        ...this.sources.get(key), filePath: sourceFile.fileName, sourceText: sourceFile.text,
      };
      this.sources.set(key, source);
      if (source.moduleName || isGeneratedDeclarationFile(projectDir, source.filePath)) continue;
      if (isTypeScriptImplementationFile(source.filePath)) {
        source.moduleName = getTypeScriptPrivateModuleName(
          `${MANIFEST_CODE_MODULE_PREFIX}${entry.importName}`, projectDir, source.filePath,
        );
        source.owner = entry.importName;
      } else if (isAuthoredDeclarationModule(entry.program, sourceFile)) {
        source.moduleName = getAuthoredDeclarationModuleName(projectDir, source.filePath);
      }
    }
  }
}

function isAuthoredDeclarationModule(program: ts.Program, source: ts.SourceFile): boolean {
  return ts.isExternalModule(source) &&
    !program.isSourceFileDefaultLibrary(source) && !program.isSourceFileFromExternalLibrary(source);
}

// From .ticbuild/declarations, "src/types.d.ts" is referenced as "../../src/types".
// TypeScript import specifiers use forward slashes and omit the declaration suffix.
function getAuthoredDeclarationModuleName(projectDir: string, filePath: string): string {
  const relative = path.relative(path.join(projectDir, ".ticbuild", "declarations"), filePath)
    .replace(/\\/g, "/").replace(/\.d\.ts$/, "");
  return relative.startsWith(".") ? relative : `./${relative}`;
}
