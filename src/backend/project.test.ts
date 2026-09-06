import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { preprocessLuaCode } from "./luaPreprocessor";
import { Manifest } from "./manifestTypes";
import { TicbuildProject } from "./project";
import { renderTypeScriptBuildConstants } from "./importers/TypeScriptBuildConstants";

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

  it("keeps project variables separate from the effective process environment", () => {
    const manifest = makeManifest();
    manifest.variables = {
      PROJECT_VALUE: "manifest",
      ENV_REFERENCE: "$(env:ENV_VALUE)",
    };
    const manifestPath = writeManifest(manifest);
    fs.writeFileSync(path.join(tempDir, ".env"), "ENV_VALUE=env\nLOCAL_VALUE=env\n", "utf-8");
    fs.writeFileSync(path.join(tempDir, ".env.local"), "LOCAL_VALUE=local\n", "utf-8");

    const project = TicbuildProject.loadFromManifest({
      manifestPath,
      ambientEnvironment: {
        ENV_VALUE: "process",
        AMBIENT_ONLY: "ambient",
      },
      overrideVariables: { PROJECT_VALUE: "cli" },
    });

    expect(project.resolvedCore.substituteVariables("$(PROJECT_VALUE)")).toBe("cli");
    expect(project.resolvedCore.substituteVariables("$(env:ENV_VALUE)")).toBe("process");
    expect(project.resolvedCore.substituteVariables("$(env:LOCAL_VALUE)")).toBe("local");
    expect(project.resolvedCore.substituteVariables("$(env:AMBIENT_ONLY)")).toBe("ambient");
    expect(project.resolvedCore.allVariables.get("ENV_REFERENCE")?.resolvedValue).toBe("process");
    expect(project.resolvedCore.allVariables.has("ENV_VALUE")).toBe(false);
    expect(project.resolvedCore.allVariables.has("LOCAL_VALUE")).toBe(false);
    expect(project.resolvedCore.allVariables.has("AMBIENT_ONLY")).toBe(false);
    expect(project.resolvedCore.processEnvironment.AMBIENT_ONLY).toBe("ambient");

    const declarations = renderTypeScriptBuildConstants(project.resolvedCore);
    expect(declarations).toContain('readonly "PROJECT_VALUE": "cli";');
    expect(declarations).not.toContain('readonly "ENV_VALUE"');
    expect(declarations).not.toContain('readonly "LOCAL_VALUE"');
    expect(declarations).not.toContain('readonly "AMBIENT_ONLY"');

    expect(() => project.resolvedCore.substituteVariables("$(ENV_VALUE)")).toThrow(
      "Undefined variable: ENV_VALUE",
    );
    expect(() => project.resolvedCore.substituteVariables("$(env:MISSING)")).toThrow(
      "Undefined environment variable: MISSING",
    );
  });
});
