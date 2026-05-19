import { describe, expect, it } from 'vitest'
import { formatManhourDate, manhourOtNet } from './format-manhour-date'

describe('formatManhourDate', () => {
  it('formats ISO date as dd.mm.yyyy', () => {
    expect(formatManhourDate('2026-05-01')).toBe('01.05.2026')
  })

  it('computes OT net like W_manhours_hr.php', () => {
    expect(
      manhourOtNet({ ot1: 1, ot15: 1.5, ot1hol: 0, ot2: 2, ot3: 0 }),
    ).toBe(4.5)
  })
})
