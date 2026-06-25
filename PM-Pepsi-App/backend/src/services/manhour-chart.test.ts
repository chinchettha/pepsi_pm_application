import { describe, expect, it } from 'vitest'
import { manhourZbCompletionPercent } from './manhour-chart.js'

describe('manhourZbCompletionPercent', () => {
  it('returns Confirm ÷ Assigned × 100', () => {
    expect(manhourZbCompletionPercent(6, 1)).toBe(16.67)
    expect(manhourZbCompletionPercent(3, 2)).toBe(66.67)
    expect(manhourZbCompletionPercent(4, 4)).toBe(100)
  })

  it('returns 0 when nothing assigned or confirmed', () => {
    expect(manhourZbCompletionPercent(0, 1)).toBe(0)
    expect(manhourZbCompletionPercent(6, 0)).toBe(0)
  })
})
