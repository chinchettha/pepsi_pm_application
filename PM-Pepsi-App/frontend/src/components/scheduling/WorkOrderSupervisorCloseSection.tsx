import {
  SchedulingPageSection,
  SchedulingSection,
} from '@/components/scheduling/SchedulingPageLayout'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatPersonnelCloseDuration } from '@/lib/personnel-close-format'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  Timer,
  Trash2,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export type SupervisorCloseItem = {
  idclose: number
  wkctr: string
  displayName: string
  stdate: number
  endate: number
  timewk: number
  unitc: string
}

type Props = {
  closeWkctr: string
  onCloseWkctrChange: (v: string) => void
  startDate: string
  onStartDateChange: (v: string) => void
  startTime: string
  onStartTimeChange: (v: string) => void
  endDate: string
  onEndDateChange: (v: string) => void
  endTime: string
  onEndTimeChange: (v: string) => void
  onSubmit: () => void
  submitPending: boolean
  submitDisabled: boolean
  isLoading: boolean
  isError: boolean
  error: Error | null
  items: SupervisorCloseItem[]
  onDelete: (idclose: number) => void
  deletePending: boolean
  /** ดูอย่างเดียว — ซ่อนฟอร์มบันทึกและปุ่มลบ (ข้อ 4.1 ปฏิทิน) */
  readOnly?: boolean
}

