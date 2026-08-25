import {
  formatLuaMinifierBenchmark,
  runLuaMinifierBenchmark,
} from "./luaMinifiers";

describe("Lua minifier benchmark", () => {
  test("measures successful tools and reports unavailable tools", async () => {
    const source = 'local greeting = "hello"\nprint(greeting)\n';
    const report = await runLuaMinifierBenchmark(
      [{ id: "hello.lua", source }],
      [
        {
          id: "identity",
          label: "Identity",
          version: "1.0.0",
          available: true,
          minify: (input) => input,
        },
        {
          id: "compact",
          label: "Compact",
          version: "2.0.0",
          available: true,
          minify: () => 'local a="hello"print(a)',
        },
        {
          id: "optional",
          label: "Optional",
          available: false,
          reason: "not installed",
        },
      ],
    );

    expect(report.inputBytes).toBe(Buffer.byteLength(source));
    expect(report.fixtures).toHaveLength(1);
    expect(report.tools[0]).toMatchObject({
      available: true,
      outputBytes: Buffer.byteLength(source),
    });
    expect(report.tools[1].outputBytes).toBeLessThan(report.tools[0].outputBytes ?? 0);
    expect(report.tools[2]).toMatchObject({
      available: false,
      reason: "not installed",
    });

    const formatted = formatLuaMinifierBenchmark(report);
    expect(formatted).toContain("Lua minifier output-size benchmark (1 fixtures");
    expect(formatted).toContain("Compact 2.0.0");
    expect(formatted).toContain("best raw");
    expect(formatted).toContain("Optional: not installed");
  });

  test("keeps a tool error instead of ranking invalid output", async () => {
    const report = await runLuaMinifierBenchmark(
      [{ id: "valid.lua", source: "return 1\n" }],
      [
        {
          id: "broken",
          label: "Broken",
          version: "0.0.0",
          available: true,
          minify: () => "local =",
        },
      ],
    );

    expect(report.tools[0].outputBytes).toBeUndefined();
    expect(report.tools[0].fixtures[0].error).toContain("not valid Lua 5.3");
    expect(formatLuaMinifierBenchmark(report)).toContain("error (0/1)");
  });

  test("rejects invalid or duplicate fixtures before running tools", async () => {
    await expect(
      runLuaMinifierBenchmark([{ id: "invalid.lua", source: "return (" }], []),
    ).rejects.toThrow("Benchmark fixture invalid.lua is not valid Lua 5.3");

    await expect(
      runLuaMinifierBenchmark(
        [
          { id: "same.lua", source: "return 1" },
          { id: "same.lua", source: "return 2" },
        ],
        [],
      ),
    ).rejects.toThrow("Duplicate Lua benchmark fixture ID: same.lua");
  });
});
