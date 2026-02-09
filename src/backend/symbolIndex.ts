import * as path from "node:path";
import { parseLua } from "../utils/lua/lua_processor";
import { canonicalizePath, fileExists, readTextFileAsync } from "../utils/fileSystem";
import { getPathRelativeToTemplates } from "../utils/templates";
import { ResourceManager } from "./ImportedResourceTypes";
import { LuaCodeResource } from "./importers/LuaCodeImporter";
import { TicbuildProjectCore } from "./projectCore";
import { LuaPreprocessResult, PreprocessorSymbol } from "./luaPreprocessor";
import { LuaPreprocessorSourceMap, mapPreprocessedOffset, SourceMapBuilder } from "./sourceMap";
import * as luaparse from "luaparse";
import { hashTextSha1 } from "../utils/utils";
import { IsImportReference } from "./importUtils";

type Span = {
    start: number;
    length: number;
};

type ScopeKind = "file" | "function" | "for" | "do" | "if" | "while" | "repeat";

type Scope = {
    scopeId: string;
    kind: ScopeKind;
    range: Span;
    declaredSymbolIds: Record<string, string>;
    parentScopeId: string | null;
};

type SymbolVisibility = "local" | "global";

type SymbolKind = "function" | "localVariable" | "globalVariable" | "param" | "macro";

type SymbolInfo = {
    symbolId: string;
    name: string;
    kind: SymbolKind;
    range: Span;
    selectionRange: Span;
    scopeId: string;
    visibility: SymbolVisibility;
    doc?: DocInfo;
    callable?: {
        isColonMethod: boolean;
        params: string[];
    };
};

type DocParam = {
    name: string;
    type?: string;
    description?: string;
};

type DocInfo = {
    description?: string;
    params?: DocParam[];
    returnType?: string;
    returnDescription?: string;
};

type SymbolSpan = {
    symbolId: string;
    range: Span;
};

type FileIndex = {
    hash: string;
    path: string;
    scopes: Scope[];
    symbols: Record<string, SymbolInfo>;
    symbolSpans: SymbolSpan[];
};

type ProjectIndex = {
    schemaVersion: number;
    generatedAt: string;
    projectRoot: string;
    files: Record<string, FileIndex>;
    globalIndex: {
        symbolsByName: Record<string, Array<{ file: string; symbolId: string }>>;
    };
};

type MappedSpan = {
    file: string;
    span: Span;
    preprocessedStart: number;
};

type ScopeContext = {
    filePath: string;
    scopeId: string;
    kind: ScopeKind;
};

class FileIndexBuilder {
    readonly path: string;
    hash = "";
    symbols: Record<string, SymbolInfo> = {};
    scopes: Scope[] = [];
    symbolSpans: SymbolSpan[] = [];
    fileScopeId: string | null = null;

    constructor(path: string) {
        this.path = path;
    }
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function makeScopeId(filePath: string, rangeStart: number): string {
    return `scope:${filePath}+${rangeStart}`;
}

function parseScopeId(scopeId: string): { filePath: string; rangeStart: number } | null {
    if (!scopeId.startsWith("scope:")) {
        return null;
    }
    const parts = scopeId.substring("scope:".length).split("+");
    if (parts.length !== 2) {
        return null;
    }
    const filePath = parts[0];
    const rangeStart = parseInt(parts[1], 10);
    if (isNaN(rangeStart)) {
        return null;
    }
    return { filePath, rangeStart };
}

// progressively builds the file indices for the symbol index file.
class ProjectIndexBuilder {
    private files = new Map<string, FileIndexBuilder>();
    private globalByName = new Map<
        string,
        {
            file: string;
            symbolId: string;
            preprocessedStart: number;
        }
    >();
    private fileLengths = new Map<string, number>();

    ensureFile(filePath: string): FileIndexBuilder {
        let file = this.files.get(filePath);
        if (!file) {
            file = new FileIndexBuilder(filePath);
            this.files.set(filePath, file);
        }
        return file;
    }

    updateFileLength(filePath: string, span: Span): void {
        const length = span.start + span.length;
        const current = this.fileLengths.get(filePath) ?? 0;
        if (length > current) {
            this.fileLengths.set(filePath, length);
        }
    }

