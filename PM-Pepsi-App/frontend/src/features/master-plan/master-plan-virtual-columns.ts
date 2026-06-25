/** Virtual columns appended to detail sheets (not stored in Excel). */
export const MASTER_PLAN_VIRTUAL_LAST_CLOSED = '__pmLastClosed'
export const MASTER_PLAN_VIRTUAL_NEXT_DUE = '__pmNextDue'

export const MASTER_PLAN_VIRTUAL_COLUMNS = [
  MASTER_PLAN_VIRTUAL_LAST_CLOSED,
  MASTER_PLAN_VIRTUAL_NEXT_DUE,
] as const

export type MasterPlanVirtualColumn = (typeof MASTER_PLAN_VIRTUAL_COLUMNS)[number]

export function isMasterPlanVirtualColumn(column: string): column is MasterPlanVirtualColumn {
  return (MASTER_PLAN_VIRTUAL_COLUMNS as readonly string[]).includes(column)
}

/** Append PM status columns at the end of detail sheet columns (before Links). */
export function withMasterPlanVirtualColumns(columns: string[], sheetKind: string): string[] {
  if (sheetKind !== 'detail') return columns
  if (columns.some((c) => isMasterPlanVirtualColumn(c))) return columns
  return [...columns, ...MASTER_PLAN_VIRTUAL_COLUMNS]
}

export function masterPlanVirtualColumnLabelKey(column: string): string | null {
  if (column === MASTER_PLAN_VIRTUAL_LAST_CLOSED) return 'lastClosed'
  if (column === MASTER_PLAN_VIRTUAL_NEXT_DUE) return 'nextDue'
  return null
}

export function masterPlanVirtualColumnWidthClass(column: string): string {
  if (column === MASTER_PLAN_VIRTUAL_LAST_CLOSED) {
    return 'min-w-[5.75rem] max-w-[6.5rem] text-center tabular-nums'
  }
  if (column === MASTER_PLAN_VIRTUAL_NEXT_DUE) {
    return 'min-w-[5.75rem] max-w-[6.5rem] text-center tabular-nums font-semibold'
  }
  return ''
}

export function startOfTodayEpochSec(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}
