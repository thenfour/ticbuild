param(
  [Parameter(Mandatory=$true)]
  [int]$ProcessId
)

Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {
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

$targetPid = $ProcessId
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
