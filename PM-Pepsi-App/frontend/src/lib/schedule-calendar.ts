import type { EventInput } from '@fullcalendar/core'

export type ScheduleCalendarEvent = {
  id: string
  date: string
  title: string
  color: string
  orderId?: string
  description?: string
}

export function toFullCalendarEvents(items: ScheduleCalendarEvent[]): EventInput[] {
  return items.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.date,
    allDay: true,
    backgroundColor: e.color,
    borderColor: e.color,
    extendedProps: {
      orderId: e.orderId,
      description: e.description,
    },
  }))
}

export function eventFromClickArg(arg: {
  event: {
    id: string
    title: string
    start: Date | null
    backgroundColor?: string
    extendedProps: Record<string, unknown>
  }
}): ScheduleCalendarEvent | null {
  const start = arg.event.start
  if (!start) return null
  const y = start.getFullYear()
  const m = String(start.getMonth() + 1).padStart(2, '0')
  const d = String(start.getDate()).padStart(2, '0')
  const orderId = arg.event.extendedProps.orderId
  const description = arg.event.extendedProps.description
  return {
    id: arg.event.id,
    date: `${y}-${m}-${d}`,
    title: arg.event.title,
    color: arg.event.backgroundColor ?? '#004c97',
    orderId: typeof orderId === 'string' ? orderId : undefined,
    description: typeof description === 'string' ? description : undefined,
  }
}
