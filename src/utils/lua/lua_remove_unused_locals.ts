import * as luaparse from "luaparse";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import { inheritLuaNodeOrigin } from "./lua_ast_provenance";
import { luaExpressionHasSideEffects } from "./lua_expression_effects";
import { analyzeLuaLexicalBindings, LuaLocalBinding } from "./lua_lexical_bindings";
import type { LuaOptimizationRule } from "./lua_optimizer_types";

function isUnused(binding: LuaLocalBinding | undefined): boolean {
  return binding !== undefined && binding.reads.length === 0 && binding.writes.length === 0;
}

function projectUnusedSlots(
  statement: luaparse.LocalStatement,
  bindingByIdentifier: ReadonlyMap<luaparse.Identifier, LuaLocalBinding>,
): luaparse.LocalStatement | null {
  const unused = statement.variables.map((variable) =>
    variable.name !== "_ENV" && isUnused(bindingByIdentifier.get(variable))
  );
  if (!unused.some(Boolean)) return statement;

  if (unused.every(Boolean) && statement.init.every((init) => !luaExpressionHasSideEffects(init))) {
    return null;
  }

  if (statement.variables.length === statement.init.length) {
    // Removing an aligned variable/value pair preserves every remaining slot.
    // Effectful values stay paired with a local so their evaluation is retained.
    const removed = new Set<number>();
    unused.forEach((isUnusedSlot, index) => {
      if (isUnusedSlot && !luaExpressionHasSideEffects(statement.init[index])) {
        removed.add(index);
      }
    });
    if (removed.size === 0) return statement;
    return inheritLuaNodeOrigin({
      ...statement,
      variables: statement.variables.filter((_, index) => !removed.has(index)),
      init: statement.init.filter((_, index) => !removed.has(index)),
    }, statement);
  }

  // With a multi-return or implicit nil tail, only a suffix can disappear
  // without changing which result is assigned to a retained variable.
  let variableCount = statement.variables.length;
  while (variableCount > 1 && unused[variableCount - 1]) variableCount--;
  if (variableCount === statement.variables.length) return statement;

  const init = [...statement.init];
  while (
    init.length > variableCount &&
    !luaExpressionHasSideEffects(init[init.length - 1])
  ) {
    init.pop();
  }
  return inheritLuaNodeOrigin({
    ...statement,
    variables: statement.variables.slice(0, variableCount),
    init,
  }, statement);
}

function removeUnusedLocals(ast: luaparse.Chunk): boolean {
  const analysis = analyzeLuaLexicalBindings(ast);
  return rewriteLuaAst(ast, {
    statement(statement) {
      if (statement.type !== "LocalStatement") {
        return { statements: [statement], changed: false };
      }
      const projected = projectUnusedSlots(statement, analysis.bindingByIdentifier);
      if (projected === statement) {
        return { statements: [statement], changed: false };
      }
      return projected
        ? { statements: [projected], changed: true }
        : { statements: [], changed: true };
    },
  });
}

export function removeUnusedLocalsInAST(ast: luaparse.Chunk): luaparse.Chunk {
  removeUnusedLocals(ast);
  return ast;
}

export const removeUnusedLocalsRule: LuaOptimizationRule = {
  id: "reduce.remove-unused-locals",
  family: "dead-code",
  description: "Remove unused local bindings with removable initializers",
  defaultEnabled: (options) => options.removeUnusedLocals,
  hooks: {
    reduce(context) {
      return { changed: removeUnusedLocals(context.ast) };
    },
  },
};
