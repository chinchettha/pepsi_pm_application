import type { Pool } from 'pg'
import {
  PM_EXECUTION_META,
  resolvePmExecutionStatus,
} from '../lib/wo-pm-execution.js'
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
  percent_close: string | number | null
  has_confirm: string | number | null
  confirm_qc_status: string | null
}

/** วันที่แสดงบนปฏิทิน (cday ถ้าย้ายแผน ไม่งั้น bscstart) */
function pickPlanDisplayUnix(row: PlanWorkRow): number | null {
  const cday = row.cday != null && row.cday !== '' ? Number(row.cday) : null
  if (cday != null && cday > 0) return cday
  const bscstart =
    row.bscstart != null && row.bscstart !== '' ? Number(row.bscstart) : null
  if (bscstart != null && bscstart > 0) return bscstart
  return null
}

/** ย้ายข้ามเดือนเมื่อ cday กับ bscstart คนละเดือน */
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
  const pmExecutionStatus = resolvePmExecutionStatus({
    syst,
    percentClose: row.percent_close,
    hasConfirm: row.has_confirm,
    confirmQcStatus: row.confirm_qc_status,
  })
  const execColor = PM_EXECUTION_META[pmExecutionStatus].color
  const color =
    isCrossMonthMove(row) && (syst === 'REL' || syst === 'CRTD')
      ? moveColor
      : execColor

  const wktype = row.wktype?.trim() ?? ''
  const execLabel = PM_EXECUTION_META[pmExecutionStatus].label
  const baseTitle = wktype ? `${row.wkorder} / ${wktype}` : row.wkorder
  const title = `[${execLabel}] ${baseTitle}`

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
    pmExecutionStatus,
  }
}

/**
 * ปฏิทินจ่ายงานช่าง
 * `view_planwork` กรอง `idwkctr` = session — รวมงานปิดแล้วในเดือน
 */
export async function listPlanCalendarEvents(
  pool: Pool,
  idwkctr: string,
  year: number,
  month: number,
  wkctr = '',
): Promise<CalendarEvent[]> {
  const { startSec, endSec, prefix } = monthRangeSec(year, month)
  const moveColor = await getMoveOverColor(pool)
  const techWkctr = wkctr.trim()
  const assigneeSql = techWkctr
    ? `(pw.idwkctr = $1 OR EXISTS (
         SELECT 1 FROM app.tbplangingwork mp2
         WHERE mp2.idiw37 = pw.idiw37 AND mp2.wkctr = $4
       ))`
    : `pw.idwkctr = $1`
  const params: (string | number)[] = techWkctr
    ? [idwkctr, startSec, endSec, techWkctr]
    : [idwkctr, startSec, endSec]

  const r = await pool.query<PlanWorkRow>(
    `SELECT pw.idiw37, pw.wkorder, pw.wktype, pw.bscstart, pw.cday, pw.syst,
            pw.operationshorttext, pw.wkstcolor,
            COALESCE(v.percent_close, 0) AS percent_close,
            COALESCE(v.has_confirm, 0) AS has_confirm,
            i.confirm_qc_status
     FROM app.view_planwork pw
     LEFT JOIN app.view_countpersonelclose v ON v.idiw37 = pw.idiw37
     LEFT JOIN app.tbiw37n i ON i.idiw37 = pw.idiw37
     WHERE ${assigneeSql}
       AND pw.bscstart IS NOT NULL
       AND pw.bscstart > 0
       AND COALESCE(NULLIF(pw.cday, 0), pw.bscstart) >= $2
       AND COALESCE(NULLIF(pw.cday, 0), pw.bscstart) < $3
     ORDER BY pw.bscstart DESC
     LIMIT 500`,
    params,
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
