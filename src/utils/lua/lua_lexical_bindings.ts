import * as luaparse from "luaparse";

export type LuaLocalBinding = {
  readonly declaration: luaparse.Identifier;
  readonly reads: luaparse.Identifier[];
  readonly readOccurrences: LuaBindingOccurrence[];
  readonly directConditionReads: Array<{
    readonly identifier: luaparse.Identifier;
    readonly kind: "if" | "while" | "repeat";
  }>;
  readonly writes: luaparse.Identifier[];
  readonly writeOccurrences: LuaBindingOccurrence[];
};

export type LuaBindingOccurrence = {
  readonly identifier: luaparse.Identifier;
  // Stable syntax traversal order, not an execution-order or reachability claim.
  readonly traversalOrder: number;
  readonly statement: luaparse.Statement;
  readonly block: readonly luaparse.Statement[];
  readonly functionOwner: luaparse.FunctionDeclaration | null;
};

export type LuaLexicalBindingAnalysis = {
  readonly bindings: readonly LuaLocalBinding[];
  readonly bindingByIdentifier: ReadonlyMap<luaparse.Identifier, LuaLocalBinding>;
};

class BindingScope {
  private readonly bindings = new Map<string, LuaLocalBinding>();

  constructor(private readonly parent?: BindingScope) {}

  createChild(): BindingScope {
    return new BindingScope(this);
  }

  define(identifier: luaparse.Identifier): LuaLocalBinding {
    const binding: LuaLocalBinding = {
      declaration: identifier,
      reads: [],
      readOccurrences: [],
      directConditionReads: [],
      writes: [],
      writeOccurrences: [],
    };
    this.bindings.set(identifier.name, binding);
    return binding;
  }

  lookup(name: string): LuaLocalBinding | undefined {
    return this.bindings.get(name) ?? this.parent?.lookup(name);
  }
}

