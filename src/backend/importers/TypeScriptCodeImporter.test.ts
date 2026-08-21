import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { loadAllImports } from "../importResources";
import { Manifest } from "../manifestTypes";
import { TicbuildProjectCore } from "../projectCore";

describe("TypeScriptCodeResource", () => {
  it("routes TypeScriptCode imports to the explicit transpilation seam", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-typescript-stub-"));
    fs.writeFileSync(path.join(projectDir, "main.ts"), "export function TIC(): void {}", "utf-8");
    const manifest: Manifest = {
      project: {
        name: "test",
        binDir: "./bin",
        objDir: "./obj",
        outputCartName: "test.tic",
      },
      imports: [{ name: "main", path: "main.ts", kind: "TypeScriptCode" }],
      assembly: { blocks: [{ asset: "main" }] },
    };
    const project = new TicbuildProjectCore({
      manifest,
      manifestPath: path.join(projectDir, "manifest.ticbuild.jsonc"),
      projectDir,
    });

    try {
      await expect(loadAllImports(project)).rejects.toThrow();
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });
});
