import { describe, expect, it } from 'vitest'
import { resolveNotificationHref } from './notification-href'

describe('resolveNotificationHref', () => {
  it('routes move_request_to_planner to IW37N import', () => {
    expect(
      resolveNotificationHref({
        notifyKind: 'move_request_to_planner',
        linkRoute: '/calendar?foo=1',
        idiw37: 1336,
      }),
    ).toBe('/iw37n?idiw37=1336&focus=import')
  })

  it('routes plan_moved_to_tech to plan calendar on new date', () => {
    expect(
      resolveNotificationHref({
        notifyKind: 'plan_moved_to_tech',
        linkRoute: '/plan-calendar?idiw37=1336&date=2026-06-15',
        idiw37: 1336,
      }),
    ).toBe('/plan-calendar?idiw37=1336&date=2026-06-15')
  })

  it('rewrites legacy planning/calendar links when idiw37 is present', () => {
    expect(
      resolveNotificationHref({
        notifyKind: 'other',
        linkRoute: '/planning?idiw37=42',
        idiw37: 42,
      }),
    ).toBe('/iw37n?idiw37=42&focus=import')
  })

  it('falls back to linkRoute or confirmation', () => {
    expect(
      resolveNotificationHref({
        notifyKind: 'planner_close',
        linkRoute: '/confirmation?idiw37=9',
        idiw37: 9,
      }),
    ).toBe('/confirmation?idiw37=9')

    expect(
      resolveNotificationHref({
        notifyKind: 'other',
        linkRoute: null,
        idiw37: null,
      }),
    ).toBe('/confirmation')
  })
})
