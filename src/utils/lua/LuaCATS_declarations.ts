import { parseLuaCatsAnnotation, stripDocPrefix } from "./LuaCATS";
import { LuaCatsType, LuaCatsTypeField, parseLuaCatsType } from "./LuaCATS_types";

export type LuaCatsNamedType = {
  name: string;
  kind: "class" | "alias";
  fields: LuaCatsTypeField[];
  parents: LuaCatsType[];
  parameters: string[];
  type?: LuaCatsType;
};

export type LuaCatsNamedTypeLocation = { declaration: LuaCatsNamedType; offset: number };

// "(exact) Vec2<T>: Base<T>" -> ["Vec2", "<T>: Base<T>"].
// Header names retain the collector's permissive word/dot spelling.
const namedTypeHeaderPattern = /^(?:\(exact\)\s+)?([\w.]+)\s*(.*)$/;
// "<T, U>: Base<T>" -> ["T, U"], leaving ": Base<T>" to the parent parser.
const genericHeaderPattern = /^<([\w$]+(?:\s*,\s*[\w$]+)*)>\s*/;
// "private next? Vec2 Description" -> ["next", "?", "Vec2 Description"].
const classFieldPattern = /^(?:(?:public|protected|private|package)\s+)?([\w$]+)(\?)?\s+(.+)$/;

/**
 * Collect class/alias blocks and their offsets in the supplied source.
 * "---@class Box<T>\n---@field value T" produces one class with a value field.
 * "---@alias Direction\n---| 'left'\n---| 'right'" produces a union alias.
 * A non-comment line ends the block. Offsets point to the header line so callers
 * can map declarations back through preprocessing without coupling grammar to maps.
 */
export function collectLuaCatsNamedTypes(source: string): LuaCatsNamedTypeLocation[] {
  const declarations: LuaCatsNamedTypeLocation[] = [];
  let current: LuaCatsNamedType | undefined;
  let offset = 0;
  // Retain each newline in its preceding line so source offsets include CRLF too.
  for (const line of source.split(/(?<=\n)/)) {
    const lineOffset = offset;
    offset += line.length;
    if (!line.trimStart().startsWith("--")) {
      current = undefined;
      continue;
    }
    const text = stripDocPrefix(line);
    if (!text) continue;
    const declaration = parseNamedTypeDeclaration(text);
    if (declaration) {
      current = declaration;
      declarations.push({ declaration, offset: lineOffset });
    } else if (current) {
      appendNamedTypeAnnotation(current, text);
    }
  }
  return declarations;
}

function parseNamedTypeDeclaration(text: string): LuaCatsNamedType | undefined {
  const annotation = parseLuaCatsAnnotation(text);
  if (!annotation || (annotation.tag !== "class" && annotation.tag !== "alias")) return undefined;
  const header = namedTypeHeaderPattern.exec(annotation.content);
  if (!header) return undefined;
  const [, name, remainder] = header;
  const genericHeader = genericHeaderPattern.exec(remainder);
  const parameters = genericHeader ? genericHeader[1].split(",").map(name => name.trim()) : [];
  const body = genericHeader ? remainder.slice(genericHeader[0].length) : remainder;
  const declaration: LuaCatsNamedType = { name, kind: annotation.tag, parameters, fields: [], parents: [] };
  if (declaration.kind === "alias") declaration.type = parseLuaCatsType(body)?.type;
  else if (body.startsWith(":")) declaration.parents = parseParentTypes(body.slice(1).trim());
  return declaration;
}

// "Base<T>, Positioned Description" -> [Base<T>, Positioned]. Commas within
// nested type arguments belong to the type parser, not to the parent list.
function parseParentTypes(text: string): LuaCatsType[] {
  const parents: LuaCatsType[] = [];
  let remainder = text;
  while (remainder) {
    const parsed = parseLuaCatsType(remainder);
    if (!parsed) break;
    parents.push(parsed.type);
    remainder = remainder.slice(parsed.end).trim();
    if (!remainder.startsWith(",")) break;
    remainder = remainder.slice(1).trim();
  }
  return parents;
}

function appendNamedTypeAnnotation(declaration: LuaCatsNamedType, text: string): void {
  if (declaration.kind === "class") {
    const field = parseClassField(text);
    if (field) declaration.fields.push(field);
  } else if (text.startsWith("|")) {
    const member = parseLuaCatsType(text.slice(1).trim())?.type;
    if (member) {
      declaration.type = declaration.type
        ? { kind: "union", members: [declaration.type, member] }
        : member;
    }
  }
}

function parseClassField(text: string): LuaCatsTypeField | undefined {
  const annotation = parseLuaCatsAnnotation(text);
  if (annotation?.tag !== "field") return undefined;
  const field = classFieldPattern.exec(annotation.content);
  if (!field) return undefined;
  const [, name, optional, typeText] = field;
  const type = parseLuaCatsType(typeText)?.type;
  return type ? { name, optional: !!optional, type } : undefined;
}
