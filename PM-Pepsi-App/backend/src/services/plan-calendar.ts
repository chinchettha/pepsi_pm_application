import type { Pool } from 'pg'
import { resolveWoPmPhase } from '../lib/wo-pm-phase.js'
import {
  getMoveOverColor,
  isPlanMovableStatus,
  monthRangeSec,
  unixToDateString,
  type CalendarEvent,
} from './scheduling-shared.js'
import { loadWorkflowSuffixMap } from './work-order-workflow.js'

type PlanWorkRow = {
  idiw37: number
  wkorder: string
  wktype: string | null
  bscstart: string | number | null
  cday: string | number | null
  syst: string | null
  operationshorttext: string | null
  wkstcolor: string | null
}

/** วันที่แสดงบนปฏิทิน — เทียบ `M_plan_calendar.php` (cday ถ้าย้ายแผน ไม่งั้น bscstart) */
function pickPlanDisplayUnix(row: PlanWorkRow): number | null {
  const cday = row.cday != null && row.cday !== '' ? Number(row.cday) : null
  if (cday != null && cday > 0) return cday
  const bscstart =
    row.bscstart != null && row.bscstart !== '' ? Number(row.bscstart) : null
  if (bscstart != null && bscstart > 0) return bscstart
  return null
}

/** ย้ายข้ามเดือน — เทียบ `$MoveMc1 <> $MoveMc2` ใน `M_plan_calendar.php` */
function isCrossMonthMove(row: PlanWorkRow): boolean {
  const cday = row.cday != null && row.cday !== '' ? Number(row.cday) : null
  const bscstart =
    row.bscstart != null && row.bscstart !== '' ? Number(row.bscstart) : null
  if (cday == null || cday <= 0 || bscstart == null || bscstart <= 0) return false
  const syst = (row.syst ?? '').trim()
  if (syst !== 'REL' && syst !== 'CRTD') return false
  const d1 = new Date(cday * 1000)
  const d2 = new Date(bscstart * 1000)
  return (
    d1.getMonth() !== d2.getMonth() || d1.getFullYear() !== d2.getFullYear()
  )
}

export function mapPlanWorkRowToEvent(
  row: PlanWorkRow,
  moveColor: string,
): CalendarEvent | null {
  const bscstart =
    row.bscstart != null && row.bscstart !== '' ? Number(row.bscstart) : null
  if (bscstart == null || !Number.isFinite(bscstart) || bscstart <= 0) {
    return null
  }

  const displayUnix = pickPlanDisplayUnix(row)
  if (displayUnix == null) return null

  const syst = (row.syst ?? '').trim()
  const color =
    isCrossMonthMove(row) && (syst === 'REL' || syst === 'CRTD')
      ? moveColor
      : (row.wkstcolor ?? '#6b7280')

  const wktype = row.wktype?.trim() ?? ''
  const title = wktype ? `${row.wkorder} / ${wktype}` : row.wkorder

  return {
    id: String(row.idiw37),
    date: unixToDateString(displayUnix),
    title,
    orderId: row.wkorder,
    color,
    description: row.operationshorttext?.trim() || undefined,
    canMovePlan: isPlanMovableStatus(syst),
    syst,
    pmPhase: resolveWoPmPhase(syst),
  }
}

/**
 * ปฏิทินจ่ายงานช่าง — เทียบ `M_plan_calendar.php`
 * `view_planwork` กรอง `idwkctr` = session, สถานะเปิด CRTD/REL
 */
export async function listPlanCalendarEvents(
  pool: Pool,
  idwkctr: string,
  year: number,
  month: number,
): Promise<CalendarEvent[]> {
  const { startSec, endSec, prefix } = monthRangeSec(year, month)
  const moveColor = await getMoveOverColor(pool)

  const r = await pool.query<PlanWorkRow>(
    `SELECT idiw37, wkorder, wktype, bscstart, cday, syst, operationshorttext, wkstcolor
     FROM app.view_planwork
     WHERE idwkctr = $1
       AND syst IN ('CRTD', 'REL')
       AND bscstart IS NOT NULL
       AND bscstart > 0
       AND COALESCE(NULLIF(cday, 0), bscstart) >= $2
       AND COALESCE(NULLIF(cday, 0), bscstart) < $3
     ORDER BY bscstart DESC
     LIMIT 500`,
    [idwkctr, startSec, endSec],
  )

  const items: CalendarEvent[] = []
  for (const row of r.rows) {
    const ev = mapPlanWorkRowToEvent(row, moveColor)
    if (ev && ev.date.startsWith(prefix)) items.push(ev)
  }
  const suffixMap = await loadWorkflowSuffixMap(
    pool,
    items.map((e) => Number(e.id)).filter((n) => Number.isFinite(n)),
  )
  return items.map((ev) => {
    const suffix = suffixMap.get(Number(ev.id))
    if (!suffix) return ev
    return { ...ev, title: `${ev.title}/${suffix}` }
  })
}
