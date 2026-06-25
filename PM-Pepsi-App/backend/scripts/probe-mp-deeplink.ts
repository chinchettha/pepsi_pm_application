import 'dotenv/config'
import { createPool } from '../src/db/pool.js'
import { listIw37nItems } from '../src/services/iw37n.js'
import { searchMasterPlanRowsGlobal } from '../src/services/master-plan.js'

const pool = createPool(process.env.DATABASE_URL!)

for (const wo of ['4001570931', '4001570392']) {
  const rows = await listIw37nItems(pool, { q: wo, limit: 1 })
  console.log(wo, {
    mntplan: rows[0]?.mntplan,
    masterPlanMntplan: rows[0]?.masterPlanMntplan,
    masterPlanDiscipline: rows[0]?.masterPlanDiscipline,
  })
}

for (const q of ['366383', '610000004863']) {
  const res = await searchMasterPlanRowsGlobal(pool, q, 3)
  console.log('global', q, res.items.map((i) => ({
    discipline: i.discipline,
    maintenancePlan: i.maintenancePlan,
    matchScore: i.matchScore,
    label: i.label,
  })))
}

await pool.end()
