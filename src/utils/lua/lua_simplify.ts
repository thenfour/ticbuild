import * as luaparse from "luaparse";
import { inheritLuaNodeOrigin } from "./lua_ast_provenance";
import type { LuaOptimizationRule } from "./lua_optimizer_types";
import {LiteralNode, StringLiteralNode, stringValue} from "./lua_utils";


type ConstEnv = Map<string, LiteralNode>;

type PropScope = {
   env: ConstEnv; locals: Set<string>;
};

type SimplificationState = { changed: boolean };

function trackReplacement<T>(before: T, after: T, state: SimplificationState): T {
   if (before !== after)
      state.changed = true;
   return after;
}

function trackArrayReplacements<T>(before: readonly T[], after: T[], state: SimplificationState): T[] {
   if (before.length !== after.length || before.some((value, index) => value !== after[index]))
      state.changed = true;
   return after;
}

// Collect identifiers that are written/introduced within a statement.
// We only track plain identifiers (not table fields) because we propagate
// only plain locals; member/index writes are treated conservatively later.
function collectWrites(stmt: luaparse.Statement, out: Set<string>): void {
   switch (stmt.type) {
      case "LocalStatement": {
         stmt.variables.forEach(v => {
            if (v.type === "Identifier")
               out.add(v.name);
         });
         break;
      }

      case "AssignmentStatement": {
         stmt.variables.forEach(v => {
            if (v.type === "Identifier")
               out.add(v.name);
         });
         break;
      }

      case "ForNumericStatement": {
         if (stmt.variable.type === "Identifier")
            out.add(stmt.variable.name);
         stmt.body.forEach(s => collectWrites(s, out));
         break;
      }

      case "ForGenericStatement": {
         stmt.variables.forEach(v => {
            if (v.type === "Identifier")
               out.add(v.name);
         });
         stmt.body.forEach(s => collectWrites(s, out));
         break;
      }

      case "WhileStatement":
      case "RepeatStatement":
      case "IfStatement":
      case "DoStatement":
      case "FunctionDeclaration": {
         // Recurse into bodies/clauses to collect inner writes.
         const bodies: luaparse.Statement[][] = [];
         if (stmt.type === "WhileStatement" || stmt.type === "DoStatement") {
            bodies.push(stmt.body);
         } else if (stmt.type === "RepeatStatement") {
            bodies.push(stmt.body);
         } else if (stmt.type === "IfStatement") {
            stmt.clauses.forEach(c => bodies.push(c.body));
         } else if (stmt.type === "FunctionDeclaration") {
            bodies.push(stmt.body);
         }
         bodies.forEach(b => b.forEach(s => collectWrites(s, out)));
         break;
      }

      default:
         break;
   }
}

function collectBlockWrites(body: luaparse.Statement[]): Set<string> {
   const writes = new Set<string>();
   body.forEach(stmt => collectWrites(stmt, writes));
   return writes;
}

function cloneScope(scope: PropScope): PropScope {
   return {env: new Map(scope.env), locals: new Set(scope.locals)};
}

function freshScope(): PropScope {
   return {env: new Map(), locals: new Set()};
}

function makeNumericLiteral(value: number, source: luaparse.Node): luaparse.NumericLiteral {
   return inheritLuaNodeOrigin({type: "NumericLiteral", value, raw: String(value)}, source);
}

function makeBooleanLiteral(value: boolean, source: luaparse.Node): luaparse.BooleanLiteral {
   return inheritLuaNodeOrigin({type: "BooleanLiteral", value, raw: value ? "true" : "false"}, source);
}

function makeStringLiteral(value: string, source: luaparse.Node): StringLiteralNode {
   return inheritLuaNodeOrigin({type: "StringLiteral", value, raw: JSON.stringify(value)}, source) as StringLiteralNode;
}

function makeNilLiteral(source: luaparse.Node): luaparse.NilLiteral {
   return inheritLuaNodeOrigin({type: "NilLiteral", value: null, raw: "nil"}, source);
}

function cloneLiteral(lit: LiteralNode, source: luaparse.Node = lit): LiteralNode {
   let clone: LiteralNode;
   switch (lit.type) {
      case "NumericLiteral":
         clone = {...lit};
         break;
      case "BooleanLiteral":
         clone = {...lit};
         break;
      case "NilLiteral":
         clone = {...lit};
         break;
      case "StringLiteral": {
         const str = lit as StringLiteralNode;
         clone = {type: "StringLiteral", value: str.value, raw: str.raw};
         break;
      }
      default:
         return lit;
   }
   return inheritLuaNodeOrigin(clone, source) as LiteralNode;
}

