import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { getProjectEnvironmentPaths, loadProjectEnvironment } from "./projectEnvironment";

describe("project environment", () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-env-test-"));
  });

  afterEach(() => {
    fs.rmSync(projectDir, { recursive: true, force: true });
  });

  it("loads shared and local values without mutating the ambient environment", () => {
    fs.writeFileSync(path.join(projectDir, ".env"), "SHARED=from-env\nENV_ONLY=shared\n", "utf-8");
    fs.writeFileSync(
      path.join(projectDir, ".env.local"),
      "SHARED=from-local\nLOCAL_ONLY=local\n",
      "utf-8",
    );
    const ambientEnvironment: NodeJS.ProcessEnv = {
      SHARED: "from-process",
      AMBIENT_ONLY: "ambient",
    };

    const environment = loadProjectEnvironment(projectDir, ambientEnvironment);

    expect(environment.processEnvironment).toEqual({
      SHARED: "from-process",
      ENV_ONLY: "shared",
      LOCAL_ONLY: "local",
      AMBIENT_ONLY: "ambient",
    });
    expect(ambientEnvironment).toEqual({
      SHARED: "from-process",
      AMBIENT_ONLY: "ambient",
    });
  });

  it("includes ambient-only values in the effective process environment", () => {
    const environment = loadProjectEnvironment(projectDir, { AMBIENT_ONLY: "ambient" });

    expect(environment.processEnvironment.AMBIENT_ONLY).toBe("ambient");
  });

  it("applies explicit overrides after files and the ambient environment", () => {
    fs.writeFileSync(path.join(projectDir, ".env"), "SHARED=from-env\nENV_ONLY=shared\n", "utf-8");
    fs.writeFileSync(path.join(projectDir, ".env.local"), "SHARED=from-local\n", "utf-8");

    const environment = loadProjectEnvironment(
      projectDir,
      { SHARED: "from-process", AMBIENT_ONLY: "ambient" },
      { SHARED: "from-cli", CLI_ONLY: "cli", EMPTY: "" },
    );

    expect(environment.processEnvironment).toEqual({
      SHARED: "from-cli",
      ENV_ONLY: "shared",
      AMBIENT_ONLY: "ambient",
      CLI_ONLY: "cli",
      EMPTY: "",
    });
  });

  it("resolves both environment files relative to the project directory", () => {
    expect(getProjectEnvironmentPaths(projectDir)).toEqual([
      path.join(projectDir, ".env"),
      path.join(projectDir, ".env.local"),
    ]);
  });
});
