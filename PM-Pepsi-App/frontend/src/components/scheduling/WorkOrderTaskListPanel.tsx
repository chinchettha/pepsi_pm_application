import {
  SchedulingPageSection,
  SchedulingSection,
} from '@/components/scheduling/SchedulingPageLayout'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ClipboardCheck,
  Cog,
  Factory,
  Layers,
  ListChecks,
  MapPin,
  Package,
  PauseCircle,
  PlayCircle,
} from 'lucide-react'
import type { WoPmExecution } from '@/api/schemas'
import { WorkOrderPmMeasurementBlock } from '@/components/scheduling/WorkOrderPmMeasurementBlock'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export type WorkOrderTaskListSummary = {
  tasklist: string
  productline: string
  zone: string
  wkctrtype: string
}

export type WorkOrderTaskListItem = {
  tasklist: string
  machine: string
  pmlist: string
  machinestatus: number | null
  mat: string
  matdescrip: string
  measurementKind?: 'current_3phase' | 'vibration_3axis' | 'none'
  mpoint?: string
  measurementTitle?: string
  axisLabels?: [string, string, string]
  unit?: string
}

export type WorkOrderTaskListData = {
  mntplan: string
  summary: WorkOrderTaskListSummary | null
  items: WorkOrderTaskListItem[]
}

type Props = {
  taskList: WorkOrderTaskListData
  orderId?: string
  pmExecution?: WoPmExecution
  onPmSaved?: () => void
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
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

function machineStatusMeta(
  status: number | null,
  t: ReturnType<typeof useTranslation>['t'],
): {
  label: string
  running: boolean
} {
  if (status === 1) return { label: t('taskList.stopped'), running: false }
  return { label: t('taskList.running'), running: true }
}

function SummaryChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Factory
  label: string
  value: string
}) {
  if (!value.trim()) return null
  return (
    <div className="flex items-center gap-2 rounded-button border border-sky-200/70 app-surface-panel--soft px-3 py-2">
      <Icon className="size-4 shrink-0 text-sky-700" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-800/70">{label}</p>
        <p className="truncate text-body-sm font-medium text-sky-950">{value}</p>
      </div>
    </div>
  )
}

