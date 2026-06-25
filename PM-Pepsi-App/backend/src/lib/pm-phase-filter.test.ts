import { describe, expect, it } from 'vitest'
import { appendPmPhaseFilter, matchesPmPhaseFilter, sqlPmPhaseMatch } from './pm-phase-filter.js'

describe('pm-phase-filter', () => {
  it('matchesPmPhaseFilter mirrors resolveWoPmPhase with assignment', () => {
    expect(matchesPmPhaseFilter('create', 'CRTD')).toBe(true)
    expect(matchesPmPhaseFilter('create', 'CRTD', { assignCount: 1 })).toBe(false)
    expect(matchesPmPhaseFilter('rel', 'CRTD', { assignCount: 1 })).toBe(true)
    expect(matchesPmPhaseFilter('rel', 'REL')).toBe(true)
    expect(matchesPmPhaseFilter('confirm', 'TECO')).toBe(true)
    expect(matchesPmPhaseFilter('confirm', 'CRTD', { confirmQcStatus: 'approved' })).toBe(
      true,
    )
  })

  it('appendPmPhaseFilter builds OR across selected phases', () => {
    const params: unknown[] = []
    const sql = appendPmPhaseFilter(['create', 'rel'], 'o', params)
    expect(sql).toContain('OR')
    expect(sql).toContain('tbplangingwork')
    expect(sql).toContain(sqlPmPhaseMatch('create', 'o'))
    expect(sql).toContain(sqlPmPhaseMatch('rel', 'o'))
    expect(params).toHaveLength(0)
  })

  it('appendPmPhaseFilter returns empty when no valid codes', () => {
    expect(appendPmPhaseFilter([], 'o', [])).toBe('')
    expect(appendPmPhaseFilter(undefined, 'o', [])).toBe('')
    expect(appendPmPhaseFilter(['invalid'], 'o', [])).toBe('')
  })
})
