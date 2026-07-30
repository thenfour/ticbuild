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
export type AliasScopeNode =
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
  occurrences: luaparse.Expression[];
  aliasName?: string;
  targetScope?: AliasScopeNode;
  estimatedSavings?: number;
  selected?: boolean;
  order: number;
  strategy: AliasStrategy;
  conflicts: Set<AliasInfo>;
}

// Tracker for aliasable items
export class AliasTracker {
  private items = new Map<string, AliasInfo>();

  constructor(private strategy: AliasStrategy, private nextOrder: () => number) {}

  // Record an occurrence of an item in a given scope
  record(key: string, node: luaparse.Expression, scope: AliasScopeNode): AliasInfo {
    const existing = this.items.get(key);
    if (existing) {
      existing.count++;
      existing.occurrences.push(node);
      if (!existing.scopes.includes(scope)) {
        existing.scopes.push(scope);
      }
      return existing;
    } else {
      const info: AliasInfo = {
        serialized: key,
        node: cloneExpression(node),
        count: 1,
        scopes: [scope],
        occurrences: [node],
        order: this.nextOrder(),
        strategy: this.strategy,
        conflicts: new Set<AliasInfo>(),
      };
      this.items.set(key, info);
      return info;
    }
  }

  getItems(): AliasInfo[] {
    return Array.from(this.items.values());
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
  generatedDeclarations?: WeakSet<luaparse.LocalStatement>,
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
    aliasDeclarations.forEach((declaration) => generatedDeclarations?.add(declaration));
    scope.body.unshift(...aliasDeclarations);
  });
}

// ---------------------------------------------------------------------------
// Generic alias pass runner
// ---------------------------------------------------------------------------

export type AliasStrategy = {
  rule: AliasRuleName;
  prefix: string;
  serialize(node: luaparse.Expression | null | undefined, bindings: AliasBindingScope): string | null;
  estimateSavings(info: AliasInfo, aliasNameLength: number): number;
};

export type AliasRuleName = "aliasLiterals" | "aliasRepeatedExpressions";

export type AliasRuleReport = {
  accepted: number;
  omitted: number;
  estimatedBytesSaved: number;
  estimatedBytesOmitted: number;
};

export type AliasFunctionReport = {
  functionName: string;
  sourceLine: number;
  localLimit: number;
  peakActiveLocals: number;
  existingLocalsAtPeak: number;
  generatedLocalsAtPeak: number;
  rules: Record<AliasRuleName, AliasRuleReport>;
};

export type AliasPassReport = {
  localLimit: number;
  constrainedFunctions: AliasFunctionReport[];
};

export type AliasPassResult = {
  ast: luaparse.Chunk;
  report: AliasPassReport;
};

export const LUA_MAX_ACTIVE_LOCALS = 200;

type FunctionScopeNode = luaparse.Chunk | luaparse.FunctionDeclaration;

type LocalCounts = {
  existing: number;
  generated: number;
};

type LocalPressureScope = {
  scope: AliasScopeNode;
  functionRoot: FunctionScopeNode;
  parent: LocalPressureScope | null;
  children: LocalPressureScope[];
  directPeak: number;
  candidates: AliasInfo[];
};

type FunctionPressure = {
  root: FunctionScopeNode;
  rootScope: LocalPressureScope;
  peakActiveLocals: number;
  existingLocalsAtPeak: number;
  generatedLocalsAtPeak: number;
};

type LocalPressureAnalysis = {
  scopeByNode: WeakMap<AliasScopeNode, LocalPressureScope>;
  functions: FunctionPressure[];
  functionByRoot: Map<FunctionScopeNode, FunctionPressure>;
};

