import { PepsiBrandMark } from '@/components/brand/PepsiBrandMark'
import { PepsiStripe } from '@/components/brand/PepsiStripe'
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
    <header className={cn('shrink-0', className)}>
      <PepsiStripe />
      <div className="app-page-header flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <PepsiBrandMark size="md" className="mt-1 shadow-sm" />
          <div className="min-w-0">
            <p className="text-eyebrow">Pepsi PM</p>
            <h1 className="text-heading-page">{title}</h1>
            {description ? (
              <p className="text-caption mt-1 max-w-2xl">{description}</p>
            ) : null}
          </div>
        </div>
        {children ? <div className="flex shrink-0 flex-wrap gap-2">{children}</div> : null}
      </div>
    </header>
  )
}
