import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as cons from "../../utils/console";
import { ResourceManager } from "../ImportedResourceTypes";
import { loadAllImports } from "../importResources";
import { Manifest } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
import { mapPreprocessedOffsetToLineColumn } from "../sourceMap";
import { LuaCodeResource } from "./LuaCodeImporter";
import { TypeScriptCodeResource } from "./TypeScriptCodeImporter";

function createProject(projectDir: string, imports: Manifest["imports"], defines?: Record<string, boolean>) {
  const manifest: Manifest = {
    project: {
      name: "typescript-test",
      binDir: "./bin",
      objDir: "./obj",
      outputCartName: "test.tic",
    },
    preprocessor: defines ? { defines } : undefined,
    variables: { "project.name": "typescript-test" },
    imports,
    assembly: { blocks: [{ asset: imports[0].name }] },
  };
  return new TicbuildProjectCore({
    manifest,
    manifestPath: path.join(projectDir, "manifest.ticbuild.jsonc"),
    projectDir,
  });
}

function getTypeScriptResource(resources: ResourceManager, name: string): TypeScriptCodeResource {
  const resource = resources.items.get(name);
  expect(resource).toBeInstanceOf(TypeScriptCodeResource);
  return resource as TypeScriptCodeResource;
}

describe("TypeScriptCodeResource", () => {
  it("bundles imported TypeScript, preserves preprocessing, and exposes TIC callbacks", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-"));
    const mainPath = path.join(projectDir, "main.ts");
    const helperPath = path.join(projectDir, "helper.ts");
    fs.writeFileSync(
      helperPath,
      [
        "export const helper = {",
        '  suffix: " helper",',
        "  getSuffix() { return this.suffix; },",
        "};",
      ].join("\n"),
      "utf-8",
    );
    fs.writeFileSync(
      mainPath,
      [
        'import { helper } from "./helper";',
        "const TIC = () => {",
        "  //#ifdef FEATURE",
        '  print(__EXPAND("$(project.name)") + helper.getSuffix());',
        "  //#else",
        '  print("disabled");',
        "  //#endif",
        "};",
      ].join("\n"),
      "utf-8",
    );
    const project = createProject(
      projectDir,
      [{ name: "main", path: "main.ts", kind: "TypeScriptCode" }],
      { FEATURE: true },
    );

    try {
      const resources = await loadAllImports(project);
      const resource = getTypeScriptResource(resources, "main");
      const artifacts = resource.getCodeArtifacts(project);

      expect(artifacts.inputSource).toContain('["helper"] = function');
      expect(artifacts.inputSource).toContain("helper:getSuffix()");
      expect(artifacts.preprocessedSource).toContain('"typescript-test"');
      expect(artifacts.preprocessedSource).not.toContain('"disabled"');
      expect(artifacts.preprocessedSource).toContain('_G["TIC"] = TIC');
      expect(artifacts.preprocessedSource).not.toContain("return ____entry");
      const helperLocation = mapPreprocessedOffsetToLineColumn(
        artifacts.preprocessedSourceMap,
        artifacts.preprocessedSource.indexOf('" helper"'),
        "right",
      );
      expect(helperLocation?.file).toBe(helperPath);
      expect(helperLocation?.line).toBe(2);

      const expandedLocation = mapPreprocessedOffsetToLineColumn(
        artifacts.preprocessedSourceMap,
        artifacts.preprocessedSource.indexOf('"typescript-test"'),
        "right",
      );
      expect(expandedLocation?.file).toBe(mainPath);
      expect(expandedLocation?.line).toBe(4);
      expect(resource.getDependencyList()).toEqual(
        expect.arrayContaining([
          { path: mainPath, reason: "Imported TypeScript code file" },
          { path: helperPath, reason: "TypeScript compiler dependency" },
        ]),
      );
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("resolves relative Lua includes from the TypeScript module that authored the directive", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-relative-include-"));
    const featureDir = path.join(projectDir, "feature");
    fs.mkdirSync(featureDir);
    const mainPath = path.join(projectDir, "main.ts");
    const helperPath = path.join(featureDir, "helper.ts");
    const localLuaPath = path.join(featureDir, "local.lua");
    fs.writeFileSync(
      mainPath,
      ['import "./feature/helper";', "export function TIC(): void { cls(0); }"].join("\n"),
      "utf-8",
    );
    fs.writeFileSync(
      helperPath,
      ['//--#include "./local.lua"', 'export const helper = "loaded";'].join("\n"),
      "utf-8",
    );
    fs.writeFileSync(localLuaPath, 'trace("nested Lua include")\n', "utf-8");
    const project = createProject(projectDir, [
      { name: "main", path: "main.ts", kind: "TypeScriptCode" },
    ]);

    try {
      const resources = await loadAllImports(project);
      const artifacts = getTypeScriptResource(resources, "main").getCodeArtifacts(project);
      const includedOffset = artifacts.preprocessedSource.indexOf('trace("nested Lua include")');
      expect(includedOffset).toBeGreaterThanOrEqual(0);
      const includedLocation = mapPreprocessedOffsetToLineColumn(
        artifacts.preprocessedSourceMap,
        includedOffset,
        "right",
      );
      expect(includedLocation).toMatchObject({ file: localLuaPath, line: 1, column: 0 });
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("distinguishes source files with the same basename", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-duplicate-basename-"));
    const leftDir = path.join(projectDir, "left");
    const rightDir = path.join(projectDir, "right");
    fs.mkdirSync(leftDir);
    fs.mkdirSync(rightDir);
    const mainPath = path.join(projectDir, "main.ts");
    const leftPath = path.join(leftDir, "shared.ts");
    const rightPath = path.join(rightDir, "shared.ts");
    fs.writeFileSync(leftPath, 'export const left = "left source";\n', "utf-8");
    fs.writeFileSync(rightPath, 'export const right = "right source";\n', "utf-8");
    fs.writeFileSync(
      mainPath,
      [
        'import { left } from "./left/shared";',
        'import { right } from "./right/shared";',
        "export function TIC(): void { print(left + right); }",
      ].join("\n"),
      "utf-8",
    );
    const project = createProject(projectDir, [
      { name: "main", path: "main.ts", kind: "TypeScriptCode" },
    ]);

    try {
      const resources = await loadAllImports(project);
      const artifacts = getTypeScriptResource(resources, "main").getCodeArtifacts(project);
      const leftLocation = mapPreprocessedOffsetToLineColumn(
        artifacts.preprocessedSourceMap,
        artifacts.preprocessedSource.indexOf('"left source"'),
        "right",
      );
      const rightLocation = mapPreprocessedOffsetToLineColumn(
        artifacts.preprocessedSourceMap,
        artifacts.preprocessedSource.indexOf('"right source"'),
        "right",
      );
      expect(leftLocation?.file).toBe(leftPath);
      expect(rightLocation?.file).toBe(rightPath);
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("exposes an exported TIC callback without leaking its internal marker", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-exported-tic-"));
    fs.writeFileSync(
      path.join(projectDir, "main.ts"),
      "export function TIC(): void { cls(0); }\n",
      "utf-8",
    );
    const project = createProject(projectDir, [
      { name: "main", path: "main.ts", kind: "TypeScriptCode" },
    ]);

    try {
      const resources = await loadAllImports(project);
      const resource = getTypeScriptResource(resources, "main");
      const artifacts = resource.getCodeArtifacts(project);

      expect(artifacts.inputSource).toContain('_G["TIC"] = ____exports.TIC');
      expect(artifacts.inputSource).toContain('_G["TIC"] = ____entry["TIC"]');
      expect(artifacts.inputSource).not.toContain("__TICBUILD_EXPORT_GLOBAL__");
      expect(artifacts.preprocessedSource).not.toContain("__TICBUILD_EXPORT_GLOBAL__");
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("lets generated TypeScript Lua include a Lua code asset", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-lua-include-"));
    fs.writeFileSync(
      path.join(projectDir, "main.ts"),
      [
        "declare const fromLua: string;",
        '//--#include "import:luaHelper"',
        "const TIC = () => print(fromLua);",
      ].join("\n"),
      "utf-8",
    );
    fs.writeFileSync(path.join(projectDir, "helper.lua"), 'local fromLua = "included"\n', "utf-8");
    const project = createProject(projectDir, [
      { name: "main", path: "main.ts", kind: "TypeScriptCode" },
      { name: "luaHelper", path: "helper.lua", kind: "LuaCode" },
    ]);

    try {
      const resources = await loadAllImports(project);
      const resource = getTypeScriptResource(resources, "main");
      expect(resource.getPreprocessResult().code).toContain('local fromLua = "included"');
      expect(resource.getDependencyList().map((dependency) => dependency.path)).toContain(
        path.join(projectDir, "helper.lua"),
      );
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("rejects directives that include a space between // and #", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-lua-include-"));
    fs.writeFileSync(
      path.join(projectDir, "main.ts"),
      [
        "declare const fromLua: string;",
        '// #include "import:luaHelper"',
        "const TIC = () => print(fromLua);",
      ].join("\n"),
      "utf-8",
    );
    fs.writeFileSync(path.join(projectDir, "helper.lua"), 'local fromLua = "included"\n', "utf-8");
    const project = createProject(projectDir, [
      { name: "main", path: "main.ts", kind: "TypeScriptCode" },
      { name: "luaHelper", path: "helper.lua", kind: "LuaCode" },
    ]);

    try {
      const resources = await loadAllImports(project);
      const resource = getTypeScriptResource(resources, "main");
      expect(resource.getPreprocessResult().code).not.toContain('local fromLua = "included"');
      expect(resource.getDependencyList().map((dependency) => dependency.path)).not.toContain(
        path.join(projectDir, "helper.lua"),
      );
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("lets Lua include a transpiled TypeScript asset and continue afterward", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-lua-typescript-include-"));
    fs.writeFileSync(
      path.join(projectDir, "main.lua"),
      ['--#include "import:typed"', 'print("after TypeScript")'].join("\n"),
      "utf-8",
    );
    fs.writeFileSync(
      path.join(projectDir, "typed.ts"),
      "export function typescriptTick() { return 1; }\n",
      "utf-8",
    );
    const project = createProject(projectDir, [
      { name: "main", path: "main.lua", kind: "LuaCode" },
      { name: "typed", path: "typed.ts", kind: "TypeScriptCode" },
    ]);

    try {
      const resources = await loadAllImports(project);
      const resource = resources.items.get("main");
      expect(resource).toBeInstanceOf(LuaCodeResource);
      const artifacts = (resource as LuaCodeResource).getCodeArtifacts(project);
      expect(artifacts.preprocessedSource).toContain(
        '_G["typescriptTick"] = ____entry["typescriptTick"]',
      );
      expect(artifacts.preprocessedSource).toContain("function ____exports.typescriptTick()");
      expect(artifacts.preprocessedSource).toContain('print("after TypeScript")');
      expect(artifacts.preprocessedSource).not.toContain("return ____entry");
      expect(artifacts.minifiedSource.length).toBeGreaterThan(0);
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("reports TypeScript diagnostics with their source location", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-error-"));
    fs.writeFileSync(
      path.join(projectDir, "main.ts"),
      ['const value: number = "wrong";', "const TIC = () => print(value);"].join("\n"),
      "utf-8",
    );
    const project = createProject(projectDir, [
      { name: "main", path: "main.ts", kind: "TypeScriptCode" },
    ]);

    try {
      await expect(loadAllImports(project)).rejects.toThrow(
        /TypeScript transpilation failed:[\s\S]*main\.ts:1:7[\s\S]*not assignable to type 'number'/,
      );
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("loads extended tsconfig paths and ambient declarations as watched dependencies", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-config-"));
    const sourceDir = path.join(projectDir, "src");
    const helperDir = path.join(sourceDir, "helpers");
    fs.mkdirSync(helperDir, { recursive: true });
    const entryPath = path.join(sourceDir, "main.ts");
    const helperPath = path.join(helperDir, "helper.ts");
    const declarationsPath = path.join(sourceDir, "globals.d.ts");
    const baseConfigPath = path.join(projectDir, "tsconfig.base.json");
    const configPath = path.join(projectDir, "tsconfig.json");
    fs.writeFileSync(
      baseConfigPath,
      JSON.stringify({
        compilerOptions: {
          baseUrl: ".",
          paths: { "@helpers/*": ["src/helpers/*"] },
          strict: true,
          types: [],
        },
      }),
      "utf-8",
    );
    fs.writeFileSync(
      configPath,
      JSON.stringify({ extends: "./tsconfig.base.json", include: ["src/**/*.d.ts"] }),
      "utf-8",
    );
    fs.writeFileSync(declarationsPath, "declare const PROJECT_LABEL: string;\n", "utf-8");
    fs.writeFileSync(helperPath, 'export const helper = "configured";\n', "utf-8");
    fs.writeFileSync(
      entryPath,
      [
        'import { helper } from "@helpers/helper";',
        "export function configuredTick() { print(PROJECT_LABEL + helper); }",
      ].join("\n"),
      "utf-8",
    );
    const project = createProject(projectDir, [
      {
        name: "main",
        path: "src/main.ts",
        kind: "TypeScriptCode",
        typescript: { tsconfig: "tsconfig.json" },
      },
    ]);

    try {
      const resources = await loadAllImports(project);
      const resource = getTypeScriptResource(resources, "main");
      const preprocessedSource = resource.getCodeArtifacts(project).preprocessedSource;
      expect(preprocessedSource).toContain('_G["configuredTick"] = ____entry["configuredTick"]');
      expect(preprocessedSource).toContain('helper = "configured"');
      expect(resource.getDependencyList()).toEqual(
        expect.arrayContaining([
          { path: entryPath, reason: "Imported TypeScript code file" },
          { path: helperPath, reason: "TypeScript compiler dependency" },
          { path: declarationsPath, reason: "TypeScript compiler dependency" },
          { path: configPath, reason: "TypeScript project configuration" },
          { path: baseConfigPath, reason: "TypeScript project configuration" },
        ]),
      );
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("ignores tsconfig emission settings owned by ticbuild", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-config-owned-"));
    fs.writeFileSync(
      path.join(projectDir, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES5",
          noEmit: true,
          declaration: true,
          outDir: "dist",
          types: [],
        },
        tstl: {
          luaTarget: "5.1",
          noHeader: false,
        },
      }),
      "utf-8",
    );
    fs.writeFileSync(path.join(projectDir, "main.ts"), "export function tick() {}\n", "utf-8");
    const project = createProject(projectDir, [
      {
        name: "main",
        path: "main.ts",
        kind: "TypeScriptCode",
        typescript: { tsconfig: "tsconfig.json" },
      },
    ]);
    const warningSpy = jest.spyOn(cons, "warning").mockImplementation(() => undefined);

    try {
      const resources = await loadAllImports(project);
      const source = getTypeScriptResource(resources, "main").getCodeArtifacts(project).inputSource;
      expect(source).toContain('_G["tick"] = ____entry["tick"]');
      expect(source).not.toContain("TypeScriptToLua");
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining("compilerOptions.noEmit"));
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining("tstl.luaTarget"));
    } finally {
      warningSpy.mockRestore();
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("reports malformed tsconfig diagnostics with their source location", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-config-error-"));
    fs.writeFileSync(path.join(projectDir, "tsconfig.json"), '{ "compilerOptions": { "strict": tru } }', "utf-8");
    fs.writeFileSync(path.join(projectDir, "main.ts"), "export function tick() {}\n", "utf-8");
    const project = createProject(projectDir, [
      {
        name: "main",
        path: "main.ts",
        kind: "TypeScriptCode",
        typescript: { tsconfig: "tsconfig.json" },
      },
    ]);

    try {
      await expect(loadAllImports(project)).rejects.toThrow(
        /TypeScript configuration failed:[\s\S]*tsconfig\.json:1:/,
      );
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("rejects tsconfig project references before transpilation", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-config-reference-"));
    fs.writeFileSync(
      path.join(projectDir, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { types: [] }, references: [{ path: "./library" }] }),
      "utf-8",
    );
    fs.writeFileSync(path.join(projectDir, "main.ts"), "export function tick() {}\n", "utf-8");
    const project = createProject(projectDir, [
      {
        name: "main",
        path: "main.ts",
        kind: "TypeScriptCode",
        typescript: { tsconfig: "tsconfig.json" },
      },
    ]);

    try {
      await expect(loadAllImports(project)).rejects.toThrow("TypeScript project references are not supported yet");
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it("rejects TypeScriptToLua plugins before they can execute", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-config-plugin-"));
    fs.writeFileSync(
      path.join(projectDir, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { types: [] }, tstl: { luaPlugins: [{ name: "not-installed" }] } }),
      "utf-8",
    );
    fs.writeFileSync(path.join(projectDir, "main.ts"), "export function tick() {}\n", "utf-8");
    const project = createProject(projectDir, [
      {
        name: "main",
        path: "main.ts",
        kind: "TypeScriptCode",
        typescript: { tsconfig: "tsconfig.json" },
      },
    ]);

    try {
      await expect(loadAllImports(project)).rejects.toThrow("TypeScriptToLua plugins are not supported yet");
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });
});
