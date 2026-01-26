// Searches for TIC-80 in the following order:
// 1. TIC80_LOCATION environment variable from .env/.env.local
// 2. tic80 or tic80.exe in PATH

import {config} from 'dotenv';
import * as path from 'path';

import {fileExists, findExecutableInPath} from '../utils/fileSystem';

export interface Tic80Location {
  path: string;
  source: 'env'|'path';
}

export function resolveTic80Location(projectDir: string): Tic80Location|
    undefined {
  // Load .env files if project directory is provided
  if (projectDir) {
    const envPath = path.join(projectDir, '.env');
    const envLocalPath = path.join(projectDir, '.env.local');

    // Load .env first, then .env.local (which overrides)
    config({path: envPath});
    config({path: envLocalPath});
  }

  // Check TIC80_LOCATION environment variable
  const envLocation = process.env.TIC80_LOCATION;
  if (envLocation) {
    if (fileExists(envLocation)) {
      return {path: envLocation, source: 'env'};
    }
  }

  // Search in PATH
  const pathLocation = findExecutableInPath('tic80');
  if (pathLocation) {
    return {path: pathLocation, source: 'path'};
  }

  return undefined;
}
