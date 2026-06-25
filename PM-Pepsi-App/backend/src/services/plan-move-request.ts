import type { Pool, PoolClient } from 'pg'
import { isPlanMovableStatus } from './scheduling-shared.js'

export type PlanMoveRequestRow = {
  id_request: number
  idiw37: number
  requester_wkctr: string
  comment: string
  preferred_date: string | Date | null
  status: string
  created_at: Date
  fulfilled_at: Date | null
  fulfilled_by_wkctr: string | null
}

export type PlanMoveRequestItem = {
  id: number
  idiw37: number
  requesterWkctr: string
  comment: string
  preferredDate: string | null
  status: 'pending' | 'fulfilled' | 'cancelled'
  createdAt: string
  fulfilledAt: string | null
  fulfilledByWkctr: string | null
}

export class PlanMoveRequestError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'NOT_FOUND'
      | 'NOT_ASSIGNED'
      | 'NOT_MOVABLE'
    | 'DUPLICATE'
    | 'VALIDATION'
    | 'SCHEMA_MISSING',
  ) {
    super(message)
    this.name = 'PlanMoveRequestError'
  }
}

const MIN_COMMENT_LEN = 3

function mapRow(row: PlanMoveRequestRow): PlanMoveRequestItem {
  const preferred =
    row.preferred_date instanceof Date
      ? row.preferred_date.toISOString().slice(0, 10)
      : row.preferred_date
        ? String(row.preferred_date).slice(0, 10)
        : null
  const status = row.status
  if (status !== 'pending' && status !== 'fulfilled' && status !== 'cancelled') {
    throw new Error(`Unexpected plan move request status: ${status}`)
  }
  return {
    id: row.id_request,
    idiw37: row.idiw37,
    requesterWkctr: row.requester_wkctr,
    comment: row.comment,
    preferredDate: preferred,
    status,
    createdAt: row.created_at.toISOString(),
    fulfilledAt: row.fulfilled_at?.toISOString() ?? null,
    fulfilledByWkctr: row.fulfilled_by_wkctr,
  }
}

function isSchemaMissing(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return message.includes('tbplan_move_request') || message.includes('does not exist')
}

export async function assertTechnicianAssignedToWo(
  pool: Pool | PoolClient,
  idiw37: number,
  wkctr: string,
): Promise<void> {
  const code = wkctr.trim()
  if (!code) throw new PlanMoveRequestError('Work center required', 'NOT_ASSIGNED')

  const r = await pool.query<{ pwteam: string | null }>(
    `SELECT pwteam FROM app.tbplangingwork
     WHERE idiw37 = $1 AND wkctr = $2
     LIMIT 1`,
    [idiw37, code],
  )
  const row = r.rows[0]
  if (!row || (row.pwteam?.trim() ?? '') === 'G') {
    throw new PlanMoveRequestError('You are not assigned to this work order', 'NOT_ASSIGNED')
  }
}

async function assertWoMovable(pool: Pool | PoolClient, idiw37: number): Promise<void> {
  const r = await pool.query<{ syst: string | null }>(
    `SELECT syst FROM app.tbiw37n WHERE idiw37 = $1`,
    [idiw37],
  )
  if (!r.rows[0]) throw new PlanMoveRequestError('Work order not found', 'NOT_FOUND')
  if (!isPlanMovableStatus(r.rows[0].syst)) {
    throw new PlanMoveRequestError(
      'Closed work orders cannot be rescheduled',
      'NOT_MOVABLE',
    )
  }
}

export async function listPendingPlanMoveRequests(
  pool: Pool,
  idiw37: number,
): Promise<PlanMoveRequestItem[]> {
  try {
    const { rows } = await pool.query<PlanMoveRequestRow>(
      `SELECT id_request, idiw37, requester_wkctr, comment, preferred_date,
              status, created_at, fulfilled_at, fulfilled_by_wkctr
       FROM app.tbplan_move_request
       WHERE idiw37 = $1 AND status = 'pending'
       ORDER BY created_at ASC`,
      [idiw37],
    )
    return rows.map(mapRow)
  } catch (err) {
    if (isSchemaMissing(err)) return []
    throw err
  }
}

export async function getMyPendingPlanMoveRequest(
  pool: Pool,
  idiw37: number,
  requesterWkctr: string,
): Promise<PlanMoveRequestItem | null> {
  try {
    const { rows } = await pool.query<PlanMoveRequestRow>(
      `SELECT id_request, idiw37, requester_wkctr, comment, preferred_date,
              status, created_at, fulfilled_at, fulfilled_by_wkctr
       FROM app.tbplan_move_request
       WHERE idiw37 = $1 AND requester_wkctr = $2 AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT 1`,
      [idiw37, requesterWkctr.trim()],
    )
    return rows[0] ? mapRow(rows[0]) : null
  } catch (err) {
    if (isSchemaMissing(err)) return null
    throw err
  }
}

export async function createPlanMoveRequest(
  pool: Pool,
  input: {
    idiw37: number
    requesterWkctr: string
    comment: string
    preferredDate?: string | null
  },
): Promise<PlanMoveRequestItem> {
  const comment = input.comment.trim()
  if (comment.length < MIN_COMMENT_LEN) {
    throw new PlanMoveRequestError(
      `Comment must be at least ${MIN_COMMENT_LEN} characters`,
      'VALIDATION',
    )
  }

  await assertWoMovable(pool, input.idiw37)
  await assertTechnicianAssignedToWo(pool, input.idiw37, input.requesterWkctr)

  const preferred = input.preferredDate?.trim() || null
  if (preferred && !/^\d{4}-\d{2}-\d{2}$/.test(preferred)) {
    throw new PlanMoveRequestError('Invalid preferred date', 'VALIDATION')
  }

  try {
    const existing = await getMyPendingPlanMoveRequest(
      pool,
      input.idiw37,
      input.requesterWkctr,
    )
    if (existing) {
      throw new PlanMoveRequestError(
        'You already have a pending reschedule request for this work order',
        'DUPLICATE',
      )
    }

    const { rows } = await pool.query<PlanMoveRequestRow>(
      `INSERT INTO app.tbplan_move_request
         (idiw37, requester_wkctr, comment, preferred_date)
       VALUES ($1, $2, $3, $4::date)
       RETURNING id_request, idiw37, requester_wkctr, comment, preferred_date,
                 status, created_at, fulfilled_at, fulfilled_by_wkctr`,
      [input.idiw37, input.requesterWkctr.trim(), comment, preferred],
    )
    return mapRow(rows[0]!)
  } catch (err) {
    if (isSchemaMissing(err)) {
      throw new PlanMoveRequestError(
        'Run database/migrations/117_tbplan_move_request.sql',
        'SCHEMA_MISSING',
      )
    }
    if (err instanceof PlanMoveRequestError) throw err
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('idx_plan_move_request_pending_per_tech')) {
      throw new PlanMoveRequestError(
        'You already have a pending reschedule request for this work order',
        'DUPLICATE',
      )
    }
    throw err
  }
}

export async function fulfillPendingPlanMoveRequests(
  pool: Pool | PoolClient,
  idiw37: number,
  fulfilledByWkctr: string,
): Promise<number> {
  try {
    const r = await pool.query(
      `UPDATE app.tbplan_move_request
       SET status = 'fulfilled',
           fulfilled_at = now(),
           fulfilled_by_wkctr = $2
       WHERE idiw37 = $1 AND status = 'pending'`,
      [idiw37, fulfilledByWkctr.trim()],
    )
    return r.rowCount ?? 0
  } catch (err) {
    if (isSchemaMissing(err)) return 0
    throw err
  }
}
