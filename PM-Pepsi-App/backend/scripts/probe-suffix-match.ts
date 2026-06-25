import 'dotenv/config'
import { createPool } from '../src/db/pool.js'
import {
  loadIw37nEnrichmentContext,
  parseIw37nOstDescription,
  resolveIw37nMasterPlanEnrichment,
} from '../src/lib/iw37n-master-plan-enrich.js'

const pool = createPool(process.env.DATABASE_URL!)

const { rows: iwRows } = await pool.query(`SELECT TRIM(mntplan) AS mntplan, TRIM(ostdescription) AS ostdescription,
  TRIM(operationshorttext) AS operationshorttext, TRIM(equipment) AS equipment,
  TRIM(equdescrip) AS equdescrip, TRIM(functionalloc) AS functionalloc FROM app.tbiw37n`)

const inputs = iwRows.map((r) => ({
  mntplan: r.mntplan ?? '',
  operationshorttext: r.operationshorttext ?? '',
  ostdescription: r.ostdescription ?? '',
  equipment: r.equipment ?? '',
  equdescrip: r.equdescrip ?? '',
  functionalloc: r.functionalloc ?? '',
}))

const ctx = await loadIw37nEnrichmentContext(pool, inputs)

const unlinked = inputs.filter((input) => !resolveIw37nMasterPlanEnrichment(input, ctx).linked)

let suffixHits = 0
for (const input of unlinked) {
  const mnt = input.mntplan.trim()
  if (!/^\d{5,8}$/.test(mnt)) continue
  const r = await pool.query(
    `SELECT mntplan, tasklist, legacy FROM app.tbtasklist WHERE mntplan LIKE '%' || $1 LIMIT 1`,
    [mnt],
  )
  if (r.rows.length > 0) {
    suffixHits++
    if (suffixHits <= 5) console.log('suffix match', mnt, r.rows[0])
  }
}

console.log({ unlinked: unlinked.length, suffixHits })

await pool.end()
