import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { buildCore } from "../frontend/core";
import { createBuildReporter } from "../frontend/buildReporter";
import * as cons from "../utils/console";
import { getCombinedCodeBytes, parseTic80Cart } from "../utils/tic80/cartLoader";
import { AssembleTic80Cart } from "../utils/tic80/cartWriter";
import { Tic80CartChunk, Tic80CartChunkTypeKey } from "../utils/tic80/tic80";
import { AssemblyBlock, CartChunkFilter, ImportDefinition, Manifest } from "./manifestTypes";
import { Tic80Resource } from "./importers/tic80CartImporter";
import { TicbuildProject } from "./project";

function chunk(chunkType: Tic80CartChunkTypeKey, bank: number, data: number[] | string): Tic80CartChunk {
  return { chunkType, bank, data: typeof data === "string" ? new TextEncoder().encode(data) : Uint8Array.from(data) };
}

describe("cartridge asset banking", () => {
  let dir: string;
  let cartPath: string;
  let manifestPath: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-assets-"));
    cartPath = path.join(dir, "assets.tic");
    manifestPath = path.join(dir, "project.ticbuild.jsonc");
  });

  afterEach(() => {
    cons.setLogFile(null);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  async function writeCart(...chunks: Tic80CartChunk[]): Promise<void> {
    fs.writeFileSync(cartPath, await AssembleTic80Cart({ chunks }));
  }

  function writeManifest(
    blocks: AssemblyBlock[],
    filters: CartChunkFilter = {},
    otherImports: ImportDefinition[] = [],
  ): void {
    const manifest: Manifest = {
      buildConfiguration: "release",
      project: { name: "banked", binDir: "bin", objDir: "obj", outputCartName: "built.tic" },
      imports: [{ name: "assets", path: "assets.tic", ...filters }, ...otherImports],
      assembly: { blocks, lua: { minify: false } },
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  }

  async function assemble(): Promise<Tic80CartChunk[]> {
    const project = TicbuildProject.loadFromManifest({ manifestPath });
    await project.loadImports(createBuildReporter("human"));
    const { output } = await project.assembleOutput();
    return parseTic80Cart(output).chunks;
  }

  it("copies banked graphics and defaults with their original banks and payload lengths", async () => {
    const chunks = [
      chunk("TILES", 2, [2]),
      chunk("SPRITES", 0, [11]),
      chunk("SPRITES", 3, [12, 0]),
      chunk("WAVEFORMS", 1, [20]),
      chunk("PALETTE", 2, [30]),
      chunk("DEFAULT", 4, []),
    ];
    await writeCart(...chunks);
    writeManifest([{ asset: "assets" }]);
    expect(await assemble()).toEqual(chunks);
  });

  it("filters by output type without flattening banks when multiple payloads are selected", async () => {
    const sprites = [chunk("SPRITES", 1, [11]), chunk("SPRITES", 2, [12])];
    await writeCart(chunk("TILES", 0, [1]), ...sprites, chunk("MAP", 3, [3]));
    writeManifest([{ asset: "assets", chunks: ["SPRITES"] }], { chunks: ["SPRITES", "MAP"] });
    expect(await assemble()).toEqual(sprites);
  });

  it("retains unknown chunks in imports and reports them while building supported output", async () => {
    const sprite = chunk("SPRITES", 2, [12, 0]);
    await writeCart(sprite);
    fs.appendFileSync(cartPath, Buffer.from([(3 << 5) | 31, 2, 0, 0, 42, 0]));
    writeManifest([{ asset: "assets", chunks: ["SPRITES"] }]);

    const messages: unknown[] = [];
    const { project } = await buildCore(
      manifestPath, undefined, createBuildReporter("jsonl", (line) => messages.push(JSON.parse(line))),
    );
    const resource = project.resourceMgr!.items.get("assets") as Tic80Resource;
    expect(resource.chunks).toEqual([
      sprite,
      { chunkType: 31, bank: 3, data: Uint8Array.of(42, 0) },
    ]);
    expect(messages).toContainEqual(expect.objectContaining({
      type: "diagnostic",
      data: { severity: "warning", message: expect.stringContaining("Unknown TIC-80 chunk type 31") },
    }));
    const importsLog = fs.readFileSync(path.join(dir, "obj", "imports.log"), "utf-8");
    expect(importsLog).toMatch(/UNKNOWN\(31\):3\s+2\s*B\s*\/\s*n\/a/);
    const builtBytes = new Uint8Array(fs.readFileSync(path.join(dir, "bin", "built.tic")));
    expect(parseTic80Cart(builtBytes).chunks).toEqual([sprite]);
  });

  it("can filter unknown chunks out at import", async () => {
    const sprite = chunk("SPRITES", 2, [12, 0]);
    await writeCart(sprite);
    fs.appendFileSync(cartPath, Buffer.from([31, 1, 0, 0, 42]));
    writeManifest([{ asset: "assets" }], { chunks: ["SPRITES"] });

    expect(await assemble()).toEqual([sprite]);
  });

  it("rejects unknown chunks when selected for output", async () => {
    await writeCart(chunk("SPRITES", 2, [12]));
    fs.appendFileSync(cartPath, Buffer.from([31, 1, 0, 0, 42]));
    writeManifest([{ asset: "assets" }]);

    await expect(assemble()).rejects.toThrow("Unsupported chunk type for serialization: UNKNOWN(31)");
  });

  it("combines import and reference filters, then remaps one payload to a new type and bank", async () => {
    await writeCart(
      chunk("SPRITES", 0, [10]),
      chunk("SPRITES", 2, [12]),
      chunk("WAVEFORMS", 1, [21]),
      chunk("WAVEFORMS", 2, [22, 0]),
    );
    writeManifest(
      [
        {
          asset: { import: "assets", chunks: ["WAVEFORMS", "MAP"], bank: 2 },
          chunks: ["MAP"],
          bank: 4,
        },
        { asset: "import:assets:SPRITES:2" },
      ],
      { chunks: ["SPRITES", "WAVEFORMS"], bank: 2 },
    );
    expect(await assemble()).toEqual([chunk("SPRITES", 2, [12]), chunk("MAP", 4, [22, 0])]);
  });

  it("moves different types with a single source bank each into one destination bank", async () => {
    await writeCart(chunk("TILES", 2, [1]), chunk("WAVEFORMS", 3, [2]));
    writeManifest([{ asset: "assets", bank: 4 }]);
    expect(await assemble()).toEqual([chunk("TILES", 4, [1]), chunk("WAVEFORMS", 4, [2])]);
  });

  const invalidBlocks: [string, AssemblyBlock[], RegExp][] = [
    ["one-to-many mapping", [{ asset: "import:assets:SPRITES:2", chunks: ["TILES", "MAP"] }], /one input payload/],
    ["remapping multiple payloads", [{ asset: "assets", chunks: ["MAP"] }], /Select one input payload/],
    ["collapsing banks of the same type", [{ asset: "assets", bank: 4 }], /cannot write multiple SPRITES/],
    [
      "overlapping output blocks",
      [{ asset: "assets" }, { asset: "import:assets:SPRITES:2" }],
      /Duplicate chunk type in TIC-80 cart: SPRITES bank 2/,
    ],
    ["empty source filters", [{ asset: { import: "assets", chunks: [] } }], /no payloads matching/],
    ["missing source banks", [{ asset: "import:assets:SPRITES:7" }], /no payloads matching.*bank 7/],
  ];
  it.each(invalidBlocks)("rejects %s", async (_label, blocks, error) => {
    await writeCart(chunk("SPRITES", 0, [1]), chunk("SPRITES", 2, [2]));
    writeManifest(blocks);
    await expect(assemble()).rejects.toThrow(error);
  });

  it("rejects an empty filter at import", async () => {
    await writeCart(chunk("SPRITES", 1, [1]));
    writeManifest([{ asset: "assets" }], { chunks: [] });
    await expect(assemble()).rejects.toThrow("Import assets has no payloads matching []");
  });

  it("checks the destination capacity when changing a chunk type", async () => {
    await writeCart(chunk("TILES", 1, new Array<number>(257).fill(0)));
    writeManifest([{ asset: "assets", chunks: ["WAVEFORMS"] }]);
    await expect(assemble()).rejects.toThrow("WAVEFORMS data too large: 257 bytes (max 256)");
  });

  it("warns for an empty output list and skips building that asset", async () => {
    await writeCart(chunk("SPRITES", 3, [12]));
    fs.writeFileSync(path.join(dir, "unused.lua"), "not valid Lua @");
    writeManifest(
      [{ asset: "unused", chunks: [] }, { asset: "assets" }],
      {},
      [{ name: "unused", path: "unused.lua" }],
    );
    const messages: unknown[] = [];
    await buildCore(manifestPath, undefined, createBuildReporter("jsonl", (line) => messages.push(JSON.parse(line))));
    expect(messages).toContainEqual(expect.objectContaining({
      type: "diagnostic",
      data: {
        severity: "warning",
        message: "Assembly block 1 has an empty chunks list and produces no output",
      },
    }));
    const built = parseTic80Cart(fs.readFileSync(path.join(dir, "bin", "built.tic")));
    expect(built.chunks.map(({ chunkType, bank }) => [chunkType, bank])).toEqual([["SPRITES", 3]]);
  });

  it("normalizes full stock CODE banks before source selection and splits the result on output", async () => {
    const fullBank = Buffer.alloc(65536, 0x61);
    fs.writeFileSync(cartPath, Buffer.concat([
      // An upstream CODE header with a zero size field stores 65536 bytes.
      Buffer.from([(5 << 5) | 5, 0, 0, 0]),
      fullBank,
      Buffer.from([(2 << 5) | 5, 2, 0, 0, 0x62, 0x63]),
    ]));
    writeManifest([{ asset: "import:assets:CODE:0" }], { bank: 0 });
    const built = await assemble();
    expect(built.map(({ chunkType, bank, data }) => [chunkType, bank, data.length])).toEqual([
      ["CODE", 0, 2], ["CODE", 1, 65536],
    ]);
    expect(Buffer.from(getCombinedCodeBytes({ chunks: built })!)).toEqual(Buffer.concat([fullBank, Buffer.from("bc")]));
    writeManifest([{ asset: "import:assets:CODE:0", bank: 0 }], { bank: 0 });
    await expect(assemble()).rejects.toThrow("CODE chunk exceeds 65536 bytes but bank was specified");
  });

  it("applies the same source selection to includes and __IMPORT", async () => {
    await writeCart(
      chunk("CODE", 5, "--#pragma once\ncartValue = "),
      chunk("CODE", 2, "42\n"),
      chunk("SPRITES", 3, "spriteValue = 9\n"),
      chunk("SPRITES", 2, "spriteValue = 8\n"),
      chunk("TILES", 0, [30]),
      chunk("TILES", 1, [31]),
      chunk("WAVEFORMS", 1, [21]),
    );
    fs.writeFileSync(path.join(dir, "main.lua"), [
      '--#include "import:assets:CODE"',
      '--#include "import:assets:CODE:0"',
      '--#include "import:assets:SPRITES:3"',
      'local tile = __IMPORT("u8", "import:assets:TILES:1")',
      'local wave = __IMPORT("u8", "import:assets:WAVEFORMS")',
    ].join("\n"));
    writeManifest([{ asset: "main" }], {}, [{ name: "main", path: "main.lua" }]);
    const built = await assemble();
    const code = new TextDecoder().decode(getCombinedCodeBytes({ chunks: built })!);
    expect(code.match(/cartValue = 42/g)).toHaveLength(1);
    expect(code).toContain("spriteValue = 9");
    expect(code).toContain("local tile = 31");
    expect(code).toContain("local wave = 21");
  });

  it.each([
    ['--#include "import:assets:SPRITES"', /matches multiple payloads \(SPRITES:1, SPRITES:3\)/],
    ['local sprite = __IMPORT("u8", "import:assets:SPRITES")', /matches multiple payloads/],
    ['local sprite = __IMPORT("u8", "import:assets:SPRITES:8")', /no payloads matching.*bank 8/],
  ])("rejects missing or ambiguous Lua references in %s", async (code, error) => {
    await writeCart(chunk("SPRITES", 1, [1]), chunk("SPRITES", 3, [3]));
    fs.writeFileSync(path.join(dir, "main.lua"), code);
    writeManifest([{ asset: "main" }], {}, [{ name: "main", path: "main.lua" }]);
    await expect(assemble()).rejects.toThrow(error);
  });

  it("rejects a nonzero logical CODE source address even if it exists in the file", async () => {
    await writeCart(chunk("CODE", 2, "return 1"));
    writeManifest([{ asset: "import:assets:CODE:2" }]);
    await expect(assemble()).rejects.toThrow("CODE can only be selected at source bank 0");
  });
});
