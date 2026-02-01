# Terminal client script to connect to TIC-80 TCP server
# powershell ./terminal.ps1 127.0.0.1 5000
param(
  [string]$ConnectHost = "127.0.0.1",
  [int]$Port = 9977
)

$client = [System.Net.Sockets.TcpClient]::new($ConnectHost, $Port)
$stream = $client.GetStream()
$writer = [System.IO.StreamWriter]::new($stream, [System.Text.Encoding]::ASCII)
$reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII)
$writer.NewLine = "`n"
$writer.AutoFlush = $true

Write-Host "Connected. Type lines like: 1 ping  (Ctrl+C to quit)"

while ($true) {
  $line = Read-Host "> "
  if ([string]::IsNullOrWhiteSpace($line)) { continue }
  $writer.WriteLine($line)

  $resp = $reader.ReadLine()
  Write-Host $resp
}

