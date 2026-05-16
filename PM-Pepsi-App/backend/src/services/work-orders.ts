import type { Pool } from 'pg'
import type { z } from 'zod'
import type { workOrderListItemSchema } from '../schemas/work-orders.js'
import { FACTORY_CODE } from './scheduling-shared.js'
import { formatUnixDate } from './scheduling-move.js'

type WorkOrderListItem = z.infer<typeof workOrderListItemSchema>

type Iw37Row = {
  idiw37: number
  wkorder: string
  wktype: string | null
  equipment: string | null
  equdescrip: string | null
  functionalloc: string | null
  untime: string | number | null
  syst: string | null
  bscstart: string | number | null
  actfinish: string | number | null
  systemstatus: string | null
  wkctr: string | null
  operationshorttext: string | null
  ostdescription: string | null
  opac: string | null
  work: string | number | null
}

function unixToIsoDate(sec: string | number | null): string {
  if (sec == null || sec === '') return ''
  const n = Number(sec)
  if (!Number.isFinite(n) || n <= 0) return ''
  return unixToDateString(n)
}

function unixToDateString(sec: number): string {
  const d = new Date(sec * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function mapRow(row: Iw37Row): WorkOrderListItem {
  const title =
    row.operationshorttext?.trim() || row.ostdescription?.trim() || row.wkorder
  return {
    id: String(row.idiw37),
    title,
    orderType: row.wktype?.trim() ?? '',
    equipment: row.equdescrip?.trim() || row.equipment?.trim() || '',
    functLoc: row.functionalloc?.trim() ?? '',
    priority: row.untime != null && row.untime !== '' ? String(row.untime) : '',
    status: row.syst?.trim() ?? '',
    basicStart: unixToIsoDate(row.bscstart),
    basicFinish: unixToIsoDate(row.actfinish),
    plant: FACTORY_CODE,
    workCenter: row.wkctr?.trim() ?? '',
    systemStatus: row.systemstatus?.trim() ?? row.syst?.trim() ?? '',
    userStatus: '',
    description: row.ostdescription?.trim() || row.operationshorttext?.trim() || '',
  }
}

const SELECT_IW37 = `
  SELECT idiw37, wkorder, wktype, equipment, equdescrip, functionalloc, untime,
         syst, bscstart, actfinish, systemstatus, wkctr, operationshorttext,
         ostdescription, opac, work
  FROM app.tbiw37n
`

export async function listWorkOrders(
  pool: Pool,
  opts?: { q?: string; status?: string },
): Promise<WorkOrderListItem[]> {
  const params: unknown[] = [`%${FACTORY_CODE}%`]
  let sql = `${SELECT_IW37} WHERE functionalloc LIKE $1`
  if (opts?.status) {
    params.push(opts.status)
    sql += ` AND syst = $${params.length}`
  }
  if (opts?.q?.trim()) {
    params.push(`%${opts.q.trim()}%`)
    const i = params.length
    sql += ` AND (wkorder ILIKE $${i} OR operationshorttext ILIKE $${i} OR equdescrip ILIKE $${i})`
  }
  sql += ` ORDER BY bscstart DESC NULLS LAST LIMIT 500`

  const r = await pool.query<Iw37Row>(sql, params)
  return r.rows.map(mapRow)
}

type ViewOrderRow = Iw37Row & {
  wkorder: string
  team: string | null
  mat: string | null
  cday: string | number | null
  wkstcolor: string | null
  mpcount: number | null
  reasoncode: string | null
  reasonname: string | null
  mwkctr: string | null
  resoncom: string | null
}

export async function getWorkOrderById(
  pool: Pool,
  id: string,
): Promise<WorkOrderListItem | null> {
  const detail = await getWorkOrderViewRow(pool, id)
  if (!detail) return null
  return mapRow(detail)
}

async function getWorkOrderViewRow(
  pool: Pool,
  id: string,
): Promise<ViewOrderRow | null> {
  const r = await pool.query<ViewOrderRow>(
    `SELECT i.idiw37, i.wkorder, i.wktype, i.equipment, i.equdescrip, i.functionalloc, i.untime,
            i.syst, i.bscstart, i.actfinish, i.systemstatus, i.wkctr, i.operationshorttext,
            i.ostdescription, i.opac, i.work, i.team, i.mat,
            v.cday, v.wkstcolor,
            mp.mpcount, mp.reasoncode, mp.mwkctr, mp.resoncom,
            r.reasonname
     FROM app.tbiw37n i
     JOIN app.view_order v ON v.idiw37 = i.idiw37
     LEFT JOIN app.tbmoveplan mp ON mp.idiw37 = i.idiw37
     LEFT JOIN app.tbreason r ON r.reasoncode = mp.reasoncode
     WHERE (i.idiw37::text = $1 OR i.wkorder = $1)
       AND i.functionalloc LIKE $2
     LIMIT 1`,
    [id, `%${FACTORY_CODE}%`],
  )
  return r.rows[0] ?? null
}

export async function enrichWorkOrderDetail(pool: Pool, id: string) {
  const row = await getWorkOrderViewRow(pool, id)
  if (!row) return null
  const item = mapRow(row)
  const syst = (row.syst ?? '').trim()
  const canMovePlan = syst === 'CRTD' || syst === 'REL'
  const cday = row.cday != null && row.cday !== '' ? Number(row.cday) : 0

  const movePlan =
    cday > 0 && row.mpcount != null
      ? {
          movedDate: formatUnixDate(row.cday),
          moveCount: row.mpcount,
          reasonCode: row.reasoncode?.trim() ?? '',
          reasonName: row.reasonname?.trim() ?? row.reasoncode?.trim() ?? '',
          movedByWkctr: row.mwkctr?.trim() ?? '',
          comment: row.resoncom?.trim() ?? '',
        }
      : null

  return {
    ...item,
    wkorder: row.wkorder,
    team: row.team?.trim() ?? '',
    mat: row.mat?.trim() ?? '',
    plannedDate: unixToIsoDate(row.bscstart),
    finishDate: unixToIsoDate(row.actfinish),
    statusColor: row.wkstcolor?.trim() ?? '#6b7280',
    canMovePlan,
    movePlan,
    operations: [
      {
        no: item.orderType ? '0010' : '—',
        desc: item.title,
        wc: item.workCenter,
        hours: Number(item.priority) || 0,
      },
    ],
    components: [] as { material: string; qty: number; unit: string }[],
  }
}
