import 'dotenv/config'
import { createPool } from '../src/db/pool.js'
import { applyFillDownDisplay } from '../src/lib/master-plan-display.js'
import { extractMasterPlanLinkKeys } from '../src/lib/master-plan-row-links.js'

const pool = createPool(process.env.DATABASE_URL!)

const codes = ['366383', '610000004863', '61000000366383', '366350', '345668']

for (const code of codes) {
  const r = await pool.query<{
    discipline: string
    column_headers_json: string[]
    cells_json: Record<string, string>
  }>(
    `SELECT w.discipline, s.column_headers_json, r.cells_json
     FROM app.tb_master_plan_row r
     JOIN app.tb_master_plan_sheet s ON s.id = r.sheet_id
     JOIN app.tb_master_plan_workbook w ON w.id = s.workbook_id
     WHERE w.status = 'published' AND s.sheet_kind = 'detail'
       AND r.cells_json::text ILIKE $1
     LIMIT 2`,
    [`%${code}%`],
  )
  for (const row of r.rows) {
    const headers = row.column_headers_json ?? []
    const cells = row.cells_json ?? {}
    const display = applyFillDownDisplay([{ rowIndex: 0, cells }], headers)[0]?.display ?? cells
    const keys = extractMasterPlanLinkKeys(headers, cells, display)
    console.log(code, row.discipline, keys.mntplan, keys.tasklist, keys.legacy)
  }
}

const iw = await pool.query(
  `SELECT mntplan, wkorder FROM app.tbiw37n WHERE mntplan IN ('366383','610000004863') LIMIT 4`,
)
console.log('iw37n', iw.rows)

await pool.end()
