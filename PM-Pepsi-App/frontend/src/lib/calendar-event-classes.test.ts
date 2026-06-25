import { describe, expect, it } from 'vitest'
import {
  calendarEventSurfaceClasses,
  inferCalendarDisplayStatus,
  usesPipelineSurfaceColor,
} from './calendar-event-classes'

describe('usesPipelineSurfaceColor', () => {
  it('uses pipeline green for closed TECO work', () => {
    expect(usesPipelineSurfaceColor({ syst: 'TECO', pipelineStatus: 'closed' })).toBe(true)
  })

  it('uses pipeline for open CRTD/REL with pipeline status', () => {
    expect(usesPipelineSurfaceColor({ syst: 'REL', pipelineStatus: 'assigned' })).toBe(true)
  })

  it('skips pipeline surface for TECO without closed status', () => {
    expect(usesPipelineSurfaceColor({ syst: 'TECO', pipelineStatus: undefined })).toBe(false)
  })
})

describe('calendarEventSurfaceClasses', () => {
  it('applies pipeline-closed (green) for TECO after planner approve', () => {
    const classes = calendarEventSurfaceClasses({
      id: '1',
      date: '2026-06-25',
      title: 'WO1',
      color: '#7AC943',
      syst: 'TECO',
      pipelineStatus: 'closed',
    })
    expect(classes).toContain('pm-cal-event--pipeline-closed')
  })

  it('applies pipeline-closed for REL with supervisor close', () => {
    const classes = calendarEventSurfaceClasses({
      id: '2',
      date: '2026-06-25',
      title: 'WO2',
      color: '#7AC943',
      syst: 'REL',
      pipelineStatus: 'closed',
    })
    expect(classes).toContain('pm-cal-event--pipeline-closed')
  })
})

describe('inferCalendarDisplayStatus', () => {
  it('maps pipeline closed to completed', () => {
    expect(inferCalendarDisplayStatus({ pipelineStatus: 'closed' })).toBe('completed')
  })
})
