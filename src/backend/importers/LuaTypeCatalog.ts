import * as ts from "typescript";
import { isDeepStrictEqual } from "node:util";
import * as cons from "../../utils/console";
import { LuaCatsNamedType } from "../../utils/lua/LuaCATS_declarations";
import { LuaCatsType, parseCompleteLuaCatsType, renderLuaCatsTypeAsTypeScript } from "../../utils/lua/LuaCATS_types";
import { findAvailableTypeScriptBinding, isTypeScriptIdentifier, renderTypeScriptImportType, renderTypeScriptTypeParameters } from "./TypeScriptDeclarationSyntax";
import { TypeScriptNamedTypes } from "./TypeScriptNamedTypes";

export type LuaNamedType = LuaCatsNamedType & { source: string };

type TypeIdentity = { kind: "lua"; name: string } | { kind: "typescript"; file: string; position: number };
type TypeReference = { identity: TypeIdentity; reference: string; source: string; ensureAvailable?: () => void };
type RegisteredLuaType = { type: LuaNamedType; module: string; binding: string };

const reservedTypeBindings = new Set(["default", "function", "class", "type", "interface"]);

/** Source identities and type references are shared by both declaration directions. */
export class LuaTypeCatalog {
  private readonly names = new Map<string, TypeReference[]>();
  private readonly luaTypes = new Map<string, RegisteredLuaType>();
  private readonly luaTypeModules = new Map<string, Set<string>>();
  private readonly warnings = new Set<string>();
  private readonly typeScriptTypes: TypeScriptNamedTypes;

  constructor(projectDir: string) {
    this.typeScriptTypes = new TypeScriptNamedTypes(projectDir);
  }

  addLuaTypes(module: string, types: readonly LuaNamedType[], globalNames: readonly string[]): void {
    const usedBindings = new Set(globalNames);
    for (const type of types) {
      this.recordLuaTypeModule(type.name, module);
      const previous = this.luaTypes.get(type.name);
      if (previous) {
        assertMatchingLuaDefinitions(previous.type, type);
        continue;
      }
      const binding = this.chooseLuaTypeBinding(type.name, usedBindings);
      usedBindings.add(binding);
      this.luaTypes.set(type.name, { type, module, binding });
      this.addReference(type.name, {
        identity: { kind: "lua", name: type.name },
        reference: renderTypeScriptImportType(module, binding),
        source: type.source,
      });
    }
  }

  addTypeScriptProgram(program: ts.Program, moduleNames: ReadonlyMap<string, string>): void {
    for (const type of this.typeScriptTypes.collect(program, moduleNames)) {
      for (const name of type.names) this.addReference(name, type);
    }
  }

  resolve(name: string, source: string): string {
    const candidates = this.names.get(name) ?? [];
    if (candidates.length > 1) {
      const locations = candidates.map(candidate => candidate.source).join(", ");
      throw new Error(`Ambiguous LuaCATS type '${name}' at ${source}: ${locations}`);
    }
    if (candidates.length === 1) {
      const candidate = candidates[0];
      candidate.ensureAvailable?.();
      return candidate.reference;
    }
    this.warnOnce(`Unresolved LuaCATS type '${name}' at ${source}; using any`);
    return "any";
  }

  getAdditionalTypeScriptSources(): ReadonlyMap<string, string> {
    return this.typeScriptTypes.getAdditionalSources();
  }

  render(text: string | undefined, source: string, parameters: readonly string[] = []): string {
    if (!text) return "any";
    const type = parseCompleteLuaCatsType(text);
    if (!type) {
      this.warnOnce(`Unsupported LuaCATS type '${text}' at ${source}; using any`);
      return "any";
    }
    return this.renderType(type, source, parameters);
  }

  renderModuleTypes(module: string): string[] {
    const declarations: string[] = [];
    for (const registered of this.luaTypes.values()) {
      if (!this.luaTypeModules.get(registered.type.name)?.has(module)) continue;
      const { type } = registered;
      const render = (value: LuaCatsType) => this.renderType(value, type.source, type.parameters);
      declarations.push(...renderLuaTypeDeclaration(registered, module, render));
    }
    return declarations;
  }

  private addReference(name: string, candidate: TypeReference): void {
    let candidates = this.names.get(name);
    if (!candidates) {
      candidates = [];
      this.names.set(name, candidates);
    }
    if (!candidates.some(existing => sameTypeIdentity(existing.identity, candidate.identity))) {
      candidates.push(candidate);
    }
  }

  private recordLuaTypeModule(name: string, module: string): void {
    let modules = this.luaTypeModules.get(name);
    if (!modules) {
      modules = new Set();
      this.luaTypeModules.set(name, modules);
    }
    modules.add(module);
  }

  private chooseLuaTypeBinding(name: string, used: ReadonlySet<string>): string {
    if (isTypeScriptIdentifier(name) && !reservedTypeBindings.has(name)) return name;
    return findAvailableTypeScriptBinding(`__ticbuild_type_${this.luaTypes.size + 1}`, used);
  }

  private renderType(type: LuaCatsType, source: string, parameters: readonly string[]): string {
    return renderLuaCatsTypeAsTypeScript(type, name => parameters.includes(name) ? name : this.resolve(name, source));
  }

  private warnOnce(message: string): void {
    if (this.warnings.has(message)) return;
    this.warnings.add(message);
    cons.warning(message);
  }
}

function sameTypeIdentity(left: TypeIdentity, right: TypeIdentity): boolean {
  if (left.kind === "lua") return right.kind === "lua" && left.name === right.name;
  return right.kind === "typescript" && left.file === right.file && left.position === right.position;
}

// Including the same definition in multiple assets is legal; only its structure,
// not its authored source location, determines whether the definitions conflict.
function assertMatchingLuaDefinitions(previous: LuaNamedType, current: LuaNamedType): void {
  const { source: previousSource, ...previousDefinition } = previous;
  const { source: currentSource, ...currentDefinition } = current;
  if (!isDeepStrictEqual(previousDefinition, currentDefinition)) {
    throw new Error(`Conflicting Lua type '${current.name}' at ${previousSource} and ${currentSource}`);
  }
}

/**
 * A class Box<T> with parent Base<T> and field value:T becomes:
 *   export type Box<T> = Base<T> & {
 *     value: T;
 *   };
 * Assets that include the same class re-export its owner's type instead.
 */
function renderLuaTypeDeclaration(
  registered: RegisteredLuaType,
  targetModule: string,
  render: (type: LuaCatsType) => string,
): string[] {
  const { type, binding, module: owner } = registered;
  const name = `${binding}${renderTypeScriptTypeParameters(type.parameters)}`;
  if (owner !== targetModule) {
    return [`export type ${name} = ${renderTypeScriptImportType(owner, name)};`];
  }
  if (type.kind === "alias") {
    return [`export type ${name} = ${type.type ? render(type.type) : "any"};`];
  }
  // Intersections allow qualified import types as bases and preserve recursive references.
  const parents = type.parents.map(render);
  const inheritance = parents.length ? `${parents.join(" & ")} & ` : "";
  const fields = type.fields.map(field => `  ${field.name}${field.optional ? "?" : ""}: ${render(field.type)};`);
  return [`export type ${name} = ${inheritance}{`, ...fields, "};"];
}
