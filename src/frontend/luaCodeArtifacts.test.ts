import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { buildCore } from "./core";

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function createTempProject(code: string, assemblyBlock: object): { dir: string; manifestPath: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-lua-artifacts-"));
  const codePath = path.join(dir, "main.lua");
  writeFile(codePath, code);

  const manifest = {
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

describe("Lua code build artifacts", () => {
  it("does not write compressed diagnostics when CODE_COMPRESSED is not assembled", async () => {
    const { dir, manifestPath } = createTempProject("print('ok')", {
      chunks: ["CODE"],
      asset: "maincode",
    });

    try {
      await buildCore(manifestPath);

      expect(fs.existsSync(path.join(dir, "obj", "maincode.01.preprocessed.lua"))).toBe(true);
      expect(fs.existsSync(path.join(dir, "obj", "maincode.02.minified.lua"))).toBe(true);
      expect(fs.existsSync(path.join(dir, "obj", "maincode.03.compressed.bin"))).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("writes compressed diagnostics when CODE_COMPRESSED is assembled", async () => {
    const { dir, manifestPath } = createTempProject("print('ok')", {
      chunks: ["CODE_COMPRESSED"],
      asset: "maincode",
    });

    try {
      await buildCore(manifestPath);

      expect(fs.existsSync(path.join(dir, "obj", "maincode.03.compressed.bin"))).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
