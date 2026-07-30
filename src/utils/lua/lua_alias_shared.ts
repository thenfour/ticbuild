import * as luaparse from "luaparse";
import { isIdentifier, LUA_RESERVED_WORDS, walkAST } from "./lua_ast";

// ============================================================================
// Shared aliasing utilities
// ============================================================================

// Generate a unique alias name
export function generateAliasName(index: number, prefix: string = "_"): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let name = prefix;
  let n = index;
  do {
    name += alphabet[n % 26];
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return name;
}

// Clone an expression node (shallow clone of structure)
// CLANG FORMAT PLEASE
type ExpressionCloneable =
  | luaparse.Identifier //
  | luaparse.MemberExpression //
  | luaparse.IndexExpression //
  | luaparse.StringLiteral //
  | luaparse.NumericLiteral //
  | luaparse.BooleanLiteral //
  | luaparse.NilLiteral;

export function cloneExpression<T extends luaparse.Expression>(node: T): T {
  if (!node) throw new Error("cloneExpression called with nullish node");

  const baseClone: Partial<ExpressionCloneable> = { type: node.type } as Partial<ExpressionCloneable>;

  switch (node.type) {
    case "Identifier": {
      const id = baseClone as luaparse.Identifier;
      id.name = node.name;
      break;
    }

    case "MemberExpression": {
      const m = baseClone as luaparse.MemberExpression;
      m.base = cloneExpression(node.base);
      m.identifier = cloneExpression(node.identifier);
      m.indexer = node.indexer;
      break;
    }

    case "IndexExpression": {
      const idx = baseClone as luaparse.IndexExpression;
      idx.base = cloneExpression(node.base);
      idx.index = cloneExpression(node.index);
      break;
    }

    case "StringLiteral": {
      const lit = baseClone as luaparse.StringLiteral;
      lit.value = node.value;
      lit.raw = node.raw;
      break;
    }

    case "NumericLiteral": {
      const lit = baseClone as luaparse.NumericLiteral;
      lit.value = node.value;
      lit.raw = node.raw;
      break;
    }

    case "BooleanLiteral": {
      const lit = baseClone as luaparse.BooleanLiteral;
      lit.value = node.value;
      lit.raw = node.raw;
      break;
    }

    case "NilLiteral":
      // nothing extra to copy
      break;

    default:
      // Non-cloneable expression types are unexpected here
      throw new Error(`cloneExpression received unsupported node type: ${node.type}`);
  }

  return baseClone as T;
}

// Shared info about an aliasable item (expression or literal)
type AliasScopeNode =
  | luaparse.Chunk
  | luaparse.FunctionDeclaration
  | luaparse.IfClause
  | luaparse.ElseifClause
  | luaparse.ElseClause
  | luaparse.WhileStatement
  | luaparse.DoStatement
  | luaparse.RepeatStatement
  | luaparse.ForNumericStatement
  | luaparse.ForGenericStatement;

export interface AliasBindingScope {
  isShadowed(name: string): boolean;
}

class LexicalBindingScope implements AliasBindingScope {
  private localNames = new Set<string>();

  constructor(private parent: LexicalBindingScope | null = null) {}

  createChild(): LexicalBindingScope {
    return new LexicalBindingScope(this);
  }

  define(name: string | undefined | null): void {
    if (name) this.localNames.add(name);
  }

  isShadowed(name: string): boolean {
    return this.localNames.has(name) || (this.parent?.isShadowed(name) ?? false);
  }
}

export interface AliasInfo {
  serialized: string;
  node: luaparse.Expression;
  count: number;
  scopes: AliasScopeNode[];
  aliasName?: string;
  targetScope?: AliasScopeNode;
}

// Tracker for aliasable items
export class AliasTracker {
  private items = new Map<string, AliasInfo>();
  private aliasCounter = 0;
  private prefix: string;
  private unavailableNames: Set<string>;

  constructor(prefix: string = "_", unavailableNames: Iterable<string> = []) {
    this.prefix = prefix;
    this.unavailableNames = new Set(unavailableNames);
  }

  // Record an occurrence of an item in a given scope
  record(key: string, node: luaparse.Expression, scope: AliasScopeNode): void {
    const existing = this.items.get(key);
    if (existing) {
      existing.count++;
      if (!existing.scopes.includes(scope)) {
        existing.scopes.push(scope);
      }
    } else {
      this.items.set(key, {
        serialized: key,
        node: cloneExpression(node),
        count: 1,
        scopes: [scope],
      });
    }
  }

