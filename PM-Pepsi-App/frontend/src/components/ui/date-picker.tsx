import { format, parseISO } from 'date-fns'
import { th } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function DatePicker({
  value,
  onChange,
  id,
  className,
  placeholder = 'เลือกวันที่',
  disabled,
}: {
  value: string
  onChange: (iso: string) => void
  id?: string
  className?: string
  placeholder?: string
  disabled?: boolean
}) {
  const selected = value ? parseISO(value) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-40 justify-start text-left font-normal',
            !value && 'text-app-muted',
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0" aria-hidden />
          {selected ? format(selected, 'd MMM yyyy', { locale: th }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (d) onChange(toIsoDate(d))
          }}
          locale={th}
        />
      </PopoverContent>
    </Popover>
  )
}
