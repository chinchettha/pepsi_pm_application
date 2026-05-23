import { CanPermission } from '@/components/auth/CanPermission'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { ManhourSummaryDialog } from '@/components/scheduling/ManhourSummaryDialog'
import { MonthFullCalendar } from '@/components/scheduling/MonthFullCalendar'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchPlanCalendarEvents } from '@/lib/api-public'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * เทียบ `sap/pages/M_plan_calendar.php` — ปฏิทินงานเปิดของช่าง (view_planwork + idwkctr)
 */
export function PlanCalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [detailTarget, setDetailTarget] = useState<{ id: string; date: string } | null>(
    null,
  )
  const [mhOpen, setMhOpen] = useState(false)
  const [mhFrom, setMhFrom] = useState('')
  const [mhTo, setMhTo] = useState('')

  const q = useQuery({
    queryKey: ['plan-calendar', year, month],
    queryFn: () => fetchPlanCalendarEvents(year, month),
    placeholderData: keepPreviousData,
  })

  const eventCount = q.data?.items?.length ?? 0

  return (
    <>
      <AppPageShell
        title="ปฏิทินจ่ายงาน"
        description="งานเปิด (CRTD/REL) ของศูนย์งานที่เข้าสู่ระบบ — คลิกรายการเพื่อดูใบงาน · ลากช่วงวันเพื่อสรุปชั่วโมงทำงาน"
        contentClassName="space-y-4"
        headerActions={
          <>
            <CanPermission permission="planning.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/planning">แผน PM/CM</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="calendar.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/calendar">ปฏิทิน Work scheduling</Link>
              </Button>
            </CanPermission>
          </>
        }
      >
        {q.isLoading ? (
          <Skeleton className="h-[28rem] w-full rounded-card" aria-label="กำลังโหลดปฏิทิน" />
        ) : q.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลดปฏิทินไม่สำเร็จ"
            description={
              <>
                ตรวจการเชื่อมต่อ API หรือสิทธิ์{' '}
                <code className="text-xs">planning.read</code>
                {q.error instanceof Error ? ` — ${q.error.message}` : null}
              </>
            }
            action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
          />
        ) : (
          <AppCard pad="compact" className="space-y-3">
            {eventCount === 0 ? (
              <p className="text-caption rounded-button border border-dashed border-app bg-app-subtle/50 px-3 py-2">
                ไม่มีงานเปิดในเดือนนี้ — ยังใช้ปฏิทินเลือกช่วงสรุปชั่วโมงได้
              </p>
            ) : (
              <p className="text-caption">
                แสดง {eventCount.toLocaleString('th-TH')} รายการในเดือนที่เลือก
              </p>
            )}
            <MonthFullCalendar
              year={year}
              month={month}
              viewMode="month-week-day"
              events={q.data?.items ?? []}
              onMonthChange={(y, m) => {
                setYear(y)
                setMonth(m)
              }}
              onRangeSelect={(from, to) => {
                setMhFrom(from)
                setMhTo(to)
                setMhOpen(true)
              }}
              onEventClick={(e) => setDetailTarget({ id: e.id, date: e.date })}
            />
          </AppCard>
        )}
      </AppPageShell>

      <WorkOrderDetailDialog
        orderId={detailTarget?.id ?? null}
        contextDate={detailTarget?.date}
        initialTab="task-list"
        onOpenChange={(o) => !o && setDetailTarget(null)}
      />

      <ManhourSummaryDialog
        open={mhOpen}
        onOpenChange={setMhOpen}
        fromDate={mhFrom}
        toDate={mhTo}
      />
    </>
  )
}
