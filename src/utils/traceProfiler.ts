import { performance } from "node:perf_hooks";

// TypeScript lowers `using` declarations to Symbol.dispose calls. Keep the
// profiler usable on the older Node runtimes ticbuild has historically allowed.
const symbolWithDispose = Symbol as SymbolConstructor & { dispose?: symbol };
if (typeof symbolWithDispose.dispose !== "symbol") {
  Object.defineProperty(symbolWithDispose, "dispose", {
    configurable: false,
    enumerable: false,
    value: Symbol("Symbol.dispose"),
    writable: false,
  });
}

export type TraceArgument = string | number | boolean | null;
export type TraceArguments = Readonly<Record<string, TraceArgument | undefined>>;

export type TraceScopeOptions = {
  category?: string;
  args?: TraceArguments;
  parent?: TraceScope;
};

type TraceClock = () => number;

type RecordedSpan = {
  id: number;
  parentId?: number;
  trackId: number;
  name: string;
  category: string;
  startUs: number;
  endUs?: number;
  args: Record<string, TraceArgument>;
};


export type ChromeTraceEvent = {
  name: string;
  cat?: string;
  ph: "M" | "X";
  pid: number;
  tid: number;
  ts: number;
  dur?: number;
  args?: Record<string, TraceArgument>;
};

export type ChromeTraceFile = {
  traceEvents: ChromeTraceEvent[];
  displayTimeUnit: "ms";
};



// a timeline track in the trace, like a DAW track.
// a track can contain many scopes but they must never overlap. nesting is allowed.
// basically, thread-like.
// work which can overlap belongs on separate tracks.
export class TraceTrack {
  private readonly openScopes: TraceScope[] = [];

  constructor(
    private readonly profiler: TraceProfiler,
    readonly id: number,
    readonly name: string,
    private readonly defaultParentId?: number,
  ) { }

  enter(name: string, options: TraceScopeOptions = {}): TraceScope {
    const parent = this.openScopes[this.openScopes.length - 1];
    const span = this.profiler.beginSpan(
      this,
      name,
      options,
      parent?.spanId ?? options.parent?.spanId ?? this.defaultParentId,
    );
    const scope = new TraceScope(this, span);
    this.openScopes.push(scope);
    return scope;
  }

  close(scope: TraceScope): void {
    const current = this.openScopes[this.openScopes.length - 1];
    if (current !== scope) {
      throw new Error(`Trace scope '${scope.name}' on track '${this.name}' was closed out of order`);
    }
    this.openScopes.pop();
    this.profiler.endSpan(scope.spanId);
  }

  get hasOpenScopes(): boolean {
    return this.openScopes.length > 0;
  }

  profileSync<T>(
    name: string,
    options: TraceScopeOptions,
    fn: (scope: TraceScope) => T,
  ): T {
    return profileSync(this, name, options, (scope) => fn(scope!));
  }

  profileAsync<T>(
    name: string,
    options: TraceScopeOptions,
    fn: (scope: TraceScope) => Promise<T>,
  ): Promise<T> {
    return profileAsync(this, name, options, (scope) => fn(scope!));
  }
}

export class TraceScope implements Disposable {
  private closed = false;

  constructor(
    readonly track: TraceTrack,
    private readonly span: RecordedSpan,
  ) { }

  get spanId(): number {
    return this.span.id;
  }

  get name(): string {
    return this.span.name;
  }

  enter(name: string, options: TraceScopeOptions = {}): TraceScope {
    if (this.closed) {
      throw new Error(`Cannot enter a child of closed trace scope '${this.name}'`);
    }
    return this.track.enter(name, options);
  }

  setArgs(args: TraceArguments): void {
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        this.span.args[key] = value;
      }
    }
  }

  close(): void {
    if (this.closed) {
      return;
    }
    this.track.close(this);
    this.closed = true;
  }

  [Symbol.dispose](): void {
    this.close();
  }

  // executes a code block as a child of  this scope. syntax helper.
  profileSync<T>(
    name: string,
    options: TraceScopeOptions,
    fn: (scope: TraceScope) => T,
  ): T {
    return profileSync(this, name, options, (scope) => fn(scope!));
  }

  // async version of profileSync.
  profileAsync<T>(
    name: string,
    options: TraceScopeOptions,
    fn: (scope: TraceScope) => Promise<T>,
  ): Promise<T> {
    return profileAsync(this, name, options, (scope) => fn(scope!));
  }
}

type TraceParent = TraceTrack | TraceScope;

/** Runs a callback even when profiling is unavailable, tracing it when a parent is provided. */
export function profileSync<T>(
  parent: TraceParent | undefined,
  name: string,
  options: TraceScopeOptions,
  fn: (scope: TraceScope | undefined) => T,
): T {
  const scope = parent?.enter(name, options);
  try {
    return fn(scope);
  } finally {
    scope?.close();
  }
}

