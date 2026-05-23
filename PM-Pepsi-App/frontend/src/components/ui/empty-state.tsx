import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: ReactNode
  description?: ReactNode
  action?: { label: string; onClick: () => void }
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-app bg-app-subtle/60 px-6 py-10 text-center',
        className,
      )}
    >
      {Icon ? (
        <Icon className="size-10 text-app-muted opacity-70" aria-hidden strokeWidth={1.25} />
      ) : null}
      <div className="space-y-1">
        <p className="text-body-sm font-medium text-app">{title}</p>
        {description ? <p className="text-caption text-app-muted">{description}</p> : null}
      </div>
      {action ? (
        <Button type="button" variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}
