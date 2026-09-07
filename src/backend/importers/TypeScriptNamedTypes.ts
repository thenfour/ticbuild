import * as path from "node:path";
import * as ts from "typescript";
import { findAvailableTypeScriptBinding, renderTypeScriptImportType, renderTypeScriptTypeParameters } from "./TypeScriptDeclarationSyntax";
import { makeLuaCatsTypeName } from "./TypeScriptLuaDeclarations";
import { getCanonicalTSPathKey } from "./TypeScriptStaticLinker";

type NamedTypeDeclaration = ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.ClassDeclaration | ts.EnumDeclaration;
type NamedDeclarationWithName = NamedTypeDeclaration & { name: ts.Identifier };

export type TypeScriptNamedType = {
  names: string[];
  identity: { kind: "typescript"; file: string; position: number };
  reference: string;
  source: string;
  ensureAvailable?: () => void;
};

type SourceTypeAliases = { source: ts.SourceFile; aliases: Map<string, string> };

/** Discover TS type references and retain any virtual exports needed to use them. */
export class TypeScriptNamedTypes {
  private readonly additionalSources = new Map<string, SourceTypeAliases>();

  constructor(private readonly projectDir: string) { }

  collect(program: ts.Program, moduleNames: ReadonlyMap<string, string>): TypeScriptNamedType[] {
    const collector = new TypeScriptNamedTypeCollector(
      this.projectDir, program, moduleNames,
      (source, declaration, alias) => this.addTypeAlias(source, declaration, alias),
    );
    return collector.collect();
  }

  getAdditionalSources(): ReadonlyMap<string, string> {
    const sources = new Map<string, string>();
    for (const { source, aliases } of this.additionalSources.values()) {
      sources.set(source.fileName, `${source.text}\n${Array.from(aliases.values()).join("\n")}\n`);
    }
    return sources;
  }

  private addTypeAlias(source: ts.SourceFile, declaration: NamedDeclarationWithName, alias: string): void {
    const key = getCanonicalTSPathKey(source.fileName);
    let additions = this.additionalSources.get(key);
    if (!additions) {
      additions = { source, aliases: new Map() };
      this.additionalSources.set(key, additions);
    }
    additions.aliases.set(alias, renderPrivateTypeAlias(source, declaration, alias));
  }
}

/** Walk one compiler program; all symbol inspection stays within its checker. */
class TypeScriptNamedTypeCollector {
  private readonly checker: ts.TypeChecker;
  private readonly types: TypeScriptNamedType[] = [];
  private readonly exportStack = new Set<ts.Symbol>();

  constructor(
    private readonly projectDir: string,
    private readonly program: ts.Program,
    private readonly moduleNames: ReadonlyMap<string, string>,
    private readonly exportPrivateType: (source: ts.SourceFile, declaration: NamedDeclarationWithName, alias: string) => void,
  ) {
    this.checker = program.getTypeChecker();
  }

  collect(): TypeScriptNamedType[] {
    for (const source of this.program.getSourceFiles()) {
      this.collectModuleTypes(source);
      if (!this.program.isSourceFileDefaultLibrary(source)) {
        ts.forEachChild(source, node => this.collectAmbientTypes(node, "", !ts.isExternalModule(source)));
      }
    }
    return this.types;
  }

  private collectModuleTypes(source: ts.SourceFile): void {
    const moduleName = this.moduleNames.get(getCanonicalTSPathKey(source.fileName));
    const moduleSymbol = this.checker.getSymbolAtLocation(source);
    if (!moduleName || !moduleSymbol) return;
    this.collectExports(moduleSymbol, renderTypeScriptImportType(moduleName));
    if (!source.isDeclarationFile) this.collectPrivateTypes(source, moduleName);
  }

  // Exported namespaces extend both spellings: Math.Vec2 is reachable through
  // import("ticbuild-assets/math").Math.Vec2. Guard namespace/re-export cycles.
  private collectExports(symbol: ts.Symbol, referencePrefix: string, namePrefix = ""): void {
    if (this.exportStack.has(symbol)) return;
    this.exportStack.add(symbol);
    for (const exported of this.checker.getExportsOfModule(symbol)) {
      if (exported.name === "default" || exported.name === "export=") continue;
      const reference = `${referencePrefix}.${exported.name}`;
      const name = `${namePrefix}${exported.name}`;
      this.addSymbol(exported, reference, name);
      const target = this.resolveAlias(exported);
      if (target.flags & ts.SymbolFlags.Module) this.collectExports(target, reference, `${name}.`);
    }
    this.exportStack.delete(symbol);
  }

