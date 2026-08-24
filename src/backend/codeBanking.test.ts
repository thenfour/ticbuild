import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { inflateSync } from "node:zlib";
import { TicbuildProject } from "./project";
import { parseTic80Cart, getCombinedCodeBytes } from "../utils/tic80/cartLoader";
import { AssembleTic80Cart } from "../utils/tic80/cartWriter";
import { kTic80CartChunkTypes } from "../utils/tic80/tic80";

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function createTempProject(code: string, assemblyBlock: object): { dir: string; manifestPath: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-codebank-"));
  const codePath = path.join(dir, "main.lua");
  writeFile(codePath, code);

  const manifest = {
    buildConfiguration: "release",
    project: {
      name: "test",
      binDir: "./bin",
      objDir: "./obj",
      outputCartName: "out.tic",
    },
    imports: [
      {
        name: "maincode",
        path: "main.lua",
        kind: "LuaCode",
      },
    ],
    assembly: {
      lua: {
        minify: false,
      },
      blocks: [assemblyBlock],
    },
  };

  const manifestPath = path.join(dir, "project.ticbuild.jsonc");
  writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return { dir, manifestPath };
}

function makeHighEntropyLuaComment(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let seed = 0x12345678;
  let result = "-- ";
  for (let i = 0; i < length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    result += chars[seed % chars.length];
    if (i % 96 === 95 && i + 1 < length) {
      result += "\n-- ";
    }
  }
  return result;
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

describe("Code chunk banking", () => {
  it("should split CODE across multiple banks when oversized", async () => {
    const maxChunkSize = kTic80CartChunkTypes.byKey.CODE.sizePerBank;
    const payloadLength = maxChunkSize + 10;
    const code = `local s = "${"a".repeat(payloadLength)}"`;

    const { dir, manifestPath } = createTempProject(code, {
      chunks: ["CODE"],
      asset: "maincode",
    });

    try {
      const project = TicbuildProject.loadFromManifest({ manifestPath });
      await project.loadImports();
      const output = await project.assembleOutput();

      const codeChunks = output.chunks.filter((chunk) => chunk.chunkType === "CODE");
      expect(codeChunks).toHaveLength(2);
      expect(codeChunks[0].bank).toBe(1);
      expect(codeChunks[1].bank).toBe(0);
      expect(codeChunks[0].data.length).toBe(maxChunkSize);

      const totalLength = new TextEncoder().encode(code).length;
      expect(codeChunks[1].data.length).toBe(totalLength - maxChunkSize);

      const cartBytes = await AssembleTic80Cart({ chunks: output.chunks });
      const parsedCart = parseTic80Cart(cartBytes);
      const reconstructedCode = getCombinedCodeBytes(parsedCart);

      expect(new TextDecoder().decode(reconstructedCode!)).toBe(code);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should split CODE across private extended banks when opted in", async () => {
    const maxChunkSize = kTic80CartChunkTypes.byKey.CODE.sizePerBank;
    const payloadLength = maxChunkSize * kTic80CartChunkTypes.byKey.CODE.bankCount + 10;
    const code = `local s = "${"a".repeat(payloadLength)}"`;

    const { dir, manifestPath } = createTempProject(code, {
      chunks: ["CODE"],
      asset: "maincode",
      code: {
        extendedCodeBanks: true,
      },
    });

    try {
      const project = TicbuildProject.loadFromManifest({ manifestPath });
      await project.loadImports();
      const output = await project.assembleOutput();

      const codeChunks = output.chunks.filter((chunk) => chunk.chunkType === "CODE");
      expect(codeChunks).toHaveLength(9);
      expect(codeChunks.map((chunk) => chunk.bank)).toEqual([8, 7, 6, 5, 4, 3, 2, 1, 0]);

      const cartBytes = await AssembleTic80Cart({ chunks: output.chunks, allowExtendedCodeBanks: true });
      const parsedCart = parseTic80Cart(cartBytes);
      const reconstructedCode = getCombinedCodeBytes(parsedCart);

      expect(new TextDecoder().decode(reconstructedCode!)).toBe(code);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should advertise extended CODE banks when native CODE banking overflows", async () => {
    const maxChunkSize = kTic80CartChunkTypes.byKey.CODE.sizePerBank;
    const payloadLength = maxChunkSize * kTic80CartChunkTypes.byKey.CODE.bankCount + 10;
    const code = `local s = "${"a".repeat(payloadLength)}"`;

    const { dir, manifestPath } = createTempProject(code, {
      chunks: ["CODE"],
      asset: "maincode",
    });

    try {
      const project = TicbuildProject.loadFromManifest({ manifestPath });
      await project.loadImports();

      await expect(project.assembleOutput()).rejects.toThrow(
        "Enable assembly.blocks[].code.extendedCodeBanks for the private TIC-80 build",
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should split CODE_COMPRESSED across private compressed banks when opted in", async () => {
    const code = makeHighEntropyLuaComment(120000);

    const { dir, manifestPath } = createTempProject(code, {
      chunks: ["CODE_COMPRESSED"],
      asset: "maincode",
      code: {
        multiBankCompressedCode: true,
      },
    });

    try {
      const project = TicbuildProject.loadFromManifest({ manifestPath });
      await project.loadImports();
      const output = await project.assembleOutput();

      const compressedChunks = output.chunks.filter((chunk) => chunk.chunkType === "CODE_COMPRESSED");
      expect(compressedChunks).toHaveLength(2);
      expect(compressedChunks.map((chunk) => chunk.bank)).toEqual([1, 0]);
      for (const chunk of compressedChunks) {
        expect(chunk.data.length).toBeLessThanOrEqual(kTic80CartChunkTypes.byKey.CODE_COMPRESSED.sizePerBank);
      }

      const compressedStream = concatBytes(compressedChunks.map((chunk) => chunk.data));
      expect(new TextDecoder().decode(inflateSync(compressedStream))).toBe(code);

      const parsedCart = parseTic80Cart(output.output);
      const parsedCompressedChunks = parsedCart.chunks.filter((chunk) => chunk.chunkType === "CODE_COMPRESSED");
      expect(parsedCompressedChunks.map((chunk) => chunk.bank)).toEqual([0, 1]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should advertise multi-bank CODE_COMPRESSED when native compressed banking overflows", async () => {
    const code = makeHighEntropyLuaComment(120000);

    const { dir, manifestPath } = createTempProject(code, {
      chunks: ["CODE_COMPRESSED"],
      asset: "maincode",
    });

    try {
      const project = TicbuildProject.loadFromManifest({ manifestPath });
      await project.loadImports();

      await expect(project.assembleOutput()).rejects.toThrow(
        "Enable assembly.blocks[].code.multiBankCompressedCode for the private TIC-80 build",
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
