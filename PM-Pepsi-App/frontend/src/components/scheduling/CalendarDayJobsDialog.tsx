import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { pipelineSortKey } from '@/lib/pipeline-sort-key'
import type { ScheduleCalendarEvent } from '@/lib/schedule-calendar'
import { cn } from '@/lib/utils'
import { useAppLocale } from '@/providers/I18nProvider'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const yyyy = Number(m[1])
  const mm = Number(m[2])
  const dd = Number(m[3])
  if (!Number.isFinite(yyyy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return null
  return new Date(yyyy, mm - 1, dd)
}

function formatDayJobsTitle(iso: string, locale: string): string {
  const d = parseIsoDate(iso)
  if (!d) return iso
  const loc = locale.startsWith('th') ? 'th-TH' : 'en-US'
  return d.toLocaleDateString(loc, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function CalendarDayJobsDialog({
  date,
  events,
  onOpenChange,
  onEventClick,
}: {
  date: string | null
  events: ScheduleCalendarEvent[]
  onOpenChange: (open: boolean) => void
  onEventClick?: (event: ScheduleCalendarEvent) => void
}) {
  const { t, i18n } = useTranslation('scheduling')
  const { locale } = useAppLocale()

  const dayEvents = useMemo(() => {
    if (!date) return []
    return events
      .filter((e) => e.date === date)
      .sort((a, b) => {
        const pa = pipelineSortKey(a.pipelineStatus)
        const pb = pipelineSortKey(b.pipelineStatus)
        if (pa !== pb) return pa - pb
        return a.title.localeCompare(b.title, undefined, { numeric: true })
      })
  }, [date, events])

  const open = date != null
  const titleDate = date ? formatDayJobsTitle(date, locale) : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        className="flex max-h-[min(88dvh,720px)] flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-app/60 px-5 pb-4 pt-5 text-left">
          <DialogTitle className="text-body font-semibold text-app">
            {t('calendar.dayJobsTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs text-app-muted">
            {t('calendar.dayJobsSubtitle', {
              date: titleDate,
              count: dayEvents.length.toLocaleString(
                i18n.language.startsWith('th') ? 'th-TH' : 'en-US',
              ),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
          {dayEvents.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-app-muted">
              {t('calendar.dayJobsEmpty')}
            </p>
          ) : (
            <ul className="space-y-1" role="list">
              {dayEvents.map((ev) => (
                <li key={ev.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg border border-app/50 bg-app-subtle/40 px-2.5 py-2 text-left',
                      'text-xs font-medium text-app transition-colors',
                      'hover:border-app hover:bg-[var(--app-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]',
                    )}
                    onClick={() => {
                      onEventClick?.(ev)
                      onOpenChange(false)
                    }}
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: ev.color }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">{ev.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
