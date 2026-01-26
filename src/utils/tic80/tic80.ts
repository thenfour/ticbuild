// types for tic80 specific platform

import { kbToBytes } from "../bin";
import { defineEnum } from "../enum";

// each chunk consists of a 4-byte header, then chunk data.
// offset   bits      description
// -----------------------------------------
// 0        BBBC CCCC B = bank number (0..7), C = chunk type (0..31)
// 1..2     Sx16      S = size of chunk, 16-bit little-endian
// 3        Ux1       U = unused / reserved padding
// 4..      ...       chunk data

type Tic80CartChunkTypeInfo = {
  value: number; //
  bankCount: number;
  sizePerBank: number;
  deprecated: boolean;
};

// https://github.com/nesbox/TIC-80/wiki/.tic-File-Format
export const kTic80CartChunkTypes = defineEnum({
  // 256 sprites/tiles, 2 pixels per byte.
  TILES: {
    value: 1,
    bankCount: 8,
    sizePerBank: 0x2000,
    deprecated: false,
  },

  SPRITES: {
    value: 2,
    bankCount: 8,
    sizePerBank: 0x2000,
    deprecated: false,
  },

  MAP: {
    value: 4,
    bankCount: 8,
    sizePerBank: 0x7f80,
    deprecated: false,
  },

  // This represents the code, in ASCII text format.
  // Version Notes:
  //     0.80 removed support for separate code banks. Older cartridge's
  //     discrete banks will be loaded into a single codebase (with a newline
  //     between each) - starting at bank 7 (which appears at the top) and
  //     working backwards to bank 0. The bank number is therefore deprecated in
  //     version 0.80.

  //     1.0 supports up to 512kb of code. This code is stored sequentially
  //     (uncompressed) across up to 8 banks. Individual banks are joined into a
  //     single large string when loaded (in sequential 0..7 order). The editor
  //     buffer split into multiple banks when saved to cartridge (when larger
  //     than 64kb). A cartridge may consist of 1 to 8 code banks.

  // * it means we can support multiple code banks each up to 64kb.
  // * ASCII encoding only (no bin, no unicode possible...)
  //

  CODE: {
    value: 5, //
    bankCount: 8,
    sizePerBank: kbToBytes(64) - 1, // size must be <= 65535 bytes because of how size is represented.
    deprecated: false,
  },

  // sprite flags data
  FLAGS: {
    value: 6,
    bankCount: 8,
    sizePerBank: 0x200,
    deprecated: false,
  },

  SFX: {
    value: 9,
    bankCount: 8,
    sizePerBank: 0x1080,
    deprecated: false,
  },

  WAVEFORMS: {
    value: 10,
    bankCount: 1, // no bank support.
    sizePerBank: 0x1000,
    deprecated: false,
  },
  PALETTE: {
    value: 12,
    bankCount: 1, // no bank support.
    sizePerBank: 96, // 48 SCN + 48 BDR
    deprecated: false,
  },
  MUSIC_TRACKS: {
    value: 14,
    bankCount: 8,
    sizePerBank: 0x198, // 0x13E64...0x13FFB
    deprecated: false,
  },
  MUSIC_PATTERNS: {
    value: 15,
    bankCount: 8,
    sizePerBank: 0x2d00, // 0x11164...0x13E63
    deprecated: false,
  },
  CODE_COMPRESSED: {
    value: 16, //
    bankCount: 1, // no bank support. compressed code must be 64kb or less, compressed with ZLIB.
    sizePerBank: kbToBytes(64) - 1, //
    deprecated: true,
  },
  // if present, default palette & waveforms are loaded.
  DEFAULT: {
    value: 17,
    bankCount: 1,
    sizePerBank: 0,
    deprecated: false,
  },
  // bank 0 used as cover image.
  // otherwise not certain what this is -- maybe loaded as VRAM (0x0000) at startup?
  SCREEN: {
    value: 18,
    bankCount: 8,
    sizePerBank: kbToBytes(16),
    deprecated: false,
  },
  CODE_WASM: {
    value: 19,
    bankCount: 4,
    sizePerBank: 0,
    deprecated: false,
  },
} as const satisfies Record<string, Tic80CartChunkTypeInfo>);

export type Tic80CartChunkTypeKey = typeof kTic80CartChunkTypes.$key;

export type Tic80CartChunk = {
  chunkType: Tic80CartChunkTypeKey;
  bank: number;
  data: Uint8Array;
};

export type Tic80Cart = {
  chunks: Tic80CartChunk[];
};
