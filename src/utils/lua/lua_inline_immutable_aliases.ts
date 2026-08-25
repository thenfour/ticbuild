import * as luaparse from "luaparse";
import { rewriteLuaAst } from "./lua_ast_rewrite";
import { inheritLuaNodeOrigin } from "./lua_ast_provenance";
import { analyzeLuaLexicalBindings, LuaLocalBinding } from "./lua_lexical_bindings";
import type { LuaOptimizationRule, OptimizationRuleOptions } from "./lua_optimizer_types";
import { unparseLua } from "./lua_printer";

type AliasCandidate = {
  readonly statement: luaparse.LocalStatement;
  readonly alias: LuaLocalBinding;
  readonly source: LuaLocalBinding;
};

function tightStatementLength(statement: luaparse.LocalStatement): number {
  const chunk: luaparse.Chunk = { type: "Chunk", body: [statement] };
  return unparseLua(chunk, {
    maxIndentLevel: 0,
    lineBehavior: "tight2",
    maxLineLength: Number.MAX_SAFE_INTEGER,
  }).trim().length;
}

function isProfitable(candidate: AliasCandidate, options: OptimizationRuleOptions): boolean {
  let declarationSaving = tightStatementLength(candidate.statement);
  if (options.packLocalDeclarations) {
    // Packing may share the local keyword with an adjacent declaration.
    declarationSaving = Math.max(0, declarationSaving - "local ".length);
  }
  const replacementGrowth = options.renameLocalVariables
    ? 0
    : candidate.alias.reads.length *
    (candidate.source.declaration.name.length - candidate.alias.declaration.name.length);
  return declarationSaving >= replacementGrowth;
}

function inlineImmutableAliases(
  ast: luaparse.Chunk,
  options: OptimizationRuleOptions,
): boolean {
  const analysis = analyzeLuaLexicalBindings(ast);
  const candidates: AliasCandidate[] = [];

  function collect(body: readonly luaparse.Statement[]): void {
    for (const statement of body) {
      if (
        statement.type === "LocalStatement" &&
        statement.variables.length === 1 &&
        statement.init.length === 1 &&
        statement.init[0].type === "Identifier"
      ) {
        const alias = analysis.bindingByIdentifier.get(statement.variables[0]);
        const source = analysis.bindingByIdentifier.get(statement.init[0]);
        if (
          alias &&
          source &&
          alias.declaration.name !== "_ENV" &&
          source.declaration.name !== "_ENV" &&
          alias.reads.length > 0 &&
          alias.writes.length === 0 &&
          source.writes.length === 0
        ) {
          candidates.push({ statement, alias, source });
        }
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
  const bindingCountByName = new Map<string, number>();
  for (const binding of analysis.bindings) {
    const name = binding.declaration.name;
    bindingCountByName.set(name, (bindingCountByName.get(name) ?? 0) + 1);
  }

  const eligible = candidates.filter((candidate) =>
    // A textual replacement must not be captured by a same-named binding.
    bindingCountByName.get(candidate.source.declaration.name) === 1 &&
    isProfitable(candidate, options)
  );
  const eligibleAliases = new Set(eligible.map((candidate) => candidate.alias));
  const selected = eligible.filter((candidate) =>
    // Process chains from their stable source outward over reduction rounds.
    !eligibleAliases.has(candidate.source)
  );
  if (selected.length === 0) return false;

  const replacementByRead = new Map<luaparse.Identifier, string>();
  const removedStatements = new Set<luaparse.LocalStatement>();
  for (const candidate of selected) {
    candidate.alias.reads.forEach((read) =>
      replacementByRead.set(read, candidate.source.declaration.name)
    );
    removedStatements.add(candidate.statement);
  }

  return rewriteLuaAst(ast, {
    expression(expression) {
      if (expression.type !== "Identifier") {
        return { expression, changed: false };
      }
      const replacement = replacementByRead.get(expression);
      return replacement === undefined
        ? { expression, changed: false }
        : {
          expression: inheritLuaNodeOrigin({ ...expression, name: replacement }, expression),
          changed: true,
        };
    },
    statement(statement) {
      return statement.type === "LocalStatement" && removedStatements.has(statement)
        ? { statements: [], changed: true }
        : { statements: [statement], changed: false };
    },
  });
}

export const inlineImmutableAliasesRule: LuaOptimizationRule = {
  id: "reduce.inline-immutable-aliases",
  family: "simplify",
  description: "Inline immutable local-to-local aliases when doing so reduces code",
  // e.g.,
  // local a = b
  // local c = a
  // becomes
  // local c = b
  defaultEnabled: (options) => options.simplifyExpressions,
  hooks: {
    reduce(context) {
      return { changed: inlineImmutableAliases(context.ast, context.options) };
    },
  },
};
