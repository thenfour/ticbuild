// Transforms expressions whose checker type is ticbuild.Constant<T> into Lua
// literals.
//
//   const AGE = ticbuild.MakeConstant<8>();
//   print(AGE); // emits print(8); neither MakeConstant() nor AGE exists in Lua
//
// type-directed rather than syntax-directed; constness follows the type. Re-exporting AGE or
// re-aliasing Constant<T> keeps working, while `const age = 8` is an ordinary
// TypeScript value and receives no special treatment.
//
// const AGE = ticbuild.MakeConstant<8>();
// const AGE2 = AGE; // inherits the Constant<8> type and is also replaced with 8 in Lua
// print(AGE2); // emits print(8)
// const AGE3 : number = AGE; // works; Constant is T & {brand} so it is trivially assignable to T
// const AGE4 = AGE + 1; // emits AGE4 = 8 + 1 in lua, which the minifier can fold to AGE4 = 9.
// const AGE5 = AGE + ticbuild.MakeConstant<1>(); // works-ish. emits AGE5 = 8 + 1.
//   we could add support for combining constants to form a single literal, but that reaches
// outside the intended purpose of making defines discoverable in typescript.

import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

const diagnosticCode = 190001; // arbitrary above TypeScript's built-in range
const constantBrandName = "__constantBrand";

function isNamedModuleDeclaration(node: ts.Node, name: string): node is ts.ModuleDeclaration {
  return ts.isModuleDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name;
}

// Fast path for the alias that TypeScript normally preserves. This matches a
// checker type spelled `ticbuild.Constant<8>`. A user alias such as
// `type ProjectConstant<T> = ticbuild.Constant<T>` has a different alias symbol
// and falls through to the structural brand check below.
function isTicbuildConstantAlias(symbol: ts.Symbol | undefined): boolean {
  return symbol?.name === "Constant" && symbol.declarations?.some((declaration) => {
    if (!ts.isTypeAliasDeclaration(declaration)) {
      return false;
    }
    const moduleBlock = declaration.parent;
    return ts.isModuleBlock(moduleBlock) && isNamedModuleDeclaration(moduleBlock.parent, "ticbuild");
  }) === true;
}

// Structural fallback for types which have lost the public alias spelling.
//
// Constant<T> expands to `T & { readonly [__constantBrand]: T }`. TypeScript
// keeps that brand property's original declaration when the type passes through
// aliases, exports, and imports, so `ProjectConstant<8>` still matches here.
// Plain `8`, `number`, and unrelated branded types do not have this exact
// property declaration and therefore do not match.
function isTicbuildConstantBrandDeclaration(declaration: ts.Declaration): boolean {
  if (
    !ts.isPropertySignature(declaration) ||
    !ts.isComputedPropertyName(declaration.name) ||
    !ts.isIdentifier(declaration.name.expression) ||
    declaration.name.expression.text !== constantBrandName
  ) {
    return false;
  }
  let current: ts.Node | undefined = declaration.parent;
  while (current && !ts.isSourceFile(current)) {
    if (ts.isTypeAliasDeclaration(current) && current.name.text === "Constant") {
      const moduleBlock = current.parent;
      return ts.isModuleBlock(moduleBlock) && isNamedModuleDeclaration(moduleBlock.parent, "ticbuild");
    }
    current = current.parent;
  }
  return false;
}

export function getTicbuildConstantTypeArgument(
  checker: ts.TypeChecker,
  type: ts.Type,
  location: ts.Node,
): ts.Type | undefined {
  // Prefer the alias argument because it is already the resolved T. The brand
  // path handles re-aliased/intersection types and asks the checker for the
  // instantiated property type: 8 rather than the declaration's generic T.
  if (isTicbuildConstantAlias(type.aliasSymbol) && type.aliasTypeArguments?.length === 1) {
    return type.aliasTypeArguments[0];
  }
  const property = checker.getPropertiesOfType(type).find((candidate) =>
    candidate.declarations?.some(isTicbuildConstantBrandDeclaration),
  );
  return property ? checker.getTypeOfSymbolAtLocation(property, location) : undefined;
}

