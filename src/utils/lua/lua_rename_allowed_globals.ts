import * as luaparse from "luaparse";
import { LUA_RESERVED_WORDS } from "./lua_ast";
import { nextFreeName } from "./lua_utils";

const DEFAULT_GLOBAL_NAMES_TO_KEEP = new Set([
  "TIC",
  "BOOT",
  "SCN",
  "BDR",
  "MENU",
  "OVR",
  "_G",
  "_ENV",
]);

type RenameAllowedGlobalsOptions = {
  namesToRename?: string[] | null;
  namesToKeep?: string[] | null;
};

class GlobalRenameScope {
  private parent: GlobalRenameScope | null;
  private localNames = new Set<string>();

  constructor(parent: GlobalRenameScope | null = null) {
    this.parent = parent;
  }

  createChild(): GlobalRenameScope {
    return new GlobalRenameScope(this);
  }

  define(name: string | undefined | null): void {
    if (name) {
      this.localNames.add(name);
    }
  }

  isShadowed(name: string): boolean {
    if (this.localNames.has(name)) {
      return true;
    }
    return this.parent?.isShadowed(name) ?? false;
  }
}

function isIdentifier(node: unknown): node is luaparse.Identifier {
  return !!node && typeof node === "object" && (node as { type?: string }).type === "Identifier";
}

function isValidIdentifierName(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) && !LUA_RESERVED_WORDS.has(name);
}

function collectUsedIdentifierNames(node: unknown, out: Set<string>): void {
  if (!node || typeof node !== "object") {
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((child) => collectUsedIdentifierNames(child, out));
    return;
  }

  if (isIdentifier(node)) {
    out.add(node.name);
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === "type" || key === "range" || key === "loc" || key === "raw") {
      continue;
    }
    collectUsedIdentifierNames(value, out);
  }
}

function makeRenameMap(
  ast: luaparse.Chunk,
  namesToRename: string[],
  namesToKeep: Set<string>,
): Map<string, string> {
  const usedNames = new Set<string>();
  collectUsedIdentifierNames(ast, usedNames);
  namesToKeep.forEach((name) => usedNames.add(name));

  const uniqueAllowedNames = Array.from(new Set(namesToRename))
    .filter(isValidIdentifierName)
    .filter((name) => !namesToKeep.has(name));

  const mapping = new Map<string, string>();
  const counter = { value: 0 };
  for (const name of uniqueAllowedNames) {
    let nextName: string;
    do {
      nextName = nextFreeName(counter);
    } while (usedNames.has(nextName));
    mapping.set(name, nextName);
    usedNames.add(nextName);
  }
  return mapping;
}

function maybeRenameIdentifier(
  node: luaparse.Identifier,
  scope: GlobalRenameScope,
  mapping: Map<string, string>,
): void {
  if (scope.isShadowed(node.name)) {
    return;
  }
  const mapped = mapping.get(node.name);
  if (mapped) {
    node.name = mapped;
  }
}

function processStatement(
  stmt: luaparse.Statement,
  scope: GlobalRenameScope,
  mapping: Map<string, string>,
): void {
  switch (stmt.type) {
    case "LocalStatement": {
      stmt.init?.forEach((expr) => processExpression(expr, scope, mapping));
      stmt.variables.forEach((variable) => {
        if (isIdentifier(variable)) {
          scope.define(variable.name);
        }
      });
      return;
    }

    case "AssignmentStatement": {
      stmt.variables.forEach((variable) => processAssignmentTarget(variable as luaparse.Expression, scope, mapping));
      stmt.init.forEach((expr) => processExpression(expr, scope, mapping));
      return;
    }

    case "FunctionDeclaration": {
      if (stmt.isLocal && isIdentifier(stmt.identifier)) {
        scope.define(stmt.identifier.name);
      } else if (stmt.identifier) {
        processAssignmentTarget(stmt.identifier as luaparse.Expression, scope, mapping);
      }

      const functionScope = scope.createChild();
      stmt.parameters.forEach((param) => {
        if (isIdentifier(param)) {
          functionScope.define(param.name);
        }
      });
      processBlock(stmt.body, functionScope, mapping);
      return;
    }

    case "CallStatement":
      processExpression(stmt.expression, scope, mapping);
      return;

    case "ReturnStatement":
      stmt.arguments.forEach((arg) => processExpression(arg, scope, mapping));
      return;

    case "IfStatement":
      stmt.clauses.forEach((clause) => {
        if (clause.type !== "ElseClause" && clause.condition) {
          processExpression(clause.condition, scope, mapping);
        }
        processBlock(clause.body, scope.createChild(), mapping);
      });
      return;

    case "WhileStatement":
      processExpression(stmt.condition, scope, mapping);
      processBlock(stmt.body, scope.createChild(), mapping);
      return;

    case "RepeatStatement":
      processBlock(stmt.body, scope.createChild(), mapping);
      processExpression(stmt.condition, scope, mapping);
      return;

    case "ForNumericStatement": {
      processExpression(stmt.start, scope, mapping);
      processExpression(stmt.end, scope, mapping);
      if (stmt.step) {
        processExpression(stmt.step, scope, mapping);
      }
      const forScope = scope.createChild();
      if (isIdentifier(stmt.variable)) {
        forScope.define(stmt.variable.name);
      }
      processBlock(stmt.body, forScope, mapping);
      return;
    }

    case "ForGenericStatement": {
      stmt.iterators.forEach((iterator) => processExpression(iterator, scope, mapping));
      const forScope = scope.createChild();
      stmt.variables.forEach((variable) => {
        if (isIdentifier(variable)) {
          forScope.define(variable.name);
        }
      });
      processBlock(stmt.body, forScope, mapping);
      return;
    }

    case "DoStatement":
      processBlock(stmt.body, scope.createChild(), mapping);
      return;

    default:
      return;
  }
}