  private collectPrivateTypes(source: ts.SourceFile, moduleName: string): void {
    const bindings = new Set(this.checker.getSymbolsInScope(source, ts.SymbolFlags.Type | ts.SymbolFlags.Value).map(symbol => symbol.name));
    for (const declaration of source.statements) {
      if (!isNamedTypeDeclaration(declaration)) continue;
      const symbol = this.checker.getSymbolAtLocation(declaration.name);
      if (!symbol) continue;
      const alias = findAvailableTypeScriptBinding(`__ticbuild_type_${declaration.name.text}`, bindings);
      // Private types are exposed only by their qualified LuaCATS name. The
      // synthetic export is appended lazily if resolution actually chooses it.
      this.addSymbol(symbol, renderTypeScriptImportType(moduleName, alias), undefined,
        () => this.exportPrivateType(source, declaration, alias));
    }
  }

  // Global declarations use "Vec2" or "Math.Vec2" directly. Entering
  // "declare global" resets the namespace prefix, even inside an external module.
  private collectAmbientTypes(node: ts.Node, prefix: string, ambient: boolean): void {
    if (ts.isModuleDeclaration(node) && ts.isIdentifier(node.name)) {
      const global = !!(node.flags & ts.NodeFlags.GlobalAugmentation);
      if (!ambient && !global) return;
      const nextPrefix = global ? "" : `${prefix}${node.name.text}.`;
      if (node.body && ts.isModuleBlock(node.body)) {
        ts.forEachChild(node.body, child => this.collectAmbientTypes(child, nextPrefix, true));
      } else if (node.body) {
        this.collectAmbientTypes(node.body, nextPrefix, true);
      }
    } else if (ambient && isNamedTypeDeclaration(node)) {
      const symbol = this.checker.getSymbolAtLocation(node.name);
      const name = `${prefix}${node.name.text}`;
      if (symbol) this.addSymbol(symbol, name, name);
    }
  }

  private addSymbol(symbol: ts.Symbol, reference: string, exposedName?: string, ensureAvailable?: () => void): void {
    const target = this.resolveAlias(symbol);
    if (!(target.flags & ts.SymbolFlags.Type)) return;
    const declaration = target.declarations?.[0];
    if (!declaration) return;
    const source = declaration.getSourceFile();
    const names = exposedName ? [exposedName] : [];
    if (isProjectSource(this.projectDir, source)) {
      names.push(makeLuaCatsTypeName(this.projectDir, source, target.name));
    }
    this.types.push({
      names, reference, ensureAvailable, source: source.fileName,
      identity: { kind: "typescript", file: getCanonicalTSPathKey(source.fileName), position: declaration.pos },
    });
  }

  private resolveAlias(symbol: ts.Symbol): ts.Symbol {
    return symbol.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(symbol) : symbol;
  }
}

function isNamedTypeDeclaration(node: ts.Node): node is NamedDeclarationWithName {
  return (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) ||
    ts.isClassDeclaration(node) || ts.isEnumDeclaration(node)) && !!node.name;
}

function isProjectSource(projectDir: string, source: ts.SourceFile): boolean {
  const relative = path.relative(projectDir, source.fileName);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

/**
 * "class Box<T extends Point>" -> "export type __ticbuild_type_Box<T extends Point> = Box<T>;".
 * Keep constraints/defaults on the declaration, but only parameter names on its
 * right side. These aliases extend virtual source text; authored files stay intact.
 */
function renderPrivateTypeAlias(source: ts.SourceFile, declaration: NamedDeclarationWithName, alias: string): string {
  const parameters = ts.isEnumDeclaration(declaration) ? [] : declaration.typeParameters ?? [];
  const parameterText = renderTypeScriptTypeParameters(parameters.map(parameter => parameter.getText(source)));
  const argumentText = renderTypeScriptTypeParameters(parameters.map(parameter => parameter.name.text));
  return `export type ${alias}${parameterText} = ${declaration.name.text}${argumentText};`;
}
