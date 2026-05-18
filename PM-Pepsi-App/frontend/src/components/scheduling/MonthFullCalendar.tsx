import type { DatesSetArg, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core'
import thLocale from '@fullcalendar/core/locales/th'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import { useEffect, useMemo, useRef } from 'react'

import {
  eventFromClickArg,
  toFullCalendarEvents,
  type ScheduleCalendarEvent,
} from '@/lib/schedule-calendar'
import { cn } from '@/lib/utils'

type MonthFullCalendarProps = {
  year: number
  month: number
  events: ScheduleCalendarEvent[]
  onMonthChange: (year: number, month: number) => void
  viewMode?: 'month' | 'month-week-day'
  onDateClick?: (date: string) => void
  onRangeSelect?: (fromDate: string, toDate: string) => void
  onEventClick?: (event: ScheduleCalendarEvent) => void
  onEventDrop?: (event: ScheduleCalendarEvent, newDate: string) => void
  className?: string
}

export function MonthFullCalendar({
  year,
  month,
  events,
  onMonthChange,
  viewMode = 'month',
  onDateClick,
  onRangeSelect,
  onEventClick,
  onEventDrop,
  className,
}: MonthFullCalendarProps) {
  const calRef = useRef<FullCalendar>(null)
  const fcEvents = useMemo(() => toFullCalendarEvents(events), [events])

  useEffect(() => {
    const api = calRef.current?.getApi()
    if (!api) return
    const viewDate = api.getDate()
    if (viewDate.getFullYear() !== year || viewDate.getMonth() + 1 !== month) {
      api.gotoDate(new Date(year, month - 1, 1))
    }
  }, [year, month])

  const handleDatesSet = (arg: DatesSetArg) => {
    const d = arg.view.currentStart
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    if (y !== year || m !== month) onMonthChange(y, m)
  }

  const handleEventClick = (arg: EventClickArg) => {
    if (!onEventClick) return
    const mapped = eventFromClickArg(arg)
    if (mapped) onEventClick(mapped)
  }

  const handleEventDrop = (arg: EventDropArg) => {
    if (!onEventDrop) return
    arg.revert()
    const mapped = eventFromClickArg(arg)
    if (!mapped || !arg.event.start) return
    const d = arg.event.start
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    onEventDrop(mapped, `${y}-${m}-${day}`)
  }

  const handleDateClick = (arg: DateClickArg) => {
    if (!onDateClick) return
    const d = arg.date
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    onDateClick(`${y}-${m}-${day}`)
  }

  const toYyyyMmDd = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const handleSelect = (arg: DateSelectArg) => {
    if (!onRangeSelect) return
    const start = arg.start
    const end = new Date(arg.end)
    end.setDate(end.getDate() - 1)
    onRangeSelect(toYyyyMmDd(start), toYyyyMmDd(end))
    calRef.current?.getApi().unselect()
  }

  return (
    <div
      className={cn(
        'pm-fullcalendar overflow-x-auto rounded-xl border border-zinc-200 bg-white p-3 shadow-sm',
        className,
      )}
    >
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={new Date(year, month - 1, 1)}
        locale={thLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: viewMode === 'month-week-day' ? 'dayGridMonth,dayGridWeek,dayGridDay' : '',
        }}
        buttonText={{
          today: 'เดือนนี้',
          month: 'เดือน',
          week: 'สัปดาห์',
          day: 'วัน',
        }}
        height="auto"
        fixedWeekCount={false}
        dayMaxEvents={4}
        events={fcEvents}
        datesSet={handleDatesSet}
        editable={Boolean(onEventDrop)}
        eventStartEditable={Boolean(onEventDrop)}
        eventDurationEditable={false}
        dateClick={onDateClick ? handleDateClick : undefined}
        selectable={Boolean(onDateClick || onRangeSelect)}
        select={onRangeSelect ? handleSelect : undefined}
        eventClick={onEventClick ? handleEventClick : undefined}
        eventDrop={onEventDrop ? handleEventDrop : undefined}
        eventDisplay="block"
        eventDidMount={(arg) => {
          const desc = arg.event.extendedProps.description
          if (typeof desc === 'string' && desc.trim()) arg.el.setAttribute('title', desc.trim())
        }}
      />
    </div>
  )
}
