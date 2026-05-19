import { describe, expect, it } from 'vitest'
import { kpiResponseSchema, summaryWeeklyResponseSchema } from '@/api/schemas'

const range = { from: 1, to: 2, fromDate: '2026-04-01', toDate: '2026-05-01' }

describe('reports frontend schemas', () => {
  it('parses kpi and summary-weekly API contracts', () => {
    const kpi = kpiResponseSchema.parse({
      range,
      labels: ['2026-W01'],
      utilization: [50],
      backlogHours: [10],
    })
    expect(kpi.labels[0]).toBe('2026-W01')
    expect(kpi.range.fromDate).toBe('2026-04-01')

    const weekly = summaryWeeklyResponseSchema.parse({
      range,
      utilizationChart: [],
      rows: [],
    })
    expect(weekly.rows).toEqual([])
  })
})
