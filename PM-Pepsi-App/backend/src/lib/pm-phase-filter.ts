import { PLANNER_DISPATCH_WHERE_MP } from './planner-dispatch-status.js'
import {
  isWoPmPhaseConfirm,
  resolveWoPmPhase,
  type WoPmPhase,
  type WoPmPhaseContext,
} from './wo-pm-phase.js'

export const PM_PHASE_FILTER_CODES = ['create', 'rel', 'confirm'] as const

export type PmPhaseFilterCode = (typeof PM_PHASE_FILTER_CODES)[number]

export const PM_PHASE_FILTER_OPTIONS: { code: PmPhaseFilterCode; label: string }[] = [
  { code: 'create', label: 'Create (CRTD)' },
  { code: 'rel', label: 'REL' },
  { code: 'confirm', label: 'Confirm' },
]

function sqlOpenSyst(alias: string): string {
  return `UPPER(TRIM(COALESCE(${alias}.syst, '')))`
}

function sqlHasPlannerAssignment(alias: string): string {
  return `EXISTS (
    SELECT 1 FROM app.tbplangingwork mp
    WHERE mp.idiw37 = ${alias}.idiw37
      AND ${PLANNER_DISPATCH_WHERE_MP}
  )`
}

/** Confirm — mirror `isWoPmPhaseConfirm` */
function sqlIsPmPhaseConfirm(orderAlias: string): string {
  const s = sqlOpenSyst(orderAlias)
  return `(
    (${s} <> '' AND ${s} NOT IN ('CRTD', 'REL'))
    OR EXISTS (
      SELECT 1 FROM app.view_countpersonelclose vc
      WHERE vc.idiw37 = ${orderAlias}.idiw37
        AND COALESCE(vc.percent_close, 0) >= 100
    )
    OR EXISTS (
      SELECT 1 FROM app.tbiw37n i
      WHERE i.idiw37 = ${orderAlias}.idiw37
        AND LOWER(TRIM(COALESCE(i.confirm_qc_status, ''))) = 'approved'
    )
    OR EXISTS (
      SELECT 1 FROM app.tbcofirm c WHERE c.idiw37 = ${orderAlias}.idiw37
    )
    OR EXISTS (
      SELECT 1 FROM app.tbwrkclose w
      WHERE w.idiw37 = ${orderAlias}.idiw37 AND w.close_kind = 'complete'
    )
  )`
}

/** SQL ต่อ phase เดียว — mirror `resolveWoPmPhase` */
export function sqlPmPhaseMatch(code: PmPhaseFilterCode, alias: string): string {
  const s = sqlOpenSyst(alias)
  const confirm = sqlIsPmPhaseConfirm(alias)
  const assigned = sqlHasPlannerAssignment(alias)

  switch (code) {
    case 'confirm':
      return confirm
    case 'create':
      return `(${s} = 'CRTD' AND NOT (${confirm}) AND NOT (${assigned}))`
    case 'rel':
      return `(NOT (${confirm}) AND (${s} = 'REL' OR (${s} = 'CRTD' AND ${assigned})))`
    default:
      return 'FALSE'
  }
}

export function appendPmPhaseFilter(
  values: string[] | undefined,
  alias: string,
  _params: unknown[],
): string {
  const codes = (values ?? []).filter((v): v is PmPhaseFilterCode =>
    (PM_PHASE_FILTER_CODES as readonly string[]).includes(v),
  )
  if (codes.length === 0) return ''

  const parts = codes.map((code) => sqlPmPhaseMatch(code, alias))
  return ` AND (${parts.join(' OR ')})`
}

/** ใช้ใน unit test — mirror logic ฝั่ง TS */
export function matchesPmPhaseFilter(
  code: PmPhaseFilterCode,
  syst: string | null | undefined,
  ctx?: WoPmPhaseContext,
): boolean {
  return resolveWoPmPhase(syst, ctx) === code
}

export function resolvePmPhaseFromSyst(
  syst: string | null | undefined,
  ctx?: WoPmPhaseContext,
): WoPmPhase {
  return resolveWoPmPhase(syst, ctx)
}
