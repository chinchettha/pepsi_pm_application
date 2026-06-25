import { describe, expect, it } from 'vitest'
import { PlanMoveRequestError } from './plan-move-request.js'

describe('PlanMoveRequestError', () => {
  it('carries error code for API mapping', () => {
    const err = new PlanMoveRequestError('duplicate', 'DUPLICATE')
    expect(err.code).toBe('DUPLICATE')
    expect(err.name).toBe('PlanMoveRequestError')
  })
})