function TaskListItemCard({
  item,
  index,
  reduceMotion,
  orderId,
  pmExecution,
  onPmSaved,
  t,
  fallbackAxisLabels,
}: {
  item: WorkOrderTaskListItem
  index: number
  reduceMotion: boolean | null
  orderId?: string
  pmExecution?: WoPmExecution
  onPmSaved?: () => void
  t: ReturnType<typeof useTranslation>['t']
  fallbackAxisLabels: [string, string, string]
}) {
  const status = machineStatusMeta(item.machinestatus, t)

  return (
    <motion.li
      layout={!reduceMotion}
      variants={reduceMotion ? undefined : cardVariants}
      className="group"
    >
      <article
        className={cn(
          'relative overflow-hidden rounded-card border bg-[var(--app-surface)] p-4 shadow-sm transition-shadow duration-200',
          'hover:shadow-md',
          status.running
            ? 'border-emerald-200/80 hover:border-emerald-300/90'
            : 'border-amber-200/80 hover:border-amber-300/90',
        )}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-1',
            status.running ? 'bg-emerald-500' : 'bg-amber-500',
          )}
          aria-hidden
        />

        <div className="flex flex-wrap items-start gap-3 pl-2">
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums',
              status.running
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-900',
            )}
          >
            {index + 1}
          </span>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-medium text-app-muted">
                  <Cog className="size-3.5 shrink-0" aria-hidden />
                  {t('taskList.machine')}
                </p>
                <p className="mt-0.5 truncate font-semibold text-app">{item.machine || '—'}</p>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                  status.running
                    ? 'bg-emerald-600/10 text-emerald-800'
                    : 'bg-amber-600/10 text-amber-900',
                )}
              >
                {status.running ? (
                  <PlayCircle className="size-3.5" aria-hidden />
                ) : (
                  <PauseCircle className="size-3.5" aria-hidden />
                )}
                {status.label}
              </span>
            </div>

            <div className="rounded-button bg-app-subtle/45 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-app-muted">
                {t('taskList.pmItem')}
              </p>
              <p className="mt-0.5 text-body-sm font-medium text-app">{item.pmlist || '—'}</p>
            </div>

            {item.mat ? (
              <div className="flex items-start gap-2 rounded-button border border-app/60 app-surface-panel px-3 py-2">
                <Package className="mt-0.5 size-4 shrink-0 text-app-muted" aria-hidden />
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-app">{item.mat}</p>
                  {item.matdescrip ? (
                    <p className="mt-0.5 text-xs leading-relaxed text-app-muted">{item.matdescrip}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {orderId && pmExecution ? (
              <WorkOrderPmMeasurementBlock
                orderId={orderId}
                item={{
                  ...item,
                  measurementKind: item.measurementKind ?? 'none',
                  mpoint: item.mpoint ?? '',
                  measurementTitle: item.measurementTitle ?? '',
                  axisLabels: item.axisLabels ?? fallbackAxisLabels,
                  unit: item.unit ?? '',
                }}
                pmExecution={pmExecution}
                onSaved={() => onPmSaved?.()}
              />
            ) : null}
          </div>
        </div>
      </article>
    </motion.li>
  )
}

export function WorkOrderTaskListPanel({
  taskList,
  orderId,
  pmExecution,
  onPmSaved,
}: Props) {
  const { t } = useTranslation('scheduling')
  const reduceMotion = useReducedMotion()
  const { summary, items, mntplan } = taskList
  const fallbackAxisLabels = useMemo(
    (): [string, string, string] => [
      t('pmMeasurement.valueN', { n: 1 }),
      t('pmMeasurement.valueN', { n: 2 }),
      t('pmMeasurement.valueN', { n: 3 }),
    ],
    [t],
  )

  const stats = useMemo(() => {
    let running = 0
    let stopped = 0
    for (const item of items) {
      if (item.machinestatus === 1) stopped += 1
      else running += 1
    }
    return { total: items.length, running, stopped }
  }, [items])

  if (!summary && items.length === 0) {
    return (
      <SchedulingPageSection index={0}>
        <div className="rounded-card border border-dashed border-app px-6 py-12 text-center">
          <ListChecks className="mx-auto size-10 text-app-muted/60" aria-hidden />
          <p className="mt-3 font-medium text-app">{t('taskList.notFoundTitle')}</p>
          <p className="mt-1 text-body-sm text-app-muted">{t('taskList.notFoundDesc')}</p>
        </div>
      </SchedulingPageSection>
    )
  }

  return (
    <div className="space-y-4">
      {summary ? (
        <SchedulingPageSection index={0}>
          <motion.div
            layout={!reduceMotion}
            className="overflow-hidden rounded-card border border-sky-200/90 bg-gradient-to-br from-sky-50 via-[var(--app-surface)] to-[color-mix(in_srgb,var(--app-accent)_5%,var(--app-surface))] p-4 shadow-[var(--app-shadow-card)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-800/70">
                  {t('taskList.headerTitle')}
                </p>
                <p className="font-mono text-2xl font-bold tracking-tight text-sky-950">
                  {summary.tasklist}
                </p>
                {mntplan ? (
                  <p className="mt-1 text-xs text-app-muted">
                    {t('taskList.pmPlan')}{' '}
                    <span className="font-mono font-medium text-app">{mntplan}</span>
                  </p>
                ) : null}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-600/10 px-3 py-1 text-xs font-semibold text-sky-900">
                <ClipboardCheck className="size-3.5" aria-hidden />
                {t('shared.items', { count: stats.total })}
              </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryChip icon={Factory} label={t('taskList.productLine')} value={summary.productline} />
              <SummaryChip icon={MapPin} label={t('taskList.zone')} value={summary.zone} />
              <SummaryChip icon={Layers} label={t('taskList.wkctrType')} value={summary.wkctrtype} />
            </div>
          </motion.div>
        </SchedulingPageSection>
      ) : null}

      {items.length > 0 ? (
        <SchedulingPageSection index={1}>
          <SchedulingSection
            icon={ListChecks}
            title={t('taskList.itemsTitle')}
            description={t('taskList.itemsDesc')}
            badge={
              <span className="rounded-full bg-app-subtle px-2 py-0.5 text-[10px] font-semibold text-app-muted">
                {t('taskList.runningStopped', { running: stats.running, stopped: stats.stopped })}
              </span>
            }
            bodyClassName="space-y-3"
          >
            <motion.ul
              layout={!reduceMotion}
              variants={reduceMotion ? undefined : listVariants}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => (
                  <TaskListItemCard
                    key={`${item.tasklist}-${item.machine}-${item.pmlist}-${idx}`}
                    item={item}
                    index={idx}
                    reduceMotion={reduceMotion}
                    orderId={orderId}
                    pmExecution={pmExecution}
                    onPmSaved={onPmSaved}
                    t={t}
                    fallbackAxisLabels={fallbackAxisLabels}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          </SchedulingSection>
        </SchedulingPageSection>
      ) : (
        <SchedulingPageSection index={1}>
          <p className="rounded-card border border-dashed border-app px-4 py-8 text-center text-body-sm text-app-muted">
            {t('taskList.headerOnly')}
          </p>
        </SchedulingPageSection>
      )}
    </div>
  )
}
