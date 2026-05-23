import {
  BOARD_PERIOD_OPTIONS,
  type BoardPeriodId,
} from '@/lib/board-period'
import { cn } from '@/lib/utils'

export function BoardPeriodSelector({
  value,
  onChange,
  className,
}: {
  value: BoardPeriodId
  onChange: (id: BoardPeriodId) => void
  className?: string
}) {
  return (
    <div
      className={cn('engineering-board__period', className)}
      role="group"
      aria-label="ช่วงเวลารายงาน"
    >
      {BOARD_PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={cn(
            'engineering-board__period-btn',
            value === opt.id && 'engineering-board__period-btn--active',
          )}
          aria-pressed={value === opt.id}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
