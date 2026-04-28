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
