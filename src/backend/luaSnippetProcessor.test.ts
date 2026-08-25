import { Manifest } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";
import {
  getLuaSnippetProjectConfig,
  processLuaSnippet,
} from "./luaSnippetProcessor";
import { luaOptimizationRules } from "../utils/lua/lua_optimizer_rules";

function makeCore(): TicbuildProjectCore {
  const manifest: Manifest = {
    buildConfiguration: "release",
    project: {
      name: "optimizer-test",
      binDir: "./bin",
      objDir: "./obj",
      outputCartName: "test.tic",
    },
    preprocessor: {
      defines: {
        FEATURE: true,
      },
    },
    imports: [],
    assembly: {
      lua: {
        minify: true,
      },
      blocks: [],
    },
  };
  return new TicbuildProjectCore({
    manifest,
    manifestPath: "C:/test/project.ticbuild.jsonc",
    projectDir: "C:/test",
  });
}

describe("Lua snippet processor", () => {
  it("describes the selected project and every registered optimization rule", () => {
    const config = getLuaSnippetProjectConfig(makeCore());

    expect(config.projectName).toBe("optimizer-test");
    expect(config.buildConfig).toBe("release");
    expect(config.settings.minifyEnabled).toBe(true);
    expect(config.presets.release.globalSymbolRenaming).toBe("opt-in");
    expect(config.presets.max.globalSymbolRenaming).toBe("opt-out");
    expect(config.ruleStates.map((rule) => rule.id)).toEqual(luaOptimizationRules.map((rule) => rule.id));
  });

  it("runs preprocessing and minification with GUI-provided settings", async () => {
    const core = makeCore();
    const config = getLuaSnippetProjectConfig(core);
    const source = [
      "--#ifdef FEATURE",
      "-- removed comment",
      "local descriptiveName = 1",
      "--#endif",
      "return descriptiveName",
    ].join("\n");

    const result = await processLuaSnippet(source, core, {
      minifyEnabled: true,
      minificationOverrides: config.presets.release,
    });

    expect(result.preprocessedSource).toContain("local descriptiveName = 1");
    expect(result.preprocessedSource).not.toContain("#ifdef");
    expect(result.minifiedSource).not.toContain("removed comment");
    expect(result.minifiedSource).not.toContain("descriptiveName");
    expect(result.sizes.minifiedBytes).toBeLessThan(result.sizes.preprocessedBytes);
    expect(result.dependencies).toEqual(["C:\\test\\__lua_optimizer_playground__.lua"]);
    expect(result.ruleStates).toHaveLength(luaOptimizationRules.length);
  });

  it("can disable minification without mutating the loaded project", async () => {
    const core = makeCore();
    const source = "-- keep me\nreturn 1\n";

    const result = await processLuaSnippet(source, core, {
      minifyEnabled: false,
      minificationOverrides: {},
    });

    expect(result.minifiedSource).toBe(result.preprocessedSource);
    expect(result.minifiedSource).toContain("-- keep me");
    expect(core.manifest.assembly.lua?.minify).toBe(true);
  });

  it("surfaces parser diagnostics in strict mode", async () => {
    const core = makeCore();
    const config = getLuaSnippetProjectConfig(core);

    await expect(processLuaSnippet("return (", core, config.settings)).rejects.toMatchObject({
      name: "SyntaxError",
      line: 1,
    });
  });
});
