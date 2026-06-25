import { describe, expect, it } from 'vitest'
import {
  computeNextDueAt,
  extractIntervalDays,
  pmlistMatchesWo,
  resolveRowPmStatus,
  type Iw37nCloseSnapshot,
} from './master-plan-pm-dates.js'

describe('master-plan-pm-dates', () => {
  it('extracts interval from days column with fill-down display', () => {
    const headers = ['Zone', 'PM list', 'days']
    const display = { days: '30' }
    expect(extractIntervalDays(headers, display)).toBe(30)
  })

  it('computes next due by adding calendar days', () => {
    const last = Math.floor(new Date(2026, 0, 1).getTime() / 1000)
    const next = computeNextDueAt(last, 30)
    const d = new Date(next * 1000)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(31)
  })

  it('matches WO by pmlist snippet in operation text', () => {
    const wo: Iw37nCloseSnapshot = {
      mntplan: '610000004496',
      equipment: '',
      opText: 'ตรวจเช็คสภาพท่อร้อยสายไฟ',
      osDesc: '',
      lastClosedAt: 1_700_000_000,
    }
    expect(
      pmlistMatchesWo('ตรวจเช็คสภาพท่อร้อยสายไฟและข้อต่อ', '', wo, 3),
    ).toBe(true)
  })

  it('resolves last close and next due for a row', () => {
    const last = Math.floor(new Date(2026, 5, 1).getTime() / 1000)
    const status = resolveRowPmStatus(
      {
        zone: 'SE0',
        machineList: 'Mixer',
        mntplan: '610000004496',
        tasklist: '100930',
        legacy: 'SE0-MI-EE',
        machine: 'Agitator',
        pmlist: 'ตรวจเช็คมอเตอร์',
      },
      15,
      [
        {
          mntplan: '610000004496',
          equipment: 'Agitator',
          opText: 'ตรวจเช็คมอเตอร์',
          osDesc: '',
          lastClosedAt: last,
        },
      ],
      1,
    )
    expect(status.lastClosedAt).toBe(last)
    expect(status.intervalDays).toBe(15)
    expect(status.nextDueAt).toBe(computeNextDueAt(last, 15))
  })
})
