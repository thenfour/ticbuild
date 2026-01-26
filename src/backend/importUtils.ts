import { readBinaryFileAsync, readTextFileAsync } from "../utils/fileSystem";
import {
  decodeSourceDataFromBytes,
  decodeSourceDataFromString,
  isStringSourceEncoding,
  kSourceEncoding,
  resolveSourceEncoding,
  SourceEncodingKey,
} from "../utils/encoding/codecRegistry";
import { ImportDefinition, kImportKind } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";

export type ImportReference = {
  importName: string;
  chunkSpec?: string;
};

export type ImportDataResult<T> = {
  data: T;
  dependencies: string[];
};

export function parseImportReference(reference: string): ImportReference {
  if (!reference.startsWith("import:")) {
    throw new Error(`Import reference must start with "import:": ${reference}`);
  }
  const spec = reference.substring("import:".length);
  const parts = spec.split(":");
  const importName = parts[0]?.trim();
  if (!importName) {
    throw new Error(`Import reference is missing import name: ${reference}`);
  }
  if (parts.length > 2) {
    throw new Error(`Import reference has too many ':' segments: ${reference}`);
  }
  const chunkSpec = parts.length > 1 ? parts[1].trim() : undefined;
  return { importName, chunkSpec };
}

function resolveSourceEncodingKey(importDef: ImportDefinition): SourceEncodingKey {
  if (!importDef.sourceEncoding) {
    return kSourceEncoding.key.raw;
  }
  const encoding = resolveSourceEncoding(importDef.sourceEncoding).key;
  return encoding;
}

export async function loadBinaryImportData(
  project: TicbuildProjectCore,
  importDef: ImportDefinition,
): Promise<ImportDataResult<Uint8Array>> {
  if (importDef.kind !== kImportKind.key.binary) {
    throw new Error(`Import ${importDef.name} is not a binary resource`);
  }

  const encoding = resolveSourceEncodingKey(importDef);
  const dependencies: string[] = [];

  if (importDef.value !== undefined) {
    const substituted = project.substituteVariables(importDef.value);
    if (!isStringSourceEncoding(encoding)) {
      throw new Error(
        `Binary import ${importDef.name} uses encoding ${encoding} which requires a file path; value is not supported`,
      );
    }
    const data = decodeSourceDataFromString(encoding, substituted);
    return { data, dependencies };
  }

  if (!importDef.path) {
    throw new Error(`Binary import ${importDef.name} must specify either path or value`);
  }

  const resolvedPath = project.resolveImportPath(importDef);
  dependencies.push(resolvedPath);

  if (isStringSourceEncoding(encoding)) {
    const text = await readTextFileAsync(resolvedPath);
    const data = decodeSourceDataFromString(encoding, text);
    return { data, dependencies };
  }

  const bytes = await readBinaryFileAsync(resolvedPath);
  const data = decodeSourceDataFromBytes(encoding, bytes);
  return { data, dependencies };
}

export async function loadTextImportData(
  project: TicbuildProjectCore,
  importDef: ImportDefinition,
): Promise<ImportDataResult<string>> {
  if (importDef.kind !== kImportKind.key.text) {
    throw new Error(`Import ${importDef.name} is not a text resource`);
  }

  const dependencies: string[] = [];

  if (importDef.value !== undefined) {
    const substituted = project.substituteVariables(importDef.value);
    return { data: substituted, dependencies };
  }

  if (!importDef.path) {
    throw new Error(`Text import ${importDef.name} must specify either path or value`);
  }

  const resolvedPath = project.resolveImportPath(importDef);
  dependencies.push(resolvedPath);
  const text = await readTextFileAsync(resolvedPath);
  return { data: text, dependencies };
}
