/**
 * Run SQL migrations from a given number upward (inclusive).
 * Usage: npx tsx scripts/run-migrations-from.ts 36
 */
import 'dotenv/config'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createPool } from '../src/db/pool.js'
import { resolveMigrationsDir } from '../src/services/admin-health.js'

const startNum = Number(process.argv[2] ?? '1')
const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error('DATABASE_URL required')
  process.exit(1)
}
if (!Number.isFinite(startNum)) {
  console.error('Usage: npx tsx scripts/run-migrations-from.ts <startNumber>')
  process.exit(1)
}

const dir = resolveMigrationsDir()
if (!dir) {
  console.error('migrations dir not found')
  process.exit(1)
}

const all = (await readdir(dir))
  .filter((f) => f.endsWith('.sql'))
  .map((f) => {
    const m = /^(\d{3})_/.exec(f)
    return m ? { num: Number(m[1]), file: f } : null
  })
  .filter((x): x is { num: number; file: string } => x != null)
  .filter((x) => x.num >= startNum)
  .sort((a, b) => a.num - b.num)

const pool = createPool(databaseUrl)
try {
  if (startNum <= 36) {
    await pool.query('DROP VIEW IF EXISTS app.view_countpersonelclose CASCADE')
    console.log('Dropped app.view_countpersonelclose (if existed)')
  }

  for (const { num, file } of all) {
    const full = path.join(dir, file)
    const sql = await readFile(full, 'utf8')
    process.stdout.write(`-> ${file} ... `)
    const viewNames = [
      ...sql.matchAll(/CREATE\s+OR\s+REPLACE\s+VIEW\s+app\.(\w+)/gi),
    ].map((m) => m[1])
    for (const view of viewNames) {
      await pool.query(`DROP VIEW IF EXISTS app.${view} CASCADE`)
    }
    try {
      await pool.query(sql)
      console.log('OK')
    } catch (err) {
      console.log('FAILED')
      console.error(err instanceof Error ? err.message : err)
      process.exit(1)
    }
  }
  console.log(`\nApplied ${all.length} migration(s) from ${String(startNum).padStart(3, '0')}.`)
} finally {
  await pool.end().catch(() => {})
}
