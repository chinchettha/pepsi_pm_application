import 'dotenv/config'
import { createPool } from '../src/db/pool.js'

const pool = createPool(process.env.DATABASE_URL!)

const master = await pool.query<{ c: number }>('SELECT COUNT(*)::int AS c FROM app.tbfunctional')
const iw37 = await pool.query<{ c: number }>(
  `SELECT COUNT(DISTINCT TRIM(functionalloc))::int AS c FROM app.tbiw37n WHERE TRIM(functionalloc) <> ''`,
)
const view = await pool.query<{ c: number }>(
  `SELECT COUNT(DISTINCT TRIM(functionalloc))::int AS c FROM app.view_order WHERE TRIM(functionalloc) <> ''`,
)
const masterSample = await pool.query(
  `SELECT functionalloc, funldescrip FROM app.tbfunctional ORDER BY functionalloc LIMIT 10`,
)
const iw37Sample = await pool.query(
  `SELECT DISTINCT TRIM(functionalloc) AS fl, TRIM(funcdescrip) AS d
   FROM app.tbiw37n WHERE TRIM(functionalloc) <> '' ORDER BY fl LIMIT 10`,
)
const exactMatch = await pool.query<{ c: number }>(
  `SELECT COUNT(*)::int AS c FROM app.view_order o
   WHERE TRIM(o.functionalloc) IN (SELECT functionalloc FROM app.tbfunctional)`,
)

console.log('tbfunctional rows:', master.rows[0]?.c)
console.log('iw37 distinct functionalloc:', iw37.rows[0]?.c)
console.log('view_order distinct functionalloc:', view.rows[0]?.c)
console.log('WO with exact master code match:', exactMatch.rows[0]?.c)
console.log('\nMaster (tbfunctional) sample:')
for (const r of masterSample.rows) console.log(' ', r.functionalloc, '→', r.funldescrip)
console.log('\nIW37N (tbiw37n) sample:')
for (const r of iw37Sample.rows) console.log(' ', r.fl, '→', r.d)

const conv = await pool.query(
  `SELECT TRIM(functionalloc) AS fl, TRIM(ostdescription) AS ost
   FROM app.tbiw37n
   WHERE ostdescription ILIKE '%7151-CONV%' OR functionalloc ILIKE '%CONV%'
   LIMIT 5`,
)
console.log('\nRows matching CONV:', conv.rows)

await pool.end()
