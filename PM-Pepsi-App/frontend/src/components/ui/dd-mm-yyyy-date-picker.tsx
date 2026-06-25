import { format } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useI18nFormat } from '@/lib/use-i18n-format'
import {
  dateToDdMmYyyy,
  parseDdMmYyyyToDate,
} from '@/lib/personnel-close-format'
import { cn } from '@/lib/utils'

const dropdownSelectClass =
  'h-10 cursor-pointer rounded-md border border-app/80 bg-[var(--app-surface)] px-2.5 text-sm text-app shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--app-accent)_40%,transparent)]'

function HiddenCalendarChrome() {
  return <div className="hidden" aria-hidden />
}

const calendarChromeComponents = {
  MonthCaption: HiddenCalendarChrome,
  Nav: HiddenCalendarChrome,
}

function sameCalendarMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function DdMmYyyyDatePicker({
  value,
  onChange,
  id,
  className,
  placeholder,
  disabled,
  fromYear,
  toYear,
}: {
  value: string
  onChange: (ddMmYyyy: string) => void
  id?: string
  className?: string
  placeholder?: string
  disabled?: boolean
  fromYear?: number
  toYear?: number
}) {
  const { t } = useTranslation()
  const { dateFns: dateLocale } = useI18nFormat()
  const placeholderText = placeholder ?? t('datePicker.placeholder')
  const selected = useMemo(() => parseDdMmYyyyToDate(value), [value])
  const now = new Date()
  const yearMin = fromYear ?? now.getFullYear() - 20
  const yearMax = toYear ?? now.getFullYear() + 2
  const startMonth = useMemo(() => new Date(yearMin, 0), [yearMin])
  const endMonth = useMemo(() => new Date(yearMax, 11), [yearMax])
  const [open, setOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState<Date>(
    () => selected ?? new Date(now.getFullYear(), now.getMonth(), 1),
  )

  useEffect(() => {
    if (!open) return
    const parsed = parseDdMmYyyyToDate(value)
    const today = new Date()
    const next = parsed ?? new Date(today.getFullYear(), today.getMonth(), 1)
    setDisplayMonth((prev) => (sameCalendarMonth(prev, next) ? prev : next))
  }, [open, value])

  const years = useMemo(() => {
    const ys: number[] = []
    for (let y = yearMax; y >= yearMin; y -= 1) ys.push(y)
    return ys
  }, [yearMin, yearMax])

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, monthIndex) => ({
        value: monthIndex,
        label: format(new Date(2024, monthIndex, 1), 'MMMM', { locale: dateLocale }),
      })),
    [dateLocale],
  )

  const canGoPrev =
    displayMonth.getFullYear() > yearMin ||
    (displayMonth.getFullYear() === yearMin && displayMonth.getMonth() > 0)
  const canGoNext =
    displayMonth.getFullYear() < yearMax ||
    (displayMonth.getFullYear() === yearMax && displayMonth.getMonth() < 11)

  const setMonthIndex = (monthIndex: number) => {
    setDisplayMonth((prev) => {
      if (prev.getMonth() === monthIndex) return prev
      return new Date(prev.getFullYear(), monthIndex, 1)
    })
  }

  const setYear = (year: number) => {
    setDisplayMonth((prev) => {
      if (prev.getFullYear() === year) return prev
      return new Date(year, prev.getMonth(), 1)
    })
  }

  const goPrevMonth = () => {
    if (!canGoPrev) return
    setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goNextMonth = () => {
    if (!canGoNext) return
    setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleMonthChange = useCallback((month: Date) => {
    setDisplayMonth((prev) => (sameCalendarMonth(prev, month) ? prev : month))
  }, [])

  const monthSelectId = `${id ?? 'date'}-month`
  const yearSelectId = `${id ?? 'date'}-year`

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
          <CalendarIcon className="size-4 shrink-0" aria-hidden />
          {selected ? dateToDdMmYyyy(selected) : placeholderText}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'z-[120] w-[min(calc(100vw-2rem),20rem)] p-3',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
        )}
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="mb-3 flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            disabled={!canGoPrev}
            aria-label={t('datePicker.previousMonth')}
            onClick={goPrevMonth}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <select
            id={monthSelectId}
            aria-label={t('datePicker.month')}
            className={cn(dropdownSelectClass, 'min-w-0 flex-1')}
            value={displayMonth.getMonth()}
            onChange={(e) => setMonthIndex(Number(e.target.value))}
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            id={yearSelectId}
            aria-label={t('datePicker.year')}
            className={cn(dropdownSelectClass, 'w-[5.5rem] shrink-0 tabular-nums')}
            value={displayMonth.getFullYear()}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            disabled={!canGoNext}
            aria-label={t('datePicker.nextMonth')}
            onClick={goNextMonth}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={selected}
          month={displayMonth}
          onMonthChange={handleMonthChange}
          onSelect={(d) => {
            if (d) {
              onChange(dateToDdMmYyyy(d))
              setOpen(false)
            }
          }}
          locale={dateLocale}
          hideNavigation
          disableNavigation
          startMonth={startMonth}
          endMonth={endMonth}
          components={calendarChromeComponents}
        />
      </PopoverContent>
    </Popover>
  )
}