function analyzeLocalPressure(
  ast: luaparse.Chunk,
  generatedDeclarations: WeakSet<luaparse.LocalStatement> = new WeakSet<luaparse.LocalStatement>(),
): LocalPressureAnalysis {
  const scopeByNode = new WeakMap<AliasScopeNode, LocalPressureScope>();
  const functions: FunctionPressure[] = [];
  const functionByRoot = new Map<FunctionScopeNode, FunctionPressure>();
  const analyzedFunctions = new WeakSet<FunctionScopeNode>();

  function createScope(
    scope: AliasScopeNode,
    functionRoot: FunctionScopeNode,
    parent: LocalPressureScope | null,
  ): LocalPressureScope {
    const pressureScope: LocalPressureScope = {
      scope,
      functionRoot,
      parent,
      children: [],
      directPeak: 0,
      candidates: [],
    };
    parent?.children.push(pressureScope);
    scopeByNode.set(scope, pressureScope);
    return pressureScope;
  }

  function recordPoint(scope: LocalPressureScope, counts: LocalCounts): void {
    const total = counts.existing + counts.generated;
    scope.directPeak = Math.max(scope.directPeak, total);
    const fn = functionByRoot.get(scope.functionRoot)!;
    if (
      total > fn.peakActiveLocals ||
      (total === fn.peakActiveLocals && counts.generated > fn.generatedLocalsAtPeak)
    ) {
      fn.peakActiveLocals = total;
      fn.existingLocalsAtPeak = counts.existing;
      fn.generatedLocalsAtPeak = counts.generated;
    }
  }

  function analyzeExpression(node: luaparse.Expression): void {
    switch (node.type) {
      case "BinaryExpression":
      case "LogicalExpression":
        analyzeExpression(node.left);
        analyzeExpression(node.right);
        return;

      case "UnaryExpression":
        analyzeExpression(node.argument);
        return;

      case "CallExpression":
        analyzeExpression(node.base);
        node.arguments.forEach(analyzeExpression);
        return;

      case "TableCallExpression":
        analyzeExpression(node.base);
        analyzeExpression(node.arguments);
        return;

      case "StringCallExpression":
        analyzeExpression(node.base);
        analyzeExpression(node.argument);
        return;

      case "MemberExpression":
        analyzeExpression(node.base);
        return;

      case "IndexExpression":
        analyzeExpression(node.base);
        analyzeExpression(node.index);
        return;

      case "TableConstructorExpression":
        node.fields.forEach((field) => {
          if (field.type === "TableKey") analyzeExpression(field.key);
          analyzeExpression(field.value);
        });
        return;

      case "FunctionDeclaration":
        analyzeFunction(node);
        return;

      default:
        return;
    }
  }

  function analyzeStatements(
    statements: luaparse.Statement[],
    scope: LocalPressureScope,
    entryCounts: LocalCounts,
  ): LocalCounts {
    const counts = { ...entryCounts };
    recordPoint(scope, counts);

    for (const stmt of statements) {
      switch (stmt.type) {
        case "LocalStatement": {
          const generated = generatedDeclarations.has(stmt);
          const declarationCount = stmt.variables.length;
          const declarationCounts = {
            existing: counts.existing + (generated ? 0 : declarationCount),
            generated: counts.generated + (generated ? declarationCount : 0),
          };
          // Lua registers every name before compiling the initializer, so the
          // declaration itself must fit even though its bindings are not visible yet.
          recordPoint(scope, declarationCounts);
          counts.existing = declarationCounts.existing;
          counts.generated = declarationCounts.generated;
          stmt.init.forEach(analyzeExpression);
          break;
        }

        case "AssignmentStatement":
          stmt.variables.forEach(analyzeExpression);
          stmt.init.forEach(analyzeExpression);
          break;

        case "CallStatement":
          analyzeExpression(stmt.expression);
          break;

        case "ReturnStatement":
          stmt.arguments.forEach(analyzeExpression);
          break;

        case "IfStatement":
          stmt.clauses.forEach((clause) => {
            if (clause.type !== "ElseClause") analyzeExpression(clause.condition);
            const child = createScope(clause, scope.functionRoot, scope);
            analyzeStatements(clause.body, child, counts);
          });
          break;

        case "WhileStatement": {
          analyzeExpression(stmt.condition);
          const child = createScope(stmt, scope.functionRoot, scope);
          analyzeStatements(stmt.body, child, counts);
          break;
        }

        case "RepeatStatement": {
          const child = createScope(stmt, scope.functionRoot, scope);
          const repeatCounts = analyzeStatements(stmt.body, child, counts);
          analyzeExpression(stmt.condition);
          recordPoint(child, repeatCounts);
          break;
        }

        case "ForNumericStatement": {
          stmt.start && analyzeExpression(stmt.start);
          stmt.end && analyzeExpression(stmt.end);
          if (stmt.step) analyzeExpression(stmt.step);
          const child = createScope(stmt, scope.functionRoot, scope);
          analyzeStatements(
            stmt.body,
            child,
            { existing: counts.existing + 4, generated: counts.generated },
          );
          break;
        }

        case "ForGenericStatement": {
          stmt.iterators.forEach(analyzeExpression);
          const child = createScope(stmt, scope.functionRoot, scope);
          analyzeStatements(
            stmt.body,
            child,
            {
              existing: counts.existing + 3 + stmt.variables.length,
              generated: counts.generated,
            },
          );
          break;
        }

        case "FunctionDeclaration":
          if (stmt.isLocal && isIdentifier(stmt.identifier)) {
            counts.existing++;
            recordPoint(scope, counts);
          }
          analyzeFunction(stmt);
          break;

        case "DoStatement": {
          const child = createScope(stmt, scope.functionRoot, scope);
          analyzeStatements(stmt.body, child, counts);
          break;
        }

        default:
          break;
      }
    }

    return counts;
  }

  function analyzeFunction(root: FunctionScopeNode): void {
    if (analyzedFunctions.has(root)) return;
    analyzedFunctions.add(root);

    let parameterCount = 0;
    if (root.type === "FunctionDeclaration") {
      parameterCount = root.parameters.filter(isIdentifier).length;
      if (root.identifier?.type === "MemberExpression" && root.identifier.indexer === ":") {
        parameterCount++;
      }
    }

    const rootScope = createScope(root, root, null);
    const fn: FunctionPressure = {
      root,
      rootScope,
      peakActiveLocals: parameterCount,
      existingLocalsAtPeak: parameterCount,
      generatedLocalsAtPeak: 0,
    };
    functions.push(fn);
    functionByRoot.set(root, fn);
    analyzeStatements(root.body, rootScope, { existing: parameterCount, generated: 0 });
  }

  analyzeFunction(ast);
  return { scopeByNode, functions, functionByRoot };
}

