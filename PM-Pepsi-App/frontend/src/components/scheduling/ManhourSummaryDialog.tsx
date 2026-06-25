import { kpiStatToneClass } from '@/components/kpi/kpi-tone'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatManhourDate } from '@/features/manhours/format-manhour-date'
import { postBacklogManhourSummary } from '@/lib/api-public'
import { operationsLiveQueryOptions } from '@/lib/operations-live-sync'
import { usePermission } from '@/lib/use-permission'
import { useQuery } from '@tanstack/react-query'
import { Maximize2, Minimize2, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type ManhourSummaryAssignTarget = {
  idiw37: number
  wkorder: string
  planDate?: string
  workHours?: number
}

function formatRangeLabel(from: string, to: string): string {
  if (!from) return ''
  if (from === to) return formatManhourDate(from)
  const a = formatManhourDate(from)
  const b = formatManhourDate(to)
  return `${a} – ${b}`
}

const OPEN_WO_SYST = new Set(['CRTD', 'REL'])

function DispatchBadge({
  status,
}: {
  status: 'unassigned' | 'assigned' | undefined
}) {
  const { t } = useTranslation('scheduling')
  if (status !== 'assigned') {
    return (
      <Badge variant="outline" className="app-tone-warning-badge whitespace-nowrap">
        {t('manhourSummary.dispatchUnassigned')}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="whitespace-nowrap">
      {t('manhourSummary.dispatchAssigned')}
    </Badge>
  )
}

function AckBadge({
  status,
  assigneeCount,
  ackCount,
}: {
  status: 'none' | 'pending' | 'partial' | 'acknowledged' | undefined
  assigneeCount: number
  ackCount: number
}) {
  const { t } = useTranslation('scheduling')
  if (!status || status === 'none') {
    return <span className="text-caption text-app-muted">—</span>
  }
  if (status === 'acknowledged') {
    return (
      <Badge className="app-tone-success-fill text-badge whitespace-nowrap">
        {t('manhourSummary.ackAcknowledged')}
      </Badge>
    )
  }
  if (status === 'partial') {
    return (
      <Badge variant="outline" className="app-tone-warning-badge whitespace-nowrap">
        {t('manhourSummary.ackPartial', { ack: ackCount, total: assigneeCount })}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="app-tone-warning-badge whitespace-nowrap">
      {t('manhourSummary.ackPending')}
    </Badge>
  )
}

export function ManhourSummaryDialog({
  open,
  onOpenChange,
  fromDate,
  toDate,
  onAssign,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fromDate: string
  toDate: string
  onAssign?: (target: ManhourSummaryAssignTarget) => void
}) {
  const { t } = useTranslation('scheduling')
  const canAssign = usePermission('planning.assign')
  const [dialogExpanded, setDialogExpanded] = useState(false)
  const enabled = open && Boolean(fromDate && toDate)

  useEffect(() => {
    if (!open) setDialogExpanded(false)
  }, [open])

  const q = useQuery({
    queryKey: ['backlog', 'manhour-summary', fromDate, toDate],
    queryFn: () => postBacklogManhourSummary({ fromDate, toDate }),
    enabled,
    ...operationsLiveQueryOptions,
  })

  const rangeLabel = formatRangeLabel(fromDate, toDate)
  const singleDay = fromDate === toDate
  const showPipeline = Boolean(onAssign && canAssign)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size={dialogExpanded ? 'full' : 'lg'}
        className={cn(
          'flex flex-col gap-0 overflow-hidden p-0 transition-[width,max-width,max-height] duration-200',
          dialogExpanded
            ? 'h-[min(96dvh,960px)] max-h-[min(96dvh,960px)] w-[min(calc(100vw-0.5rem),96rem)] max-w-[96rem] sm:max-w-[96rem]'
            : 'max-h-[min(88dvh,720px)]',
        )}
      >
        <button
          type="button"
          aria-label={dialogExpanded ? t('shared.collapseDialog') : t('shared.expandDialog')}
          title={dialogExpanded ? t('shared.collapseDialog') : t('shared.expandDialog')}
          onClick={() => setDialogExpanded((v) => !v)}
          className="absolute right-11 top-4 z-10 inline-flex items-center gap-1 rounded-button border border-app/70 bg-[var(--app-surface)] px-2 py-1 text-xs font-medium text-app shadow-sm transition-colors hover:bg-app-subtle"
        >
          {dialogExpanded ? (
            <>
              <Minimize2 className="size-3.5" aria-hidden />
              {t('shared.collapse')}
            </>
          ) : (
            <>
              <Maximize2 className="size-3.5" aria-hidden />
              {t('shared.expand')}
            </>
          )}
        </button>

        <DialogHeader className="shrink-0 space-y-1 border-b border-app/60 px-5 pb-4 pt-5 text-left sm:px-6">
          <DialogTitle className="pr-28">{t('manhourSummary.title', { range: rangeLabel })}</DialogTitle>
          <DialogDescription className="sr-only">{t('manhourSummary.description')}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {!fromDate || !toDate ? (
            <p className="text-caption">{t('manhourSummary.selectDatesFirst')}</p>
          ) : q.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-card" />
              <Skeleton className="h-10 w-full rounded-card" />
              <Skeleton className="h-48 w-full rounded-card" />
            </div>
          ) : q.isError ? (
            <p className="text-body-sm text-form-error">{(q.error as Error).message}</p>
          ) : !q.data || q.data.totalOrders === 0 ? (
            <p className="text-caption">{t('manhourSummary.empty')}</p>
          ) : (
            <div className="flex min-h-0 flex-col gap-4">
              <div className={cn(kpiStatToneClass('info'))}>
                <p>
                  <strong>{t('manhourSummary.plan')}</strong> {q.data.plannedMinutes} MIN (
                  {q.data.plannedHours.toFixed(2)} H)
                </p>
                <p className="mt-1">
                  <strong>{t('manhourSummary.action')}</strong> {q.data.actualMinutes} MIN (
                  {q.data.actualHours.toFixed(2)} H)
                </p>
              </div>

              <div className={cn(kpiStatToneClass('amber'))}>
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{t('manhourSummary.workOrder')}</strong>
                  <span>{q.data.totalOrders}</span>
                  {q.data.byWkzb.map((x) => (
                    <span key={x.code} className="inline-flex items-center gap-1">
                      <span className="text-app-muted">/</span>
                      <strong>{x.code}</strong>
                      <span>{x.count}</span>
                    </span>
                  ))}
                  <span className="text-app-muted">/</span>
                  <strong>{t('manhourSummary.completion')}</strong>
                  <span>{q.data.completionCount}</span>
                </div>
                <div className="mt-2 h-5 overflow-hidden rounded bg-app-subtle">
                  <div
                    className="flex h-full items-center justify-center bg-[var(--app-accent)] text-badge font-medium text-white"
                    style={{
                      width: `${q.data.completionPercent}%`,
                      minWidth: q.data.completionPercent > 0 ? '2rem' : 0,
                    }}
                  >
                    {q.data.completionPercent > 0 ? `${q.data.completionPercent}%` : ''}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'min-h-0 rounded-card border border-app',
                  dialogExpanded ? 'flex flex-1 flex-col overflow-hidden' : 'overflow-auto',
                )}
              >
                <Table embedded stickyHeader={dialogExpanded}>
                  <TableHeader>
                    <TableRow className="bg-[var(--app-text)] hover:bg-[var(--app-text)]">
                      <TableHead className="text-[var(--app-surface)]">{t('manhourSummary.colWoType')}</TableHead>
                      <TableHead className="text-[var(--app-surface)]">{t('manhourSummary.colStatus')}</TableHead>
                      {showPipeline ? (
                        <>
                          <TableHead className="text-[var(--app-surface)]">{t('manhourSummary.colDispatch')}</TableHead>
                          <TableHead className="text-[var(--app-surface)]">{t('manhourSummary.colAck')}</TableHead>
                        </>
                      ) : null}
                      <TableHead className="text-right text-[var(--app-surface)]">{t('manhourSummary.colPlan')}</TableHead>
                      <TableHead className="text-right text-[var(--app-surface)]">{t('manhourSummary.colAction')}</TableHead>
                      <TableHead className="text-[var(--app-surface)]">{t('manhourSummary.colUnit')}</TableHead>
                      {showPipeline ? (
                        <TableHead className="text-right text-[var(--app-surface)]">{t('manhourSummary.colActions')}</TableHead>
                      ) : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {q.data.rows.map((r, i) => {
                      const syst = (r.syst ?? '').trim().toUpperCase()
                      const canAssignRow =
                        showPipeline &&
                        r.dispatchStatus === 'unassigned' &&
                        OPEN_WO_SYST.has(syst)
                      return (
                        <TableRow key={`${r.idiw37}-${r.wkorder}-${i}`}>
                          <TableCell
                            className={cn(
                              'truncate',
                              dialogExpanded ? 'max-w-none whitespace-nowrap' : 'max-w-[14rem]',
                            )}
                            title={r.operationshorttext ?? ''}
                          >
                            {r.wkorder}
                            {r.wktype ? ` / ${r.wktype}` : ''}
                          </TableCell>
                          <TableCell>{r.syst ?? ''}</TableCell>
                          {showPipeline ? (
                            <>
                              <TableCell>
                                <DispatchBadge status={r.dispatchStatus} />
                              </TableCell>
                              <TableCell>
                                <AckBadge
                                  status={r.ackStatus}
                                  assigneeCount={r.assigneeCount}
                                  ackCount={r.ackCount}
                                />
                              </TableCell>
                            </>
                          ) : null}
                          <TableCell className="text-right tabular-nums">{r.work}</TableCell>
                          <TableCell className="text-right tabular-nums">{r.actwork}</TableCell>
                          <TableCell>{r.unit}</TableCell>
                          {showPipeline ? (
                            <TableCell className="text-right">
                              {canAssignRow ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5"
                                  onClick={() =>
                                    onAssign?.({
                                      idiw37: r.idiw37,
                                      wkorder: r.wkorder,
                                      planDate: r.planDate,
                                      workHours: r.unit === 'H' ? r.work : r.work / 60,
                                    })
                                  }
                                >
                                  <UserPlus className="size-3.5" aria-hidden />
                                  {t('manhourSummary.assign')}
                                </Button>
                              ) : (
                                <span className="text-caption text-app-muted">—</span>
                              )}
                            </TableCell>
                          ) : null}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {!singleDay ? (
                <p className="shrink-0 text-xs text-app-muted">
                  {t('manhourSummary.rangeHint', { from: fromDate, to: toDate })}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
