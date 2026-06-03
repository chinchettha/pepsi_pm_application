import { MassConfirmBar, MASS_CONFIRM_MAX } from '@/components/confirmation/MassConfirmBar'
import {
  MassConfirmExportPanel,
  type MassConfirmBatchResult,
} from '@/components/confirmation/MassConfirmExportPanel'
import {
  FilterSearchField,
  SchedulingFilterShell,
} from '@/components/scheduling/SchedulingFilterLayout'
import {
  SchedulingCalendarPanel,
  SchedulingFilterActions,
  SchedulingSection,
} from '@/components/scheduling/SchedulingPageLayout'
import { WktypeDisplay } from '@/components/scheduling/WktypeDisplay'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { postWorkOrdersSearch } from '@/lib/api-public'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, Layers } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function MassConfirmSearchCard({
  collapsible = false,
  defaultOpen = true,
}: {
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const { t } = useTranslation('confirmation')
  const { t: tc } = useTranslation('common')
  const [q, setQ] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(() => new Set())
  const [lastBatch, setLastBatch] = useState<MassConfirmBatchResult | null>(null)

  const searchQ = useQuery({
    queryKey: ['work-orders', 'mass-confirm-search', q],
    queryFn: () =>
      postWorkOrdersSearch({
        q: q.trim() || undefined,
        activity: [],
        wktype: [],
        status: ['CRTD', 'REL'],
        wkctr: [],
        team: [],
        functionalloc: [],
        equipment: [],
      }),
    enabled: submitted,
    placeholderData: keepPreviousData,
  })

  const rows = searchQ.data ?? []
  const rowIds = useMemo(() => rows.map((r) => Number(r.id)).filter((n) => Number.isFinite(n)), [rows])
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.has(id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
      return
    }
    const next = new Set(rowIds.slice(0, MASS_CONFIRM_MAX))
    if (rowIds.length > MASS_CONFIRM_MAX) {
      toast.message(t('massConfirm.selectMaxSap', { max: MASS_CONFIRM_MAX }))
    }
    setSelected(next)
  }

  const toggleOne = (idiw37: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(idiw37)) {
        next.delete(idiw37)
        return next
      }
      if (next.size >= MASS_CONFIRM_MAX) {
        toast.error(t('massConfirm.selectMax', { max: MASS_CONFIRM_MAX }))
        return prev
      }
      next.add(idiw37)
      return next
    })
  }

  const clearSearch = () => {
    setQ('')
    setSubmitted(false)
    setSelected(new Set())
  }

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setSelected(new Set())
  }

  return (
    <SchedulingSection
      icon={Layers}
      title={t('massConfirm.title')}
      collapsible={collapsible}
      defaultOpen={defaultOpen}
      collapsedHint={
        submitted
          ? t('massConfirm.collapsedWithResults', {
              count: rows.length.toLocaleString(),
            })
          : t('massConfirm.collapsedSearch')
      }
      badge={
        <Badge variant="secondary" className="text-xs font-normal tabular-nums">
          ≤{MASS_CONFIRM_MAX}
        </Badge>
      }
      bodyClassName="space-y-4"
    >
      <form onSubmit={onSearch}>
        <SchedulingFilterShell
          title={t('massConfirm.searchTitle')}
          actions={
            <SchedulingFilterActions
              onClear={clearSearch}
              submitLabel={tc('actions.search')}
              clearLabel={t('massConfirm.clear')}
            />
          }
        >
          <div className="max-w-xl">
            <FilterSearchField
              id="mass-q"
              label={t('massConfirm.searchLabel')}
              value={q}
              onChange={setQ}
              placeholder={t('massConfirm.searchPlaceholder')}
            />
          </div>
        </SchedulingFilterShell>
      </form>

      <MassConfirmBar
        selectedIds={[...selected]}
        onClearSelection={() => setSelected(new Set())}
        onBatchDone={(batch) => setLastBatch(batch)}
        onComplete={() => {
          void searchQ.refetch()
          setSelected(new Set())
        }}
      />

      {lastBatch ? (
        <MassConfirmExportPanel batch={lastBatch} onDismiss={() => setLastBatch(null)} />
      ) : null}

      {submitted ? (
        searchQ.isLoading && !searchQ.data ? (
          <Skeleton className="h-40 w-full rounded-card" aria-label={t('massConfirm.loadingSearch')} />
        ) : searchQ.isError ? (
          <EmptyState
            icon={AlertCircle}
            title={t('massConfirm.searchFailed')}
            description={
              searchQ.error instanceof Error ? searchQ.error.message : t('massConfirm.genericError')
            }
            action={{ label: tc('actions.retry'), onClick: () => void searchQ.refetch() }}
          />
        ) : (
          <SchedulingCalendarPanel
            title={t('massConfirm.resultsTitle')}
            subtitle={q.trim() ? t('massConfirm.searchSubtitle', { q: q.trim() }) : undefined}
            eventCount={rows.length}
            isRefreshing={searchQ.isFetching && !searchQ.isLoading}
          >
            <div className="app-table-shell overflow-x-auto">
              <Table embedded stickyHeader zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        aria-label={t('massConfirm.selectAllAria')}
                        checked={allSelected}
                        onChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>{t('massConfirm.colWo')}</TableHead>
                    <TableHead>{t('massConfirm.colType')}</TableHead>
                    <TableHead>{t('massConfirm.colDate')}</TableHead>
                    <TableHead>{t('massConfirm.colTeam')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-caption">
                        {t('massConfirm.noResults')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.slice(0, 200).map((row) => {
                      const id = Number(row.id)
                      return (
                        <TableRow
                          key={row.id}
                          className={selected.has(id) ? 'bg-emerald-50/60' : undefined}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selected.has(id)}
                              onChange={() => toggleOne(id)}
                            />
                          </TableCell>
                          <TableCell className="text-xs font-medium">{row.wkorder}</TableCell>
                          <TableCell className="text-xs">
                            <WktypeDisplay code={row.wktype} mat={row.mat} />
                          </TableCell>
                          <TableCell className="text-xs">{row.displayDate}</TableCell>
                          <TableCell className="text-xs">{row.team || '—'}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </SchedulingCalendarPanel>
        )
      ) : null}
    </SchedulingSection>
  )
}
