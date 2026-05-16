import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-zinc-200 bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-zinc-600">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex shrink-0 gap-2">{children}</div> : null}
    </div>
  )
}
