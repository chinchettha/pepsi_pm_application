import { describe, expect, it } from 'vitest'
import { confirmationAddCloseBodySchema } from './work-orders.js'

describe('confirmationAddCloseBodySchema partial close', () => {
  const base = {
    wkctr: 'PAC002',
    startD: '01.06.2026',
    startT: '08:00',
    endD: '01.06.2026',
    endT: '12:00',
  }

  it('accepts partial close with reason', () => {
    const parsed = confirmationAddCloseBodySchema.safeParse({
      ...base,
      closeKind: 'partial',
      incompleteReason: 'Waiting for spare parts',
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects partial close without reason', () => {
    const parsed = confirmationAddCloseBodySchema.safeParse({
      ...base,
      closeKind: 'partial',
      incompleteReason: 'ab',
    })
    expect(parsed.success).toBe(false)
  })

  it('defaults closeKind to complete', () => {
    const parsed = confirmationAddCloseBodySchema.safeParse(base)
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.closeKind).toBe('complete')
  })
})
