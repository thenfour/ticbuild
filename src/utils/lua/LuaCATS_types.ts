/** The supported LuaCATS type grammar. Names stay symbolic until declaration resolution. */
export type LuaCatsType =
  | { kind: "name"; name: string; arguments: LuaCatsType[] }
  | { kind: "literal"; text: string }
  | { kind: "union"; members: LuaCatsType[] }
  | { kind: "array"; element: LuaCatsType }
  | { kind: "optional"; type: LuaCatsType }
  | { kind: "object"; fields: LuaCatsTypeField[] }
  | { kind: "function"; parameters: LuaCatsTypeField[]; returns?: LuaCatsType };

export type LuaCatsTypeField = { name: string; optional: boolean; type: LuaCatsType };

// Single annotation identifiers: T, Vec2, _value, $result. This is the supported
// annotation spelling, which also permits $ for references into TypeScript.
export const luaCatsIdentifierPattern = /^[A-Za-z_$][\w$]*$/;

// A prefix token: "...", "Vec2", or "Module.SubModule.Name". The absence of an
// end anchor lets the parser consume "<T>", "[]", or a following description.
const typeNamePattern = /^(?:\.\.\.|[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)/;

// Literal types: "left|right", 'can\'t', -2.5, true, false. Escaped quotes remain
// inside the string; | inside a quoted literal must not start a union.
const typeLiteralPattern = /^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|-?\d+(?:\.\d+)?\b|true\b|false\b)/;

/**
 * Parse a type prefix and return the cursor where its description can begin.
 * "table<string, Vec2[]> Input values." produces a named table type with two
 * arguments; text.slice(end).trim() is "Input values.".
 * Invalid/incomplete expressions such as "Vec2 |" return undefined.
 */
export function parseLuaCatsType(text: string): { type: LuaCatsType; end: number } | undefined {
  const parser = new LuaCatsTypeParser(text);
  try {
    const type = parser.parseUnion();
    return { type, end: parser.offset };
  } catch {
    return undefined;
  }
}

/** Parse a standalone expression: "Vec2 | nil" is valid; "Vec2 description" is not. */
export function parseCompleteLuaCatsType(text: string): LuaCatsType | undefined {
  const parsed = parseLuaCatsType(text);
  return parsed && !text.slice(parsed.end).trim() ? parsed.type : undefined;
}

/** Recursive descent: union -> postfix -> primary, from weakest to strongest binding. */
class LuaCatsTypeParser {
  offset = 0;

  constructor(private readonly text: string) { }

  // "Vec2 | nil" -> union(name("Vec2"), name("nil")).
  parseUnion(): LuaCatsType {
    const members = [this.parsePostfix()];
    while (this.consume("|")) members.push(this.parsePostfix());
    return members.length === 1 ? members[0] : { kind: "union", members };
  }

  // "Vec2[]?" -> optional(array(name("Vec2"))). Suffixes apply left to right.
  private parsePostfix(): LuaCatsType {
    let type = this.parsePrimary();
    for (;;) {
      if (this.consume("[]")) type = { kind: "array", element: type };
      else if (this.consume("?")) type = { kind: "optional", type };
      else return type;
    }
  }

  private parsePrimary(): LuaCatsType {
    if (this.consume("(")) {
      const type = this.parseUnion();
      this.expect(")");
      return type;
    }
    if (this.consume("{")) return { kind: "object", fields: this.parseFields("}") };
    const literal = this.consumePattern(typeLiteralPattern);
    if (literal !== undefined) return { kind: "literal", text: literal };
    const name = this.parseName();
    if (name === "fun" && this.consume("(")) return this.parseFunction();
    return { kind: "name", name, arguments: this.parseTypeArguments() };
  }

  // "fun(value: Vec2, enabled?: boolean): Vec2 | nil", after consuming "fun(".
  private parseFunction(): LuaCatsType {
    const parameters = this.parseFields(")");
    const returns = this.consume(":") ? this.parseUnion() : undefined;
    return { kind: "function", parameters, returns };
  }

  // "<string, Vec2[]>" -> [name("string"), array(name("Vec2"))].
  private parseTypeArguments(): LuaCatsType[] {
    if (!this.consume("<")) return [];
    const argumentsList: LuaCatsType[] = [];
    do {
      argumentsList.push(this.parseUnion());
    } while (this.consume(","));
    this.expect(">");
    return argumentsList;
  }

