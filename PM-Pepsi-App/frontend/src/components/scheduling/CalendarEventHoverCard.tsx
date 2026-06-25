import type { CalendarEventHoverDetail } from '@/api/schemas'
import { WoPmPhaseBadge } from '@/components/scheduling/WoPmPhaseBadge'
import { cn } from '@/lib/utils'
import { useLayoutEffect, useRef, useState } from 'react'

type CalendarEventHoverCardProps = {
  detail: CalendarEventHoverDetail
  x: number
  y: number
  className?: string
}

function dash(v: string | undefined): string {
  const t = v?.trim()
  return t ? t : '—'
}

type RowProps = { label: string; value: string }

function HoverRow({ label, value }: RowProps) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-x-2 gap-y-0.5 text-xs leading-snug">
      <dt className="shrink-0 font-medium text-app-muted">{label}</dt>
      <dd className="min-w-0 break-words text-app">{value}</dd>
    </div>
  )
}

export function CalendarEventHoverCard({ detail, x, y, className }: CalendarEventHoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: x + 14, top: y + 14 })

  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el) return
    const pad = 12
    const rect = el.getBoundingClientRect()
    let left = x + 14
    let top = y + 14
    if (left + rect.width > window.innerWidth - pad) {
      left = x - rect.width - 14
    }
    if (top + rect.height > window.innerHeight - pad) {
      top = y - rect.height - 14
    }
    left = Math.max(pad, Math.min(left, window.innerWidth - rect.width - pad))
    top = Math.max(pad, Math.min(top, window.innerHeight - rect.height - pad))
    setPos({ left, top })
  }, [x, y, detail])

  const typeDisplay = detail.wktype
    ? detail.wktypeLabel && detail.wktypeLabel !== detail.wktype
      ? `${detail.wktype} (${detail.wktypeLabel})`
      : detail.wktype
    : '—'

  const resources =
    detail.resourceName?.trim() ||
    (detail.wkctr ? detail.wkctr : undefined) ||
    '—'

  return (
    <div
      ref={cardRef}
      role="tooltip"
      className={cn(
        'calendar-event-hover-card pointer-events-none fixed z-[10050]',
        'w-[min(20rem,calc(100vw-1.5rem))] max-h-[min(70vh,calc(100vh-1.5rem))] overflow-y-auto',
        'rounded-xl border border-app/60',
        'bg-[var(--app-surface)] p-3 shadow-lg ring-1 ring-[color-mix(in_srgb,var(--app-text)_8%,transparent)]',
        className,
      )}
      style={{ left: pos.left, top: pos.top }}
    >
      {detail.zoneTitle ? (
        <p className="mb-2 break-words border-b border-app/40 pb-2 text-sm font-semibold text-app">
          {detail.zoneTitle}
        </p>
      ) : null}
      <dl className="space-y-1.5">
        <HoverRow label="Status" value={dash(detail.statusLabel)} />
        <HoverRow label="Work Order" value={dash(detail.workOrder)} />
        <HoverRow label="Type" value={typeDisplay} />
        <div className="grid grid-cols-[7.5rem_1fr] gap-x-2 gap-y-0.5 text-xs leading-snug">
          <dt className="shrink-0 font-medium text-app-muted">PM Phase</dt>
          <dd className="min-w-0">
            {detail.pmPhase ? (
              <WoPmPhaseBadge phase={detail.pmPhase} syst={detail.syst} showSyst />
            ) : (
              <span className="break-words text-app">{dash(detail.syst)}</span>
            )}
          </dd>
        </div>
        <HoverRow label="Resources" value={resources} />
        <HoverRow label="Functional Desc." value={dash(detail.functionalDesc)} />
        <HoverRow label="Plan date" value={dash(detail.planDate)} />
        <HoverRow label="Finish date" value={dash(detail.finishDate)} />
        {detail.orderFrameStart && detail.orderFrameEnd ? (
          <HoverRow
            label="Order Frame"
            value={`${detail.orderFrameStart} – ${detail.orderFrameEnd}`}
          />
        ) : null}
        <HoverRow label="Moved to" value={dash(detail.movedToDate)} />
        <HoverRow label="Reason" value={dash(detail.moveReason)} />
      </dl>
    </div>
  )
}
