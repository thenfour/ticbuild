import { luaCatsIdentifierPattern, parseLuaCatsType } from "./LuaCATS_types";

// Parses the subset of LuaCATS annotations supported by ticbuild.
// EmmyLua annotations using this same syntax are also accepted.
// Grammar reference: https://luals.github.io/wiki/annotations/

// "@param value Vec2" -> ["param", "value Vec2"]; prose has no tag.
const annotationTagPattern = /^@(\w+)\s*(.*)$/;
// "value? Vec2 Description" -> ["value?", "Vec2 Description"].
const parameterAnnotationPattern = /^(\S+)\s*(.*)$/;
// Lua long comments may wrap annotations: --[[@type Vec2]] or --[=[@type Vec2]=].
const longCommentOpenPattern = /^\[=*\[/;
const longCommentClosePattern = /\]=*\]$/;
const docCommentDashesPattern = /^-+/;

export function parseLuaCatsAnnotation(text: string): { tag: string; content: string } | undefined {
    const match = annotationTagPattern.exec(text);
    return match ? { tag: match[1], content: match[2] } : undefined;
}

/** "T, U" -> ["T", "U"]; constrained parameters are outside the supported subset. */
export function parseLuaCatsGenericParameters(text: string): string[] {
    return text.split(",").map(name => name.trim()).filter(name => luaCatsIdentifierPattern.test(name));
}

export type LuaCATSParam = {
    name: string;
    type?: string;
    description?: string;
};

/** "value?" -> {name: "value", optional: true}; "value" remains required. */
export function parseLuaCatsParameterName(text: string): { name: string; optional: boolean } {
    const optional = text.endsWith("?");
    return { name: optional ? text.slice(0, -1) : text, optional };
}

export type LuaCATSInfo = {
    description?: string;
    params?: LuaCATSParam[];
    returnType?: string;
    returnDescription?: string;
    type?: string;
    generics?: string[];
};

export function isLuaDocCommentText(text: string): boolean {
    const trimmed = text.trimStart();
    return (
        trimmed.startsWith("---") ||
        trimmed.startsWith("--@") ||
        trimmed.startsWith("-- @") ||
        trimmed.startsWith("--[[") ||
        trimmed.startsWith("--[=")
    );
}

// ["---Select a point.", "---@param value Vec2", "---@return Vec2 | nil"]
// -> {description: "Select a point.", params: [{name: "value", type: "Vec2"}],
//     returnType: "Vec2 | nil"}. Class/alias blocks are collected in LuaCATS_declarations.
export function parseLuaDocLines(lines: string[]): LuaCATSInfo | null {
    const descriptionLines: string[] = [];
    const params: LuaCATSParam[] = [];
    let returnType: string | undefined;
    let returnDescription: string | undefined;
    let valueType: string | undefined;
    const generics: string[] = [];

    for (const rawLine of lines) {
        const cleaned = stripDocPrefix(rawLine);
        if (!cleaned) {
            continue;
        }
        const annotation = parseLuaCatsAnnotation(cleaned);
        if (!annotation) {
            descriptionLines.push(cleaned);
            continue;
        }
        const { tag, content: rest } = annotation;
        if (tag === "generic") {
            generics.push(...parseLuaCatsGenericParameters(rest));
        } else if (tag === "param") {
            const parsed = parseParamDoc(rest);
            if (parsed) {
                params.push(parsed);
            }
        } else if (tag === "type") {
            valueType = parseReturnDoc(rest)?.type;
        } else if (tag === "return" && returnType === undefined) {
            const parsed = parseReturnDoc(rest);
            if (parsed) {
                returnType = parsed.type;
                returnDescription = parsed.description;
            }
        }
    }

    const doc: LuaCATSInfo = {};
    if (valueType) doc.type = valueType;
    if (generics.length) doc.generics = generics;
    if (descriptionLines.length > 0) {
        doc.description = descriptionLines.join("\n").trim();
    }
    if (params.length > 0) {
        doc.params = params;
    }
    if (returnType) {
        doc.returnType = returnType;
    }
    if (returnDescription) {
        doc.returnDescription = returnDescription;
    }
    if (!doc.description && !doc.params && !doc.returnType && !doc.returnDescription && !doc.type && !doc.generics) {
        return null;
    }
    return doc;
}

/** "---@param value Vec2" or "--[[@param value Vec2]]" -> "@param value Vec2". */
export function stripDocPrefix(line: string): string | null {
    let text = line.trim();
    if (text.startsWith("--")) {
        text = text.slice(2);
    }
    text = text.trimStart();
    text = text.replace(longCommentOpenPattern, "");
    text = text.replace(longCommentClosePattern, "");
    text = text.trim();
    if (!text) {
        return null;
    }
    if (text.startsWith("-")) {
        text = text.replace(docCommentDashesPattern, "").trimStart();
    }
    return text || null;
}

function parseParamDoc(rest: string): LuaCATSParam | null {
    const match = parameterAnnotationPattern.exec(rest.trim());
    if (!match) return null;
    return { name: match[1], ...parseReturnDoc(match[2]) };
}

function parseReturnDoc(rest: string): { type: string; description?: string } | null {
    const text = rest.trim();
    if (!text) return null;
    const parsed = parseLuaCatsType(text);
    // "Vec2 | nil Selected point." ends after the complete union. For unsupported
    // syntax, retain the first token so type resolution can report the problem.
    const firstWhitespace = text.search(/\s/);
    const end = parsed?.end ?? (firstWhitespace < 0 ? text.length : firstWhitespace);
    return { type: text.slice(0, end).trim(), description: text.slice(end).trim() || undefined };
}

export function isWhitespaceText(text: string): boolean {
    return /^\s*$/.test(text);
}

export function collectDocCommentAbove(lines: string[], lineIndex: number): string[] | undefined {
    const docLines: string[] = [];
    for (let i = lineIndex - 1; i >= 0; i--) {
        const line = lines[i];
        if (isWhitespaceText(line)) {
            break;
        }
        if (!isLuaDocCommentText(line)) {
            break;
        }
        docLines.unshift(line);
    }
    return docLines.length > 0 ? docLines : undefined;
}
