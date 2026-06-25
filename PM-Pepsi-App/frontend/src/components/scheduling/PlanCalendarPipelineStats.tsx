import type { z } from 'zod'
import { plannerPipelineCountsResponseSchema } from '@/api/schemas'
import { PLANNER_PIPELINE_COLORS } from '@/lib/planner-pipeline'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type PlannerPipelineCounts = z.infer<typeof plannerPipelineCountsResponseSchema>

export function PlanCalendarPipelineStats({
  counts,
  className,
}: {
  counts: PlannerPipelineCounts
  className?: string
}) {
  const { t } = useTranslation('scheduling')
  const entries = (
    ['unassigned', 'assigned', 'in_progress', 'partial', 'closed'] as const
  ).map((status) => ({
    status,
    value: counts[status],
    color: PLANNER_PIPELINE_COLORS[status],
  }))

  return (
    <div className={cn('plan-calendar-pipeline-stats', className)}>
      {entries.map(({ status, value, color }) => (
        <div
          key={status}
          className="plan-calendar-pipeline-stats__item"
          title={t(`pipeline.status.${status}.title`)}
        >
          <span
            className="plan-calendar-pipeline-stats__dot"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <span className="plan-calendar-pipeline-stats__label">
            {t(`pipeline.status.${status}.label`)}
          </span>
          <span className="plan-calendar-pipeline-stats__value tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  )
}
