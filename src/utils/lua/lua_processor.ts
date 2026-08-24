import * as luaparse from "luaparse";
import { renameLocalVariablesInAST } from "./lua_renamer";
import { literalAliasStrategy } from "./lua_alias_literals";
import { repeatedExpressionAliasStrategy } from "./lua_alias_expressions";
import {
  AliasPassReport,
  AliasStrategy,
  createEmptyAliasPassReport,
  runAliasPasses,
} from "./lua_alias_shared";
import { packLocalDeclarationsInAST } from "./lua_pack_locals";
import { simplifyExpressionsInAST } from "./lua_simplify";
import { removeUnusedLocalsInAST } from "./lua_remove_unused_locals";
import { removeUnusedFunctionsInAST } from "./lua_remove_unused_functions";
import { renameTableFieldsInAST } from "./lua_rename_table_fields";
import { renameAllowedTableKeysInAST } from "./lua_rename_allowed_table_keys";
import { renameAllowedGlobalsInAST } from "./lua_rename_allowed_globals";
import { extractLuaBlocks, replaceLuaBlock, toLuaStringLiteral } from "./lua_fundamentals";
import { annotateLuaAstOrigins } from "./lua_ast_provenance";
import { createLuaPrintTransformMap } from "./lua_print_trace";
import {
  LuaTransformMap,
  LuaTransformMapBuilder,
} from "./lua_transform_map";

export type LuaLineBehavior = "pretty" | "tight" | "single-line-blocks" | "traceable";

export type OptimizationRuleOptions = {
  stripComments: boolean; //
  //stripDebugBlocks: boolean; //
  maxIndentLevel: number; // limits indentation to N levels; beyond that, everything is flattened
  // Line formatting behavior: pretty preserves newlines, tight packs lines up to maxLineLength,
  // single-line-blocks packs only when an entire block fits on one line
  // traceable emits one token per line so Lua's line-only runtime errors identify the narrowest useful syntax.
  lineBehavior: LuaLineBehavior;
  maxLineLength: number;
  renameLocalVariables: boolean;
  aliasRepeatedExpressions: boolean;

  // literal values like "hello" or numbers like 65535 that appear enough times can be
  // replaced with a local variable to save space.
  // * only done for values that appear enough times to offset the cost of the local declaration.
  // * alias declaration placed in the narrowest possible scope that contains all uses.
  aliasLiterals: boolean;

  // Simplify expressions by folding constants and propagating simple constant locals.
  // * folds basic arithmetic, boolean logic, and string concatenation when operands are literals.
  // * propagates locals that are assigned literal values until they are reassigned or shadowed.
  simplifyExpressions: boolean;

  // Remove local declarations that are never referenced (and whose initializers are side-effect free).
  removeUnusedLocals: boolean;

  // Remove unused function declarations (global and local) when safe.
  // Uses a conservative approach and always preserves functions in functionNamesToKeep.
  removeUnusedFunctions: boolean;

  // Names of functions that must not be removed.
  // Intended for entrypoints and externally-referenced API surfaces.
  functionNamesToKeep: string[];

  // Rename table literal field names when safe (non-escaping locals, string/identifier keys only).
  renameTableFields: boolean;

  // Globally rename specific table entry keys (string/identifier keys and member/index accesses) to short names.
  // Intended for callers that know these keys are safe to minify even when the table escapes.
  tableEntryKeysToRename: string[];

  // Explicitly allowed globals that may be renamed. This is opt-in because global names can be
  // externally referenced by TIC-80 or dynamic Lua code.
  globalSymbolsToRename?: string[];

  // Applies globalSymbolsToRename when enabled.
  renameSpecifiedGlobalSymbols?: boolean;

  // Merge consecutive local declarations into one using packing.
  // e.g.,
  // local a=1
  // local b=2
  // ->
  // local a,b = 1,2
  // (18 chars -> 15)
  //
  // we should be conservative in choosing to apply this treatment:
  // * must be consecutive to guarantee no side-effects or dependencies in between.
  // * it's NOT safe when there are any intervening statements with side effects.
  // * or any dependencies between the variables being declared. like,
  //   local a = 1
  //   local b = a + c
  //   -> cannot be packed.
  //   local a, b = 1, a + c -- does not work because 'a' is not defined yet
  // * or if any of the variables are used before all are declared. this is non-trivial because you could
  //   have:
  //   local a = 1
  //   local b = doSomething() -- 'a' is used in doSomething()
  // so we skip packing in that case.
  packLocalDeclarations: boolean;

  // NOTE: so much lua code is `local`, `function`, `end`, and it's very tempting to attempt to
  // inline function calls. but it's way too difficult / complex to do in a minifier; basically anything other than the most
  // simple tiny case has side-effects we can't guarantee won't break.
};

// Precedence tables, low → high
const LOGICAL_PRECEDENCE: Record<string, number> = {
  or: 1,
  and: 2,
};

const BINARY_PRECEDENCE: Record<string, number> = {
  "<": 3,
  ">": 3,
  "<=": 3,
  ">=": 3,
  "~=": 3,
  "==": 3,
  "|": 4,
  "~": 5,
  "&": 6,
  "<<": 7,
  ">>": 7,
  "..": 8, // right associative
  "+": 9,
  "-": 9,
  "*": 10,
  "/": 10,
  "//": 10,
  "%": 10,
};

const UNARY_PRECEDENCE = 11; // not, #, -, ~
const POW_PRECEDENCE = 12; // ^

function getPrecedence(node: luaparse.Expression): number {
  switch (node.type) {
    case "LogicalExpression":
      return LOGICAL_PRECEDENCE[node.operator];
    case "BinaryExpression": {
      const op = node.operator;
      if (op === "^") return POW_PRECEDENCE;
      return BINARY_PRECEDENCE[op];
    }
    case "UnaryExpression":
      return UNARY_PRECEDENCE;
    default:
      // Primary expressions (literals, identifiers, calls, table ctors, etc.)
      return 100;
  }
}

export class LuaPrinter {
  private buf: string[] = [];
  private options: OptimizationRuleOptions;
  private indentLevel = 0;
  private indentUnit = " "; // only used if !minified
  private currentLine = "";
  private blockComments: Map<luaparse.Statement[], luaparse.Comment[]>;
  private inlineMode = false; // When true, render everything on single lines without packing

  constructor(options: OptimizationRuleOptions, blockComments?: Map<luaparse.Statement[], luaparse.Comment[]>) {
    this.options = options;
    this.blockComments = blockComments || new Map();
  }

