import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { buildCore } from "./core";
import * as cons from "../utils/console";
import { kTic80CartChunkTypes } from "../utils/tic80/tic80";

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function createTempProject(code: string, assemblyBlock: object): { dir: string; manifestPath: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-lua-artifacts-"));
  const codePath = path.join(dir, "main.lua");
  writeFile(codePath, code);

  const manifest = {
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

describe("Lua code build artifacts", () => {
  it("does not write compressed diagnostics when CODE_COMPRESSED is not assembled", async () => {
    const { dir, manifestPath } = createTempProject("print('ok')", {
      chunks: ["CODE"],
      asset: "maincode",
    });

    try {
      await buildCore(manifestPath);

      expect(fs.existsSync(path.join(dir, "obj", "maincode.01.preprocessed.lua"))).toBe(true);
      expect(fs.existsSync(path.join(dir, "obj", "maincode.02.minified.lua"))).toBe(true);
      expect(fs.existsSync(path.join(dir, "obj", "maincode.03.compressed.bin"))).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("writes compressed diagnostics when CODE_COMPRESSED is assembled", async () => {
    const { dir, manifestPath } = createTempProject("print('ok')", {
      chunks: ["CODE_COMPRESSED"],
      asset: "maincode",
    });

    try {
      await buildCore(manifestPath);

      expect(fs.existsSync(path.join(dir, "obj", "maincode.03.compressed.bin"))).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("logs CODE size metrics before assembly", async () => {
    const { dir, manifestPath } = createTempProject("print('ok')", {
      chunks: ["CODE"],
      asset: "maincode",
    });
    const h1Spy = jest.spyOn(cons, "h1").mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(cons, "info").mockImplementation(() => undefined);

    try {
      await buildCore(manifestPath);

      expect(h1Spy).toHaveBeenCalledWith("Lua code size: maincode");
      const infoLines = infoSpy.mock.calls.map(([line]) => line);
      expect(infoLines.some((line) => line.includes("CODE") && line.includes("/ 512.0 KB"))).toBe(true);
      expect(infoLines.some((line) => line.includes("uses 1 bank / 8"))).toBe(true);
      expect(infoLines.some((line) => line.includes("CODE_COMPRESSED"))).toBe(false);
    } finally {
      h1Spy.mockRestore();
      infoSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("logs CODE overflow metrics before assembly fails", async () => {
    const codeInfo = kTic80CartChunkTypes.byKey.CODE;
    const overLimitSource = "--" + "a".repeat(codeInfo.sizePerBank * codeInfo.bankCount + 1);
    const { dir, manifestPath } = createTempProject(overLimitSource, {
      chunks: ["CODE"],
      asset: "maincode",
    });
    const h1Spy = jest.spyOn(cons, "h1").mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(cons, "info").mockImplementation(() => undefined);

    try {
      await expect(buildCore(manifestPath)).rejects.toThrow(
        "CODE chunk requires 9 banks but TIC-80 supports only 8. Enable assembly.blocks[].code.extendedCodeBanks",
      );

      expect(h1Spy).toHaveBeenCalledWith("Lua code size: maincode");
      const infoLines = infoSpy.mock.calls.map(([line]) => line);
      expect(infoLines.some((line) => line.includes("requires 9 banks / 8"))).toBe(true);
      expect(infoLines.some((line) => line.includes("enable code.extendedCodeBanks"))).toBe(true);
    } finally {
      h1Spy.mockRestore();
      infoSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("logs CODE_COMPRESSED metrics when compressed code is assembled", async () => {
    const { dir, manifestPath } = createTempProject("print('ok')", {
      chunks: ["CODE_COMPRESSED"],
      asset: "maincode",
      code: {
        compressionMode: "zlib-max",
      },
    });
    const h1Spy = jest.spyOn(cons, "h1").mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(cons, "info").mockImplementation(() => undefined);

    try {
      await buildCore(manifestPath);

      expect(h1Spy).toHaveBeenCalledWith("Lua code size: maincode");
      const infoLines = infoSpy.mock.calls.map(([line]) => line);
      expect(infoLines.some((line) => line.includes("CODE_COMPRESSED") && line.includes("/ 64.0 KB"))).toBe(true);
      expect(infoLines.some((line) => line.includes("zlib-max zlib output"))).toBe(true);
    } finally {
      h1Spy.mockRestore();
      infoSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("logs CODE_COMPRESSED overflow metrics before assembly fails", async () => {
    const { dir, manifestPath } = createTempProject(makeHighEntropyLuaComment(120000), {
      chunks: ["CODE_COMPRESSED"],
      asset: "maincode",
    });
    const h1Spy = jest.spyOn(cons, "h1").mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(cons, "info").mockImplementation(() => undefined);

    try {
      await expect(buildCore(manifestPath)).rejects.toThrow(
        "CODE_COMPRESSED chunk requires 2 banks but TIC-80 supports only 1. Enable assembly.blocks[].code.multiBankCompressedCode",
      );

      expect(h1Spy).toHaveBeenCalledWith("Lua code size: maincode");
      const infoLines = infoSpy.mock.calls.map(([line]) => line);
      expect(infoLines.some((line) => line.includes("CODE_COMPRESSED") && line.includes("requires 2 banks / 1"))).toBe(
        true,
      );
      expect(infoLines.some((line) => line.includes("enable code.multiBankCompressedCode"))).toBe(true);
    } finally {
      h1Spy.mockRestore();
      infoSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("warns when extended CODE banks are emitted", async () => {
    const codeInfo = kTic80CartChunkTypes.byKey.CODE;
    const overNativeSource = "--" + "a".repeat(codeInfo.sizePerBank * codeInfo.bankCount + 1);
    const { dir, manifestPath } = createTempProject(overNativeSource, {
      chunks: ["CODE"],
      asset: "maincode",
      code: {
        extendedCodeBanks: true,
      },
    });
    const h1Spy = jest.spyOn(cons, "h1").mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(cons, "info").mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(cons, "warning").mockImplementation(() => undefined);

    try {
      await buildCore(manifestPath);

      expect(h1Spy).toHaveBeenCalledWith("Lua code size: maincode");
      const infoLines = infoSpy.mock.calls.map(([line]) => line);
      expect(infoLines.some((line) => line.includes("CODE") && line.includes("/ 1024.0 KB"))).toBe(true);
      expect(infoLines.some((line) => line.includes("uses 9 banks / 16"))).toBe(true);
      expect(infoLines.some((line) => line.includes("non-standard, stock TIC-80 max 8"))).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Non-standard TIC-80 extension used"));
    } finally {
      h1Spy.mockRestore();
      infoSpy.mockRestore();
      warnSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("warns when multi-bank CODE_COMPRESSED chunks are emitted", async () => {
    const { dir, manifestPath } = createTempProject(makeHighEntropyLuaComment(120000), {
      chunks: ["CODE_COMPRESSED"],
      asset: "maincode",
      code: {
        multiBankCompressedCode: true,
      },
    });
    const h1Spy = jest.spyOn(cons, "h1").mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(cons, "info").mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(cons, "warning").mockImplementation(() => undefined);

    try {
      await buildCore(manifestPath);

      expect(h1Spy).toHaveBeenCalledWith("Lua code size: maincode");
      const infoLines = infoSpy.mock.calls.map(([line]) => line);
      expect(infoLines.some((line) => line.includes("CODE_COMPRESSED") && line.includes("/ 1024.0 KB"))).toBe(true);
      expect(infoLines.some((line) => line.includes("uses 2 banks / 16"))).toBe(true);
      expect(infoLines.some((line) => line.includes("non-standard, stock TIC-80 max 1"))).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Non-standard TIC-80 extension used: CODE_COMPRESSED emits bank 1"),
      );
    } finally {
      h1Spy.mockRestore();
      infoSpy.mockRestore();
      warnSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