    ensureFileScope(filePath: string): ScopeContext {
        const file = this.ensureFile(filePath);
        if (file.fileScopeId) {
            return { filePath, scopeId: file.fileScopeId, kind: "file" };
        }
        const scopeId = makeScopeId(filePath, 0);// `scope:${filePath}+0`;
        const range = { start: 0, length: this.fileLengths.get(filePath) ?? 0 };
        file.scopes.push({
            scopeId,
            kind: "file",
            range,
            declaredSymbolIds: {},
            parentScopeId: null,
        });
        file.fileScopeId = scopeId;
        return { filePath, scopeId, kind: "file" };
    }

    addScope(filePath: string, kind: ScopeKind, range: Span, parentScopeId: string | null): ScopeContext {
        const file = this.ensureFile(filePath);
        const scopeId = makeScopeId(filePath, range.start);
        file.scopes.push({
            scopeId,
            kind,
            range,
            declaredSymbolIds: {},
            parentScopeId,
        });
        return { filePath, scopeId, kind };
    }

    addSymbol(
        filePath: string,
        symbol: SymbolInfo,
        selectionSpan: Span,
        declaredInScopeId: string,
        preprocessedStart: number,
    ): void {
        const file = this.ensureFile(filePath);
        file.symbols[symbol.symbolId] = symbol;
        file.symbolSpans.push({ symbolId: symbol.symbolId, range: selectionSpan });

        const scope = file.scopes.find((s) => s.scopeId === declaredInScopeId);
        if (scope) {
            scope.declaredSymbolIds[symbol.name] = symbol.symbolId;
        }

        if (symbol.visibility === "global") {
            const existing = this.globalByName.get(symbol.name);
            if (!existing || preprocessedStart >= existing.preprocessedStart) {
                this.globalByName.set(symbol.name, {
                    file: filePath,
                    symbolId: symbol.symbolId,
                    preprocessedStart,
                });
            }
        }
    }

    finalizeFiles(hashes: Map<string, string>): ProjectIndex {
        const files: Record<string, FileIndex> = {};
        for (const [filePath, builder] of this.files.entries()) {
            builder.hash = hashes.get(filePath) ?? "";
            const fileLength = this.fileLengths.get(filePath) ?? 0;
            const fileScope = builder.scopes.find((s) => s.scopeId === builder.fileScopeId);
            if (fileScope) {
                fileScope.range.length = fileLength;
            }
            files[filePath] = {
                hash: builder.hash,
                path: builder.path,
                scopes: builder.scopes,
                symbols: builder.symbols,
                symbolSpans: builder.symbolSpans,
            };
        }

        const symbolsByName: Record<string, Array<{ file: string; symbolId: string }>> = {};
        for (const [name, entry] of this.globalByName.entries()) {
            symbolsByName[name] = [{ file: entry.file, symbolId: entry.symbolId }];
        }

        return {
            schemaVersion: 1,
            generatedAt: new Date().toISOString(),
            projectRoot: "",
            files,
            globalIndex: {
                symbolsByName,
            },
        };
    }

