export type LuaDocParam = {
    name: string;
    type?: string;
    description?: string;
};

export type LuaDocInfo = {
    description?: string;
    params?: LuaDocParam[];
    returnType?: string;
    returnDescription?: string;
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

// Parses the small EmmyLua/LuaDoc subset shared by ticbuild tooling
export function parseLuaDocLines(lines: string[]): LuaDocInfo | null {
    const descriptionLines: string[] = [];
    const params: LuaDocParam[] = [];
    let returnType: string | undefined;
    let returnDescription: string | undefined;

    for (const rawLine of lines) {
        const cleaned = stripDocPrefix(rawLine);
        if (!cleaned) {
            continue;
        }
        const tagMatch = cleaned.match(/^@(\w+)\s*(.*)$/);
        if (!tagMatch) {
            descriptionLines.push(cleaned);
            continue;
        }
        const tag = tagMatch[1];
        const rest = tagMatch[2] || "";
        if (tag === "param") {
            const parsed = parseParamDoc(rest);
            if (parsed) {
                params.push(parsed);
            }
        } else if (tag === "return" && returnType === undefined) {
            const parsed = parseReturnDoc(rest);
            if (parsed) {
                returnType = parsed.type;
                returnDescription = parsed.description;
            }
        }
    }

    const doc: LuaDocInfo = {};
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
    if (!doc.description && !doc.params && !doc.returnType && !doc.returnDescription) {
        return null;
    }
    return doc;
}

function stripDocPrefix(line: string): string | null {
    let text = line.trim();
    if (text.startsWith("--")) {
        text = text.slice(2);
    }
    text = text.trimStart();
    text = text.replace(/^\[=+\[/, "").replace(/^\[\[/, "");
    text = text.replace(/\]=*\]$/, "");
    text = text.trim();
    if (!text) {
        return null;
    }
    if (text.startsWith("-")) {
        text = text.replace(/^-+/, "").trimStart();
    }
    return text || null;
}

function parseParamDoc(rest: string): LuaDocParam | null {
    const parts = rest.trim().split(/\s+/).filter((part) => part.length > 0);
    if (parts.length === 0) {
        return null;
    }
    const name = parts.shift() as string;
    let type: string | undefined;
    let description: string | undefined;
    if (parts.length === 1) {
        type = parts[0];
    } else if (parts.length > 1) {
        type = parts[0];
        description = parts.slice(1).join(" ");
    }
    return { name, type, description };
}

function parseReturnDoc(rest: string): { type: string; description?: string } | null {
    const parts = rest.trim().split(/\s+/).filter((part) => part.length > 0);
    if (parts.length === 0) {
        return null;
    }
    const type = parts[0];
    const description = parts.length > 1 ? parts.slice(1).join(" ") : undefined;
    return { type, description };
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
