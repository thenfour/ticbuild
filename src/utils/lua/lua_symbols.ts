import * as luaparse from "luaparse";
import { isIdentifier, LUA_RESERVED_WORDS, walkAST } from "./lua_ast";

const LUA_GENERATED_SYMBOL_ALPHABET = "abcdefghijklmnopqrstuvwxyz";

export function generateLuaSymbolName(index: number, prefix = ""): string {
  if (!Number.isSafeInteger(index) || index < 0) {
    throw new RangeError(`Lua symbol index must be a non-negative safe integer; received ${index}`);
  }

  let suffix = "";
  let remaining = index;
  do {
    suffix = LUA_GENERATED_SYMBOL_ALPHABET[remaining % LUA_GENERATED_SYMBOL_ALPHABET.length] + suffix;
    remaining = Math.floor(remaining / LUA_GENERATED_SYMBOL_ALPHABET.length) - 1;
  } while (remaining >= 0);
  return prefix + suffix;
}

export type LuaSymbolAllocatorOptions = {
  prefix?: string;
  reservedNames?: Set<string>;
};

export class LuaSymbolAllocator {
  private nextIndex = 0;
  private readonly prefix: string;
  private readonly reservedNames: Set<string>;

  constructor(options: LuaSymbolAllocatorOptions = {}) {
    this.prefix = options.prefix ?? "";
    this.reservedNames = options.reservedNames ?? new Set<string>();
  }

  peek(): string {
    return this.findNextAvailable().name;
  }

  allocate(): string {
    const next = this.findNextAvailable();
    this.nextIndex = next.nextIndex;
    this.reservedNames.add(next.name);
    return next.name;
  }

  fork(): LuaSymbolAllocator {
    return new LuaSymbolAllocator({
      prefix: this.prefix,
      reservedNames: new Set(this.reservedNames),
    });
  }

  private findNextAvailable(): { name: string; nextIndex: number } {
    let index = this.nextIndex;
    while (true) {
      const name = generateLuaSymbolName(index++, this.prefix);
      if (!LUA_RESERVED_WORDS.has(name) && !this.reservedNames.has(name)) {
        return { name, nextIndex: index };
      }
    }
  }
}

export function collectLuaIdentifierNames(ast: luaparse.Chunk): Set<string> {
  const names = new Set<string>();
  walkAST(ast, (node) => {
    if (isIdentifier(node)) {
      names.add(node.name);
    }
  });
  return names;
}

class LuaBindingNameScope {
  private readonly localNames = new Set<string>();

  constructor(private readonly parent: LuaBindingNameScope | null = null) {}

  createChild(): LuaBindingNameScope {
    return new LuaBindingNameScope(this);
  }

  define(name: string): void {
    this.localNames.add(name);
  }

  isBound(name: string): boolean {
    return this.localNames.has(name) || (this.parent?.isBound(name) ?? false);
  }
}

