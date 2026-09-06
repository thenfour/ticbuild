import * as cons from "../utils/console";
import { parseBuildOptions } from "./parseOptions";

describe("parseBuildOptions", () => {
  it("parses project-variable and environment overrides into separate pools", () => {
    const options = parseBuildOptions("project.ticbuild.jsonc", {
      var: ["PROJECT_VALUE=manifest", "PROJECT_VALUE=cli"],
      env: ["BUILD_MODE=debug", "TOKEN=part=two", "EMPTY="],
    });

    expect(options).toEqual({
      manifestPath: "project.ticbuild.jsonc",
      overrideVariables: { PROJECT_VALUE: "cli" },
      overrideEnvironment: {
        BUILD_MODE: "debug",
        TOKEN: "part=two",
        EMPTY: "",
      },
    });
  });

  it("warns and ignores malformed environment overrides", () => {
    const warning = jest.spyOn(cons, "warning").mockImplementation(() => undefined);

    const options = parseBuildOptions(undefined, {
      env: ["MISSING_EQUALS", "=missing-key", " VALID = value "],
    });

    expect(options.overrideEnvironment).toEqual({ VALID: "value" });
    expect(warning).toHaveBeenCalledWith(
      "Invalid environment override format: MISSING_EQUALS (expected key=value)",
    );
    expect(warning).toHaveBeenCalledWith(
      "Invalid environment override format: =missing-key (empty key)",
    );

    warning.mockRestore();
  });
});
