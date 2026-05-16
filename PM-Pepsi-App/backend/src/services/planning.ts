import type { Pool } from 'pg'
import type { z } from 'zod'
import type { planningItemSchema } from '../schemas/planning.js'

type PlanningItem = z.infer<typeof planningItemSchema>

type PlanRow = {
  idiw37: number
  wkorder: string
  wktype: string | null
  operationshorttext: string | null
  functionalloc: string | null
  equdescrip: string | null
  bscstart: string | number | null
  syst: string | null
  idplanw: number | null
  wkctrpw: string | null
  pwteam: string | null
  idwkctr: string | null
  cday: string | number | null
}

function unixToMonth(sec: number | null): string {
  if (sec == null || sec <= 0) return '—'
  const d = new Date(sec * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function unixToIsoDate(sec: string | number | null): string {
  if (sec == null || sec === '') return ''
  const n = Number(sec)
  if (!Number.isFinite(n) || n <= 0) return ''
  const d = new Date(n * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function mapRow(row: PlanRow): PlanningItem {
  const bsc = row.bscstart != null ? Number(row.bscstart) : null
  const cday = row.cday != null && row.cday !== '' ? Number(row.cday) : null
  const hasPlan = row.idplanw != null
  const syst = (row.syst ?? '').trim()
  let status: PlanningItem['status'] = 'OPEN'
  if (hasPlan) status = 'CONF'
  if (syst && !['CRTD', 'REL'].includes(syst)) status = 'CLOS'

  const title = row.operationshorttext?.trim() || row.wkorder
  const owner =
    row.wkctrpw?.trim() ||
    row.pwteam?.trim() ||
    ''

  return {
    id: String(row.idiw37),
    planName: `${row.wkorder} — ${title}`,
    line: row.functionalloc?.trim() || row.equdescrip?.trim() || '—',
    month: unixToMonth(bsc),
    status,
    owner,
    wkorder: row.wkorder,
    wktype: row.wktype?.trim() ?? '',
    planDate: unixToIsoDate(row.bscstart),
    movedDate: cday ? unixToIsoDate(cday) : undefined,
  }
}

export async function listPlanningForUser(
  pool: Pool,
  idwkctr: string,
): Promise<PlanningItem[]> {
  const r = await pool.query<PlanRow>(
    `SELECT idiw37, wkorder, wktype, operationshorttext, functionalloc, equdescrip,
            bscstart, syst, idplanw, wkctrpw, pwteam, idwkctr, cday
     FROM app.view_planwork
     WHERE idwkctr = $1 AND syst IN ('CRTD', 'REL')
     ORDER BY bscstart DESC NULLS LAST
     LIMIT 500`,
    [idwkctr],
  )
  return r.rows.map(mapRow)
}
