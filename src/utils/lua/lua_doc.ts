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
