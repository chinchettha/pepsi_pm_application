import type { EventInput } from '@fullcalendar/core'

export type ScheduleCalendarEvent = {
  id: string
  date: string
  title: string
  color: string
  orderId?: string
  description?: string
  /** false = แผนเขียว TECO/ปิดแล้ว — ห้าม drag */
  canMovePlan?: boolean
  syst?: string
  pmPhase?: 'create' | 'rel' | 'confirm'
}

export function toFullCalendarEvents(items: ScheduleCalendarEvent[]): EventInput[] {
  return items.map((e) => {
    const canMove = e.canMovePlan !== false
    return {
      id: e.id,
      title: e.title,
      start: e.date,
      allDay: true,
      backgroundColor: e.color,
      borderColor: e.color,
      startEditable: canMove,
      extendedProps: {
        orderId: e.orderId,
        description: e.description,
        canMovePlan: canMove,
        syst: e.syst,
        pmPhase: e.pmPhase,
      },
    }
  })
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
  const props = arg.event.extendedProps
  const canMovePlan = props.canMovePlan
  const syst = props.syst
  const pmPhase = props.pmPhase
  return {
    id: arg.event.id,
    date: `${y}-${m}-${d}`,
    title: arg.event.title,
    color: arg.event.backgroundColor ?? '#004c97',
    orderId: typeof orderId === 'string' ? orderId : undefined,
    description: typeof description === 'string' ? description : undefined,
    canMovePlan: canMovePlan !== false,
    syst: typeof syst === 'string' ? syst : undefined,
    pmPhase:
      pmPhase === 'create' || pmPhase === 'rel' || pmPhase === 'confirm' ? pmPhase : undefined,
  }
}
