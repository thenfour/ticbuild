import { ChildProcess } from "node:child_process";
import { fileExists } from "../../utils/fileSystem";
import { launchProcessReturnImmediately } from "../../utils/tic80/launch";
import { VanillaTic80Controller } from "./vanillaController";

jest.mock("../../utils/fileSystem", () => ({
  fileExists: jest.fn(),
  findExecutableInPath: jest.fn(),
}));

jest.mock("../../utils/tic80/launch", () => ({
  launchProcessReturnImmediately: jest.fn(),
}));

describe("VanillaTic80Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(fileExists).mockReturnValue(true);
    jest.mocked(launchProcessReturnImmediately).mockResolvedValue({} as ChildProcess);
  });

  it("resolves and launches with the supplied project environment", async () => {
    const initialEnvironment = { TIC80_LOCATION: "C:\\first\\tic80.exe", PROJECT_VALUE: "first" };
    const updatedEnvironment = { TIC80_LOCATION: "C:\\second\\tic80.exe", PROJECT_VALUE: "second" };
    const controller = new VanillaTic80Controller("C:\\project", initialEnvironment);

    controller.setEnvironment(updatedEnvironment);
    await controller.launchFireAndForget("C:\\project\\game.tic", ["--scale=2"]);

    expect(launchProcessReturnImmediately).toHaveBeenCalledWith(
      "C:\\second\\tic80.exe",
      ["C:\\project\\game.tic", "--skip", "--scale=2"],
      updatedEnvironment,
    );
  });

  // no: when no explicit location, we use natural windows lookup, not recreate PATH logic in ticbuild.
  // it("uses the supplied PATH when no explicit location is configured", () => {
  //   jest.mocked(fileExists).mockReturnValue(false);
  //   jest.mocked(findExecutableInPath).mockReturnValue("C:\\tools\\tic80.exe");

  //   const controller = new VanillaTic80Controller("C:\\project", { PATH: "C:\\tools" });

  //   expect(controller.tic80Path).toBe("C:\\tools\\tic80.exe");
  //   expect(findExecutableInPath).toHaveBeenCalledWith("tic80", "C:\\tools");
  // });
});
