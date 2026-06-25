import { Link } from 'react-router-dom'
import {
  SchedulingPageSection,
  SchedulingSection,
} from '@/components/scheduling/SchedulingPageLayout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ClipboardCheck,
  ExternalLink,
  Factory,
  Layers,
  ListChecks,
  MapPin,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export type WorkOrderTaskListSummary = {
  tasklist: string
  legacy: string
  productline: string
  zone: string
  wkctrtype: string
}

export type WorkOrderTaskListItem = {
  tasklist: string
  machine: string
  pmlist: string
  description?: string
  displayLine?: string
  headerShortText?: string
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

export type WorkOrderTaskWoContext = {
  wkorder: string
  plannedDate: string
  status: string
  mntplan: string
}

/** SAP-style plan header from IW37N — same shape as modal `woHeader` */
export type WorkOrderPlanDetailHeader = {
  functionalLocation: string
  equipment: string
  descriptionLine1: string
  descriptionLine2: string
  operationNumber: string
  operationText: string
}

type Props = {
  taskList: WorkOrderTaskListData
  /** Calendar / plan-calendar assigned modal — compact chrome (context strip, hide hero chips) */
  plannerLayout?: boolean
  planDetailHeader?: WorkOrderPlanDetailHeader | null
  woContext?: WorkOrderTaskWoContext | null
  canAssign?: boolean
  onGoPlanning?: () => void
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

function stripLabelValue(label: string): string {
  const idx = label.indexOf(' = ')
  return idx >= 0 ? label.slice(idx + 3).trim() : label.trim()
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
    <div className="flex items-center gap-2 rounded-button border border-app/60 app-tone-info-inner px-3 py-2">
      <Icon className="size-4 shrink-0 app-tone-info-icon" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide app-tone-info-eyebrow">{label}</p>
        <p className="truncate text-body-sm font-medium text-app">{value}</p>
      </div>
    </div>
  )
}

function WoContextStrip({
  ctx,
  t,
}: {
  ctx: WorkOrderTaskWoContext
  t: ReturnType<typeof useTranslation>['t']
}) {
  const mnt = ctx.mntplan.trim()
  return (
    <div className="rounded-card border border-app/70 bg-app-subtle/35 px-3 py-2.5 text-body-sm text-app">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono font-semibold">{ctx.wkorder}</span>
        {ctx.plannedDate ? (
          <>
            <span className="text-app-muted" aria-hidden>
              ·
            </span>
            <span>{ctx.plannedDate}</span>
          </>
        ) : null}
        {ctx.status ? (
          <>
            <span className="text-app-muted" aria-hidden>
              ·
            </span>
            <span className="rounded-full bg-app-subtle px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-app">
              {ctx.status}
            </span>
          </>
        ) : null}
        {mnt ? (
          <>
            <span className="text-app-muted" aria-hidden>
              ·
            </span>
            <span className="text-app-muted">{t('taskList.pmPlan')}</span>
            <a
              href={`/master-plan?q=${encodeURIComponent(mnt)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono font-semibold text-primary hover:underline"
            >
              {mnt}
              <ExternalLink className="size-3.5 shrink-0" aria-hidden />
            </a>
          </>
        ) : null}
      </p>
    </div>
  )
}

/** SAP Operation Long Text line — e.g. `Water Dosing Pump-ตรวจเช็ค.../00=Emergency` */
function taskItemOperationLongLine(item: WorkOrderTaskListItem): string {
  const machine = item.machine?.trim() ?? ''
  const pmlist = item.pmlist?.trim() ?? ''
  if (machine && pmlist) return `${machine}-${pmlist}`
  return item.displayLine?.trim() || machine || pmlist || ''
}

function PlanDetailLabelValue({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  if (!value.trim()) return null
  return (
    <div className="min-w-0 space-y-0.5">
      <p className="text-xs font-semibold text-app-muted">{label}</p>
      <p className={cn('text-body-sm leading-snug text-app', mono && 'font-mono')}>{value}</p>
    </div>
  )
}

function PlanDetailPairRow({
  leftLabel,
  leftValue,
  leftMono,
  rightLabel,
  rightValue,
  rightMono,
}: {
  leftLabel: string
  leftValue: string
  leftMono?: boolean
  rightLabel: string
  rightValue: string
  rightMono?: boolean
}) {
  if (!leftValue.trim() && !rightValue.trim()) return null
  return (
    <div className="grid gap-4 border-b border-app/35 pb-3 sm:grid-cols-2">
      <PlanDetailLabelValue label={leftLabel} value={leftValue} mono={leftMono} />
      <PlanDetailLabelValue label={rightLabel} value={rightValue} mono={rightMono} />
    </div>
  )
}

function PlannerPlanDetailCard({
  items,
  header,
  reduceMotion,
  t,
}: {
  items: WorkOrderTaskListItem[]
  header: WorkOrderPlanDetailHeader | null | undefined
  reduceMotion: boolean | null
  t: ReturnType<typeof useTranslation>['t']
}) {
  const headerShortText =
    items.map((item) => item.headerShortText?.trim() ?? '').find((line) => line.length > 0) ?? ''
  const operationLongLines = items
    .map((item) => taskItemOperationLongLine(item))
    .filter((line) => line.length > 0)

  const stoppedCount = items.filter((item) => item.machinestatus === 1).length
  const runningCount = items.length - stoppedCount
  const planStopped = stoppedCount > 0 && runningCount === 0

  return (
    <motion.article
      layout={!reduceMotion}
      variants={reduceMotion ? undefined : cardVariants}
      className={cn(
        'overflow-hidden rounded-card border bg-[var(--app-surface)] shadow-sm',
        planStopped ? 'app-tone-warning-tile' : 'app-tone-success-stat',
      )}
    >
      <div className="space-y-4 p-4">
        {headerShortText ? (
          <div className="rounded-button border border-app/50 bg-app-subtle/30 px-3 py-2.5">
            <p className="text-xs font-semibold text-app-muted">{t('taskList.headerShortText')}</p>
            <p className="mt-0.5 font-mono text-body font-semibold tracking-tight text-app">
              {headerShortText}
            </p>
          </div>
        ) : null}

        {header ? (
          <div className="space-y-3">
            <PlanDetailPairRow
              leftLabel={t('taskList.functionalLocation')}
              leftValue={header.functionalLocation}
              leftMono
              rightLabel={t('taskList.description')}
              rightValue={header.descriptionLine1}
            />
            <PlanDetailPairRow
              leftLabel={t('taskList.equipment')}
              leftValue={header.equipment}
              leftMono
              rightLabel={t('taskList.description')}
              rightValue={header.descriptionLine2}
            />
          </div>
        ) : null}

        <div className="space-y-2 border-t border-app/35 pt-3">
          <PlanDetailLabelValue
            label={t('taskList.operation')}
            value={header?.operationNumber ?? ''}
            mono
          />
          <PlanDetailLabelValue label={t('taskList.operationText')} value={header?.operationText ?? ''} />
        </div>

        {operationLongLines.length > 0 ? (
          <div className="space-y-1.5 border-t border-app/35 pt-3">
            <p className="text-xs font-semibold text-app-muted">{t('taskList.operationLongText')}</p>
            <div className="whitespace-pre-wrap rounded-button border border-app/50 bg-app-subtle/20 px-3 py-2.5 text-body-sm leading-relaxed text-app">
              {operationLongLines.join('\n')}
            </div>
          </div>
        ) : null}
      </div>
    </motion.article>
  )
}

function TaskListEmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}) {
  return (
    <div className="rounded-card border border-dashed border-app px-6 py-12 text-center">
      <ListChecks className="mx-auto size-10 text-app-muted/60" aria-hidden />
      <p className="mt-3 font-medium text-app">{title}</p>
      <p className="mt-1 text-body-sm text-app-muted">{description}</p>
      {actionLabel && actionTo ? (
        <Button type="button" variant="outline" size="sm" className="mt-4" asChild>
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  )
}

export function WorkOrderTaskListPanel({
  taskList,
  plannerLayout = false,
  planDetailHeader,
  woContext,
  canAssign = false,
  onGoPlanning,
}: Props) {
  const { t } = useTranslation('scheduling')
  const reduceMotion = useReducedMotion()
  const { summary, items, mntplan } = taskList
  const mnt = mntplan.trim()

  const stats = useMemo(() => {
    let running = 0
    let stopped = 0
    for (const item of items) {
      if (item.machinestatus === 1) stopped += 1
      else running += 1
    }
    return { total: items.length, running, stopped }
  }, [items])

  const heroMeta = useMemo(() => {
    if (!summary) return ''
    const parts = [
      summary.legacy?.trim(),
      stripLabelValue(summary.wkctrtype),
      stripLabelValue(summary.zone),
    ].filter(Boolean)
    return parts.join(' · ')
  }, [summary])

  if (!mnt) {
    return (
      <SchedulingPageSection index={0}>
        {woContext ? <WoContextStrip ctx={woContext} t={t} /> : null}
        <div className={woContext ? 'mt-3' : undefined}>
          <TaskListEmptyState
            title={t('taskList.emptyNoMntplan.title')}
            description={t('taskList.emptyNoMntplan.desc')}
          />
        </div>
      </SchedulingPageSection>
    )
  }

  if (items.length === 0 && !summary) {
    return (
      <SchedulingPageSection index={0}>
        {woContext ? <WoContextStrip ctx={woContext} t={t} /> : null}
        <div className={woContext ? 'mt-3' : undefined}>
          <TaskListEmptyState
            title={t('taskList.emptyNotPublished.title')}
            description={t('taskList.emptyNotPublished.desc', { mntplan: mnt })}
            actionLabel={t('taskList.searchMasterPlan')}
            actionTo={`/master-plan?q=${encodeURIComponent(mnt)}`}
          />
        </div>
      </SchedulingPageSection>
    )
  }

  if (!summary && items.length === 0) {
    return (
      <SchedulingPageSection index={0}>
        <TaskListEmptyState title={t('taskList.notFoundTitle')} description={t('taskList.notFoundDesc')} />
      </SchedulingPageSection>
    )
  }

  return (
    <div className="space-y-4">
      {woContext ? <WoContextStrip ctx={woContext} t={t} /> : null}

      <SchedulingPageSection index={0}>
        <motion.div
          layout={!reduceMotion}
          className="app-tone-info-section-gradient overflow-hidden rounded-card border p-4 shadow-[var(--app-shadow-card)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider app-tone-info-eyebrow">
                {t('taskList.maintenancePlan')}
              </p>
              <p className="font-mono text-3xl font-bold tracking-tight text-app sm:text-4xl">{mnt}</p>
              {heroMeta ? (
                <p className="mt-2 text-body-sm text-app-muted">{heroMeta}</p>
              ) : null}
              {summary?.tasklist ? (
                <p className="mt-1 text-xs text-app-muted">
                  {t('taskList.taskListCode')}{' '}
                  <span className="font-mono font-medium text-app">{summary.tasklist}</span>
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="app-tone-info-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                <ClipboardCheck className="size-3.5" aria-hidden />
                {t('shared.items', { count: stats.total })}
              </span>
              <span className="rounded-full bg-app-subtle px-2.5 py-0.5 text-[10px] font-semibold text-app-muted">
                {t('taskList.itemCountStopped', { stopped: stats.stopped })}
              </span>
            </div>
          </div>

          {!plannerLayout && summary ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryChip icon={Factory} label={t('taskList.productLine')} value={summary.productline} />
              <SummaryChip icon={MapPin} label={t('taskList.zone')} value={summary.zone} />
              <SummaryChip icon={Layers} label={t('taskList.wkctrType')} value={summary.wkctrtype} />
            </div>
          ) : null}
        </motion.div>
      </SchedulingPageSection>

      {items.length > 0 ? (
        <SchedulingPageSection index={1}>
          <SchedulingSection
            icon={ListChecks}
            title={t('taskList.planDetailTitle')}
            description={t('taskList.planDetailDesc')}
            badge={
              <span className="rounded-full bg-app-subtle px-2 py-0.5 text-[10px] font-semibold text-app-muted">
                {t('taskList.runningStopped', { running: stats.running, stopped: stats.stopped })}
              </span>
            }
            bodyClassName="space-y-3"
          >
            <PlannerPlanDetailCard
              items={items}
              header={planDetailHeader}
              reduceMotion={reduceMotion}
              t={t}
            />
          </SchedulingSection>
        </SchedulingPageSection>
      ) : (
        <SchedulingPageSection index={1}>
          <p className="rounded-card border border-dashed border-app px-4 py-8 text-center text-body-sm text-app-muted">
            {t('taskList.headerOnly')}
          </p>
        </SchedulingPageSection>
      )}

      {plannerLayout && canAssign && onGoPlanning ? (
        <SchedulingPageSection index={2}>
          <Button type="button" className="w-full gap-2 sm:w-auto" onClick={onGoPlanning}>
            {t('taskList.goPlanning')}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </SchedulingPageSection>
      ) : null}
    </div>
  )
}
