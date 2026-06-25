import { CanPermission } from '@/components/auth/CanPermission'
import { AppPageSection, AppPageShell } from '@/components/layout/AppPageShell'
import { BacklogWorkcenterSummary } from '@/components/scheduling/BacklogWorkcenterSummary'
import { FilterMultiSelect } from '@/components/scheduling/FilterMultiSelect'
import { SchedulingColorLegendStrip } from '@/components/scheduling/SchedulingLegends'
import {
  SchedulingFilterActions,
  SchedulingCalendarPanel,
} from '@/components/scheduling/SchedulingPageLayout'
import {
  SchedulingFilterGrid,
  SchedulingFilterShell,
} from '@/components/scheduling/SchedulingFilterLayout'
import { ManhourSummaryDialog } from '@/components/scheduling/ManhourSummaryDialog'
import { MovePlanDialog } from '@/components/scheduling/MovePlanDialog'
import { MonthFullCalendar } from '@/components/scheduling/MonthFullCalendar'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { QueryLoadErrorState } from '@/components/ui/query-load-error'
import { Skeleton } from '@/components/ui/skeleton'
import type { BacklogSearchInput } from '@/lib/api-public'
import {
  fetchBacklogFilterOptions,
  postBacklogEvents,
  postBacklogFilterDetail,
} from '@/lib/api-public'
import type { ScheduleCalendarEvent } from '@/lib/schedule-calendar'
import { useDebouncedFormFilters } from '@/lib/use-debounced-form-filters'
import { usePermission } from '@/lib/use-permission'
import { sortWktypeFilterOptions } from '@/lib/wktype-zd-mapping'
import { zodResolver } from '@hookform/resolvers/zod'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const backlogFilterFormSchema = z.object({
  activity: z.array(z.string()),
  wktype: z.array(z.string()),
  functionalloc: z.array(z.string()),
  equipment: z.array(z.string()),
  wkctr: z.array(z.string()),
})

type BacklogFilterForm = z.infer<typeof backlogFilterFormSchema>

function emptyBacklogFilters(): BacklogFilterForm {
  return {
    activity: [],
    wktype: [],
    functionalloc: [],
    equipment: [],
    wkctr: [],
  }
}

function countActiveBacklogFilters(f: BacklogFilterForm): number {
  return (
    f.activity.length +
    f.wktype.length +
    f.functionalloc.length +
    f.equipment.length +
    f.wkctr.length
  )
}

function buildBacklogDayNotes(events: ScheduleCalendarEvent[]): Map<string, string[]> {
  const byDate = new Map<string, Map<string, number>>()
  for (const ev of events) {
    const wk = ev.wkctr?.trim()
    if (!wk) continue
    const inner = byDate.get(ev.date) ?? new Map()
    inner.set(wk, (inner.get(wk) ?? 0) + 1)
    byDate.set(ev.date, inner)
  }
  const out = new Map<string, string[]>()
  for (const [date, counts] of byDate) {
    out.set(
      date,
      [...counts.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([code, n]) => `${code} (${n})`),
    )
  }
  return out
}

