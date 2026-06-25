import 'dotenv/config'
import { createPool } from '../src/db/pool.js'

const pool = createPool(process.env.DATABASE_URL!)

const r = await pool.query(
  `SELECT tl.mntplan, tl.tasklist, tl.legacy, tl.idzone, tl.pmlist, tl.pmday
   FROM app.tbtasklist tl
   WHERE tl.mntplan = '366383' OR tl.pmlist ILIKE '%BAG MAKER%' OR tl.machine ILIKE '%BAG%'
   LIMIT 5`,
)
console.log('tasklist', r.rows)

const mp = await pool.query(
  `SELECT r.cells_json
   FROM app.tb_master_plan_row r
   JOIN app.tb_master_plan_sheet s ON s.id = r.sheet_id
   JOIN app.tb_master_plan_workbook w ON w.id = s.workbook_id
   WHERE w.status = 'published' AND r.cells_json::text ILIKE '%366383%'
   LIMIT 3`,
)
console.log('mp 366383 count', mp.rows.length)

const desc = await pool.query(
  `SELECT mntplan, wkorder, ostdescription, operationshorttext FROM app.tbiw37n WHERE wkorder = '4001570931'`,
)
console.log('iw row', desc.rows[0])

for (const q of ['366383', 'PK5-YR-ME', '610000004496', '610000004863']) {
  const r = await pool.query(
    `SELECT mntplan, tasklist, legacy, idzone, machine, LEFT(pmlist,40) pmlist, pmday
     FROM app.tbtasklist WHERE TRIM(mntplan) = $1 OR TRIM(legacy) = $1 LIMIT 3`,
    [q],
  )
  console.log(q, r.rows)
}

await pool.end()
