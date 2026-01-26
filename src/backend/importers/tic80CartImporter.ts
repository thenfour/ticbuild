// extracts chunks from tic80 cart into ImportedResource

import { readBinaryFileAsync } from "../../utils/fileSystem";
import { parseTic80Cart } from "../../utils/tic80/cartLoader";
import { Tic80Cart, Tic80CartChunkTypeKey } from "../../utils/tic80/tic80";
import { ExternalDependency, ImportedResourceBase, ResourceViewBase } from "../ImportedResourceTypes";
import { ImportDefinition } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";

export class Tic80CartResourceView extends ResourceViewBase {
  subAssets: Map<Tic80CartChunkTypeKey, Uint8Array> = new Map<Tic80CartChunkTypeKey, Uint8Array>();

  constructor() {
    super();
  }
  getSupportedChunkTypes(): Tic80CartChunkTypeKey[] {
    return Array.from(this.subAssets.keys());
  }
  getParallelChunkTypes(): Tic80CartChunkTypeKey[] {
    return Array.from(this.subAssets.keys());
  }
  getDataForChunk(project: TicbuildProjectCore, chunkType: Tic80CartChunkTypeKey): Uint8Array {
    const data = this.subAssets.get(chunkType);
    if (!data) {
      throw new Error(`Chunk type not found in Tic80CartResourceView: ${chunkType}`);
    }
    return data;
  }
}

// represents an imported tic80 cart, exposes as ImportedResourceBase which contains
// a sub-asset for each imported chunk.
export class Tic80Resource extends ImportedResourceBase {
  // map of chunk type key -> chunk data
  rootView: Tic80CartResourceView = new Tic80CartResourceView();
  cartPath: string;

  constructor(cartPath: string, spec: ImportDefinition, parsedCart: Tic80Cart) {
    super();
    this.cartPath = cartPath;

    if (!spec.chunks || spec.chunks.length === 0) {
      // import all chunks
      for (const chunk of parsedCart.chunks) {
        if (this.rootView.subAssets.has(chunk.chunkType)) {
          throw new Error(`Duplicate chunk type in TIC-80 cart: ${chunk.chunkType}`);
        }
        this.rootView.subAssets.set(chunk.chunkType, chunk.data);
      }
    } else {
      // import only specified chunks
      for (const chunkType of spec.chunks) {
        const chunk = parsedCart.chunks.find((c) => c.chunkType === chunkType);
        if (!chunk) {
          throw new Error(`Requested chunk type not found in TIC-80 cart: ${chunkType}`);
        }
        this.rootView.subAssets.set(chunk.chunkType, chunk.data);
      }
    }
  }

  dump(): void {
    console.log(`Tic80Resource dump for cart: ${this.cartPath}`);
    for (const [chunkType, data] of this.rootView.subAssets.entries()) {
      console.log(`  Chunk: ${chunkType}, size: ${data.length}`);
    }
  }

  getView(project: TicbuildProjectCore, chunks?: Tic80CartChunkTypeKey[]) {
    if (!chunks || chunks.length === 0) {
      return this.rootView;
    }
    const view = new Tic80CartResourceView();
    for (const chunkType of chunks) {
      const data = this.rootView.subAssets.get(chunkType);
      if (!data) {
        throw new Error(`Requested chunk type not found in Tic80Resource: ${chunkType}`);
      }
      view.subAssets.set(chunkType, data);
    }
    return view;
  }

  getDependencyList(): ExternalDependency[] {
    return [
      {
        path: this.cartPath, //
        reason: `Imported TIC-80 cartridge`,
      },
    ];
  }
}

// spec is assumed to be in the project.
export async function importTic80Cart(project: TicbuildProjectCore, spec: ImportDefinition): Promise<Tic80Resource> {
  // resolve the resource path.
  const path = project.resolveImportPath(spec);
  const data = await readBinaryFileAsync(path);
  const cart = parseTic80Cart(data);
  const resource = new Tic80Resource(path, spec, cart);
  return resource;
}
