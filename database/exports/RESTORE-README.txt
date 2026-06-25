PM Pepsi App โ€” Database export
Generated: 2026-06-25 13:06:05
Source: 127.0.0.1:5432/pepsi_pm
User: pepsipm

Files in this folder:
  pepsi_pm_20260625-1306.dump   โ€” PostgreSQL custom format (recommended restore)
  pepsi_pm_20260625-1306.sql.gz โ€” plain SQL gzip (compatible with Admin Backup restore)

Restore on new machine (after CREATE DATABASE + schema app โ€” see docs/SETUP-NEW-MACHINE.md ยง4):

  # Custom format (recommended)
  pg_restore -d "postgresql://USER:PASS@HOST:PORT/DATABASE" --no-owner --role=USER -c pepsi_pm_20260625-1306.dump

  # Plain SQL gzip (PowerShell)
  $env:PGPASSWORD='PASS'
  $gz = [System.IO.Compression.GZipStream]::new(
    [System.IO.File]::OpenRead('pepsi_pm_20260625-1306.sql.gz'),
    [System.IO.Compression.CompressionMode]::Decompress)
  $reader = New-Object System.IO.StreamReader($gz)
  $sql = $reader.ReadToEnd()
  $reader.Close(); $gz.Close()
  $sql | & psql "postgresql://USER:PASS@HOST:PORT/DATABASE" -v ON_ERROR_STOP=1

  # Or gunzip + psql on Linux/macOS:
  gunzip -c pepsi_pm_20260625-1306.sql.gz | psql "postgresql://..."

After restore, if app code is newer than backup:
  powershell -File database/scripts/run-all-migrations.ps1

Backend .env on new machine:
  DATABASE_URL=postgresql://USER:PASS@HOST:PORT/DATABASE

Sizes: dump 1.24 MB ยท sql.gz 1.08 MB