function fmtDateTime(sec: number): string {
  const d = new Date(sec * 1000)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`
}

function previewMinutes(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): number | null {
  if (!startDate || !endDate || !startTime || !endTime) return null
  const start = new Date(`${startDate}T${startTime}`)
  const end = new Date(`${endDate}T${endTime}`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  const diff = (end.getTime() - start.getTime()) / 60000
  return diff > 0 ? Math.round(diff) : null
}

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function TimePhaseFields({
  step,
  title,
  dateId,
  timeId,
  date,
  onDateChange,
  time,
  onTimeChange,
  tone = 'start',
}: {
  step: number
  title: string
  dateId: string
  timeId: string
  date: string
  onDateChange: (v: string) => void
  time: string
  onTimeChange: (v: string) => void
  tone?: 'start' | 'end'
}) {
  const { t } = useTranslation('scheduling')
  return (
    <div
      className={cn(
        'flex-1 rounded-xl border p-4 shadow-sm',
        tone === 'start'
          ? 'border-teal-200/80 bg-gradient-to-br from-teal-50/90 to-white'
          : 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-white',
      )}
    >
      <p className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm',
            tone === 'start' ? 'bg-teal-600' : 'bg-emerald-600',
          )}
        >
          {step}
        </span>
        <span className="text-sm font-semibold text-app">{title}</span>
      </p>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-[1fr_7.5rem]">
        <div className="space-y-1.5">
          <Label htmlFor={dateId} className="text-xs font-medium text-app-muted">
            {t('shared.date')}
          </Label>
          <DatePicker
            id={dateId}
            value={date}
            onChange={onDateChange}
            className="h-10 w-full min-w-0"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={timeId} className="text-xs font-medium text-app-muted">
            {t('shared.time')}
          </Label>
          <Input
            id={timeId}
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="h-10 w-full tabular-nums"
          />
        </div>
      </div>
    </div>
  )
}

function TimelineConnector() {
  return (
    <>
      <div className="flex flex-col items-center gap-1 py-1 lg:hidden" aria-hidden>
        <div className="h-4 w-px bg-teal-200" />
        <span className="flex size-8 items-center justify-center rounded-full border border-teal-200/70 app-surface-panel text-teal-700 shadow-sm dark:text-teal-300">
          <ArrowRight className="size-4 rotate-90" />
        </span>
        <div className="h-4 w-px bg-teal-200" />
      </div>
      <div className="hidden shrink-0 items-center gap-1 self-center px-1 lg:flex" aria-hidden>
        <div className="h-px w-6 bg-teal-200" />
        <span className="flex size-8 items-center justify-center rounded-full border border-teal-200/70 app-surface-panel text-teal-700 shadow-sm dark:text-teal-300">
          <ArrowRight className="size-4" />
        </span>
        <div className="h-px w-6 bg-teal-200" />
      </div>
    </>
  )
}

function CloseTimelineForm({
  startDate,
  onStartDateChange,
  startTime,
  onStartTimeChange,
  endDate,
  onEndDateChange,
  endTime,
  onEndTimeChange,
  previewMin,
  closeWkctr,
  onSubmit,
  submitPending,
  submitDisabled,
  t,
  tc,
}: {
  startDate: string
  onStartDateChange: (v: string) => void
  startTime: string
  onStartTimeChange: (v: string) => void
  endDate: string
  onEndDateChange: (v: string) => void
  endTime: string
  onEndTimeChange: (v: string) => void
  previewMin: number | null
  closeWkctr: string
  onSubmit: () => void
  submitPending: boolean
  submitDisabled: boolean
  t: ReturnType<typeof useTranslation>['t']
  tc: ReturnType<typeof useTranslation>['t']
}) {
  const reduceMotion = useReducedMotion()
  const invalidRange =
    previewMin == null && Boolean(startDate && endDate && startTime && endTime)

  return (
    <div className="space-y-4">
      {closeWkctr.trim() ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-app-muted">{t('woSupervisorClose.workCenter')}</span>
          <span className="rounded-full bg-teal-600/10 px-3 py-1 font-mono text-xs font-semibold text-teal-900">
            {closeWkctr.trim()}
          </span>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-teal-200/70 bg-[color-mix(in_srgb,var(--app-accent)_3%,var(--app-surface))] p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
          <TimePhaseFields
            step={1}
            title={t('woSupervisorClose.startWork')}
            dateId="c-start-date"
            timeId="c-start-time"
            date={startDate}
            onDateChange={onStartDateChange}
            time={startTime}
            onTimeChange={onStartTimeChange}
            tone="start"
          />
          <TimelineConnector />
          <TimePhaseFields
            step={2}
            title={t('woSupervisorClose.endWork')}
            dateId="c-end-date"
            timeId="c-end-time"
            date={endDate}
            onDateChange={onEndDateChange}
            time={endTime}
            onTimeChange={onEndTimeChange}
            tone="end"
          />
        </div>

        <AnimatePresence mode="wait">
          {previewMin != null ? (
            <motion.div
              key="preview-ok"
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-3"
            >
              <p className="flex flex-wrap items-center gap-2 text-body-sm text-teal-950">
                <Timer className="size-4 shrink-0 text-teal-700" aria-hidden />
                {t('woSupervisorClose.duration')}
                <strong className="font-semibold">{formatPersonnelCloseDuration(previewMin)}</strong>
              </p>
            </motion.div>
          ) : invalidRange ? (
            <motion.p
              key="preview-bad"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="app-callout app-callout--amber mt-3 px-4 py-3 text-xs"
            >
              {t('woSupervisorClose.invalidRange')}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <Button
        type="button"
        size="lg"
        className={cn(
          'h-11 w-full shadow-sm sm:w-auto sm:min-w-[12rem]',
          'bg-teal-700 hover:bg-teal-800',
        )}
        onClick={onSubmit}
        disabled={submitDisabled || submitPending}
      >
        {submitPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {tc('shared.saving')}
          </>
        ) : (
          t('woSupervisorClose.submit')
        )}
      </Button>
    </div>
  )
}

export function WorkOrderSupervisorCloseSection({
  closeWkctr,
  onCloseWkctrChange: _onCloseWkctrChange,
  startDate,
  onStartDateChange,
  startTime,
  onStartTimeChange,
  endDate,
  onEndDateChange,
  endTime,
  onEndTimeChange,
  onSubmit,
  submitPending,
  submitDisabled,
  isLoading,
  isError,
  error,
  items,
  onDelete,
  deletePending,
  readOnly = false,
}: Props) {
  const { t } = useTranslation('scheduling')
  const { t: tc } = useTranslation(['scheduling', 'common'])
  const reduceMotion = useReducedMotion()

  const previewMin = useMemo(
    () => previewMinutes(startDate, startTime, endDate, endTime),
    [startDate, startTime, endDate, endTime],
  )

  const stats = useMemo(() => {
    const totalTime = items.reduce((sum, row) => sum + (row.timewk ?? 0), 0)
    const unit = items[0]?.unitc?.trim() || 'Min'
    return { count: items.length, totalTime, unit }
  }, [items])

  return (
    <div className="space-y-4">
      <SchedulingPageSection index={0}>
        <motion.div
          layout={!reduceMotion}
          className="overflow-hidden rounded-card border border-teal-200/90 bg-gradient-to-br from-teal-50 via-[var(--app-surface)] to-[color-mix(in_srgb,var(--app-accent)_4%,var(--app-surface))] p-4 shadow-[var(--app-shadow-card)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-800/70">
                <CheckCircle2 className="size-3.5" aria-hidden />
                {t('woSupervisorClose.title')}
              </p>
              <p className="mt-0.5 text-body-sm text-app-muted">{t('woSupervisorClose.subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-600/10 px-3 py-1 text-xs font-semibold text-teal-900">
                <Clock className="size-3.5" aria-hidden />
                {t('shared.items', { count: stats.count })}
              </span>
              {stats.count > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-600/10 px-3 py-1 text-xs font-semibold text-teal-900">
                  <Timer className="size-3.5" aria-hidden />
                  {t('woSupervisorClose.total', { time: stats.totalTime, unit: stats.unit })}
                </span>
              ) : null}
            </div>
          </div>
        </motion.div>
      </SchedulingPageSection>

      {!readOnly ? (
        <SchedulingPageSection index={1}>
          <SchedulingSection
            icon={CalendarClock}
            title={t('woSupervisorClose.recordTitle')}
            description={t('woSupervisorClose.recordDesc')}
            bodyClassName="pt-1"
          >
            <CloseTimelineForm
              startDate={startDate}
              onStartDateChange={onStartDateChange}
              startTime={startTime}
              onStartTimeChange={onStartTimeChange}
              endDate={endDate}
              onEndDateChange={onEndDateChange}
              endTime={endTime}
              onEndTimeChange={onEndTimeChange}
              previewMin={previewMin}
              closeWkctr={closeWkctr}
              onSubmit={onSubmit}
              submitPending={submitPending}
              submitDisabled={submitDisabled}
              t={t}
              tc={tc}
            />
          </SchedulingSection>
        </SchedulingPageSection>
      ) : null}

      <SchedulingPageSection index={readOnly ? 1 : 2}>
        <SchedulingSection
          icon={Clock}
          title={t('woSupervisorClose.historyTitle')}
          badge={
            items.length > 0 ? (
              <span className="rounded-full bg-app-subtle px-2 py-0.5 text-[10px] font-semibold text-app-muted">
                {t('shared.items', { count: items.length })}
              </span>
            ) : null
          }
          bodyClassName="space-y-3"
        >
          {isLoading ? (
            <Skeleton className="h-24 w-full rounded-card" />
          ) : isError ? (
            <p className="text-body-sm text-form-error">{error?.message ?? t('shared.loadingFailed')}</p>
          ) : items.length === 0 ? (
            <p className="rounded-card border border-dashed border-app px-4 py-8 text-center text-body-sm text-app-muted">
              {t('woSupervisorClose.emptyHistory')}
            </p>
          ) : (
            <motion.ul
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              variants={
                reduceMotion
                  ? undefined
                  : {
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.04 } },
                    }
              }
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {items.map((c, idx) => (
                  <motion.li
                    key={c.idclose}
                    variants={reduceMotion ? undefined : cardVariants}
                    className="group"
                  >
                    <article className="overflow-hidden rounded-card border border-teal-200/75 bg-[var(--app-surface)] shadow-sm transition-all duration-200 hover:shadow-md">
                      <div className="flex items-stretch">
                        <div className="w-1 shrink-0 bg-teal-500" aria-hidden />
                        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 p-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-sm font-bold text-teal-900">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-app">
                                {c.displayName?.trim() ? c.displayName : t('shared.noName')}
                              </p>
                              {c.wkctr ? (
                                <p className="mt-0.5 font-mono text-xs text-app-muted">{c.wkctr}</p>
                              ) : null}
                              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-app-muted">
                                <span>{fmtDateTime(c.stdate)}</span>
                                <ArrowRight className="size-3 shrink-0" aria-hidden />
                                <span>{fmtDateTime(c.endate)}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="rounded-full bg-teal-600/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-teal-900">
                              {c.timewk} {c.unitc}
                            </span>
                            {!readOnly ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onDelete(c.idclose)}
                                disabled={deletePending}
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                                {t('shared.delete')}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </SchedulingSection>
      </SchedulingPageSection>
    </div>
  )
}
