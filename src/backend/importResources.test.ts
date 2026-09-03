import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { loadAllImports } from "./importResources";
import { CodeResource } from "./importers/CodeResource";
import { Manifest } from "./manifestTypes";
import { TicbuildProjectCore } from "./projectCore";

describe("reachable import processing", () => {
  it("preprocesses assembly roots while only generating included code resources", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-reachable-imports-"));
    fs.writeFileSync(path.join(projectDir, "main.lua"), '--#include "import:helper"\nprint(helperValue)\n', "utf-8");
    fs.writeFileSync(path.join(projectDir, "helper.lua"), "helperValue = 42\n", "utf-8");
    fs.writeFileSync(path.join(projectDir, "unused.lua"), "this is not valid Lua @", "utf-8");
    const manifest: Manifest = {
      buildConfiguration: "release",
      project: {
        name: "reachable-imports",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      imports: [
        { name: "main", kind: "LuaCode", path: "main.lua" },
        { name: "helper", kind: "LuaCode", path: "helper.lua" },
        { name: "unused", kind: "LuaCode", path: "unused.lua" },
      ],
      assembly: { blocks: [{ asset: "main" }] },
    };
    const project = new TicbuildProjectCore({
      manifest,
      manifestPath: path.join(projectDir, "project.ticbuild.jsonc"),
      projectDir,
    });

    try {
      const resources = await loadAllImports(project);
      const main = resources.items.get("main");
      const helper = resources.items.get("helper");

      expect(main).toBeInstanceOf(CodeResource);
      expect(helper).toBeInstanceOf(CodeResource);
      expect((main as CodeResource).hasCompletedCodePipeline()).toBe(true);
      expect((helper as CodeResource).hasGeneratedLuaSource()).toBe(true);
      expect((helper as CodeResource).hasCompletedCodePipeline()).toBe(false);
      expect((main as CodeResource).getPreprocessResult().code).toContain("helperValue = 42");
      expect(resources.items.has("unused")).toBe(false);
      expect(resources.isImportUsed("unused")).toBe(false);
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });
});
