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
import { ExternalDependency } from "./ImportedResourceTypes";
import { MaterializedImportSource, materializeImportSource, requireFileImportSource } from "./importSources";

export type ImportDataResult<T> = {
  data: T;
  dependencies: ExternalDependency[];
};

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
  materializedSource?: MaterializedImportSource,
): Promise<ImportDataResult<Uint8Array>> {
  if (importDef.kind !== kImportKind.key.binary) {
    throw new Error(`Import ${importDef.name} is not a binary resource`);
  }

  const encoding = resolveSourceEncodingKey(importDef);
  const source = materializedSource ?? await materializeImportSource(project, importDef);
  const dependencies = source.watchDependencies;

  if (source.sourceKind === "value") {
    if (!isStringSourceEncoding(encoding)) {
      throw new Error(
        `Binary import ${importDef.name} uses encoding ${encoding} which requires a file path; value is not supported`,
      );
    }
    const data = decodeSourceDataFromString(encoding, source.value);
    return { data, dependencies };
  }

  const resolvedPath = requireFileImportSource(importDef, source);

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
  materializedSource?: MaterializedImportSource,
): Promise<ImportDataResult<string>> {
  if (importDef.kind !== kImportKind.key.text) {
    throw new Error(`Import ${importDef.name} is not a text resource`);
  }

  const source = materializedSource ?? await materializeImportSource(project, importDef);
  const dependencies = source.watchDependencies;

  if (source.sourceKind === "value") {
    return { data: source.value, dependencies };
  }

  const resolvedPath = requireFileImportSource(importDef, source);
  const text = await readTextFileAsync(resolvedPath);
  return { data: text, dependencies };
}
