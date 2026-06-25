import { describe, expect, it } from 'vitest'
import { resolvePlannerDispatchStatus } from './planner-dispatch-status.js'

describe('resolvePlannerDispatchStatus', () => {
  it('treats zero planner dispatch rows as unassigned', () => {
    expect(resolvePlannerDispatchStatus(0, 0)).toEqual({
      dispatchStatus: 'unassigned',
      ackStatus: 'none',
    })
  })

  it('pending when dispatched but no ack', () => {
    expect(resolvePlannerDispatchStatus(2, 0)).toEqual({
      dispatchStatus: 'assigned',
      ackStatus: 'pending',
    })
  })

  it('partial when some acked', () => {
    expect(resolvePlannerDispatchStatus(3, 1)).toEqual({
      dispatchStatus: 'assigned',
      ackStatus: 'partial',
    })
  })

  it('acknowledged when all acked', () => {
    expect(resolvePlannerDispatchStatus(2, 2)).toEqual({
      dispatchStatus: 'assigned',
      ackStatus: 'acknowledged',
    })
  })
})
