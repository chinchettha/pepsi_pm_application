import 'dotenv/config'
import { createPool } from '../src/db/pool.js'
import { applyFillDownDisplay } from '../src/lib/master-plan-display.js'
import { extractMasterPlanLinkKeys } from '../src/lib/master-plan-row-links.js'

const pool = createPool(process.env.DATABASE_URL!)

for (const code of ['ST1-MC-ME', '345668', '610000004258']) {
  const r = await pool.query(
    `SELECT w.discipline, s.column_headers_json, r.cells_json
     FROM app.tb_master_plan_row r
     JOIN app.tb_master_plan_sheet s ON s.id = r.sheet_id
     JOIN app.tb_master_plan_workbook w ON w.id = s.workbook_id
     WHERE w.status = 'published' AND r.cells_json::text ILIKE $1
     LIMIT 3`,
    [`%${code}%`],
  )
  for (const row of r.rows) {
    const headers = row.column_headers_json ?? []
    const cells = row.cells_json ?? {}
    const display = applyFillDownDisplay([{ rowIndex: 0, cells }], headers)[0]?.display ?? cells
    const keys = extractMasterPlanLinkKeys(headers, cells, display)
    console.log('search', code, row.discipline, keys)
  }
}

await pool.end()