function isLiteral(expr: luaparse.Expression|null|undefined): expr is LiteralNode {
   if (!expr)
      return false;
   switch (expr.type) {
      case "NumericLiteral":
      case "BooleanLiteral":
      case "NilLiteral":
      case "StringLiteral":
         return true;
      default:
         return false;
   }
}

function missingInitDefaultsToNil(init: luaparse.Expression[]|undefined): boolean {
   if (!init || init.length === 0)
      return true;
   const last = init[init.length - 1];
   return last.type !== "CallExpression" && last.type !== "TableCallExpression" &&
      last.type !== "StringCallExpression" && last.type !== "VarargLiteral";
}

function literalEquals(a: LiteralNode, b: LiteralNode): boolean {
   if (a.type === "NilLiteral")
      return b.type === "NilLiteral";
   if (a.type === "BooleanLiteral" && b.type === "BooleanLiteral")
      return a.value === b.value;
   if (a.type === "NumericLiteral" && b.type === "NumericLiteral")
      return a.value === b.value;
   if (a.type === "StringLiteral" && b.type === "StringLiteral")
      return stringValue(a as StringLiteralNode) === stringValue(b as StringLiteralNode);
   return false;
}

function isTruthy(lit: LiteralNode): boolean {
   if (lit.type === "NilLiteral")
      return false;
   if (lit.type === "BooleanLiteral" && lit.value === false)
      return false;
   return true;
}

function toNumber(expr: LiteralNode): number|null {
   return expr.type === "NumericLiteral" ? expr.value : null;
}

function toStringLiteral(expr: LiteralNode): StringLiteralNode|null {
   return expr.type === "StringLiteral" ? (expr as StringLiteralNode) : null;
}

function foldBinary(
   operator: string,
   left: LiteralNode,
   right: LiteralNode,
   source: luaparse.Node,
): LiteralNode|null {
   switch (operator) {
      case "+": {
         const a = toNumber(left);
         const b = toNumber(right);
         if (a == null || b == null)
            return null;
         return makeNumericLiteral(a + b, source);
      }
      case "-": {
         const a = toNumber(left);
         const b = toNumber(right);
         if (a == null || b == null)
            return null;
         return makeNumericLiteral(a - b, source);
      }
      case "*": {
         const a = toNumber(left);
         const b = toNumber(right);
         if (a == null || b == null)
            return null;
         return makeNumericLiteral(a * b, source);
      }
      case "/": {
         const a = toNumber(left);
         const b = toNumber(right);
         if (a == null || b == null)
            return null;
         return makeNumericLiteral(a / b, source);
      }
      case "//": {
         const a = toNumber(left);
         const b = toNumber(right);
         if (a == null || b == null)
            return null;
         return makeNumericLiteral(Math.floor(a / b), source);
      }
      case "%": {
         const a = toNumber(left);
         const b = toNumber(right);
         if (a == null || b == null)
            return null;
         return makeNumericLiteral(a - Math.floor(a / b) * b, source);
      }
      case "^": {
         const a = toNumber(left);
         const b = toNumber(right);
         if (a == null || b == null)
            return null;
         return makeNumericLiteral(Math.pow(a, b), source);
      }
      case "..": {
         const s1 = toStringLiteral(left);
         const s2 = toStringLiteral(right);
         if (!s1 || !s2)
            return null;
         const v1 = stringValue(s1);
         const v2 = stringValue(s2);
         if (v1 == null || v2 == null)
            return null;
         return makeStringLiteral(v1 + v2, source);
      }
      case "==":
         return makeBooleanLiteral(literalEquals(left, right), source);
      case "~=":
         return makeBooleanLiteral(!literalEquals(left, right), source);
      case "<": {
         const a = toNumber(left);
         const b = toNumber(right);
         if (a == null || b == null)
            return null;
         return makeBooleanLiteral(a < b, source);
      }
      case "<=": {
         const a = toNumber(left);
         const b = toNumber(right);
         if (a == null || b == null)
            return null;
         return makeBooleanLiteral(a <= b, source);
      }
      case ">": {
         const a = toNumber(left);
         const b = toNumber(right);
         if (a == null || b == null)
            return null;
         return makeBooleanLiteral(a > b, source);
      }
      case ">=": {
         const a = toNumber(left);
         const b = toNumber(right);
         if (a == null || b == null)
            return null;
         return makeBooleanLiteral(a >= b, source);
      }
      default:
         return null;
   }
}

