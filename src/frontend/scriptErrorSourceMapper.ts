import * as fs from "node:fs";
import { TicbuildProject } from "../backend/project";
import {
  loadSourceMapArtifact,
  SourceMapArtifactPaths,
  SourceMapLookup,
  SourceMapOriginalLocation,
} from "../backend/sourceMapLookup";
import {
  getScriptErrorFrameLine,
  ScriptErrorPayload,
} from "../backend/tic80Controller/scriptErrorProtocol";
import {
  LUA_LANGUAGE_ID,
  LuaFrameWhat,
  parseLuaErrorValueOrigin,
} from "../utils/lua/lua_debug";
import { hashBytesMd5 } from "../utils/utils";
import { ScriptErrorSourceMapper } from "./scriptErrorPresentation";
import { GetFinalLuaArtifactFileLeaf } from "./core";

// TIC-80 names the loaded cartridge chunk `cart` in Lua errors and debug frames.
// Only that runtime chunk is represented by ticbuild's generated Lua sidecars;
// native `[C]` and other loaded chunks must retain their runtime locations.
const TIC80_CART_FRAME_SOURCE = "cart";

function collectPreferredOriginalNames(error: ScriptErrorPayload, frameIndex: number): string[] {
  const frame = error.frames[frameIndex];
  const previousFrame = frameIndex > 0 ? error.frames[frameIndex - 1] : undefined;
  const candidates: Array<string | undefined> = [
    // The traceback does give us a structured native leaf frame for errors such
    // as calling an absent global. Its name is a stronger hint than arbitrary
    // prose in the message.
    previousFrame?.what === LuaFrameWhat.NativeFunction
      ? previousFrame.name || undefined
      : undefined,

    // Schema v1 has no structured identifier for the value implicated by a Lua
    // runtime error. This deliberately narrow parser handles known stock-Lua
    // message suffixes only; see lua_debug.ts and its tests for the exact cases.
    error.language === LUA_LANGUAGE_ID
      ? parseLuaErrorValueOrigin(error.message)?.symbol
      : undefined,
    frame?.name || undefined,
  ];

  return Array.from(new Set(candidates.filter((name): name is string => !!name)));
}

export class ScriptErrorSourceMapRegistry implements ScriptErrorSourceMapper {
  private sourceMapsByCodeHash = new Map<string, SourceMapLookup>();

  get size(): number {
    return this.sourceMapsByCodeHash.size;
  }

  replaceFromArtifacts(artifacts: readonly SourceMapArtifactPaths[]): number {
    const nextMaps = new Map<string, SourceMapLookup>();
    for (const artifact of artifacts) {
      const loaded = loadSourceMapArtifact(artifact);

      // TIC-80 reports the loaded code's MD5 with this exact prefix in the
      // script-error payload. Keying by it prevents a rebuilt/stale map from
      // being applied to different runtime code.
      const runtimeCodeHash = hashBytesMd5(loaded.generatedBytes);
      nextMaps.set(runtimeCodeHash, loaded.lookup);
    }
    this.sourceMapsByCodeHash = nextMaps;
    return nextMaps.size;
  }

  replaceFromProject(project: TicbuildProject): number {
    const importNames = new Set<string>();
    for (const block of project.resolvedCore.manifest.assembly.blocks) {
      const asset = block.asset;
      const importName = typeof asset === "string" ? asset : asset.import;
      if (importName) {
        importNames.add(importName);
      }
    }

    const artifacts: SourceMapArtifactPaths[] = [];
    for (const importName of Array.from(importNames).sort()) {
      const generatedPath = project.resolvedCore.resolveObjPath(GetFinalLuaArtifactFileLeaf(importName));
      const mapPath = `${generatedPath}.map`;
      if (fs.existsSync(generatedPath) && fs.existsSync(mapPath)) {
        artifacts.push({ generatedPath, mapPath });
      }
    }
    return this.replaceFromArtifacts(artifacts);
  }

  mapFrame(error: ScriptErrorPayload, frameIndex: number): SourceMapOriginalLocation | undefined {
    const sourceMap = this.sourceMapsByCodeHash.get(error.codeHash);
    const frame = error.frames[frameIndex];
    if (!sourceMap || !frame || frame.source !== TIC80_CART_FRAME_SOURCE) {
      return undefined;
    }

    const generatedLine = getScriptErrorFrameLine(frame);
    if (!generatedLine) {
      return undefined;
    }

    // Lua's traceback supplies no generated column. Prefer the mapping carrying
    // a matching original symbol when one of our carefully bounded hints exists.
    // Debug output, where statements retain distinct generated lines, normally
    // makes the deterministic first mapping exact; densely packed release output
    // can only be approximate when no symbol hint matches.
    return sourceMap.findOriginalNameOnGeneratedLine(
      generatedLine,
      collectPreferredOriginalNames(error, frameIndex),
    ) ?? sourceMap.firstMappingOnGeneratedLine(generatedLine);
  }
}

export function tryCreateCurrentProjectScriptErrorSourceMaps(): ScriptErrorSourceMapRegistry | undefined {
  try {
    const project = TicbuildProject.loadFromManifest();
    const registry = new ScriptErrorSourceMapRegistry();
    return registry.replaceFromProject(project) > 0 ? registry : undefined;
  } catch {
    return undefined;
  }
}
