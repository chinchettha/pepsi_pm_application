import { describe, expect, it } from 'vitest'
import {
  normalizeCalendarSubmittedFilters,
  parseYearMonthFromIsoDate,
} from './normalize-calendar-filters'
import { todayDdMmYyyy } from './personnel-close-format'

describe('normalizeCalendarSubmittedFilters', () => {
  const base = {
    activity: [],
    wktype: [],
    status: [],
    displayStatus: [],
    pmPhase: [],
    wkctr: [],
    team: [],
    functionalloc: [],
    fromDate: '2026-06-01',
    toDate: '2026-06-30',
    wcStartDate: '01.06.2026',
    wcEndDate: '15.06.2026',
  }

  it('keeps from/to when no wkctr', () => {
    const out = normalizeCalendarSubmittedFilters(base)
    expect(out.fromDate).toBe('2026-06-01')
    expect(out.toDate).toBe('2026-06-30')
  })

  it('does not narrow to today when wkctr uses default wc dates', () => {
    const today = todayDdMmYyyy()
    const out = normalizeCalendarSubmittedFilters({
      ...base,
      wkctr: ['PAC002'],
      wcStartDate: today,
      wcEndDate: today,
      fromDate: '',
      toDate: '',
    })
    expect(out.fromDate).toBe('')
    expect(out.toDate).toBe('')
  })

  it('uses custom wc date range when wkctr selected and dates not today-only default', () => {
    const out = normalizeCalendarSubmittedFilters({
      ...base,
      wkctr: ['PAC002'],
      wcStartDate: '01.06.2026',
      wcEndDate: '15.06.2026',
      fromDate: '',
      toDate: '',
    })
    expect(out.fromDate).toBe('2026-06-01')
    expect(out.toDate).toBe('2026-06-15')
  })
})

describe('parseYearMonthFromIsoDate', () => {
  it('parses yyyy-mm-dd', () => {
    expect(parseYearMonthFromIsoDate('2026-06-22')).toEqual({ year: 2026, month: 6 })
  })

  it('returns null for invalid', () => {
    expect(parseYearMonthFromIsoDate('')).toBeNull()
  })
})