  // Get items that should be aliased based on a predicate
  getAliasableItems(predicate: (info: AliasInfo) => boolean): AliasInfo[] {
    const result: AliasInfo[] = [];

    for (const info of this.items.values()) {
      if (predicate(info)) {
        let aliasName: string;
        do {
          aliasName = generateAliasName(this.aliasCounter++, this.prefix);
        } while (LUA_RESERVED_WORDS.has(aliasName) || this.unavailableNames.has(aliasName));

        info.aliasName = aliasName;
        this.unavailableNames.add(aliasName);
        result.push(info);
      }
    }

    return result;
  }

  // Look up an alias for an item by key
  getAlias(key: string): string | null {
    const info = this.items.get(key);
    return info?.aliasName || null;
  }
}

// Find common ancestor scope for multiple scopes
export function findCommonAncestor(
  scopes: AliasScopeNode[],
  scopeParents: WeakMap<AliasScopeNode, AliasScopeNode>,
  rootScope: AliasScopeNode,
): AliasScopeNode {
  if (scopes.length === 0) return rootScope;
  if (scopes.length === 1) return scopes[0];

  // Get all ancestors for the first scope
  const ancestors = new Set<any>();
  let current: any = scopes[0];
  while (current) {
    ancestors.add(current);
    const parent = scopeParents.get(current);
    if (!parent) break;
    current = parent;
  }

  // Find the first common ancestor for all other scopes
  for (let i = 1; i < scopes.length; i++) {
    let scope = scopes[i];
    while (scope && !ancestors.has(scope)) {
      const parent = scopeParents.get(scope);
      if (!parent) break;
      scope = parent;
    }
    if (scope) {
      const newAncestors = new Set<any>();
      let current = scope;
      while (current) {
        if (ancestors.has(current)) {
          newAncestors.add(current);
        }
        const parent = scopeParents.get(current);
        if (!parent) break;
        current = parent;
      }
      ancestors.clear();
      newAncestors.forEach((a) => ancestors.add(a));
    }
  }

  // Return the deepest common ancestor
  for (const scope of scopes) {
    let current = scope;
    while (current) {
      if (ancestors.has(current)) {
        return current;
      }
      const parent = scopeParents.get(current);
      if (!parent) break;
      current = parent;
    }
  }

  return rootScope;
}

// Insert declarations into scopes
export function insertDeclarationsIntoScopes(
  declarationsByScope: Map<AliasScopeNode, AliasInfo[]>,
): void {
  declarationsByScope.forEach((declarations, scope) => {
    const aliasDeclarations: luaparse.LocalStatement[] = declarations.map((info) => ({
      type: "LocalStatement",
      variables: [
        {
          type: "Identifier",
          name: info.aliasName!,
        },
      ],
      init: [info.node],
    }));
    scope.body.unshift(...aliasDeclarations);
  });
}

// ---------------------------------------------------------------------------
// Generic alias pass runner
// ---------------------------------------------------------------------------

export type AliasStrategy = {
  prefix: string;
  serialize(node: luaparse.Expression | null | undefined, bindings: AliasBindingScope): string | null;
  shouldAlias(info: AliasInfo): boolean;
};

