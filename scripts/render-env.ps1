<#
  render-env.ps1 - paste-ready Render dashboard env block
  =======================================================
  Single source of truth: the sectioned, gitignored root .env.

  Output: KEY=VALUE lines, in file order, skipping:
    - comments / blanks
    - local-dev keys    (POSTGRES_USER/PASSWORD/DB)
    - Neon metadata     (NEON_BRANCH)
    - Render-injected   (PORT - Render sets its own)
    - placeholders      (empty, REPLACE_WITH..., or BACKEND_URL until the Render URL exists)

  Usage:
    powershell -File scripts\render-env.ps1                     # print block
    powershell -File scripts\render-env.ps1 -OutFile render.env  # save block

  Then paste the block into Render: backend service -> Environment.

  NOTE: keep this file pure ASCII. PS 5.1 reads BOM-less scripts as
  ANSI, so non-ASCII characters can corrupt parsing.
#>
param(
  [string]$EnvFile = (Join-Path (Split-Path -Parent $PSScriptRoot) '.env'),
  [string]$OutFile
)

$skipKeys = @('POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB', 'NEON_BRANCH', 'PORT')
$lines = @()

foreach ($line in Get-Content -LiteralPath $EnvFile) {
  if ($line -match '^([A-Z0-9_]+)=(.*)$') {
    $key = $Matches[1]
    $val = $Matches[2]
    if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Substring(1, $val.Length - 2) }
    $val = $val.Trim()
    if ($key -in $skipKeys) { continue }
    if ($val -eq '' -or $val -match 'REPLACE_WITH' -or $key -eq 'BACKEND_URL') { continue }  # placeholder / unset
    $lines += "$key=$val"
  }
}

if ($lines.Count -eq 0) {
  Write-Error "No paste-ready variables found in $EnvFile - every value may still be a placeholder."
  exit 1
}

if ($OutFile) {
  Set-Content -LiteralPath $OutFile -Value ($lines -join [Environment]::NewLine) -Encoding utf8
  Write-Host ("Wrote {0} variables to {1}" -f $lines.Count, $OutFile)
} else {
  $lines -join [Environment]::NewLine
}