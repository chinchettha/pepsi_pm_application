# Export PostgreSQL database for install on another machine.
# Reads DATABASE_URL from PM-Pepsi-App/backend/.env (or env DATABASE_URL).
# Output: database/exports/pepsi_pm_<timestamp>.dump and .sql.gz
param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$OutDir = (Join-Path (Join-Path $PSScriptRoot '..') 'exports')
)

$ErrorActionPreference = 'Stop'

function Resolve-PgBin([string]$Name) {
    $fromEnv = [Environment]::GetEnvironmentVariable("PG_DUMP_PATH")
    if ($Name -eq 'psql') { $fromEnv = [Environment]::GetEnvironmentVariable("PSQL_PATH") }
    if ($fromEnv -and (Test-Path $fromEnv)) {
        if ($Name -eq 'pg_dump' -and $fromEnv -match 'pg_dump') { return $fromEnv }
        if ($Name -eq 'pg_restore' -and $fromEnv -match 'pg_restore') { return $fromEnv }
        if ($Name -eq 'psql' -and $fromEnv -match 'psql') { return $fromEnv }
    }
    $roots = @(
        'C:\Program Files\PostgreSQL',
        'C:\Program Files (x86)\PostgreSQL'
    )
    foreach ($root in $roots) {
        if (-not (Test-Path $root)) { continue }
        $verDirs = Get-ChildItem $root -Directory | Sort-Object Name -Descending
        foreach ($ver in $verDirs) {
            $bin = Join-Path (Join-Path $ver.FullName 'bin') "$Name.exe"
            if (Test-Path $bin) { return $bin }
        }
    }
    return "$Name.exe"
}

if (-not $DatabaseUrl) {
    $backendEnv = Join-Path (Join-Path (Join-Path $PSScriptRoot '..\..') 'PM-Pepsi-App') 'backend\.env'
    if (Test-Path $backendEnv) {
        Get-Content $backendEnv | ForEach-Object {
            if ($_ -match '^\s*DATABASE_URL=(.+)$') { $DatabaseUrl = $Matches[1].Trim() }
        }
    }
}

if (-not $DatabaseUrl) {
    throw 'Set DATABASE_URL or create PM-Pepsi-App/backend/.env with DATABASE_URL=postgresql://...'
}

$uri = [Uri]$DatabaseUrl
$dbName = $uri.AbsolutePath.TrimStart('/')
if (-not $dbName) { throw 'DATABASE_URL missing database name' }

$stamp = Get-Date -Format 'yyyyMMdd-HHmm'
$baseName = "${dbName}_${stamp}"
$dumpPath = Join-Path $OutDir "$baseName.dump"
$sqlGzPath = Join-Path $OutDir "$baseName.sql.gz"
$readmePath = Join-Path $OutDir 'RESTORE-README.txt'

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$pgDump = Resolve-PgBin 'pg_dump'
Write-Host "Using pg_dump: $pgDump"
Write-Host "Database: $dbName on $($uri.Host):$($uri.Port)"
Write-Host "Export dir: $OutDir"

$env:PGPASSWORD = [Uri]::UnescapeDataString($uri.UserInfo.Split(':')[1])

Write-Host "1/2 Custom format (.dump) ..."
& $pgDump $DatabaseUrl -Fc --no-owner --no-acl -f $dumpPath
if ($LASTEXITCODE -ne 0) { throw "pg_dump -Fc failed (exit $LASTEXITCODE)" }

Write-Host "2/2 Plain SQL gzip (.sql.gz) ..."
$plainSql = Join-Path $OutDir "$baseName.sql"
& $pgDump $DatabaseUrl --no-owner --no-acl -f $plainSql
if ($LASTEXITCODE -ne 0) { throw "pg_dump plain SQL failed (exit $LASTEXITCODE)" }

$gzip = Join-Path $OutDir "$baseName.sql.gz"
if (Get-Command gzip -ErrorAction SilentlyContinue) {
    gzip -f $plainSql
} else {
    $bytes = [System.IO.File]::ReadAllBytes($plainSql)
    $ms = New-Object System.IO.MemoryStream
    $gzipStream = New-Object System.IO.Compression.GZipStream($ms, [System.IO.Compression.CompressionMode]::Compress)
    $gzipStream.Write($bytes, 0, $bytes.Length)
    $gzipStream.Close()
    [System.IO.File]::WriteAllBytes($gzip, $ms.ToArray())
    Remove-Item $plainSql -Force
}

$dumpSize = (Get-Item $dumpPath).Length
$gzSize = (Get-Item $sqlGzPath).Length

@"
PM Pepsi App - Database export
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Source: $($uri.Host):$($uri.Port)/$dbName
User: $($uri.UserInfo.Split(':')[0])

Files in this folder:
  $baseName.dump   - PostgreSQL custom format (recommended restore)
  $baseName.sql.gz - plain SQL gzip (compatible with Admin Backup restore)

Restore on new machine (after CREATE DATABASE + schema app - see docs/SETUP-NEW-MACHINE.md section 4):

  Custom format (recommended):
  pg_restore -d "postgresql://USER:PASS@HOST:PORT/DATABASE" --no-owner --role=USER -c $baseName.dump

  Plain SQL gzip on Linux/macOS:
  gunzip -c $baseName.sql.gz | psql "postgresql://USER:PASS@HOST:PORT/DATABASE" -v ON_ERROR_STOP=1

After restore, if app code is newer than backup:
  powershell -File database/scripts/run-all-migrations.ps1

Backend .env on new machine:
  DATABASE_URL=postgresql://USER:PASS@HOST:PORT/DATABASE

Sizes: dump $([math]::Round($dumpSize/1MB, 2)) MB, sql.gz $([math]::Round($gzSize/1MB, 2)) MB
"@ | Set-Content -Path $readmePath -Encoding UTF8

Write-Host ""
Write-Host "Done."
Write-Host "  $dumpPath  ($([math]::Round($dumpSize/1MB, 2)) MB)"
Write-Host "  $sqlGzPath  ($([math]::Round($gzSize/1MB, 2)) MB)"
Write-Host "  $readmePath"
