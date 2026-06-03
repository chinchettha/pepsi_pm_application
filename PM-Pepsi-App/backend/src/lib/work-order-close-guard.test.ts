import { describe, expect, it } from 'vitest'
import { workOrderCloseGuardMessage } from './work-order-close-guard.js'

describe('workOrderCloseGuardMessage', () => {
  it('requires comment and before/after images', () => {
    expect(
      workOrderCloseGuardMessage({ commentCount: 0, imageBefore: 1, imageAfter: 1 }),
    ).toMatch(/รายละเอียด/)
    expect(
      workOrderCloseGuardMessage({ commentCount: 1, imageBefore: 0, imageAfter: 1 }),
    ).toMatch(/รูป/)
    expect(
      workOrderCloseGuardMessage({ commentCount: 1, imageBefore: 1, imageAfter: 0 }),
    ).toMatch(/รูป/)
    expect(
      workOrderCloseGuardMessage({ commentCount: 1, imageBefore: 1, imageAfter: 1 }),
    ).toBeNull()
  })
})
