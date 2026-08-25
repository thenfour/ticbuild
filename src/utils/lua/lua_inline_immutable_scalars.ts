import * as luaparse from "luaparse";
import {
  cloneLuaScalarLiteral,
  isLuaScalarLiteral,
  isLuaTruthyLiteral,
  makeLuaNilLiteral,
} from "./lua_constant_literals";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import { analyzeLuaLexicalBindings, LuaLocalBinding } from "./lua_lexical_bindings";
import type { LuaOptimizationRule, OptimizationRuleOptions } from "./lua_optimizer_types";
import { unparseLua } from "./lua_printer";
import type { LiteralNode } from "./lua_utils";

type ScalarCandidate = {
  readonly binding: LuaLocalBinding;
  readonly literal: LiteralNode;
  readonly printedLiteralLength: number;
  readonly statement: luaparse.LocalStatement;
};

function missingInitializersAreNil(initializers: readonly luaparse.Expression[]): boolean {
  if (initializers.length === 0) return true;
  const last = initializers[initializers.length - 1];
  return last.type !== "CallExpression" &&
    last.type !== "TableCallExpression" &&
    last.type !== "StringCallExpression" &&
    last.type !== "VarargLiteral";
}

function initializerFor(
  statement: luaparse.LocalStatement,
  index: number,
): LiteralNode | null {
  const initializer = statement.init[index];
  if (initializer) return isLuaScalarLiteral(initializer) ? initializer : null;
  return missingInitializersAreNil(statement.init)
    ? makeLuaNilLiteral(statement.variables[index])
    : null;
}

function tightLength(
  statement: luaparse.LocalStatement | null,
  assumeRenamedLocals: boolean,
): number {
  if (!statement) return 0;
  const measuredStatement = assumeRenamedLocals
    ? {
      ...statement,
      variables: statement.variables.map((variable) => ({ ...variable, name: "a" })),
    }
    : statement;
  const chunk: luaparse.Chunk = { type: "Chunk", body: [measuredStatement] };
  return unparseLua(chunk, {
    maxIndentLevel: 0,
    lineBehavior: "tight2",
    maxLineLength: Number.MAX_SAFE_INTEGER,
  }).trim().length;
}

function literalLength(literal: LiteralNode): number {
  const statement: luaparse.ReturnStatement = {
    type: "ReturnStatement",
    arguments: [literal],
  };
  const chunk: luaparse.Chunk = { type: "Chunk", body: [statement] };
  const printed = unparseLua(chunk, {
    maxIndentLevel: 0,
    lineBehavior: "tight2",
    maxLineLength: Number.MAX_SAFE_INTEGER,
  }).trim();
  return printed.slice("return ".length).length;
}

function projectStatement(
  statement: luaparse.LocalStatement,
  removed: ReadonlySet<luaparse.Identifier>,
): luaparse.LocalStatement | null {
  if (!statement.variables.some((variable) => removed.has(variable))) return statement;
  const variables = statement.variables.filter((variable) => !removed.has(variable));
  if (variables.length === 0) return null;

  const init = statement.init.filter((_, index) => {
    const variable = statement.variables[index];
    return !variable || !removed.has(variable);
  });
  return { ...statement, variables, init };
}

