import 'dotenv/config'
import { createPool } from '../src/db/pool.js'

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error('DATABASE_URL required')
  process.exit(1)
}

const pool = createPool(databaseUrl)
try {
  const roles = await pool.query<{ userst: string; userrole: string; n: number }>(
    `SELECT userst, userrole, count(*)::int AS n FROM app.tbworkcenter GROUP BY 1,2 ORDER BY 1,2`,
  )
  const perms = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM app.tbl_role_permission WHERE role_code='U' AND granted=true`,
  )
  const admin = await pool.query<{ idwkctr: string; userst: string; userrole: string }>(
    `SELECT idwkctr, userst, userrole FROM app.tbworkcenter WHERE idwkctr='ADMIN01'`,
  )
  console.log('Users by role:', roles.rows)
  console.log('Planner (U) permissions:', perms.rows[0]?.n ?? 0)
  console.log('ADMIN01:', admin.rows[0] ?? '(not found)')
} finally {
  await pool.end()
}
