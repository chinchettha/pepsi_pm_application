import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CalendarRange, X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'

export type FilterDateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  summary?: string
  children: ReactNode
  onApply: () => void
  applyDisabled?: boolean
  applyLabel?: string
}

/** Mobile filter / date range panel — Esc closes · primary Apply in sticky footer */
export function FilterDateDrawer({
  open,
  onOpenChange,
  title = 'ช่วงวันที่และตัวกรอง',
  summary,
  children,
  onApply,
  applyDisabled = false,
  applyLabel = 'นำไปใช้',
}: FilterDateDrawerProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="ปิดตัวกรอง"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-x-0 bottom-0 flex max-h-[min(92dvh,640px)] flex-col rounded-t-dialog border border-app bg-[var(--app-surface)] shadow-app-dialog"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-app px-4 py-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-body font-semibold text-app">
              {title}
            </h2>
            {summary ? <p className="mt-0.5 truncate text-caption text-app-muted">{summary}</p> : null}
            <p className="mt-1 text-xs text-app-muted">กด Esc เพื่อปิด</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="ปิด"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">{children}</div>

        <div className="shrink-0 border-t border-app bg-[var(--app-surface)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            className="w-full gap-2"
            size="lg"
            data-testid="filter-date-apply"
            disabled={applyDisabled}
            onClick={() => {
              onApply()
              onOpenChange(false)
            }}
          >
            <CalendarRange className="size-4" aria-hidden />
            {applyLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

type FilterDateDrawerTriggerProps = {
  summary: string
  onOpen: () => void
  className?: string
}

export function FilterDateDrawerTrigger({ summary, onOpen, className }: FilterDateDrawerTriggerProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn('w-full justify-start gap-2 lg:hidden', className)}
      onClick={onOpen}
    >
      <CalendarRange className="size-4 shrink-0 text-app-muted" aria-hidden />
      <span className="truncate">{summary}</span>
    </Button>
  )
}
