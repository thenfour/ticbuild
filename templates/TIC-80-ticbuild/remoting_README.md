# Features in this fork

- Remoting server
- Frame timing and remoting display in window title and HUD (access via <kbd>ALT+0</kbd>)

# Perf HUD color scheme and thresholds

HUD colors are configured with these optional command line args:

- `--hud-palette-outline`
- `--hud-palette-text`
- `--hud-palette-ok`
- `--hud-palette-warning`
- `--hud-palette-alert`

Each value can be:

- `auto` (use built-in target color matching against current frame palette)
- a palette index (`0` to `15`)
- a hex color token without `#`, in either `rgb` or `rrggbb` form (`f80`, `ff8800`)

`auto` default targets are:

- outline: black
- text: white
- ok: green
- warning: orange/yellow
- alert: red

Threshold command line args:

- `--thresh-fps-warn` (fps)
- `--thresh-fps-alert` (fps)
- `--thresh-mem-warn` (kb)
- `--thresh-mem-alert` (kb)
- `--thresh-cycles-warn` (kcycles)
- `--thresh-cycles-alert` (kcycles)

Default thresholds:

- FPS: warning `<57`, alert `<53`
- MEM: warning `>102400` kb, alert `>256000` kb
- cycles (TIC/SCN+BDR): warning `>1800` kcycles, alert `>2400` kcycles

Threshold state is checked as alert first, then warning, then OK. For FPS (lower is
worse), comparisons are inverted.

Graph coloring is evaluated per rendered x-column and value text is colored by the
same severity. Custom perf metrics always use OK color.

# remoting support for ticbuild

