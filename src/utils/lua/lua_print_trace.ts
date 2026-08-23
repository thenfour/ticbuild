import * as luaparse from "luaparse";
import { getLuaNodeOrigin } from "./lua_ast_provenance";
import { LuaTransformMap, LuaTransformSegment } from "./lua_transform_map";

// Correlate the semantic AST immediately before printing with a parse of the
// printer output. This keeps formatting code mapping-agnostic; if a printer
// normalization changes a subtree shape, its enclosing node remains the safe
// positional fallback.

type MappingCandidate = LuaTransformSegment & {
  priority: number;
};

const ignoredAstKeys = new Set(["type", "range", "loc", "raw", "comments"]);

function isAstNode(value: unknown): value is luaparse.Node {
  return !!value && typeof value === "object" && typeof (value as { type?: unknown }).type === "string";
}

function isStatementNode(node: luaparse.Node): boolean {
  return node.type.endsWith("Statement") || node.type === "FunctionDeclaration";
}

function getRange(node: luaparse.Node): [number, number] | null {
  const range = (node as luaparse.Node & { range?: [number, number] }).range;
  return range && range[1] >= range[0] ? range : null;
}

function getLineStart(code: string, offset: number): number {
  const newline = code.lastIndexOf("\n", Math.max(0, offset - 1));
  return newline < 0 ? 0 : newline + 1;
}

function getLineEnd(code: string, offset: number): number {
  const newline = code.indexOf("\n", offset);
  return newline < 0 ? code.length : newline + 1;
}

function addNodeCandidate(
  inputNode: luaparse.Node,
  outputNode: luaparse.Node,
  depth: number,
  inputCode: string,
  outputCode: string,
  candidates: MappingCandidate[],
): void {
  const origin = getLuaNodeOrigin(inputNode);
  const outputRange = getRange(outputNode);
  if (!origin || !outputRange || outputRange[1] <= outputRange[0]) {
    return;
  }

  const inputText = inputCode.slice(origin.inputBegin, origin.inputEnd);
  const outputText = outputCode.slice(outputRange[0], outputRange[1]);
  const isIdentity = inputText === outputText && inputText.length === outputText.length;
  const originalName = inputNode.type === "Identifier" && origin.originalName
    ? origin.originalName
    : undefined;
  candidates.push({
    outputBegin: outputRange[0],
    outputEnd: outputRange[1],
    inputOffset: origin.inputBegin,
    kind: isIdentity ? "identity" : "anchor",
    originalName,
    priority: depth * 10 + (inputNode.type === "Identifier" ? 9 : 5),
  });

  if (isStatementNode(inputNode)) {
    const lineBegin = getLineStart(outputCode, outputRange[0]);
    const lineEnd = getLineEnd(outputCode, Math.max(outputRange[0], outputRange[1] - 1));
    candidates.push({
      outputBegin: lineBegin,
      outputEnd: lineEnd,
      inputOffset: origin.inputBegin,
      kind: "anchor",
      priority: depth * 10 + 1,
    });
  }
}

function pairAstNodes(
  inputNode: luaparse.Node,
  outputNode: luaparse.Node,
  depth: number,
  inputCode: string,
  outputCode: string,
  candidates: MappingCandidate[],
): void {
  if (inputNode.type !== outputNode.type) {
    return;
  }
  addNodeCandidate(inputNode, outputNode, depth, inputCode, outputCode, candidates);

  for (const key of Object.keys(inputNode)) {
    if (ignoredAstKeys.has(key)) {
      continue;
    }
    const inputValue = (inputNode as unknown as Record<string, unknown>)[key];
    const outputValue = (outputNode as unknown as Record<string, unknown>)[key];
    if (isAstNode(inputValue) && isAstNode(outputValue)) {
      pairAstNodes(inputValue, outputValue, depth + 1, inputCode, outputCode, candidates);
      continue;
    }
    if (!Array.isArray(inputValue) || !Array.isArray(outputValue)) {
      continue;
    }
    if (inputValue.length !== outputValue.length) {
      continue;
    }
    const nodePairs = inputValue.map((inputChild, index) => ({
      inputChild,
      outputChild: outputValue[index],
    })).filter((pair) => isAstNode(pair.inputChild) || isAstNode(pair.outputChild));
    if (nodePairs.some((pair) =>
      !isAstNode(pair.inputChild) ||
      !isAstNode(pair.outputChild) ||
      pair.inputChild.type !== pair.outputChild.type
    )) {
      continue;
    }
    for (const pair of nodePairs) {
      pairAstNodes(
        pair.inputChild as luaparse.Node,
        pair.outputChild as luaparse.Node,
        depth + 1,
        inputCode,
        outputCode,
        candidates,
      );
    }
  }
}

