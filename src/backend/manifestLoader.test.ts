import * as fs from "fs";

import { findManifestInDirectory, loadManifest, ManifestLoadError, ManifestValidationError } from "./manifestLoader";

// Mock fs module
jest.mock("fs");
const mockFs = fs as jest.Mocked<typeof fs>;

describe("Manifest Loader", () => {
  const validManifest = {
    project: {
      name: "test-project",
      binDir: "./bin",
      objDir: "./obj",
      outputCartName: "output.tic",
    },
    imports: [
      {
        name: "maincode",
        path: "main.lua",
        kind: "LuaCode",
      },
    ],
    assembly: {
      blocks: [
        {
          asset: "maincode",
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findManifestInDirectory", () => {
    it("should find .ticbuild.jsonc file", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue(["test.ticbuild.jsonc", "other.txt"]);

      const result = findManifestInDirectory("/test/dir");

      expect(result).toContain("test.ticbuild.jsonc");
      expect(result).toContain("test");
      expect(result).toContain("dir");
    });

    it("should find .ticbuild.json file", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue(["test.ticbuild.json", "other.txt"]);

      const result = findManifestInDirectory("/test/dir");

      expect(result).toContain("test.ticbuild.json");
    });

    it("should return undefined if no manifest found", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue(["other.txt", "config.json"]);

      const result = findManifestInDirectory("/test/dir");

      expect(result).toBeUndefined();
    });

    it("should throw ManifestLoadError if directory cannot be read", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation(() => {
        throw new Error("Permission denied");
      });

      expect(() => findManifestInDirectory("/test/dir")).toThrow(ManifestLoadError);
    });
  });

  describe("loadManifest", () => {
    it("should load and validate a valid manifest", () => {
      const manifestContent = JSON.stringify(validManifest);

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(manifestContent);

      const result = loadManifest("/test/manifest.ticbuild.jsonc");

      expect(result.manifest).toMatchObject(validManifest);
      expect(result.filePath).toContain("manifest.ticbuild.jsonc");
      expect(result.projectDir).toBeDefined();
    });

    it("should handle JSONC with comments", () => {
      const manifestContent = `{
        // This is a comment
        "project": {
          "name": "test-project",
          "binDir": "./bin",
          "objDir": "./obj",
          "outputCartName": "output.tic"
        },
        "imports": [
          {
            "name": "maincode",
            "path": "main.lua",
            "kind": "LuaCode"
          }
        ],
        "assembly": {
          "blocks": [
            {
              "asset": "maincode"
            }
          ]
        }
      }`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(manifestContent);

      const result = loadManifest("/test/manifest.ticbuild.jsonc");

      expect(result.manifest.project.name).toBe("test-project");
    });

    it("should throw ManifestValidationError for invalid manifest", () => {
      const invalidManifest = {
        project: {
          name: "test",
          // missing required fields
        },
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(invalidManifest));

      expect(() => loadManifest("/test/invalid.ticbuild.jsonc")).toThrow(ManifestValidationError);
    });

    it("should throw ManifestLoadError for invalid JSON", () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue("{ invalid json }");

      expect(() => loadManifest("/test/bad.ticbuild.jsonc")).toThrow();
    });
  });
});
