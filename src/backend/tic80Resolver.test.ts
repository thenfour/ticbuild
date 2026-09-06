import { createTic80Controller, useExternalTic80 } from "./tic80Resolver";
import { CustomTic80Controller } from "./tic80Controller/customController";
import { VanillaTic80Controller } from "./tic80Controller/vanillaController";

jest.mock("./tic80Controller/customController");
jest.mock("./tic80Controller/vanillaController");

describe("createTic80Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(["1", "true"])("selects external TIC-80 for USE_EXTERNAL_TIC80=%s", (value) => {
    const environment = { USE_EXTERNAL_TIC80: value, TIC80_LOCATION: "C:\\tic80.exe" };

    createTic80Controller("C:\\project", { environment });

    expect(VanillaTic80Controller).toHaveBeenCalledWith("C:\\project", environment);
    expect(CustomTic80Controller).not.toHaveBeenCalled();
  });

  it("passes the project environment to the bundled controller", () => {
    const environment = { USE_EXTERNAL_TIC80: "0", PROJECT_VALUE: "configured" };

    createTic80Controller("C:\\project", { environment, remotingVerbose: true });

    expect(CustomTic80Controller).toHaveBeenCalledWith("C:\\project", {
      environment,
      remotingVerbose: true,
    });
    expect(VanillaTic80Controller).not.toHaveBeenCalled();
  });

  it("uses strict documented values for external TIC-80 selection", () => {
    expect(useExternalTic80({ USE_EXTERNAL_TIC80: "true" })).toBe(true);
    expect(useExternalTic80({ USE_EXTERNAL_TIC80: "1" })).toBe(true);
    expect(useExternalTic80({ USE_EXTERNAL_TIC80: "TRUE" })).toBe(false);
    expect(useExternalTic80({ USE_EXTERNAL_TIC80: "0" })).toBe(false);
  });
});
