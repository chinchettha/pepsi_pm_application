import { describe, expect, it } from 'vitest'
import { buildPlanCalendarDeepLink } from './plan-calendar-href'

describe('buildPlanCalendarDeepLink', () => {
  it('builds plan-calendar URL with idiw37 and date', () => {
    expect(buildPlanCalendarDeepLink(1336, '2026-06-15')).toBe(
      '/plan-calendar?idiw37=1336&date=2026-06-15',
    )
  })
})
