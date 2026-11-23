import { kTic80CartChunkTypes, kTic80ExtendedCodeBankCount, Tic80CartChunk, Tic80CartChunkTypeKey } from "../utils/tic80/tic80";
import { trimTrailingZeros } from "../utils/utils";
import { ImportedResourceBase } from "./ImportedResourceTypes";
import { BinaryResource } from "./importers/binaryResourceImporter";
import { CodeResource } from "./importers/CodeResource";
import { TextResource } from "./importers/textResourceImporter";
import { Tic80Resource } from "./importers/tic80CartImporter";
import { AssemblyBlock, AssetReference } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";

type LuaCodeChunkType = "CODE" | "CODE_COMPRESSED";

// returns whether the import block's code should be output as CODE or CODE_COMPRESSED
// returns undefined if no code output should be generated.
// throws on error
export function getLuaCodeOutputType(block: AssemblyBlock, asset: AssetReference): LuaCodeChunkType | undefined {
  if (block.chunks?.length === 0) {
    return undefined;
  }
  if (asset.bank !== undefined && asset.bank !== 0) {
    throw new Error(`Import ${asset.import}: CODE can only be selected at source bank 0`);
  }
  const chunks = block.chunks ?? asset.chunks ?? ["CODE"];
  const type = chunks[0];
  if (chunks.length !== 1 || (type !== "CODE" && type !== "CODE_COMPRESSED")) {
    throw new Error(`Lua code import ${asset.import} requires one output type (CODE or CODE_COMPRESSED)`);
  }
  if (asset.chunks !== undefined && (asset.chunks.length !== 1 || asset.chunks[0] !== type)) {
    throw new Error(`Lua code import ${asset.import}: asset.chunks must select the same code type as the output`);
  }
  return type;
}

// filters the chunks of a TIC-80 resource based on the `assembly` section chunks.
// 
function selectCartOutputs(
  resource: Tic80Resource, // an imported TIC-80 cartridge resource
  asset: AssetReference, // import:assetname:CHUNKTYPE:bank
  outputTypes: AssemblyBlock["chunks"],
): readonly Tic80CartChunk[] {
  const inputs = resource.selectChunks(asset);

  // unspecified output types, return all input chunks
  if (outputTypes === undefined) {
    return inputs;
  }

  // single input chunk, ensure output types match exactly one chunk
  if (inputs.length === 1) {
    if (outputTypes.length !== 1) {
      throw new Error(`Import ${asset.import}: one input payload requires one output chunk type per block`);
    }
    return [{ ...inputs[0], chunkType: outputTypes[0] }];
  }

  // multiple input chunks, filter based on output types and ensure at least one matches
  const outputs = inputs.filter(({ chunkType }) => outputTypes.includes(chunkType));
  if (outputs.length === 0) {
    throw new Error(
      `Import ${asset.import}: no selected payloads match output types ${outputTypes.join(", ")}. ` +
      "Select one input payload to change its chunk type.",
    );
  }
  return outputs;
}


