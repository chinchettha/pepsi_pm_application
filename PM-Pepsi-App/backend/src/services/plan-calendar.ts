import type { Pool } from 'pg'
import { buildCalendarDayOrderCounts } from '../lib/calendar-event-display.js'
import { aggregatePipelineCounts } from '../lib/pipeline-counts.js'
import { PLANNER_DISPATCH_WHERE } from '../lib/planner-dispatch-status.js'
import {
  resolvePlannerPipeline,
  resolveWorkProgressPercent,
  type PlannerPipelineStatus,
} from '../lib/planner-pipeline.js'
import { resolveWoPmPhase } from '../lib/wo-pm-phase.js'
import {
  FACTORY_CODE,
  isPlanMovableStatus,
  monthRangeSec,
  sqlFactoryScope,
  unixToDateString,
  type CalendarEvent,
} from './scheduling-shared.js'
import { loadWorkflowSuffixMap } from './work-order-workflow.js'

export type PlanCalendarScope = 'assignee' | 'planner'

export type PlanCalendarListResult = {
  items: CalendarEvent[]
  year: number
  month: number
  scope: PlanCalendarScope
  dayOrderCounts: Record<string, number>
  pipelineCounts: Record<PlannerPipelineStatus, number>
}

const PIPELINE_DISPLAY_ORDER: Record<PlannerPipelineStatus, number> = {
  unassigned: 0,
  assigned: 1,
  in_progress: 2,
  partial: 3,
  closed: 4,
}

function sortPlanCalendarEvents(items: CalendarEvent[]): CalendarEvent[] {
  return [...items].sort((a, b) => {
    const pa = PIPELINE_DISPLAY_ORDER[a.pipelineStatus ?? 'assigned']
    const pb = PIPELINE_DISPLAY_ORDER[b.pipelineStatus ?? 'assigned']
    if (pa !== pb) return pa - pb
    return a.title.localeCompare(b.title, undefined, { numeric: true })
  })
}

