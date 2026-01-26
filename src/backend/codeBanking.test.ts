import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { TicbuildProject } from "./project";
import { kTic80CartChunkTypes } from "../utils/tic80/tic80";

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function createTempProject(code: string, assemblyBlock: object): { dir: string; manifestPath: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-codebank-"));
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

describe("Code chunk banking", () => {
  it("should split CODE across multiple banks when oversized", async () => {
    const maxChunkSize = kTic80CartChunkTypes.byKey.CODE.sizePerBank;
    const payloadLength = maxChunkSize + 10;
    const code = `local s = "${"a".repeat(payloadLength)}"`;

    const { dir, manifestPath } = createTempProject(code, {
      chunks: ["CODE"],
      asset: "maincode",
    });

    try {
      const project = TicbuildProject.loadFromManifest({ manifestPath });
      await project.loadImports();
      const output = await project.assembleOutput();

      const codeChunks = output.chunks.filter((chunk) => chunk.chunkType === "CODE");
      expect(codeChunks).toHaveLength(2);
      expect(codeChunks[0].bank).toBe(0);
      expect(codeChunks[1].bank).toBe(1);
      expect(codeChunks[0].data.length).toBe(maxChunkSize);

      const totalLength = new TextEncoder().encode(code).length;
      expect(codeChunks[1].data.length).toBe(totalLength - maxChunkSize);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
