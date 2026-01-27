import { exec } from "node:child_process";
import * as path from "node:path";
import { promisify } from "node:util";
import * as cons from "./console";

const execAsync = promisify(exec);

export interface WindowPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

function resolveScriptPath(fileName: string): string {
  // In dev: __dirname = <repo>/src/utils
  // In published build: __dirname = <pkg>/dist/utils
  // Either way, ../../scripts should land at <repo or pkg>/scripts
  return path.resolve(__dirname, "../../scripts", fileName);
}

// Gets the window position for a process by PID using PowerShell
export async function getWindowPosition(pid: number): Promise<WindowPlacement | null> {
  if (process.platform !== "win32") {
    throw new Error(`Platform ${process.platform} is not supported for getWindowPosition.`);
  }

  cons.dim(`[windowPosition] Getting window position for PID ${pid}`);
  const scriptPath = resolveScriptPath("get-window-position.ps1");
  cons.dim(`[windowPosition] Script path: ${scriptPath}`);
  const { stdout, stderr } = await execAsync(
    `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -ProcessId ${pid}`,
  );

  if (stderr) {
    cons.warning(`[windowPosition] PowerShell stderr: ${stderr}`);
  }

  cons.dim(`[windowPosition] PowerShell stdout: "${stdout.trim()}"`);

  if (stdout.trim()) {
    const parsed = JSON.parse(stdout.trim());
    cons.dim(
      `[windowPosition] Parsed position: x=${parsed.x}, y=${parsed.y}, width=${parsed.width}, height=${parsed.height}`,
    );
    return {
      x: parsed.x,
      y: parsed.y,
      width: parsed.width,
      height: parsed.height,
    };
  }

  cons.dim(`[windowPosition] No position data returned`);
  return null;
}

// Sets the window position for a process by PID using PowerShell
export async function setWindowPosition(pid: number, placement: WindowPlacement): Promise<boolean> {
  if (process.platform !== "win32") {
    throw new Error(`Platform ${process.platform} is not supported for setWindowPosition.`);
  }

  cons.dim(
    `[windowPosition] Setting window position for PID ${pid} to (${placement.x}, ${placement.y}) ${placement.width}x${placement.height}`,
  );
  const scriptPath = resolveScriptPath("set-window-position.ps1");
  cons.dim(`[windowPosition] Script path: ${scriptPath}`);
  const { stderr } = await execAsync(
    `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -ProcessId ${pid} -X ${placement.x} -Y ${placement.y} -Width ${placement.width} -Height ${placement.height}`,
  );

  if (stderr) {
    cons.warning(`[windowPosition] PowerShell stderr: ${stderr}`);
  }

  cons.dim(`[windowPosition] Window position set successfully`);
  return true;
}

//Waits for a window to appear for the given process ID
export async function waitForWindow(pid: number, timeoutMs: number = 5000): Promise<boolean> {
  if (process.platform !== "win32") {
    throw new Error(`Platform ${process.platform} is not supported for waitForWindow.`);
  }

  cons.dim(`[windowPosition] Waiting for window (PID ${pid}, timeout ${timeoutMs}ms)`);
  const startTime = Date.now();
  let attempts = 0;
  while (Date.now() - startTime < timeoutMs) {
    attempts++;
    try {
      const position = await getWindowPosition(pid);
      if (position) {
        cons.dim(`[windowPosition] Window found after ${attempts} attempts`);
        return true;
      }
    } catch (error) {
      // Window might not exist yet, keep trying
      cons.dim(
        `[windowPosition] Attempt ${attempts} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  cons.dim(`[windowPosition] Window not found after ${attempts} attempts (timeout)`);
  return false;
}
