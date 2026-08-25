import * as luaparse from "luaparse";
import { isIdentifier } from "./lua_ast";
import { collectNamesUnavailableToLocalRenaming, LuaSymbolAllocator } from "./lua_symbols";

type RenameBinding = {
  declaration: luaparse.Identifier;
  references: luaparse.Identifier[];
  conflicts: Set<RenameBinding>;
  order: number;
  newName?: string;
};

class RenameBindingScope {
  private readonly bindingsByName = new Map<string, RenameBinding>();
  private readonly localBindings: RenameBinding[] = [];

  constructor(private readonly parent: RenameBindingScope | null = null) {}

  createChild(): RenameBindingScope {
    return new RenameBindingScope(this);
  }

  define(identifier: luaparse.Identifier, order: number): RenameBinding {
    const binding: RenameBinding = {
      declaration: identifier,
      references: [],
      conflicts: new Set<RenameBinding>(),
      order,
    };
    // Active lexical bindings cannot share an emitted spelling without
    // risking shadowing or capture. Sibling scopes never enter this set.
    this.forEachActiveBinding(activeBinding => {
      binding.conflicts.add(activeBinding);
      activeBinding.conflicts.add(binding);
    });
    this.localBindings.push(binding);
    this.bindingsByName.set(identifier.name, binding);
    return binding;
  }

  reference(identifier: luaparse.Identifier): void {
    this.lookup(identifier.name)?.references.push(identifier);
  }

  private lookup(name: string): RenameBinding | undefined {
    return this.bindingsByName.get(name) ?? this.parent?.lookup(name);
  }

  private forEachActiveBinding(visitor: (binding: RenameBinding) => void): void {
    this.parent?.forEachActiveBinding(visitor);
    this.localBindings.forEach(visitor);
  }
}

export function renameLocalVariablesInAST(ast: luaparse.Chunk): luaparse.Chunk {
  const bindings: RenameBinding[] = [];

  function define(identifier: luaparse.Identifier, scope: RenameBindingScope): void {
    bindings.push(scope.define(identifier, bindings.length));
  }

  function processScope(body: luaparse.Statement[], scope: RenameBindingScope): void {
    body.forEach(stmt => processStatement(stmt, scope));
  }

  function processStatement(node: any, scope: RenameBindingScope): void {
    if (!node) return;

    switch (node.type) {
      case "LocalStatement":
        node.init?.forEach((expr: any) => processExpression(expr, scope));
        node.variables.forEach((variable: any) => {
          if (isIdentifier(variable)) define(variable, scope);
        });
        return;

      case "FunctionDeclaration": {
        if (node.isLocal && isIdentifier(node.identifier)) {
          define(node.identifier, scope);
        } else if (node.identifier) {
          processExpression(node.identifier, scope);
        }

        const functionScope = scope.createChild();
        node.parameters.forEach((parameter: any) => {
          if (isIdentifier(parameter)) define(parameter, functionScope);
        });
        processScope(node.body, functionScope);
        return;
      }

      case "ForNumericStatement": {
        processExpression(node.start, scope);
        processExpression(node.end, scope);
        if (node.step) processExpression(node.step, scope);

        const forScope = scope.createChild();
        if (isIdentifier(node.variable)) define(node.variable, forScope);
        processScope(node.body, forScope);
        return;
      }

      case "ForGenericStatement": {
        node.iterators.forEach((iterator: any) => processExpression(iterator, scope));
        const forScope = scope.createChild();
        node.variables.forEach((variable: any) => {
          if (isIdentifier(variable)) define(variable, forScope);
        });
        processScope(node.body, forScope);
        return;
      }

      case "DoStatement":
        processScope(node.body, scope.createChild());
        return;

      case "WhileStatement":
        processExpression(node.condition, scope);
        processScope(node.body, scope.createChild());
        return;

      case "RepeatStatement": {
        const repeatScope = scope.createChild();
        processScope(node.body, repeatScope);
        processExpression(node.condition, repeatScope);
        return;
      }

      case "IfStatement":
        node.clauses.forEach((clause: any) => {
          if (clause.condition) processExpression(clause.condition, scope);
          processScope(clause.body, scope.createChild());
        });
        return;

      case "ReturnStatement":
        node.arguments.forEach((argument: any) => processExpression(argument, scope));
        return;

      case "AssignmentStatement":
        node.variables.forEach((variable: any) => processExpression(variable, scope));
        node.init.forEach((expr: any) => processExpression(expr, scope));
        return;

      case "CallStatement":
        processExpression(node.expression, scope);
        return;

      default:
        return;
    }
  }

  function processExpression(node: any, scope: RenameBindingScope): void {
    if (!node) return;

    switch (node.type) {
      case "Identifier":
        scope.reference(node);
        return;

      case "FunctionDeclaration": {
        const functionScope = scope.createChild();
        node.parameters.forEach((parameter: any) => {
          if (isIdentifier(parameter)) define(parameter, functionScope);
        });
        processScope(node.body, functionScope);
        return;
      }

      case "TableConstructorExpression":
        node.fields.forEach((field: any) => {
          if (field.type === "TableKey") processExpression(field.key, scope);
          processExpression(field.value, scope);
        });
        return;

      case "BinaryExpression":
      case "LogicalExpression":
        processExpression(node.left, scope);
        processExpression(node.right, scope);
        return;

      case "UnaryExpression":
        processExpression(node.argument, scope);
        return;

      case "MemberExpression":
        processExpression(node.base, scope);
        return;

      case "IndexExpression":
        processExpression(node.base, scope);
        processExpression(node.index, scope);
        return;

      case "CallExpression":
        processExpression(node.base, scope);
        node.arguments.forEach((argument: any) => processExpression(argument, scope));
        return;

      case "TableCallExpression":
        processExpression(node.base, scope);
        processExpression(node.arguments, scope);
        return;

      case "StringCallExpression":
        processExpression(node.base, scope);
        processExpression(node.argument, scope);
        return;

      default:
        return;
    }
  }

  processScope(ast.body, new RenameBindingScope());

  const unavailableNames = collectNamesUnavailableToLocalRenaming(ast);
  // Weighted graph coloring: frequent bindings choose first, while each
  // binding reserves only names already used by bindings it can overlap.
  [...bindings]
    .sort((a, b) => b.references.length - a.references.length || a.order - b.order)
    .forEach(binding => {
      const reservedNames = new Set(unavailableNames);
      binding.conflicts.forEach(conflict => {
        if (conflict.newName) reservedNames.add(conflict.newName);
      });
      binding.newName = new LuaSymbolAllocator({ reservedNames }).allocate();
    });

  bindings.forEach(binding => {
    binding.declaration.name = binding.newName!;
    binding.references.forEach(reference => {
      reference.name = binding.newName!;
    });
  });

  return ast;
}
