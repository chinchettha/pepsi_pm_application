import { Clock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { nowHhMm } from '@/lib/personnel-close-format'
import { cn } from '@/lib/utils'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

function parseHhMm(value: string): { hour: string; minute: string } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) {
    const now = nowHhMm()
    const parts = /^(\d{2}):(\d{2})$/.exec(now)
    return { hour: parts?.[1] ?? '08', minute: parts?.[2] ?? '00' }
  }
  const hour = String(Math.min(23, Math.max(0, Number(m[1])))).padStart(2, '0')
  const minute = String(Math.min(59, Math.max(0, Number(m[2])))).padStart(2, '0')
  return { hour, minute }
}

const listSelectClass =
  'h-48 w-[4.5rem] shrink-0 rounded-md border border-app/60 bg-[var(--app-surface)] px-1 py-1 font-mono text-sm leading-tight text-app shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--app-accent)_40%,transparent)]'

export function HmTimePicker({
  value,
  onChange,
  id,
  className,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (hhMm: string) => void
  id?: string
  className?: string
  placeholder?: string
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const placeholderText = placeholder ?? t('timePicker.placeholder')
  const { hour, minute } = useMemo(() => parseHhMm(value), [value])
  const [open, setOpen] = useState(false)

  const setPart = (nextHour: string, nextMinute: string) => {
    onChange(`${nextHour}:${nextMinute}`)
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start gap-2 text-left font-normal font-mono shadow-sm transition-all duration-200',
            'border-app/80 hover:border-[color-mix(in_srgb,var(--app-accent)_35%,var(--app-border))] hover:shadow-md',
            !value && 'text-app-muted',
            value &&
              'border-[color-mix(in_srgb,var(--app-accent)_30%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-accent)_4%,var(--app-surface))]',
            className,
          )}
        >
          <Clock className="size-4 shrink-0" aria-hidden />
          {value || placeholderText}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[120] w-auto p-3"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor={`${id ?? 'time'}-hour`} className="text-[11px] text-app-muted">
              {t('timePicker.hour')}
            </Label>
            <select
              id={`${id ?? 'time'}-hour`}
              size={8}
              value={hour}
              aria-label={t('timePicker.hour')}
              className={listSelectClass}
              onChange={(e) => setPart(e.target.value, minute)}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <span className="pb-2 font-mono text-lg font-semibold text-app-muted" aria-hidden>
            :
          </span>
          <div className="space-y-1">
            <Label htmlFor={`${id ?? 'time'}-minute`} className="text-[11px] text-app-muted">
              {t('timePicker.minute')}
            </Label>
            <select
              id={`${id ?? 'time'}-minute`}
              size={8}
              value={minute}
              aria-label={t('timePicker.minute')}
              className={listSelectClass}
              onChange={(e) => setPart(hour, e.target.value)}
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