type PlanWorkRow = {
  idiw37: number
  wkorder: string
  wktype: string | null
  bscstart: string | number | null
  cday: string | number | null
  syst: string | null
  operationshorttext: string | null
  assign_count: number | string
  worktime_count: number | string
  ack_pending: number | string
  ack_acknowledged: number | string
  percent_close: string | number | null
  has_confirm: string | number | null
  confirm_qc_status: string | null
  partial_close_count: number | string
  complete_close_wkctr: number | string
  partial_only_wkctr: number | string
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

export function mapPlanWorkRowToEvent(row: PlanWorkRow): CalendarEvent | null {
  const bscstart =
    row.bscstart != null && row.bscstart !== '' ? Number(row.bscstart) : null
  if (bscstart == null || !Number.isFinite(bscstart) || bscstart <= 0) {
    return null
  }

  const displayUnix = pickPlanDisplayUnix(row)
  if (displayUnix == null) return null

  const syst = (row.syst ?? '').trim()
  const pipeline = resolvePlannerPipeline({
    syst,
    assignCount: Number(row.assign_count ?? 0),
    worktimeCount: Number(row.worktime_count ?? 0),
    hasSupervisorClose: Number(row.has_confirm ?? 0) > 0,
    percentClose: row.percent_close,
    hasConfirm: row.has_confirm,
    confirmQcStatus: row.confirm_qc_status,
    completeCloseWkctrCount: Number(row.complete_close_wkctr ?? 0),
    ackPending: Number(row.ack_pending ?? 0),
    ackAcknowledged: Number(row.ack_acknowledged ?? 0),
    partialCloseCount: Number(row.partial_close_count ?? 0),
  })

  const wktype = row.wktype?.trim() ?? ''
  const baseTitle = wktype ? `${row.wkorder} / ${wktype}` : row.wkorder
  const workProgressPercent = resolveWorkProgressPercent({
    syst,
    assignCount: Number(row.assign_count ?? 0),
    completeCloseWkctrCount: Number(row.complete_close_wkctr ?? 0),
    partialOnlyWkctrCount: Number(row.partial_only_wkctr ?? 0),
    supervisorPercentClose: row.percent_close,
    pipelineStatus: pipeline.status,
  })

  return {
    id: String(row.idiw37),
    date: unixToDateString(displayUnix),
    title: baseTitle,
    orderId: row.wkorder,
    color: pipeline.color,
    description: row.operationshorttext?.trim() || undefined,
    canMovePlan: isPlanMovableStatus(syst),
    syst,
    pmPhase: resolveWoPmPhase(syst),
    pipelineStatus: pipeline.status,
    pipelineBadges: pipeline.badges,
    workProgressPercent: workProgressPercent ?? undefined,
  }
}

/**
 * ปฏิทินจ่ายงาน — สี Pipeline (ชุด B)
 * - assignee (ช่าง): เฉพาะ WO ที่มีแถวใน `tbplangingwork` สำหรับ wkctr ของ session
 * - planner (Admin/Planner): งานทั้งโรงงานในเดือน (distinct WO)
 */
export async function listPlanCalendarEvents(
  pool: Pool,
  idwkctr: string,
  year: number,
  month: number,
  wkctr = '',
  scope: PlanCalendarScope = 'assignee',
): Promise<PlanCalendarListResult> {
  const { startSec, endSec, prefix } = monthRangeSec(year, month)

  const r =
    scope === 'planner'
      ? await queryPlanCalendarPlannerScope(pool, startSec, endSec)
      : await queryPlanCalendarAssigneeScope(pool, idwkctr, startSec, endSec, wkctr)

  const items: CalendarEvent[] = []
  for (const row of r.rows) {
    const ev = mapPlanWorkRowToEvent(row)
    if (ev && ev.date.startsWith(prefix)) items.push(ev)
  }
  const suffixMap = await loadWorkflowSuffixMap(
    pool,
    items.map((e) => Number(e.id)).filter((n) => Number.isFinite(n)),
  )
  const withSuffix = items.map((ev) => {
    const suffix = suffixMap.get(Number(ev.id))
    if (!suffix) return ev
    return { ...ev, title: `${ev.title}/${suffix}` }
  })
  const sorted = sortPlanCalendarEvents(withSuffix)
  return {
    items: sorted,
    year,
    month,
    scope,
    dayOrderCounts: buildCalendarDayOrderCounts(sorted),
    pipelineCounts: aggregatePipelineCounts(sorted),
  }
}

async function queryPlanCalendarPlannerScope(
  pool: Pool,
  startSec: number,
  endSec: number,
) {
  const factory = `%${FACTORY_CODE}%`
  return pool.query<PlanWorkRow>(
    `SELECT i.idiw37, i.wkorder, i.wktype, i.bscstart, mov.cday, i.syst,
            i.operationshorttext,
            COALESCE(ac.n, 0) AS assign_count,
            COALESCE(wc_prog.n, 0) AS worktime_count,
            COALESCE(ap.n, 0) AS ack_pending,
            COALESCE(aa.n, 0) AS ack_acknowledged,
            COALESCE(v.percent_close, 0) AS percent_close,
            COALESCE(v.has_confirm, 0) AS has_confirm,
            i.confirm_qc_status,
            COALESCE(wc_prog.partial_n, 0) AS partial_close_count,
            COALESCE(wc_prog.complete_wkctr, 0) AS complete_close_wkctr,
            COALESCE(wc_prog.partial_only_wkctr, 0) AS partial_only_wkctr
     FROM app.tbiw37n i
     LEFT JOIN app.tbmoveplan mov ON mov.idiw37 = i.idiw37
     LEFT JOIN app.view_countpersonelclose v ON v.idiw37 = i.idiw37
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS n FROM app.tbplangingwork p
       WHERE p.idiw37 = i.idiw37 AND ${PLANNER_DISPATCH_WHERE}
     ) ac ON true
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS n,
              COUNT(*) FILTER (WHERE w.close_kind = 'partial')::int AS partial_n,
              COUNT(DISTINCT w.wkctr) FILTER (WHERE w.close_kind = 'complete')::int AS complete_wkctr,
              COUNT(DISTINCT w.wkctr) FILTER (
                WHERE w.close_kind = 'partial'
                  AND NOT EXISTS (
                    SELECT 1 FROM app.tbwrkclose c
                    WHERE c.idiw37 = i.idiw37 AND c.wkctr = w.wkctr AND c.close_kind = 'complete'
                  )
              )::int AS partial_only_wkctr
       FROM app.tbwrkclose w WHERE w.idiw37 = i.idiw37
     ) wc_prog ON true
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS n FROM app.tbplangingwork p
       WHERE p.idiw37 = i.idiw37 AND p.ack_status = 'pending' AND ${PLANNER_DISPATCH_WHERE}
     ) ap ON true
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS n FROM app.tbplangingwork p
       WHERE p.idiw37 = i.idiw37 AND p.ack_status = 'acknowledged' AND ${PLANNER_DISPATCH_WHERE}
     ) aa ON true
     WHERE ${sqlFactoryScope('i', '$3')}
       AND i.bscstart IS NOT NULL
       AND i.bscstart > 0
       AND COALESCE(NULLIF(mov.cday, 0), i.bscstart) >= $1
       AND COALESCE(NULLIF(mov.cday, 0), i.bscstart) < $2
     ORDER BY i.bscstart DESC
     LIMIT 2500`,
    [startSec, endSec, factory],
  )
}

async function queryPlanCalendarAssigneeScope(
  pool: Pool,
  idwkctr: string,
  startSec: number,
  endSec: number,
  wkctr: string,
) {
  const techWkctr = wkctr.trim()
  const assigneeSql = techWkctr ? `mp.wkctr = $3` : `wc.idwkctr = $1`
  const params: (string | number)[] = techWkctr
    ? [startSec, endSec, techWkctr]
    : [idwkctr, startSec, endSec]

  return pool.query<PlanWorkRow>(
    `SELECT i.idiw37, i.wkorder, i.wktype, i.bscstart, mov.cday, i.syst,
            i.operationshorttext,
            COALESCE(ac.n, 0) AS assign_count,
            COALESCE(wc_prog.n, 0) AS worktime_count,
            COALESCE(ap.n, 0) AS ack_pending,
            COALESCE(aa.n, 0) AS ack_acknowledged,
            COALESCE(v.percent_close, 0) AS percent_close,
            COALESCE(v.has_confirm, 0) AS has_confirm,
            i.confirm_qc_status,
            COALESCE(wc_prog.partial_n, 0) AS partial_close_count,
            COALESCE(wc_prog.complete_wkctr, 0) AS complete_close_wkctr,
            COALESCE(wc_prog.partial_only_wkctr, 0) AS partial_only_wkctr
     FROM app.tbplangingwork mp
     INNER JOIN app.tbworkcenter wc ON wc.wkctr = mp.wkctr
     INNER JOIN app.tbiw37n i ON i.idiw37 = mp.idiw37
     LEFT JOIN app.tbmoveplan mov ON mov.idiw37 = i.idiw37
     LEFT JOIN app.view_countpersonelclose v ON v.idiw37 = i.idiw37
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS n FROM app.tbplangingwork p
       WHERE p.idiw37 = i.idiw37 AND ${PLANNER_DISPATCH_WHERE}
     ) ac ON true
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS n,
              COUNT(*) FILTER (WHERE w.close_kind = 'partial')::int AS partial_n,
              COUNT(DISTINCT w.wkctr) FILTER (WHERE w.close_kind = 'complete')::int AS complete_wkctr,
              COUNT(DISTINCT w.wkctr) FILTER (
                WHERE w.close_kind = 'partial'
                  AND NOT EXISTS (
                    SELECT 1 FROM app.tbwrkclose c
                    WHERE c.idiw37 = i.idiw37 AND c.wkctr = w.wkctr AND c.close_kind = 'complete'
                  )
              )::int AS partial_only_wkctr
       FROM app.tbwrkclose w WHERE w.idiw37 = i.idiw37
     ) wc_prog ON true
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS n FROM app.tbplangingwork p
       WHERE p.idiw37 = i.idiw37 AND p.ack_status = 'pending' AND ${PLANNER_DISPATCH_WHERE}
     ) ap ON true
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS n FROM app.tbplangingwork p
       WHERE p.idiw37 = i.idiw37 AND p.ack_status = 'acknowledged' AND ${PLANNER_DISPATCH_WHERE}
     ) aa ON true
     WHERE ${assigneeSql}
       AND i.bscstart IS NOT NULL
       AND i.bscstart > 0
       AND COALESCE(NULLIF(mov.cday, 0), i.bscstart) >= $1
       AND COALESCE(NULLIF(mov.cday, 0), i.bscstart) < $2
     ORDER BY i.bscstart DESC
     LIMIT 500`,
    params,
  )
}
