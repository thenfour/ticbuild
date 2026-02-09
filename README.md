
# ticbuild

A build & watch system for TIC-80 cart development.

* Multi-file Lua dev system
* Watch system: live-update a running tic80 when dependent files are updated.
* Sprites, music, map data import from existing carts
* Lua preprocessing (`#include`, `#macro`, `#if`, et al)
* Code size up to 512kb
* Timing and profiling information
* Encoding, importing tools

## Links

* [TIC-80 homepage](https://tic80.com/)
* [ticbuild on Github (this project)](https://github.com/thenfour/ticbuild)
* [ticbuild_vscode on Github](https://github.com/thenfour/ticbuild_vscode)
* [Discord](https://discord.gg/kkf9gQfKAd)
* [Somatic - web-based TIC-80 music tracker](https://somatic.tenfourmusic.net/)


This project is free, a labor of love; if you find it useful, please support by spreading the word or,

[![Support me on ko-fi](.attachments/support_me_on_kofi_beige.png)](https://ko-fi.com/E1E71QVJ5Z)

# 2-minute quick start

The best dev experience is through:

* Windows
* VS Code as your editor

If you're cool with that, this is going to be easy. Open a command prompt and follow this:

```bash
# Install ticbuild so it's usable on the system as `ticbuild`
> npm install -g ticbuild

# go where you want to create the project
> cd c:\my_projects

# Initialize a minimal example project
> ticbuild init MyDemo

# Open VS Code
> code MyDemo
```

In VS Code, hit <kbd>F5</kbd> to build and watch for changes. A TIC-80 opens
with the example project.

Open `src/main.lua`. Change the background color:

```lua
  cls(9) -- changed from cls(0)
```

When you save the file, violà, the TIC-80 shows the new background color.

Also notice the TIC-80 shows timing and FPS information.

![alt text](.attachments/image-1.png)

For the full experience, now install [the VS Code syntax highlighting extension](https://marketplace.visualstudio.com/items?itemName=TridentLoop.ticbuild-vs-code)

And you will get full syntax highlighting for the Lua language extensions.

# Installation

Install ticbuild globally using npm:

```bash
npm install -g ticbuild
```

## Lua preprocessor + syntax highlighting

See [ticbuild_vscode](https://github.com/thenfour/ticbuild_vscode) for adding
syntax highlighting to make the Lua preprocessing more friendly in VS Code.

![alt text](.attachments/image.png)


## Prerequisites

- Windows (most is cross-platform however launching is strictly windows)
- Node.js (v16 or higher)

# How to use: overview

```bash

# see detailed help
ticbuild help

# see help for a specific command
ticbuild help build

# build from manifest -> .tic cart
ticbuild build

# build and launch in a tic80
ticbuild run

# build and live-update with changes in a tic80
ticbuild watch

# interactive Lua preprocessing/minification REPL
ticbuild repl

# create a new empty project
ticbuild init

```

## REPL mode (interactive preprocessing/minification)

Interactive Lua processing on the command line, using the same context as
the build process. Useful for testing / debugging, or just doing some ad-hock
encoding.

Note: It doesn't actually EXECUTE the Lua. Just outputs the preprocessed + minified
Lua code.

### Usage

```bash
ticbuild repl [manifest] [--multi-line] [--mode <name>] [--var <key=value>]
```

* **Manifest and build configuration**
  * The REPL loads the project in the same way as `build`.
  * `--mode` and `--var` are supported

* **Single-line mode (default)**
  * Each line you enter is processed immediately.
  * The resulting Lua code is printed to stdout after each line.

* **Multi-line mode**
  * Enable with `--multi-line`.
  * Input is collected until a terminator is entered on its own line:
    * `:end`, `:eof`, or a lone `:`
  * Once the terminator is received, the full block is processed and printed.

### REPL commands

Commands always start with `:`.

```
:help
:minify on
:minify off
:minify <rule> on
:minify <rule> off
:end
:eof
:
:quit
```

#### `:minify` details

* `:minify on|off` toggles overall minification for the session.
* `:minify <rule> on|off` overrides individual minification rules. rules:

```
stripComments
renameLocalVariables
aliasRepeatedExpressions
aliasLiterals
simplifyExpressions
removeUnusedLocals
removeUnusedFunctions
renameTableFields
packLocalDeclarations
```

These overrides are applied on top of the manifest’s
`assembly.lua.minification` settings.

### Examples

```bash
# default single-line mode
ticbuild repl

# multi-line input mode
ticbuild repl --multi-line
```

## TIC-80 binary location

By default, `ticbuild` will use a special build of TIC-80 which allows profiling and
interop to support remote control.

If you want to use your own or external TIC-80, set an environment variable
(via `.env` and `.env.local`) `USE_EXTERNAL_TIC80=1`.

The TIC-80 location is searched in the `%PATH%`, but otherwise it can be overridden
via `.env` / `.env.local` in the project directory, with the key `TIC80_LOCATION`,
as a full path to `tic80.exe`.

```bash
USE_EXTERNAL_TIC80=1                    # use own build of tic80.exe. defaults to falsy
TIC80_LOCATION=c:\my\custom\tic80.exe # optional. ignored without USE_EXTERNAL_TIC80=1
```

# Project manifest

The manifest file is canonically `*.ticbuild.jsonc`. Its location defines the project root.

```jsonc
// paths are always relative to the manifest file's dir (which defines the project root dir)
// fyi, reference: https://github.com/nesbox/TIC-80/wiki/.tic-File-Format
{
  "$schema": "./ticbuild.schema.json",
  "project": {
    "name": "my demo",
    "launchArgs": ["--fs=./", "--skip"], // args that are passed to the tic80 when launched.
    "includeDirs": ["./src", "./include"], // includes these dirs in source file lookup
    "importDirs": ["./assets", "./images"], // include these dirs in resource import lookup
    "binDir": "./dist/bin",
    "objDir": "./dist/obj",
    "outputCartName": "$(project.name).tic", // leaf name only
  },
  "variables": {
    "anything": "here", // variables can be referred to in values via $(variablename)
  },
  "imports": [
    {
      "name": "maincode", // symbolic identifier
      "path": "main.lua",
      "kind": "LuaCode", // defines the type of importer to handle this.
    },
    {
      "name": "twilight_bog_palette", // https://lospec.com/palette-list/twilight-bog
      "kind": "binary", // the imported resource is treated as binary data.

      // the way it's represented in its source may not be a binary file; we can decode the source data.
      // see below for detailed info about encoding types
      "sourceEncoding": "hex",
      // like other resources, loading from file is fine:
      // "path": "path_to_file.bin"

      // but you can also just specify the value here.
      // NOTE: as with all (most?) manifest values, string substitions are performed so variables
      // can be used.
      "value": "1f17143439434e5a6d5d8da289baabb8cfb9839c77727546383f38704b63a66470b8948ec8bfbfe1e6eaa48db6785a96",
    },
    {
      "name": "scroll_text",
      "kind": "text", // the imported resource is treated as plain text
      // like other resources, loading from file is fine:
      // "path": "path_to_file.txt"
      // but you can also just specify the value here. Again, string substitution is supported.
      "value": "greetz to everyone at the party",
    },
    // it is not necessary to specify all source files here; main.lua can import
    // files directly by relative path.
    {
      "name": "myGraphics",
      "path": "./carts/sprites.tic", // imports from some other cartridge
      // you can specify which chunks to bring in. The chunk types are hard-coded
      // corresponding to the TIC-80 cart chunks.
      // Bringing in multiple chunks though means that 1 import can have multiple
      // sub-assets. In this case, "myGraphics" contains tiles and sprites.
      // asset types are so far just mapped directly to tic80 cart chunk types.
      // but in the future it could be that we support our own types of imports
      // for example a .MOD, or a .TTF or graphics.
      //
      // It means when you refer to an import ("myGraphics") you need to specify
      // which sub asset you actually want. Scenarios:
      // 1. the requseted chunks matches exactly the asset chunks: e.g. for cart
      //    assembly, you specify blockTypes:["TILES", "SPRITES"], and asset "myGraphics",
      //    it will just both sub-assets without needing to specify.
      // 2. if you don't specify the chunks desired, all will be used. Errors would
      //    be produced if the destination doesn't support that chunk type.
      // 3. if the requested chunks don't match the available, this is an error.
      //    In this case you must be explicit about what you want to import.
      // (that's the idea...)
      //
      // if import.chunks is omitted, extract all chunks from source.
      // if block.chunks is omitted, use all chunks the asset provides.
      "chunks": ["TILES", "SPRITES"],
      "kind": "Tic80Cartridge", // again this could be deduced.
    },
    {
      "name": "music-imported-cart",
      "path": "./carts/song.tic",
      // you can also omit the chunks and we'll just import all available from a cart.
      "chunks": [
        "CODE",
        "MUSIC_WAVEFORMS",
        "MUSIC_PATTERNS",
        "MUSIC_SFX",
        "MUSIC_SONG",
      ],
      // MAYBE in the future we can add other ways to query like to pull in a specific sprite.
      // but for now not necessary.

      // Note: the code that's imported from a cart can contain ticbuild preprocessing directives.
      // this could be useful for example in Somatic, to wrap TIC() with a --#if false --#endif
      // which would basically remove the entrypoint
    },
  ],
  "assembly": {
    "lua": {
      "minify": true,
      "minification": {
        // options here are exactly those of OptimizationRuleOptions
        // these are all the default values if not specified.
        "stripComments": true,
        "maxIndentLevel": 1,
        "lineBehavior": "tight", // "pretty" | "tight" | "single-line-blocks";
        "maxLineLength": 180,
        "aliasRepeatedExpressions": true,
        "renameLocalVariables": true,
        "aliasLiterals": true,
        "packLocalDeclarations": true,
        "simplifyExpressions": true,
        "removeUnusedLocals": true,
        "removeUnusedFunctions": false,
        "functionNamesToKeep": ["TIC", "BDR", "SCN"], // TIC-80 constants by default
        "renameTableFields": false,
        "tableEntryKeysToRename": [],
      },

      // optional global variables to emit in lua code.
      // they are written out as `local variableName = xyz` at the top of the code.
      // you cannot specify where it gets emitted.
      // what datatype though? string, number, or boolean?
      "globals": {
        "PROJECT_NAME": "$(project.name)", // by default everything is a string.
        "ENABLE_HUD": true, // this can be a boolean to emit as boolean.
        "PI": 3.14159, // emits as a number.
        // no way currently to emit substituted variables as anything but strings.
      },
    },
    "blocks": [
      {
        // error if overlapping chunks.
        // this chunk type "CODE" is technically redundant because the asset already has the chunk type attached.
        // you can specify CODE_COMPRESSED for the ZLIB compressed version.
        "chunks": ["CODE"],
        "bank": 0,
        "asset": "maincode",
        "code": { // optional code assemblyl options
          // if true, emits the globals defined in assembly.lua.globals.
          "emitGlobals": true,
        }
      },
      {
        // Note: Binary resources can be output to any chunk type. they just get placed there
        // with no regards of format / packing. Often you want to store custom resources in places like
        // the large MAP area.
        "chunks": ["MAP"],
        "asset": "some_binary_file"
      },
      {
        // produces a view of the import with just the 1 MUSIC_WAVEFORMS sub-asset
        // Without specifying the chunks to produce, this automatically implies chunks: ["MUSIC_WAVEFORMS"].
        // if you explicitly specify "chunks":["TILES"], this would binary copy the waveforms to the tiles.

        // canonical form:
        "asset": { "import": "music-imported-cart", "chunks": ["MUSIC_WAVEFORMS"] },

        // optional sugar method that resembles how Lua includes assets.
        //asset: "import:music-imported-cart:MUSIC_WAVEFORMS",
      },
    ],
  },

  "buildConfigurations": {
    // build configurations allow overriding things in the base config above.
    // you cannot override individual elements of arrays. for example, `assembly.blocks`
    // if you override that, you must overwrite the whole value.
    // similar with includeDirs, you can't "add 1" or so; you have to replace the whole array.
    "debug": {
      "project": {
        "binDir": "./debug/bin",
        "objDir": "./debug/obj",
      },
      "variables": {
        "anything": "overridden",
      },
      "assembly": {
        "lua": {
          "minify": false, // overrides
        },
      },
    },
  },
};
```

# Lua preprocessor

ticbuild supports a fairly sophisticated Lua preprocessor, so you can have interaction
between files, inline macros, access project variables, import assets, conditionally branch,
and even import binaries with various encodings.

```lua
-- Simple text-based Lua preprocessor.
-- we want to support a few preprocessor features, and make the syntax not totally
-- break the language syntax. therefore, we will put it in comments.
-- Expressions and syntax should feel Lua-ish (not C++-ish, despite the preprocessor
-- directive set being C++-like).

--#pragma once -- useful for utils that will get included by multiple things.

--#define DEBUG 1
--#define SHOW_HUD -- bool-ish evals to true.
--#define PI 3.14

-- Expressions are Lua, and are evaluated immediately on parse.
--#define TAU PI*2
print() --#define XYZ -- note that here #define will not be processed.
  --#define XYZ -- but here it will be (whitespace allowed before)

-- Note that #defines do NOT result in Lua symbols or text replacement; they are
-- not macros, they are only recognized in other preprocessor directives.

--#include "utils/math.lua" -- extra comments are allowed in directive lines.
--#include "import:music-imported-cart:CODE" -- includes the imported code sub-asset from that cart
--#include "import:cart-with-only-code-chunk" -- implicit code-only import. If that cart contains more than CODE chunks, then you MUST specify ":CODE".

-- you can set variables that the included file can read
-- note that #pragma once will key against the filename AND its input variables.
-- the key/value style is Lua.
--#include "bayerKernel.lua" with { BAYER_SIZE = 4, DEBUG = true }

--#if DEBUG
print("debug")
--#else
-- something
--#endif -- DEBUG

--#if BAYER_SIZE == 4
-- ...
--#endif

--#if not defined(MAX_VOICES)
--#define MAX_VOICES 8
--#endif

-- Undefined preproc symbols shall not be `nil` even if that might feel natural.
-- using them in an expression shall be an error. Testing existence must be done
-- via `defined()`.

-- To be as "lua" as possible, `then` may feel natural at the end of that line,
--#if (MAX_VOICES < 4) then
--...
-- but don't support this. doesn't add anything and making it optional is unnecessary
-- complexity.

-- undefine:
--#undef MAX_VOICES

-- Access build system variables through a special function-like symbol
-- this will perform string substitutions and return the string. It will be done
-- at the preprocessor level though, and emitted as a string literal.
local s = __EXPAND("the project name is: $(project.name)")

-- __IMPORT and __ENCODE data transforms emitting as Lua literals.
--
-- __IMPORT(pipelineSpec, importRef)
-- __ENCODE(pipelineSpec, literalValue)
--
-- pipelineSpec is a single comma-chain of codecs/transforms.
-- It contains exactly one value codec, and everything before that is
-- interpreted as the source codec + byte transforms.
-- Whitespace is ignored.
--
-- Outputs either values or string (not a table literal)
--    local t = { __ENCODE(...) }
-- => local t = { 1,2,3 }
--
--    local a,b,c = __ENCODE(...)
-- => local a,b,c = 1,2,3

-- Source codecs (string input):
--   u8, s8, u16le, s16le, u24le, s24le, u32le, s32le
--   u16be, s16be, u24be, s24be, u32be, s32be
--   f16le, f16be, f32le, f32be, f64le, f64be
--   hex, b85+1, ascii, utf8, base64
-- Source codecs (binary input only):
--   raw, lz
-- Byte transforms:
--   lz, unlz, rle, unrle, ttz, take(start,length)
--
-- start is 0-based.
--
-- Value codecs:
--   u8, s8, u16le, s16le, u24le, s24le, u32le, s32le
--   u16be, s16be, u24be, s24be, u32be, s32be
--   f16le, f16be, f32le, f32be, f64le, f64be
--   hex, b85+1, ascii, utf8, base64
-- Value transforms:
--   norm, scale(k), q(B), w(W), toUppercase
--
-- where `k` is scalar (required)
-- where `B` is fractional bits
-- where `W` is maximum # of decimals after point

-- hex literal to normalized RGBA bytes
local c = { __ENCODE("hex,u8,norm", "#ff8000"), 0.5 }
-- generates:
local c = { 1,0.5,0,0.5 }

-- import hex palette as a hex string
local paletteString = __IMPORT("hex", "import:twilight_bog_palette")
-- generates:
local paletteString = "1f17143439434e5a6d5d8da289baabb8cfb9839c77727546383f38704b63a66470b8948ec8bfbfe1e6eaa48db6785a96"

-- import palette to signed 32-bit values (values output, not a table)
local paletteValues = { __IMPORT("s32", "import:twilight_bog_palette") }
-- generates:
local paletteValues = {873731871,1515078457,-1567793811,-1196705143,-1669088817,1182102135,1882734392,1688625995,-1902856080,-507527224,-1918571802,-1772455754}

-- base85+1 encoding with LZ compression in the source spec
local paletteCompressed = __IMPORT("ascii,lz,b85+1", "import:creditstxt")
-- generates:
local paletteCompressed = "..."

-- NOTE: string substitution is performed on spec strings and import/literal values.

-- LZ compression possible. The payload is compressed, then encoded with base85+1.
local paletteString = __IMPORT("raw,lz", "b85+1", "import:twilight_bog_palette") -- LZ compressed binary + base 85 encoding
-- generates:
local paletteString = "#!&,K2'Jqg;:0ML?NM;9@X16KdK:I.+F[e>T3,hN#VIXYUP`Ei\"^Z\">?UlDg->*]-g"

-- while it seems like "import:" is redundant, it's necessary because
-- it stays consistent with #include syntax and allows shared parsing/handling of import reference spec strings.

-- Literals are not supported and should error. Reasoning:
-- 1. we don't know the source encoding
-- 2. we don't want to create another weird syntax like "hex:123456"
-- 3. we don't want to make overloads of this function just for literals.

-- ...So we have another function: __ENCODE where you must specify the input encoding,
-- output spec, and the literal source value.
-- only string-based source format types are supported (so no "raw" for example, but "b85+1,lz" is ok)
local paletteString = __ENCODE("hex,lz", "b85+1", "1f17143439434e5a6d5d8da289baabb8cfb9839c77727546383f38704b63a66470b8948ec8bfbfe1e6eaa48db6785a96")
-- generates:
local paletteString = "!*u>VJ3C?PFD-`-qM7Tatcae[uGB.gq3'TBA94Oi0E4D-maM5LKk3Ab%[WkuA"
--                    "#!&,K2'Jqg;:0ML?NM;9@X16KdK:I.+F[e>T3,hN#VIXYUP`Ei\"^Z\">?UlDg->*]-g"
-- test with round trip:
local s = __ENCODE("b85+1,lz", "hex", "#!&,K2'Jqg;:0ML?NM;9@X16KdK:I.+F[e>T3,hN#VIXYUP`Ei\"^Z\">?UlDg->*]-g")

-- allows emitting a string literal from an imported text resource.
local scrollText = __IMPORT("", "", "import:somecart:")

-- once again, "import:" is required for consistency, and to allow literals (though it's not much
-- value but there for completeness.)
local s = __ENCODE("ascii", "ascii", "the project name is: $(project.name)") -- effectively the same as __EXPAND

-- macros are handy esp for writing optimized code (avoid symbol lookups, plus give
-- the minifier the chance to simplify / reduce expressions.
-- note that the macro call site should still be valid lua. similar reasoning
-- as preprocessor directives, and for example if the call site is `@clamp`,
-- things like autocomplete & formatting just won't work.
-- so like C, just blend in as a normal symbol and it's up to developers to avoid
-- conflicts.
-- by convention i'm guessing best to go all upper-case, and/or double-underscore prefix.
--#macro CLAMP(x, lo, hi) -- or __CLAMP
  ((x) < (lo) and (lo) or (x) > (hi) and (hi) or (x))
--#endmacro

-- example usage
local y = CLAMP(x + blah(y),
  0,
  1)

-- single-line macro syntax uses the arrow operator.
--#macro ADD(a, b) => ((a) + (b))

-- parameterless syntax is possible
--#macro PROJECT_NAME => __EXPAND("the project name is: $(project.name)")

```

# Code chunk behavior

Code chunk banks on cart are semantically slightly different than other chunk
types. Most of the time it's the simple, independent banks.

But when code is loaded by TIC-80, all code banks are concatenated in sequence.

Therefore, it's a warning to specify the bank explicitly for code chunks. But still
allowed as long as there's no conflict.

But if code wants to span multiple banks (larger than 1 bank), then no specified code banks should be
allowed (this is an error).

And for the code chunk alone, if code is larger than 1 bank, it gets automatically
split across multiple banks.


# Symbol / intellisense database / map / index

Builds shall output a JSON index that can be used for intellisense / code inspection.

## Models

- `ProjectIndex` (top-level index for the whole project)
- `FileIndex` - per-file
- `Symbol` - of type function/variable/etc..
- `Scope` - defines which symbols are relevant where, defines a hierarchy.
- `Span` - defines a text range in a file, offset byte-based (start,length). Don't use line:col because intermediate processing is awkward and complex, and even sometimes ambiguous
when combining files with newline at ends.

There's some redundancy in the index for the sake of efficient lookups (easy to write
during gen; awkward to jump around when doing lookups)

## Stable symbol IDs

ids should be at least a bit descriptive, plus be useful as identity
across the project.

`sym:src/util/math.lua+134:clamp`

- `sym:` for sanity
- `src/util/math.lua` relative path to file where it's declared
- `+134` byte offset in file
- `:clamp` symbol name.

## minifier interaction

No interaction necessary. Minifier runs after preprocessor stuff and we basically
don't expect the user to interact with minified code in any way that would interact 
with this index system.

## preprocessor interaction

The indexer will see 1 huge preprocessed Lua file before minification. The preprocessor
needs to be able to provide a translation from preprocessed locations -> original
locations.

It's effectively a span-based mapping from preprocessed lua to sources.

So the indexer sees 1 huge file, but symbols within it can refer to other files.

Example 2 source files:

```lua
-- utils.lua
function log(msg)
  print(msg)
end
```

```lua
-- math.lua
--#include "./utils.lua"
function clamp(value, min, max)
  return math.min(math.max(value, min), max);
end
```
```lua
-- main.lua

--#include "./math.lua"
function TIC()
end
```

What the indexer sees:

```lua
function log(msg)
  print(msg)
end
function clamp(value, min, max)
  return math.min(math.max(value, min), max);
end
function TIC()
end
```

So when you're editing `main.lua` and type `clam` and auto-complete, `clamp` shall
be shown, and upon `F12` to go to definition, it should refer to `math.lua:2` -
just after the `--#include`.

The indexer however will see this as `(expanded lua):4`. The indexer will accept a source
map to translate its locations to "real" source locations.

## macros & other preprocessor interaction

```lua
--#if DEBUG
--#macro CLAMP(x, lo, hi)
  ((x) < (lo) and (lo) or (x) > (hi) and (hi) or (x))
--#endmacro
--#endif
```

We should emit the `CLAMP` macro symbol. So the preprocessor should be able to
emit global symbols as well (they're not really global symbols but in our index
it can be)

## Overloads

Overwrite symbol with latest (largest offset in preprocessed file) incarnation.

```lua
function xyz(a) end -- this will not appear in the index; it's superceded by...
function xyz(b) end -- ... this one.
```

## pipeline

`original sources -> preprocessor -> indexer`

Preprocessor outputs:

- a big lua file
- source map
- emitted pp symbols

The indexer will accept a source mapper which it uses to generate the correct
index output json.

Doing this as a post step adds too much extra plumbing. Better to just give the indexer
the resources to get it right the first time.

## Source Map

internally the structure is effectively a bunch of segments and define where they came from.

```jsonc
{
  "preprocessedFile": { "byteLength": 12345, "hash": "sha1:..." },
  "segments": [
    { "ppBegin": 0, "ppEnd": 53, "originalFile": "src/utils.lua", "originalOffset": 0 },
    { "ppBegin": 53, "ppEnd": 150, "originalFile": "src/math.lua", "originalOffset": 24 },
    { "ppBegin": 150, "ppEnd": 200, "originalFile": "src/main.lua", "originalOffset": 18 }
  ]
}
```

The map functional interface is effectively just

```ts
interface ISourceMap {
  preprocessedOffsetToOriginal(expandedByteOffset)
    : { file, fileByteOffset } | null;
}
```

## Cross-file scopes vs. spans

Technically a scope can span multiple files. So a single `range` can't be always accurate.


```lua
-- logsignature.lua
function log(msg)
```

```lua
-- main.lua
--#include "./logsignature.lua" -- ugh don't ever do this.
  print(msg)
end
```

What the indexer sees (preprocessed output):

```lua
function log(msg)
  print(msg)
end
```

Maybe there are some more sensible examples where this might actually be handy,
but anyway in this case the scope isn't really clear and i don't care to support this
except for making sure things don't totally break.

Well maybe a more obvious example is global scope, which in theory includes all 
the files which are included (though start/end will still get calculated as being
in main.lua).

So maybe it's fine to just force all ranges to be described as being in a single
file. It's not trivial to have cross-file ranges because there's currently no
sense of file ordering. and adding complexity to support this is not ... no.

## built-in symbols

phase 2: for the built-in TIC-80 symbols, we can make a Lua file that would generate
the respective symbols in an index. Bundle it with ticbuild and during index, just
include it silently at the top.

increases the need for luadoc/emmylua, so we can actually provide more help.

## example annotated symbol index file

```jsonc

// PROJECT INDEX
{
  "schemaVersion": 1,
  "generatedAt": "2026-02-08T12:34:56.000Z",
  "projectRoot": "c:\\abs\\path\\to\\project",

  "files": {
    "src/main.lua": { /* FileIndex (see below) */ },
    "src/util/math.lua": { /* FileIndex */ }
  },

  // convenience indices; easier lookups; points to the canonical location.
  "globalIndex": {// Global cross-file indexes
    "symbolsByName": {
      "TIC": [
        { "file": "src/main.lua", "symbolId": "sym:src/main.lua#12" }
      ],
      "clamp": [
        { "file": "src/util/math.lua", "symbolId": "sym:src/util/math.lua#3" } ]
    },
    // more ?
  },
}

// PER-FILE INDEX
{
  "hash": "<content-hash>", // allow caching
  "path": "\\path\\to\\file.lua", // relative to project root

  // scopes for locals, for completion + hover + signature help context.
  "scopes": [
    {
      "scopeId": "scope:src/main.lua#1",
      // | "file"
      // | "function" 
      // | "for"
      // | "do"
      // | "if"
      // | "while"
      // ...
      "kind": "file",
      "range": { /*...*/ },
      // symbols declared in immediate scope body. make fast lookup by name
      // by making it a Record<symbolName, pointer>
      "declaredSymbolIds": {
        "x": "sym:src/main.lua+12:x",
        "y": "sym:src/main.lua+13:y"},
      "parentScopeId": null
    },
    {
      "scopeId": "scope:src/main.lua+14",
      "kind": "function",
      "range": { /*...*/ },
      "declaredSymbolIds": { /*... */ },
      "parentScopeId": "scope:src/main.lua+9"
    }
  ],

  "symbols": {
    "sym:src/main.lua#12": { /* Symbol (see below) */ },
    "sym:src/main.lua#13": { /* Symbol */ }
  },

  // more convenience to know "what symbol is under the cursor":
  "symbolSpans": [
    { "symbolId": "sym:src/main.lua#12", "range": { /*...*/ } },
    { "symbolId": "sym:src/main.lua#4#x", "range": { /*...*/ } }
  ]  
}

// PER-SYMBOL INDEX
{
  "symbolId": "sym:src/util/math.lua#3",
  "name": "clamp",
  // | "localVariable"
  // | "globalVariable"
  // | "macro" -- i mean, not sure if there's going to be functional difference between this & function
  // | "function"
  // | "param"
  // | "field" -- not sure this will be relevant because we don't capture table shapes / types
  // | "type" -- not sure this will be relevant because we don't capture table shapes / types
  "kind": "function",
  "range": { /*...*/ }, // full span of the declaration statement (for function, the whole body of the function)
  "selectionRange": { /*...*/ }, // just name, for definition UX

  // parsed luadoc/emmylua docs
  "doc": {
    "name": "...", // probably should never use this; if it differs from the real name then more likely a bad copy/paste.
    "description": "...",
    "type": "...",
    "returnType": "...",
    "returnDescription": "...",
  },

  "scopeId": "scope:src/util/math.lua#1",
  // "local" confines to scope
  // "global"
  "visibility": "local",

  // for LuaDoc / EmmyLua, this could point to its doc
  // without doc comments, basically everything is guesswork; it's probably
  // worth it in order to for example understand types. Without
  // doc comments we just kinda can't touch types.
  // "docId": "doc:src/util/math.lua#3",

  // For signature help & hover
  "callable": {
    "isColonMethod": false, // declared as `function T:foo()` for example
    "params": [
      "sym:src/util/math.lua@4(1):x",
      "sym:src/util/math.lua@4(3):min",
      "sym:src/util/math.lua@4(7):max",
    ],
  },
}

```

# FAQ

gotta be asked questions in order to answer them.
