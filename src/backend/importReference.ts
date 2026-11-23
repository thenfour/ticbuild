import { isWhiteSpaceLike } from "typescript";
import { kTic80CartChunkTypes, kTic80ExtendedCodeBankCount } from "../utils/tic80/tic80";
import { AssetReference } from "./manifestTypes";


export function isImportReference(value: string): boolean {
  return value.startsWith("import:");
}

export function parseImportReference(reference: string): AssetReference {
  if (!isImportReference(reference)) {
    throw new Error(`Import reference must start with "import:": ${reference}`);
  }
  const parts = reference.split(":");

  // import:assetname:CHUNKTYPE:bank
  // import:assetname:CHUNKTYPE
  // import:assetname

  const [, name = "", chunkList, bankText, extra] = parts;
  const importName = name.trim();
  if (!importName) { // empty strings are falsy
    throw new Error(`Import reference is missing import name: ${reference}`);
  }
  if (extra !== undefined) {
    throw new Error(`Import reference has too many tokens: ${reference}`);
  }
  const chunks = chunkList?.trim() ? chunkList.split(",").map((value) => {
    const chunk = value.trim();
    const key = kTic80CartChunkTypes.coerceByKey(chunk)?.key;
    if (!key) {
      throw new Error(`Unknown chunk type "${chunk}" in import reference: ${reference}`);
    }
    return key;
  }) : undefined;

  let bank: number | undefined;
  if (bankText !== undefined) {
    const value = bankText.trim();
    bank = Number(value);
    if (!/^\d+$/.test(value) || bank >= kTic80ExtendedCodeBankCount) {
      throw new Error(`Invalid source bank "${value}" in import reference: ${reference}`);
    }
  }
  return { import: importName, chunks, bank };
}
