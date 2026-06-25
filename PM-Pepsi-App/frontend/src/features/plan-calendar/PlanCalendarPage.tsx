import { CanPermission } from '@/components/auth/CanPermission'
import {
  AppPageSection,
  AppPageShell,
} from '@/components/layout/AppPageShell'
import { PlanningAssignDialog, type PlanningAssignTarget } from '@/components/planning/PlanningAssignDialog'
import { ManhourSummaryDialog } from '@/components/scheduling/ManhourSummaryDialog'
import { MovePlanDialog } from '@/components/scheduling/MovePlanDialog'
import { MonthFullCalendar } from '@/components/scheduling/MonthFullCalendar'
import { PlanCalendarPipelineStats } from '@/components/scheduling/PlanCalendarPipelineStats'
import { PlannerPipelineLegend } from '@/components/scheduling/PlannerPipelineLegend'
import { SchedulingCalendarPanel } from '@/components/scheduling/SchedulingPageLayout'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchPlanCalendarEvents } from '@/lib/api-public'
import { operationsLiveQueryOptions } from '@/lib/operations-live-sync'
import type { ScheduleCalendarEvent } from '@/lib/schedule-calendar'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CalendarRange } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatCalendarMonthLabel } from '@/lib/format-month-label'
import { useAppLocale } from '@/providers/I18nProvider'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

/**
 * — ปฏิทินงานเปิดของช่าง (view_planwork + idwkctr)
 */
