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
