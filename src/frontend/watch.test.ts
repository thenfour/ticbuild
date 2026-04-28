import * as path from "node:path";
import { buildWatchTargets, resolveAdditionalWatchGlob } from "./watch";

describe("watch helpers", () => {
    it("should resolve project-relative additional watch globs", () => {
        const projectDir = path.join("project-root");

        expect(resolveAdditionalWatchGlob(projectDir, "./src/**/*.lua")).toBe(
            `${projectDir.replace(/\\/g, "/")}/src/**/*.lua`,
        );
    });

    it("should preserve negated additional watch globs", () => {
        const projectDir = path.join("project-root");

        expect(resolveAdditionalWatchGlob(projectDir, "!./src/generated/**/*.lua")).toBe(
            `!${projectDir.replace(/\\/g, "/")}/src/generated/**/*.lua`,
        );
    });

    it("should include manifest, dependencies, and resolved watch globs", () => {
        const projectDir = path.join("project-root");
        const manifestPath = path.join(projectDir, "project.ticbuild.jsonc");
        const mainLuaPath = path.join(projectDir, "src", "main.lua");
        const expectedGlob = `${projectDir.replace(/\\/g, "/")}/src/**/*.lua`;

        expect(buildWatchTargets(manifestPath, [mainLuaPath, mainLuaPath], projectDir, ["./src/**/*.lua", ""])).toEqual(
            [expectedGlob, mainLuaPath, manifestPath].sort(),
        );
    });
});