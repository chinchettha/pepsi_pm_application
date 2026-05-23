import { describe, expect, it } from 'vitest'
import { confirmQcStatusLabel, isConfirmQcApproved } from './confirm-qc-status.js'

describe('confirm-qc-status', () => {
  it('approved only when status is approved', () => {
    expect(isConfirmQcApproved('approved')).toBe(true)
    expect(isConfirmQcApproved('pending')).toBe(false)
    expect(isConfirmQcApproved('rejected')).toBe(false)
    expect(isConfirmQcApproved(null)).toBe(false)
  })

  it('labels in Thai', () => {
    expect(confirmQcStatusLabel('pending')).toContain('รอ')
    expect(confirmQcStatusLabel('approved')).toContain('อนุมัติ')
  })
})
