import { readBinaryFileAsync } from "../../utils/fileSystem";
import { getCombinedCodeBytes, parseTic80Cart } from "../../utils/tic80/cartLoader";
import { formatTic80CartChunkType, Tic80Cart, Tic80CartChunk } from "../../utils/tic80/tic80";
import { ExternalDependency, ImportedResourceBase } from "../ImportedResourceTypes";
import { CartChunkFilter, ImportDefinition } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { MaterializedImportSource, materializeImportSource, requireFileImportSource } from "../importSources";

function filterChunks(
  chunks: readonly Tic80CartChunk[],
  filter: CartChunkFilter,
  importName: string,
): Tic80CartChunk[] {
  if (filter.bank !== undefined && filter.bank !== 0 && filter.chunks?.includes("CODE")) {
    throw new Error(`Import ${importName}: CODE can only be selected at source bank 0`);
  }
  const selected = chunks.filter(
    (chunk) => (filter.chunks === undefined || filter.chunks.some((type) => type === chunk.chunkType)) &&
      (filter.bank === undefined || filter.bank === chunk.bank),
  );
  if (selected.length === 0) {
    const types = filter.chunks === undefined ? "any chunk type" : JSON.stringify(filter.chunks);
    const bank = filter.bank === undefined ? "any bank" : `bank ${filter.bank}`;
    throw new Error(`Import ${importName} has no payloads matching ${types} at ${bank}`);
  }
  return selected;
}

// represents an imported tic80 cart
export class Tic80Resource extends ImportedResourceBase {
  readonly chunks: readonly Tic80CartChunk[];
  private readonly importName: string;
  private readonly dependencies: ExternalDependency[];

  constructor(readonly cartPath: string, spec: ImportDefinition, parsedCart: Tic80Cart, dependencies?: ExternalDependency[]) {
    super();
    this.importName = spec.name;
    this.dependencies = dependencies ?? [{ path: cartPath, reason: "Imported TIC-80 cartridge" }];

    const addresses = new Set<string>();
    for (const { chunkType, bank } of parsedCart.chunks) {
      const address = `${formatTic80CartChunkType(chunkType)}:${bank}`;
      if (addresses.has(address)) {
        throw new Error(`Duplicate source chunk ${address} in import ${this.importName}`);
      }
      addresses.add(address);
    }

    // A source filter sees the logical CODE payload, even if the cart has no physical CODE in bank 0.
    const chunks = parsedCart.chunks.filter((chunk) => chunk.chunkType !== "CODE");
    const code = getCombinedCodeBytes(parsedCart);
    if (code) {
      chunks.unshift({ chunkType: "CODE", bank: 0, data: code });
    }
    this.chunks = filterChunks(chunks, spec, this.importName);
  }

  selectChunks(filter: CartChunkFilter): readonly Tic80CartChunk[] {
    return filterChunks(this.chunks, filter, this.importName);
  }

  selectSingleChunk(filter: CartChunkFilter): Tic80CartChunk {
    const selected = this.selectChunks(filter);
    if (selected.length !== 1) {
      const addresses = selected.map(({ chunkType, bank }) => `${formatTic80CartChunkType(chunkType)}:${bank}`);
      throw new Error(
        `Import ${this.importName} matches multiple payloads (${addresses.join(", ")}). ` +
        "Select one via import:NAME:CHUNK:BANK",
      );
    }
    return selected[0];
  }

  dump(): void {
    console.log(`Tic80Resource dump for cart: ${this.cartPath}`);
    for (const { chunkType, bank, data } of this.chunks) {
      console.log(`  Chunk: ${formatTic80CartChunkType(chunkType)}:${bank}, size: ${data.length}`);
    }
  }

  getDependencyList(): ExternalDependency[] {
    return this.dependencies;
  }
}

export async function importTic80Cart(
  project: TicbuildProjectCore,
  spec: ImportDefinition,
  materializedSource?: MaterializedImportSource,
): Promise<Tic80Resource> {
  const sourceInfo = materializedSource ?? await materializeImportSource(project, spec);
  const sourcePath = requireFileImportSource(spec, sourceInfo);
  const data = await readBinaryFileAsync(sourcePath);
  return new Tic80Resource(sourcePath, spec, parseTic80Cart(data), sourceInfo.watchDependencies);
}
