import { describe, expect, it } from 'vitest'
import {
  computeSummaryWeeklyPercents,
  resolveReportsRange,
  safeRatio,
  weekLabelsInRange,
} from './reports-range.js'

describe('reports-range', () => {
  it('resolves explicit from/to dates', () => {
    const r = resolveReportsRange({ fromInput: '01.04.2026', toInput: '01.05.2026' })
    expect(r.to).toBeGreaterThanOrEqual(r.from)
    expect(r.fromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('defaults to weeksBack window', () => {
    const r = resolveReportsRange({ weeksBack: 8 })
    expect(r.to).toBeGreaterThan(r.from)
  })

  it('computes weekly percent totals like W_summary_weekly.php', () => {
    const p = computeSummaryWeeklyPercents(40, 10, 5, 8)
    expect(p.percentPm).toBe(25)
    expect(p.percentTotal).toBe(57.5)
  })

  it('safeRatio returns 0 when denominator is 0', () => {
    expect(safeRatio(10, 0)).toBe(0)
  })

  it('builds week labels for KPI charts', () => {
    const range = resolveReportsRange({ fromInput: '01.04.2026', toInput: '15.05.2026' })
    const labels = weekLabelsInRange(range)
    expect(labels.length).toBeGreaterThan(0)
  })
})
