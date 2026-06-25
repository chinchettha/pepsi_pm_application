import 'dotenv/config'
import { createPool } from '../src/db/pool.js'

const pool = createPool(process.env.DATABASE_URL!)
const mnt = '610000004496'

const tl = await pool.query('SELECT COUNT(*)::int AS n FROM app.tbtasklist WHERE TRIM(mntplan) = $1', [mnt])
const mp = await pool.query(
  `SELECT COUNT(*)::int AS n FROM app.tb_master_plan_row r
   JOIN app.tb_master_plan_sheet s ON s.id = r.sheet_id
   JOIN app.tb_master_plan_workbook w ON w.id = s.workbook_id
   WHERE w.status = 'published' AND r.cells_json::text ILIKE $1`,
  [`%${mnt}%`],
)
const iw = await pool.query(
  `SELECT COUNT(*)::int AS n FROM app.tbiw37n WHERE mntplan LIKE '61000000%'`,
)
const iwShort = await pool.query(
  `SELECT COUNT(*)::int AS n FROM app.tbiw37n WHERE LENGTH(TRIM(mntplan)) < 10`,
)
const sample = await pool.query(
  `SELECT mntplan, wkorder FROM app.tbiw37n ORDER BY idiw37 DESC LIMIT 5`,
)

console.log({ tasklist: tl.rows[0], masterPlanRows: mp.rows[0], iw37nLong: iw.rows[0], iw37nShort: iwShort.rows[0], sample: sample.rows })
await pool.end()
