import type { ScheduleCalendarEvent } from '@/lib/schedule-calendar'

const PIPELINE_DISPLAY_ORDER: Record<
  NonNullable<ScheduleCalendarEvent['pipelineStatus']>,
  number
> = {
  unassigned: 0,
  assigned: 1,
  in_progress: 2,
  partial: 3,
  closed: 4,
}

export function pipelineSortKey(
  status: ScheduleCalendarEvent['pipelineStatus'],
): number {
  if (!status) return 2
  return PIPELINE_DISPLAY_ORDER[status]
}
