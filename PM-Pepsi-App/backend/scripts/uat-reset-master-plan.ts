/**
 * ล้าง Master Plan ทั้งหมด (workbooks / sheets / rows / changelog) — เตรียมทดสอบ import ใหม่
 * Usage:
 *   npm run uat:reset-master-plan
 *   npm run uat:reset-master-plan -- --with-tasklist
 */
import 'dotenv/config'
import { createPool } from '../src/db/pool.js'

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error('DATABASE_URL required')
  process.exit(1)
}

const withTasklist = process.argv.includes('--with-tasklist')
const pool = createPool(databaseUrl)

try {
  const before = await pool.query<{
    workbooks: number
    sheets: number
    rows: number
    changes: number
    tasklist: number
  }>(
    `SELECT
       (SELECT COUNT(*)::int FROM app.tb_master_plan_workbook) AS workbooks,
       (SELECT COUNT(*)::int FROM app.tb_master_plan_sheet) AS sheets,
       (SELECT COUNT(*)::int FROM app.tb_master_plan_row) AS rows,
       (SELECT COUNT(*)::int FROM app.tb_master_plan_change) AS changes,
       (SELECT COUNT(*)::int FROM app.tbtasklist) AS tasklist`,
  )
  const b = before.rows[0]
  console.log(
    `Before: workbooks=${b?.workbooks ?? 0}, sheets=${b?.sheets ?? 0}, rows=${b?.rows ?? 0}, changes=${b?.changes ?? 0}, tasklist=${b?.tasklist ?? 0}`,
  )

  console.log('Deleting Master Plan data…')
  await pool.query('DELETE FROM app.tb_master_plan_workbook')

  if (withTasklist) {
    console.log('Deleting tbtasklist (published from Master Plan)…')
    await pool.query('DELETE FROM app.tbtasklist')
  }

  const after = await pool.query<{
    workbooks: number
    rows: number
    tasklist: number
  }>(
    `SELECT
       (SELECT COUNT(*)::int FROM app.tb_master_plan_workbook) AS workbooks,
       (SELECT COUNT(*)::int FROM app.tb_master_plan_row) AS rows,
       (SELECT COUNT(*)::int FROM app.tbtasklist) AS tasklist`,
  )
  const a = after.rows[0]
  console.log(
    `Done. workbooks=${a?.workbooks ?? 0}, rows=${a?.rows ?? 0}, tasklist=${a?.tasklist ?? 0}`,
  )
  console.log('Next: /master-plan → Import EE / ME / PK workbook, then Publish to tasklist if needed.')
} finally {
  await pool.end()
}
