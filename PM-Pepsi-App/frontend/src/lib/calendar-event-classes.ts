import type { ScheduleCalendarEvent } from '@/lib/schedule-calendar'

export type CalendarEventDisplayStatus = 'in_progress' | 'overdue' | 'moved' | 'completed'

export type PmPlanTeam = 'A' | 'B' | 'EE' | 'UT'

/** Fallback when API omits displayStatus (cached responses) */
export function inferCalendarDisplayStatus(
  e: Pick<
    ScheduleCalendarEvent,
    'displayStatus' | 'pmExecutionStatus' | 'moveCount' | 'moveReasonRequired'
  >,
): CalendarEventDisplayStatus {
  if (e.displayStatus) return e.displayStatus
  if (e.pmExecutionStatus === 'done' || e.pmExecutionStatus === 'closed') {
    return 'completed'
  }
  if (e.moveCount != null && e.moveCount >= 1) return 'moved'
  if (e.moveReasonRequired === true) return 'overdue'
  return 'in_progress'
}

export function calendarDisplayStatusClass(status: CalendarEventDisplayStatus): string {
  return `pm-cal-event--status-${status.replace(/_/g, '-')}`
}

export function calendarTeamClass(team?: PmPlanTeam | string): string | null {
  if (team === 'A') return 'pm-cal-event--team-a'
  if (team === 'B') return 'pm-cal-event--team-b'
  if (team === 'EE') return 'pm-cal-event--team-ee'
  if (team === 'UT') return 'pm-cal-event--team-ut'
  return null
}

export function calendarEventSurfaceClasses(e: ScheduleCalendarEvent): string[] {
  const classes = [calendarDisplayStatusClass(inferCalendarDisplayStatus(e))]
  const teamClass = calendarTeamClass(e.team)
  if (teamClass) classes.push(teamClass)
  return classes
}
