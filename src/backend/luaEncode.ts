import { readBinaryFileAsync, readTextFileAsync } from "../utils/fileSystem";
import {
    decodeSourceDataFromBytes,
    decodeSourceDataFromString,
    isStringSourceEncoding,
    resolveSourceEncoding,
} from "../utils/encoding/codecRegistry";
import {
    decodeBinaryToValues,
    encodeBinaryAsString,
    getNumericEncodingInfo,
    isStringBinaryOutputEncoding,
    normalizeBinaryOutputEncoding,
} from "./luaBinaryEncoding";
import { ImportDefinition, kImportKind } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";
import { gSomaticLZDefaultConfig, lzCompress } from "../utils/encoding/lz";
import { rleCompress } from "../utils/encoding/rle";
import { toLuaStringLiteral } from "../utils/lua/lua_fundamentals";
import { loadBinaryImportData, loadTextImportData } from "./importUtils";
import { trimTrailingZeros } from "../utils/utils";
import { Tic80CartChunkTypeKey } from "../utils/tic80/tic80";
import { importTic80Cart } from "./importers/tic80CartImporter";

export type EncodeErrorFormatter = (filePath: string, lineNumber: number, message: string) => string;

type SpecTransform = {
    name: string;
    args: number[];
};

type ParsedSpec = {
    base: string;
    transforms: SpecTransform[];
};

export function normalizeEmptySpec(raw: string): string | null {
    const trimmed = raw.trim();
    return trimmed.length === 0 ? null : trimmed;
}

export function encodeLiteralToBytes(
    sourceSpecRaw: string,
    value: string,
    filePath: string,
    lineNumber: number,
    formatError: EncodeErrorFormatter,
): Uint8Array {
    const spec = parseSpecChain(sourceSpecRaw, filePath, lineNumber, "Source", formatError);
    const baseCodec = resolveSourceEncoding(spec.base).key;
    if (!isStringSourceEncoding(baseCodec)) {
        throw new Error(formatError(filePath, lineNumber, `Source encoding ${spec.base} expects binary input`));
    }
    let bytes = decodeSourceDataFromString(baseCodec, value);
    bytes = applyByteTransforms(bytes, spec.transforms, filePath, lineNumber, formatError);
    return bytes;
}

export async function resolveImportBytes(
    project: TicbuildProjectCore,
    importDef: ImportDefinition, // the import from the manifest
    sourceSpecRaw: string | null, // source encoding spec (e.g., "utf8,lz") or null for default
    chunkSpec: Tic80CartChunkTypeKey | undefined,
    onDependency: (path: string) => void,
    filePath: string,
    lineNumber: number,
    formatError: EncodeErrorFormatter,
): Promise<Uint8Array> {
    if (
        importDef.kind !== kImportKind.key.binary &&
        importDef.kind !== kImportKind.key.text &&
        importDef.kind !== kImportKind.key.Tic80Cartridge
    ) {
        throw new Error(formatError(filePath, lineNumber, `__IMPORT only supports binary, text, or cart imports`));
    }

    if (chunkSpec && importDef.kind !== kImportKind.key.Tic80Cartridge) {
        throw new Error(formatError(filePath, lineNumber, `Chunk specifiers are only supported for cart imports`));
    }

    if (importDef.kind === kImportKind.key.Tic80Cartridge) {
        const resource = await importTic80Cart(project, importDef);
        for (const dep of resource.getDependencyList()) {
            onDependency(dep.path);
        }

        const requestedChunks = chunkSpec ? [chunkSpec] : undefined;
        const view = resource.getView(project, requestedChunks);
        const supported = view.getSupportedChunkTypes();

        let selectedChunk: Tic80CartChunkTypeKey;
        if (chunkSpec) {
            selectedChunk = chunkSpec;
        } else if (supported.length === 1) {
            selectedChunk = supported[0];
        } else {
            throw new Error(
                formatError(
                    filePath,
                    lineNumber,
                    `Cart import ${importDef.name} contains multiple chunks. Specify one via import:NAME:CHUNK`,
                ),
            );
        }

        return view.getDataForChunk(project, selectedChunk);
    }

    if (importDef.kind === kImportKind.key.binary) {
        if (!sourceSpecRaw) {
            const result = await loadBinaryImportData(project, importDef);
            for (const dep of result.dependencies) {
                onDependency(dep);
            }
            return result.data;
        }

        const sourceSpec = parseSpecChain(sourceSpecRaw, filePath, lineNumber, "Source", formatError);
        const baseCodec = resolveSourceEncoding(sourceSpec.base).key;

        let bytes: Uint8Array;
        const dependencies: string[] = [];
        if (isStringSourceEncoding(baseCodec)) {
            const text = await loadImportText(project, importDef, dependencies);
            bytes = decodeSourceDataFromString(baseCodec, text);
        } else {
            const binary = await loadImportBytes(project, importDef, dependencies);
            bytes = decodeSourceDataFromBytes(baseCodec, binary);
        }

        for (const dep of dependencies) {
            onDependency(dep);
        }

        bytes = applyByteTransforms(bytes, sourceSpec.transforms, filePath, lineNumber, formatError);
        return bytes;
    }

    const textResult = await loadTextImportData(project, importDef);
    for (const dep of textResult.dependencies) {
        onDependency(dep);
    }
    const spec = sourceSpecRaw ?? "utf8";
    const sourceSpec = parseSpecChain(spec, filePath, lineNumber, "Source", formatError);
    const baseCodec = resolveSourceEncoding(sourceSpec.base).key;
    if (!isStringSourceEncoding(baseCodec)) {
        throw new Error(formatError(filePath, lineNumber, `Source encoding ${sourceSpec.base} expects binary input`));
    }
    let bytes = decodeSourceDataFromString(baseCodec, project.substituteVariables(textResult.data));
    bytes = applyByteTransforms(bytes, sourceSpec.transforms, filePath, lineNumber, formatError);
    return bytes;
}

