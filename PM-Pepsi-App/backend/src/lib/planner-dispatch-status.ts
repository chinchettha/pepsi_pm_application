/**
 * Planner dispatch = rows in tbplangingwork from assign API (mode P person / G group).
 * Legacy rows (null pwteam, old team codes) are not treated as dispatched.
 */
export const PLANNER_DISPATCH_WHERE = `COALESCE(TRIM(p.pwteam), '') IN ('P', 'G')`

/** Same rule when the planning row alias is `mp` (manhours, personnel assigned work). */
export const PLANNER_DISPATCH_WHERE_MP = `COALESCE(TRIM(mp.pwteam), '') IN ('P', 'G')`

/** Alias `mpw` — calendar Assigned Resources filter */
export const PLANNER_DISPATCH_WHERE_MPW = `COALESCE(TRIM(mpw.pwteam), '') IN ('P', 'G')`

export function resolvePlannerDispatchStatus(
  assignCount: number,
  ackCount: number,
): {
  dispatchStatus: 'unassigned' | 'assigned'
  ackStatus: 'none' | 'pending' | 'partial' | 'acknowledged'
} {
  if (assignCount <= 0) {
    return { dispatchStatus: 'unassigned', ackStatus: 'none' }
  }
  if (ackCount >= assignCount) {
    return { dispatchStatus: 'assigned', ackStatus: 'acknowledged' }
  }
  if (ackCount <= 0) {
    return { dispatchStatus: 'assigned', ackStatus: 'pending' }
  }
  return { dispatchStatus: 'assigned', ackStatus: 'partial' }
}
