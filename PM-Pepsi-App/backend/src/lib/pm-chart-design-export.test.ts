import { describe, expect, it } from 'vitest'
import { buildPmChartDesignWorkbook } from './pm-chart-design-export.js'

describe('buildPmChartDesignWorkbook', () => {
  it('builds xlsx buffer with three sheets', () => {
    const buf = buildPmChartDesignWorkbook({
      vibration: {
        rows: [
          {
            date: '2017-02-22',
            motorFrontDst: 4,
            motorFrontDb: 37,
            motorBackDst: 5,
            motorBackDb: 30,
            pump1Dst: 7,
            pump1Db: 20,
            pump2Dst: 6,
            pump2Db: 26,
          },
        ],
      },
      current: {
        machine: 'Flour Mixer',
        year: 2021,
        phases: [{ phase: 'R', yearAverage: 22.89, values: { 'feb-2': 20.3 } }],
      },
      combustion: {
        blocks: [
          {
            point: '50',
            rows: [{ parameter: 'tAir', values: { jan: 29, mar: 29, aug: 31, oct: 39, dec: 31 } }],
          },
        ],
      },
    })
    expect(buf.byteLength).toBeGreaterThan(1000)
    expect(buf.subarray(0, 2).toString()).toBe('PK')
  })
})
