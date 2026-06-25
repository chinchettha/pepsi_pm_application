import 'dotenv/config'
import { createPool } from '../src/db/pool.js'
import { listIw37nItems } from '../src/services/iw37n.js'

const pool = createPool(process.env.DATABASE_URL!)

const sample = await listIw37nItems(pool, { limit: 5 })
console.log('sample linked', sample.map((r) => ({
  wkorder: r.wkorder,
  sapCode: r.sapCode,
  tasklist: r.tasklist,
  legacy: r.legacy,
  zone: r.zone,
  machineList: r.machineList,
  masterPlanLinked: r.masterPlanLinked,
})))

const wo = await listIw37nItems(pool, { q: '4001570392', limit: 1 })
console.log('4001570392', wo[0])

const all = await listIw37nItems(pool, { limit: 600 })
const linked = all.filter((r) => r.masterPlanLinked).length
console.log('api linked', linked, '/', all.length)

await pool.end()
