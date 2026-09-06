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
    it("attaches remoting clients before the first controlled cart load", async () => {
        const fakeProcess = {
            killed: false,
            once: jest.fn(),
        } as unknown as ChildProcess;

        (launchProcessReturnImmediately as jest.MockedFunction<typeof launchProcessReturnImmediately>).mockResolvedValue(
            fakeProcess,
        );

        const environment = { PROJECT_VALUE: "configured" };
        const controller = new CustomTic80Controller("C:\\project", { environment });
        const order: string[] = [];
        const loadCart = jest.fn(async () => {
            order.push("load");
        });
        (controller as any).client = { loadCart };
        jest.spyOn(controller as any, "ensureConnected").mockResolvedValue(undefined);
        controller.onRemotingReady((target) => {
            order.push("terminal");
            expect(target).toEqual({ host: "127.0.0.1", port: 55001 });
        });

        await controller.launchAndControlCart("C:\\project\\build\\game.tic", ["--fs=C:\\tmp"]);
        await controller.launchAndControlCart("C:\\project\\build\\game-2.tic", ["--fs=C:\\tmp"]);

        expect(launchProcessReturnImmediately).toHaveBeenCalledWith(
            "C:\\tic80.exe",
            [
                "--skip",
                "--remoting-port=55001",
                "--remote-session-location=C:\\project\\.ticbuild\\remoting\\sessions",
                "--fs=C:\\tmp",
            ],
            environment,
        );
        expect(loadCart).toHaveBeenNthCalledWith(1, "C:\\project\\build\\game.tic", true);
        expect(loadCart).toHaveBeenNthCalledWith(2, "C:\\project\\build\\game-2.tic", true);
        expect(order).toEqual(["terminal", "load", "terminal", "load"]);
    });
});
