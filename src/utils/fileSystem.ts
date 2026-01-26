import * as fs from "fs";
import * as path from "path";

export function resolvePath(basePath: string, relativePath: string): string {
  return path.resolve(path.dirname(basePath), relativePath);
}

export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export async function readTextFileAsync(filePath: string, encoding?: BufferEncoding): Promise<string> {
  return fs.promises.readFile(filePath, encoding || "utf-8");
}

export async function readBinaryFileAsync(filePath: string): Promise<Uint8Array> {
  const data = await fs.promises.readFile(filePath);
  return new Uint8Array(data);
}

export async function writeTextFile(filePath: string, content: string, encoding?: BufferEncoding): Promise<void> {
  await fs.promises.writeFile(filePath, content, { encoding: encoding || "utf-8" });
}

export async function writeBinaryFile(filePath: string, data: Uint8Array): Promise<void> {
  await fs.promises.writeFile(filePath, Buffer.from(data));
}

export function findExecutableInPath(executable: string): string | undefined {
  const pathEnv = process.env.PATH || "";
  const pathSeparator = process.platform === "win32" ? ";" : ":";
  const paths = pathEnv.split(pathSeparator);

  const exeExtensions = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];

  for (const dir of paths) {
    for (const ext of exeExtensions) {
      const fullPath = path.join(dir, executable + ext);
      if (fileExists(fullPath)) {
        return fullPath;
      }
    }
  }

  return undefined;
}

export function isAbsolutePath(p: string): boolean {
  return path.isAbsolute(p);
}

export function joinPathParts(pathParts: string[]): string {
  return path.join(...pathParts);
}

export function isDirectory(p: string): boolean {
  try {
    const stats = fs.statSync(p);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

// Normalizes a path to its canonical form
// (e.g., resolves .. and . segments, uses consistent separators)
export function canonicalizePath(p: string): string {
  return path.normalize(p);
}

// Resolves a file path by searching in a base directory and additional search directories.
// Returns the first matching file found, or null if not found.
//
// filePath - The file path to resolve (can be relative or absolute)
// baseDir - The base directory to search in first
// additionalDirs - Additional directories to search (relative to baseDir)
// returns The absolute path to the file if found, or null
export function resolveFileWithSearchPaths(
  filePath: string,
  baseDir: string,
  additionalDirs?: string[],
): string | null {
  // If absolute path, check if it exists
  if (isAbsolutePath(filePath)) {
    return fileExists(filePath) ? canonicalizePath(filePath) : null;
  }

  // Try base directory first
  const baseCandidate = path.join(baseDir, filePath);
  if (fileExists(baseCandidate)) {
    return canonicalizePath(baseCandidate);
  }

  // Try additional search directories
  if (additionalDirs) {
    for (const searchDir of additionalDirs) {
      const absoluteSearchDir = isAbsolutePath(searchDir) ? searchDir : path.join(baseDir, searchDir);
      const candidate = path.join(absoluteSearchDir, filePath);
      if (fileExists(candidate)) {
        return canonicalizePath(candidate);
      }
    }
  }

  return null;
}

export function copyFile(sourcePath: string, targetPath: string, force: boolean): void {
  if (!force && fileExists(targetPath)) {
    throw new Error(`File already exists: ${targetPath} (use --force to overwrite)`);
  }
  const content = fs.readFileSync(sourcePath, "utf-8");
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, content, "utf-8");
}

export function isDirectoryEmpty(dirPath: string): boolean {
  if (!fs.existsSync(dirPath)) {
    return true;
  }
  const entries = fs.readdirSync(dirPath);
  return entries.length === 0;
}