function flattenCandidates(candidates: readonly MappingCandidate[], outputLength: number): LuaTransformSegment[] {
  type Events = { add: MappingCandidate[]; remove: MappingCandidate[] };
  const events = new Map<number, Events>();
  const eventAt = (offset: number): Events => {
    let event = events.get(offset);
    if (!event) {
      event = { add: [], remove: [] };
      events.set(offset, event);
    }
    return event;
  };

  for (const candidate of candidates) {
    const begin = Math.max(0, Math.min(outputLength, candidate.outputBegin));
    const end = Math.max(begin, Math.min(outputLength, candidate.outputEnd));
    if (begin === end) {
      continue;
    }
    const normalized = { ...candidate, outputBegin: begin, outputEnd: end };
    eventAt(begin).add.push(normalized);
    eventAt(end).remove.push(normalized);
  }
  eventAt(0);
  eventAt(outputLength);

  const offsets = Array.from(events.keys()).sort((a, b) => a - b);
  const active = new Set<MappingCandidate>();
  const output: LuaTransformSegment[] = [];
  for (let i = 0; i < offsets.length - 1; i++) {
    const offset = offsets[i];
    const event = events.get(offset)!;
    for (const candidate of event.remove) {
      active.delete(candidate);
    }
    for (const candidate of event.add) {
      active.add(candidate);
    }
    const end = offsets[i + 1];
    if (end <= offset || active.size === 0) {
      continue;
    }
    const selected = Array.from(active).sort((a, b) =>
      b.priority - a.priority ||
      (a.outputEnd - a.outputBegin) - (b.outputEnd - b.outputBegin)
    )[0];
    const inputOffset = selected.kind === "identity"
      ? selected.inputOffset + (offset - selected.outputBegin)
      : selected.inputOffset;
    const segment: LuaTransformSegment = {
      outputBegin: offset,
      outputEnd: end,
      inputOffset,
      kind: selected.kind,
      originalName: selected.originalName,
    };
    const previous = output[output.length - 1];
    const identityContinues = previous?.kind === "identity" && segment.kind === "identity" &&
      previous.inputOffset + (previous.outputEnd - previous.outputBegin) === segment.inputOffset;
    const anchorContinues = previous?.kind === "anchor" && segment.kind === "anchor" &&
      previous.inputOffset === segment.inputOffset;
    if (
      previous && previous.outputEnd === segment.outputBegin &&
      previous.originalName === segment.originalName &&
      (identityContinues || anchorContinues)
    ) {
      previous.outputEnd = segment.outputEnd;
    } else {
      output.push(segment);
    }
  }
  return output;
}

export function createLuaPrintTransformMap(
  inputAst: luaparse.Chunk,
  outputAst: luaparse.Chunk,
  inputCode: string,
  outputCode: string,
): LuaTransformMap {
  const candidates: MappingCandidate[] = [];
  pairAstNodes(inputAst, outputAst, 0, inputCode, outputCode, candidates);
  return {
    inputLength: inputCode.length,
    outputLength: outputCode.length,
    segments: flattenCandidates(candidates, outputCode.length),
  };
}
