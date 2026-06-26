import { describe, expect, it } from 'vitest'
import type { VibrationReadingRow } from '@/features/pm-charts/pm-chart-design-data'
import {
  expandRangeForPeriod,
  filterVibrationForPeriod,
  minMaxIsoDates,
  rangeIncludesAnyDate,
} from '@/features/pm-charts/pm-chart-period'

const TEST_ROWS: VibrationReadingRow[] = [
  {
    id: '1',
    date: '2017-02-15',
    motorFrontDst: 10,
    motorFrontDb: 70,
    motorBackDst: 11,
    motorBackDb: 71,
    pump1Dst: 12,
    pump1Db: 72,
    pump2Dst: 13,
    pump2Db: 73,
  },
  {
    id: '2',
    date: '2017-08-20',
    motorFrontDst: 14,
    motorFrontDb: 74,
    motorBackDst: 15,
    motorBackDb: 75,
    pump1Dst: 16,
    pump1Db: 76,
    pump2Dst: 17,
    pump2Db: 77,
  },
]

describe('filterVibrationForPeriod', () => {
  it('aggregates rows by month', () => {
    const rows = filterVibrationForPeriod(TEST_ROWS, 'monthly', {
      from: '2017-01-01',
      to: '2017-12-31',
    })
    expect(rows.length).toBe(2)
    expect(rows.every((r) => r.date.includes('2017') || r.date.includes('Feb') || r.date.includes('Aug'))).toBe(
      true,
    )
  })

  it('returns empty when range excludes all readings', () => {
    const rows = filterVibrationForPeriod(TEST_ROWS, 'daily', {
      from: '2026-01-01',
      to: '2026-01-01',
    })
    expect(rows).toHaveLength(0)
  })
})

describe('minMaxIsoDates', () => {
  it('returns span covering all dates', () => {
    expect(minMaxIsoDates(['2017-08-20', '2017-02-15'])).toEqual({
      from: '2017-02-15',
      to: '2017-08-20',
    })
  })
})

describe('expandRangeForPeriod', () => {
  it('expands to full year for yearly view', () => {
    expect(
      expandRangeForPeriod({ from: '2017-02-15', to: '2017-08-20' }, 'yearly'),
    ).toEqual({ from: '2017-01-01', to: '2017-12-31' })
  })
})

describe('rangeIncludesAnyDate', () => {
  it('detects when no dates fall in range', () => {
    expect(
      rangeIncludesAnyDate(['2017-02-15'], { from: '2026-06-01', to: '2026-06-30' }),
    ).toBe(false)
  })
})
