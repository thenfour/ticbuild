import { ChromeTraceEvent, profileAsync, profileSync, TraceProfiler } from "./traceProfiler";

function completeEvents(profiler: TraceProfiler): ChromeTraceEvent[] {
  return profiler.toChromeTrace().traceEvents.filter((event) => event.ph === "X");
}

describe("TraceProfiler", () => {
  it("records nested scopes with microsecond timing and structured arguments", () => {
    let nowUs = 10_000;
    const profiler = new TraceProfiler(() => nowUs, 77);

    {
      using build = profiler.mainTrack.enter("ticbuild build", {
        category: "build",
        args: { configuration: "release", omitted: undefined },
      });
      nowUs += 250;
      {
        using minify = build.enter("Lua minification", { category: "code" });
        nowUs += 1_500;
        minify.setArgs({ rounds: 3 });
      }
      nowUs += 250;
    }

    expect(completeEvents(profiler)).toEqual([
      {
        name: "ticbuild build",
        cat: "build",
        ph: "X",
        pid: 77,
        tid: 1,
        ts: 0,
        dur: 2_000,
        args: { configuration: "release", spanId: 1 },
      },
      {
        name: "Lua minification",
        cat: "code",
        ph: "X",
        pid: 77,
        tid: 1,
        ts: 250,
        dur: 1_500,
        args: { rounds: 3, spanId: 2, parentSpanId: 1 },
      },
    ]);
  });

  it("puts overlapping work on distinct named tracks while preserving its logical parent", () => {
    let nowUs = 0;
    const profiler = new TraceProfiler(() => nowUs, 88);

    {
      using build = profiler.mainTrack.enter("ticbuild build");
      const leftTrack = profiler.createTrack("Import: left", build);
      const rightTrack = profiler.createTrack("Import: right", build);
      const left = leftTrack.enter("Materialize import source", { args: { importName: "left" } });
      nowUs += 100;
      const right = rightTrack.enter("Materialize import source", { args: { importName: "right" } });
      nowUs += 200;
      left.close();
      nowUs += 100;
      right.close();
    }

    const trace = profiler.toChromeTrace();
    const events = trace.traceEvents.filter((event) => event.ph === "X");
    expect(events.map((event) => ({ name: event.name, tid: event.tid, args: event.args }))).toEqual([
      { name: "ticbuild build", tid: 1, args: { spanId: 1 } },
      {
        name: "Materialize import source",
        tid: 2,
        args: { importName: "left", spanId: 2, parentSpanId: 1 },
      },
      {
        name: "Materialize import source",
        tid: 3,
        args: { importName: "right", spanId: 3, parentSpanId: 1 },
      },
    ]);
    expect(trace.traceEvents).toContainEqual(expect.objectContaining({
      name: "thread_name",
      tid: 2,
      args: { name: "Import: left" },
    }));
  });

  it("closes using scopes when their body throws", () => {
    let nowUs = 0;
    const profiler = new TraceProfiler(() => nowUs);

    expect(() => {
      using _scope = profiler.mainTrack.enter("failing work");
      nowUs = 500;
      throw new Error("boom");
    }).toThrow("boom");

    expect(completeEvents(profiler)[0]).toMatchObject({
      name: "failing work",
      dur: 500,
    });
  });

  it("returns values from profiled sync and async callbacks", async () => {
    let nowUs = 0;
    const profiler = new TraceProfiler(() => nowUs);

    const syncResult = profiler.mainTrack.profileSync("sync work", {}, (scope) => {
      nowUs += 200;
      scope.setArgs({ resultType: "string" });
      return "done";
    });
    const asyncResult = await profiler.mainTrack.profileAsync("async work", {}, async () => {
      nowUs += 300;
      return 42;
    });

    expect(syncResult).toBe("done");
    expect(asyncResult).toBe(42);
    expect(completeEvents(profiler)).toEqual([
      expect.objectContaining({ name: "sync work", dur: 200, args: expect.objectContaining({ resultType: "string" }) }),
      expect.objectContaining({ name: "async work", dur: 300 }),
    ]);
  });

  it("runs optional profiling callbacks without a trace parent", async () => {
    const syncResult = profileSync(undefined, "sync work", {}, (scope) => {
      expect(scope).toBeUndefined();
      return "sync";
    });
    const asyncResult = await profileAsync(undefined, "async work", {}, async (scope) => {
      expect(scope).toBeUndefined();
      return "async";
    });

    expect(syncResult).toBe("sync");
    expect(asyncResult).toBe("async");
  });

  it("closes profiled callback scopes when callbacks fail", async () => {
    const profiler = new TraceProfiler(() => 0);

    expect(() => profiler.mainTrack.profileSync("sync failure", {}, () => {
      throw new Error("sync boom");
    })).toThrow("sync boom");
    await expect(profiler.mainTrack.profileAsync("async failure", {}, async () => {
      throw new Error("async boom");
    })).rejects.toThrow("async boom");

    expect(() => profiler.toChromeTrace()).not.toThrow();
  });

  it("rejects rendering while a scope remains open", () => {
    const profiler = new TraceProfiler(() => 0);
    const scope = profiler.mainTrack.enter("open work");

    expect(() => profiler.toChromeTrace()).toThrow("has open scopes");
    scope.close();
  });
});
