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
import { PLAN_NOT_MOVABLE_MESSAGE } from '@/lib/plan-movable'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CalendarPeriodPicker } from './CalendarPeriodPicker'

/** Long-press delay on touch (ms) — balance drag vs tap-to-open */
const TOUCH_LONG_PRESS_MS = 400

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
  showPeriodPicker?: boolean
  yearMin?: number
  yearMax?: number
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
  showPeriodPicker = true,
  yearMin,
  yearMax,
}: MonthFullCalendarProps) {
  const calRef = useRef<FullCalendar>(null)
  const fcEvents = useMemo(() => toFullCalendarEvents(events), [events])
  const touchDnD = Boolean(onEventDrop)
  const touchSelect = Boolean(onDateClick || onRangeSelect)

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
    if (mapped.canMovePlan === false) {
      toast.error(PLAN_NOT_MOVABLE_MESSAGE)
      return
    }
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
    <div className={cn('space-y-3', className)}>
      {showPeriodPicker ? (
        <CalendarPeriodPicker
          year={year}
          month={month}
          yearMin={yearMin}
          yearMax={yearMax}
          onChange={onMonthChange}
        />
      ) : null}
      <div
        className={cn(
          'pm-fullcalendar overflow-x-auto rounded-card border border-app bg-[var(--app-surface)] p-3 shadow-sm',
          touchDnD && 'pm-fullcalendar--touch-dnd',
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
          editable={touchDnD}
          eventStartEditable={touchDnD}
          eventDurationEditable={false}
          dragScroll
          longPressDelay={touchDnD || touchSelect ? TOUCH_LONG_PRESS_MS : undefined}
          eventLongPressDelay={touchDnD ? TOUCH_LONG_PRESS_MS : undefined}
          selectLongPressDelay={touchSelect ? TOUCH_LONG_PRESS_MS + 100 : undefined}
          dateClick={onDateClick ? handleDateClick : undefined}
          selectable={touchSelect}
          select={onRangeSelect ? handleSelect : undefined}
          eventClick={onEventClick ? handleEventClick : undefined}
          eventDrop={onEventDrop ? handleEventDrop : undefined}
          eventDisplay="block"
          eventDidMount={(arg) => {
            const props = arg.event.extendedProps
            const desc = props.description
            const pm = props.pmPhase
            const syst = props.syst
            const parts = [
              typeof pm === 'string' ? `PM: ${pm.toUpperCase()}` : '',
              typeof syst === 'string' && syst ? `SAP: ${syst}` : '',
              typeof desc === 'string' ? desc.trim() : '',
            ].filter(Boolean)
            if (parts.length) arg.el.setAttribute('title', parts.join(' · '))
            if (touchDnD) {
              arg.el.setAttribute(
                'aria-label',
                `${arg.event.title} — แตะค้างแล้วลากเพื่อย้ายวัน (แท็บเล็ต)`,
              )
            }
          }}
        />
      </div>
    </div>
  )
}
