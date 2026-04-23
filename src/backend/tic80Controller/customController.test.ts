import { ChildProcess } from "node:child_process";
import { CustomTic80Controller } from "./customController";
import { launchProcessReturnImmediately } from "../../utils/tic80/launch";

jest.mock("../../utils/fileSystem", () => ({
    fileExists: jest.fn(() => true),
}));

jest.mock("../../utils/templates", () => ({
    getPathRelativeToTemplates: jest.fn(() => "C:\\tic80.exe"),
}));

jest.mock("../../utils/tic80/launch", () => ({
    launchProcessReturnImmediately: jest.fn(),
}));

jest.mock("./netUtils", () => ({
    findRandomFreePortInRange: jest.fn(async () => 55001),
}));

describe("CustomTic80Controller", () => {
    it("passes the cart path when launching a new managed TIC-80 process", async () => {
        const fakeProcess = {
            killed: false,
            once: jest.fn(),
        } as unknown as ChildProcess;

        (launchProcessReturnImmediately as jest.MockedFunction<typeof launchProcessReturnImmediately>).mockResolvedValue(
            fakeProcess,
        );

        const controller = new CustomTic80Controller("C:\\project");
        jest.spyOn(controller as any, "ensureConnected").mockResolvedValue(undefined);

        await controller.launchAndControlCart("C:\\project\\build\\game.tic", ["--fs=C:\\tmp"]);

        expect(launchProcessReturnImmediately).toHaveBeenCalledWith(
            "C:\\tic80.exe",
            [
                "C:\\project\\build\\game.tic",
                "--skip",
                "--remoting-port=55001",
                "--remote-session-location=C:\\project\\.ticbuild\\remoting\\sessions",
                "--fs=C:\\tmp",
            ],
        );
    });
});