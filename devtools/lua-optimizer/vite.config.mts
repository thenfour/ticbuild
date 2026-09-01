import type { IncomingMessage, ServerResponse } from "node:http";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { TicbuildProject } from "../../src/backend/project";
import {
  getCodeSnippetProjectConfig,
  processCodeSnippet,
  type CodeSnippetLanguage,
  type CodeSnippetSettings,
} from "../../src/backend/codeSnippetProcessor";
import type { TicbuildProjectCore } from "../../src/backend/projectCore";

const playgroundDir = path.dirname(fileURLToPath(import.meta.url));
const MAX_REQUEST_BYTES = 2 * 1024 * 1024;

type NextFunction = (error?: unknown) => void;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > MAX_REQUEST_BYTES) {
      throw new Error(`Request body exceeds ${MAX_REQUEST_BYTES} bytes`);
    }
    chunks.push(buffer);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text.length === 0 ? {} : JSON.parse(text);
}

function writeJson(response: ServerResponse, status: number, value: unknown): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(value));
}

function errorPayload(error: unknown): Record<string, unknown> {
  if (!isRecord(error)) {
    return { name: "Error", message: String(error) };
  }
  return {
    name: typeof error.name === "string" ? error.name : "Error",
    message: typeof error.message === "string" ? error.message : String(error),
    ...(typeof error.stage === "string" ? { stage: error.stage } : {}),
    ...(typeof error.index === "number" ? { index: error.index } : {}),
    ...(typeof error.line === "number" ? { line: error.line } : {}),
    ...(typeof error.column === "number" ? { column: error.column } : {}),
  };
}

type ProcessRequest = {
  language: CodeSnippetLanguage;
  source: string;
  typeScriptProfileId?: string;
  settings: CodeSnippetSettings;
};

function parseProcessRequest(value: unknown): ProcessRequest {
  if (!isRecord(value) || typeof value.source !== "string") {
    throw new Error("Expected a JSON object with a string source field");
  }
  const language = value.language ?? "lua";
  if (language !== "lua" && language !== "typescript") {
    throw new Error("Expected language to be 'lua' or 'typescript'");
  }
  if (value.typeScriptProfileId !== undefined && typeof value.typeScriptProfileId !== "string") {
    throw new Error("Expected typeScriptProfileId to be a string when provided");
  }
  if (!isRecord(value.settings) || typeof value.settings.minifyEnabled !== "boolean") {
    throw new Error("Expected settings.minifyEnabled to be a boolean");
  }
  if (!isRecord(value.settings.minificationOverrides)) {
    throw new Error("Expected settings.minificationOverrides to be an object");
  }
  return {
    language,
    source: value.source,
    typeScriptProfileId: value.typeScriptProfileId,
    settings: {
      minifyEnabled: value.settings.minifyEnabled,
      minificationOverrides: value.settings.minificationOverrides,
    },
  } as ProcessRequest;
}

function codePipelineApiPlugin(): Plugin {
  let baseCore: TicbuildProjectCore | undefined;
  const getBaseCore = (): TicbuildProjectCore => {
    if (!baseCore) {
      baseCore = TicbuildProject.loadFromManifest({
        manifestPath: process.env.TICBUILD_PLAYGROUND_MANIFEST,
        buildConfigName: process.env.TICBUILD_PLAYGROUND_MODE,
      }).resolvedCore;
    }
    return baseCore;
  };

  const middleware = async (request: IncomingMessage, response: ServerResponse, next: NextFunction) => {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    if (
      (requestUrl.pathname === "/api/code-pipeline/config" || requestUrl.pathname === "/api/lua-optimizer/config")
      && request.method === "GET"
    ) {
      try {
        writeJson(response, 200, { config: getCodeSnippetProjectConfig(getBaseCore()) });
      } catch (error) {
        writeJson(response, 500, { error: errorPayload(error) });
      }
      return;
    }

    if (
      (requestUrl.pathname === "/api/code-pipeline/process" || requestUrl.pathname === "/api/lua-optimizer/process")
      && request.method === "POST"
    ) {
      try {
        const requestBody = parseProcessRequest(await readJsonBody(request));
        const started = performance.now();
        const result = await processCodeSnippet(
          {
            language: requestBody.language,
            source: requestBody.source,
            typeScriptProfileId: requestBody.typeScriptProfileId,
          },
          getBaseCore(),
          requestBody.settings,
          {
            parseFailure: "throw",
            typeScriptBuiltinsPath: path.resolve(playgroundDir, "../../tic80.d.ts"),
          },
        );
        writeJson(response, 200, { result, elapsedMs: performance.now() - started });
      } catch (error) {
        writeJson(response, 422, { error: errorPayload(error) });
      }
      return;
    }

    next();
  };

  return {
    name: "ticbuild-code-pipeline-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  root: playgroundDir,
  base: "./",
  plugins: [react(), codePipelineApiPlugin()],
  server: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true,
  },
  build: {
    outDir: path.resolve(playgroundDir, "../../obj/code-pipeline-playground"),
    emptyOutDir: true,
  },
});
