import { describe, expect, it } from 'vitest'
import { resolvePlanCalendarScope } from './plan-calendar-scope.js'

describe('resolvePlanCalendarScope', () => {
  it('technician sees assignee scope only', () => {
    expect(resolvePlanCalendarScope('W')).toBe('assignee')
    expect(resolvePlanCalendarScope({ userst: 'U', userrole: 'technician' })).toBe('assignee')
  })

  it('planner and admin see factory scope', () => {
    expect(resolvePlanCalendarScope('U')).toBe('planner')
    expect(resolvePlanCalendarScope('A')).toBe('planner')
    expect(resolvePlanCalendarScope({ userst: 'W', userrole: 'planner' })).toBe('planner')
  })
})
