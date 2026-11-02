$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$bak = $PSScriptRoot

Copy-Item "$bak/providers.tsx" "$root/src/providers/providers.tsx" -Force
Copy-Item "$bak/globals.css" "$root/src/styles/globals.css" -Force
Copy-Item "$bak/audit-log-dialog.tsx" "$root/src/components/studio/audit-log-dialog.tsx" -Force
Copy-Item "$bak/layout.tsx" "$root/src/app/layout.tsx" -Force
Copy-Item "$bak/package.json" "$root/package.json" -Force

$extra = @(
  "$root/src/components/perfect-scroll-area.tsx",
  "$root/src/components/site-scroll-root.tsx"
)
foreach ($path in $extra) {
  if (Test-Path $path) { Remove-Item $path -Force }
}

Push-Location $root
pnpm install
Pop-Location

Write-Host "Restored pre-perfect-scrollbar snapshot. Restart pnpm dev."
