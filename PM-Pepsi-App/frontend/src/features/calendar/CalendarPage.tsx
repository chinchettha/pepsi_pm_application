import { PageHeader } from '@/components/layout/PageHeader'
import { MovePlanDialog } from '@/components/scheduling/MovePlanDialog'
import { MonthFullCalendar } from '@/components/scheduling/MonthFullCalendar'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchCalendarEvents } from '@/lib/api-public'
import type { ScheduleCalendarEvent } from '@/lib/schedule-calendar'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [moveTarget, setMoveTarget] = useState<{
    idiw37: string
    wkorder: string
    date: string
  } | null>(null)

  const q = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => fetchCalendarEvents(year, month),
  })

  const openMove = (event: ScheduleCalendarEvent, date: string) => {
    setMoveTarget({
      idiw37: event.id,
      wkorder: event.orderId ?? event.title,
      date,
    })
  }

  return (
    <div>
      <PageHeader
        title="ปฏิทินงาน"
        description="Work scheduling — FullCalendar + ModalOrderDetail + MovePlant (ลากย้ายแผน)"
      >
        <Badge variant="secondary">Work order</Badge>
        <Badge className="bg-blue-700">API + DB</Badge>
      </PageHeader>

      <div className="space-y-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/line-calendar">ปฏิทินเส้น (product line)</Link>
          </Button>
        </div>

        {q.isLoading ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : q.isError ? (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        ) : (
          <MonthFullCalendar
            year={year}
            month={month}
            events={q.data?.items ?? []}
            onMonthChange={(y, m) => {
              setYear(y)
              setMonth(m)
            }}
            onEventClick={(e) => setDetailOrderId(e.id)}
            onEventDrop={(e, newDate) => openMove(e, newDate)}
          />
        )}
      </div>

      <WorkOrderDetailDialog
        orderId={detailOrderId}
        onOpenChange={(o) => !o && setDetailOrderId(null)}
      />

      <MovePlanDialog
        open={Boolean(moveTarget)}
        onOpenChange={(o) => !o && setMoveTarget(null)}
        idiw37={moveTarget?.idiw37 ?? ''}
        wkorder={moveTarget?.wkorder}
        defaultDate={moveTarget?.date}
        onSuccess={() => void q.refetch()}
      />
    </div>
  )
}
