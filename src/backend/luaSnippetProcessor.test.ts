import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { Manifest } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";
import {
  getLuaSnippetProjectConfig,
  processCodeSnippet,
  processLuaSnippet,
} from "./codeSnippetProcessor";
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

describe("Code snippet processor", () => {
  it("describes the selected project and every registered optimization rule", () => {
    const config = getLuaSnippetProjectConfig(makeCore());

    expect(config.projectName).toBe("optimizer-test");
    expect(config.buildConfig).toBe("release");
    expect(config.settings.minifyEnabled).toBe(true);
    expect(config.presets.release.globalSymbolRenaming).toBe("opt-in");
    expect(config.presets.max.globalSymbolRenaming).toBe("opt-out");
    expect(config.ruleStates.map((rule) => rule.id)).toEqual(luaOptimizationRules.map((rule) => rule.id));
    expect(config.typeScriptProfiles).toEqual([expect.objectContaining({
      id: "defaults",
      name: "Built-in defaults",
    })]);
    expect(config.defaultTypeScriptProfileId).toBe("defaults");
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

  it("transpiles TypeScript, preserves directives until preprocessing, and reports each Lua stage", async () => {
    const core = makeCore();
    const source = [
      'const ENABLED = ticbuild.IsDefined("FEATURE");',
      "export function TIC(): void {",
      "  trace(ENABLED);",
      "  //--#ifdef FEATURE",
      '  trace("enabled");',
      "  //--#else",
      '  trace("disabled");',
      "  //--#endif",
      "}",
    ].join("\n");

    const result = await processCodeSnippet(
      { language: "typescript", source, typeScriptProfileId: "defaults" },
      core,
      { minifyEnabled: false, minificationOverrides: {} },
    );

    expect(result.language).toBe("typescript");
    expect(result.generatedLuaSource).toContain("--#ifdef FEATURE");
    expect(result.generatedLuaSource).toContain("trace(true)");
    expect(result.generatedLuaSource).not.toContain("ticbuild");
    expect(result.generatedLuaSource).not.toContain("ENABLED");
    expect(result.generatedLuaSource).toContain('trace("disabled")');
    expect(result.preprocessedSource).toContain('trace("enabled")');
    expect(result.preprocessedSource).not.toContain('trace("disabled")');
    expect(result.preprocessedSource).not.toContain("#ifdef");
    expect(result.minifiedSource).toBe(result.preprocessedSource);
    expect(result.sizes.inputBytes).toBe(Buffer.byteLength(source));
    expect(result.sizes.generatedBytes).toBe(Buffer.byteLength(result.generatedLuaSource));
    expect(result.dependencies).toContain(result.sourcePath);
  });

  it("uses a manifest TypeScript import as the entry path and compiler profile", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-snippet-profile-"));
    const sourceDir = path.join(projectDir, "source");
    fs.mkdirSync(sourceDir);
    fs.writeFileSync(path.join(sourceDir, "main.ts"), "export function TIC(): void {}\n", "utf-8");
    fs.writeFileSync(path.join(sourceDir, "helper.ts"), 'export const helper = "from profile";\n', "utf-8");
    fs.writeFileSync(path.join(projectDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { strict: true } }), "utf-8");
    const manifest: Manifest = {
      buildConfiguration: "release",
      project: {
        name: "profile-test",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      imports: [{
        name: "main",
        path: "source/main.ts",
        kind: "TypeScriptCode",
        typescript: { tsconfig: "tsconfig.json" },
      }],
      assembly: { blocks: [] },
    };
    const core = new TicbuildProjectCore({
      manifest,
      manifestPath: path.join(projectDir, "project.ticbuild.jsonc"),
      projectDir,
    });

    try {
      const config = getLuaSnippetProjectConfig(core);
      expect(config.defaultTypeScriptProfileId).toBe("import:main");
      expect(config.typeScriptProfiles).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: "import:main",
          sourcePath: path.join(sourceDir, "main.ts"),
          tsconfigPath: path.join(projectDir, "tsconfig.json"),
        }),
      ]));

      const result = await processCodeSnippet(
        {
          language: "typescript",
          source: [
            'import { helper } from "./helper";',
            "export function TIC(): void { trace(helper); }",
          ].join("\n"),
          typeScriptProfileId: "import:main",
        },
        core,
        { minifyEnabled: false, minificationOverrides: {} },
      );

      expect(result.sourcePath).toBe(path.join(sourceDir, "main.ts"));
      expect(result.generatedLuaSource).toContain('helper = "from profile"');
      expect(result.generatedLuaSource).not.toContain("require(");
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("identifies TypeScript diagnostics as a transpilation-stage failure", async () => {
    const core = makeCore();

    await expect(processCodeSnippet(
      {
        language: "typescript",
        source: 'const value: number = "wrong";\n',
        typeScriptProfileId: "defaults",
      },
      core,
      { minifyEnabled: false, minificationOverrides: {} },
    )).rejects.toMatchObject({
      stage: "typescript",
      message: expect.stringContaining("not assignable to type 'number'"),
    });
  });
});
