import type { ScheduleCalendarEvent } from '@/lib/schedule-calendar'
import { isPlanMovableStatus } from '@/lib/plan-movable'
import type { PlannerPipelineStatus } from '@/lib/planner-pipeline'

export type CalendarEventDisplayStatus = 'in_progress' | 'overdue' | 'moved' | 'completed'

export type PmPlanTeam = 'A' | 'B' | 'EE' | 'UT'

/** Fallback when API omits displayStatus (cached responses) */
export function inferCalendarDisplayStatus(
  e: Pick<
    ScheduleCalendarEvent,
    'displayStatus' | 'pmExecutionStatus' | 'moveCount' | 'moveReasonRequired' | 'pipelineStatus'
  >,
): CalendarEventDisplayStatus {
  if (e.displayStatus) return e.displayStatus
  if (e.pipelineStatus === 'closed') return 'completed'
  if (e.pmExecutionStatus === 'done' || e.pmExecutionStatus === 'closed') {
    return 'completed'
  }
  if (e.moveReasonRequired === false) return 'in_progress'
  if (e.moveReasonRequired === true) return 'moved'
  return 'in_progress'
}

export function calendarDisplayStatusClass(status: CalendarEventDisplayStatus): string {
  return `pm-cal-event--status-${status.replace(/_/g, '-')}`
}

export function calendarPipelineStatusClass(status: PlannerPipelineStatus): string {
  return `pm-cal-event--pipeline-${status.replace(/_/g, '-')}`
}

/** CRTD/REL — pipeline colors; closed (รวม TECO) ใช้เขียวเสมอ */
export function usesPipelineSurfaceColor(
  e: Pick<ScheduleCalendarEvent, 'syst' | 'pipelineStatus'>,
): boolean {
  if (e.pipelineStatus == null) return false
  if (e.pipelineStatus === 'closed') return true
  return isPlanMovableStatus(e.syst)
}

export function calendarTeamClass(team?: PmPlanTeam | string): string | null {
  if (team === 'A') return 'pm-cal-event--team-a'
  if (team === 'B') return 'pm-cal-event--team-b'
  if (team === 'EE') return 'pm-cal-event--team-ee'
  if (team === 'UT') return 'pm-cal-event--team-ut'
  return null
}

export function calendarEventSurfaceClasses(e: ScheduleCalendarEvent): string[] {
  const classes = [
    usesPipelineSurfaceColor(e) && e.pipelineStatus
      ? calendarPipelineStatusClass(e.pipelineStatus)
      : calendarDisplayStatusClass(inferCalendarDisplayStatus(e)),
  ]
  const teamClass = calendarTeamClass(e.team)
  if (teamClass) classes.push(teamClass)
  return classes
}