function processAssignmentTarget(
  expr: luaparse.Expression,
  scope: GlobalRenameScope,
  mapping: Map<string, string>,
): void {
  switch (expr.type) {
    case "Identifier":
      maybeRenameIdentifier(expr, scope, mapping);
      return;

    case "MemberExpression":
      processExpression(expr.base, scope, mapping);
      return;

    case "IndexExpression":
      processExpression(expr.base, scope, mapping);
      processExpression(expr.index, scope, mapping);
      return;

    default:
      processExpression(expr, scope, mapping);
      return;
  }
}

function processExpression(
  expr: luaparse.Expression,
  scope: GlobalRenameScope,
  mapping: Map<string, string>,
): void {
  switch (expr.type) {
    case "Identifier":
      maybeRenameIdentifier(expr, scope, mapping);
      return;

    case "UnaryExpression":
      processExpression(expr.argument, scope, mapping);
      return;

    case "BinaryExpression":
    case "LogicalExpression":
      processExpression(expr.left, scope, mapping);
      processExpression(expr.right, scope, mapping);
      return;

    case "CallExpression":
      processExpression(expr.base, scope, mapping);
      expr.arguments.forEach((arg) => processExpression(arg, scope, mapping));
      return;

    case "TableCallExpression":
      processExpression(expr.base, scope, mapping);
      processExpression(expr.arguments, scope, mapping);
      return;

    case "StringCallExpression":
      processExpression(expr.base, scope, mapping);
      processExpression(expr.argument as luaparse.Expression, scope, mapping);
      return;

    case "MemberExpression":
      processExpression(expr.base, scope, mapping);
      return;

    case "IndexExpression":
      processExpression(expr.base, scope, mapping);
      processExpression(expr.index, scope, mapping);
      return;

    case "TableConstructorExpression":
      expr.fields.forEach((field) => {
        if (field.type === "TableKey") {
          processExpression(field.key, scope, mapping);
          processExpression(field.value, scope, mapping);
        } else if (field.type === "TableKeyString") {
          processExpression(field.value, scope, mapping);
        } else {
          processExpression(field.value, scope, mapping);
        }
      });
      return;

    case "FunctionDeclaration": {
      const functionScope = scope.createChild();
      expr.parameters.forEach((param) => {
        if (isIdentifier(param)) {
          functionScope.define(param.name);
        }
      });
      processBlock(expr.body, functionScope, mapping);
      return;
    }

    default:
      return;
  }
}

function processBlock(
  body: luaparse.Statement[],
  scope: GlobalRenameScope,
  mapping: Map<string, string>,
): void {
  body.forEach((stmt) => processStatement(stmt, scope, mapping));
}

export function renameAllowedGlobalsInAST(
  ast: luaparse.Chunk,
  options: RenameAllowedGlobalsOptions,
): luaparse.Chunk {
  const namesToRename = options.namesToRename ?? [];
  if (namesToRename.length === 0) {
    return ast;
  }

  const namesToKeep = new Set<string>([...DEFAULT_GLOBAL_NAMES_TO_KEEP]);
  (options.namesToKeep ?? []).forEach((name) => namesToKeep.add(name));

  const mapping = makeRenameMap(ast, namesToRename, namesToKeep);
  if (mapping.size === 0) {
    return ast;
  }

  processBlock(ast.body, new GlobalRenameScope(), mapping);
  return ast;
}
