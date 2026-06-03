import { describe, expect, it } from 'vitest'
import {
  buildPmReadingsImportTemplateBuffer,
  parseMeasuredAt,
  parsePmReadingsWorkbook,
  pmReadingsImportHeaderRow,
} from './pm-readings-import.js'

describe('pmReadingsImportHeaderRow', () => {
  it('uses Phase R/S/T for current and แกน X/Y/Z for vibration', () => {
    expect(pmReadingsImportHeaderRow('current_3phase')).toEqual([
      'เลข WO',
      'เครื่องจักร',
      'รายการ PM',
      'ประเภทการวัด',
      'วันเวลาวัด',
      'Phase R (A)',
      'Phase S (A)',
      'Phase T (A)',
      'Warning',
      'Alarm',
    ])
    expect(pmReadingsImportHeaderRow('vibration_3axis')).toContain('แกน X')
    expect(pmReadingsImportHeaderRow('vibration_3axis')).toContain('แกน Y')
    expect(pmReadingsImportHeaderRow('vibration_3axis')).toContain('แกน Z')
  })
})

describe('parseMeasuredAt', () => {
  it('accepts time-only HH:mm for chart rows', () => {
    const d = parseMeasuredAt('08:00')
    expect(d).not.toBeNull()
    expect(d!.getHours()).toBe(8)
    expect(d!.getMinutes()).toBe(0)
  })
})

describe('parsePmReadingsWorkbook', () => {
  it('parses customer template (WO 4001565681)', () => {
    const buf = buildPmReadingsImportTemplateBuffer()
    const { rows, issues } = parsePmReadingsWorkbook(buf)
    expect(issues).toHaveLength(0)
    expect(rows).toHaveLength(9)

    const oilPump = rows.find((r) => r.machine === 'Main Oil Pump' && r.v1 === 97.5)
    expect(oilPump?.wkorder).toBe('4001565681')
    expect(oilPump?.kind).toBe('current_3phase')
    expect(oilPump?.v2).toBe(97.6)
    expect(oilPump?.v3).toBe(96.2)

    const trend = rows.find((r) => r.machine === 'Main Oil Pump' && r.v1 === 120)
    expect(trend?.kind).toBe('current_3phase')
    expect(trend?.v2).toBe(118)
    expect(trend?.v3).toBe(121)

    const vib = rows.find((r) => r.machine === 'Oil Pump')
    expect(vib?.pmlist).toBe('Vibration bearing')
    expect(vib?.kind).toBe('vibration_3axis')
    expect(vib?.v1).toBe(2.1)
    expect(vib?.v2).toBe(3.6)
    expect(vib?.v3).toBe(1.9)
    expect(vib?.warningLimit).toBe(3)
    expect(vib?.alarmLimit).toBe(4)
  })
})
