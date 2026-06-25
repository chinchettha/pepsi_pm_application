import { cn } from '@/lib/utils'
import { formatEpochSecondsToDdMmYyyy } from '@/lib/master-data-api'
import {
  MASTER_PLAN_VIRTUAL_LAST_CLOSED,
  MASTER_PLAN_VIRTUAL_NEXT_DUE,
  startOfTodayEpochSec,
} from '@/features/master-plan/master-plan-virtual-columns'

type PmStatus = {
  lastClosedAt: number | null
  nextDueAt: number | null
  intervalDays: number | null
}

type MasterPlanPmStatusCellProps = {
  column: string
  pmStatus?: PmStatus
  cellClassName?: string
}

export function MasterPlanPmStatusCell({
  column,
  pmStatus,
  cellClassName,
}: MasterPlanPmStatusCellProps) {
  const empty = <span className="text-app-muted/60">—</span>

  if (column === MASTER_PLAN_VIRTUAL_LAST_CLOSED) {
    const epoch = pmStatus?.lastClosedAt
    if (epoch == null || epoch <= 0) {
      return (
        <td className={cn('master-plan-cell border border-[#b4c6e7] px-2.5 py-1.5 text-xs', cellClassName)}>
          {empty}
        </td>
      )
    }
    return (
      <td
        className={cn(
          'master-plan-cell border border-[#b4c6e7] px-2.5 py-1.5 text-center text-xs font-mono tabular-nums text-[#1f3864]',
          cellClassName,
        )}
      >
        {formatEpochSecondsToDdMmYyyy(epoch)}
      </td>
    )
  }

  if (column === MASTER_PLAN_VIRTUAL_NEXT_DUE) {
    const epoch = pmStatus?.nextDueAt
    if (epoch == null || epoch <= 0) {
      return (
        <td className={cn('master-plan-cell border border-[#b4c6e7] px-2.5 py-1.5 text-xs', cellClassName)}>
          {empty}
        </td>
      )
    }
    const overdue = epoch < startOfTodayEpochSec()
    return (
      <td
        className={cn(
          'master-plan-cell border border-[#b4c6e7] px-2.5 py-1.5 text-center text-xs font-mono tabular-nums',
          overdue ? 'bg-amber-50 font-semibold text-amber-900' : 'font-semibold text-[#1f3864]',
          cellClassName,
        )}
      >
        {formatEpochSecondsToDdMmYyyy(epoch)}
      </td>
    )
  }

  return null
}
