# Lua minifier output-size benchmark

This benchmark compares ticbuild's production release optimizer with established Lua minifiers on identical source files. It is an output-size benchmark, not a microbenchmark of startup or processing speed.

Run the checked-in corpus:

```powershell
npm run benchmark:lua-minifiers
```

Run it against one or more real preprocessed Lua files or directories, and optionally save machine-readable results:

```powershell
npm run benchmark:lua-minifiers -- build/release-obj/maincode.01.preprocessed.lua --json temp/lua-minifiers.json
```

The default comparison includes:

- `ticbuild`: the exact release options used by `CodeResourceView`.
- [`luamin`](https://github.com/mathiasbynens/luamin): pinned as a development dependency and always available after `npm install`.
- [`darklua`](https://darklua.com/docs/getting-started/): `process` with the checked-in default-rule/dense-output configuration, when `darklua` is on `PATH` or `DARKLUA_BIN` points to the executable. The checked-in rule list prevents a future darklua default change from silently changing the benchmark.
- [`LuaSrcDiet`](https://github.com/jirutka/luasrcdiet): its `--maximum` configuration, when `luasrcdiet` is on `PATH` or `LUASRCDIET_BIN` points to the executable.

The corpus intentionally uses the portable Lua 5.1 language subset supported by all four tools. Custom inputs are parsed as Lua 5.3, matching ticbuild's parser.

## Metrics and interpretation

For each standalone input file, the runner reports:

- UTF-8 output bytes, the direct TIC-80 source-code budget.
- zlib-max bytes, using the same zlib settings as ticbuild's `zlib-max` code-compression mode.

Totals are sums of per-file results. If your project preprocesses many files into one code block, pass that preprocessed artifact as one input so the benchmark sees the same whole-program optimization opportunities and compression dictionary as the real build.

Every input and generated output must parse successfully before a tool is ranked. This catches broken output, but parsing is not proof of semantic equivalence; optimizer correctness remains the job of focused regression and runtime tests.

The tools do not all promise the same transformations. In particular, ticbuild's production configuration performs expression simplification, unused-local removal, local declaration packing, and profitable aliasing in addition to lexical minification. The comparison therefore answers the practical question "how large is each tool's production output?" rather than trying to isolate equivalent individual rules.
