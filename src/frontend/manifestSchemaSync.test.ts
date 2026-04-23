import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { buildCore } from "./core";
import * as cons from "../utils/console";

function writeFile(filePath: string, content: string): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
}

function getBundledSchema(): string {
    return fs.readFileSync(path.resolve(__dirname, "..", "..", "ticbuild.schema.json"), "utf-8");
}

function createTempProject(options?: { autoUpdateManifestSchema?: boolean; schemaRef?: string }): {
    dir: string;
    manifestPath: string;
} {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ticbuild-schema-sync-"));
    const codePath = path.join(dir, "main.lua");
    writeFile(codePath, "print('ok')");

    const manifest = {
        $schema: options?.schemaRef ?? "./.ticbuild/ticbuild.schema.json",
        project: {
            name: "test",
            binDir: "./bin",
            objDir: "./obj",
            outputCartName: "out.tic",
            ...(options?.autoUpdateManifestSchema !== undefined
                ? { autoUpdateManifestSchema: options.autoUpdateManifestSchema }
                : {}),
        },
        imports: [
            {
                name: "maincode",
                path: "main.lua",
                kind: "LuaCode",
            },
        ],
        assembly: {
            lua: {
                minify: false,
            },
            blocks: [
                {
                    asset: "maincode",
                },
            ],
        },
    };

    const manifestPath = path.join(dir, "project.ticbuild.jsonc");
    writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    return { dir, manifestPath };
}

describe("Manifest schema sync", () => {
    it("should write the managed schema file during build when missing", async () => {
        const { dir, manifestPath } = createTempProject();
        const expectedSchema = getBundledSchema();
        const schemaPath = path.join(dir, ".ticbuild", "ticbuild.schema.json");

        try {
            await buildCore(manifestPath);
            expect(fs.readFileSync(schemaPath, "utf-8")).toBe(expectedSchema);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it("should not update the managed schema file when auto update is disabled", async () => {
        const { dir, manifestPath } = createTempProject({ autoUpdateManifestSchema: false });
        const schemaPath = path.join(dir, ".ticbuild", "ticbuild.schema.json");

        try {
            await buildCore(manifestPath);
            expect(fs.existsSync(schemaPath)).toBe(false);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it("should warn and not overwrite when manifest $schema points elsewhere", async () => {
        const { dir, manifestPath } = createTempProject({ schemaRef: "./custom.schema.json" });
        const customSchemaPath = path.join(dir, "custom.schema.json");
        const managedSchemaPath = path.join(dir, ".ticbuild", "ticbuild.schema.json");
        writeFile(customSchemaPath, "{\n  \"title\": \"custom\"\n}\n");

        const warnSpy = jest.spyOn(cons, "warning").mockImplementation(() => undefined);

        try {
            await buildCore(manifestPath);
            expect(warnSpy).toHaveBeenCalledWith(
                "Manifest $schema points elsewhere and differs from bundled schema: ./custom.schema.json",
            );
            expect(fs.readFileSync(customSchemaPath, "utf-8")).toBe("{\n  \"title\": \"custom\"\n}\n");
            expect(fs.existsSync(managedSchemaPath)).toBe(false);
        } finally {
            warnSpy.mockRestore();
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});