import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { ResourceManager } from "../ImportedResourceTypes";
import { loadAllImports } from "../importResources";
import { Manifest } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";
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
});
