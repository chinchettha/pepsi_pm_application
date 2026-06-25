import 'dotenv/config'
import { createPool } from '../src/db/pool.js'
import { listIw37nItems } from '../src/services/iw37n.js'

const pool = createPool(process.env.DATABASE_URL!)

const q = process.argv[2] ?? '342596'
const rows = await pool.query<{ mntplan: string; ostdescription: string; wkorder: string }>(
  `SELECT TRIM(mntplan) AS mntplan, TRIM(ostdescription) AS ostdescription, wkorder
   FROM app.tbiw37n
   WHERE TRIM(ostdescription) ILIKE $1 OR TRIM(mntplan) = $2
   LIMIT 5`,
  [`%${q}%`, q],
)
console.log('db sample for q=', q, rows.rows)

const items = await listIw37nItems(pool, { q, limit: 5 })
console.log('listIw37nItems count=', items.length, items.map((r) => ({ wk: r.wkorder, mnt: r.mntplan, ost: r.ostdescription })))

await pool.end()
