import { describe, expect, it } from 'vitest'
import { manhourConfirmMinutesToHours } from './manhour-confirm-sql.js'

describe('manhourConfirmMinutesToHours', () => {
  it('converts minutes to hours for utilization', () => {
    expect(manhourConfirmMinutesToHours(60)).toBe(1)
    expect(manhourConfirmMinutesToHours(50)).toBe(0.83)
    expect(manhourConfirmMinutesToHours(0)).toBe(0)
  })
})