/** Runs and awaits a callback even when profiling is unavailable, tracing it when a parent is provided. */
export async function profileAsync<T>(
  parent: TraceParent | undefined,
  name: string,
  options: TraceScopeOptions,
  fn: (scope: TraceScope | undefined) => Promise<T>,
): Promise<T> {
  const scope = parent?.enter(name, options);
  try {
    return await fn(scope);
  } finally {
    scope?.close();
  }
}

/** Records low-overhead, explicitly instrumented wall-clock spans. */
export class TraceProfiler {
  readonly mainTrack: TraceTrack; // a special top-level track for overall build progress.

  private readonly startedAtUs: number;
  private readonly spans: RecordedSpan[] = [];
  private readonly spansById = new Map<number, RecordedSpan>();
  private readonly tracks: TraceTrack[] = [];
  private nextSpanId = 1;
  private nextTrackId = 1;

  constructor(
    private readonly nowUs: TraceClock = () => performance.now() * 1000,
    private readonly processId: number = process.pid,
  ) {
    this.startedAtUs = nowUs();
    this.mainTrack = this.createTrack("Build overview");
  }

  createTrack(name: string, parent?: TraceScope): TraceTrack {
    const track = new TraceTrack(this, this.nextTrackId++, name, parent?.spanId);
    this.tracks.push(track);
    return track;
  }

  beginSpan(
    track: TraceTrack,
    name: string,
    options: TraceScopeOptions,
    parentId?: number,
  ): RecordedSpan {
    const args: Record<string, TraceArgument> = {};
    for (const [key, value] of Object.entries(options.args ?? {})) {
      if (value !== undefined) {
        args[key] = value;
      }
    }
    const span: RecordedSpan = {
      id: this.nextSpanId++,
      parentId,
      trackId: track.id,
      name,
      category: options.category ?? "build",
      startUs: this.elapsedUs(),
      args,
    };
    this.spans.push(span);
    this.spansById.set(span.id, span);
    return span;
  }

  endSpan(spanId: number): void {
    const span = this.spansById.get(spanId);
    if (!span) {
      throw new Error(`Unknown trace span ${spanId}`);
    }
    if (span.endUs !== undefined) {
      throw new Error(`Trace span ${spanId} was already closed`);
    }
    span.endUs = this.elapsedUs();
  }

  getSpanDurationMs(scope: TraceScope): number {
    const span = this.spansById.get(scope.spanId);
    if (!span) {
      return 0;
    }
    return ((span.endUs ?? this.elapsedUs()) - span.startUs) / 1000;
  }

  toChromeTrace(): ChromeTraceFile {
    const openTrack = this.tracks.find((track) => track.hasOpenScopes);
    if (openTrack) {
      throw new Error(`Cannot render trace while track '${openTrack.name}' has open scopes`);
    }

    const traceEvents: ChromeTraceEvent[] = [
      {
        name: "process_name",
        ph: "M",
        pid: this.processId,
        tid: 0,
        ts: 0,
        args: { name: "ticbuild" },
      },
      ...this.tracks.flatMap((track): ChromeTraceEvent[] => [
        {
          name: "thread_name",
          ph: "M",
          pid: this.processId,
          tid: track.id,
          ts: 0,
          args: { name: track.name },
        },
        {
          name: "thread_sort_index",
          ph: "M",
          pid: this.processId,
          tid: track.id,
          ts: 0,
          args: { sort_index: track.id },
        },
      ]),
    ];

    const completeEvents = this.spans
      .map((span): ChromeTraceEvent => {
        if (span.endUs === undefined) {
          throw new Error(`Cannot render open trace span '${span.name}'`);
        }
        return {
          name: span.name,
          cat: span.category,
          ph: "X",
          pid: this.processId,
          tid: span.trackId,
          ts: Math.max(0, Math.round(span.startUs)),
          dur: Math.max(0, Math.round(span.endUs - span.startUs)),
          args: {
            ...span.args,
            spanId: span.id,
            ...(span.parentId === undefined ? {} : { parentSpanId: span.parentId }),
          },
        };
      })
      .sort((a, b) => a.ts - b.ts || (b.dur ?? 0) - (a.dur ?? 0) || a.tid - b.tid);

    traceEvents.push(...completeEvents);
    return { traceEvents, displayTimeUnit: "ms" };
  }

  serialize(): string {
    return `${JSON.stringify(this.toChromeTrace(), null, 2)}\n`;
  }

  private elapsedUs(): number {
    return Math.max(0, this.nowUs() - this.startedAtUs);
  }
}
