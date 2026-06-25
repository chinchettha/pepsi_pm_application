import 'dotenv/config'
import { createPool } from '../src/db/pool.js'
import { searchMasterPlanRowsGlobal, searchMasterPlanRows } from '../src/services/master-plan.js'

const pool = createPool(process.env.DATABASE_URL!)
const q = process.argv[2] ?? '364726'

const global = await searchMasterPlanRowsGlobal(pool, q, 5)
const me = await searchMasterPlanRows(pool, 'ME', q, 5)
console.log('q=', q)
console.log('global', global.items.length, global.items[0])
console.log('ME', me.items.length, me.items[0])

await pool.end()
