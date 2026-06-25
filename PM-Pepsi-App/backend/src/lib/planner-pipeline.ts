import { BRAND_CALENDAR } from './brand-palette.js'

/** Pipeline จ่ายงาน–ปิดงาน (ชุด B) — แยกจากสีปฏิทิน SAP บน /calendar */
export const plannerPipelineStatusSchema = [
  'unassigned',
  'assigned',
  'in_progress',
  'partial',
  'closed',
] as const

export type PlannerPipelineStatus = (typeof plannerPipelineStatusSchema)[number]

export const plannerPipelineBadgeSchema = [
  'ack_pending',
  'ack_done',
  'partial_close',
  'qc_pending',
  'qc_approved',
  'qc_rejected',
] as const

export type PlannerPipelineBadge = (typeof plannerPipelineBadgeSchema)[number]

export const PLANNER_PIPELINE_COLORS: Record<PlannerPipelineStatus, string> = {
  unassigned: BRAND_CALENDAR.overdue,
  assigned: '#7B61FF',
  in_progress: BRAND_CALENDAR.inProgress,
  partial: BRAND_CALENDAR.moved,
  closed: BRAND_CALENDAR.completed,
}

function coalescePercentClose(v: number | string | null | undefined): number {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0
}

function coalesceHasConfirm(v: number | boolean | string | null | undefined): boolean {
  if (v === true) return true
  if (typeof v === 'number' && v > 0) return true
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (!s || s === '0' || s === 'false' || s === 'f') return false
    const n = Number(s)
    return Number.isFinite(n) ? n > 0 : true
  }
  return false
}

export function resolvePlannerPipelineBadges(input: {
  status: PlannerPipelineStatus
  assignCount: number
  ackPending: number
  ackAcknowledged: number
  confirmQcStatus?: string | null
  partialCloseCount?: number
}): PlannerPipelineBadge[] {
  const badges: PlannerPipelineBadge[] = []
  const qc = (input.confirmQcStatus ?? '').trim().toLowerCase()

  if (input.status === 'closed') {
    if (qc === 'approved') badges.push('qc_approved')
    else if (qc === 'rejected') badges.push('qc_rejected')
    else badges.push('qc_pending')
    return badges
  }

  if (input.assignCount <= 0) return badges

  if (input.ackPending > 0) badges.push('ack_pending')
  else if (input.ackAcknowledged > 0) badges.push('ack_done')

  if ((input.partialCloseCount ?? 0) > 0) badges.push('partial_close')

  return badges
}

export function resolvePlannerPipeline(input: {
  syst?: string | null
  assignCount: number
  worktimeCount: number
  hasSupervisorClose?: boolean
  percentClose?: number | string | null
  hasConfirm?: number | boolean | string | null
  confirmQcStatus?: string | null
  completeCloseWkctrCount?: number
  ackPending?: number
  ackAcknowledged?: number
  partialCloseCount?: number
}): {
  status: PlannerPipelineStatus
  badges: PlannerPipelineBadge[]
  color: string
} {
  const syst = (input.syst ?? '').trim().toUpperCase()
  const assignCount = Math.max(0, input.assignCount)
  const worktimeCount = Math.max(0, input.worktimeCount)
  const ackPending = Math.max(0, input.ackPending ?? 0)
  const ackAcknowledged = Math.max(0, input.ackAcknowledged ?? 0)
  const pct = coalescePercentClose(input.percentClose)
  const qc = (input.confirmQcStatus ?? '').trim().toLowerCase()
  const completeCloseWkctr = Math.max(0, input.completeCloseWkctrCount ?? 0)
  const allTechniciansClosed = assignCount > 0 && completeCloseWkctr >= assignCount
  const hasClose =
    input.hasSupervisorClose === true ||
    coalesceHasConfirm(input.hasConfirm) ||
    pct >= 100 ||
    qc === 'approved' ||
    allTechniciansClosed

  let status: PlannerPipelineStatus

  if (syst !== 'CRTD' && syst !== 'REL') {
    status = 'closed'
  } else if (hasClose) {
    status = 'closed'
  } else if (worktimeCount > 0) {
    status = 'in_progress'
  } else if (assignCount > 0) {
    status = 'assigned'
  } else {
    status = 'unassigned'
  }

  const partialCloseCount = Math.max(0, input.partialCloseCount ?? 0)
  if (status === 'in_progress' && partialCloseCount > 0) {
    status = 'partial'
  }

  const badges = resolvePlannerPipelineBadges({
    status,
    assignCount,
    ackPending,
    ackAcknowledged,
    confirmQcStatus: input.confirmQcStatus,
    partialCloseCount,
  })

  return { status, badges, color: PLANNER_PIPELINE_COLORS[status] }
}

/** Partial-only technician slot counts as half progress until complete close. */
export const PARTIAL_WKCTR_PROGRESS_WEIGHT = 50

/**
 * Work-order completion % for open jobs (CRTD/REL) on plan calendar.
 * - Complete close per assigned wkctr → 100% of that slot
 * - Partial-only wkctr → 50% of that slot
 * - Also considers supervisor `percent_close` from view_countpersonelclose
 */
export function resolveWorkProgressPercent(input: {
  syst?: string | null
  assignCount: number
  completeCloseWkctrCount: number
  partialOnlyWkctrCount: number
  supervisorPercentClose?: number | string | null
  pipelineStatus: PlannerPipelineStatus
}): number | null {
  const syst = (input.syst ?? '').trim().toUpperCase()
  if (syst !== 'CRTD' && syst !== 'REL') return null
  if (input.pipelineStatus === 'closed') return null

  const assignCount = Math.max(0, input.assignCount)
  if (assignCount <= 0) return null

  const completeWkctr = Math.max(0, input.completeCloseWkctrCount)
  const partialOnlyWkctr = Math.max(0, input.partialOnlyWkctrCount)
  const technicianPct = Math.round(
    (completeWkctr * 100 + partialOnlyWkctr * PARTIAL_WKCTR_PROGRESS_WEIGHT) / assignCount,
  )
  const supervisorPct = coalescePercentClose(input.supervisorPercentClose)
  const pct = Math.max(technicianPct, supervisorPct)
  const clamped = Math.max(0, Math.min(100, pct))

  if (clamped <= 0) return null
  return clamped
}
