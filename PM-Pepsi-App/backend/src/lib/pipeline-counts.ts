import type { PlannerPipelineStatus } from './planner-pipeline.js'

export const EMPTY_PIPELINE_COUNTS: Record<PlannerPipelineStatus, number> = {
  unassigned: 0,
  assigned: 0,
  in_progress: 0,
  partial: 0,
  closed: 0,
}

export const plannerPipelineCountsSchema = [
  'unassigned',
  'assigned',
  'in_progress',
  'partial',
  'closed',
] as const satisfies readonly PlannerPipelineStatus[]

export function aggregatePipelineCounts(
  items: readonly { pipelineStatus?: PlannerPipelineStatus | null }[],
): Record<PlannerPipelineStatus, number> {
  const counts = { ...EMPTY_PIPELINE_COUNTS }
  for (const item of items) {
    const status = item.pipelineStatus
    if (status && status in counts) {
      counts[status]++
    }
  }
  return counts
}

/** Open WO with at least one technician partial close (not fully closed per wkctr). */
export const SQL_OPEN_PARTIAL_WO_EXISTS = `EXISTS (
  SELECT 1 FROM app.tbwrkclose w
  WHERE w.idiw37 = i.idiw37 AND w.close_kind = 'partial'
    AND NOT EXISTS (
      SELECT 1 FROM app.tbwrkclose c
      WHERE c.idiw37 = i.idiw37 AND c.wkctr = w.wkctr AND c.close_kind = 'complete'
    )
)`

export const SQL_OPEN_NOT_SUPERVISOR_CLOSED = `NOT (
  COALESCE((SELECT v.has_confirm FROM app.view_countpersonelclose v WHERE v.idiw37 = i.idiw37 LIMIT 1), 0) > 0
  OR COALESCE((SELECT v.percent_close FROM app.view_countpersonelclose v WHERE v.idiw37 = i.idiw37 LIMIT 1), 0) >= 100
)`