function simplifyExpression(
   expr: luaparse.Expression,
   scope: PropScope,
   state: SimplificationState,
): luaparse.Expression {
   switch (expr.type) {
      case "Identifier": {
         const replacement = scope.env.get(expr.name);
         return replacement ? cloneLiteral(replacement, expr) : expr;
      }

      case "UnaryExpression": {
         expr.argument = trackReplacement(expr.argument, simplifyExpression(expr.argument, scope, state), state);
         if (isLiteral(expr.argument)) {
            if (expr.operator === "-") {
               const n = toNumber(expr.argument);
               if (n != null)
                  return makeNumericLiteral(-n, expr);
            } else if (expr.operator === "not") {
               return makeBooleanLiteral(!isTruthy(expr.argument), expr);
            }
         }
         return expr;
      }

      case "BinaryExpression": {
         expr.left = trackReplacement(expr.left, simplifyExpression(expr.left, scope, state), state);
         expr.right = trackReplacement(expr.right, simplifyExpression(expr.right, scope, state), state);
         if (isLiteral(expr.left) && isLiteral(expr.right)) {
            const folded = foldBinary(expr.operator, expr.left, expr.right, expr);
            if (folded)
               return folded;
         }
         return expr;
      }

      case "LogicalExpression": {
         expr.left = trackReplacement(expr.left, simplifyExpression(expr.left, scope, state), state);
         if (isLiteral(expr.left)) {
            if (expr.operator === "and") {
               if (!isTruthy(expr.left))
                  return cloneLiteral(expr.left, expr);
               expr.right = trackReplacement(expr.right, simplifyExpression(expr.right, scope, state), state);
               return expr.right;
            } else if (expr.operator === "or") {
               if (isTruthy(expr.left))
                  return cloneLiteral(expr.left, expr);
               expr.right = trackReplacement(expr.right, simplifyExpression(expr.right, scope, state), state);
               return expr.right;
            }
         }
         expr.right = trackReplacement(expr.right, simplifyExpression(expr.right, scope, state), state);
         if (isLiteral(expr.left) && isLiteral(expr.right)) {
            const result = expr.operator === "and" ? (isTruthy(expr.left) ? expr.right : expr.left) :
                                                     (isTruthy(expr.left) ? expr.left : expr.right);
            return isLiteral(result) ? cloneLiteral(result, expr) : result;
         }
         return expr;
      }

      case "CallExpression": {
         expr.base = trackReplacement(expr.base, simplifyExpression(expr.base, scope, state), state);
         expr.arguments = trackArrayReplacements(
            expr.arguments,
            expr.arguments.map(arg => simplifyExpression(arg, scope, state)),
            state,
         );
         return expr;
      }

      case "TableCallExpression": {
         expr.base = trackReplacement(expr.base, simplifyExpression(expr.base, scope, state), state);
         expr.arguments = trackReplacement(
            expr.arguments,
            simplifyExpression(expr.arguments, scope, state) as luaparse.TableConstructorExpression,
            state,
         );
         return expr;
      }

      case "StringCallExpression": {
         expr.base = trackReplacement(expr.base, simplifyExpression(expr.base, scope, state), state);
         return expr;
      }

      case "MemberExpression": {
         expr.base = trackReplacement(expr.base, simplifyExpression(expr.base, scope, state), state);
         return expr;
      }

      case "IndexExpression": {
         expr.base = trackReplacement(expr.base, simplifyExpression(expr.base, scope, state), state);
         expr.index = trackReplacement(expr.index, simplifyExpression(expr.index, scope, state), state);
         return expr;
      }

      case "TableConstructorExpression": {
         expr.fields.forEach(field => {
            if (field.type === "TableKey") {
               if (field.key)
                  field.key = trackReplacement(field.key, simplifyExpression(field.key, scope, state), state);
               if (field.value)
                  field.value = trackReplacement(field.value, simplifyExpression(field.value, scope, state), state);
            } else if (field.type === "TableKeyString") {
               if (field.value)
                  field.value = trackReplacement(field.value, simplifyExpression(field.value, scope, state), state);
            } else if (field.type === "TableValue" && field.value) {
               field.value = trackReplacement(field.value, simplifyExpression(field.value, scope, state), state);
            }
         });
         return expr;
      }

      case "FunctionDeclaration": {
         const bodyScope = freshScope();
         for (const param of expr.parameters) {
            if (param.type === "Identifier")
               bodyScope.locals.add(param.name);
         }
         simplifyBlock(expr.body, bodyScope, state);
         return expr;
      }

      default:
         return expr;
   }
}

