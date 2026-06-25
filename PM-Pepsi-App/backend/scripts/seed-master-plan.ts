/**
 * Seed Master Plan workbooks (EE / ME / PK) from customer Excel files.
 * Usage: npm run seed:master-plan
 */
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Request } from 'express'
import { createPool } from '../src/db/pool.js'
import {
  MASTER_PLAN_FILES,
  parseMasterPlanWorkbook,
  type MasterPlanDiscipline,
} from '../src/lib/master-plan-parse.js'
import { publishMasterPlanToTasklist, seedMasterPlanWorkbook } from '../src/services/master-plan.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../../..')
const customerDir = path.join(repoRoot, 'docs from customer')

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error('DATABASE_URL required')
  process.exit(1)
}

const cliReq = {
  headers: {},
  ip: '127.0.0.1',
  socket: { remoteAddress: '127.0.0.1' },
} as Request

const pool = createPool(databaseUrl)
const disciplines: MasterPlanDiscipline[] = ['EE', 'ME', 'PK']

try {
  for (const discipline of disciplines) {
    const filename = MASTER_PLAN_FILES[discipline]
    const filePath = path.join(customerDir, filename)
    const buf = await readFile(filePath)
    const parsed = parseMasterPlanWorkbook(buf, discipline, filename)
    const result = await seedMasterPlanWorkbook(pool, parsed, 'seed-script')
    const pub = await publishMasterPlanToTasklist(pool, discipline, 'seed-script', cliReq)
    console.log(
      `[OK] ${discipline}: ${parsed.sheets.length} sheets, ${result.rowCount} rows (workbook #${result.workbookId})` +
        (pub.ok
          ? ` → tasklist +${pub.tasklist.inserted} ~${pub.tasklist.updated}`
          : ` → publish failed: ${pub.message}`),
    )
  }
} finally {
  await pool.end()
}
