import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const playgroundDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: playgroundDir,
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 5175,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4175,
    strictPort: true,
  },
  build: {
    outDir: path.resolve(playgroundDir, "../../obj/lz-compressor-playground"),
    emptyOutDir: true,
  },
});
