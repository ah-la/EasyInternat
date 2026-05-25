$ErrorActionPreference = 'Stop'

$frontendRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$projectRoot = Resolve-Path (Join-Path $frontendRoot '..')
$distPath = Join-Path $frontendRoot 'dist'
$publicPath = Join-Path $projectRoot 'backend/public'
$assetsPath = Join-Path $publicPath 'assets'

if (-not (Test-Path $distPath)) {
  throw "Frontend dist folder not found. Run vite build first."
}

New-Item -ItemType Directory -Force $assetsPath | Out-Null
Copy-Item (Join-Path $distPath 'index.html') (Join-Path $publicPath 'index.html') -Force

if (Test-Path (Join-Path $distPath 'assets')) {
  Copy-Item (Join-Path $distPath 'assets/*') $assetsPath -Recurse -Force
}

if (Test-Path (Join-Path $distPath 'favicon.svg')) {
  Copy-Item (Join-Path $distPath 'favicon.svg') (Join-Path $publicPath 'favicon.svg') -Force
}
