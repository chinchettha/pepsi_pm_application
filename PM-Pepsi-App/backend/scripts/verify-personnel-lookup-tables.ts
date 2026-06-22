/**
 * L0 dev DB check — migrations 011, 014, 019, 020, 021 + seed rows for personnel lookups.
 * Usage: npx tsx scripts/verify-personnel-lookup-tables.ts [--fix]
 */
import pg from 'pg'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const fix = process.argv.includes('--fix')
const here = path.dirname(fileURLToPath(import.meta.url))
const env = readFileSync(path.join(here, '../.env'), 'utf8')
const m = env.match(/^DATABASE_URL=(.+)$/m)
if (!m) {
  console.error('DATABASE_URL missing in backend/.env')
  process.exit(1)
}

const LOOKUP_TABLES = [
  { migration: '011', entity: 'department', table: 'app.tbdepartment' },
  { migration: '014', entity: 'worktype', table: 'app.tbwkctrtype' },
  { migration: '020', entity: 'position', table: 'app.tbposition' },
  { migration: '021', entity: 'group', table: 'app.tbwkctrgroup' },
  { migration: '019', entity: 'level', table: 'app.tbwklevel' },
] as const

const pool = new pg.Pool({ connectionString: m[1].trim() })

type Row = {
  migration: string
  entity: string
  table: string
  exists: boolean
  rows: number | null
  ok: boolean
}

try {
  if (fix) {
    await pool.query(`
      INSERT INTO app.tbwkctrgroup (wkctrgroup, wkctrdescription)
      VALUES ('GRP01', 'Group 01')
      ON CONFLICT (wkctrgroup) DO NOTHING
    `)
  }

  const results: Row[] = []
  for (const t of LOOKUP_TABLES) {
    const ex = await pool.query<{ exists: boolean }>(
      'SELECT to_regclass($1::text) IS NOT NULL AS exists',
      [t.table],
    )
    const exists = ex.rows[0]?.exists ?? false
    let rows: number | null = null
    if (exists) {
      const [schema, name] = t.table.split('.')
      const c = await pool.query<{ n: number }>(
        `SELECT COUNT(*)::int AS n FROM ${schema}.${name}`,
      )
      rows = c.rows[0]?.n ?? 0
    }
    results.push({
      migration: t.migration,
      entity: t.entity,
      table: t.table,
      exists,
      rows,
      ok: exists && (rows ?? 0) >= 1,
    })
  }

  const allOk = results.every((r) => r.ok)
  const maskUrl = m[1].trim().replace(/:([^:@/]+)@/, ':***@')
  console.log(JSON.stringify({ database: maskUrl, allOk, results }, null, 2))
  process.exit(allOk ? 0 : 1)
} catch (e) {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
} finally {
  await pool.end()
}