export function analyzeLuaLexicalBindings(ast: luaparse.Chunk): LuaLexicalBindingAnalysis {
  const bindings: LuaLocalBinding[] = [];
  const bindingByIdentifier = new Map<luaparse.Identifier, LuaLocalBinding>();
  let occurrenceOrder = 0;
  let currentStatement: luaparse.Statement | null = null;
  let currentBlock: readonly luaparse.Statement[] = ast.body;
  let currentFunction: luaparse.FunctionDeclaration | null = null;

  function occurrence(identifier: luaparse.Identifier): LuaBindingOccurrence {
    if (!currentStatement) throw new Error("Lua binding occurrence found outside a statement");
    return {
      identifier,
      traversalOrder: occurrenceOrder++,
      statement: currentStatement,
      block: currentBlock,
      functionOwner: currentFunction,
    };
  }

  function define(scope: BindingScope, identifier: luaparse.Identifier): LuaLocalBinding {
    const binding = scope.define(identifier);
    bindings.push(binding);
    bindingByIdentifier.set(identifier, binding);
    return binding;
  }

  function read(
    scope: BindingScope,
    identifier: luaparse.Identifier,
    conditionKind?: "if" | "while" | "repeat",
  ): void {
    const binding = scope.lookup(identifier.name);
    if (!binding) return;
    binding.reads.push(identifier);
    binding.readOccurrences.push(occurrence(identifier));
    if (conditionKind) binding.directConditionReads.push({ identifier, kind: conditionKind });
    bindingByIdentifier.set(identifier, binding);
  }

  function write(scope: BindingScope, identifier: luaparse.Identifier): void {
    const binding = scope.lookup(identifier.name);
    if (!binding) return;
    binding.writes.push(identifier);
    binding.writeOccurrences.push(occurrence(identifier));
    bindingByIdentifier.set(identifier, binding);
  }

  function visitExpression(
    expression: luaparse.Expression,
    scope: BindingScope,
    conditionKind?: "if" | "while" | "repeat",
  ): void {
    switch (expression.type) {
      case "Identifier":
        read(scope, expression, conditionKind);
        break;
      case "FunctionDeclaration":
        visitFunctionBody(expression, scope);
        break;
      case "TableConstructorExpression":
        for (const field of expression.fields) {
          if (field.type === "TableKey") visitExpression(field.key, scope, conditionKind);
          // A TableKeyString key is field-name syntax, not a variable read.
          visitExpression(field.value, scope, conditionKind);
        }
        break;
      case "UnaryExpression":
        visitExpression(expression.argument, scope, conditionKind);
        break;
      case "BinaryExpression":
      case "LogicalExpression":
        visitExpression(expression.left, scope, conditionKind);
        visitExpression(expression.right, scope, conditionKind);
        break;
      case "MemberExpression":
        // The member identifier is field-name syntax; only its base is evaluated.
        visitExpression(expression.base, scope, conditionKind);
        break;
      case "IndexExpression":
        visitExpression(expression.base, scope, conditionKind);
        visitExpression(expression.index, scope, conditionKind);
        break;
      case "CallExpression":
        visitExpression(expression.base, scope, conditionKind);
        expression.arguments.forEach((argument) => visitExpression(argument, scope, conditionKind));
        break;
      case "TableCallExpression":
        visitExpression(expression.base, scope, conditionKind);
        visitExpression(expression.arguments, scope, conditionKind);
        break;
      case "StringCallExpression":
        visitExpression(expression.base, scope, conditionKind);
        visitExpression(expression.argument, scope, conditionKind);
        break;
      default:
        break;
    }
  }

  function visitAssignmentTarget(
    target: luaparse.Identifier | luaparse.MemberExpression | luaparse.IndexExpression,
    scope: BindingScope,
  ): void {
    if (target.type === "Identifier") {
      write(scope, target);
    } else if (target.type === "MemberExpression") {
      visitExpression(target.base, scope);
    } else {
      visitExpression(target.base, scope);
      visitExpression(target.index, scope);
    }
  }

  function visitFunctionBody(fn: luaparse.FunctionDeclaration, outerScope: BindingScope): void {
    const functionScope = outerScope.createChild();
    const previousFunction = currentFunction;
    const previousBlock = currentBlock;
    currentFunction = fn;
    currentBlock = fn.body;
    if (fn.identifier?.type === "MemberExpression" && fn.identifier.indexer === ":") {
      // `function value:method()` has an implicit local `self` parameter which
      // luaparse does not include in the function's parameters array.
      define(functionScope, { type: "Identifier", name: "self" });
    }
    for (const parameter of fn.parameters) {
      if (parameter.type === "Identifier") define(functionScope, parameter);
    }
    visitBlock(fn.body, functionScope);
    currentBlock = previousBlock;
    currentFunction = previousFunction;
  }

  function visitStatement(statement: luaparse.Statement, scope: BindingScope): void {
    switch (statement.type) {
      case "LocalStatement":
        // Lua evaluates every initializer before any binding becomes visible.
        statement.init.forEach((initializer) => visitExpression(initializer, scope));
        statement.variables.forEach((variable) => define(scope, variable));
        break;
      case "AssignmentStatement":
        statement.variables.forEach((target) => visitAssignmentTarget(target, scope));
        statement.init.forEach((initializer) => visitExpression(initializer, scope));
        break;
      case "CallStatement":
        visitExpression(statement.expression, scope);
        break;
      case "ReturnStatement":
        statement.arguments.forEach((argument) => visitExpression(argument, scope));
        break;
      case "IfStatement":
        for (const clause of statement.clauses) {
          if (clause.type !== "ElseClause") {
            visitExpression(
              clause.condition,
              scope,
              clause.condition.type === "Identifier" ? "if" : undefined,
            );
          }
          visitBlock(clause.body, scope.createChild());
        }
        break;
      case "WhileStatement":
        visitExpression(
          statement.condition,
          scope,
          statement.condition.type === "Identifier" ? "while" : undefined,
        );
        visitBlock(statement.body, scope.createChild());
        break;
      case "RepeatStatement": {
        // Repeat-body locals remain visible to its until condition.
        const repeatScope = scope.createChild();
        visitBlock(statement.body, repeatScope);
        visitExpression(
          statement.condition,
          repeatScope,
          statement.condition.type === "Identifier" ? "repeat" : undefined,
        );
        break;
      }
      case "DoStatement":
        visitBlock(statement.body, scope.createChild());
        break;
      case "ForNumericStatement": {
        visitExpression(statement.start, scope);
        visitExpression(statement.end, scope);
        if (statement.step) visitExpression(statement.step, scope);
        const forScope = scope.createChild();
        define(forScope, statement.variable);
        visitBlock(statement.body, forScope);
        break;
      }
      case "ForGenericStatement": {
        statement.iterators.forEach((iterator) => visitExpression(iterator, scope));
        const forScope = scope.createChild();
        statement.variables.forEach((variable) => define(forScope, variable));
        visitBlock(statement.body, forScope);
        break;
      }
      case "FunctionDeclaration":
        if (statement.isLocal && statement.identifier?.type === "Identifier") {
          // Local function syntax introduces its name before the body for recursion.
          define(scope, statement.identifier);
        } else if (statement.identifier) {
          visitAssignmentTarget(statement.identifier, scope);
        }
        visitFunctionBody(statement, scope);
        break;
      default:
        break;
    }
  }

  function visitBlock(body: readonly luaparse.Statement[], scope: BindingScope): void {
    const previousBlock = currentBlock;
    const previousStatement = currentStatement;
    currentBlock = body;
    body.forEach((statement) => {
      currentStatement = statement;
      visitStatement(statement, scope);
    });
    currentStatement = previousStatement;
    currentBlock = previousBlock;
  }

  visitBlock(ast.body, new BindingScope());
  return { bindings, bindingByIdentifier };
}
