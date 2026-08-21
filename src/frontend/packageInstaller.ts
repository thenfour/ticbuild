import * as childProcess from "node:child_process";
import * as cons from "../utils/console";

export async function installProjectDependencies(projectDir: string): Promise<void> {
  cons.info(`Installing npm dependencies in ${projectDir}...`);

  await new Promise<void>((resolve, reject) => {
    const child = childProcess.spawn("npm install", {
      cwd: projectDir,
      shell: true,
      stdio: "inherit",
    });
    child.once("error", (error) => reject(new Error(`Unable to start npm install: ${error.message}`)));
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      const outcome = signal ? `signal ${signal}` : `exit code ${code}`;
      reject(new Error(`npm install failed with ${outcome}`));
    });
  });

  cons.success("Installed npm dependencies.");
}
