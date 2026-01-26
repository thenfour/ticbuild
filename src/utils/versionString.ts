import { buildInfo } from "../buildInfo";

/*

build-time should generate a file with actual info.
another project does this via a webpack plugin that looks like:

const childProcess = require('child_process');

function safeExec(command) {
  try {
    return childProcess.execSync(command, { encoding: 'utf8' }).trim();
  } catch (err) {
    return null;
  }
}

function getBuildInfo() {
  const gitTag = safeExec('git describe --tags --abbrev=0');

  let commitsSinceTag = null;
  if (gitTag) {
    const count = safeExec(`git rev-list ${gitTag}..HEAD --count`);
    commitsSinceTag = count != null ? parseInt(count, 10) : null;
  }

  const dirtyOutput = safeExec('git status --porcelain');
  const dirty = dirtyOutput == null ? null : dirtyOutput.length > 0;

  const commitHash = safeExec('git rev-parse --short HEAD');
  const lastCommitDate = safeExec('git log -1 --format=%cI');
  const buildDate = new Date().toISOString();

  return {
    gitTag,
    commitsSinceTag,
    dirty,
    buildDate,
    lastCommitDate,
    commitHash,
  };
}

const BUILD_INFO = getBuildInfo();

... and the plugin saves that to a file that can be imported here.

*/

export type BuildInfoLike = {
  gitTag: string | null; //
  commitsSinceTag: number | null;
  dirty: boolean | null;
  buildDate?: string;
  lastCommitDate?: string | null;
  commitHash?: string | null;
};

// Version tag is like:
// - v1
// - v1+290
// - v1+290(!)
// - unknown
export function getBuildVersionTag(info: BuildInfoLike): string {
  if (!info.gitTag) return "unknown";

  let str = String(info.gitTag);
  if (info.commitsSinceTag && info.commitsSinceTag > 0) {
    str += `+${info.commitsSinceTag}`;
  }
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
