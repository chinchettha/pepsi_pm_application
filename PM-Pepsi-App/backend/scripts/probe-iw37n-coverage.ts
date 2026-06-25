import 'dotenv/config'
import { createPool } from '../src/db/pool.js'
import {
  loadIw37nEnrichmentContext,
  parseIw37nOstDescription,
  resolveIw37nMasterPlanEnrichment,
} from '../src/lib/iw37n-master-plan-enrich.js'

const pool = createPool(process.env.DATABASE_URL!)

const { rows } = await pool.query(`
  SELECT TRIM(mntplan) AS mntplan, TRIM(operationshorttext) AS operationshorttext,
         TRIM(ostdescription) AS ostdescription, TRIM(equipment) AS equipment,
         TRIM(equdescrip) AS equdescrip, TRIM(functionalloc) AS functionalloc
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
let hasTasklist = 0
let hasLegacyFromOst = 0
let hasZone = 0

for (const input of inputs) {
  const out = resolveIw37nMasterPlanEnrichment(input, ctx)
  const ost = parseIw37nOstDescription(input.ostdescription)
  if (out.linked) linked++
  if (out.tasklist) hasTasklist++
  if (out.legacy || ost.legacy) hasLegacyFromOst++
  if (out.zone) hasZone++
}

console.log({
  total: inputs.length,
  linked,
  hasTasklist,
  hasLegacyFromOst,
  hasZone,
  tasklistRows: (await pool.query('SELECT COUNT(*)::int AS n FROM app.tbtasklist')).rows[0],
  mpPublished: (
    await pool.query(
      `SELECT COUNT(*)::int AS n FROM app.tb_master_plan_row r
       JOIN app.tb_master_plan_workbook w ON w.id = (SELECT workbook_id FROM app.tb_master_plan_sheet WHERE id = r.sheet_id)
       WHERE w.status = 'published'`,
    )
  ).rows[0],
})

await pool.end()
