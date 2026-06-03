import type { z } from 'zod'
import type { workOrderSearchRowSchema } from '@/api/schemas'
import { WoPmPhaseBadge } from '@/components/scheduling/WoPmPhaseBadge'
import { WktypeDisplay } from '@/components/scheduling/WktypeDisplay'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableStickyClass,
} from '@/components/ui/table'
import { postConfirmQcApprove, postConfirmQcReject } from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { cn } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ClipboardList, Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type Row = z.infer<typeof workOrderSearchRowSchema>

function QcBadge({ row }: { row: Row }) {
  const { t } = useTranslation('workOrders')

  if (row.syst === 'TECO' || row.confirmQcStatus === 'approved') {
    return (
      <Badge className="border-0 bg-emerald-700 shadow-sm hover:bg-emerald-700">
        {t('qc.badgeTecoApproved')}
      </Badge>
    )
  }
  if (row.confirmQcStatus === 'rejected') {
    return (
      <Badge variant="destructive" className="shadow-sm">
        {t('qc.badgeRejected')}
      </Badge>
    )
  }
  if (row.confirmQcStatus === 'pending') {
    return (
      <Badge
        variant="outline"
        className="border-amber-300/80 bg-amber-50 text-amber-950 shadow-sm"
      >
        {t('qc.badgePending')}
      </Badge>
    )
  }
  return <span className="text-xs text-app-muted">—</span>
}

function WoConfirmationQcActions({ row }: { row: Row }) {
  const { t } = useTranslation('workOrders')
  const qc = useQueryClient()
  const canReview = usePermission('confirmation.import')

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ['work-orders', 'search'] })
    await qc.invalidateQueries({ queryKey: ['personnel', 'me', 'dashboard'] })
    await qc.invalidateQueries({ queryKey: ['personnel', 'confirm'] })
    await qc.invalidateQueries({ queryKey: ['plan-calendar'] })
    await qc.invalidateQueries({ queryKey: ['calendar'] })
  }

  const approveMut = useMutation({
    mutationFn: () => postConfirmQcApprove(Number(row.id)),
    onSuccess: async () => {
      toast.success(t('toast.approveSuccess', { wkorder: row.wkorder }))
      await invalidate()
    },
    onError: (e: Error) => toast.error(e.message || t('toast.approveFailed')),
  })

  const rejectMut = useMutation({
    mutationFn: (note: string) => postConfirmQcReject(Number(row.id), note),
    onSuccess: async () => {
      toast.message(t('toast.rejectSent', { wkorder: row.wkorder }))
      await invalidate()
    },
    onError: (e: Error) => toast.error(e.message || t('toast.rejectFailed')),
  })

  const busy = approveMut.isPending || rejectMut.isPending
  const alreadyDone = row.syst === 'TECO' || row.confirmQcStatus === 'approved'
  const canAct = canReview && !alreadyDone && row.qcReadyForReview

  if (!canReview) {
    return <span className="text-xs text-app-muted">{t('qc.noReviewPermission')}</span>
  }

  if (alreadyDone) {
    return <QcBadge row={row} />
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!canAct || busy}
          title={
            !row.qcReadyForReview ? t('qc.approveDisabledTitle') : undefined
          }
          className={cn(
            'gap-1.5 rounded-lg bg-teal-700 shadow-sm transition-all hover:bg-teal-800',
            'hover:scale-[1.02] active:scale-[0.98]',
            !canAct && 'opacity-50',
          )}
          onClick={() => approveMut.mutate()}
        >
          {approveMut.isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Check className="size-3.5" aria-hidden />
          )}
          {t('qc.approve')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!canAct || busy}
          className={cn(
            'gap-1.5 rounded-lg border-red-200/90 text-red-800 shadow-sm',
            'hover:bg-red-50/90 hover:text-red-900',
            !canAct && 'opacity-50',
          )}
          onClick={() => {
            const note = window.prompt(t('qc.rejectPrompt'), '') ?? ''
            rejectMut.mutate(note)
          }}
        >
          {rejectMut.isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <X className="size-3.5" aria-hidden />
          )}
          {t('qc.reject')}
        </Button>
      </div>
      <QcBadge row={row} />
    </div>
  )
}

type Props = {
  rows: Row[]
  isLoading: boolean
  onOpenRow: (id: string) => void
}

export function WoConfirmationTable({ rows, isLoading, onOpenRow }: Props) {
  const { t } = useTranslation('workOrders')

  if (isLoading) {
    return (
      <Skeleton className="h-64 w-full rounded-card" aria-label={t('table.loadingAria')} />
    )
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-app/70 bg-app-subtle/30 px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--app-accent)_10%,white)] text-[var(--app-accent)] ring-1 ring-[color-mix(in_srgb,var(--app-accent)_18%,transparent)]">
          <ClipboardList className="size-6" aria-hidden />
        </span>
        <p className="text-body-sm font-medium text-app">{t('table.emptyTitle')}</p>
        <p className="max-w-sm text-xs text-app-muted">{t('table.emptyDescription')}</p>
      </div>
    )
  }

  return (
    <div className="app-table-shell -mx-1 max-h-[min(65vh,680px)] overflow-auto overflow-x-auto sm:mx-0">
      <Table embedded stickyHeader zebra>
        <TableHeader>
          <TableRow>
            <TableHead className={tableStickyClass(1)}>{t('table.colOrderNumber')}</TableHead>
            <TableHead>{t('table.colPmPhase')}</TableHead>
            <TableHead>{t('table.colMaintPlan')}</TableHead>
            <TableHead>{t('table.colTypeActivity')}</TableHead>
            <TableHead>{t('table.colEquipment')}</TableHead>
            <TableHead>{t('table.colFuncLoc')}</TableHead>
            <TableHead className="min-w-[12rem]">{t('table.colApproveReject')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="transition-colors hover:bg-[color-mix(in_srgb,var(--app-accent)_4%,transparent)]"
            >
              <TableCell className={cn('text-right', tableStickyClass(1))}>
                <button
                  type="button"
                  title={row.operationshorttext}
                  onClick={() => onOpenRow(row.id)}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-black/10 transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  style={{ backgroundColor: row.wkstcolor }}
                >
                  {row.wkorder}
                </button>
              </TableCell>
              <TableCell>
                <WoPmPhaseBadge phase={row.pmPhase} syst={row.syst} showSyst />
              </TableCell>
              <TableCell className="text-xs tabular-nums">{row.mntplan}</TableCell>
              <TableCell>
                <WktypeDisplay code={row.wktype} mat={row.mat} />
              </TableCell>
              <TableCell className="max-w-[12rem] text-xs leading-snug">{row.equdescrip}</TableCell>
              <TableCell className="max-w-[12rem] text-xs leading-snug">{row.funcdescrip}</TableCell>
              <TableCell>
                <WoConfirmationQcActions row={row} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
