import { buildInfo } from "../buildInfo";

/*

build-time should generate a file with actual info.
another project does this via a script that:

1. Reads version from package.json
2. Checks git status for dirty state
3. Gets commit hash and dates

See scripts/gen-build-info.js for the implementation.

*/

export type BuildInfoLike = {
  version: string;
  dirty: boolean | null;
  buildDate?: string;
  lastCommitDate?: string | null;
  commitHash?: string | null;
};

// Version tag is like:
// - v1.0.2
// - v1.0.2(!)
// - unknown
export function getBuildVersionTag(info: BuildInfoLike): string {
  if (!info.version) return "unknown";

  let str = `v${info.version}`;
  if (info.dirty) {
    str += "(!)";
  }
  return str;
}

// Hash input / display string.
// Example: "Ticbuild v1+290(!)"
export function getAppVersionString(): string {
  return `Ticbuild ${getBuildVersionTag(buildInfo)}`;
}

// Example: "Ticbuild v1+290(!) (abcdef1234)"
export function getAppVersionAndCommitString(): string {
  return `Ticbuild ${getBuildVersionTag(buildInfo)} (${buildInfo.commitHash ?? "unknown"})`;
}