export function BacklogPage() {
  const { t } = useTranslation('scheduling')
  const { t: two } = useTranslation('workOrders')
  const { t: tc } = useTranslation('common')
  const canRead = usePermission('backlog.read')
  const canMovePlan = usePermission('calendar.write')

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const form = useForm<BacklogFilterForm>({
    resolver: zodResolver(backlogFilterFormSchema),
    defaultValues: emptyBacklogFilters(),
  })

  const [submittedFilters, setSubmittedFilters] = useState<BacklogFilterForm>(emptyBacklogFilters)

  const applyBacklogFilters = useCallback((data: BacklogFilterForm) => {
    setSubmittedFilters((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(data)) return prev
      return data
    })
  }, [])

  const watchedValues = useWatch({ control: form.control })
  const filterSnapshot = JSON.stringify(watchedValues ?? {})
  useDebouncedFormFilters(filterSnapshot, () => {
    applyBacklogFilters(form.getValues())
  })

  const optsQ = useQuery({
    queryKey: ['backlog', 'filter-options'],
    queryFn: fetchBacklogFilterOptions,
    staleTime: 300_000,
    enabled: canRead,
  })

  const wktypeOptions = useMemo(
    () => sortWktypeFilterOptions(optsQ.data?.wktypes ?? []),
    [optsQ.data?.wktypes],
  )

  const submittedKey = useMemo(() => JSON.stringify(submittedFilters), [submittedFilters])

  const searchBody = useMemo<BacklogSearchInput>(
    () => ({
      year,
      month,
      ...submittedFilters,
    }),
    [year, month, submittedFilters],
  )

  const eventsQ = useQuery({
    queryKey: ['backlog', 'events', year, month, submittedKey],
    queryFn: () => postBacklogEvents(searchBody),
    placeholderData: keepPreviousData,
    enabled: canRead,
  })

  const filterDetailQ = useQuery({
    queryKey: ['backlog', 'filter-detail', year, month, submittedKey],
    queryFn: () => postBacklogFilterDetail(searchBody),
    placeholderData: keepPreviousData,
    enabled: canRead,
  })

  const dayWkctrNotes = useMemo(
    () => buildBacklogDayNotes(eventsQ.data?.items ?? []),
    [eventsQ.data?.items],
  )

  const filterCollapsedHint = useMemo(() => {
    const n = countActiveBacklogFilters(submittedFilters)
    if (n === 0) return undefined
    return t('filters.activeCount', { count: n })
  }, [submittedFilters, t])

  const clearFilters = () => {
    const empty = emptyBacklogFilters()
    form.reset(empty)
    applyBacklogFilters(empty)
  }

  const onSearch = form.handleSubmit((data) => {
    applyBacklogFilters(data)
  })

  const [detailTarget, setDetailTarget] = useState<{ id: string; date: string } | null>(null)
  const [moveTarget, setMoveTarget] = useState<{
    idiw37: string
    wkorder: string
    date: string
    moveReasonRequired: boolean
  } | null>(null)
  const [mhOpen, setMhOpen] = useState(false)
  const [mhFrom, setMhFrom] = useState('')
  const [mhTo, setMhTo] = useState('')

  const openMove = (event: ScheduleCalendarEvent, date: string) => {
    if (!canMovePlan) {
      toast.error(t('backlog.noMovePermission'))
      return
    }
    if (event.canMovePlan === false) {
      toast.error(t('backlog.planNotMovable'))
      return
    }
    setMoveTarget({
      idiw37: event.id,
      wkorder: event.orderId ?? event.title,
      date,
      moveReasonRequired: event.moveReasonRequired !== false,
    })
  }

  if (!canRead) {
    return (
      <AppPageShell title={t('backlog.title')} description={t('backlog.description')}>
        <EmptyState
          icon={AlertCircle}
          title={t('backlog.noAccess')}
          description={
            <>
              {t('backlog.noAccessHint')}{' '}
              <code className="text-xs">backlog.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <>
      <AppPageShell
        title={t('backlog.title')}
        description={t('backlog.description')}
        hints={[
          t('backlog.hints.filter'),
          t('backlog.hints.status'),
          t('backlog.hints.wcSummary'),
          t('backlog.hints.drag'),
          t('backlog.hints.wo'),
        ]}
        headerActions={
          <>
            <Badge variant="secondary" className="text-xs">
              {t('backlog.badgeStatus')}
            </Badge>
            <CanPermission permission="calendar.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/calendar">{t('backlog.workScheduling')}</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="work-orders.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/confirmation">{t('backlog.woConfirmation')}</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="iw37n.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/iw37n">{t('backlog.iw37nImport')}</Link>
              </Button>
            </CanPermission>
          </>
        }
      >
        <AppPageSection index={0}>
          <form onSubmit={onSearch}>
            <SchedulingFilterShell
              title={t('filters.title')}
              collapsible
              defaultOpen={false}
              collapsedHint={filterCollapsedHint}
              actions={
                <SchedulingFilterActions
                  onClear={clearFilters}
                  submitLabel={tc('actions.search')}
                  clearLabel={t('filters.clear')}
                />
              }
            >
              {optsQ.isLoading ? (
                <Skeleton
                  className="h-32 w-full rounded-card"
                  aria-label={t('filters.loading')}
                />
              ) : optsQ.isError ? (
                <EmptyState
                  icon={AlertCircle}
                  title={t('filters.loadFailed')}
                  description={
                    optsQ.error instanceof Error
                      ? optsQ.error.message
                      : t('filters.genericError')
                  }
                  action={{ label: tc('actions.retry'), onClick: () => void optsQ.refetch() }}
                />
              ) : (
                <SchedulingFilterGrid>
                  <Controller
                    name="activity"
                    control={form.control}
                    render={({ field }) => (
                      <FilterMultiSelect
                        label={two('filters.labels.activity')}
                        options={optsQ.data?.activities ?? []}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="wktype"
                    control={form.control}
                    render={({ field }) => (
                      <FilterMultiSelect
                        label={t('filters.labels.wktype')}
                        options={wktypeOptions}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="wkctr"
                    control={form.control}
                    render={({ field }) => (
                      <FilterMultiSelect
                        label={t('filters.labels.wkctr')}
                        options={optsQ.data?.workcenters ?? []}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="functionalloc"
                    control={form.control}
                    render={({ field }) => (
                      <FilterMultiSelect
                        label={t('filters.labels.fl')}
                        options={optsQ.data?.functionals ?? []}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="equipment"
                    control={form.control}
                    render={({ field }) => (
                      <FilterMultiSelect
                        label={two('filters.labels.equipment')}
                        options={optsQ.data?.equipments ?? []}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </SchedulingFilterGrid>
              )}
            </SchedulingFilterShell>
          </form>
        </AppPageSection>

        <AppPageSection index={1}>
          <BacklogWorkcenterSummary
            data={filterDetailQ.data}
            isLoading={filterDetailQ.isLoading}
            isError={filterDetailQ.isError}
            error={filterDetailQ.error as Error | null}
            isRefreshing={filterDetailQ.isFetching && !filterDetailQ.isLoading}
            collapsible
            defaultOpen={false}
          />
        </AppPageSection>

        <AppPageSection index={2}>
          <SchedulingColorLegendStrip collapsible defaultOpen={false} />
        </AppPageSection>

        <AppPageSection index={3}>
          {eventsQ.isLoading && !eventsQ.data ? (
            <Skeleton
              className="h-[28rem] w-full rounded-card"
              aria-label={t('backlog.loading')}
            />
          ) : eventsQ.isError ? (
            <QueryLoadErrorState
              title={t('backlog.loadFailed')}
              error={eventsQ.error}
              description={
                <>
                  {t('backlog.loadFailedHint')}{' '}
                  <code className="text-xs">backlog.read</code>
                  {eventsQ.error instanceof Error ? ` — ${eventsQ.error.message}` : null}
                </>
              }
              action={{ label: tc('actions.retry'), onClick: () => void eventsQ.refetch() }}
            />
          ) : (
            <SchedulingCalendarPanel
              title={t('backlog.panelTitle')}
              subtitle={t('backlog.panelSubtitle')}
              eventCount={eventsQ.data?.items?.length ?? 0}
              isRefreshing={eventsQ.isFetching && !eventsQ.isLoading}
            >
              <MonthFullCalendar
                year={year}
                month={month}
                viewMode="month-week-day"
                yearMin={2015}
                yearMax={2030}
                events={eventsQ.data?.items ?? []}
                dayWkctrNotes={dayWkctrNotes}
                className="scheduling-calendar-widget"
                onMonthChange={(y, m) => {
                  setYear(y)
                  setMonth(m)
                }}
                onRangeSelect={(from, to) => {
                  setMhFrom(from)
                  setMhTo(to)
                  setMhOpen(true)
                }}
                onEventClick={(e) => setDetailTarget({ id: e.id, date: e.date })}
                onEventDrop={canMovePlan ? (e, newDate) => openMove(e, newDate) : undefined}
              />
            </SchedulingCalendarPanel>
          )}
        </AppPageSection>
      </AppPageShell>

      <WorkOrderDetailDialog
        orderId={detailTarget?.id ?? null}
        contextDate={detailTarget?.date}
        onOpenChange={(o) => !o && setDetailTarget(null)}
      />

      <MovePlanDialog
        open={Boolean(moveTarget)}
        onOpenChange={(o) => !o && setMoveTarget(null)}
        idiw37={moveTarget?.idiw37 ?? ''}
        wkorder={moveTarget?.wkorder}
        defaultDate={moveTarget?.date}
        moveReasonRequired={moveTarget?.moveReasonRequired ?? true}
        onSuccess={() => void eventsQ.refetch()}
      />

      <ManhourSummaryDialog
        open={mhOpen}
        onOpenChange={setMhOpen}
        fromDate={mhFrom}
        toDate={mhTo}
      />
    </>
  )
}