// Local renaming must not choose a spelling which captures an identifier that
// remains unchanged. Collect globals with Lua's declaration timing and lexical
// scopes; method `self` is also unchanged because it is an implicit parameter.
export function collectNamesUnavailableToLocalRenaming(ast: luaparse.Chunk): Set<string> {
  const names = new Set<string>();

  function visitIdentifier(node: luaparse.Identifier, scope: LuaBindingNameScope): void {
    if (!scope.isBound(node.name)) {
      names.add(node.name);
    }
  }

  function visitAssignmentTarget(expr: luaparse.Expression, scope: LuaBindingNameScope): void {
    if (expr.type === "Identifier") {
      visitIdentifier(expr, scope);
    } else if (expr.type === "MemberExpression") {
      visitExpression(expr.base, scope);
    } else if (expr.type === "IndexExpression") {
      visitExpression(expr.base, scope);
      visitExpression(expr.index, scope);
    } else {
      visitExpression(expr, scope);
    }
  }

  function visitExpression(expr: luaparse.Expression, scope: LuaBindingNameScope): void {
    switch (expr.type) {
      case "Identifier":
        visitIdentifier(expr, scope);
        return;

      case "UnaryExpression":
        visitExpression(expr.argument, scope);
        return;

      case "BinaryExpression":
      case "LogicalExpression":
        visitExpression(expr.left, scope);
        visitExpression(expr.right, scope);
        return;

      case "CallExpression":
        visitExpression(expr.base, scope);
        expr.arguments.forEach(argument => visitExpression(argument, scope));
        return;

      case "TableCallExpression":
        visitExpression(expr.base, scope);
        visitExpression(expr.arguments, scope);
        return;

      case "StringCallExpression":
        visitExpression(expr.base, scope);
        visitExpression(expr.argument as luaparse.Expression, scope);
        return;

      case "MemberExpression":
        visitExpression(expr.base, scope);
        return;

      case "IndexExpression":
        visitExpression(expr.base, scope);
        visitExpression(expr.index, scope);
        return;

      case "TableConstructorExpression":
        expr.fields.forEach(field => {
          if (field.type === "TableKey") {
            visitExpression(field.key, scope);
          }
          visitExpression(field.value, scope);
        });
        return;

      case "FunctionDeclaration": {
        const functionScope = scope.createChild();
        expr.parameters.forEach(parameter => {
          if (isIdentifier(parameter)) {
            functionScope.define(parameter.name);
          }
        });
        visitBlock(expr.body, functionScope);
        return;
      }

      default:
        return;
    }
  }

  function visitStatement(stmt: luaparse.Statement, scope: LuaBindingNameScope): void {
    switch (stmt.type) {
      case "LocalStatement":
        stmt.init?.forEach(expr => visitExpression(expr, scope));
        stmt.variables.forEach(variable => {
          if (isIdentifier(variable)) {
            scope.define(variable.name);
          }
        });
        return;

      case "AssignmentStatement":
        stmt.variables.forEach(variable => visitAssignmentTarget(variable as luaparse.Expression, scope));
        stmt.init.forEach(expr => visitExpression(expr, scope));
        return;

      case "FunctionDeclaration": {
        if (stmt.isLocal && isIdentifier(stmt.identifier)) {
          scope.define(stmt.identifier.name);
        } else if (stmt.identifier) {
          visitAssignmentTarget(stmt.identifier as luaparse.Expression, scope);
        }

        const functionScope = scope.createChild();
        stmt.parameters.forEach(parameter => {
          if (isIdentifier(parameter)) {
            functionScope.define(parameter.name);
          }
        });
        if (stmt.identifier?.type === "MemberExpression" && stmt.identifier.indexer === ":") {
          names.add("self");
        }
        visitBlock(stmt.body, functionScope);
        return;
      }

      case "CallStatement":
        visitExpression(stmt.expression, scope);
        return;

      case "ReturnStatement":
        stmt.arguments.forEach(argument => visitExpression(argument, scope));
        return;

      case "IfStatement":
        stmt.clauses.forEach(clause => {
          if (clause.type !== "ElseClause" && clause.condition) {
            visitExpression(clause.condition, scope);
          }
          visitBlock(clause.body, scope.createChild());
        });
        return;

      case "WhileStatement":
        visitExpression(stmt.condition, scope);
        visitBlock(stmt.body, scope.createChild());
        return;

      case "RepeatStatement": {
        const repeatScope = scope.createChild();
        visitBlock(stmt.body, repeatScope);
        visitExpression(stmt.condition, repeatScope);
        return;
      }

      case "ForNumericStatement": {
        visitExpression(stmt.start, scope);
        visitExpression(stmt.end, scope);
        if (stmt.step) {
          visitExpression(stmt.step, scope);
        }
        const forScope = scope.createChild();
        forScope.define(stmt.variable.name);
        visitBlock(stmt.body, forScope);
        return;
      }

      case "ForGenericStatement": {
        stmt.iterators.forEach(iterator => visitExpression(iterator, scope));
        const forScope = scope.createChild();
        stmt.variables.forEach(variable => forScope.define(variable.name));
        visitBlock(stmt.body, forScope);
        return;
      }

      case "DoStatement":
        visitBlock(stmt.body, scope.createChild());
        return;

      default:
        return;
    }
  }

  function visitBlock(body: luaparse.Statement[], scope: LuaBindingNameScope): void {
    body.forEach(stmt => visitStatement(stmt, scope));
  }

  visitBlock(ast.body, new LuaBindingNameScope());
  return names;
}
