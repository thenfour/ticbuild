import { exec } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import * as cons from "./console";

const execAsync = promisify(exec);

export interface WindowPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Gets the window position for a process by PID using PowerShell
export async function getWindowPosition(pid: number): Promise<WindowPlacement | null> {
  if (process.platform !== "win32") {
    throw new Error(`Platform ${process.platform} is not supported for getWindowPosition.`);
  }

  const psScript = `
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
    
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
      public int Left;
      public int Top;
      public int Right;
      public int Bottom;
    }
    
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
    
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  }
"@

$targetPid = ${pid}
$result = $null

[Win32]::EnumWindows({
  param($hwnd, $lParam)
  $procId = 0
  [Win32]::GetWindowThreadProcessId($hwnd, [ref]$procId) | Out-Null
  if ($procId -eq $targetPid) {
    $rect = New-Object Win32+RECT
    if ([Win32]::GetWindowRect($hwnd, [ref]$rect)) {
      $script:result = @{
        x = $rect.Left
        y = $rect.Top
        width = $rect.Right - $rect.Left
        height = $rect.Bottom - $rect.Top
      }
      return $false
    }
  }
  return $true
}, [IntPtr]::Zero) | Out-Null

if ($script:result) {
  $script:result | ConvertTo-Json -Compress
}
`;

  const scriptPath = join(tmpdir(), `getwindowpos-${pid}-${Date.now()}.ps1`);
  try {
    await writeFile(scriptPath, psScript, "utf-8");
    const { stdout, stderr } = await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`);

    if (stderr) {
      cons.warning(`PowerShell stderr: ${stderr}`);
    }

    cons.dim(`PowerShell stdout: "${stdout.trim()}"`);

    if (stdout.trim()) {
      const parsed = JSON.parse(stdout.trim());
      return {
        x: parsed.x,
        y: parsed.y,
        width: parsed.width,
        height: parsed.height,
      };
    }
  } finally {
    try {
      await unlink(scriptPath);
    } catch {
      // Ignore cleanup errors
    }
  }

  return null;
}

// Sets the window position for a process by PID using PowerShell
export async function setWindowPosition(pid: number, placement: WindowPlacement): Promise<boolean> {
  if (process.platform !== "win32") {
    throw new Error(`Platform ${process.platform} is not supported for setWindowPosition.`);
  }

  const psScript = `
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
    
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
    
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
    
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    
    public const uint SWP_NOZORDER = 0x0004;
    public const uint SWP_SHOWWINDOW = 0x0040;
  }
"@

$targetPid = ${pid}
$x = ${placement.x}
$y = ${placement.y}
$width = ${placement.width}
$height = ${placement.height}

[Win32]::EnumWindows({
  param($hwnd, $lParam)
  $procId = 0
  [Win32]::GetWindowThreadProcessId($hwnd, [ref]$procId) | Out-Null
  if ($procId -eq $targetPid) {
    [Win32]::SetWindowPos($hwnd, [IntPtr]::Zero, $x, $y, $width, $height, [Win32]::SWP_NOZORDER -bor [Win32]::SWP_SHOWWINDOW) | Out-Null
    return $false
  }
  return $true
}, [IntPtr]::Zero) | Out-Null

Write-Output "success"
`;

  const scriptPath = join(tmpdir(), `setwindowpos-${pid}-${Date.now()}.ps1`);
  try {
    await writeFile(scriptPath, psScript, "utf-8");
    const { stderr } = await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`);

    if (stderr) {
      cons.warning(`PowerShell stderr: ${stderr}`);
    }
  } finally {
    try {
      await unlink(scriptPath);
    } catch {
      // Ignore cleanup errors
    }
  }

  return true;
}

//Waits for a window to appear for the given process ID
export async function waitForWindow(pid: number, timeoutMs: number = 5000): Promise<boolean> {
  if (process.platform !== "win32") {
    throw new Error(`Platform ${process.platform} is not supported for waitForWindow.`);
  }

  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      const position = await getWindowPosition(pid);
      if (position) {
        return true;
      }
    } catch (error) {
      // Window might not exist yet, keep trying
      cons.dim(`  Still waiting for window... (${error instanceof Error ? error.message : String(error)})`);
    }
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  return false;
}