export function isTicbuildConstantType(
  checker: ts.TypeChecker,
  type: ts.Type,
  location: ts.Node,
): boolean {
  return getTicbuildConstantTypeArgument(checker, type, location) !== undefined;
}

export function isTicbuildConstantNode(checker: ts.TypeChecker, node: ts.Node): boolean {
  return isTicbuildConstantType(checker, checker.getTypeAtLocation(node), node);
}

// Node checks are used while transforming expressions/import specifiers. Symbol
// checks serve the static linker and Lua declaration generator, where we have an
// exported symbol rather than the authored expression which produced its type.
export function isTicbuildConstantSymbol(checker: ts.TypeChecker, symbol: ts.Symbol, location: ts.Node): boolean {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0] ?? location;
  return isTicbuildConstantType(checker, checker.getTypeOfSymbolAtLocation(symbol, declaration), declaration);
}

function createError(node: ts.Node, messageText: string): ts.Diagnostic {
  const original = ts.getOriginalNode(node);
  return {
    file: original.getSourceFile(),
    start: original.getStart(),
    length: original.getWidth(),
    category: ts.DiagnosticCategory.Error,
    code: diagnosticCode,
    messageText,
  };
}

function isAssignmentOperator(kind: ts.SyntaxKind): boolean {
  return kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment;
}

// Matches a constant-valued child used as a destination, such as AGE in
// `AGE = value`, `AGE++`, or `delete object.CONSTANT_PROPERTY`. It does not
// match reads such as `print(AGE)`; those are safe to replace with a literal.
function isWriteTarget(node: ts.Expression): boolean {
  const parent = node.parent;
  if (ts.isBinaryExpression(parent) && parent.left === node && isAssignmentOperator(parent.operatorToken.kind)) {
    return true;
  }
  if (
    (ts.isPrefixUnaryExpression(parent) || ts.isPostfixUnaryExpression(parent)) &&
    (parent.operator === ts.SyntaxKind.PlusPlusToken || parent.operator === ts.SyntaxKind.MinusMinusToken)
  ) {
    return true;
  }
  return ts.isDeleteExpression(parent) && parent.expression === node;
}

