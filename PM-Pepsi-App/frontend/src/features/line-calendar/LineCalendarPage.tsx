import { PageHeader } from '@/components/layout/PageHeader'
import { MonthFullCalendar } from '@/components/scheduling/MonthFullCalendar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchLineCalendarEvents } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function LineCalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const q = useQuery({
    queryKey: ['line-calendar', year, month],
    queryFn: () => fetchLineCalendarEvents(year, month),
  })

  return (
    <div>
      <PageHeader
        title="ปฏิทินเส้น / Line scheduling"
        description="Product Line Scheduling — เทียบ line_calendar.php + FullCalendar"
      >
        <Badge variant="secondary">Line calendar</Badge>
        <Badge className="bg-emerald-700">API + DB</Badge>
      </PageHeader>

      <div className="space-y-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/calendar">ปฏิทินรายเดือน (work order)</Link>
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
          />
        )}
      </div>
    </div>
  )
}