// places/blits a payload into the TIC-80 cartridge, handling bank assignment and splitting for CODE and CODE_COMPRESSED chunks,
// and enforcing chunk constraints.
function placePayload(
  chunkType: Tic80CartChunkTypeKey,
  data: Uint8Array,
  sourceBank: number | undefined,
  block: AssemblyBlock,
): Tic80CartChunk[] {
  // Uncompressed CODE has a logical bank of 0, including when bytes are remapped to it.
  const bank = block.bank ?? (chunkType === "CODE" ? 0 : sourceBank ?? 0);
  if (chunkType !== "CODE" && chunkType !== "CODE_COMPRESSED") {
    return [{ chunkType, bank, data }];
  }
  if (chunkType === "CODE" && bank !== 0) {
    throw new Error("CODE can only be assigned to output bank 0");
  }
  if (chunkType === "CODE" && data.length === 0) {
    return [];
  }

  const { sizePerBank, bankCount: nativeBankCount } = kTic80CartChunkTypes.byKey[chunkType];
  const option = chunkType === "CODE" ? "extendedCodeBanks" : "multiBankCompressedCode";
  const extended = block.code?.[option] === true;
  const bankLimit = extended ? kTic80ExtendedCodeBankCount : nativeBankCount;
  const optIn = `Enable assembly.blocks[].code.${option} for the private TIC-80 build`;
  if (bank >= bankLimit) {
    throw new Error(
      `${chunkType} bank ${bank} out of range (0..${bankLimit - 1})${extended ? "" : `. ${optIn}`}`,
    );
  }
  if (data.length <= sizePerBank) {
    return [{ chunkType, bank, data }];
  }
  if (block.bank !== undefined) {
    throw new Error(`${chunkType} chunk exceeds ${sizePerBank} bytes but bank was specified`);
  }

  const count = Math.ceil(data.length / sizePerBank);
  if (count > bankLimit) {
    const limit = extended
      ? `the private TIC-80 build supports only ${bankLimit}`
      : `TIC-80 supports only ${bankLimit}. ${optIn}`;
    throw new Error(`${chunkType} chunk requires ${count} banks but ${limit}`);
  }

  // TIC-80 reads code banks in descending order.
  return Array.from({ length: count }, (_, index) => ({
    chunkType,
    bank: count - index - 1,
    data: data.subarray(index * sizePerBank, (index + 1) * sizePerBank),
  }));
}


// returns the assembled TIC-80 cart chunks for the given asset and assembly block
// largely this is a wrapper around placePayload, but applying logic/policies around different
// resource types and build policies.
export async function assembleAsset(
  project: TicbuildProjectCore,
  resource: ImportedResourceBase, // the asset.
  asset: AssetReference, // the asset reference (which can filter)
  block: AssemblyBlock, // and the assembly block specification, which can further affect assembly pipeline
): Promise<Tic80CartChunk[]> {

  // handle cart resource assembly:
  if (resource instanceof Tic80Resource) {
    const outputs = selectCartOutputs(resource, asset, block.chunks);
    if (block.bank !== undefined) {
      // ensure no duplicate chunk types are written to the same bank (possibly this is not totally needed as it will be detected later in the pipeline, however this gives a more specific message)
      const types = new Set<Tic80CartChunkTypeKey>();
      for (const { chunkType } of outputs) {
        if (types.has(chunkType)) {
          throw new Error(
            `Import ${asset.import}: cannot write multiple ${chunkType} payloads to bank ${block.bank}. Select a source bank.`,
          );
        }
        types.add(chunkType);
      }
    }
    return outputs.flatMap(({ chunkType, bank, data }) =>
      placePayload(chunkType, data, bank, block));
  }

  // handle code resource assembly:
  if (resource instanceof CodeResource) {
    const chunkType = getLuaCodeOutputType(block, asset);
    if (chunkType === undefined) {
      return [];
    }
    const data = await resource.view.getDataForChunk(project, chunkType, block.code);
    return placePayload(chunkType, data, undefined, block);
  }

  // handle binary and text resource assembly:
  if (resource instanceof BinaryResource || resource instanceof TextResource) {
    if (asset.chunks !== undefined || asset.bank !== undefined) {
      throw new Error(`Import ${asset.import}: source chunk and bank selectors require a cartridge`);
    }
    if (block.chunks?.length !== 1) {
      throw new Error(`Import ${asset.import}: binary and text assets require one output chunk type per block`);
    }
    const chunkType = block.chunks[0];
    const { data } = resource;
    if (chunkType === "CODE" || chunkType === "CODE_COMPRESSED") {
      return placePayload(chunkType, data, undefined, block);
    }
    // Keep the existing zero-padding optimization for loose files. Cartridge copies keep their recorded payloads.
    const { sizePerBank } = kTic80CartChunkTypes.byKey[chunkType];
    if (data.length > sizePerBank) {
      throw new Error(`${chunkType} data too large: ${data.length} bytes (max ${sizePerBank})`);
    }
    return placePayload(chunkType, trimTrailingZeros(data), undefined, block);
  }

  throw new Error(`Unsupported assembly asset: ${asset.import}`);
}
