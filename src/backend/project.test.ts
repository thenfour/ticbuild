import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { preprocessLuaCode } from "./luaPreprocessor";
import { Manifest } from "./manifestTypes";
import { TicbuildProject } from "./project";

describe("TicbuildProject build configuration resolution", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-project-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function makeManifest(): Manifest {
    return {
      buildConfiguration: "release",
      project: {
        name: "test",
        binDir: "./build/$(buildConfiguration)-bin",
        objDir: "./build/$(buildConfiguration)-obj",
        outputCartName: "test.tic",
      },
      preprocessor: {
        defines: {
          BUILD_NAME: "release",
          RELEASE: true,
          SHARED: 1,
        },
      },
      imports: [],
      assembly: {
        blocks: [],
      },
      buildConfigurations: {
        debug: {
          preprocessor: {
            defines: {
              BUILD_NAME: "debug",
              RELEASE: null,
              DEBUG: true,
            },
          },
        },
      },
    };
  }

  function writeManifest(manifest: Manifest = makeManifest()): string {
    const manifestPath = path.join(tempDir, "project.ticbuild.jsonc");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest), "utf-8");
    return manifestPath;
  }

  it("should use the named base configuration when mode is omitted", () => {
    const project = TicbuildProject.loadFromManifest({
      manifestPath: writeManifest(),
      overrideVariables: { buildConfiguration: "not-a-mode" },
    });

    expect(project.resolvedCore.selectedBuildConfig).toBe("release");
    expect(project.resolvedCore.substituteVariables("$(buildConfiguration)")).toBe("release");
    expect(project.resolvedCore.resolveObjPath()).toBe(path.join(tempDir, "build", "release-obj"));
    expect(project.resolvedCore.manifest.preprocessor?.defines).toEqual({
      BUILD_NAME: "release",
      RELEASE: true,
      SHARED: 1,
    });
  });

  it("should accept the base configuration name as an explicit mode", () => {
    const project = TicbuildProject.loadFromManifest({
      manifestPath: writeManifest(),
      buildConfigName: "release",
    });

    expect(project.resolvedCore.selectedBuildConfig).toBe("release");
    expect(project.resolvedCore.manifest.preprocessor?.defines?.RELEASE).toBe(true);
  });

  it("should apply a named alternative without mutating the base manifest", async () => {
    const project = TicbuildProject.loadFromManifest({
      manifestPath: writeManifest(),
      buildConfigName: "debug",
    });

    expect(project.resolvedCore.selectedBuildConfig).toBe("debug");
    expect(project.resolvedCore.substituteVariables("$(buildConfiguration)")).toBe("debug");
    expect(project.resolvedCore.resolveObjPath()).toBe(path.join(tempDir, "build", "debug-obj"));
    expect(project.resolvedCore.manifest.preprocessor?.defines).toEqual({
      BUILD_NAME: "debug",
      SHARED: 1,
      DEBUG: true,
    });
    expect(project.unresolvedCore.manifest.preprocessor?.defines).toEqual({
      BUILD_NAME: "release",
      RELEASE: true,
      SHARED: 1,
    });
    expect(project.unresolvedCore.manifest).not.toBe(project.resolvedCore.manifest);

    const result = await preprocessLuaCode(
      project.resolvedCore,
      `--#ifdef RELEASE
local releaseDefined = true
--#else
local releaseDefined = false
--#endif
--#ifdef DEBUG
local debugDefined = true
--#endif`,
      path.join(tempDir, "main.lua"),
    );

    expect(result.code).toContain("local releaseDefined = false");
    expect(result.code).toContain("local debugDefined = true");
    expect(result.code).not.toContain("local releaseDefined = true");
  });

  it("should reject an unknown mode", () => {
    expect(() =>
      TicbuildProject.loadFromManifest({
        manifestPath: writeManifest(),
        buildConfigName: "typo",
      }),
    ).toThrow("Build configuration not found: typo");
  });

  it("should reject an alternative with the base configuration name", () => {
    const manifest = makeManifest();
    manifest.buildConfigurations!.release = {};

    expect(() => TicbuildProject.loadFromManifest({ manifestPath: writeManifest(manifest) })).toThrow(
      "Base build configuration 'release' must not also appear in buildConfigurations",
    );
  });
});