  print(chunk: luaparse.Chunk): string {
    const mode = this.options.lineBehavior || "pretty";

    if (mode === "traceable") {
      return this.printTraceableMode(chunk);
    }

    // For tight mode, use the token-stream approach
    if (mode === "tight") {
      return this.printTightMode(chunk);
    }

    // For pretty and single-line-blocks, use structured approach
    this.buf = [];
    this.currentLine = "";
    this.indentLevel = 0;
    this.printBlock(chunk.body);
    if (this.currentLine.length > 0) this.flushLine();
    return this.buf.join("");
  }

  // ===== TRACEABLE MODE: one lexical token per generated line =====
  //
  // Lua 5.3 records binary/unary bytecode against the operator token's line and
  // function calls against the opening argument token's line. Giving every
  // token a line of its own therefore lets a line-only runtime location select
  // a narrowly mapped AST region without changing the Lua token stream.
  //
  // Generate canonical pretty output first instead of maintaining a second AST
  // serializer. Re-lexing that valid output preserves literal spellings and
  // comments while replacing only insignificant whitespace. maxLineLength and
  // maxIndentLevel intentionally do not apply in this diagnostic mode.
  private printTraceableMode(chunk: luaparse.Chunk): string {
    const canonicalPrinter = new LuaPrinter(
      { ...this.options, lineBehavior: "pretty" },
      this.blockComments,
    );
    const canonical = canonicalPrinter.print(chunk);
    if (canonical.length === 0) {
      return "";
    }

    const parsed = luaparse.parse(canonical, {
      luaVersion: "5.3",
      comments: true,
      locations: false,
      ranges: true,
    });
    const ranges: Array<[number, number]> = [];

    const lexer = luaparse.parse({
      wait: true,
      luaVersion: "5.3",
      comments: false,
      locations: false,
      ranges: true,
    });
    lexer.write(canonical);
    while (true) {
      const token = lexer.lex();
      if (token.range[0] === token.range[1]) {
        break;
      }
      ranges.push(token.range);
    }

    for (const comment of parsed.comments ?? []) {
      const range = (comment as luaparse.Comment & { range?: [number, number] }).range;
      if (range && range[1] > range[0]) {
        ranges.push(range);
      }
    }

    ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return ranges.map(([begin, end]) => canonical.slice(begin, end)).join("\n") + "\n";
  }

  // ===== TIGHT MODE: Token-stream based packing =====
  // Renders everything to space-separated tokens, then packs into lines

  private printTightMode(chunk: luaparse.Chunk): string {
    const tokens = this.collectTokens(chunk.body);
    return this.packTokensIntoLines(tokens);
  }

  // Collect all tokens from a block of statements
  private collectTokens(body: luaparse.Statement[]): string[] {
    const comments = [...(this.blockComments.get(body) || [])];
    const items: Array<luaparse.Statement | luaparse.Comment> = [];
    let ci = 0;

    for (const stmt of body) {
      while (ci < comments.length && this.startPos(comments[ci]) <= this.startPos(stmt)) {
        items.push(comments[ci]);
        ci++;
      }
      items.push(stmt);
    }
    while (ci < comments.length) {
      items.push(comments[ci]);
      ci++;
    }

    const tokens: string[] = [];
    for (const node of items) {
      if (node.type === "Comment") {
        // Comments get special handling - they force a line break
        tokens.push("\n" + this.renderComment(node as luaparse.Comment));
      } else {
        const stmtTokens = this.statementToTokens(node as luaparse.Statement);
        tokens.push(...stmtTokens);
      }
    }
    return tokens;
  }

  // Convert a statement to tokens (space-separated pieces)
  // For maximum packing flexibility, we separate keywords from their arguments
  private statementToTokens(stmt: luaparse.Statement): string[] {
    const tokens: string[] = [];

    switch (stmt.type) {
      case "AssignmentStatement": {
        const st = stmt as luaparse.AssignmentStatement;
        const vars = st.variables.map((v) => this.expr(v)).join(",");
        const vals = st.init.map((v) => this.expr(v)).join(",");
        tokens.push(vars + "=" + vals);
        break;
      }
      case "LocalStatement": {
        const st = stmt as luaparse.LocalStatement;
        const vars = st.variables.map((v) => this.expr(v)).join(",");
        let s = "local " + vars;
        if (st.init && st.init.length > 0) {
          s += "=" + st.init.map((v) => this.expr(v)).join(",");
        }
        tokens.push(s);
        break;
      }
      case "CallStatement": {
        const st = stmt as luaparse.CallStatement;
        tokens.push(this.expr(st.expression));
        break;
      }
      case "ReturnStatement": {
        const st = stmt as luaparse.ReturnStatement;
        if (st.arguments.length > 0) {
          // Keep return with all its comma-separated arguments as one token
          // to preserve required commas between multiple return values
          tokens.push("return " + st.arguments.map((a) => this.expr(a)).join(","));
        } else {
          tokens.push("return");
        }
        break;
      }
      case "BreakStatement":
        tokens.push("break");
        break;
      case "FunctionDeclaration": {
        const fn = stmt as luaparse.FunctionDeclaration;
        let s = fn.isLocal ? "local function " : "function ";
        if (fn.identifier) {
          s += this.expr(fn.identifier);
        }
        s += "(" + fn.parameters.map((p) => this.expr(p)).join(",") + ")";
        tokens.push(s);
        tokens.push(...this.collectTokens(fn.body));
        tokens.push("end");
        break;
      }
      case "IfStatement": {
        const ifs = stmt as luaparse.IfStatement;
        for (const clause of ifs.clauses) {
          if (clause.type === "IfClause") {
            tokens.push("if " + this.expr(clause.condition) + " then");
          } else if (clause.type === "ElseifClause") {
            tokens.push("elseif " + this.expr(clause.condition) + " then");
          } else {
            tokens.push("else");
          }
          tokens.push(...this.collectTokens(clause.body));
        }
        tokens.push("end");
        break;
      }
      case "WhileStatement": {
        const st = stmt as luaparse.WhileStatement;
        tokens.push("while " + this.expr(st.condition) + " do");
        tokens.push(...this.collectTokens(st.body));
        tokens.push("end");
        break;
      }
      case "RepeatStatement": {
        const st = stmt as luaparse.RepeatStatement;
        tokens.push("repeat");
        tokens.push(...this.collectTokens(st.body));
        tokens.push("until " + this.expr(st.condition));
        break;
      }
      case "ForNumericStatement": {
        const st = stmt as luaparse.ForNumericStatement;
        let s = "for " + this.expr(st.variable) + "=" + this.expr(st.start) + "," + this.expr(st.end);
        if (st.step) {
          s += "," + this.expr(st.step);
        }
        s += " do";
        tokens.push(s);
        tokens.push(...this.collectTokens(st.body));
        tokens.push("end");
        break;
      }
      case "ForGenericStatement": {
        const st = stmt as luaparse.ForGenericStatement;
        const vars = st.variables.map((v) => this.expr(v)).join(",");
        const iters = st.iterators.map((it) => this.expr(it)).join(",");
        tokens.push("for " + vars + " in " + iters + " do");
        tokens.push(...this.collectTokens(st.body));
        tokens.push("end");
        break;
      }
      case "DoStatement": {
        const st = stmt as luaparse.DoStatement;
        tokens.push("do");
        tokens.push(...this.collectTokens(st.body));
        tokens.push("end");
        break;
      }
      default:
        break;
    }
    return tokens;
  }

