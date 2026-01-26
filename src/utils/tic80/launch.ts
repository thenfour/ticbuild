import { ChildProcess, spawn } from "node:child_process";

// launches it and returns the process id / handle / something that can be used to
// monitor and kill the running instance. Returns immediately; does not wait for the process to finish.
export async function launchProcessReturnImmediately(exePath: string, args: string[] = []): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const child = spawn(exePath, args, {
      stdio: "ignore",
      detached: true,
    });
    child.on("error", (err) => {
      reject(err);
    });
    child.unref(); // Allow parent process to exit independently
    resolve(child); // resolve immediately with the child process
  });
}

//
export async function launchProcessAndWait(exePath: string, args: string[] = []): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(exePath, args, {
      stdio: "inherit",
    });
    child.on("error", (err) => {
      reject(err);
    });
    child.on("close", (code) => {
      resolve(code || 0);
    });
    // do not resolve immediately; wait for process to exit
  });
}
