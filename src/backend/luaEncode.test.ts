import { preprocessLuaCode } from "./luaPreprocessor";
import { Manifest } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";
import { parseTic80Cart } from "../utils/tic80/cartLoader";
import { encodeHexString } from "../utils/encoding/hex";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

function makeProject(manifest: Manifest, projectDir: string): TicbuildProjectCore {
    return new TicbuildProjectCore({
        manifest,
        manifestPath: path.join(projectDir, "project.ticbuild.jsonc"),
        projectDir,
    });
}

function createTempDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-encode-"));
}

describe("luaEncode __ENCODE", () => {
    it("encodes hex literals to hex string", async () => {
        const projectDir = createTempDir();
        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local v = __ENCODE("hex", "hex", "#ff00")';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain('local v = "ff00"');
    });

    it("encodes hex literals to numeric values", async () => {
        const projectDir = createTempDir();
        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local v = __ENCODE("hex", "u8", "ff00")';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain("local v = 255,0");
    });

    it("supports numeric transforms", async () => {
        const projectDir = createTempDir();
        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local v = { __ENCODE("hex", "u8,q(1)", "02") }';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain("local v = { 1 }");
    });

    it("supports round-tripping byte transforms", async () => {
        const projectDir = createTempDir();
        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local v = __ENCODE("hex,lz,unlz", "hex", "ff00")';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain('local v = "ff00"');
    });

    it("supports unrle transform", async () => {
        const projectDir = createTempDir();
        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local v = __ENCODE("hex,rle,unrle", "hex", "ff00")';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain('local v = "ff00"');
    });

    it("supports norm precision", async () => {
        const projectDir = createTempDir();
        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local v = __ENCODE("hex", "u8,norm(2)", "80")';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain("local v = 0.5");
    });

    it("supports byte transforms", async () => {
        const projectDir = createTempDir();
        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local v = __ENCODE("hex,take(1,1)", "u8", "ff008011")';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain("local v = 0");
    });

    it("supports string transforms", async () => {
        const projectDir = createTempDir();
        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local v = __ENCODE("ascii", "ascii,toUppercase", "abC")';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain('local v = "ABC"');
    });

    it("rejects invalid transforms for string outputs", async () => {
        const projectDir = createTempDir();
        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local v = __ENCODE("ascii", "ascii,norm", "ab")';

        await expect(preprocessLuaCode(project, source, path.join(projectDir, "source.lua"))).rejects.toThrow(
            "Transform norm is not valid for string outputs",
        );
    });
});

describe("luaEncode __IMPORT", () => {
    it("imports text values", async () => {
        const projectDir = createTempDir();
        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [
                {
                    name: "text1",
                    kind: "text",
                    value: "Hi",
                },
            ],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local s = __IMPORT("ascii", "import:text1")';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain('local s = "Hi"');
    });

    it("imports binary values with manifest sourceEncoding", async () => {
        const projectDir = createTempDir();
        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [
                {
                    name: "binHex",
                    kind: "binary",
                    sourceEncoding: "hex",
                    value: "0102",
                },
            ],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local v = { __IMPORT("u8", "import:binHex") }';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain("local v = { 1,2 }");
    });

    it("imports binary files with explicit source spec", async () => {
        const projectDir = createTempDir();
        const binPath = path.join(projectDir, "data.bin");
        fs.writeFileSync(binPath, Buffer.from([0x0a, 0x80, 0xff, 0x12]), "binary");

        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [
                {
                    name: "binRaw",
                    kind: "binary",
                    sourceEncoding: "raw",
                    path: "./data.bin",
                },
            ],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
            const source = 'local v, w = __IMPORT("raw,take(1,2)", "u8", "import:binRaw")';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain("local v, w = 128,255");
    });

    it("imports text files with explicit source spec", async () => {
        const projectDir = createTempDir();
        const textPath = path.join(projectDir, "text.txt");
        fs.writeFileSync(textPath, "Hello", "utf-8");

        const manifest: Manifest = {
            project: {
                name: "test",
                binDir: "./bin",
                objDir: "./obj",
                outputCartName: "test.tic",
                importDirs: ["./"],
            },
            variables: {},
            imports: [
                {
                    name: "textFile",
                    kind: "text",
                    path: "./text.txt",
                },
            ],
            assembly: { blocks: [] },
        };

        const project = makeProject(manifest, projectDir);
        const source = 'local s = __IMPORT("utf8", "ascii", "import:textFile")';
        const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

        expect(result.code).toContain('local s = "Hello"');
    });

    // we need to mock a cart or be able to generate simple carts for this test to be runnable.

    // it("imports cart chunk data with chunk specifier", async () => {
    //     const projectDir = createTempDir();
    //     const cartPath = path.resolve(__dirname, "..", "..", "example", "release", "bin", "example-game.tic");

    //     const manifest: Manifest = {
    //         project: {
    //             name: "test",
    //             binDir: "./bin",
    //             objDir: "./obj",
    //             outputCartName: "test.tic",
    //             importDirs: ["./"],
    //         },
    //         variables: {},
    //         imports: [
    //             {
    //                 name: "cart",
    //                 kind: "Tic80Cartridge",
    //                 path: cartPath,
    //             },
    //         ],
    //         assembly: { blocks: [] },
    //     };

    //     const project = makeProject(manifest, projectDir);
    //     const source = 'local p = __IMPORT("raw", "hex", "import:cart:PALETTE")';
    //     const result = await preprocessLuaCode(project, source, path.join(projectDir, "source.lua"));

    //     const cartData = fs.readFileSync(cartPath);
    //     const cart = parseTic80Cart(new Uint8Array(cartData));
    //     const paletteChunk = cart.chunks.find((chunk) => chunk.chunkType === "PALETTE");
    //     expect(paletteChunk).toBeDefined();
    //     const expectedHex = encodeHexString(paletteChunk!.data);

    //     expect(result.code).toContain(`local p = "${expectedHex}"`);
    // });
});
