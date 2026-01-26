import Ajv from "ajv";
import * as fs from "fs";
import { parse as parseJsonc } from "jsonc-parser";
import * as path from "path";

import * as manifestSchema from "../../ticbuild.schema.json";

import { Manifest } from "./manifestTypes";
import { canonicalizePath, isDirectory } from "../utils/fileSystem";

export class ManifestValidationError extends Error {
  constructor(
    message: string,
    public errors: unknown[],
  ) {
    super(message);
    this.name = "ManifestValidationError";
  }
}

export class ManifestLoadError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "ManifestLoadError";
  }
}

// Finds the first *.ticbuild.jsonc file in a directory.
export function findManifestInDirectory(directory: string): string | undefined {
  try {
    const files = fs.readdirSync(directory);
    const manifestFile = files.find((file) => file.endsWith(".ticbuild.jsonc") || file.endsWith(".ticbuild.json"));

    if (manifestFile) {
      return path.join(directory, manifestFile);
    }

    return undefined;
  } catch (error) {
    throw new ManifestLoadError(`Failed to search directory: ${directory}`, error instanceof Error ? error : undefined);
  }
}

function validateManifest(data: unknown): Manifest {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(manifestSchema);

  if (!validate(data)) {
    const errorMessages = validate.errors?.map((err) => `${err.instancePath} ${err.message}`) || [];

    throw new ManifestValidationError(
      `Manifest validation failed:\n${errorMessages.join("\n")}`,
      validate.errors || [],
    );
  }

  // Type assertion is safe here because AJV has validated the structure
  return data as unknown as Manifest;
}

export interface LoadedManifest {
  manifest: Manifest;
  filePath: string;
  projectDir: string;
}

// Loads and validates a manifest file.
// filePath - Path to the manifest file
// returns Loaded and validated manifest with metadata
export function loadManifest(filePath: string): LoadedManifest {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    let parsed: unknown;
    try {
      parsed = parseJsonc(fileContent);
    } catch (error) {
      throw new ManifestLoadError(
        `Failed to parse manifest file: ${filePath}`,
        error instanceof Error ? error : undefined,
      );
    }

    const manifest = validateManifest(parsed);
    const projectDir = path.dirname(path.resolve(filePath));

    return { manifest, filePath: path.resolve(filePath), projectDir };
  } catch (error) {
    if (error instanceof ManifestValidationError || error instanceof ManifestLoadError) {
      throw error;
    }

    throw new ManifestLoadError(
      `Unexpected error loading manifest: ${filePath}`,
      error instanceof Error ? error : undefined,
    );
  }
}

// manifestPath - Optional manifest file name or directory. If not absolute, resolved relative to cwd
// searchDirectory - Directory to search if manifestPath is not provided
// returns Loaded and validated manifest with metadata
export function resolveManifestPath(manifestPath?: string | undefined): string {
  if (manifestPath) {
    const absolutePath = path.resolve(manifestPath);
    if (!isDirectory(absolutePath)) {
      return canonicalizePath(absolutePath);
    }
    const foundPath = findManifestInDirectory(absolutePath);
    if (foundPath) {
      return canonicalizePath(foundPath);
    }
    throw new ManifestLoadError(`No manifest file found in directory: ${absolutePath}`);
  }

  const searchDir = process.cwd();
  const foundPath = findManifestInDirectory(searchDir);
  if (!foundPath) {
    throw new ManifestLoadError(`No manifest file found in directory: ${searchDir}`);
  }

  return canonicalizePath(foundPath);
}

// manifestPath - path to manifest file or directory. If not absolute, resolved relative to cwd
// returns Loaded and validated manifest with metadata
export function resolveAndLoadManifest(manifestPath?: string | undefined): LoadedManifest {
  const resolvedPath = resolveManifestPath(manifestPath);
  return loadManifest(resolvedPath);
}