export function encodeBytesWithDestSpec(
    data: Uint8Array,
    destSpecRaw: string,
    filePath: string,
    lineNumber: number,
    formatError: EncodeErrorFormatter,
): string {
    const spec = parseSpecChain(destSpecRaw, filePath, lineNumber, "Dest", formatError);
    const baseEncoding = normalizeBinaryOutputEncoding(spec.base);

    if (isStringBinaryOutputEncoding(baseEncoding)) {
        let transformed = encodeBinaryAsString(data, baseEncoding);
        for (const transform of spec.transforms) {
            switch (transform.name) {
                case "touppercase":
                    transformed = transformed.toUpperCase();
                    break;
                case "norm":
                case "scale":
                case "q":
                case "lz":
                case "rle":
                case "ttz":
                case "take":
                    throw new Error(
                        formatError(filePath, lineNumber, `Transform ${transform.name} is not valid for string outputs`),
                    );
                default:
                    throw new Error(formatError(filePath, lineNumber, `Unknown transform: ${transform.name}`));
            }
        }
        return toLuaStringLiteral(transformed);
    }

    let values = decodeBinaryToValues(data, baseEncoding);
    const info = getNumericEncodingInfo(baseEncoding);
    if (!info) {
        throw new Error(formatError(filePath, lineNumber, `Unsupported numeric encoding: ${spec.base}`));
    }

    for (const transform of spec.transforms) {
        switch (transform.name) {
            case "scale": {
                const factor = transform.args[0];
                values = values.map((value) => value * factor);
                break;
            }
            case "q": {
                const bits = transform.args[0];
                const divisor = 2 ** bits;
                values = values.map((value) => value / divisor);
                break;
            }
            case "norm": {
                const max = info.signed ? 2 ** (info.bitWidth - 1) - 1 : 2 ** info.bitWidth - 1;
                values = values.map((value) => {
                    const normalized = value / max;
                    if (info.signed) {
                        return Math.max(-1, Math.min(1, normalized));
                    }
                    return Math.max(0, Math.min(1, normalized));
                });
                break;
            }
            case "lz":
            case "rle":
            case "ttz":
            case "take":
            case "touppercase":
                throw new Error(
                    formatError(filePath, lineNumber, `Transform ${transform.name} is not valid for numeric outputs`),
                );
            default:
                throw new Error(formatError(filePath, lineNumber, `Unknown transform: ${transform.name}`));
        }
    }

    return values.map((value) => formatLuaNumber(value)).join(",");
}

function parseSpecChain(
    raw: string,
    filePath: string,
    lineNumber: number,
    context: string,
    formatError: EncodeErrorFormatter,
): ParsedSpec {
    const tokens = splitSpecTokens(raw).map((token) => token.trim()).filter((token) => token.length > 0);
    if (tokens.length === 0) {
        throw new Error(formatError(filePath, lineNumber, `${context} spec is empty`));
    }

    const base = tokens[0].toLowerCase();
    const transforms: SpecTransform[] = [];
    for (const token of tokens.slice(1)) {
        transforms.push(parseTransformToken(token, filePath, lineNumber, context, formatError));
    }

    return { base, transforms };
}

function splitSpecTokens(raw: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let depth = 0;
    for (let i = 0; i < raw.length; i += 1) {
        const ch = raw[i];
        if (ch === "(") {
            depth += 1;
        } else if (ch === ")") {
            depth = Math.max(0, depth - 1);
        }

        if (ch === "," && depth === 0) {
            tokens.push(current);
            current = "";
            continue;
        }
        current += ch;
    }
    if (current.length > 0) {
        tokens.push(current);
    }
    return tokens;
}

