$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptRoot '..')
$projectRootText = $projectRoot.Path.TrimEnd('\')
$releaseName = 'gestion-residence-cmc-pro2-clean'
$outputDir = Join-Path $projectRoot 'outputs'
$zipPath = Join-Path $outputDir "$releaseName.zip"
$stageRoot = Join-Path ([System.IO.Path]::GetTempPath()) "$releaseName-stage"

$excludedDirs = @(
  '.git',
  'backend/vendor',
  'frontend/node_modules',
  'frontend/dist',
  'backend/storage/logs',
  'backend/storage/framework/cache/data',
  'backend/storage/framework/sessions',
  'backend/storage/framework/views',
  'backend/storage/framework/testing',
  'backend/storage/app/public',
  'backend/storage/app/private',
  'backend/bootstrap/cache',
  'outputs'
)

$excludedFiles = @(
  '.env',
  '.env.*',
  'backend/.env',
  'backend/.env.*',
  'backend/database/*.sqlite',
  'backend/database/*.sqlite-*',
  'backend/gestion_residence_cmc',
  'backend/.phpunit.result.cache',
  'backend/.phpunit.cache',
  'backend/phpunit.result.cache',
  '*.log',
  '*.tmp',
  '*.bak'
)

function Test-IsExcludedDir {
  param([string] $relativePath)

  $normalized = $relativePath.Replace('\', '/').Trim('/')
  foreach ($pattern in $excludedDirs) {
    if ($normalized -eq $pattern -or $normalized.StartsWith("$pattern/")) {
      return $true
    }
  }
  return $false
}

function Test-IsExcludedFile {
  param([string] $relativePath)

  $normalized = $relativePath.Replace('\', '/').Trim('/')
  foreach ($pattern in $excludedFiles) {
    if ($normalized -like $pattern) {
      return $true
    }
  }
  return $false
}

if (Test-Path $stageRoot) {
  Remove-Item -LiteralPath $stageRoot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $stageRoot | Out-Null
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Get-ChildItem -LiteralPath $projectRoot -Force -Recurse | ForEach-Object {
  $relative = $_.FullName.Substring($projectRootText.Length).TrimStart('\')

  if ($_.PSIsContainer) {
    if (-not (Test-IsExcludedDir $relative)) {
      New-Item -ItemType Directory -Force -Path (Join-Path $stageRoot $relative) | Out-Null
    }
    return
  }

  if (Test-IsExcludedDir (Split-Path $relative -Parent)) {
    return
  }

  if (Test-IsExcludedFile $relative) {
    return
  }

  $destination = Join-Path $stageRoot $relative
  New-Item -ItemType Directory -Force -Path (Split-Path $destination -Parent) | Out-Null
  Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
}

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $stageRoot '*') -DestinationPath $zipPath -Force
Remove-Item -LiteralPath $stageRoot -Recurse -Force

Write-Host "Release ZIP created: $zipPath"
Write-Host 'Verify with:'
Write-Host "tar -tf `"$zipPath`" | rg `".env|.git|vendor|node_modules|frontend/dist`""
