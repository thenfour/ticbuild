import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { preprocessLuaCode } from "./luaPreprocessor";
import { TicbuildProject } from "./project";

describe("TicbuildProject build configuration resolution", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-project-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should remove inherited preprocessor defines overridden with null", async () => {
    const manifestPath = path.join(tempDir, "project.ticbuild.jsonc");
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        project: {
          name: "test",
          binDir: "./bin",
          objDir: "./obj",
          outputCartName: "test.tic",
        },
        preprocessor: {
          defines: {
            DEBUG: true,
            BUILD_NAME: "debug",
            SHARED: 1,
          },
        },
        imports: [],
        assembly: {
          blocks: [],
        },
        buildConfigurations: {
          release: {
            preprocessor: {
              defines: {
                DEBUG: null,
                BUILD_NAME: "release",
                RELEASE: true,
              },
            },
          },
        },
      }),
      "utf-8",
    );

    const project = TicbuildProject.loadFromManifest({
      manifestPath,
      buildConfigName: "release",
    });

    expect(project.resolvedCore.manifest.preprocessor?.defines).toEqual({
      BUILD_NAME: "release",
      SHARED: 1,
      RELEASE: true,
    });

    const result = await preprocessLuaCode(
      project.resolvedCore,
      `--#ifdef DEBUG
local debugDefined = true
--#else
local debugDefined = false
--#endif
--#ifndef DEBUG
local debugUndefined = true
--#endif
--#if defined(DEBUG)
local definedExpression = true
--#else
local definedExpression = false
--#endif`,
      path.join(tempDir, "main.lua"),
    );

    expect(result.code).toContain("local debugDefined = false");
    expect(result.code).toContain("local debugUndefined = true");
    expect(result.code).toContain("local definedExpression = false");
    expect(result.code).not.toContain("local debugDefined = true");
    expect(result.code).not.toContain("local definedExpression = true");
  });
});