function parseTransformToken(
    token: string,
    filePath: string,
    lineNumber: number,
    context: string,
    formatError: EncodeErrorFormatter,
): SpecTransform {
    const trimmed = token.trim();
    const lower = trimmed.toLowerCase();

    if (lower.startsWith("take(")) {
        const args = parseNumericArgs(lower, "take", filePath, lineNumber, context, formatError);
        if (args.length < 1 || args.length > 2) {
            throw new Error(formatError(filePath, lineNumber, `${context} transform take expects 1 or 2 arguments`));
        }
        return { name: "take", args };
    }

    if (lower.startsWith("scale(")) {
        const args = parseNumericArgs(lower, "scale", filePath, lineNumber, context, formatError);
        if (args.length !== 1) {
            throw new Error(formatError(filePath, lineNumber, `${context} transform scale expects 1 argument`));
        }
        return { name: "scale", args };
    }

    if (lower.startsWith("q")) {
        const match = lower.match(/^q(\d+)$/);
        if (!match) {
            throw new Error(formatError(filePath, lineNumber, `${context} transform ${trimmed} is invalid`));
        }
        return { name: "q", args: [Number.parseInt(match[1], 10)] };
    }

    switch (lower) {
        case "lz":
        case "rle":
        case "ttz":
        case "norm":
        case "touppercase":
            return { name: lower, args: [] };
        default:
            throw new Error(formatError(filePath, lineNumber, `${context} transform ${trimmed} is not supported`));
    }
}

// parses 
function parseNumericArgs(
    token: string,
    name: string,
    filePath: string,
    lineNumber: number,
    context: string,
    formatError: EncodeErrorFormatter,
): number[] {
    const openIndex = token.indexOf("(");
    const closeIndex = token.lastIndexOf(")");
    if (openIndex === -1 || closeIndex === -1 || closeIndex <= openIndex) {
        throw new Error(formatError(filePath, lineNumber, `${context} transform ${name} syntax is invalid`));
    }
    const inner = token.slice(openIndex + 1, closeIndex);
    const parts = inner.split(",").map((part) => part.trim()).filter((part) => part.length > 0);
    const values = parts.map((part) => {
        const value = Number(part);
        if (!Number.isFinite(value)) {
            throw new Error(formatError(filePath, lineNumber, `${context} transform ${name} expects numeric arguments`));
        }
        return value;
    });
    return values;
}

async function loadImportText(
    project: TicbuildProjectCore,
    importDef: ImportDefinition,
    dependencies: string[],
): Promise<string> {
    if (importDef.value !== undefined) {
        return project.substituteVariables(importDef.value);
    }
    if (!importDef.path) {
        throw new Error(`Import ${importDef.name} must specify either path or value`);
    }
    const resolvedPath = project.resolveImportPath(importDef);
    dependencies.push(resolvedPath);
    return await readTextFileAsync(resolvedPath);
}

async function loadImportBytes(
    project: TicbuildProjectCore,
    importDef: ImportDefinition,
    dependencies: string[],
): Promise<Uint8Array> {
    if (importDef.value !== undefined) {
        throw new Error(`Import ${importDef.name} specifies a value but requires binary input`);
    }
    if (!importDef.path) {
        throw new Error(`Import ${importDef.name} must specify either path or value`);
    }
    const resolvedPath = project.resolveImportPath(importDef);
    dependencies.push(resolvedPath);
    return await readBinaryFileAsync(resolvedPath);
}

function applyByteTransforms(
    data: Uint8Array,
    transforms: SpecTransform[],
    filePath: string,
    lineNumber: number,
    formatError: EncodeErrorFormatter,
): Uint8Array {
    let output = data;
    for (const transform of transforms) {
        switch (transform.name) {
            case "lz":
                output = lzCompress(output, gSomaticLZDefaultConfig);
                break;
            case "rle":
                output = rleCompress(output);
                break;
            case "ttz":
                output = trimTrailingZeros(output);
                break;
            case "take": {
                const start = Math.floor(transform.args[0]);
                const length = transform.args.length > 1 ? Math.floor(transform.args[1]) : undefined;
                output = output.slice(start, length !== undefined ? start + length : undefined);
                break;
            }
            case "norm":
            case "scale":
            case "q":
            case "touppercase":
                throw new Error(formatError(filePath, lineNumber, `Transform ${transform.name} is not valid for byte specs`));
            default:
                throw new Error(formatError(filePath, lineNumber, `Unknown byte transform: ${transform.name}`));
        }
    }
    return output;
}

function formatLuaNumber(value: number): string {
    if (Number.isNaN(value)) {
        return "0";
    }
    if (!Number.isFinite(value)) {
        return value < 0 ? "-1/0" : "1/0";
    }
    return String(value);
}