// An assignment expression itself has the type of its assigned value. Thus the
// visitor may first see the whole
// `holder.value = ticbuild.MakeConstant<8>()` expression
// as Constant<8>, before it ever visits holder.value. Catch that outer form too.
function isWriteExpression(node: ts.Expression): boolean {
  if (ts.isBinaryExpression(node) && isAssignmentOperator(node.operatorToken.kind)) {
    return true;
  }
  return (
    (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
    (node.operator === ts.SyntaxKind.PlusPlusToken || node.operator === ts.SyntaxKind.MinusMinusToken)
  );
}

function createConstantLiteral(
  node: ts.Expression,
  typeArgument: ts.Type,
  context: tstl.TransformationContext,
): tstl.Expression {
  // Accepted: Constant<8>, Constant<"debug">, Constant<false>.
  // Rejected below: Constant<number>, Constant<boolean>, and Constant<1 | 2>.
  // Requiring one literal makes replacement unambiguous and prevents a runtime
  // choice from masquerading as a compile-time value.
  if (typeArgument.flags & ts.TypeFlags.StringLiteral) {
    return tstl.createStringLiteral((typeArgument as ts.StringLiteralType).value, node);
  }
  if (typeArgument.flags & ts.TypeFlags.NumberLiteral) {
    return tstl.createNumericLiteral((typeArgument as ts.NumberLiteralType).value, node);
  }
  if (typeArgument.flags & ts.TypeFlags.BooleanLiteral) {
    return tstl.createBooleanLiteral(context.checker.typeToString(typeArgument) === "true", node);
  }

  context.diagnostics.push(createError(
    node,
    `ticbuild.Constant<T> requires one exact string, number, or boolean literal; received ${context.checker.typeToString(typeArgument)}`,
  ));
  return tstl.createNilLiteral(node);
}

function isTicbuildFunctionDeclaration(
  declaration: ts.SignatureDeclaration | ts.JSDocSignature | undefined,
  name: string,
): boolean {
  // Resolve by declaration identity, not by callee text. An unrelated method
  // named assert_const does not match; an alias of ticbuild.assert_const does.
  if (!declaration || !ts.isFunctionDeclaration(declaration) || declaration.name?.text !== name) {
    return false;
  }
  const moduleBlock = declaration.parent;
  return ts.isModuleBlock(moduleBlock) && isNamedModuleDeclaration(moduleBlock.parent, "ticbuild");
}

function isTicbuildFunctionCall(checker: ts.TypeChecker, node: ts.CallExpression, name: string): boolean {
  return isTicbuildFunctionDeclaration(checker.getResolvedSignature(node)?.declaration, name);
}

function transformIfDefinedCall(
  node: ts.CallExpression,
  context: tstl.TransformationContext,
  definedNames: ReadonlySet<string>,
): tstl.Expression {
  const [nameExpression, whenDefined, whenMissing] = node.arguments;
  if (!nameExpression || !whenDefined || !whenMissing || node.arguments.length !== 3) {
    // TypeScript normally reports arity errors first, but keep the intrinsic
    // transform safe and intentional if it is reached with malformed input.
    context.diagnostics.push(createError(node, "ticbuild.IfDefined() requires exactly three arguments"));
    return tstl.createNilLiteral(node);
  }

  // Accept expressions whose checker type is one exact string literal, not
  // merely direct string syntax. Thus both IfDefined("DEBUG", ...) and a
  // `const DEFINE_NAME = "DEBUG"` argument work, while a runtime string or a
  // union such as "DEBUG" | "RELEASE" is rejected.
  const nameType = context.checker.getTypeAtLocation(nameExpression);
  if (!(nameType.flags & ts.TypeFlags.StringLiteral)) {
    context.diagnostics.push(createError(
      nameExpression,
      `ticbuild.IfDefined() requires one exact string literal define name; received ${context.checker.typeToString(nameType)}`,
    ));
    return tstl.createNilLiteral(node);
  }

  const name = (nameType as ts.StringLiteralType).value;
  const selectedExpression = definedNames.has(name) ? whenDefined : whenMissing;

  // IfDefined is a compile-time conditional rather than a normal eager
  // function call. Transforming only the selected child means, for example,
  // IfDefined("DEBUG", debugValue(), releaseValue()) emits exactly one call.
  // Re-enter plugin dispatch so a selected Constant<T> is still inlined.
  return context.transformExpression(selectedExpression);
}

function transformConstantExpression(
  node: ts.Expression,
  context: tstl.TransformationContext,
  definedNames: ReadonlySet<string>,
): tstl.Expression {
  if (ts.isCallExpression(node) && isTicbuildFunctionCall(context.checker, node, "IfDefined")) {
    return transformIfDefinedCall(node, context, definedNames);
  }

  // `ticbuild.assert_const(AGE);` is handled and erased by the statement visitor.
  // Using it as a value, such as `const x = assert_const(AGE)`, is nonsensical
  // because no runtime function exists, so diagnose that form explicitly.
  if (ts.isCallExpression(node) && isTicbuildFunctionCall(context.checker, node, "assert_const")) {
    context.diagnostics.push(createError(node, "ticbuild.assert_const() may only be used as a standalone statement"));
    return tstl.createNilLiteral(node);
  }

  const typeArgument = getTicbuildConstantTypeArgument(
    context.checker,
    context.checker.getTypeAtLocation(node),
    node,
  );
  if (!typeArgument) {
    // Example: the outer `AGE + 1` has type number, so normal TSTL handling
    // continues; its inner AGE identifier is visited separately and becomes 8.
    return context.superTransformExpression(node);
  }
  if (isWriteTarget(node) || isWriteExpression(node)) {
    context.diagnostics.push(createError(node, "A ticbuild.Constant value cannot be used as an assignment target"));
    return context.superTransformExpression(node);
  }
  // This replaces the entire subtree. If `getAge()` returns Constant<8>, the
  // emitted expression is 8 and getAge() is intentionally never evaluated.
  return createConstantLiteral(node, typeArgument, context);
}

// Some constructs are erased without recursively transforming their children.
// Validate their Constant<T> first so, for example, an unused
// `const BAD = MakeConstant<number>()` still receives the broad-type diagnostic.
function validateConstantType(node: ts.Node, context: tstl.TransformationContext): void {
  const typeArgument = getTicbuildConstantTypeArgument(
    context.checker,
    context.checker.getTypeAtLocation(node),
    node,
  );
  if (typeArgument) {
    createConstantLiteral(node as ts.Expression, typeArgument, context);
  }
}

function transformVariableStatement(
  node: ts.VariableStatement,
  context: tstl.TransformationContext,
): tstl.Statement[] {
  //   const AGE = ticbuild.MakeConstant<8>();       -> no Lua declaration
  //   const AGE = ticbuild.MakeConstant<8>(), x=1; -> TSTL receives only x
  //   let AGE = ticbuild.MakeConstant<8>();         -> immutable diagnostic
  const constantDeclarations = node.declarationList.declarations.filter((declaration) =>
    isTicbuildConstantNode(context.checker, declaration.name),
  );
  if (constantDeclarations.length === 0) {
    return context.superTransformStatements(node);
  }

  for (const declaration of constantDeclarations) {
    validateConstantType(declaration.name, context);
    if ((node.declarationList.flags & ts.NodeFlags.Const) === 0) {
      context.diagnostics.push(createError(declaration.name, "A ticbuild.Constant binding must be declared with const"));
    }
  }

  const constants = new Set(constantDeclarations);
  const runtimeDeclarations = node.declarationList.declarations.filter((declaration) => !constants.has(declaration));
  if (runtimeDeclarations.length === 0) {
    return [];
  }

  const declarationList = ts.factory.updateVariableDeclarationList(node.declarationList, runtimeDeclarations);
  const runtimeStatement = ts.factory.updateVariableStatement(node, node.modifiers, declarationList);
  return context.superTransformStatements(runtimeStatement);
}

function transformImportDeclaration(
  node: ts.ImportDeclaration,
  context: tstl.TransformationContext,
): tstl.Statement[] {
  //   import { AGE } from "./features";          -> removed completely
  //   import { AGE, run } from "./features";     -> rewritten to import only run
  //   import "./features";                       -> unchanged (explicit side effect)
  //
  // The static linker uses the same type test when building its module graph,
  // so removing the last runtime binding also removes the corresponding require.
  const clause = node.importClause;
  if (!clause?.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
    return context.superTransformStatements(node);
  }
  const runtimeElements = clause.namedBindings.elements.filter((element) =>
    !isTicbuildConstantNode(context.checker, element.name),
  );
  if (runtimeElements.length === clause.namedBindings.elements.length) {
    return context.superTransformStatements(node);
  }
  if (runtimeElements.every((element) => element.isTypeOnly)) {
    return [];
  }

  const namedBindings = ts.factory.updateNamedImports(clause.namedBindings, runtimeElements);
  const importClause = ts.factory.updateImportClause(clause, clause.isTypeOnly, clause.name, namedBindings);
  const runtimeImport = ts.factory.updateImportDeclaration(
    node,
    node.modifiers,
    importClause,
    node.moduleSpecifier,
    node.attributes,
  );
  return context.superTransformStatements(runtimeImport);
}

function transformExportDeclaration(
  node: ts.ExportDeclaration,
  context: tstl.TransformationContext,
): tstl.Statement[] {
  // Mirrors import filtering for `export { AGE, run }`: AGE is a type-time edge
  // and run remains a Lua export. The declaration emitter still sees the
  // original TypeScript and can publish AGE as Constant<8> to other TS assets.
  if (!node.exportClause || !ts.isNamedExports(node.exportClause)) {
    return context.superTransformStatements(node);
  }
  const runtimeElements = node.exportClause.elements.filter((element) =>
    !isTicbuildConstantNode(context.checker, element.name),
  );
  if (runtimeElements.length === node.exportClause.elements.length) {
    return context.superTransformStatements(node);
  }
  if (runtimeElements.every((element) => element.isTypeOnly)) {
    return [];
  }

  const exportClause = ts.factory.updateNamedExports(node.exportClause, runtimeElements);
  const runtimeExport = ts.factory.updateExportDeclaration(
    node,
    node.modifiers,
    node.isTypeOnly,
    exportClause,
    node.moduleSpecifier,
    node.attributes,
  );
  return context.superTransformStatements(runtimeExport);
}

function transformExpressionStatement(
  node: ts.ExpressionStatement,
  context: tstl.TransformationContext,
): tstl.Statement[] {
  // Standalone `ticbuild.assert_const(AGE);` is purely a TypeScript check. A
  // non-Constant argument is rejected by TypeScript's signature; a broad
  // Constant<number> is rejected by validateConstantType(). Nothing is emitted.
  if (!ts.isCallExpression(node.expression) || !isTicbuildFunctionCall(context.checker, node.expression, "assert_const")) {
    return context.superTransformStatements(node);
  }
  const argument = node.expression.arguments[0];
  if (argument) {
    validateConstantType(argument, context);
  }
  return [];
}

// TSTL dispatches visitors by exact SyntaxKind; there is no catch-all expression
// visitor. Register every expression form which can carry a branded result--for
// example an identifier, property access, call, assertion, or conditional.
// Ordinary literal nodes do not need interception: `8` alone is not branded,
// while `value as Constant<8>` is caught at the outer AsExpression.
const constantExpressionKinds: readonly ts.SyntaxKind[] = [
  ts.SyntaxKind.Identifier,
  ts.SyntaxKind.ThisKeyword,
  ts.SyntaxKind.ArrayLiteralExpression,
  ts.SyntaxKind.ObjectLiteralExpression,
  ts.SyntaxKind.PropertyAccessExpression,
  ts.SyntaxKind.ElementAccessExpression,
  ts.SyntaxKind.CallExpression,
  ts.SyntaxKind.NewExpression,
  ts.SyntaxKind.TaggedTemplateExpression,
  ts.SyntaxKind.TypeAssertionExpression,
  ts.SyntaxKind.ParenthesizedExpression,
  ts.SyntaxKind.FunctionExpression,
  ts.SyntaxKind.ArrowFunction,
  ts.SyntaxKind.DeleteExpression,
  ts.SyntaxKind.TypeOfExpression,
  ts.SyntaxKind.VoidExpression,
  ts.SyntaxKind.AwaitExpression,
  ts.SyntaxKind.PrefixUnaryExpression,
  ts.SyntaxKind.PostfixUnaryExpression,
  ts.SyntaxKind.BinaryExpression,
  ts.SyntaxKind.ConditionalExpression,
  ts.SyntaxKind.TemplateExpression,
  ts.SyntaxKind.YieldExpression,
  ts.SyntaxKind.SpreadElement,
  ts.SyntaxKind.ClassExpression,
  ts.SyntaxKind.AsExpression,
  ts.SyntaxKind.NonNullExpression,
  ts.SyntaxKind.SatisfiesExpression,
];

export function createTypeScriptConstantPlugin(definedNames: ReadonlySet<string>): tstl.Plugin {
  const visitors: tstl.Visitors = {
    [ts.SyntaxKind.VariableStatement]: { transform: transformVariableStatement, priority: 100 },
    [ts.SyntaxKind.ImportDeclaration]: { transform: transformImportDeclaration, priority: 100 },
    [ts.SyntaxKind.ExportDeclaration]: { transform: transformExportDeclaration, priority: 100 },
    [ts.SyntaxKind.ExpressionStatement]: { transform: transformExpressionStatement, priority: 100 },
  };
  for (const kind of constantExpressionKinds) {
    // Run before TSTL's stock visitors so this acts in the spirit of a preprocessor
    (visitors as Record<number, tstl.ObjectVisitor<ts.Expression>>)[kind] = {
      transform: (node, context) => transformConstantExpression(node, context, definedNames),
      priority: 100,
    };
  }
  return { visitors };
}