export function PlanCalendarPage() {
  const { t } = useTranslation('scheduling')
  const { t: tc } = useTranslation('common')
  const { locale } = useAppLocale()
  const canMovePlan = usePermission('calendar.write')
  const [searchParams, setSearchParams] = useSearchParams()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [detailTarget, setDetailTarget] = useState<{ id: string; date: string } | null>(
    null,
  )
  const [mhOpen, setMhOpen] = useState(false)
  const [mhFrom, setMhFrom] = useState('')
  const [mhTo, setMhTo] = useState('')
  const [assignTarget, setAssignTarget] = useState<PlanningAssignTarget | null>(null)
  const [moveTarget, setMoveTarget] = useState<{
    idiw37: string
    wkorder: string
    date: string
    moveReasonRequired: boolean
  } | null>(null)
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['plan-calendar', year, month],
    queryFn: () => fetchPlanCalendarEvents(year, month),
    placeholderData: keepPreviousData,
    ...operationsLiveQueryOptions,
  })

  const eventCount = q.data?.items?.length ?? 0
  const monthLabel = formatCalendarMonthLabel(month, year, locale)
  const isPlannerScope = q.data?.scope === 'planner'
  const pipelineCounts = q.data?.pipelineCounts
  const dayOrderCounts = q.data?.dayOrderCounts

  useEffect(() => {
    const rawId = searchParams.get('idiw37')?.trim()
    const rawDate = searchParams.get('date')?.trim()
    if (!rawId || !rawDate) return
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawDate)
    if (!m) return

    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        params.delete('idiw37')
        params.delete('date')
        return params
      },
      { replace: true },
    )

    const y = Number(m[1])
    const mm = Number(m[2])
    if (Number.isFinite(y) && Number.isFinite(mm) && mm >= 1 && mm <= 12) {
      setYear(y)
      setMonth(mm)
    }
    setDetailTarget({ id: rawId, date: rawDate })
  }, [searchParams, setSearchParams])

  const openMove = (event: ScheduleCalendarEvent, date: string) => {
    if (!canMovePlan) {
      toast.error(t('calendar.noMovePermission'))
      return
    }
    if (event.canMovePlan === false) {
      toast.error(t('calendar.planNotMovable'))
      return
    }
    setMoveTarget({
      idiw37: event.id,
      wkorder: event.orderId ?? event.title,
      date,
      moveReasonRequired: event.moveReasonRequired !== false,
    })
  }

  return (
    <>
      <AppPageShell
        title={t('planCalendar.title')}
        description={t('planCalendar.heroDescription')}
        eyebrow=""
        heroClassName="dashboard-hero--slim"
        heroAnimated={false}
        contentClassName="plan-calendar-page"
        headerActions={
          <>
            <CanPermission permission="planning.read">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="dashboard-hero__btn gap-2"
                asChild
              >
                <Link to="/planning">{t('planCalendar.pmPlanning')}</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="calendar.read">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="dashboard-hero__btn gap-2"
                asChild
              >
                <Link to="/calendar">
                  <CalendarRange className="size-4" aria-hidden />
                  {t('planCalendar.workScheduling')}
                </Link>
              </Button>
            </CanPermission>
          </>
        }
      >
        <AppPageSection index={0}>
          {q.isLoading ? (
            <Skeleton
              className="h-[32rem] w-full rounded-card"
              aria-label={t('planCalendar.loading')}
            />
          ) : q.isError ? (
            <EmptyState
              icon={AlertCircle}
              title={t('planCalendar.loadFailed')}
              description={
                <>
                  {t('planCalendar.loadFailedHint')}{' '}
                  <code className="text-xs">planning.read</code>
                  {q.error instanceof Error ? ` — ${q.error.message}` : null}
                </>
              }
              action={{ label: tc('actions.retry'), onClick: () => void q.refetch() }}
            />
          ) : (
            <SchedulingCalendarPanel
              title={
                isPlannerScope
                  ? t('planCalendar.panelTitle')
                  : t('planCalendar.panelTitleAssignee')
              }
              subtitle={
                isPlannerScope
                  ? t('planCalendar.panelSubtitle')
                  : t('planCalendar.panelSubtitleAssignee')
              }
              eventCount={eventCount}
              isRefreshing={q.isFetching && !q.isLoading}
              legend={<PlannerPipelineLegend variant="inline" />}
              className="plan-calendar-panel"
            >
              <div className="plan-calendar-panel__toolbar">
                <span className="plan-calendar-panel__month">{monthLabel}</span>
              </div>
              {pipelineCounts ? (
                <PlanCalendarPipelineStats counts={pipelineCounts} className="mb-3" />
              ) : null}
              {eventCount === 0 ? (
                <p className="text-caption mt-3 rounded-button border border-dashed border-app bg-app-subtle/50 px-3 py-2">
                  {t('planCalendar.emptyMonth')}
                </p>
              ) : null}
              <MonthFullCalendar
                year={year}
                month={month}
                viewMode="month-week-day"
                yearMin={2015}
                yearMax={2035}
                showPeriodPicker
                events={q.data?.items ?? []}
                className="scheduling-calendar-widget scheduling-calendar-widget--plan"
                dayMaxEvents={isPlannerScope ? 4 : 5}
                dayOrderCounts={dayOrderCounts}
                denseEvents={isPlannerScope}
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
        tabLayout="assigned"
        initialTab="task-list"
        onOpenChange={(o) => !o && setDetailTarget(null)}
      />

      <MovePlanDialog
        open={Boolean(moveTarget)}
        onOpenChange={(o) => !o && setMoveTarget(null)}
        idiw37={moveTarget?.idiw37 ?? ''}
        wkorder={moveTarget?.wkorder}
        defaultDate={moveTarget?.date}
        moveReasonRequired={moveTarget?.moveReasonRequired ?? true}
        onSuccess={() => void q.refetch()}
      />

      <ManhourSummaryDialog
        open={mhOpen}
        onOpenChange={setMhOpen}
        fromDate={mhFrom}
        toDate={mhTo}
        onAssign={(row) => {
          setAssignTarget({
            idiw37: row.idiw37,
            wkorder: row.wkorder,
            planDate: row.planDate,
            workHours: row.workHours,
          })
        }}
      />

      <PlanningAssignDialog
        target={assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssignSuccess={() => {
          void qc.invalidateQueries({ queryKey: ['backlog', 'manhour-summary'] })
          void qc.invalidateQueries({ queryKey: ['plan-calendar'] })
        }}
      />
    </>
  )
}