function selectProfitableCandidates(
  candidates: readonly ScalarCandidate[],
  options: OptimizationRuleOptions,
): Set<luaparse.Identifier> {
  const selected = new Set<luaparse.Identifier>();
  const byStatement = new Map<luaparse.LocalStatement, ScalarCandidate[]>();
  for (const candidate of candidates) {
    const group = byStatement.get(candidate.statement) ?? [];
    group.push(candidate);
    byStatement.set(candidate.statement, group);
  }

  const canUnlockControlFlow = (candidate: ScalarCandidate): boolean => {
    if (candidate.binding.directConditionReads.length !== candidate.binding.reads.length) return false;
    const resolveIf = options.ruleOverrides?.["control-flow.resolve-constant-if"] ??
      (options.simplifyControlFlow ?? false);
    const removeFalseWhile = options.ruleOverrides?.["control-flow.remove-false-while"] ??
      (options.simplifyControlFlow ?? false);
    return candidate.binding.directConditionReads.every(({ kind }) =>
      (kind === "if" && resolveIf) ||
      (kind === "while" && !isLuaTruthyLiteral(candidate.literal) && removeFalseWhile)
    );
  };

  const canDuplicateLiteral = (candidate: ScalarCandidate): boolean => {
    if (!options.renameLocalVariables) return true;
    return candidate.binding.reads.length <= 1 ||
      candidate.printedLiteralLength <= 1 ||
      canUnlockControlFlow(candidate);
  };

  for (const [statement, group] of byStatement) {
    let progress = true;
    while (progress) {
      progress = false;
      for (const candidate of group) {
        const declaration = candidate.binding.declaration;
        if (selected.has(declaration)) continue;
        if (!canDuplicateLiteral(candidate)) continue;

        const before = projectStatement(statement, selected);
        const withCandidate = new Set(selected).add(declaration);
        const after = projectStatement(statement, withCandidate);
        let declarationSaving = tightLength(before, options.renameLocalVariables) -
          tightLength(after, options.renameLocalVariables);
        if (options.packLocalDeclarations && !after) {
          // A later packing pass may share the `local` keyword with a neighbor.
          declarationSaving = Math.max(0, declarationSaving - "local ".length);
        }
        const emittedNameLength = options.renameLocalVariables ? 1 : declaration.name.length;
        const replacementCost = candidate.binding.reads.length *
          (candidate.printedLiteralLength - emittedNameLength);

        // Removable conditions can unlock a much larger downstream reduction.
        if (canUnlockControlFlow(candidate) || declarationSaving >= replacementCost) {
          selected.add(declaration);
          progress = true;
          break;
        }
      }
    }

    // Shared `local` syntax can make the complete group profitable even when
    // no individual removal is. Account for that final declaration shape too.
    const remainingEligible = group.filter((candidate) =>
      !selected.has(candidate.binding.declaration) && canDuplicateLiteral(candidate)
    );
    const all = new Set(selected);
    remainingEligible.forEach((candidate) => all.add(candidate.binding.declaration));
    const selectedStatement = projectStatement(statement, selected);
    const allStatement = projectStatement(statement, all);
    const extraReplacementCost = remainingEligible
      .reduce((total, candidate) => total + candidate.binding.reads.length *
        (candidate.printedLiteralLength -
          (options.renameLocalVariables ? 1 : candidate.binding.declaration.name.length)), 0);
    let groupDeclarationSaving = tightLength(selectedStatement, options.renameLocalVariables) -
      tightLength(allStatement, options.renameLocalVariables);
    if (options.packLocalDeclarations && selectedStatement && !allStatement) {
      groupDeclarationSaving = Math.max(0, groupDeclarationSaving - "local ".length);
    }
    if (groupDeclarationSaving >= extraReplacementCost) {
      remainingEligible.forEach((candidate) => selected.add(candidate.binding.declaration));
    }
  }

  return selected;
}

function inlineImmutableScalars(
  ast: luaparse.Chunk,
  options: OptimizationRuleOptions,
): boolean {
  const analysis = analyzeLuaLexicalBindings(ast);
  const candidates: ScalarCandidate[] = [];

  function collect(body: readonly luaparse.Statement[]): void {
    for (const statement of body) {
      if (statement.type === "LocalStatement" && statement.init.length <= statement.variables.length) {
        statement.variables.forEach((variable, index) => {
          const binding = analysis.bindingByIdentifier.get(variable);
          const literal = initializerFor(statement, index);
          if (
            binding &&
            literal &&
            variable.name !== "_ENV" &&
            binding.reads.length > 0 &&
            binding.writes.length === 0
          ) {
            candidates.push({
              binding,
              literal,
              printedLiteralLength: literalLength(literal),
              statement,
            });
          }
        });
      }

      switch (statement.type) {
        case "FunctionDeclaration":
        case "WhileStatement":
        case "RepeatStatement":
        case "DoStatement":
        case "ForNumericStatement":
        case "ForGenericStatement":
          collect(statement.body);
          break;
        case "IfStatement":
          statement.clauses.forEach((clause) => collect(clause.body));
          break;
        default:
          break;
      }
    }
  }

  collect(ast.body);
  const selectedDeclarations = selectProfitableCandidates(candidates, options);
  if (selectedDeclarations.size === 0) return false;

  const replacementByRead = new Map<luaparse.Identifier, LiteralNode>();
  for (const candidate of candidates) {
    if (!selectedDeclarations.has(candidate.binding.declaration)) continue;
    candidate.binding.reads.forEach((read) => replacementByRead.set(read, candidate.literal));
  }

  return rewriteLuaAst(ast, {
    expression(expression) {
      if (expression.type !== "Identifier") {
        return { expression, changed: false };
      }
      const literal = replacementByRead.get(expression);
      return literal
        ? { expression: cloneLuaScalarLiteral(literal, expression), changed: true }
        : { expression, changed: false };
    },
    statement(statement) {
      if (statement.type !== "LocalStatement") {
        return { statements: [statement], changed: false };
      }
      const projected = projectStatement(statement, selectedDeclarations);
      if (projected === statement) {
        return { statements: [statement], changed: false };
      }
      if (!projected) return { statements: [], changed: true };
      statement.variables = projected.variables;
      statement.init = projected.init;
      return { statements: [statement], changed: true };
    },
  });
}

export const inlineImmutableScalarsRule: LuaOptimizationRule = {
  id: "reduce.inline-immutable-scalars",
  family: "simplify",
  description: "Inline immutable scalar local bindings when doing so can reduce code",
  defaultEnabled: (options) => options.simplifyExpressions,
  hooks: {
    reduce(context) {
      return { changed: inlineImmutableScalars(context.ast, context.options) };
    },
  },
};