// Detect whether an expression references a given identifier name.
function referencesIdentifier(expr: luaparse.Expression, name: string): boolean {
   switch (expr.type) {
      case "Identifier":
         return expr.name === name;
      case "UnaryExpression":
         return referencesIdentifier(expr.argument, name);
      case "BinaryExpression":
      case "LogicalExpression":
         return referencesIdentifier(expr.left, name) || referencesIdentifier(expr.right, name);
      case "CallExpression":
         return referencesIdentifier(expr.base, name) || expr.arguments.some(arg => referencesIdentifier(arg, name));
      case "TableCallExpression":
         return referencesIdentifier(expr.base, name) || referencesIdentifier(expr.arguments, name);
      case "StringCallExpression":
         return referencesIdentifier(expr.base, name);
      case "MemberExpression":
         return referencesIdentifier(expr.base, name) ||
            (expr.identifier ? referencesIdentifier(expr.identifier as any, name) : false);
      case "IndexExpression":
         return referencesIdentifier(expr.base, name) || referencesIdentifier(expr.index, name);
      case "TableConstructorExpression":
         return expr.fields.some(field => {
            if (field.type === "TableKey" || field.type === "TableKeyString") {
               return (field.key && referencesIdentifier(field.key, name)) ||
                  (field.value && referencesIdentifier(field.value, name));
            } else if (field.type === "TableValue") {
               return field.value ? referencesIdentifier(field.value, name) : false;
            }
            return false;
         });
      default:
         return false;
   }
}

