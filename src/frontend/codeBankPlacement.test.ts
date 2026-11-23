import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { buildCore } from "./core";

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function createTempProject(code: string, assemblyBlock: object): { dir: string; manifestPath: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-codewarn-"));
  const codePath = path.join(dir, "main.lua");
  writeFile(codePath, code);

  const manifest = {
    buildConfiguration: "release",
    project: {
      name: "test",
      binDir: "./bin",
      objDir: "./obj",
      outputCartName: "out.tic",
    },
    imports: [
      {
        name: "maincode",
        path: "main.lua",
        kind: "LuaCode",
      },
    ],
    assembly: {
      lua: {
        minify: false,
      },
      blocks: [assemblyBlock],
    },
  };

  const manifestPath = path.join(dir, "project.ticbuild.jsonc");
  writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return { dir, manifestPath };
}

describe("Code chunk placement", () => {
  it("rejects explicit nonzero CODE bank placement", async () => {
    const { dir, manifestPath } = createTempProject("print('ok')", {
      chunks: ["CODE"],
      bank: 1,
      asset: "maincode",
    });

    try {
      await expect(buildCore(manifestPath)).rejects.toThrow("CODE can only be assigned to output bank 0");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