export function runAliasPass(ast: luaparse.Chunk, strategy: AliasStrategy): luaparse.Chunk {
  const unavailableNames = new Set<string>();
  walkAST(ast, (node) => {
    if (isIdentifier(node)) unavailableNames.add(node.name);
  });

  const tracker = new AliasTracker(strategy.prefix, unavailableNames);
  const candidateKeys = new WeakMap<luaparse.Expression, string>();
  const scopeParents = new WeakMap<AliasScopeNode, AliasScopeNode>();

  function registerScope(scope: AliasScopeNode, parentScope: AliasScopeNode): void {
    scopeParents.set(scope, parentScope);
  }

  function countExpression(
    node: luaparse.Expression,
    currentScope: AliasScopeNode,
    bindings: LexicalBindingScope,
  ): void {
    if (!node) return;

    const key = strategy.serialize(node, bindings);
    if (key) {
      tracker.record(key, node, currentScope);
      candidateKeys.set(node, key);
    }

    switch (node.type) {
      case "BinaryExpression":
      case "LogicalExpression":
        countExpression(node.left, currentScope, bindings);
        countExpression(node.right, currentScope, bindings);
        return;

      case "UnaryExpression":
        countExpression(node.argument, currentScope, bindings);
        return;

      case "CallExpression":
        countExpression(node.base, currentScope, bindings);
        node.arguments.forEach((arg) => countExpression(arg, currentScope, bindings));
        return;

      case "TableCallExpression":
        countExpression(node.base, currentScope, bindings);
        countExpression(node.arguments, currentScope, bindings);
        return;

      case "StringCallExpression":
        countExpression(node.base, currentScope, bindings);
        return;

      case "MemberExpression":
        countExpression(node.base, currentScope, bindings);
        return;

      case "IndexExpression":
        countExpression(node.base, currentScope, bindings);
        countExpression(node.index, currentScope, bindings);
        return;

      case "TableConstructorExpression":
        node.fields.forEach((field) => {
          if (field.type === "TableKey") countExpression(field.key, currentScope, bindings);
          countExpression(field.value, currentScope, bindings);
        });
        return;

      case "FunctionDeclaration": {
        registerScope(node, currentScope);
        const functionBindings = bindings.createChild();
        node.parameters.forEach((parameter) => {
          if (isIdentifier(parameter)) functionBindings.define(parameter.name);
        });
        countBlock(node.body, node, functionBindings);
        return;
      }

      default:
        return;
    }
  }

  function countAssignmentTarget(
    node: luaparse.Identifier | luaparse.MemberExpression | luaparse.IndexExpression,
    currentScope: AliasScopeNode,
    bindings: LexicalBindingScope,
  ): void {
    switch (node.type) {
      case "MemberExpression":
        countExpression(node.base, currentScope, bindings);
        return;

      case "IndexExpression":
        countExpression(node.base, currentScope, bindings);
        countExpression(node.index, currentScope, bindings);
        return;

      default:
        return;
    }
  }

  function countBlock(
    statements: luaparse.Statement[],
    currentScope: AliasScopeNode,
    bindings: LexicalBindingScope,
  ): void {
    statements.forEach((statement) => countStatement(statement, currentScope, bindings));
  }

  function countStatement(
    stmt: luaparse.Statement,
    currentScope: AliasScopeNode,
    bindings: LexicalBindingScope,
  ): void {
    switch (stmt.type) {
      case "LocalStatement":
        stmt.init.forEach((expression) => countExpression(expression, currentScope, bindings));
        stmt.variables.forEach((variable) => bindings.define(variable.name));
        return;

      case "AssignmentStatement":
        stmt.variables.forEach((variable) => countAssignmentTarget(variable, currentScope, bindings));
        stmt.init.forEach((expression) => countExpression(expression, currentScope, bindings));
        return;

      case "CallStatement":
        countExpression(stmt.expression, currentScope, bindings);
        return;

      case "ReturnStatement":
        stmt.arguments.forEach((argument) => countExpression(argument, currentScope, bindings));
        return;

      case "IfStatement":
        stmt.clauses.forEach((clause) => {
          if (clause.type !== "ElseClause") countExpression(clause.condition, currentScope, bindings);
          registerScope(clause, currentScope);
          countBlock(clause.body, clause, bindings.createChild());
        });
        return;

      case "WhileStatement":
        countExpression(stmt.condition, currentScope, bindings);
        registerScope(stmt, currentScope);
        countBlock(stmt.body, stmt, bindings.createChild());
        return;

      case "RepeatStatement": {
        registerScope(stmt, currentScope);
        const repeatBindings = bindings.createChild();
        countBlock(stmt.body, stmt, repeatBindings);
        countExpression(stmt.condition, stmt, repeatBindings);
        return;
      }

      case "ForNumericStatement": {
        countExpression(stmt.start, currentScope, bindings);
        countExpression(stmt.end, currentScope, bindings);
        if (stmt.step) countExpression(stmt.step, currentScope, bindings);
        registerScope(stmt, currentScope);
        const forBindings = bindings.createChild();
        forBindings.define(stmt.variable.name);
        countBlock(stmt.body, stmt, forBindings);
        return;
      }

      case "ForGenericStatement": {
        stmt.iterators.forEach((iterator) => countExpression(iterator, currentScope, bindings));
        registerScope(stmt, currentScope);
        const forBindings = bindings.createChild();
        stmt.variables.forEach((variable) => forBindings.define(variable.name));
        countBlock(stmt.body, stmt, forBindings);
        return;
      }

      case "FunctionDeclaration": {
        if (stmt.isLocal && isIdentifier(stmt.identifier)) {
          bindings.define(stmt.identifier.name);
        } else if (stmt.identifier) {
          countAssignmentTarget(stmt.identifier, currentScope, bindings);
        }
        registerScope(stmt, currentScope);
        const functionBindings = bindings.createChild();
        stmt.parameters.forEach((parameter) => {
          if (isIdentifier(parameter)) functionBindings.define(parameter.name);
        });
        countBlock(stmt.body, stmt, functionBindings);
        return;
      }

      case "DoStatement":
        registerScope(stmt, currentScope);
        countBlock(stmt.body, stmt, bindings.createChild());
        return;

      default:
        return;
    }
  }

  countBlock(ast.body, ast, new LexicalBindingScope());
  const aliasable = tracker.getAliasableItems(strategy.shouldAlias);
  if (aliasable.length === 0) return ast;

  aliasable.forEach((info) => {
    info.targetScope = findCommonAncestor(info.scopes, scopeParents, ast);
  });

  const declarationsByScope = new Map<AliasScopeNode, AliasInfo[]>();
  aliasable.forEach((info) => {
    const scope = info.targetScope!;
    if (!declarationsByScope.has(scope)) declarationsByScope.set(scope, []);
    declarationsByScope.get(scope)!.push(info);
  });

  function replaceExpression(node: luaparse.Expression): luaparse.Expression {
    const key = candidateKeys.get(node);
    if (key) {
      const alias = tracker.getAlias(key);
      if (alias) return { type: "Identifier", name: alias } as luaparse.Identifier;
    }

    switch (node.type) {
      case "BinaryExpression":
      case "LogicalExpression":
        node.left = replaceExpression(node.left);
        node.right = replaceExpression(node.right);
        return node;

      case "UnaryExpression":
        node.argument = replaceExpression(node.argument);
        return node;

      case "CallExpression":
        node.base = replaceExpression(node.base);
        node.arguments = node.arguments.map(replaceExpression);
        return node;

      case "TableCallExpression":
        node.base = replaceExpression(node.base);
        node.arguments = replaceExpression(node.arguments);
        return node;

      case "StringCallExpression":
        node.base = replaceExpression(node.base);
        return node;

      case "MemberExpression":
        node.base = replaceExpression(node.base);
        return node;

      case "IndexExpression":
        node.base = replaceExpression(node.base);
        node.index = replaceExpression(node.index);
        return node;

      case "TableConstructorExpression":
        node.fields.forEach((field) => {
          if (field.type === "TableKey") field.key = replaceExpression(field.key);
          field.value = replaceExpression(field.value);
        });
        return node;

      case "FunctionDeclaration":
        node.body.forEach(replaceStatement);
        return node;

      default:
        return node;
    }
  }

  function replaceAssignmentTarget(
    node: luaparse.Identifier | luaparse.MemberExpression | luaparse.IndexExpression,
  ): void {
    if (node.type === "MemberExpression") {
      node.base = replaceExpression(node.base);
    } else if (node.type === "IndexExpression") {
      node.base = replaceExpression(node.base);
      node.index = replaceExpression(node.index);
    }
  }

  function replaceStatement(stmt: luaparse.Statement): void {
    switch (stmt.type) {
      case "LocalStatement":
        stmt.init = stmt.init.map(replaceExpression);
        return;

      case "AssignmentStatement":
        stmt.variables.forEach(replaceAssignmentTarget);
        stmt.init = stmt.init.map(replaceExpression);
        return;

      case "CallStatement":
        stmt.expression = replaceExpression(stmt.expression) as
          | luaparse.CallExpression
          | luaparse.TableCallExpression
          | luaparse.StringCallExpression;
        return;

      case "ReturnStatement":
        stmt.arguments = stmt.arguments.map(replaceExpression);
        return;

      case "IfStatement":
        stmt.clauses.forEach((clause) => {
          if (clause.type !== "ElseClause") clause.condition = replaceExpression(clause.condition);
          clause.body.forEach(replaceStatement);
        });
        return;

      case "WhileStatement":
        stmt.condition = replaceExpression(stmt.condition);
        stmt.body.forEach(replaceStatement);
        return;

      case "RepeatStatement":
        stmt.body.forEach(replaceStatement);
        stmt.condition = replaceExpression(stmt.condition);
        return;

      case "ForNumericStatement":
        stmt.start = replaceExpression(stmt.start);
        stmt.end = replaceExpression(stmt.end);
        if (stmt.step) stmt.step = replaceExpression(stmt.step);
        stmt.body.forEach(replaceStatement);
        return;

      case "ForGenericStatement":
        stmt.iterators = stmt.iterators.map(replaceExpression);
        stmt.body.forEach(replaceStatement);
        return;

      case "FunctionDeclaration":
        if (!stmt.isLocal && stmt.identifier) replaceAssignmentTarget(stmt.identifier);
        stmt.body.forEach(replaceStatement);
        return;

      case "DoStatement":
        stmt.body.forEach(replaceStatement);
        return;

      default:
        return;
    }
  }

  ast.body.forEach(replaceStatement);
  insertDeclarationsIntoScopes(declarationsByScope);
  return ast;
}
