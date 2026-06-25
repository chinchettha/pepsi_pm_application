import { describe, expect, it } from 'vitest'
import { buildIw37nHref, buildIw37nMoveRequestHref, buildPlanningMoveRequestHref } from './iw37n-href'

describe('buildIw37nHref', () => {
  it('returns base path when query empty', () => {
    expect(buildIw37nHref('')).toBe('/iw37n')
    expect(buildIw37nHref('   ')).toBe('/iw37n')
  })

  it('encodes maintenance plan query', () => {
    expect(buildIw37nHref('366383')).toBe('/iw37n?q=366383')
    expect(buildIw37nHref(' PK5-YR ')).toBe('/iw37n?q=PK5-YR')
  })

  it('builds move-request deep links', () => {
    expect(buildIw37nMoveRequestHref(1336)).toBe('/iw37n?idiw37=1336&focus=import')
    expect(buildPlanningMoveRequestHref(1336)).toBe('/planning?idiw37=1336')
  })
})
