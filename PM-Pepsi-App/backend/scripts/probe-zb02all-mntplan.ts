import { readFileSync } from 'node:fs'
import { parseIw37nFileWithMeta } from '../src/services/iw37n-parser.js'

const buf = readFileSync(
  'd:/pepsi-pm-app-main/docs from customer/Templete IW37N on PM App - ZB02All 1.xlsx',
)
const { rows } = parseIw37nFileWithMeta(buf, 't.xlsx')
for (const wo of ['4001570931', '4001570392', '4001570437']) {
  const r = rows.find((x) => x.wkorder === wo)
  console.log(wo, r?.mntplan, r?.operationshorttext?.slice(0, 50))
}
console.log('unique mnt lengths', [...new Set(rows.map((r) => r.mntplan.length))])
console.log('sample mnt', rows.slice(0, 3).map((r) => r.mntplan))
