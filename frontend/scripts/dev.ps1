$ErrorActionPreference = 'Stop'

$frontendDir = Resolve-Path (Join-Path $PSScriptRoot '..')
$backendDir = Resolve-Path (Join-Path $PSScriptRoot '..\..\backend')
$hostName = '127.0.0.1'
$port = 8000

function Test-Port {
  param([string] $HostName, [int] $Port)

  $client = New-Object Net.Sockets.TcpClient
  try {
    $connect = $client.BeginConnect($HostName, $Port, $null, $null)
    if (-not $connect.AsyncWaitHandle.WaitOne(700, $false)) {
      return $false
    }

    $client.EndConnect($connect)
    return $true
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

$backendProcess = $null

if (Test-Port -HostName $hostName -Port $port) {
  Write-Host "Laravel backend already running on http://${hostName}:${port}"
} else {
  $php = Get-Command php -ErrorAction SilentlyContinue
  if (-not $php) {
    Write-Error "PHP is not available in PATH. Start Laravel manually with: cd backend; php artisan serve --host=127.0.0.1 --port=8000"
  }

  $backendProcess = Start-Process `
    -FilePath $php.Source `
    -ArgumentList @('artisan', 'serve', '--host=127.0.0.1', '--port=8000') `
    -WorkingDirectory $backendDir `
    -WindowStyle Hidden `
    -PassThru

  $started = $false
  for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Milliseconds 700
    if (Test-Port -HostName $hostName -Port $port) {
      $started = $true
      break
    }
  }

  if ($started) {
    Write-Host "Laravel backend started on http://${hostName}:${port}"
  } elseif ($backendProcess.HasExited) {
    Write-Warning "Laravel backend exited immediately with code $($backendProcess.ExitCode). Run cd backend; php artisan serve --host=127.0.0.1 --port=8000 to see the error."
  } else {
    Write-Warning "Laravel backend did not start on http://${hostName}:${port}."
  }
}

$vite = Join-Path $frontendDir 'node_modules\.bin\vite.cmd'
if (-not (Test-Path $vite)) {
  Write-Error "Vite is not installed. Run npm install inside frontend first."
}

try {
  & $vite
  exit $LASTEXITCODE
} finally {
  if ($backendProcess -and -not $backendProcess.HasExited) {
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
  }
}
