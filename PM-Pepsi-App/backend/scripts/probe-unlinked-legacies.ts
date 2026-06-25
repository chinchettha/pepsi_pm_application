import 'dotenv/config'
import { createPool } from '../src/db/pool.js'

const pool = createPool(process.env.DATABASE_URL!)

for (const leg of ['ST1-MC-ME', 'SL-MI-EE7', '345668', '357316']) {
  const r = await pool.query(
    `SELECT mntplan, tasklist, legacy FROM app.tbtasklist
     WHERE legacy = $1 OR TRIM(mntplan) = $1 LIMIT 5`,
    [leg],
  )
  console.log('tasklist', leg, r.rows)
}

const iw = await pool.query(
  `SELECT mntplan, ostdescription FROM app.tbiw37n WHERE ostdescription LIKE '%ST1-MC-ME%' LIMIT 3`,
)
console.log('iw37n ST1', iw.rows)

const mpCount = await pool.query(
  `SELECT COUNT(*)::int AS n FROM app.tb_master_plan_row r
   INNER JOIN app.tb_master_plan_sheet s ON s.id = r.sheet_id
   INNER JOIN app.tb_master_plan_workbook w ON w.id = s.workbook_id
   WHERE w.status = 'published' AND r.cells_json::text ILIKE '%ST1-MC-ME%'`,
)
console.log('mp ST1 rows', mpCount.rows[0])

await pool.end()