function allocateCandidates(root: LocalPressureScope): Set<AliasInfo> {
  type MemoEntry = { value: number; selectedHere: number };
  const memo = new WeakMap<LocalPressureScope, Map<number, MemoEntry>>();
  const impossible = Number.NEGATIVE_INFINITY;

  function solve(scope: LocalPressureScope, inheritedAliases: number): MemoEntry {
    let scopeMemo = memo.get(scope);
    if (!scopeMemo) {
      scopeMemo = new Map<number, MemoEntry>();
      memo.set(scope, scopeMemo);
    }
    const cached = scopeMemo.get(inheritedAliases);
    if (cached) return cached;

    if (inheritedAliases > 0 && scope.directPeak + inheritedAliases > LUA_MAX_ACTIVE_LOCALS) {
      const result = { value: impossible, selectedHere: 0 };
      scopeMemo.set(inheritedAliases, result);
      return result;
    }

    scope.candidates.sort(
      (a, b) => (b.estimatedSavings ?? 0) - (a.estimatedSavings ?? 0) || a.order - b.order,
    );
    const prefixSavings = [0];
    scope.candidates.forEach((candidate) => {
      prefixSavings.push(prefixSavings[prefixSavings.length - 1] + (candidate.estimatedSavings ?? 0));
    });

    const availableHere = Math.max(0, LUA_MAX_ACTIVE_LOCALS - scope.directPeak - inheritedAliases);
    const maxHere = Math.min(scope.candidates.length, availableHere);
    let best: MemoEntry = { value: impossible, selectedHere: 0 };

    for (let selectedHere = 0; selectedHere <= maxHere; selectedHere++) {
      const childInherited = inheritedAliases + selectedHere;
      let value = prefixSavings[selectedHere];
      let valid = true;
      for (const child of scope.children) {
        const childResult = solve(child, childInherited);
        if (childResult.value === impossible) {
          valid = false;
          break;
        }
        value += childResult.value;
      }
      if (valid && value > best.value) {
        best = { value, selectedHere };
      }
    }

    scopeMemo.set(inheritedAliases, best);
    return best;
  }

  const selected = new Set<AliasInfo>();
  solve(root, 0);

  function collect(scope: LocalPressureScope, inheritedAliases: number): void {
    const decision = memo.get(scope)!.get(inheritedAliases)!;
    scope.candidates.slice(0, decision.selectedHere).forEach((candidate) => selected.add(candidate));
    const childInherited = inheritedAliases + decision.selectedHere;
    scope.children.forEach((child) => collect(child, childInherited));
  }

  collect(root, 0);
  return selected;
}

