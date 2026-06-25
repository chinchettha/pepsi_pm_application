import { describe, expect, it } from 'vitest'
import { appendCalendarAssignedWkctrFilter } from './personnel-assigned-work-sql.js'

describe('appendCalendarAssignedWkctrFilter', () => {
  it('uses tbplangingwork only (not import wkctr on order)', () => {
    const params: unknown[] = [1, 2, 3]
    const sql = appendCalendarAssignedWkctrFilter(['PAC002'], 'o', params)
    expect(sql).toContain('tbplangingwork mpw')
    expect(sql).toContain('o.idiw37')
    expect(sql).toContain("mpw.wkctr IN ($4)")
    expect(sql).not.toContain('o.wkctr IN')
    expect(sql).toContain("IN ('P', 'G')")
    expect(params).toEqual([1, 2, 3, 'PAC002'])
  })

  it('returns empty when no wkctr selected', () => {
    const params: unknown[] = []
    expect(appendCalendarAssignedWkctrFilter([], 'o', params)).toBe('')
    expect(appendCalendarAssignedWkctrFilter(undefined, 'o', params)).toBe('')
  })
})
