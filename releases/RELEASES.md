## v1.0.23

**TypeScript Support**

- #64 Added support for TypeScript transpilation, and a lot of supporting features for that.

**Lua preprocessor improvements**

- #71 Fixed: `--#macro` shadows previous definitions
- #45 #72 Hardened design of macros, added parameterless shorthand and statement list support, fixes.
- #63 Added ability to undefine a preprocessor directive in the project manifest

**Better Lua minifier**

- #58 Lua optimizer: bracketed string representation when it's shorter
- #70 Lua short name generation improvements (more chars, scope-aware, some fixes)
- #73 Lua optimizer: global symbols can now be renamed with opt-in or opt-out behavior
- #74 Lua optimizer: many small optimizations which combine to remove a lot of dead code and inlining consts
- #76 Lua optimizer does multiple passes and supports a better options archeticture
- #78 Added `tight2` lua output format which improves on existing `tight` by removing a lot of unnecessary whitespace.

**Better watch, terminal, debugging facilities**

- #68 Fixed: awkward terminal handling of incoming messages
- #67 `watch` now exposes a terminal
- #66 TIC-80 script errors are now exposed, with source mapping and local variable dumps
- #65 Fixed: source mappings survive minification
- #77 Added `traceable` Lua output format, making symbol lookup more accurate

**Other**

- #28 Added support for custom importers by supporting command invoking manifestation
- #62 Base build configuration name is clearer
- #69 Removed support for manifest-specified Lua globals; they were not correct, unnecessary, not useful, confusing.
- #61 added support for `lzrle` and `unlzrle`, added a search so LZ chooses most optimal profile

## v1.0.22 (2026-8-11)

- #59 new tic-80 build with HMR support

## v1.0.21 (2026-7-31)

- #54 fixed minifier: aliasRepeatedExpressions was clobbering some symbolsbug
- #55 minifier: 200 local limit in Lua is now respected / handled explicitly
- #56 always output jsonl in obj dir

## v1.0.20 (2026-7-30)

- #50 fixing minifier "simplify expressions" rule wrongly replacing `TableKey` tokens.
- #51 adding `--reporter jsonl` for machine readible build output

## v1.0.19 (2026-7-4)

- #50 new tic80 build with additional profiling option

## v1.0.18 (2026-6-30)

- #44 better size build logging
- #47 fixing minifier handling of `TableKeyString`
- #46 support for global name minification
- #48 don't emit compressed payload when not used in cart
- #49 support for extended 16 code banks and multi-bank compressed code chunks

## v1.0.17 (2026-4-30)

- support for client -> server messages
- New tic80 remoting updates
  - [Protocol now understands decimal numbers](https://github.com/thenfour/TIC-80-ticbuild/issues/15)
  - [Server -> client event pushing and subscription](https://github.com/thenfour/TIC-80-ticbuild/issues/14)
  - [`status` command support](https://github.com/thenfour/TIC-80-ticbuild/issues/13)

## v1.0.16 (2026-4-28)

- Allow macros to be empty / NOP support (#41)
- More reliable dependency watching/tracking (#36)
- `additionalWatchGlobs` support (#36)
- Can now emit metadata comments (#39)
- Updated tic80.exe with support (#42)
  - uncapped FPS, host wall clock timings
  - performance profiling sample based capture for flame graphs
  - improved data exchange

## v1.0.15 (2026-4-23)

- Updated tic80.exe with fixed SCN+BDR timing measurements (#35)
- Imported code is concatenated / banked properly (#17)
- Fixed: banked code outputs in the wrong order (#32)
- added ability to define preprocessor defines in manifest (#29)
- added support for `#ifdef` and `#ifndef` (#30)
- auto-update the manifest schema json (#38)
- fixed: sometimes watch launches the tic80 with no cart (#37)

## v1.0.14 (2026-2-14)

- Updated tic80.exe with improved perf HUD with graphs and thresholding

## v1.0.13 (2026-2-13)

- TIC-80.exe updated with improved `perf` HUD, reporting, and multi-disco session file output
- Adding `terminal` command for remoting client
- Adding `disco` discovery listing
- Adding `--terminal` as an option to `t` command
- Adding `tt` launch + terminal alias

## v1.0.12 (2026-02-09)

- output symbol / signature index file including TIC-80 builtins #26

## v1.0.11 (2026-02-02)

- `__ENCODE` and `__IMPORT` can now accept number lists
- Import encoded strings can come from files.
- New TIC-80 build with more remoting commands (`listglobals`, `evalexpr`, ...)
- Discovery session file is placed within the project dir for auto-connect by the VS Code extension.

## v1.0.10 (2026-01-30)

- Adding REPL for testing Lua minification & processing
- Support launch args in manifest
- Breaking spec change for `__IMPORT` and `__ENCODE` for better syntax and more encoding options.
