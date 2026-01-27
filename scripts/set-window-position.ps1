param(
  [Parameter(Mandatory=$true)]
  [int]$ProcessId,

  [Parameter(Mandatory=$true)]
  [int]$X,

  [Parameter(Mandatory=$true)]
  [int]$Y,

  [Parameter(Mandatory=$true)]
  [int]$Width,

  [Parameter(Mandatory=$true)]
  [int]$Height
)

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

$targetPid = $ProcessId

[Win32]::EnumWindows({
  param($hwnd, $lParam)
  $procId = 0
  [Win32]::GetWindowThreadProcessId($hwnd, [ref]$procId) | Out-Null
  if ($procId -eq $targetPid) {
    [Win32]::SetWindowPos($hwnd, [IntPtr]::Zero, $X, $Y, $Width, $Height, [Win32]::SWP_NOZORDER -bor [Win32]::SWP_SHOWWINDOW) | Out-Null
    return $false
  }
  return $true
}, [IntPtr]::Zero) | Out-Null

Write-Output "success"