[ticbuild](https://github.com/thenfour/ticbuild) is a build system for TIC-80 which
supports watching cart dependencies for live updates.

In order to make that work, we need to add some functionality to TIC-80 for remote control.

We add a command line arg:

`tic80.exe --remoting-port=9977`

While TIC-80 is running, it will listen on this port for remote commands. Always
binds to `127.0.0.1`. Up to 10 clients supported.

# Protocol

- Line-based human readable (terminal-friendly)
- dead-simple, no optional args or multiple datatypes if possible.
- requests
  - each line in the form `<id> <command> <args...>`
    - `id` is an id used to pair responses with requests. `id` must be integral number, and non-negative (>=0).
      Invalid/negative IDs won't echo back to clients; id will be `0` in that case. (`-1 hello` will give response `0 ERR "invalid id"`)
    - example: `1 sync 24`
    - example: `1 poke 0x8fff <24 ff c0>`
      - this `<xx ...>` syntax allows representing binary data in hex byte form
      - multiple args are separated by whitespace.
    - example: `1 eval "trace(\"hello from remote\")"`
      - quotes wrap an arg that contains whitespace. Escape char is `\`
        - `\\` = `\`
        - `\"` = `"`
    - commands are not case-sensitive. `sync` and `SYNC` and `SyNc` are equivalent.
    - whitespace is forgiving. `1   sync    24` (or tabs) is the same as `1 sync 24`.
    - trailing whitespace is trimmed/ignored
    - non-ASCII chars are considered an error.
    - named args not supported (yet)
  - commands supported:
    - `hello` - returns a description of the system (TIC-80 remoting v1)
    - `load <cart_path.tic> <run:1|0>`, e.g. `load "c:\\xyz.tic" 1`.
      If the run flag is `0`, the cart is just loaded. If `1`, the cart is
      launched after successful load.
    - `ping` - returns data `PONG`
    - `sync <flags>` - returns nothing (syncs cart & runtime memory; see tic80 docs)
    - `poke <addr> <data>` - returns nothing
    - `peek <addr> <size>`
      - returns the binary result, e.g., `<c0 a7 ff 00>`.
      - size is required even if it's only 1.
    - `restart`
    - `quit`
    - `eval <code>` - no return possible (`tic_script.eval` has `void` return type).
      you could just make the script do something visible, like `poke()`.
      - TODO: enable trace output to remote? or support return data?
    - `evalexpr <expression>` - returns the result of the given single expression.
      It's effectively your expression with `return` prepended, allowing syntax like `1+3`
      or `width * size`
      without having to type `return width * size`. That can cause issues if you need
      to execute a lot of code, but always workaroundable with something like,
      `evelexpr "(function() ... end)()"`.
    - `status` - return runtime & loaded cart status. see below.
    - `listglobals` - returns a single-line, comma-separated list of eval-able
      global symbols (identifier keys from the Lua global environment).
    - `typeschema <symbol>` - returns a type schema of the specified global symbol. see below.
    - `getfps` - gets current FPS
    - `cartpath` - returns the full path to the currently open cartridge.
      empty string if there's no open cart.
    - `fs` - returns the current filesystem local path (the one you can control via command line `--fs=...`)
    - `perf` - returns current live performance metrics. see below for response
    - `metadata <key>` - returns the value for the metadata value in code.
      See: https://github.com/nesbox/TIC-80/wiki/Cartridge-Metadata.
    - `lua_profiler_start <mode> <instructionInterval> <wallClockPeriodMicros> <seconds?> <output_path?>` - Starts a
      Lua performance profiling session. See below for performance profiler instructions.
    - `lua_profiler_stop <output_path>`. Stops the profiler and writes the output to the optional
      specified path (otherwise one is auto-generated)
      See below for performance profiler instructions.
    - `lua_profiler_status` - returns the status of the lua profiler
    - `event_subscribe <event_type|event_type> <enabled:1|0>` - set client subscription status for event types.
      Specify the event types to affect; they can be combined with pipe char `|`. Enable subscription to the
      types with `1`; `0` will unsubscribe. Event types that aren't specified here are unaffected.
      Example: `0 event_subscribe "trace|cart_run" 1` enables
      receiving `trace()` and cart run events pushed from server to client (and other event types remain unaffected)
  - datatypes
    - numbers (integral, negative, decimal)
      - No fancy `1e3` forms
      - integral: `1` `0` `24` `-1000`
      - decimal: `1.011` `.1` `-123.456` `.1`
        - leading `0` not necessary (`.1` is valid; `0.1` is also valid)
        - trailing decimal supported (`1.` is valid)
        - decimal on its own (no leading 0 + trailing decimal) is an error (`.`)
      - hex `0xff` `-0x1` (always integral, prefix with `0x`).
    - strings
      - always require double quotes, ASCII-only, escape char is `\`.
    - binary, enclosed in `<` and `>`.
      - example: `<ff 22 00>`
      - string syntax: always hexadecimal.
      - whitespace is ignored so `<ff2200>` or `<f f220 0>` are equivalent to `<ff 22 00>`
- response
  - datatypes follow same convention as requests
  - `<id> <status> <data...>`
    - `id` is the same ID as the request. no checking is done on this, you can
      send the same id always and the server doesn't care.
    - `status` is either `OK` or `ERR`
    - data is defined by the command, but is similar to the request args.
      - `1 ping` => `1 OK PONG`
      - `44 sync 24` => `44 OK`
      - `xx` => `0 ERR "error description here"`
  - events (pushed from server to client): `<-id> <eventtype> <data...>`
    - server can send event messages to the client using similar message format. The
      message id is a negative integer (e.g. `-243`). Datatype syntax remains.
      Note that clients will only receive event types they subscribe to via `event_subscribe`
      explicitly; by default clients do not receive any events. Event subscription is
      per-client; if client A subscribes, then only it receives the event; it doesn't
      affect other clients. No guarantees are made about ids being in a particular order,
      having gaps, or duplicates (though reasonably speaking there won't be duplicates due to int64 numeric range).
      Examples of received events:
      - `-1 trace "hello from tic80"` sent for all `trace()` Lua calls.
      - `-2 cart_run` sent when cart is launched / game is run (ctrl+R)
      - `-3 lua_profiler_stopped` sent when the lua profiler finishes
      - (this is the only one supported so far)
- Commands to be queued and executed at a deterministic safe point in the
  TIC-80 system loop (e.g., between frames if the cart is running)

# `perf` command

returns a single-line, comma-separated, `key=value` pairs.

## keys

- `client_count` integer; number of clients connected to remoting
- `fps` current capped FPS from the rolling window tracker, floating-point (e.g. `59.95`, `60`)
- `fps_uncapped` estimated uncapped FPS derived from `total_ms`, integral.
- `tic_ms` time spent in TIC, in milliseconds quantized to `0.1ms`.
- `scn_ms`
- `bdr_ms`
- `total_ms` total time spent in TIC+SCN+BDR, in milliseconds quantized to `0.1ms`.
- `tic_cycles` number of Lua VM cycles spent in TIC. integral.
- `scn_cycles`
- `bdr_cycles`
- `total_cycles`
- `lua_gc_mem` - lua's gc memory usage, in bytes (integral)

Timing values are measured as fixed-point `ms10` internally, so all `*_ms` values
are rounded to the nearest `0.1ms` before being exposed. `fps_uncapped` is
derived from that quantized `total_ms` value, so it is approximate and becomes
coarser at very high frame rates.

# Discovery Protocol

When the remoting server is listening, we will make the server discoverable by
placing a json file on the filesystem.

If the file already exists, it shall be overwritten.

The file is to be deleted when the server stops listening.

The global file will be placed in `%LOCALAPPDATA%\TIC-80\remoting\sessions\` and
the file is to be named `tic80-remote.<pid>.json`. Its contents will look like,

```json
{
  "pid": 1234,
  "host": "127.0.0.1",
  "port": 51000,
  "startedAt": "2026-01-31T19:50:26.859Z",
  "remotingVersion": "v1"
}
```

- `remotingVersion` is the same as in the `hello` command.

We also must support a new command line arg, for specifying where to output the
remote session file.

`tic80.exe --remote-session-location=c:\my\folder`

will write the discovery file as `c:\my\folder\tic80-remote.<pid>.json`

The global discovery location (under `%LOCALAPPDATA%`) is written unless disabled
with the `--global-disco=OFF|ON` command line arg. It is `ON` by default. The
user-specified `--remote-session-location` file is always written regardless of
the global flag.

example:

`tic80.exe --remote-session-location=c:\my\folder --global-disco=OFF`

writes the remote session file to `c:\my\folder`

# `typeschema <symbol>`

Returns the type schema of the specified global symbol. For simple values it's
the same as Lua's keyword `type(x)`. So it can return:

- `string`
- `number`
- `function`
- `boolean`
- `nil`

However for tables

- `table`

# code structure

changes to existing "official" TIC-80 code to be surgical and minimal. put our own
sources under `/src/ticbuild_remoting`.

# performance profiler

Want to see which Lua functions or lines are causing performance issues? The
following remoting commands can be used to record stack trace samples to eventually
view in as a flame graph.

`lua_profiler_start <mode> <instructionInterval> <wallClockPeriodMicros> <seconds?> <output_path?>`

Starts a Lua performance profiling session.

- `mode` can be:
  - `instructions`: samples are collected every `<instructionInterval>` Lua instructions.
  - `wallclock`: samples are collected every `<wallClockPeriodMicros>` microseconds
    (1000 micros = 1 millisecond). Because of the way we sample the Lua runtime,
    `<instructionInterval>` is still used here.
- `seconds` is optional and specifies the # of seconds to profile for. After this # of
  seconds has elapsed, profiling stops automatically on the next regular update/frame poll.
- `output_path` has the same semantics as `lua_profiler_stop`. Optional; and only
  used when `seconds` is specified. If not specified, auto-stop will choose an auto
  temp file path.

When `seconds` is specified, the `lua_profiler_start` response includes the reserved
save path immediately, for example:

`auto_stop=1,duration=12,output_path="C:\\Users\\you\\AppData\\Local\\Temp\\tic80-lua-profiler-1234.txt"`

When `seconds` is omitted, the response is:

`auto_stop=0`

Notes:

- It is an error to start a session when one is already running
- It is an error to stop a session when one is not running.
- It is not defined how the profiler acts when reloading/stopping/pausing etc. Don't bother handling these scenarios explicitly; that's on the user.

Once profiling is started, the title bar will indicate that profiling is active.

`TIC-80 | 60/60 fps | 55 + 3 = 58 kcyc | 1.2 ms | 100 kb | listening on 127.0.0.1:55555 (1 client) | PROFILING... 12s`

To stop profiling and collect the data, call

`lua_profiler_stop <output_path>`.

Stops the profiler and writes the output to the specified path. If no path is specified,
a temp path is chosen. The response will indicate the saved file path.

`lua_profiler_status`

returns the status of the lua profiler. single-line, comma-separated, `key=value` pairs.

examples:

```
running=0,auto_stop=0
running=1,auto_stop=0,mode=instructions,instruction_interval=1000,elapsed_seconds=12
running=1,auto_stop=1,mode=wallclock,instruction_interval=1000,wall_clock_period_micros=10,elapsed_seconds=12,duration=30,remaining_seconds=18,output_path="C:\\Users\\you\\AppData\\Local\\Temp\\tic80-lua-profiler-1234.txt"
```

## `instructions` vs. `wallclock` mode

Lua instructions are a host-agnostic way to measure performance. If you're working on a team
of people with different computer specs, you cannot for example compare FPS values.
In this case Lua instructions (or kcycles as in the title bar) is an objective cross-host
metric.

Just be aware that not all instructions are made equal, so there are cases where
you optimize for kcycles but actual Windows host performance is worse.

For profiling on your own machine against your own metrics during development,
`wallclock` can be more useful. It measures the actual host time spent. So while
it is the actual metric that says "this is running faster", it's not consistent because
it depends on the environment: if another process is hogging CPU, or if you run
in a VM etc, you cannot compare the values anymore.

Further note about difficulties in measuring `wallclock`: we use `lua_getstack` and `lua_getinfo`,
which cannot be run at arbitrary times. We therefore use `lua_sethook`, but this
operates on a lua instruction count basis, not host clock. So in order to sample
at host clock intervals, we use `lua_sethook` but on a tight-ish interval,
and check if a sample is due. If not, return. If it's due, collect the sample.

This means some kind of jitter can cause slight noise, but that's not expected
to be an issue over thousands of collections.

Jitter can even be a good thing in profiling because some natural code loops/cadences
can accidentally line up with the sampling cadence. Apparently most profilers
introduce some strategic jitter to ensure this is accounted for. Not sure our kind
of jitter would be the good kind or not.

## Stats collection

We're going to collect stats in the least intrusive way possible. We are expecting
a lot of hits for certain paths, so a map-like structure is expected here. Better
to defer any processing (like mapping stack trace to symbols/source file:line etc)
until when the session is ended, to avoid affecting runtime.

As tempting as it is to introduce C++, let's stay in C for consistency.

## Output format

The output is a plain text file that can be imported to [speedscope](https://github.com/jlfwong/speedscope/).

In particular the "Brendan Gregg" format is fine for us. Just line-based plain text,
each line has a semi-colon delimited stack frames and integral sample count at the end.

```
main;a;b;c 1
main;a;b;c 1
main;a;b;d 4
main;a;b;c 3
main;a;b 5
```

## Integration with existing system

`lua_sethook` I believe just handles one hook at a time. It's not some kind of hook chain;
the interval needs to be chosen for the hook and the profiling hook will want
a different cadence than the default hook.

It means either we disable the exsiting perf hook during profiling, or we find a
way to synergize. Disabling existing hook is impossible because it's important information
even during profiling.

The existing hook interval is `TB_LUA_HOOK_STEP = 1000`.

## Example

**First, be running this fork of TIC-80 with a cart**

**Launch remote terminal**

easiest way is

```
> ticbuild terminal
```

which will automatically connect, via the discovery protocol

**Begin profiling**

Let's do a timed 10-second profile...

```
0 lua_profiler_start "wallclock" 1000 50 4
```

Which returns:

```
0 OK auto_stop=1,duration=4,output_path="C:\\Users\\carl\\AppData\\Local\\Temp\\tic80-lua-profiler-34672.txt"
```

This samples on a host time cadence, checking every 1000 lua instructions if the
50 microsecond sample is due.

Sample collection happens over 4 seconds, and then stops automatically, placing the
file. This is done silently; remoting clients don't get a notification that profiling has
stopped.

**Checking on status**

```
0 lua_profiler_status
```

While the auto-stopping profile session is capturing, the response can be like,

```
0 OK running=1,auto_stop=1,mode=wallclock,instruction_interval=1000,
wall_clock_period_micros=50,elapsed_seconds=1,duration=4,remaining_seconds=3,
output_path="C:\\Users\\carl\\AppData\\Local\\Temp\\tic80-lua-profiler-34672.txt"
```

Notably, `remaining_seconds` can be used by clients to know how much time
is left in the capture session.

Also note: output_path is not sticky; after the file is written, this status goes back
to:

```
> 0 lua_profiler_status
0 OK running=0,auto_stop=0
```

# `status` command

Similar to `perf`, returns a single-line, comma-separated, `key=value` pairs.

## keys

- `cart_loaded_at` timestamp when the current cartridge was loaded. `0` if there's no cart.
- `cart_last_launch_at` timestamp when the cart was last launched (ignores pausing/resuming).
  if never launched, `0`. Also this resets when cart changes.
- `now` current wall clock timestamp; for reference / sanity check against the other fields
- `process_started_at` timestamp when this process was started.
- `pid` the pid of the this process

Timestamps are unix epoch.

Hosts can use `cart_loaded_at` and `cart_last_launch_at` to guarantee if the
cart has changed (note that changing Lua code requires a relaunch).

```
> 0 status
0 OK cart_loaded_at=1767225600123,cart_last_launch_at=1767225600456,now=1767225610000,process_started_at=1767225600123,pid=1773
```

While serial generation counters would be theoretically more precise, timestamps
are just simpler in code (`ts = time()` instead of `gen = existing_gen + 1`).

Generation is also problematic if you ever compare across sessions. We want that
`cart_loaded_at` is _always_ different on a different cart load, no matter which
tic-80 instance did it. Simplifies client logic.
