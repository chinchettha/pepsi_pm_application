#Requires -Version 5.1
<#
.SYNOPSIS
  รัน migration 001–026 ต่อเนื่องบน PostgreSQL (schema app)

.PARAMETER DatabaseUrl
  connection string — ถ้าไม่ระบุ อ่านจาก PM-Pepsi-App/backend/.env (DATABASE_URL)

.EXAMPLE
  pwsh -File database/scripts/run-all-migrations.ps1
  pwsh -File database/scripts/run-all-migrations.ps1 -DatabaseUrl "postgresql://pepsipm:pepsipm@127.0.0.1:5433/pepsi_pm"
#>

param(
  [string]$DatabaseUrl = ''
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$MigrationsDir = Join-Path $RepoRoot 'database\migrations'

if (-not $DatabaseUrl) {
  $envFile = Join-Path $RepoRoot 'PM-Pepsi-App\backend\.env'
  if (Test-Path $envFile) {
    foreach ($line in Get-Content $envFile) {
      if ($line -match '^\s*DATABASE_URL\s*=\s*(.+)\s*$') {
        $DatabaseUrl = $Matches[1].Trim()
        break
      }
    }
  }
}

if (-not $DatabaseUrl) {
  Write-Error 'Set -DatabaseUrl or DATABASE_URL in PM-Pepsi-App/backend/.env'
}

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  Write-Error 'psql not in PATH. Use DBeaver to run files in database/migrations/ in order, or install PostgreSQL client.'
}

$files = @(
  '001_init_auth_tables.sql',
  '002_tbactivitytype.sql',
  '003_tblineschdul.sql',
  '004_tbiw37n_calendar.sql',
  '005_tbwkzb_tbfunctional.sql',
  '006_tbiw37n_import_batch.sql',
  '007_tbplangingwork_view_planwork.sql',
  '008_auth_tbmenu_member.sql',
  '009_tbreason.sql',
  '010_tbmanhours.sql',
  '011_tbdepartment.sql',
  '012_tbequipment.sql',
  '013_tbwkstatus_add_wkstreason.sql',
  '014_tbwkctrtype.sql',
  '015_tbproductline.sql',
  '016_tbzone.sql',
  '017_tbmainteanance.sql',
  '018_tbmaterial.sql',
  '019_tbwklevel.sql',
  '020_tbposition.sql',
  '021_tbwkctrgroup.sql',
  '022_tbtasklist.sql',
  '023_tblineschdul_unique.sql',
  '024_tbzone_extend.sql',
  '025_tbmenu_userlog.sql',
  '026_confirmation_tables.sql',
  '030_tbiw37n_import_row.sql'
)

Write-Host "Target: $DatabaseUrl"
Write-Host "Running $($files.Count) migrations..."

foreach ($f in $files) {
  $path = Join-Path $MigrationsDir $f
  if (-not (Test-Path $path)) {
    Write-Error "Missing: $path"
  }
  Write-Host "  -> $f"
  & psql $DatabaseUrl -v ON_ERROR_STOP=1 -f $path
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed: $f (exit $LASTEXITCODE)"
  }
}

Write-Host 'Migrations OK. Next: database/seeds/009 + 010 (see database/seeds/README.md)'
