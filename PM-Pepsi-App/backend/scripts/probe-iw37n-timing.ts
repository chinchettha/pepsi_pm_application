import 'dotenv/config'
import { createPool } from '../src/db/pool.js'
import { listIw37nItems } from '../src/services/iw37n.js'

const pool = createPool(process.env.DATABASE_URL!)

const cases: Array<[string, string | undefined]> = [
  ['search-mntplan', '342596'],
  ['search-mntplan-warm', '342596'],
  ['search-wo', '4001560529'],
  ['no-q', undefined],
]

for (const [label, q] of cases) {
  const t0 = performance.now()
  const rows = await listIw37nItems(pool, { q, limit: 100 })
  console.log(label, `${Math.round(performance.now() - t0)}ms`, `rows=${rows.length}`)
}

await pool.end()
