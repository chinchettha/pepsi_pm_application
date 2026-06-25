import 'dotenv/config'
import { createPool } from '../src/db/pool.js'
import {
  loadIw37nEnrichmentContext,
  resolveIw37nMasterPlanEnrichment,
} from '../src/lib/iw37n-master-plan-enrich.js'

const pool = createPool(process.env.DATABASE_URL!)

const { rows } = await pool.query<{
  mntplan: string
  operationshorttext: string
  ostdescription: string
  equipment: string
  equdescrip: string
  functionalloc: string
}>(`
  SELECT
    TRIM(mntplan) AS mntplan,
    TRIM(operationshorttext) AS operationshorttext,
    TRIM(ostdescription) AS ostdescription,
    TRIM(equipment) AS equipment,
    TRIM(equdescrip) AS equdescrip,
    TRIM(functionalloc) AS functionalloc
  FROM app.tbiw37n
`)

const inputs = rows.map((r) => ({
  mntplan: r.mntplan ?? '',
  operationshorttext: r.operationshorttext ?? '',
  ostdescription: r.ostdescription ?? '',
  equipment: r.equipment ?? '',
  equdescrip: r.equdescrip ?? '',
  functionalloc: r.functionalloc ?? '',
}))

const ctx = await loadIw37nEnrichmentContext(pool, inputs)

let linked = 0
let tasklist = 0
let pmlist = 0
let zone = 0
let machineList = 0
const bySource = { tasklist: 0, master_plan: 0, none: 0 }

for (const input of inputs) {
  const out = resolveIw37nMasterPlanEnrichment(input, ctx)
  if (out.linked) linked++
  if (out.tasklist) tasklist++
  if (out.pmlist) pmlist++
  if (out.zone) zone++
  if (out.machineList) machineList++
  bySource[out.source]++
}

console.log('enrichment v2 stats', {
  total: inputs.length,
  linked,
  tasklist,
  pmlist,
  zone,
  machineList,
  bySource,
})

const unlinked = inputs
  .map((input) => ({ input, out: resolveIw37nMasterPlanEnrichment(input, ctx) }))
  .filter(({ out }) => !out.linked)
  .slice(0, 8)

console.log(
  'unlinked sample',
  unlinked.map(({ input, out }) => ({
    mntplan: input.mntplan,
    ostdescription: input.ostdescription,
    source: out.source,
  })),
)

await pool.end()