function simplifyStatement(stmt: luaparse.Statement, scope: PropScope, state: SimplificationState): void {
   switch (stmt.type) {
      case "LocalStatement": {
         const originalInit = stmt.init;
         const simplifiedInit = originalInit
            ? trackArrayReplacements(
               originalInit,
               originalInit.map(expr => simplifyExpression(expr, scope, state)),
               state,
            )
            : undefined;
         if (simplifiedInit)
            stmt.init = simplifiedInit;
         const defaultMissingToNil = missingInitDefaultsToNil(simplifiedInit);
         stmt.variables.forEach((variable, idx) => {
            if (variable.type !== "Identifier")
               return;
            scope.locals.add(variable.name);
            const initExpr = simplifiedInit ? simplifiedInit[idx] : undefined;
            const literal =
               initExpr ? (isLiteral(initExpr) ? initExpr : null) :
                          (defaultMissingToNil ? makeNilLiteral(variable) : null);
            if (literal)
               scope.env.set(variable.name, literal as LiteralNode);
            else
               scope.env.delete(variable.name);
         });
         break;
      }

      case "AssignmentStatement": {
         const originalInit = stmt.init.slice();
         const simplifiedInit: luaparse.Expression[] = originalInit.map((expr, idx) => {
            const variable = stmt.variables[idx];
            if (variable && variable.type === "Identifier" && expr) {
               const rhsUsesLhs = referencesIdentifier(expr, variable.name);
               if (rhsUsesLhs) {
                  const scoped = cloneScope(scope);
                  scoped.env.delete(variable.name);
                   return simplifyExpression(expr, scoped, state);
               }
            }
            return simplifyExpression(expr, scope, state);
         });
         stmt.init = trackArrayReplacements(originalInit, simplifiedInit, state);
         const defaultMissingToNil = missingInitDefaultsToNil(simplifiedInit);
         stmt.variables.forEach((variable, idx) => {
            if (variable.type !== "Identifier")
               return;
            if (!scope.locals.has(variable.name)) {
               scope.env.delete(variable.name);
               return;
            }
            const initExpr = simplifiedInit[idx];

            // If RHS references the LHS (self-update) or is non-literal, drop from env.
            const rhsUsesLhs = originalInit[idx] && referencesIdentifier(originalInit[idx], variable.name);
            const literal = !rhsUsesLhs && initExpr ? (isLiteral(initExpr) ? initExpr : null) :
                                                      (!initExpr && defaultMissingToNil ? makeNilLiteral(variable) : null);

            if (literal)
               scope.env.set(variable.name, literal as LiteralNode);
            else
               scope.env.delete(variable.name);
         });
         break;
      }

      case "CallStatement": {
         stmt.expression = trackReplacement(
            stmt.expression,
            simplifyExpression(stmt.expression, scope, state) as luaparse.CallExpression |
               luaparse.TableCallExpression | luaparse.StringCallExpression,
            state,
         );
         break;
      }

      case "ReturnStatement": {
         stmt.arguments = trackArrayReplacements(
            stmt.arguments,
            stmt.arguments.map(arg => simplifyExpression(arg, scope, state)),
            state,
         );
         break;
      }

      case "IfStatement": {
         const writes = new Set<string>();
         for (const clause of stmt.clauses) {
            if (clause.type !== "ElseClause" && clause.condition)
               clause.condition = trackReplacement(
                  clause.condition,
                  simplifyExpression(clause.condition, scope, state),
                  state,
               );
            const innerScope = cloneScope(scope);
            simplifyBlock(clause.body, innerScope, state);
            clause.body.forEach(s => collectWrites(s, writes));
         }
         writes.forEach(name => scope.env.delete(name));
         break;
      }

      case "WhileStatement": {
         const bodyWrites = collectBlockWrites(stmt.body);
         bodyWrites.forEach(name => scope.env.delete(name));
         const condScope = cloneScope(scope);
         condScope.env = new Map(); // avoid propagating locals into loop conditions
         stmt.condition = trackReplacement(
            stmt.condition,
            simplifyExpression(stmt.condition, condScope, state),
            state,
         );
         const inner = cloneScope(scope);
         simplifyBlock(stmt.body, inner, state);
         bodyWrites.forEach(name => scope.env.delete(name));
         break;
      }

      case "RepeatStatement": {
         const bodyWrites = collectBlockWrites(stmt.body);
         bodyWrites.forEach(name => scope.env.delete(name));
         const inner = cloneScope(scope);
         simplifyBlock(stmt.body, inner, state);
         const condScope = cloneScope(scope);
         condScope.env = new Map();
         stmt.condition = trackReplacement(
            stmt.condition,
            simplifyExpression(stmt.condition, condScope, state),
            state,
         );
         bodyWrites.forEach(name => scope.env.delete(name));
         break;
      }

      case "ForNumericStatement": {
         const bodyWrites = collectBlockWrites(stmt.body);
         bodyWrites.forEach(name => scope.env.delete(name));
         stmt.start = trackReplacement(stmt.start, simplifyExpression(stmt.start, scope, state), state);
         stmt.end = trackReplacement(stmt.end, simplifyExpression(stmt.end, scope, state), state);
         if (stmt.step)
            stmt.step = trackReplacement(stmt.step, simplifyExpression(stmt.step, scope, state), state);
         const bodyScope = cloneScope(scope);
         if (stmt.variable.type === "Identifier") {
            bodyScope.locals.add(stmt.variable.name);
            bodyScope.env.delete(stmt.variable.name);
            scope.env.delete(stmt.variable.name); // do not treat loop var as const outside
         }
         simplifyBlock(stmt.body, bodyScope, state);
         bodyWrites.forEach(name => scope.env.delete(name));
         break;
      }

      case "ForGenericStatement": {
         const bodyWrites = collectBlockWrites(stmt.body);
         bodyWrites.forEach(name => scope.env.delete(name));
         stmt.iterators = trackArrayReplacements(
            stmt.iterators,
            stmt.iterators.map(it => simplifyExpression(it, scope, state)),
            state,
         );
         const bodyScope = cloneScope(scope);
         stmt.variables.forEach(v => {
            if (v.type === "Identifier") {
               bodyScope.locals.add(v.name);
               bodyScope.env.delete(v.name);
               scope.env.delete(v.name);
            }
         });
         simplifyBlock(stmt.body, bodyScope, state);
         bodyWrites.forEach(name => scope.env.delete(name));
         break;
      }

      case "FunctionDeclaration": {
         const bodyScope = freshScope();
         stmt.parameters.forEach(param => {
            if (param.type === "Identifier")
               bodyScope.locals.add(param.name);
         });
         simplifyBlock(stmt.body, bodyScope, state);
         break;
      }

      case "DoStatement": {
         simplifyBlock(stmt.body, cloneScope(scope), state);
         break;
      }

      default:
         break;
   }
}

function simplifyBlock(body: luaparse.Statement[], scope: PropScope, state: SimplificationState): void {
   for (const stmt of body) {
      simplifyStatement(stmt, scope, state);
   }
}

function simplifyExpressions(ast: luaparse.Chunk): { ast: luaparse.Chunk; changed: boolean } {
   const state: SimplificationState = { changed: false };
   simplifyBlock(ast.body, freshScope(), state);
   return { ast, changed: state.changed };
}

export function simplifyExpressionsInAST(ast: luaparse.Chunk): luaparse.Chunk {
   return simplifyExpressions(ast).ast;
}

export const simplifyExpressionsRule: LuaOptimizationRule = {
   id: "reduce.simplify-expressions",
   family: "simplify",
   description: "Fold constants and propagate simple constant locals",
   defaultEnabled: (options) => options.simplifyExpressions,
   hooks: {
      reduce(context) {
         const result = simplifyExpressions(context.ast);
         context.ast = result.ast;
         return { changed: result.changed };
      },
   },
};
