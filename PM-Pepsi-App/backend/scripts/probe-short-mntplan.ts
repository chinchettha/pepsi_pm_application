import 'dotenv/config'
import { createPool } from '../src/db/pool.js'

const pool = createPool(process.env.DATABASE_URL!)

const shortPlans = ['345668', '364728', '357316', '366383']
for (const sp of shortPlans) {
  const r = await pool.query(
    `SELECT mntplan, tasklist, legacy FROM app.tbtasklist
     WHERE mntplan LIKE '%' || $1 OR legacy LIKE '%' || $1 LIMIT 3`,
    [sp],
  )
  console.log(sp, r.rows)
}

await pool.end()