    getFilePaths(): string[] {
        return Array.from(this.files.keys());
    }
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function makeSymbolId(filePath: string, rangeStart: number, name: string): string {
    return `sym:${filePath}+${rangeStart}:${name}`;
}

function mapSpan(map: LuaPreprocessorSourceMap, range: [number, number]): MappedSpan | null {
    const start = mapPreprocessedOffset(map, range[0]);
    if (!start || !start.file) {
        return null;
    }
    const end = mapPreprocessedOffset(map, range[1]);
    let length = range[1] - range[0];
    if (end && end.file === start.file) {
        length = Math.max(0, end.offset - start.offset);
    }
    return {
        file: start.file,
        span: { start: start.offset, length },
        preprocessedStart: range[0],
    };
}

function buildSymbolIndexForPreprocessed(
    preprocess: LuaPreprocessResult,
    projectRoot: string,
    builder: ProjectIndexBuilder,
): void {
    const ast = parseLua(preprocess.code);
    if (!ast) {
        return;
    }

    const sourceMap = preprocess.sourceMap;
    const docBlocks = collectDocBlocks(preprocess.code, ast.comments || []);

    const scopeStack: ScopeContext[] = [];

    const enterScope = (kind: ScopeKind, range: [number, number]): ScopeContext | null => {
        const mapped = mapSpan(sourceMap, range);
        if (!mapped) {
            return null;
        }
        const filePath = normalizePath(projectRoot, mapped.file);
        const current = scopeStack[scopeStack.length - 1];
        const parentScope = current && current.filePath === filePath ? current.scopeId : builder.ensureFileScope(filePath).scopeId;
        const scope = builder.addScope(filePath, kind, mapped.span, parentScope);
        builder.updateFileLength(filePath, mapped.span);
        scopeStack.push(scope);
        return scope;
    };

    const exitScope = (scope: ScopeContext | null): void => {
        if (!scope) {
            return;
        }
        if (scopeStack[scopeStack.length - 1] === scope) {
            scopeStack.pop();
        }
    };

    const currentScopeForFile = (filePath: string): ScopeContext => {
        for (let i = scopeStack.length - 1; i >= 0; i--) {
            if (scopeStack[i].filePath === filePath) {
                return scopeStack[i];
            }
        }
        return builder.ensureFileScope(filePath);
    };

    const declareSymbol = (
        name: string,
        kind: SymbolKind,
        visibility: SymbolVisibility,
        range: [number, number],
        selectionRange: [number, number],
        callable?: SymbolInfo["callable"],
    ): void => {
        const mappedRange = mapSpan(sourceMap, range);
        const mappedSelection = mapSpan(sourceMap, selectionRange);
        if (!mappedRange || !mappedSelection) {
            return;
        }

        const filePath = normalizePath(projectRoot, mappedRange.file);
        const selectionFilePath = normalizePath(projectRoot, mappedSelection.file);
        if (filePath !== selectionFilePath) {
            return;
        }

        const symbolId = makeSymbolId(filePath, mappedSelection.span.start, name);
        const scope = currentScopeForFile(filePath);
        const doc = findDocForSymbol(preprocess.code, docBlocks, mappedRange.preprocessedStart);

        const symbol: SymbolInfo = {
            symbolId,
            name,
            kind,
            range: mappedRange.span,
            selectionRange: mappedSelection.span,
            scopeId: scope.scopeId,
            visibility,
            doc,
            callable,
        };

        builder.updateFileLength(filePath, mappedRange.span);
        builder.updateFileLength(filePath, mappedSelection.span);
        builder.addSymbol(filePath, symbol, mappedSelection.span, scope.scopeId, mappedRange.preprocessedStart);
    };

    const isLocalInScopeChain = (name: string, filePath: string): boolean => {
        const file = builder.ensureFile(filePath);
        for (let i = scopeStack.length - 1; i >= 0; i--) {
            const scope = scopeStack[i];
            if (scope.filePath !== filePath) {
                continue;
            }
            const stored = file.scopes.find((s) => s.scopeId === scope.scopeId);
            if (stored && stored.declaredSymbolIds[name]) {
                return true;
            }
        }
        return false;
    };

    const declareParamSymbol = (name: string, range: [number, number]): string | null => {
        const mapped = mapSpan(sourceMap, range);
        if (!mapped) {
            return null;
        }
        const filePath = normalizePath(projectRoot, mapped.file);
        const scope = currentScopeForFile(filePath);
        const symbolId = makeSymbolId(filePath, mapped.span.start, name);
        const symbol: SymbolInfo = {
            symbolId,
            name,
            kind: "param",
            range: mapped.span,
            selectionRange: mapped.span,
            scopeId: scope.scopeId,
            visibility: "local",
        };
        builder.updateFileLength(filePath, mapped.span);
        builder.addSymbol(filePath, symbol, mapped.span, scope.scopeId, mapped.preprocessedStart);
        return symbolId;
    };

    const walkStatements = (body: luaparse.Statement[]): void => {
        for (const stmt of body) {
            walkStatement(stmt);
        }
    };

    const walkStatement = (stmt: luaparse.Statement): void => {
        switch (stmt.type) {
            case "LocalStatement": {
                const stmtRange = nodeRange(stmt);
                for (const variable of stmt.variables) {
                    const variableRange = nodeRange(variable);
                    if (variable.type === "Identifier" && stmtRange && variableRange) {
                        declareSymbol(variable.name, "localVariable", "local", stmtRange, variableRange);
                    }
                }
                if (stmt.init) {
                    stmt.init.forEach((expr) => walkExpression(expr));
                }
                return;
            }

            case "AssignmentStatement": {
                const stmtRange = nodeRange(stmt);
                stmt.variables.forEach((variable) => {
                    const variableRange = nodeRange(variable);
                    if (variable.type === "Identifier" && stmtRange && variableRange) {
                        const mapped = mapSpan(sourceMap, variableRange);
                        if (!mapped) {
                            return;
                        }
                        const filePath = normalizePath(projectRoot, mapped.file);
                        if (!filePath || isLocalInScopeChain(variable.name, filePath)) {
                            return;
                        }
                        declareSymbol(variable.name, "globalVariable", "global", stmtRange, variableRange);
                    } else {
                        walkExpression(variable as luaparse.Expression);
                    }
                });
                stmt.init.forEach((expr) => walkExpression(expr));
                return;
            }

            case "FunctionDeclaration": {
                const identifierInfo = resolveFunctionIdentifier(stmt.identifier);
                const callable = identifierInfo
                    ? {
                        isColonMethod: identifierInfo.isMethod,
                        params: [] as string[],
                    }
                    : undefined;
                const stmtRange = nodeRange(stmt);
                if (identifierInfo && stmtRange && identifierInfo.range) {
                    declareSymbol(
                        identifierInfo.name,
                        "function",
                        stmt.isLocal ? "local" : "global",
                        stmtRange,
                        identifierInfo.range,
                        callable,
                    );
                }

                const scope = stmtRange ? enterScope("function", stmtRange) : null;
                stmt.parameters.forEach((param) => {
                    const paramRange = nodeRange(param);
                    if (param.type !== "Identifier" || !paramRange) {
                        return;
                    }
                    const paramId = declareParamSymbol(param.name, paramRange);
                    if (paramId && callable) {
                        callable.params.push(paramId);
                    }
                });
                walkStatements(stmt.body);
                exitScope(scope);
                return;
            }

            case "ForNumericStatement": {
                const stmtRange = nodeRange(stmt);
                const scope = stmtRange ? enterScope("for", stmtRange) : null;
                const variableRange = nodeRange(stmt.variable);
                if (stmt.variable.type === "Identifier" && stmtRange && variableRange) {
                    declareSymbol(stmt.variable.name, "localVariable", "local", stmtRange, variableRange);
                }
                walkExpression(stmt.start);
                walkExpression(stmt.end);
                if (stmt.step) {
                    walkExpression(stmt.step);
                }
                walkStatements(stmt.body);
                exitScope(scope);
                return;
            }

            case "ForGenericStatement": {
                const stmtRange = nodeRange(stmt);
                const scope = stmtRange ? enterScope("for", stmtRange) : null;
                for (const variable of stmt.variables) {
                    const variableRange = nodeRange(variable);
                    if (variable.type === "Identifier" && stmtRange && variableRange) {
                        declareSymbol(variable.name, "localVariable", "local", stmtRange, variableRange);
                    }
                }
                stmt.iterators.forEach((expr) => walkExpression(expr));
                walkStatements(stmt.body);
                exitScope(scope);
                return;
            }

            case "DoStatement": {
                const stmtRange = nodeRange(stmt);
                const scope = stmtRange ? enterScope("do", stmtRange) : null;
                walkStatements(stmt.body);
                exitScope(scope);
                return;
            }

            case "WhileStatement": {
                const stmtRange = nodeRange(stmt);
                const scope = stmtRange ? enterScope("while", stmtRange) : null;
                walkExpression(stmt.condition);
                walkStatements(stmt.body);
                exitScope(scope);
                return;
            }

            case "RepeatStatement": {
                const stmtRange = nodeRange(stmt);
                const scope = stmtRange ? enterScope("repeat", stmtRange) : null;
                walkStatements(stmt.body);
                walkExpression(stmt.condition);
                exitScope(scope);
                return;
            }

            case "IfStatement": {
                for (const clause of stmt.clauses) {
                    if (clause.type !== "ElseClause") {
                        walkExpression(clause.condition);
                    }
                    const clauseRange = nodeRange(clause);
                    const scope = clauseRange ? enterScope("if", clauseRange) : null;
                    walkStatements(clause.body);
                    exitScope(scope);
                }
                return;
            }

            case "CallStatement": {
                walkExpression(stmt.expression);
                return;
            }

            case "ReturnStatement": {
                stmt.arguments.forEach((expr) => walkExpression(expr));
                return;
            }

            default:
                return;
        }
    };

    const walkExpression = (expr: luaparse.Expression): void => {
        switch (expr.type) {
            case "FunctionDeclaration": {
                const exprRange = nodeRange(expr);
                const scope = exprRange ? enterScope("function", exprRange) : null;
                expr.parameters.forEach((param) => {
                    const paramRange = nodeRange(param);
                    if (param.type !== "Identifier" || !paramRange) {
                        return;
                    }
                    declareParamSymbol(param.name, paramRange);
                });
                walkStatements(expr.body);
                exitScope(scope);
                return;
            }

            case "TableConstructorExpression": {
                expr.fields.forEach((field) => {
                    if (field.type === "TableKey" || field.type === "TableKeyString") {
                        walkExpression(field.value);
                    } else if (field.type === "TableValue") {
                        walkExpression(field.value);
                    }
                });
                return;
            }

            case "BinaryExpression":
            case "LogicalExpression":
                walkExpression(expr.left);
                walkExpression(expr.right);
                return;

            case "UnaryExpression":
                walkExpression(expr.argument);
                return;

            case "CallExpression":
                walkExpression(expr.base as luaparse.Expression);
                expr.arguments.forEach((arg) => walkExpression(arg));
                return;

            case "TableCallExpression":
                walkExpression(expr.base as luaparse.Expression);
                walkExpression(expr.arguments as luaparse.Expression);
                return;

            case "StringCallExpression":
                walkExpression(expr.base as luaparse.Expression);
                walkExpression(expr.argument as luaparse.Expression);
                return;

            case "MemberExpression":
                walkExpression(expr.base as luaparse.Expression);
                return;

            case "IndexExpression":
                walkExpression(expr.base as luaparse.Expression);
                walkExpression(expr.index as luaparse.Expression);
                return;

            default:
                return;
        }
    };

    walkStatements(ast.body);
    addPreprocessorSymbols(preprocess.preprocessorSymbols, sourceMap, projectRoot, builder);
}


// 
export async function buildProjectSymbolIndex(
    project: TicbuildProjectCore,
    resources: ResourceManager,
): Promise<ProjectIndex> {
    const builder = new ProjectIndexBuilder();
    const builtins = await loadBuiltinsPreprocess();
    if (builtins) {
        buildSymbolIndexForPreprocessed(builtins, project.projectDir, builder);
    }
    for (const resource of resources.items.values()) {
        if (!(resource instanceof LuaCodeResource)) {
            continue;
        }
        const preprocess = resource.getPreprocessResult();
        buildSymbolIndexForPreprocessed(preprocess, project.projectDir, builder);
    }

    const hashes = await computeFileHashes(builder.getFilePaths(), project.projectDir);
    const index = builder.finalizeFiles(hashes);
    index.projectRoot = project.projectDir;
    return index;
}

async function loadBuiltinsPreprocess(): Promise<LuaPreprocessResult | null> {
    const builtinsRelativePath = canonicalizePath(path.join("templates", "builtins", "tic80.lua"));
    const builtinsAbsolutePath = getPathRelativeToTemplates("builtins/tic80.lua");
    if (!fileExists(builtinsAbsolutePath)) {
        return null;
    }
    const code = await readTextFileAsync(builtinsAbsolutePath, "utf-8");
    if (!code) {
        return null;
    }
    const mapBuilder = new SourceMapBuilder();
    mapBuilder.appendOriginal(code, builtinsRelativePath, 0);
    return {
        code,
        dependencies: [],
        sourceMap: mapBuilder.toSourceMap(code),
        preprocessorSymbols: [],
    };
}

// for normal files, makes relative to project root and normalizes separators.
// for imports (or theoretically other special paths), just normalizes separators.
function normalizePath(projectRoot: string, filePath: string): string {
    if (!filePath) {
        return "";
    }
    if (IsImportReference(filePath)) {
        return canonicalizePath(filePath);// filePath.replace(/\\/g, "/");
    }
    const rel = path.isAbsolute(filePath) ? path.relative(projectRoot, filePath) : filePath;
    return canonicalizePath(rel);
}

function resolveFunctionIdentifier(
    identifier: luaparse.FunctionDeclaration["identifier"],
): { name: string; range: [number, number]; isMethod: boolean } | null {
    if (!identifier) {
        return null;
    }
    const node = identifier as unknown as { type: string; name?: string; range?: [number, number] };
    const range = nodeRange(node as luaparse.Node);
    if (node.type === "Identifier" && range && node.name) {
        return { name: node.name, range, isMethod: false };
    }
    if (node.type === "MemberExpression") {
        const member = identifier as unknown as luaparse.MemberExpression;
        const idRange = nodeRange(member.identifier);
        if (!idRange) {
            return null;
        }
        const base = resolveExpressionName(member.base as luaparse.Expression);
        if (!base) {
            return null;
        }
        return {
            name: `${base}${member.indexer}${member.identifier.name}`,
            range: idRange,
            isMethod: member.indexer === ":",
        };
    }
    if (node.type === "IndexExpression") {
        const indexExpr = identifier as unknown as luaparse.IndexExpression;
        const indexRange = nodeRange(indexExpr.index as luaparse.Node);
        if (!indexRange) {
            return null;
        }
        const base = resolveExpressionName(indexExpr.base as luaparse.Expression);
        if (!base) {
            return null;
        }
        return {
            name: `${base}[${renderIndex(indexExpr.index as luaparse.Expression)}]`,
            range: indexRange,
            isMethod: false,
        };
    }
    return null;
}

// converts messy node input to range as used in our symbol index.
function nodeRange(node: luaparse.Node | null | undefined): [number, number] | null {
    const withRange = node as { range?: [number, number] } | null | undefined;
    if (!withRange || !Array.isArray(withRange.range) || withRange.range.length < 2) {
        return null;
    }
    return withRange.range;
}

function resolveExpressionName(expr: luaparse.Expression): string | null {
    if (expr.type === "Identifier") {
        return expr.name;
    }
    if (expr.type === "MemberExpression") {
        const base = resolveExpressionName(expr.base as luaparse.Expression);
        if (!base) {
            return null;
        }
        return `${base}${expr.indexer}${expr.identifier.name}`;
    }
    if (expr.type === "IndexExpression") {
        const base = resolveExpressionName(expr.base as luaparse.Expression);
        if (!base) {
            return null;
        }
        return `${base}[${renderIndex(expr.index)}]`;
    }
    return null;
}

function renderIndex(expr: luaparse.Expression): string {
    if (expr.type === "StringLiteral") {
        const lit = expr as luaparse.StringLiteral & { value?: string | null; raw?: string };
        if (typeof lit.value === "string") {
            return JSON.stringify(lit.value);
        }
        if (lit.raw) {
            return lit.raw;
        }
        return "\"\"";
    }
    if (expr.type === "NumericLiteral") {
        return String(expr.value);
    }
    return "?";
}

function addPreprocessorSymbols(
    symbols: PreprocessorSymbol[],
    sourceMap: LuaPreprocessorSourceMap,
    projectRoot: string,
    builder: ProjectIndexBuilder,
): void {
    for (const symbol of symbols) {
        const filePath = normalizePath(projectRoot, symbol.sourceFile);
        if (!filePath) {
            continue;
        }
        const span: Span = { start: symbol.offset, length: symbol.name.length };
        const symbolId = makeSymbolId(filePath, span.start, symbol.name);
        const scope = builder.ensureFileScope(filePath);
        const info: SymbolInfo = {
            symbolId,
            name: symbol.name,
            kind: "macro",
            range: span,
            selectionRange: span,
            scopeId: scope.scopeId,
            visibility: "global",
        };
        builder.updateFileLength(filePath, span);
        builder.addSymbol(filePath, info, span, scope.scopeId, 0);
    }

    if (sourceMap.segments.length === 0) {
        return;
    }
    for (const seg of sourceMap.segments) {
        const filePath = normalizePath(projectRoot, seg.originalFile);
        if (!filePath) {
            continue;
        }
        builder.updateFileLength(filePath, { start: seg.originalOffset, length: seg.ppEnd - seg.ppBegin });
    }
}

type DocBlock = {
    start: number;
    end: number;
    doc: DocInfo;
};

function collectDocBlocks(code: string, comments: luaparse.Comment[]): DocBlock[] {
    const ranges = comments
        .map((comment) => ({
            range: nodeRange(comment as unknown as luaparse.Node),
            comment,
        }))
        .filter((entry) => !!entry.range)
        .map((entry) => ({ range: entry.range as [number, number], comment: entry.comment }))
        .sort((a, b) => a.range[0] - b.range[0]);

    const blocks: DocBlock[] = [];
    let currentStart: number | null = null;
    let currentEnd: number | null = null;
    let currentLines: string[] = [];

    const flush = () => {
        if (currentStart === null || currentEnd === null) {
            return;
        }
        const doc = parseDocLines(currentLines);
        if (doc) {
            blocks.push({ start: currentStart, end: currentEnd, doc });
        }
        currentStart = null;
        currentEnd = null;
        currentLines = [];
    };

    for (const entry of ranges) {
        const [start, end] = entry.range;
        const raw = code.slice(start, end);
        if (!isDocComment(raw)) {
            flush();
            continue;
        }
        if (currentEnd !== null) {
            const between = code.slice(currentEnd, start);
            if (!isWhitespace(between)) {
                flush();
            }
        }
        if (currentStart === null) {
            currentStart = start;
        }
        currentEnd = end;
        currentLines.push(raw);
    }

    flush();
    return blocks;
}

function findDocForSymbol(code: string, blocks: DocBlock[], symbolStart: number): DocInfo | undefined {
    for (let i = blocks.length - 1; i >= 0; i--) {
        const block = blocks[i];
        if (block.end > symbolStart) {
            continue;
        }
        const between = code.slice(block.end, symbolStart);
        if (!isImmediateDocGap(between)) {
            continue;
        }
        return block.doc;
    }
    return findDocForSymbolFromSource(code, symbolStart);
}

function isDocComment(text: string): boolean {
    const trimmed = text.trimStart();
    return (
        trimmed.startsWith("---") ||
        trimmed.startsWith("--@") ||
        trimmed.startsWith("-- @") ||
        trimmed.startsWith("--[[") ||
        trimmed.startsWith("--[=")
    );
}

function isWhitespace(text: string): boolean {
    return /^\s*$/.test(text);
}

function isImmediateDocGap(text: string): boolean {
    if (!isWhitespace(text)) {
        return false;
    }
    if (/\r\n\s*\r\n/.test(text)) {
        return false;
    }
    if (/\n\s*\n/.test(text)) {
        return false;
    }
    return true;
}

function findDocForSymbolFromSource(code: string, symbolStart: number): DocInfo | undefined {
    let lineStart = code.lastIndexOf("\n", Math.max(0, symbolStart - 1));
    if (lineStart < 0) {
        lineStart = 0;
    } else {
        lineStart += 1;
    }

    const docLines: string[] = [];
    let cursor = lineStart - 1;
    while (cursor >= 0) {
        const lineEnd = cursor;
        let prevStart = code.lastIndexOf("\n", Math.max(0, lineEnd - 1));
        if (prevStart < 0) {
            prevStart = 0;
        } else {
            prevStart += 1;
        }
        const line = code.slice(prevStart, lineEnd + 1);
        const trimmed = line.trim();
        if (trimmed.length === 0) {
            break;
        }
        if (!isDocComment(line)) {
            break;
        }
        docLines.unshift(line);
        if (prevStart === 0) {
            cursor = -1;
        } else {
            cursor = prevStart - 2;
        }
    }

    if (docLines.length === 0) {
        return undefined;
    }
    return parseDocLines(docLines) ?? undefined;
}

function parseDocLines(lines: string[]): DocInfo | null {
    const descriptionLines: string[] = [];
    const params: DocParam[] = [];
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

    const doc: DocInfo = {};
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

function parseParamDoc(rest: string): DocParam | null {
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

async function computeFileHashes(filePaths: string[], projectRoot: string): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    for (const filePath of filePaths) {
        const absolute = IsImportReference(filePath) ? null : path.resolve(projectRoot, filePath);
        if (!absolute || !fileExists(absolute)) {
            result.set(filePath, "");
            continue;
        }
        const content = await readTextFileAsync(absolute, "utf-8");
        result.set(filePath, hashTextSha1(content));
    }
    return result;
}
