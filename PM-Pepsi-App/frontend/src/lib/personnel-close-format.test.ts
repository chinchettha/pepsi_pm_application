import { describe, expect, it } from 'vitest'
import {
  addMinutesHhMm,
  dateToDdMmYyyy,
  formatPersonnelCloseDateTime,
  formatPersonnelCloseDuration,
  nowHhMm,
  parseDdMmYyyyToDate,
  previewDurationMinutes,
} from './personnel-close-format'

describe('personnel-close-format', () => {
  it('formats datetime as DD.MM.YYYY HH:mm', () => {
    const sec = Math.floor(new Date(2026, 4, 22, 13, 0, 0).getTime() / 1000)
    expect(formatPersonnelCloseDateTime(sec)).toBe('22.05.2026 13:00')
  })

  it('formats duration with two decimals and Min unit', () => {
    expect(formatPersonnelCloseDuration(40)).toBe('40.00 Min')
  })

  it('previewDurationMinutes matches customer example', () => {
    expect(
      previewDurationMinutes('22.05.2026', '13:00', '22.05.2026', '13:40'),
    ).toBe(40)
  })

  it('round-trips DD.MM.YYYY through calendar helpers', () => {
    const d = parseDdMmYyyyToDate('24.06.2026')
    expect(d).toBeDefined()
    expect(dateToDdMmYyyy(d!)).toBe('24.06.2026')
  })

  it('addMinutesHhMm advances within the day', () => {
    expect(addMinutesHhMm('08:00', 90)).toBe('09:30')
    expect(addMinutesHhMm('23:45', 30)).toBe('00:15')
  })

  it('nowHhMm returns HH:mm', () => {
    expect(nowHhMm()).toMatch(/^\d{2}:\d{2}$/)
  })
})
