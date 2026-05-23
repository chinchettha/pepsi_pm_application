import { Badge } from '@/components/ui/badge'
import type { z } from 'zod'
import type { workOrderWorkflowStepSchema } from '@/api/schemas'
import { cn } from '@/lib/utils'

type Step = z.infer<typeof workOrderWorkflowStepSchema>

type WorkOrderWorkflowStepsProps = {
  steps: Step[]
  suffix?: string
  className?: string
  compact?: boolean
}

/**
 * เทียบ `ChackStatus.php` + suffix ใน `calendar.php` (1=Team, 2=Assign, 3=Worktime, 4=Confirm)
 */
export function WorkOrderWorkflowSteps({
  steps,
  suffix,
  className,
  compact = false,
}: WorkOrderWorkflowStepsProps) {
  if (steps.length === 0) return null

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-app-muted">ขั้นตอนงาน</span>
        {suffix ? (
          <Badge variant="outline" className="font-mono text-xs">
            {suffix}
          </Badge>
        ) : null}
        <span className="text-caption">เทียบเลขท้าย title บนปฏิทิน PHP</span>
      </div>
      <ol
        className={cn(
          'grid gap-2',
          compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2',
        )}
      >
        {steps.map((s) => (
          <li
            key={s.key}
            className={cn(
              'flex items-center gap-2 rounded-button border px-2 py-2 text-xs',
              s.done
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-app bg-app-subtle text-app-muted',
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-badge font-semibold',
                s.done ? 'bg-emerald-600 text-white' : 'bg-app-muted text-app',
              )}
            >
              {s.step}
            </span>
            <span className="min-w-0 flex-1 leading-snug">{s.label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
