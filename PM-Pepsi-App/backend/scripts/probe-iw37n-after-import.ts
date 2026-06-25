import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { createPool } from '../src/db/pool.js'
import { listIw37nItems } from '../src/services/iw37n.js'
import { parseIw37nFileWithMeta } from '../src/services/iw37n-parser.js'

const pool = createPool(process.env.DATABASE_URL!)
const xlsxPath = 'D:/pepsi-pm-app-main/docs from customer/Templete IW37N on PM App - ZB02All 1.xlsx'

const buf = readFileSync(xlsxPath)
const { rows: parsed } = parseIw37nFileWithMeta(buf, 't.xlsx')
console.log('parsed rows', parsed.length)

const count = await pool.query('SELECT COUNT(*)::int AS n FROM app.tbiw37n')
console.log('db rows', count.rows[0])

const sampleWo = ['4001570408', '4001570392', '4001570931']
for (const wo of sampleWo) {
  const p = parsed.find((r) => r.wkorder === wo)
  const api = (await listIw37nItems(pool, { q: wo, limit: 1 }))[0]
  console.log('\nWO', wo)
  console.log('excel', p ? {
    mntplan: p.mntplan,
    wktype: p.wktype,
    operationshorttext: p.operationshorttext?.slice(0, 40),
    ostdescription: p.ostdescription,
    wkctr: p.wkctr,
    equipment: p.equipment,
    equdescrip: p.equdescrip,
    functionalloc: p.functionalloc,
    funcdescrip: p.funcdescrip,
  } : 'NOT IN PARSE')
  console.log('api', api ? {
    mntplan: api.mntplan,
    sapCode: api.sapCode,
    tasklist: api.tasklist,
    legacy: api.legacy,
    zone: api.zone,
    machineMc: api.machineMc,
    pmlist: api.pmlist?.slice(0, 50),
    masterPlanLinked: api.masterPlanLinked,
    masterPlanDiscipline: api.masterPlanDiscipline,
    wkctr: api.wkctr,
    equipment: api.equipment,
    equdescrip: api.equdescrip,
    functionalloc: api.functionalloc,
    funcdescrip: api.funcdescrip,
  } : 'NOT IN DB')
}

const linked = (await listIw37nItems(pool, { limit: 600 })).filter((r) => r.masterPlanLinked).length
console.log('\nmasterPlanLinked', linked, '/ 522')

await pool.end()
