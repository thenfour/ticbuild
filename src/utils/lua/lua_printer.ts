import * as luaparse from "luaparse";
import { LuaAstPrinter } from "./lua_ast_printer";
import { printTight2Lua } from "./lua_printer_tight2";
import { printTraceableLua } from "./lua_printer_traceable";
import { LuaPrinterOptions } from "./lua_printer_types";

export type { LuaLineBehavior, LuaPrinterOptions } from "./lua_printer_types";

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

// luaparse keeps all comments on the root; assign each to its narrowest statement block.
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
export class LuaPrinter {
  private readonly blockComments: Map<luaparse.Statement[], luaparse.Comment[]>;

  constructor(
    private readonly options: LuaPrinterOptions,
    blockComments?: Map<luaparse.Statement[], luaparse.Comment[]>,
  ) {
    this.blockComments = blockComments || new Map();
  }

  print(ast: luaparse.Chunk): string {
    const mode = this.options.lineBehavior || "pretty";
    if (mode === "traceable" || mode === "tight2") {
      const canonical = new LuaAstPrinter(
        { ...this.options, lineBehavior: "pretty" },
        this.blockComments,
      ).print(ast);
      return mode === "traceable"
        ? printTraceableLua(canonical)
        : printTight2Lua(canonical, this.options.maxLineLength);
    }

    return new LuaAstPrinter(this.options, this.blockComments).print(ast);
  }
}

export function unparseLua(ast: luaparse.Chunk, options: LuaPrinterOptions): string {
  return new LuaPrinter(options, buildCommentMap(ast)).print(ast);
}