function functionName(root: FunctionScopeNode): string {
  if (root.type === "Chunk") return "<main chunk>";
  if (!root.identifier) return "<anonymous>";

  function expressionName(node: luaparse.Expression): string | null {
    if (node.type === "Identifier") return node.name;
    if (node.type === "MemberExpression") {
      const base = expressionName(node.base);
      return base ? `${base}${node.indexer}${node.identifier.name}` : node.identifier.name;
    }
    return null;
  }

  return expressionName(root.identifier) ?? "<anonymous>";
}

function emptyRuleReport(): AliasRuleReport {
  return { accepted: 0, omitted: 0, estimatedBytesSaved: 0, estimatedBytesOmitted: 0 };
}

export function createEmptyAliasPassReport(): AliasPassReport {
  return { localLimit: LUA_MAX_ACTIVE_LOCALS, constrainedFunctions: [] };
}

export function runAliasPasses(ast: luaparse.Chunk, strategies: AliasStrategy[]): AliasPassResult {
  if (strategies.length === 0) return { ast, report: createEmptyAliasPassReport() };

  const unavailableNames = new Set<string>();
  walkAST(ast, (node) => {
    if (isIdentifier(node)) unavailableNames.add(node.name);
  });

  let nextCandidateOrder = 0;
  const strategyStates = strategies.map((strategy) => ({
    strategy,
    tracker: new AliasTracker(strategy, () => nextCandidateOrder++),
  }));
  const candidatesByNode = new WeakMap<luaparse.Expression, AliasInfo[]>();
  const scopeParents = new WeakMap<AliasScopeNode, AliasScopeNode>();

  function registerScope(scope: AliasScopeNode, parentScope: AliasScopeNode): void {
    scopeParents.set(scope, parentScope);
  }

  function countExpression(
    node: luaparse.Expression,
    currentScope: AliasScopeNode,
    bindings: LexicalBindingScope,
    ancestors: AliasInfo[] = [],
  ): void {
    if (!node) return;

    const currentCandidates: AliasInfo[] = [];
    strategyStates.forEach(({ strategy, tracker }) => {
      const key = strategy.serialize(node, bindings);
      if (!key) return;
      const info = tracker.record(key, node, currentScope);
      currentCandidates.push(info);
      ancestors.forEach((ancestor) => {
        if (ancestor === info) return;
        ancestor.conflicts.add(info);
        info.conflicts.add(ancestor);
      });
    });
    if (currentCandidates.length > 0) candidatesByNode.set(node, currentCandidates);
    const childAncestors = currentCandidates.length > 0 ? [...ancestors, ...currentCandidates] : ancestors;

    switch (node.type) {
      case "BinaryExpression":
      case "LogicalExpression":
        countExpression(node.left, currentScope, bindings, childAncestors);
        countExpression(node.right, currentScope, bindings, childAncestors);
        return;

      case "UnaryExpression":
        countExpression(node.argument, currentScope, bindings, childAncestors);
        return;

      case "CallExpression":
        countExpression(node.base, currentScope, bindings, childAncestors);
        node.arguments.forEach((arg) => countExpression(arg, currentScope, bindings, childAncestors));
        return;

      case "TableCallExpression":
        countExpression(node.base, currentScope, bindings, childAncestors);
        countExpression(node.arguments, currentScope, bindings, childAncestors);
        return;

      case "StringCallExpression":
        countExpression(node.base, currentScope, bindings, childAncestors);
        return;

      case "MemberExpression":
        countExpression(node.base, currentScope, bindings, childAncestors);
        return;

      case "IndexExpression":
        countExpression(node.base, currentScope, bindings, childAncestors);
        countExpression(node.index, currentScope, bindings, childAncestors);
        return;

      case "TableConstructorExpression":
        node.fields.forEach((field) => {
          if (field.type === "TableKey") countExpression(field.key, currentScope, bindings, childAncestors);
          countExpression(field.value, currentScope, bindings, childAncestors);
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

  const allCandidates = strategyStates.flatMap(({ tracker }) => tracker.getItems());
  allCandidates.forEach((info) => {
    info.targetScope = findCommonAncestor(info.scopes, scopeParents, ast);
  });
  const provisionalNames = new Set(unavailableNames);
  const provisionalCounters = new Map<string, number>();
  const profitableCandidates: AliasInfo[] = [];
  [...allCandidates]
    .sort((a, b) => a.order - b.order)
    .forEach((info) => {
      let counter = provisionalCounters.get(info.strategy.prefix) ?? 0;
      let aliasName: string;
      do {
        aliasName = generateAliasName(counter++, info.strategy.prefix);
      } while (LUA_RESERVED_WORDS.has(aliasName) || provisionalNames.has(aliasName));

      const savings = info.strategy.estimateSavings(info, aliasName.length);
      if (savings <= 0) return;

      provisionalCounters.set(info.strategy.prefix, counter);
      provisionalNames.add(aliasName);
      info.aliasName = aliasName;
      info.estimatedSavings = savings;
      profitableCandidates.push(info);
    });
  if (profitableCandidates.length === 0) {
    return { ast, report: createEmptyAliasPassReport() };
  }

  // Selecting an outer expression removes its nested occurrences. Resolve
  // those rare cross-strategy conflicts after capacity allocation, then rerun
  // the allocator so a discarded overlap cannot leave a usable slot empty.
  const conflictExcluded = new Set<AliasInfo>();
  let retainedCandidates: AliasInfo[] = [];
  let selectedCandidates = new Set<AliasInfo>();
  let baselinePressure: LocalPressureAnalysis;
  while (true) {
    retainedCandidates = profitableCandidates.filter((candidate) => !conflictExcluded.has(candidate));
    baselinePressure = analyzeLocalPressure(ast);
    retainedCandidates.forEach((candidate) => {
      const pressureScope = baselinePressure.scopeByNode.get(candidate.targetScope!);
      pressureScope?.candidates.push(candidate);
    });

    selectedCandidates = new Set<AliasInfo>();
    baselinePressure.functions.forEach((fn) => {
      allocateCandidates(fn.rootScope).forEach((candidate) => selectedCandidates.add(candidate));
    });

    const selectedByBenefit = [...selectedCandidates].sort(
      (a, b) => (b.estimatedSavings ?? 0) - (a.estimatedSavings ?? 0) || a.order - b.order,
    );
    const conflictWinners: AliasInfo[] = [];
    const newlyExcluded: AliasInfo[] = [];
    selectedByBenefit.forEach((candidate) => {
      if (conflictWinners.some((winner) => candidate.conflicts.has(winner))) {
        newlyExcluded.push(candidate);
      } else {
        conflictWinners.push(candidate);
      }
    });
    if (newlyExcluded.length === 0) break;
    newlyExcluded.forEach((candidate) => conflictExcluded.add(candidate));
  }

  retainedCandidates.forEach((candidate) => {
    candidate.selected = selectedCandidates.has(candidate);
  });

  const assignedNames = new Set(unavailableNames);
  const aliasCounters = new Map<string, number>();
  retainedCandidates.forEach((candidate) => {
    candidate.aliasName = undefined;
  });
  [...selectedCandidates]
    .sort((a, b) => a.order - b.order)
    .forEach((candidate) => {
      let counter = aliasCounters.get(candidate.strategy.prefix) ?? 0;
      let aliasName: string;
      do {
        aliasName = generateAliasName(counter++, candidate.strategy.prefix);
      } while (LUA_RESERVED_WORDS.has(aliasName) || assignedNames.has(aliasName));
      aliasCounters.set(candidate.strategy.prefix, counter);
      assignedNames.add(aliasName);
      candidate.aliasName = aliasName;
      candidate.estimatedSavings = candidate.strategy.estimateSavings(candidate, aliasName.length);
    });

  const declarationsByScope = new Map<AliasScopeNode, AliasInfo[]>();
  [...selectedCandidates]
    .sort((a, b) => a.order - b.order)
    .forEach((info) => {
      const scope = info.targetScope!;
      if (!declarationsByScope.has(scope)) declarationsByScope.set(scope, []);
      declarationsByScope.get(scope)!.push(info);
    });

  function replaceExpression(node: luaparse.Expression): luaparse.Expression {
    const selected = candidatesByNode.get(node)?.find((candidate) => candidate.selected);
    if (selected?.aliasName) {
      return { type: "Identifier", name: selected.aliasName } as luaparse.Identifier;
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
  const generatedDeclarations = new WeakSet<luaparse.LocalStatement>();
  insertDeclarationsIntoScopes(declarationsByScope, generatedDeclarations);
  const finalPressure = analyzeLocalPressure(ast, generatedDeclarations);

  const constrainedFunctions: AliasFunctionReport[] = [];
  baselinePressure.functions.forEach((baselineFn) => {
    const candidatesForFunction = retainedCandidates.filter((candidate) => {
      return baselinePressure.scopeByNode.get(candidate.targetScope!)?.functionRoot === baselineFn.root;
    });
    const omitted = candidatesForFunction.filter((candidate) => !candidate.selected);
    if (omitted.length === 0) return;

    const rules: Record<AliasRuleName, AliasRuleReport> = {
      aliasLiterals: emptyRuleReport(),
      aliasRepeatedExpressions: emptyRuleReport(),
    };
    candidatesForFunction.forEach((candidate) => {
      const rule = rules[candidate.strategy.rule];
      if (candidate.selected) {
        rule.accepted++;
        rule.estimatedBytesSaved += candidate.estimatedSavings ?? 0;
      } else {
        rule.omitted++;
        rule.estimatedBytesOmitted += candidate.estimatedSavings ?? 0;
      }
    });

    const finalFn = finalPressure.functionByRoot.get(baselineFn.root)!;
    constrainedFunctions.push({
      functionName: functionName(baselineFn.root),
      sourceLine: baselineFn.root.loc?.start.line ?? 1,
      localLimit: LUA_MAX_ACTIVE_LOCALS,
      peakActiveLocals: finalFn.peakActiveLocals,
      existingLocalsAtPeak: finalFn.existingLocalsAtPeak,
      generatedLocalsAtPeak: finalFn.generatedLocalsAtPeak,
      rules,
    });
  });

  return {
    ast,
    report: { localLimit: LUA_MAX_ACTIVE_LOCALS, constrainedFunctions },
  };
}

export function runAliasPass(ast: luaparse.Chunk, strategy: AliasStrategy): luaparse.Chunk {
  return runAliasPasses(ast, [strategy]).ast;
}