  // Pack tokens into lines respecting maxLineLength
  private packTokensIntoLines(tokens: string[]): string {
    const maxLen = this.options.maxLineLength || 120;
    const lines: string[] = [];
    let currentLine = "";

    for (const token of tokens) {
      // Special case: comment tokens start with \n and force a new line
      if (token.startsWith("\n")) {
        if (currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = "";
        }
        lines.push(token.slice(1)); // Remove the leading \n marker
        continue;
      }

      if (currentLine.length === 0) {
        currentLine = token;
      } else {
        const candidate = currentLine + " " + token;
        // Use <= to allow filling lines up to exactly maxLen
        // EXCEPT: if the token is 'end', use < to prefer wrapping
        // This avoids packing 'end' to fill exactly maxLen
        const isEndToken = token === "end";
        const fits = isEndToken ? candidate.length < maxLen : candidate.length <= maxLen;

        if (fits) {
          currentLine = candidate;
        } else {
          lines.push(currentLine);
          currentLine = token;
        }
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines.join("\n") + (lines.length > 0 ? "\n" : "");
  }

  // Render a comment for tight mode
  private renderComment(comment: luaparse.Comment): string {
    if (comment.raw) {
      return comment.raw.trim();
    }
    return "--" + comment.value;
  }

  // --- low-level emit helpers ---

  private emit(s: string) {
    this.currentLine += s;
  }

  private newline() {
    this.flushLine();
  }

  private flushLine() {
    this.buf.push(this.currentLine + "\n");
    this.currentLine = "";
  }

  private emitKeyword(s: string) {
    this.emit(s);
  }

  private startPos(node: { range?: [number, number] } | any): number {
    if (node && Array.isArray(node.range) && node.range.length > 0) {
      return node.range[0] as number;
    }
    return 0;
  }

  private printIndent() {
    const indentLevel = Math.min(this.indentLevel, this.options.maxIndentLevel);
    this.buf.push(this.indentUnit.repeat(indentLevel));
    //   if (!this.options.stripWhitespace) {
    //      this.buf.push(this.indentUnit.repeat(this.indentLevel));
    //   }
  }

  private printBlock(body: luaparse.Statement[]) {
    const comments = [...(this.blockComments.get(body) || [])];
    const items: Array<luaparse.Statement | luaparse.Comment> = [];
    let ci = 0;

    for (const stmt of body) {
      while (ci < comments.length && this.startPos(comments[ci]) <= this.startPos(stmt)) {
        items.push(comments[ci]);
        ci++;
      }
      items.push(stmt);
    }
    while (ci < comments.length) {
      items.push(comments[ci]);
      ci++;
    }

    const mode = this.options.lineBehavior || "pretty";
    const maxLen = this.options.maxLineLength || 120;

    // In inline mode, render all statements space-separated on one line (no newlines)
    if (this.inlineMode) {
      for (let i = 0; i < items.length; i++) {
        const node = items[i];
        if (i > 0) this.emit(" ");
        this.printStatementInline(node);
      }
      return;
    }

    // In pretty mode, print each statement on its own line
    if (mode === "pretty") {
      for (const node of items) {
        this.printIndent();
        this.printStatement(node);
      }
      return;
    }

    // single-line-blocks mode: blocks are either entirely single-line or multi-line
    // (tight mode is handled separately via printTightMode)
    const flushLineIfAny = () => {
      if (this.currentLine.length > 0) this.flushLine();
    };

    for (const node of items) {
      // Comments always get their own line
      if (node.type === "Comment") {
        flushLineIfAny();
        this.printIndent();
        this.printStatement(node);
        continue;
      }

      const stmt = node as luaparse.Statement;
      const inline = this.renderInlineStatement(stmt, maxLen);
      const indent = this.indentUnit.repeat(Math.min(this.indentLevel, this.options.maxIndentLevel));

      // Check if inline version fits on its own line (with indent)
      const inlineWithIndent = inline !== null ? indent + inline : null;
      const inlineFits = inlineWithIndent !== null && inlineWithIndent.length < maxLen;

      if (inlineFits) {
        // Try to pack onto current line
        const sep = this.currentLine.length === 0 ? "" : " ";
        const prefix = this.currentLine.length === 0 ? indent : this.currentLine;
        const candidate = prefix + sep + inline;

        if (candidate.length < maxLen || this.currentLine.length === 0) {
          if (this.currentLine.length === 0) {
            this.currentLine = indent + inline;
          } else {
            this.currentLine = this.currentLine + " " + inline;
          }
          continue;
        }
        // Doesn't fit on current line, but inline exists - start new line with inline
        flushLineIfAny();
        this.currentLine = indent + inline;
        continue;
      }

      // Fallback to normal multi-line printing for this statement
      flushLineIfAny();
      this.printIndent();
      this.printStatement(node);
    }

    // Ensure any buffered inline statements inside this block are flushed before exiting it.
    flushLineIfAny();
  }

  // Print a statement without any newline at the end (for inline mode)
  private printStatementInline(node: luaparse.Statement | luaparse.Comment): void {
    switch (node.type) {
      case "AssignmentStatement": {
        const st = node as luaparse.AssignmentStatement;
        const vars = st.variables.map((v) => this.expr(v)).join(",");
        const vals = st.init.map((v) => this.expr(v)).join(",");
        this.emit(vars + "=" + vals);
        break;
      }
      case "LocalStatement": {
        const st = node as luaparse.LocalStatement;
        const vars = st.variables.map((v) => this.expr(v)).join(",");
        let s = "local " + vars;
        if (st.init && st.init.length > 0) {
          s += "=" + st.init.map((v) => this.expr(v)).join(",");
        }
        this.emit(s);
        break;
      }
      case "CallStatement": {
        const st = node as luaparse.CallStatement;
        this.emit(this.expr(st.expression));
        break;
      }
      case "FunctionDeclaration": {
        const fn = node as luaparse.FunctionDeclaration;
        let s = fn.isLocal ? "local function " : "function ";
        if (fn.identifier) {
          s += this.expr(fn.identifier);
        }
        s += "(" + fn.parameters.map((p) => this.expr(p)).join(",") + ") ";
        this.emit(s);
        this.printBlock(fn.body);
        this.emit(" end");
        break;
      }
      case "IfStatement": {
        const ifs = node as luaparse.IfStatement;
        for (let i = 0; i < ifs.clauses.length; i++) {
          const clause = ifs.clauses[i];
          if (clause.type === "IfClause") {
            this.emit("if " + this.expr(clause.condition) + " then ");
          } else if (clause.type === "ElseifClause") {
            this.emit(" elseif " + this.expr(clause.condition) + " then ");
          } else {
            this.emit(" else ");
          }
          this.printBlock(clause.body);
        }
        this.emit(" end");
        break;
      }
      case "WhileStatement": {
        const st = node as luaparse.WhileStatement;
        this.emit("while " + this.expr(st.condition) + " do ");
        this.printBlock(st.body);
        this.emit(" end");
        break;
      }
      case "RepeatStatement": {
        const st = node as luaparse.RepeatStatement;
        this.emit("repeat ");
        this.printBlock(st.body);
        this.emit(" until " + this.expr(st.condition));
        break;
      }
      case "ForNumericStatement": {
        const st = node as luaparse.ForNumericStatement;
        let s = "for " + this.expr(st.variable) + "=" + this.expr(st.start) + "," + this.expr(st.end);
        if (st.step) {
          s += "," + this.expr(st.step);
        }
        s += " do ";
        this.emit(s);
        this.printBlock(st.body);
        this.emit(" end");
        break;
      }
      case "ForGenericStatement": {
        const st = node as luaparse.ForGenericStatement;
        const vars = st.variables.map((v) => this.expr(v)).join(",");
        const iters = st.iterators.map((it) => this.expr(it)).join(",");
        this.emit("for " + vars + " in " + iters + " do ");
        this.printBlock(st.body);
        this.emit(" end");
        break;
      }
      case "ReturnStatement": {
        const st = node as luaparse.ReturnStatement;
        if (st.arguments.length > 0) {
          this.emit("return " + st.arguments.map((a) => this.expr(a)).join(","));
        } else {
          this.emit("return");
        }
        break;
      }
      case "BreakStatement":
        this.emit("break");
        break;
      case "DoStatement": {
        const st = node as luaparse.DoStatement;
        this.emit("do ");
        this.printBlock(st.body);
        this.emit(" end");
        break;
      }
      case "Comment":
        // Skip comments in inline mode
        break;
      default:
        break;
    }
  }

  // --- statement printer ---

  private printStatement(node: luaparse.Statement | luaparse.Comment): void {
    switch (node.type) {
      case "AssignmentStatement": {
        const st = node as luaparse.AssignmentStatement;
        const vars = st.variables.map((v) => this.expr(v)).join(",");
        const vals = st.init.map((v) => this.expr(v)).join(",");
        this.emit(vars);
        this.emit("=");
        this.emit(vals);
        this.newline();
        break;
      }

      case "LocalStatement": {
        const st = node as luaparse.LocalStatement;
        const vars = st.variables.map((v) => this.expr(v)).join(",");
        this.emitKeyword("local");
        this.emit(" ");
        this.emit(vars);
        if (st.init && st.init.length > 0) {
          const vals = st.init.map((v) => this.expr(v)).join(",");
          this.emit("=");
          this.emit(vals);
        }
        this.newline();
        break;
      }

      case "CallStatement": {
        const st = node as luaparse.CallStatement;
        this.emit(this.expr(st.expression));
        this.newline();
        break;
      }

      case "FunctionDeclaration": {
        const fn = node as luaparse.FunctionDeclaration;
        if (fn.isLocal) {
          this.emitKeyword("local");
          this.emit(" ");
        }
        this.emitKeyword("function");
        this.emit(" ");
        if (fn.identifier) {
          this.emit(this.expr(fn.identifier));
        }
        this.emit("(");
        this.emit(fn.parameters.map((p) => this.expr(p)).join(","));
        this.emit(")");
        this.newline();
        this.indentLevel++;
        this.printBlock(fn.body);
        this.indentLevel--;
        this.printIndent();
        this.emitKeyword("end");
        this.newline();
        break;
      }

      case "IfStatement": {
        const ifs = node as luaparse.IfStatement;
        ifs.clauses.forEach((clause, idx) => {
          // The enclosing block printer (`printBlock`) emits indentation only once for the
          // top-level statement. Subsequent clauses need to re-emit indentation explicitly,
          // otherwise `elseif`/`else` start at column 0.
          if (idx > 0) {
            this.printIndent();
          }
          if (clause.type === "IfClause") {
            this.emitKeyword("if");
            this.emit(" ");
            this.emit(this.expr(clause.condition));
            this.emitKeyword(" then");
          } else if (clause.type === "ElseifClause") {
            this.emitKeyword("elseif");
            this.emit(" ");
            this.emit(this.expr(clause.condition));
            this.emitKeyword(" then");
          } else {
            this.emitKeyword("else");
          }
          this.newline();
          this.indentLevel++;
          this.printBlock(clause.body);
          this.indentLevel--;
        });
        this.printIndent();
        this.emitKeyword("end");
        this.newline();
        break;
      }

      case "WhileStatement": {
        const st = node as luaparse.WhileStatement;
        this.emitKeyword("while");
        this.emit(" ");
        this.emit(this.expr(st.condition));
        this.emitKeyword(" do");
        this.newline();
        this.indentLevel++;
        this.printBlock(st.body);
        this.indentLevel--;
        this.printIndent();
        this.emitKeyword("end");
        this.newline();
        break;
      }

      case "RepeatStatement": {
        const st = node as luaparse.RepeatStatement;
        this.emitKeyword("repeat");
        this.newline();
        this.indentLevel++;
        this.printBlock(st.body);
        this.indentLevel--;
        this.emitKeyword("until");
        this.emit(" ");
        this.emit(this.expr(st.condition));
        this.newline();
        break;
      }

      case "ForNumericStatement": {
        const st = node as luaparse.ForNumericStatement;
        this.emitKeyword("for");
        this.emit(" ");
        this.emit(this.expr(st.variable));
        this.emit("=");
        this.emit(this.expr(st.start));
        this.emit(",");
        this.emit(this.expr(st.end));
        if (st.step) {
          this.emit(",");
          this.emit(this.expr(st.step));
        }
        this.emitKeyword(" do");
        this.newline();
        this.indentLevel++;
        this.printBlock(st.body);
        this.indentLevel--;
        this.printIndent();
        this.emitKeyword("end");
        this.newline();
        break;
      }

      case "ForGenericStatement": {
        const st = node as luaparse.ForGenericStatement;
        this.emitKeyword("for");
        this.emit(" ");
        this.emit(st.variables.map((v) => this.expr(v)).join(","));
        this.emitKeyword(" in ");
        this.emit(st.iterators.map((it) => this.expr(it)).join(","));
        this.emitKeyword(" do");
        this.newline();
        this.indentLevel++;
        this.printBlock(st.body);
        this.indentLevel--;
        this.printIndent();
        this.emitKeyword("end");
        this.newline();
        break;
      }

      case "ReturnStatement": {
        const st = node as luaparse.ReturnStatement;
        this.emitKeyword("return");
        if (st.arguments.length > 0) {
          this.emit(" ");
          this.emit(st.arguments.map((a) => this.expr(a)).join(","));
        }
        this.newline();
        break;
      }

      case "BreakStatement": {
        this.emitKeyword("break");
        this.newline();
        break;
      }

      case "DoStatement": {
        const st = node as luaparse.DoStatement;
        this.emitKeyword("do");
        this.newline();
        this.indentLevel++;
        this.printBlock(st.body);
        this.indentLevel--;
        this.printIndent();
        this.emitKeyword("end");
        this.newline();
        break;
      }

      case "Comment":
        this.printComment(node as luaparse.Comment);
        break;
      default:
        // console.warn("Unimplemented statement type:", node.type);
        break;
    }
  }

  // Try to render a statement as a single-line string.
  // For single-line-blocks mode: only return non-null if the entire statement (including nested blocks) fits on one line.
  // Returns null if the statement cannot be rendered inline under the given constraints.
  private renderInlineStatement(stmt: luaparse.Statement, maxLen: number): string | null {
    // Use a temporary printer in inline mode to render everything on one line
    const temp = new LuaPrinter(this.options, this.blockComments);
    temp.inlineMode = true;
    temp.buf = [];
    temp.currentLine = "";
    temp.printStatementInline(stmt);
    const out = temp.currentLine.trim();

    // If it exceeds maxLen, cannot inline
    if (out.length > maxLen) {
      return null;
    }

    return out;
  }

  // Check if statement contains nested blocks
  private isBlockStatement(stmt: luaparse.Statement): boolean {
    switch (stmt.type) {
      case "IfStatement":
      case "WhileStatement":
      case "RepeatStatement":
      case "ForNumericStatement":
      case "ForGenericStatement":
      case "FunctionDeclaration":
      case "DoStatement":
        return true;
      default:
        return false;
    }
  }

  // --- expression printer ---

  private expr(node: luaparse.Expression | luaparse.Node, parentPrec = 0): string {
    if (!node) return "";

    switch (node.type) {
      case "Identifier":
        return (node as luaparse.Identifier).name;

      case "StringLiteral":
        return this.stringLiteral(node as luaparse.StringLiteral);

      case "NumericLiteral":
        return this.numericLiteral(node as luaparse.NumericLiteral);

      case "BooleanLiteral":
        return (node as luaparse.BooleanLiteral).value ? "true" : "false";

      case "NilLiteral":
        return "nil";

      case "VarargLiteral":
        return "...";

      case "TableConstructorExpression":
        return this.tableConstructor(node as luaparse.TableConstructorExpression);

      case "UnaryExpression":
        return this.unaryExpr(node as luaparse.UnaryExpression, parentPrec);

      case "BinaryExpression":
        return this.binaryExpr(node as luaparse.BinaryExpression, parentPrec);

      case "LogicalExpression":
        return this.logicalExpr(node as luaparse.LogicalExpression, parentPrec);

      case "MemberExpression":
        return this.memberExpr(node as luaparse.MemberExpression);

      case "IndexExpression":
        return this.indexExpr(node as luaparse.IndexExpression);

      case "CallExpression":
        return this.callExpr(node as luaparse.CallExpression);

      case "TableCallExpression":
        return this.tableCallExpr(node as luaparse.TableCallExpression);

      case "StringCallExpression":
        return this.stringCallExpr(node as luaparse.StringCallExpression);

      case "FunctionDeclaration":
        return this.functionExpr(node as luaparse.FunctionDeclaration);

      default:
        return `<${node.type}>`;
    }
  }

  private stringLiteral(node: luaparse.StringLiteral): string {
    if (node.raw) return node.raw;
    return toLuaStringLiteral(node.value);
  }

  private numericLiteral(node: luaparse.NumericLiteral, options?: { forceLeadingZero?: boolean }): string {
    const value = node.value;
    const decimalStr = Number.isFinite(value) ? value.toString(10) : String(value);
    const candidates: string[] = [decimalStr];
    const expStr = Number.isFinite(value) ? this.normalizeExponential(value.toExponential()) : null;
    if (expStr) candidates.push(expStr);

    const altExpStr = Number.isFinite(value) ? this.exponentialFromDecimalString(decimalStr) : null;
    if (altExpStr) candidates.push(altExpStr);

    let best = candidates[0];
    for (const cand of candidates) {
      if (cand.length < best.length) best = cand;
    }

    if (/^-?0\.\d/.test(best)) {
      const compact = best.replace(/^(-?)0\./, "$1.");
      if (options?.forceLeadingZero && /^-?\./.test(compact)) {
        return compact.replace(/^(-?)\./, "$10.");
      }
      return compact;
    }

    if (options?.forceLeadingZero && /^-?\./.test(best)) {
      return best.replace(/^(-?)\./, "$10.");
    }

    return best;
  }

  private normalizeExponential(text: string): string {
    const parts = text.split("e");
    if (parts.length !== 2) return text;

    let mantissa = parts[0];
    let exponent = parts[1];
    if (exponent.startsWith("+")) exponent = exponent.slice(1);

    if (mantissa.includes(".")) {
      mantissa = mantissa.replace(/0+$/, "").replace(/\.$/, "");
    }

    return `${mantissa}e${exponent}`;
  }

  private exponentialFromDecimalString(text: string): string | null {
    const match = text.match(/^(-?)(\d+)(?:\.(\d+))?$/);
    if (!match) return null;

    const sign = match[1];
    const intPart = match[2];
    const fracPart = match[3] || "";

    if (fracPart.length === 0) {
      const trimmed = intPart.replace(/0+$/, "");
      const zeros = intPart.length - trimmed.length;
      if (zeros <= 0 || trimmed.length === 0) return null;
      return `${sign}${trimmed}e${zeros}`;
    }

    if (/^0+$/.test(intPart)) {
      const leadingZeros = fracPart.match(/^0+/)?.[0].length ?? 0;
      const digits = fracPart.slice(leadingZeros);
      if (digits.length === 0) return null;
      const exponent = -(leadingZeros + 1);
      const mantissa = digits.length === 1 ? digits : `${digits[0]}.${digits.slice(1)}`;
      return `${sign}${mantissa}e${exponent}`;
    }

    return null;
  }

  private tableConstructor(node: luaparse.TableConstructorExpression): string {
    if (node.fields.length === 0) return "{}";

    const parts: string[] = [];
    for (const f of node.fields) {
      if (f.type === "TableKey") {
        parts.push(`[${this.expr(f.key)}]=${this.expr(f.value)}`);
      } else if (f.type === "TableKeyString") {
        // luaparse gives key as an Identifier or StringLiteral
        parts.push(`${this.expr(f.key)}=${this.expr(f.value)}`);
      } else {
        // TableValue
        parts.push(this.expr(f.value));
      }
    }
    return `{${parts.join(",")}}`;
  }

  private unaryExpr(node: luaparse.UnaryExpression, parentPrec: number): string {
    const prec = getPrecedence(node);
    const arg = this.expr(node.argument, prec);
    const op = node.operator;

    let s: string;
    if (op === "not") {
      s = `not ${arg}`;
    } else {
      s = op + arg;
    }

    if (prec < parentPrec) s = `(${s})`;
    return s;
  }

  private binaryExpr(node: luaparse.BinaryExpression, parentPrec: number): string {
    const prec = getPrecedence(node);
    const isRightAssociative = this.isRightAssociativeOperator(node.operator);
    const leftRaw = node.operator === ".." ? this.concatLeftExpr(node.left, prec) : this.expr(node.left, prec);
    const left = isRightAssociative && getPrecedence(node.left) === prec ? `(${leftRaw})` : leftRaw;
    const rightRaw = node.operator === ".." ? this.concatRightExpr(node.right, prec) : this.expr(node.right, prec);
    const rightSafe = node.operator === ".." ? this.ensureConcatSafeRight(rightRaw) : rightRaw;
    const right = !isRightAssociative && getPrecedence(node.right) === prec ? `(${rightSafe})` : rightSafe;
    let s = `${left}${node.operator}${right}`;
    if (prec < parentPrec) s = `(${s})`;
    return s;
  }

  private concatLeftExpr(node: luaparse.Expression, parentPrec: number): string {
    if (node.type === "NumericLiteral") {
      return `(${this.numericLiteral(node as luaparse.NumericLiteral)})`;
    }
    if (node.type === "UnaryExpression") {
      const unary = node as luaparse.UnaryExpression;
      if (unary.operator === "-" && unary.argument.type === "NumericLiteral") {
        const arg = this.numericLiteral(unary.argument as luaparse.NumericLiteral);
        return `(-${arg})`;
      }
    }
    if (node.type === "BinaryExpression") {
      const bin = node as luaparse.BinaryExpression;
      const prec = getPrecedence(bin);
      const left = this.expr(bin.left, prec);
      let right = this.expr(bin.right, prec);
      if (this.isNumericLiteralLike(bin.right)) {
        right = `(${right})`;
      }
      let s = `${left}${bin.operator}${right}`;
      if (prec < parentPrec) s = `(${s})`;
      return s;
    }
    return this.expr(node, parentPrec);
  }

  private concatRightExpr(node: luaparse.Expression, parentPrec: number): string {
    if (node.type === "NumericLiteral") {
      return this.numericLiteral(node as luaparse.NumericLiteral, { forceLeadingZero: true });
    }
    if (node.type === "UnaryExpression") {
      const unary = node as luaparse.UnaryExpression;
      if (unary.operator === "-" && unary.argument.type === "NumericLiteral") {
        const arg = this.numericLiteral(unary.argument as luaparse.NumericLiteral, { forceLeadingZero: true });
        let s = `-${arg}`;
        if (getPrecedence(unary) < parentPrec) s = `(${s})`;
        return s;
      }
    }
    return this.expr(node, parentPrec);
  }

  private ensureConcatSafeRight(text: string): string {
    if (text.startsWith("-.")) {
      return "-0" + text.slice(1);
    }
    if (text.startsWith(".")) {
      return "0" + text;
    }
    return text;
  }

  private logicalExpr(node: luaparse.LogicalExpression, parentPrec: number): string {
    const prec = getPrecedence(node);
    const left = this.expr(node.left, prec);
    const rightRaw = this.expr(node.right, prec);
    const right = getPrecedence(node.right) === prec ? `(${rightRaw})` : rightRaw;
    let s = `${left} ${node.operator} ${right}`;
    if (prec < parentPrec) s = `(${s})`;
    return s;
  }

  private memberExpr(node: luaparse.MemberExpression): string {
    // luaparse usually gives . or : in node.indexer
    const base = this.prefixBase(node.base);
    const id = this.expr(node.identifier);
    const indexer = node.indexer || ".";
    return `${base}${indexer}${id}`;
  }

  private indexExpr(node: luaparse.IndexExpression): string {
    const base = this.prefixBase(node.base);
    return `${base}[${this.expr(node.index)}]`;
  }

  private callExpr(node: luaparse.CallExpression): string {
    const base = this.prefixBase(node.base);
    const args = node.arguments.map((a) => this.expr(a)).join(",");
    return `${base}(${args})`;
  }

  private tableCallExpr(node: luaparse.TableCallExpression): string {
    // sugar: f{...}  → f({ ... })
    const base = this.prefixBase(node.base);
    const arg = this.expr(node.arguments);
    return `${base}(${arg})`;
  }

  private stringCallExpr(node: luaparse.StringCallExpression): string {
    // sugar: f"str" → f("str")
    const base = this.prefixBase(node.base);
    const arg = this.stringLiteral(node.argument as luaparse.StringLiteral);
    return `${base}(${arg})`;
  }

  private isRightAssociativeOperator(op: string): boolean {
    return op === "^" || op === "..";
  }

  private isPrefixExpression(node: luaparse.Expression): boolean {
    switch (node.type) {
      case "Identifier":
      case "MemberExpression":
      case "IndexExpression":
      case "CallExpression":
      case "TableCallExpression":
      case "StringCallExpression":
        return true;
      default:
        return false;
    }
  }

  private prefixBase(node: luaparse.Expression): string {
    const base = this.expr(node, 100);
    if (this.isPrefixExpression(node)) return base;
    return this.isParenthesized(base) ? base : `(${base})`;
  }

  private isNumericLiteralLike(node: luaparse.Expression): boolean {
    if (node.type === "NumericLiteral") return true;
    if (node.type === "UnaryExpression") {
      const unary = node as luaparse.UnaryExpression;
      return unary.operator === "-" && unary.argument.type === "NumericLiteral";
    }
    return false;
  }

  private isParenthesized(text: string): boolean {
    return text.length >= 2 && text.startsWith("(") && text.endsWith(")");
  }

  private functionExpr(node: luaparse.FunctionDeclaration): string {
    // function used as expression: "function(a,b) ... end"
    const params = node.parameters.map((p) => this.expr(p)).join(",");
    const bodyPrinter = new LuaPrinter(this.options, this.blockComments);
    // reuse statement printer but avoid duplicating indent handling:
    const innerChunk: luaparse.Chunk = {
      type: "Chunk",
      body: node.body,
      comments: [],
      //globals: [],
    };
    const bodyCode = bodyPrinter.print(innerChunk).trimEnd();

    return `function(${params})\n${bodyCode}\nend`;
  }

  private printComment(node: luaparse.Comment) {
    if (node.raw) {
      this.emit(node.raw);
    } else {
      this.emit("--" + node.value);
    }
    this.newline();
  }
}

type LuaRange = [number, number];

function nodeRange(node: { range?: LuaRange } | any): LuaRange {
  if (node && Array.isArray(node.range) && node.range.length > 1) {
    return node.range as LuaRange;
  }
  return [0, Number.MAX_SAFE_INTEGER];
}

function rangeContains(outer: LuaRange, inner: LuaRange): boolean {
  return inner[0] >= outer[0] && inner[1] <= outer[1];
}

// Collect all statement blocks (function bodies, if/else bodies, loops, etc.)
function collectBlocksFromStatement(
  node: luaparse.Statement,
  blocks: Array<{ body: luaparse.Statement[]; range: LuaRange }>,
) {
  switch (node.type) {
    case "FunctionDeclaration": {
      const fn = node as luaparse.FunctionDeclaration;
      blocks.push({ body: fn.body, range: nodeRange(fn) });
      fn.body.forEach((st) => collectBlocksFromStatement(st, blocks));
      break;
    }

    case "IfStatement": {
      const ifs = node as luaparse.IfStatement;
      ifs.clauses.forEach((clause) => {
        blocks.push({ body: clause.body, range: nodeRange(clause) });
        clause.body.forEach((st) => collectBlocksFromStatement(st, blocks));
      });
      break;
    }

    case "WhileStatement":
    case "RepeatStatement":
    case "ForNumericStatement":
    case "ForGenericStatement":
    case "DoStatement": {
      const body = node.body as luaparse.Statement[];
      blocks.push({ body, range: nodeRange(node) });
      body.forEach((st) => collectBlocksFromStatement(st, blocks));
      break;
    }

    default:
      break;
  }
}

function collectAllStatementBlocks(chunk: luaparse.Chunk): Array<{ body: luaparse.Statement[]; range: LuaRange }> {
  const blocks: Array<{ body: luaparse.Statement[]; range: LuaRange }> = [
    { body: chunk.body, range: nodeRange(chunk) },
  ];

  for (const st of chunk.body) {
    collectBlocksFromStatement(st, blocks);
  }

  return blocks;
}

// Build a map from statement blocks to comments contained within them
// why is this needed?
// luaparse gives comments attached to the root chunk only, not to inner blocks
// so we have to manually assign them to the correct blocks
function buildCommentMap(ast: luaparse.Chunk): Map<luaparse.Statement[], luaparse.Comment[]> {
  const blocks = collectAllStatementBlocks(ast);
  const map = new Map<luaparse.Statement[], luaparse.Comment[]>();
  blocks.forEach((b) => map.set(b.body, []));

  const comments = ast.comments || [];
  for (const c of comments) {
    const cr = nodeRange(c);
    let target = blocks[0];
    for (const blk of blocks) {
      if (rangeContains(blk.range, cr)) {
        const widthCurrent = target ? target.range[1] - target.range[0] : Number.MAX_SAFE_INTEGER;
        const widthCandidate = blk.range[1] - blk.range[0];
        if (widthCandidate <= widthCurrent) {
          target = blk;
        }
      }
    }

    const list = map.get(target.body) || [];
    list.push(c as luaparse.Comment);
    map.set(target.body, list);
  }

  for (const [body, list] of map.entries()) {
    list.sort((a, b) => nodeRange(a)[0] - nodeRange(b)[0]);
  }

  return map;
}

// Generate Lua code from an AST
export function unparseLua(ast: luaparse.Chunk, ruleOptions: OptimizationRuleOptions): string {
  const generator = new LuaPrinter(ruleOptions, buildCommentMap(ast));
  return generator.print(ast);
}

export function parseLua(code: string): luaparse.Chunk | null {
  //console.log(code);
  try {
    const ast = luaparse.parse(code, {
      luaVersion: "5.3", // TIC-80 is 5.3-ish
      comments: true,
      locations: true,
      ranges: true,
    });
    return ast;
  } catch (error) {
    console.error("Error parsing Lua code:", error);
    console.log("Lua code:\n", code);
  }

  return null;
}

export type LuaProcessResult = {
  code: string;
  report: AliasPassReport;
  transformMap: LuaTransformMap;
};

export function processLuaWithReport(code: string, ruleOptions: OptimizationRuleOptions): LuaProcessResult {
  // Apply optimization rules
  //const options = {...DEFAULT_OPTIMIZATION_RULES, ...ruleOptions};

  // Strip debug blocks and lines before parsing (line-based string matching)
  let processedCode = code;
  const preparationMap = LuaTransformMapBuilder.identity(code.length);
  processedCode = disambiguateNumericConcat(processedCode, preparationMap);
  // if (ruleOptions.stripDebugBlocks) {
  //    // Strip debug blocks
  //    processedCode = replaceLuaBlock(processedCode, "-- BEGIN_DEBUG_ONLY", "-- END_DEBUG_ONLY", "");

  //    // Strip individual lines marked with -- DEBUG_ONLY
  //    const eol = processedCode.includes("\r\n") ? "\r\n" : "\n";
  //    const lines = processedCode.split(eol);
  //    const filteredLines = lines.filter(line => !line.includes("-- DEBUG_ONLY"));
  //    processedCode = filteredLines.join(eol);
  // }

  // Honor explicit directives to keep certain regions verbatim
  // doing this at text level for simplification and because the printer can reformat everything.
  const disableMinify = extractLuaBlocks(
    processedCode,
    "-- MINIFICATION OFF",
    "-- MINIFICATION ON",
    (i) => `__SOMATIC_DISABLED_MINIFICATION_BLOCK_${i}__()`,
    { strict: false },
  );
  const disabledBlockOrigins = new Map(disableMinify.blocks.map((block) => [
    block.placeholder,
    preparationMap.mapOffset(block.sourceContentBegin, "right")?.offset ?? 0,
  ]));
  for (const block of [...disableMinify.blocks].sort((a, b) => b.sourceBegin - a.sourceBegin)) {
    const origin = preparationMap.mapOffset(block.sourceBegin, "right");
    preparationMap.spliceRange(
      block.sourceBegin,
      block.sourceEnd,
      block.replacementLength,
      origin,
      "anchor",
    );
  }
  processedCode = disableMinify.code;

  let ast = parseLua(processedCode);
  if (!ast) {
    console.error("Failed to parse Lua code; returning original code.");
    return {
      code,
      report: createEmptyAliasPassReport(),
      transformMap: LuaTransformMapBuilder.identity(code.length).toMap(),
    };
  }
  annotateLuaAstOrigins(ast, preparationMap.toMap(), code);
  //console.log("Parsed Lua AST:", ast);

  if (ruleOptions.stripComments) {
    ast.comments = [];
  }

  if (ruleOptions.simplifyExpressions) {
    ast = simplifyExpressionsInAST(ast);
  }

  if (ruleOptions.removeUnusedLocals) {
    ast = removeUnusedLocalsInAST(ast);
  }

  if (ruleOptions.removeUnusedFunctions) {
    ast = removeUnusedFunctionsInAST(ast, {
      functionNamesToKeep: ruleOptions.functionNamesToKeep,
    });
  }

  const aliasStrategies: AliasStrategy[] = [];
  if (ruleOptions.aliasLiterals) aliasStrategies.push(literalAliasStrategy);
  if (ruleOptions.aliasRepeatedExpressions) aliasStrategies.push(repeatedExpressionAliasStrategy);
  const aliasResult = runAliasPasses(ast, aliasStrategies);
  ast = aliasResult.ast;

  if (ruleOptions.packLocalDeclarations) {
    ast = packLocalDeclarationsInAST(ast);
  }

  if (ruleOptions.renameLocalVariables) {
    ast = renameLocalVariablesInAST(ast);
  }

  if (
    ruleOptions.renameSpecifiedGlobalSymbols !== false &&
    ruleOptions.globalSymbolsToRename &&
    ruleOptions.globalSymbolsToRename.length > 0
  ) {
    ast = renameAllowedGlobalsInAST(ast, {
      namesToRename: ruleOptions.globalSymbolsToRename,
      namesToKeep: ruleOptions.functionNamesToKeep,
    });
  }

  if (ruleOptions.tableEntryKeysToRename && ruleOptions.tableEntryKeysToRename.length > 0) {
    ast = renameAllowedTableKeysInAST(ast, ruleOptions.tableEntryKeysToRename);
  }

  if (ruleOptions.renameTableFields) {
    ast = renameTableFieldsInAST(ast);
  }

  const minified = unparseLua(ast, ruleOptions);
  const emittedAst = parseLua(minified);
  if (!emittedAst) {
    throw new Error("Lua printer produced output that could not be parsed for source mapping");
  }
  const printedMap = createLuaPrintTransformMap(ast, emittedAst, code, minified);
  const restored = reinsertDisableMinificationBlocksWithMap(
    minified,
    printedMap,
    disableMinify.blocks.map((block) => ({
      placeholder: block.placeholder,
      content: block.content,
      inputContentBegin: disabledBlockOrigins.get(block.placeholder) ?? 0,
    })),
  );
  return {
    code: restored.code,
    report: aliasResult.report,
    transformMap: restored.transformMap,
  };
}

export function processLua(code: string, ruleOptions: OptimizationRuleOptions): string {
  return processLuaWithReport(code, ruleOptions).code;
}

function disambiguateNumericConcat(code: string, transformMap: LuaTransformMapBuilder): string {
  // Insert a space before concatenation when a numeric literal is immediately followed by `..`.
  // Examples: `15.."x"` -> `15 .."x"`, `.15.."x"` -> `.15 .."x"`
  const insertions: number[] = [];
  const pattern = /(\d(?:\.\d+)?|\.\d+)\.\./g;
  for (const match of code.matchAll(pattern)) {
    insertions.push((match.index ?? 0) + match[1].length);
  }
  let output = code;
  for (const offset of insertions.sort((a, b) => b - a)) {
    const origin = transformMap.mapOffset(offset, "right");
    output = output.slice(0, offset) + " " + output.slice(offset);
    transformMap.spliceRange(offset, offset, 1, origin, "anchor");
  }
  return output;
}

type DisabledMinificationBlock = {
  placeholder: string; //
  content: string;
  inputContentBegin: number;
};

// Escape special characters in a string for use in a RegExp
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function appendNormalizedBlock(
  builder: LuaTransformMapBuilder,
  content: string,
  inputContentBegin: number,
): string {
  const normalized = content.replace(/\r?\n/g, "\n").replace(/\n+$/g, "");
  builder.appendAnchor(1, inputContentBegin);
  let sourceOffset = 0;
  const lines = normalized.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    builder.appendIdentity(line.length, inputContentBegin + sourceOffset);
    sourceOffset += line.length;
    if (i < lines.length - 1) {
      builder.appendAnchor(1, inputContentBegin + sourceOffset);
      if (content.startsWith("\r\n", sourceOffset)) {
        sourceOffset += 2;
      } else if (content[sourceOffset] === "\n" || content[sourceOffset] === "\r") {
        sourceOffset++;
      }
    }
  }
  builder.appendAnchor(1, inputContentBegin + sourceOffset);
  return `\n${normalized}\n`;
}

function reinsertDisableMinificationBlocksWithMap(
  source: string,
  transformMap: LuaTransformMap,
  blocks: DisabledMinificationBlock[],
): { code: string; transformMap: LuaTransformMap } {
  if (blocks.length === 0) {
    return { code: source, transformMap };
  }

  const replacements = blocks.flatMap((block) => {
    const placeholderIdentifier = block.placeholder.endsWith("()")
      ? block.placeholder.slice(0, -2)
      : null;
    const placeholderPattern = placeholderIdentifier
      // Traceable output puts the call's identifier and parentheses on separate
      // lines. They remain the same token sequence and must still be replaced as
      // one placeholder statement.
      ? `${escapeRegExp(placeholderIdentifier)}\\s*\\(\\s*\\)`
      : escapeRegExp(block.placeholder);
    const pattern = new RegExp(`[\\t ]*${placeholderPattern}[\\t ]*`, "g");
    const match = pattern.exec(source);
    return match
      ? [{ start: match.index, end: match.index + match[0].length, block }]
      : [];
  }).sort((a, b) => a.start - b.start);

  const builder = new LuaTransformMapBuilder(transformMap.inputLength);
  let output = "";
  let cursor = 0;
  for (const replacement of replacements) {
    const prefix = source.slice(cursor, replacement.start);
    output += prefix;
    builder.appendMappedSlice(prefix.length, transformMap, cursor);
    output += appendNormalizedBlock(
      builder,
      replacement.block.content,
      replacement.block.inputContentBegin,
    );
    cursor = replacement.end;
  }
  const suffix = source.slice(cursor);
  output += suffix;
  builder.appendMappedSlice(suffix.length, transformMap, cursor);
  return { code: output, transformMap: builder.toMap() };
}
