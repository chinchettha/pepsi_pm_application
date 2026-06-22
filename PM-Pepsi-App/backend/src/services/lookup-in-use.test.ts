import { describe, expect, it, vi } from 'vitest'
import {
  assertLookupNotInUse,
  countLookupUsage,
  LookupInUseError,
} from './lookup-in-use.js'

function mockPool(rows: { n: string }[]) {
  return {
    query: vi.fn(async () => ({ rows })),
  } as never
}

describe('lookup-in-use', () => {
  it('countLookupUsage returns 0 when no technicians reference department', async () => {
    const pool = mockPool([{ n: '0' }])
    await expect(countLookupUsage(pool, 'department', 'DEP99')).resolves.toBe(0)
  })

  it('assertLookupNotInUse throws LookupInUseError when in use', async () => {
    const pool = mockPool([{ n: '3' }])
    await expect(assertLookupNotInUse(pool, 'position', 'POS01')).rejects.toBeInstanceOf(
      LookupInUseError,
    )
    await expect(assertLookupNotInUse(pool, 'position', 'POS01')).rejects.toMatchObject({
      usageCount: 3,
    })
  })

  it('assertLookupNotInUse passes when count is zero', async () => {
    const pool = mockPool([{ n: '0' }])
    await expect(assertLookupNotInUse(pool, 'level', 'LV01')).resolves.toBeUndefined()
  })
})
