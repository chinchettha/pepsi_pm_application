import { Badge } from '@/components/ui/badge'
import { SchedulingSection } from '@/components/scheduling/SchedulingPageLayout'
import {
  PLANNER_PIPELINE_COLORS,
  PIPELINE_BADGE_ICONS,
  type PlannerPipelineBadge,
  type PlannerPipelineStatus,
} from '@/lib/planner-pipeline'
import { cn } from '@/lib/utils'
import { Layers3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function PipelineSwatch({ status }: { status: PlannerPipelineStatus }) {
  const { t } = useTranslation('scheduling')
  const color = PLANNER_PIPELINE_COLORS[status]
  return (
    <Badge
      variant="outline"
      title={t(`pipeline.status.${status}.title`)}
      className="gap-1.5 font-semibold ring-1"
      style={{ borderColor: color, color }}
    >
      <span
        className="inline-block size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {t(`pipeline.status.${status}.label`)}
    </Badge>
  )
}

function PipelineInlineSwatch({ status }: { status: PlannerPipelineStatus }) {
  const { t } = useTranslation('scheduling')
  const color = PLANNER_PIPELINE_COLORS[status]
  return (
    <span
      className="plan-calendar-legend__swatch"
      title={t(`pipeline.status.${status}.title`)}
    >
      <span
        className="plan-calendar-legend__dot"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="plan-calendar-legend__label">{t(`pipeline.status.${status}.label`)}</span>
    </span>
  )
}

function PipelineBadgeChip({ badge }: { badge: PlannerPipelineBadge }) {
  const { t } = useTranslation('scheduling')
  return (
    <Badge variant="secondary" className="text-badge font-normal" title={t(`pipeline.badge.${badge}.title`)}>
      {PIPELINE_BADGE_ICONS[badge]} {t(`pipeline.badge.${badge}.label`)}
    </Badge>
  )
}

function PipelineInlineBadge({ badge }: { badge: PlannerPipelineBadge }) {
  const { t } = useTranslation('scheduling')
  return (
    <span className="plan-calendar-legend__badge" title={t(`pipeline.badge.${badge}.title`)}>
      <span aria-hidden>{PIPELINE_BADGE_ICONS[badge]}</span>
      <span>{t(`pipeline.badge.${badge}.label`)}</span>
    </span>
  )
}

const PIPELINE_STATUSES = ['unassigned', 'assigned', 'in_progress', 'partial', 'closed'] as const
const PIPELINE_BADGES = [
  'ack_pending',
  'ack_done',
  'partial_close',
  'qc_pending',
  'qc_approved',
  'qc_rejected',
] as const

export function PlannerPipelineLegend({
  className,
  collapsible = false,
  defaultOpen = true,
  showBadges = true,
  variant = 'card',
}: {
  className?: string
  collapsible?: boolean
  defaultOpen?: boolean
  showBadges?: boolean
  /** `inline` = แถบกะทัดรัดใน panel ปฏิทินจ่ายงาน */
  variant?: 'card' | 'inline'
}) {
  const { t } = useTranslation('scheduling')

  if (variant === 'inline') {
    return (
      <div className={cn('plan-calendar-legend', className)}>
        <div className="plan-calendar-legend__row">
          <span className="plan-calendar-legend__heading">{t('pipeline.title')}</span>
          {PIPELINE_STATUSES.map((s) => (
            <PipelineInlineSwatch key={s} status={s} />
          ))}
        </div>
        {showBadges ? (
          <div className="plan-calendar-legend__row plan-calendar-legend__row--badges">
            <span className="plan-calendar-legend__heading plan-calendar-legend__heading--muted">
              {t('pipeline.badgesTitle')}
            </span>
            {PIPELINE_BADGES.map((b) => (
              <PipelineInlineBadge key={b} badge={b} />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  const legendContent = (
    <div className={cn('space-y-2 text-xs text-app', !collapsible && 'rounded-card border border-app bg-app-subtle px-3 py-2')}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-app">{t('pipeline.title')}:</span>
        {PIPELINE_STATUSES.map((s) => (
          <PipelineSwatch key={s} status={s} />
        ))}
      </div>
      {showBadges ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-app pt-2">
          <span className="text-app-muted">{t('pipeline.badgesTitle')}:</span>
          {PIPELINE_BADGES.map((b) => (
            <PipelineBadgeChip key={b} badge={b} />
          ))}
        </div>
      ) : null}
    </div>
  )

  if (!collapsible) return <div className={className}>{legendContent}</div>

  return (
    <SchedulingSection
      icon={Layers3}
      title={t('pipeline.title')}
      collapsible
      defaultOpen={defaultOpen}
      bodyClassName="p-3"
      className={className}
    >
      {legendContent}
    </SchedulingSection>
  )
}
