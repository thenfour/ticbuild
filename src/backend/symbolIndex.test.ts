import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { preprocessLuaCode } from "./luaPreprocessor";
import { buildProjectSymbolIndex } from "./symbolIndex";
import { Manifest } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";
import { ResourceManager } from "./ImportedResourceTypes";
import { LuaCodeResource } from "./importers/LuaCodeImporter";

type ProjectIndex = ReturnType<typeof buildProjectSymbolIndex> extends Promise<infer T> ? T : never;
type TestSpan = { start: number; length: number };
type TestSymbol = {
    name: string;
    kind: string;
    visibility?: string;
    callable?: { params: string[] };
    doc?: {
        description?: string;
        params?: Array<{ name: string; type?: string; description?: string }>;
        returnType?: string;
        returnDescription?: string;
    };
    selectionRange: TestSpan;
    symbolId: string;
};
type TestScope = {
    scopeId: string;
    kind: string;
    parentScopeId: string | null;
    declaredSymbolIds: Record<string, string>;
};

function makeManifest(): Manifest {
    return {
        project: {
            name: "test",
            binDir: "./bin",
            objDir: "./obj",
            outputCartName: "test.tic",
        },
        variables: {},
        imports: [],
        assembly: {
            blocks: [],
        },
    };
}

function makeProject(projectDir: string): TicbuildProjectCore {
    return new TicbuildProjectCore({
        manifest: makeManifest(),
        manifestPath: path.join(projectDir, "project.ticbuild.jsonc"),
        projectDir,
    });
}

function makeTempDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-symbol-index-"));
}

function writeFile(projectDir: string, relPath: string, content: string): string {
    const absPath = path.join(projectDir, relPath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, content, "utf-8");
    return absPath;
}

async function buildIndexFromFile(projectDir: string, relPath: string, content: string): Promise<ProjectIndex> {
    const absPath = writeFile(projectDir, relPath, content);
    const project = makeProject(projectDir);
    const preprocess = await preprocessLuaCode(project, content, absPath);
    const resource = new LuaCodeResource(absPath, content, preprocess.code, preprocess.dependencies, preprocess);
    const resources = new ResourceManager(new Map([["main", resource]]));
    return buildProjectSymbolIndex(project, resources);
}

function getFileIndex(index: ProjectIndex, relPath: string) {
    const normalized = path.normalize(relPath);
    const file = index.files[normalized];
    expect(file).toBeDefined();
    return file;
}

function findSymbolsByName(fileIndex: any, name: string) {
    return Object.values(fileIndex.symbols).filter((symbol: any) => symbol.name === name) as TestSymbol[];
}

describe("Symbol index", () => {
    it("should index functions, params, locals, globals, and scopes", async () => {
        const projectDir = makeTempDir();
        const source = `local function foo(a, b)
	local x = 1
	y = 2
	local y = 3
	y = 4
end`;

        const index = await buildIndexFromFile(projectDir, "main.lua", source);
        const fileIndex = getFileIndex(index, "main.lua");

        const fooSymbols = findSymbolsByName(fileIndex, "foo");
        expect(fooSymbols).toHaveLength(1);
        expect(fooSymbols[0].kind).toBe("function");
        expect(fooSymbols[0].visibility).toBe("local");
        expect(fooSymbols[0].callable).toBeDefined();
        if (!fooSymbols[0].callable) {
            throw new Error("Expected callable metadata");
        }
        expect(fooSymbols[0].callable.params).toHaveLength(2);

        const aSymbols = findSymbolsByName(fileIndex, "a");
        const bSymbols = findSymbolsByName(fileIndex, "b");
        expect(aSymbols[0].kind).toBe("param");
        expect(bSymbols[0].kind).toBe("param");

        const xSymbols = findSymbolsByName(fileIndex, "x");
        expect(xSymbols[0].kind).toBe("localVariable");

        const yGlobals = findSymbolsByName(fileIndex, "y").filter((s: any) => s.kind === "globalVariable");
        expect(yGlobals).toHaveLength(1);

        const fooOffset = source.indexOf("foo");
        const fooSymbol = fooSymbols[0];
        expect(fooSymbol.selectionRange.start).toBe(fooOffset);

        const aOffset = source.indexOf("a,");
        const bOffset = source.indexOf("b)");
        expect(aSymbols[0].selectionRange.start).toBe(aOffset);
        expect(bSymbols[0].selectionRange.start).toBe(bOffset);

        const fileScope = fileIndex.scopes.find((scope: any) => scope.kind === "file") as TestScope | undefined;
        const funcScope = fileIndex.scopes.find((scope: any) => scope.kind === "function") as TestScope | undefined;
        expect(fileScope).toBeDefined();
        expect(funcScope).toBeDefined();
        if (!fileScope || !funcScope) {
            throw new Error("Expected scopes to be defined");
        }
        expect(funcScope.parentScopeId).toBe(fileScope.scopeId);
        expect(fileScope.declaredSymbolIds.foo).toBe(fooSymbol.symbolId);
    });

    it("should map symbols to included files", async () => {
        const projectDir = makeTempDir();
        writeFile(projectDir, "utils.lua", "function clamp(a, b)\n  return a\nend");
        const source = `--#include "./utils.lua"\nfunction main() end`;

        const index = await buildIndexFromFile(projectDir, "main.lua", source);
        const utilsIndex = getFileIndex(index, "utils.lua");
        const clampSymbols = findSymbolsByName(utilsIndex, "clamp");
        expect(clampSymbols).toHaveLength(1);
        expect(clampSymbols[0].kind).toBe("function");
    });

    it("should emit macro symbols", async () => {
        const projectDir = makeTempDir();
        const source = `--#macro CLAMP(x, lo, hi) => x\nlocal y = CLAMP(1, 0, 2)`;

        const index = await buildIndexFromFile(projectDir, "main.lua", source);
        const fileIndex = getFileIndex(index, "main.lua");
        const macroSymbols = findSymbolsByName(fileIndex, "CLAMP");
        expect(macroSymbols).toHaveLength(1);
        expect(macroSymbols[0].kind).toBe("macro");
    });

    it("should attach doc comments to symbols", async () => {
        const projectDir = makeTempDir();
        const source = `--- Adds numbers\n-- @param a number first\n-- @param b number second\n-- @return number sum\nfunction add(a, b) end`;

        const index = await buildIndexFromFile(projectDir, "main.lua", source);
        const fileIndex = getFileIndex(index, "main.lua");
        const addSymbols = findSymbolsByName(fileIndex, "add");
        expect(addSymbols).toHaveLength(1);
        const doc = addSymbols[0].doc;
        expect(doc).toBeDefined();
        if (!doc) {
            throw new Error("Expected doc metadata");
        }
        expect(doc.description).toBe("Adds numbers");
        expect(doc.params).toHaveLength(2);
        expect(doc.params?.[0].name).toBe("a");
        expect(doc.params?.[0].type).toBe("number");
        expect(doc.returnType).toBe("number");
        expect(doc.returnDescription).toBe("sum");
    });

    it("should keep the latest overload in the global index", async () => {
        const projectDir = makeTempDir();
        const source = `function foo(a) end\nfunction foo(b) end`;

        const index = await buildIndexFromFile(projectDir, "main.lua", source);
        const entry = index.globalIndex.symbolsByName.foo[0];
        const expectedOffset = source.lastIndexOf("foo");
        expect(entry.symbolId).toContain(`+${expectedOffset}:foo`);
    });
});