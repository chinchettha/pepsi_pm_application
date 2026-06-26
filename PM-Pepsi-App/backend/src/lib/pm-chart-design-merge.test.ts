import { describe, expect, it } from 'vitest'
import {
  mergeCombustionPayload,
  mergeCurrentPayload,
  mergeVibrationPayload,
} from './pm-chart-design-merge.js'

describe('mergeVibrationPayload', () => {
  it('merges by date and skips duplicate rows in import file', () => {
    const existing = {
      title: 'Vibration',
      rows: [
        {
          id: 'vib-2017-02-15',
          date: '2017-02-15',
          motorFrontDst: 10,
          motorFrontDb: 70,
          motorBackDst: null,
          motorBackDb: null,
          pump1Dst: null,
          pump1Db: null,
          pump2Dst: null,
          pump2Db: null,
        },
      ],
    }
    const incoming = {
      title: 'Vibration',
      rows: [
        {
          id: 'import-1',
          date: '2017-02-15',
          motorFrontDst: 12,
          motorFrontDb: 72,
          motorBackDst: 11,
          motorBackDb: 71,
          pump1Dst: null,
          pump1Db: null,
          pump2Dst: null,
          pump2Db: null,
        },
        {
          id: 'import-2',
          date: '2017-08-20',
          motorFrontDst: 14,
          motorFrontDb: 74,
          motorBackDst: null,
          motorBackDb: null,
          pump1Dst: null,
          pump1Db: null,
          pump2Dst: null,
          pump2Db: null,
        },
        {
          id: 'import-3',
          date: '2017-08-20',
          motorFrontDst: 99,
          motorFrontDb: 99,
          motorBackDst: null,
          motorBackDb: null,
          pump1Dst: null,
          pump1Db: null,
          pump2Dst: null,
          pump2Db: null,
        },
      ],
    }

    const { payload, stats } = mergeVibrationPayload(existing, incoming)
    const rows = payload.rows as Array<{ date: string; motorFrontDst: number }>

    expect(rows).toHaveLength(2)
    expect(rows[0]!.date).toBe('2017-02-15')
    expect(rows[0]!.motorFrontDst).toBe(12)
    expect(rows[1]!.date).toBe('2017-08-20')
    expect(rows[1]!.motorFrontDst).toBe(99)
    expect(stats.rowsAdded).toBe(1)
    expect(stats.rowsUpdated).toBe(1)
    expect(stats.duplicatesSkipped).toBe(1)
  })
})

describe('mergeCurrentPayload', () => {
  it('merges slot values without losing manual entries', () => {
    const existing = {
      machine: 'Flour Mixer',
      year: 2026,
      phases: [
        {
          phase: 'R' as const,
          yearAverage: 10,
          values: { 'feb-1': 5, 'feb-2': null },
        },
      ],
    }
    const incoming = {
      machine: 'Flour Mixer',
      year: 2026,
      phases: [
        {
          phase: 'R' as const,
          yearAverage: 11,
          values: { 'feb-1': 6, 'mar-1': 7 },
        },
      ],
    }

    const { payload, stats } = mergeCurrentPayload(existing, incoming)
    const phases = payload.phases as Array<{ values: Record<string, number | null> }>

    expect(phases[0]!.values['feb-1']).toBe(6)
    expect(phases[0]!.values['feb-2']).toBeNull()
    expect(phases[0]!.values['mar-1']).toBe(7)
    expect(stats.duplicatesSkipped).toBe(1)
  })
})

describe('mergeCombustionPayload', () => {
  it('merges point blocks by parameter and month', () => {
    const existing = {
      blocks: [
        {
          point: 'Patail',
          rows: [{ parameter: 'tAir', values: { jan: 100, mar: null, aug: null, oct: null, dec: null } }],
        },
      ],
    }
    const incoming = {
      blocks: [
        {
          point: 'Patail',
          rows: [{ parameter: 'tAir', values: { jan: 105, mar: 110, aug: null, oct: null, dec: null } }],
        },
      ],
    }

    const { payload, stats } = mergeCombustionPayload(existing, incoming)
    const blocks = payload.blocks as Array<{ rows: Array<{ values: Record<string, number | null> }> }>

    expect(blocks[0]!.rows[0]!.values.jan).toBe(105)
    expect(blocks[0]!.rows[0]!.values.mar).toBe(110)
    expect(stats.duplicatesSkipped).toBe(1)
  })
})