  // Both "{value: Vec2, next?: Vec2}" and "fun(value: Vec2, next?: Vec2)"
  // contain comma-separated named fields. The opening delimiter is already consumed.
  private parseFields(close: string): LuaCatsTypeField[] {
    const fields: LuaCatsTypeField[] = [];
    if (this.consume(close)) return fields;
    do {
      const name = this.parseName();
      const optional = this.consume("?");
      this.expect(":");
      fields.push({ name, optional, type: this.parseUnion() });
      if (this.consume(close)) return fields;
    } while (this.consume(","));
    throw new Error(`Expected ${close}`);
  }

  private parseName(): string {
    const name = this.consumePattern(typeNamePattern);
    if (name === undefined) throw new Error("Expected name");
    return name;
  }

  private skipWhitespace(): void {
    while (this.offset < this.text.length && /\s/.test(this.text[this.offset])) this.offset++;
  }

  private consume(token: string): boolean {
    this.skipWhitespace();
    if (!this.text.startsWith(token, this.offset)) return false;
    this.offset += token.length;
    return true;
  }

  private consumePattern(pattern: RegExp): string | undefined {
    this.skipWhitespace();
    const match = pattern.exec(this.text.slice(this.offset));
    if (!match) return undefined;
    this.offset += match[0].length;
    return match[0];
  }

  private expect(token: string): void {
    if (!this.consume(token)) throw new Error(`Expected ${token}`);
  }
}

const builtinTypeScriptTypes: Readonly<Record<string, string>> = {
  string: "string",
  number: "number",
  integer: "number",
  float: "number",
  boolean: "boolean",
  bool: "boolean",
  nil: "undefined",
  any: "any",
  unknown: "any",
  userdata: "any",
  lightuserdata: "any",
  thread: "any",
  table: "Record<any, any>",
  function: "(...args: any[]) => any",
};

type TypeNameResolver = (name: string) => string;

/**
 * Render a parsed LuaCATS type as TypeScript, resolving every nested named type.
 * With Vec2 -> Types.Vec2, "(Vec2 | nil)[]" becomes "((Types.Vec2) | (undefined))[]".
 * Parentheses preserve grouping when an array contains a union or callback.
 */
export function renderLuaCatsTypeAsTypeScript(type: LuaCatsType, resolve: TypeNameResolver): string {
  const render = (value: LuaCatsType) => renderLuaCatsTypeAsTypeScript(value, resolve);
  switch (type.kind) {
    case "literal": return type.text;
    case "union": return type.members.map(member => `(${render(member)})`).join(" | ");
    case "optional": return `(${render(type.type)}) | undefined`;
    case "array": return `(${render(type.element)})[]`;
    case "object": return `{ ${type.fields.map(field => renderTypeScriptField(field, resolve)).join("; ")} }`;
    case "function": return renderTypeScriptFunction(type, resolve);
    case "name": return renderTypeScriptNamedType(type, resolve);
  }
}

// {name: "next", optional: true, type: Vec2} -> "next?: Types.Vec2".
function renderTypeScriptField(field: LuaCatsTypeField, resolve: TypeNameResolver): string {
  return `${field.name}${field.optional ? "?" : ""}: ${renderLuaCatsTypeAsTypeScript(field.type, resolve)}`;
}

// "fun(...: Vec2): boolean" -> "(...args: (Types.Vec2)[]) => boolean".
function renderTypeScriptFunction(type: Extract<LuaCatsType, { kind: "function" }>, resolve: TypeNameResolver): string {
  const parameters = type.parameters.map(parameter => parameter.name === "..."
    ? `...args: (${renderLuaCatsTypeAsTypeScript(parameter.type, resolve)})[]`
    : renderTypeScriptField(parameter, resolve));
  const returns = type.returns ? renderLuaCatsTypeAsTypeScript(type.returns, resolve) : "void";
  return `(${parameters.join(", ")}) => ${returns}`;
}

function renderTypeScriptNamedType(type: Extract<LuaCatsType, { kind: "name" }>, resolve: TypeNameResolver): string {
  const render = (value: LuaCatsType) => renderLuaCatsTypeAsTypeScript(value, resolve);
  // "table<string, Vec2>" -> "Record<string, Types.Vec2>".
  if (type.name === "table" && type.arguments.length === 2) {
    return `Record<${render(type.arguments[0])}, ${render(type.arguments[1])}>`;
  }
  const builtinName = type.name.toLowerCase();
  const isBuiltin = Object.prototype.hasOwnProperty.call(builtinTypeScriptTypes, builtinName);
  if (isBuiltin && type.arguments.length) return "any";
  const target = isBuiltin ? builtinTypeScriptTypes[builtinName] : resolve(type.name);
  // A failed resolution must remain "any", never the invalid TypeScript "any<T>".
  if (!type.arguments.length || target === "any") return target;
  return `${target}<${type.arguments.map(render).join(", ")}>`;
}
