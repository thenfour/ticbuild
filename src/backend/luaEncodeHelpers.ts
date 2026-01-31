import { BinaryOutputEncoding, getNumericEncodingInfo } from "./luaBinaryEncoding";
import { EncodeErrorFormatter } from "./luaEncodeBase";

export function formatLuaNumber(value: number): string {
    if (Number.isNaN(value)) {
        return "0";
    }
    if (!Number.isFinite(value)) {
        return value < 0 ? "-1/0" : "1/0";
    }
    return String(value);
}

export function parseNumericList(
    raw: string,
    encoding: BinaryOutputEncoding,
    filePath: string,
    lineNumber: number,
    formatError: EncodeErrorFormatter,
): number[] {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
        return [];
    }

    let inner = trimmed;
    if ((inner.startsWith("{") && inner.endsWith("}")) || (inner.startsWith("[") && inner.endsWith("]"))) {
        inner = inner.slice(1, -1).trim();
    }

    if (inner.length === 0) {
        return [];
    }

    const tokens = inner.split(/[\s,]+/).filter((token) => token.length > 0);
    const info = getNumericEncodingInfo(encoding);
    if (!info) {
        throw new Error(formatError(filePath, lineNumber, `Unsupported numeric encoding: ${encoding}`));
    }

    if (info.kind === "float") {
        return tokens.map((token) => parseFloatToken(token, filePath, lineNumber, formatError));
    }

    return tokens.map((token) => parseIntToken(token, filePath, lineNumber, formatError));
}

// parses an integer token, supporting decimal, hex (0x), octal (0o or leading 0), binary (0b), and suffix b/B for binary
function parseIntToken(
    token: string,
    filePath: string,
    lineNumber: number,
    formatError: EncodeErrorFormatter,
): number {
    const cleaned = token.replace(/_/g, "").trim();
    if (cleaned.length === 0) {
        throw new Error(formatError(filePath, lineNumber, `Invalid integer token: ${token}`));
    }

    const sign = cleaned.startsWith("-") ? -1 : 1;
    let body = cleaned;
    if (body.startsWith("+") || body.startsWith("-")) {
        body = body.slice(1);
    }

    if (body.length === 0) {
        throw new Error(formatError(filePath, lineNumber, `Invalid integer token: ${token}`));
    }

    let radix = 10;
    if (body.endsWith("b") || body.endsWith("B")) {
        radix = 2;
        body = body.slice(0, -1);
    }

    if (body.startsWith("0x")) {
        radix = 16;
        body = body.slice(2);
    } else if (body.startsWith("0b")) {
        radix = 2;
        body = body.slice(2);
    } else if (body.startsWith("0o")) {
        radix = 8;
        body = body.slice(2);
    } else if (radix === 10 && body.startsWith("0") && body.length > 1) {
        radix = 8;
        body = body.slice(1);
    }

    if (body.includes(".")) {
        throw new Error(formatError(filePath, lineNumber, `Invalid integer token: ${token}`));
    }

    if (radix === 10 && /e/i.test(body)) {
        throw new Error(formatError(filePath, lineNumber, `Invalid integer token: ${token}`));
    }

    if (body.length === 0) {
        throw new Error(formatError(filePath, lineNumber, `Invalid integer token: ${token}`));
    }

    if (!isValidIntegerDigits(body, radix)) {
        throw new Error(formatError(filePath, lineNumber, `Invalid integer token: ${token}`));
    }

    const value = Number.parseInt(body, radix);
    if (!Number.isFinite(value) || Number.isNaN(value)) {
        throw new Error(formatError(filePath, lineNumber, `Invalid integer token: ${token}`));
    }

    return value * sign;
}

function parseFloatToken(
    token: string,
    filePath: string,
    lineNumber: number,
    formatError: EncodeErrorFormatter,
): number {
    const cleaned = token.replace(/_/g, "").trim();
    if (cleaned.length === 0) {
        throw new Error(formatError(filePath, lineNumber, `Invalid float token: ${token}`));
    }

    if (/^[-+]?0x/i.test(cleaned) || cleaned.endsWith("b") || cleaned.endsWith("B")) {
        throw new Error(formatError(filePath, lineNumber, `Invalid float token: ${token}`));
    }

    const value = Number(cleaned);
    if (!Number.isFinite(value)) {
        throw new Error(formatError(filePath, lineNumber, `Invalid float token: ${token}`));
    }
    return value;
}

// validates that the body contains only valid digits for the given radix
function isValidIntegerDigits(body: string, radix: number): boolean {
    switch (radix) {
        case 2:
            return /^[01]+$/i.test(body);
        case 8:
            return /^[0-7]+$/i.test(body);
        case 10:
            return /^[0-9]+$/i.test(body);
        case 16:
            return /^[0-9a-f]+$/i.test(body);
        default:
            return false;
    }
}
