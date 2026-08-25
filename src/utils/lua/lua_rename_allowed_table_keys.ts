import * as luaparse from "luaparse";
import {walkAST} from "./lua_ast";
import type { LuaOptimizationRule } from "./lua_optimizer_types";
import {LuaSymbolAllocator} from "./lua_symbols";
import {isStringLiteral, stringValue} from "./lua_utils";

function collectStaticTableKeyNames(ast: luaparse.Chunk): Set<string> {
   const names = new Set<string>();
   walkAST(ast, node => {
      if (node.type === "MemberExpression" && node.identifier?.type === "Identifier") {
         names.add(node.identifier.name);
      } else if (node.type === "IndexExpression" && isStringLiteral(node.index)) {
         const value = stringValue(node.index);
         if (value != null)
            names.add(value);
      } else if (node.type === "TableKeyString" && node.key?.type === "Identifier") {
         names.add(node.key.name);
      } else if (node.type === "TableKey" && isStringLiteral(node.key)) {
         const value = stringValue(node.key);
         if (value != null)
            names.add(value);
      }
   });
   return names;
}

function rewriteStringLiteralKey(node: luaparse.StringLiteral, mapping: Map<string, string>): void {
   const value = stringValue(node);
   if (value == null)
      return;
   const mapped = mapping.get(value);
   if (mapped) {
      node.value = mapped;
      node.raw = JSON.stringify(mapped);
   }
}

function rewriteExpression(expr: luaparse.Expression, mapping: Map<string, string>): void {
   switch (expr.type) {
      case "Identifier":
         return;

      case "MemberExpression": {
         if (expr.identifier && expr.identifier.type === "Identifier") {
            const mapped = mapping.get(expr.identifier.name);
            if (mapped)
               expr.identifier.name = mapped;
         }
         rewriteExpression(expr.base, mapping);
         return;
      }

      case "IndexExpression": {
         rewriteExpression(expr.base, mapping);
         rewriteExpression(expr.index, mapping);
         if (isStringLiteral(expr.index))
            rewriteStringLiteralKey(expr.index, mapping);
         return;
      }

      case "CallExpression":
         rewriteExpression(expr.base, mapping);
         expr.arguments.forEach(arg => rewriteExpression(arg, mapping));
         return;

      case "TableCallExpression":
         rewriteExpression(expr.base, mapping);
         rewriteExpression(expr.arguments as luaparse.Expression, mapping);
         return;

      case "StringCallExpression":
         rewriteExpression(expr.base, mapping);
         rewriteExpression(expr.argument as luaparse.Expression, mapping);
         return;

      case "BinaryExpression":
      case "LogicalExpression":
         rewriteExpression(expr.left, mapping);
         rewriteExpression(expr.right, mapping);
         return;

      case "UnaryExpression":
         rewriteExpression(expr.argument, mapping);
         return;

      case "FunctionDeclaration":
         expr.body.forEach(stmt => rewriteStatement(stmt, mapping));
         return;

      case "TableConstructorExpression": {
         expr.fields.forEach(field => {
            if (field.type === "TableKeyString" && field.key) {
               if (field.key.type === "Identifier") {
                  const mapped = mapping.get(field.key.name);
                  if (mapped)
                     field.key.name = mapped;
               } else if (isStringLiteral(field.key)) {
                  rewriteStringLiteralKey(field.key, mapping);
               }
               if (field.value)
                  rewriteExpression(field.value, mapping);
            } else if (field.type === "TableKey") {
               if (isStringLiteral(field.key))
                  rewriteStringLiteralKey(field.key, mapping);
               else if (field.key)
                  rewriteExpression(field.key, mapping);
               if (field.value)
                  rewriteExpression(field.value, mapping);
            } else if (field.type === "TableValue" && field.value) {
               rewriteExpression(field.value, mapping);
            }
         });
         return;
      }

      default:
         return;
   }
}

function rewriteStatement(stmt: luaparse.Statement, mapping: Map<string, string>): void {
   switch (stmt.type) {
      case "LocalStatement":
         if (stmt.init)
            stmt.init.forEach(expr => rewriteExpression(expr, mapping));
         return;

      case "AssignmentStatement":
         stmt.variables.forEach(v => rewriteExpression(v as luaparse.Expression, mapping));
         stmt.init.forEach(expr => rewriteExpression(expr, mapping));
         return;

      case "CallStatement":
         rewriteExpression(stmt.expression, mapping);
         return;

      case "ReturnStatement":
         stmt.arguments.forEach(arg => rewriteExpression(arg, mapping));
         return;

      case "IfStatement":
         stmt.clauses.forEach(clause => {
            if (clause.type !== "ElseClause" && clause.condition)
               rewriteExpression(clause.condition, mapping);
            clause.body.forEach(s => rewriteStatement(s, mapping));
         });
         return;

      case "WhileStatement":
         rewriteExpression(stmt.condition, mapping);
         stmt.body.forEach(s => rewriteStatement(s, mapping));
         return;

      case "RepeatStatement":
         stmt.body.forEach(s => rewriteStatement(s, mapping));
         rewriteExpression(stmt.condition, mapping);
         return;

      case "ForNumericStatement":
         rewriteExpression(stmt.start, mapping);
         rewriteExpression(stmt.end, mapping);
         if (stmt.step)
            rewriteExpression(stmt.step, mapping);
         stmt.body.forEach(s => rewriteStatement(s, mapping));
         return;

      case "ForGenericStatement":
         stmt.iterators.forEach(it => rewriteExpression(it, mapping));
         stmt.body.forEach(s => rewriteStatement(s, mapping));
         return;

      case "FunctionDeclaration":
         stmt.body.forEach(s => rewriteStatement(s, mapping));
         return;

      case "DoStatement":
         stmt.body.forEach(s => rewriteStatement(s, mapping));
         return;

      default:
         return;
   }
}

export function renameAllowedTableKeysInAST(ast: luaparse.Chunk, keys: string[]|undefined|null): luaparse.Chunk {
   const allow = Array.isArray(keys) ? keys.filter(Boolean) : [];
   if (allow.length === 0)
      return ast;

   const mapping = new Map<string, string>();
   const renamedKeys = new Set(allow);
   const reservedNames = collectStaticTableKeyNames(ast);
   renamedKeys.forEach(key => reservedNames.delete(key));
   const symbolAllocator = new LuaSymbolAllocator({reservedNames});
   for (const key of allow) {
      if (!mapping.has(key))
         mapping.set(key, symbolAllocator.allocate());
   }

   ast.body.forEach(stmt => rewriteStatement(stmt, mapping));
   return ast;
}

export const renameAllowedTableKeysRule: LuaOptimizationRule = {
   id: "rename.allowed-table-keys",
   family: "symbols",
   description: "Rename explicitly allowed table entry keys",
   enabled: (options) => options.tableEntryKeysToRename?.length > 0,
   hooks: {
      rename(context) {
         context.ast = renameAllowedTableKeysInAST(
            context.ast,
            context.options.tableEntryKeysToRename,
         );
      },
   },
};
