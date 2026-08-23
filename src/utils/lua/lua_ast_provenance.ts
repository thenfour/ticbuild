import * as luaparse from "luaparse";
import { walkAST } from "./lua_ast";
import { LuaTransformMap, mapLuaTransformOffset } from "./lua_transform_map";

export type LuaNodeOrigin = {
  inputBegin: number;
  inputEnd: number;
  // null explicitly identifies a generated identifier with no authored symbol.
  originalName?: string | null;
};

const originKey = Symbol("ticbuild.luaNodeOrigin");

// Optimizers only carry input-Lua ranges. File/source-map composition remains
// outside the Lua optimization layer.

type NodeWithOrigin = luaparse.Node & {
  [originKey]?: LuaNodeOrigin;
};

export function setLuaNodeOrigin(node: luaparse.Node, origin: LuaNodeOrigin): void {
  Object.defineProperty(node as NodeWithOrigin, originKey, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: { ...origin },
  });
}

export function getLuaNodeOrigin(node: luaparse.Node | null | undefined): LuaNodeOrigin | null {
  if (!node) {
    return null;
  }
  return (node as NodeWithOrigin)[originKey] ?? null;
}

export function inheritLuaNodeOrigin<T extends luaparse.Node>(
  node: T,
  source: luaparse.Node,
  originalName?: string | null,
): T {
  const sourceOrigin = getLuaNodeOrigin(source);
  if (sourceOrigin) {
    setLuaNodeOrigin(node, {
      ...sourceOrigin,
      originalName: originalName === undefined ? sourceOrigin.originalName : originalName,
    });
  }
  return node;
}

export function inheritCombinedLuaNodeOrigin<T extends luaparse.Node>(
  node: T,
  sources: readonly luaparse.Node[],
  originalName?: string | null,
): T {
  const origins = sources.map(getLuaNodeOrigin).filter((origin): origin is LuaNodeOrigin => origin !== null);
  if (origins.length > 0) {
    setLuaNodeOrigin(node, {
      inputBegin: Math.min(...origins.map((origin) => origin.inputBegin)),
      inputEnd: Math.max(...origins.map((origin) => origin.inputEnd)),
      originalName,
    });
  }
  return node;
}

export function annotateLuaAstOrigins(
  ast: luaparse.Chunk,
  preparationMap: LuaTransformMap,
  inputCode: string,
): void {
  walkAST(ast, (value) => {
    const node = value as luaparse.Node & { range?: [number, number] };
    if (!node?.type || !node.range) {
      return;
    }
    const begin = mapLuaTransformOffset(preparationMap, node.range[0], "right");
    const end = mapLuaTransformOffset(preparationMap, node.range[1], "left");
    if (!begin || !end) {
      return;
    }
    const originalName = node.type === "Identifier"
      ? inputCode.slice(begin.offset, end.offset)
      : undefined;
    setLuaNodeOrigin(node, {
      inputBegin: begin.offset,
      inputEnd: Math.max(begin.offset, end.offset),
      originalName,
    });
  });
}
