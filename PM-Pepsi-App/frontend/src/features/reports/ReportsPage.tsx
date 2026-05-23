import { CanPermission } from '@/components/auth/CanPermission'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  defaultReportsDateRange,
  ReportsDateFilter,
} from '@/features/reports/ReportsDateFilter'
import { WeekToWeekTable } from '@/features/reports/WeekToWeekTable'
import { fetchKpi } from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { Bar, Line } from 'react-chartjs-2'
import { useState } from 'react'
import { Link } from 'react-router-dom'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
)

export function ReportsPage() {
  const canRead = usePermission('reports.read')
  const initial = defaultReportsDateRange(56)
  const [submitted, setSubmitted] = useState(() => ({
    ...initial,
    weeksBack: 8,
  }))

  const q = useQuery({
    queryKey: ['reports-kpi', submitted],
    queryFn: () =>
      fetchKpi({
        from: submitted.from,
        to: submitted.to,
        weeksBack: submitted.weeksBack,
      }),
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const avgUtil =
    q.data && q.data.utilization.length
      ? Math.round(
          q.data.utilization.reduce((a, b) => a + b, 0) / q.data.utilization.length,
        )
      : 0

  if (!canRead) {
    return (
      <AppPageShell title="รายงานและแดชบอร์ด" description="KPI utilization และ backlog รายสัปดาห์">
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">reports.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="รายงานและแดชบอร์ด"
      description="KPI utilization + backlog รายสัปดาห์ — เทียบ W_summary_weekly"
      contentClassName="space-y-6"
      headerActions={
        <>
          <Badge variant="secondary" className="text-xs">
            Week-to-Week
          </Badge>
          <CanPermission permission="reports.read">
            <Button variant="outline" size="sm" asChild>
              <Link to="/summary-weekly">สรุปรายสัปดาห์</Link>
            </Button>
          </CanPermission>
          <CanPermission permission="reports.read">
            <Button variant="outline" size="sm" asChild>
              <Link to="/activity-log">Activity Log</Link>
            </Button>
          </CanPermission>
          <CanPermission permission="reports.read">
            <Button variant="outline" size="sm" asChild>
              <Link to="/reports/audit">Auditor Hub</Link>
            </Button>
          </CanPermission>
        </>
      }
    >
        <ReportsDateFilter
          initial={submitted}
          showWeeksBack
          onSearch={(value) =>
            setSubmitted({
              from: value.from,
              to: value.to,
              weeksBack: value.weeksBack ?? 8,
            })
          }
        />

        {q.isLoading && !q.data ? (
          <Skeleton className="h-96 w-full rounded-card" />
        ) : q.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลด KPI ไม่สำเร็จ"
            description={(q.error as Error).message}
            action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
          />
        ) : q.data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <AppCard pad="compact">
                <div className="text-xs text-app-muted">Utilization เฉลี่ย (Confirm/HR)</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{avgUtil}%</div>
              </AppCard>
              <AppCard pad="compact">
                <div className="text-xs text-app-muted">Backlog ล่าสุด (ชม.)</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {q.data.backlogHours[q.data.backlogHours.length - 1] ?? 0}
                </div>
              </AppCard>
              <AppCard pad="compact">
                <div className="text-xs text-app-muted">ช่วงข้อมูล</div>
                <div className="mt-1 text-body-sm font-medium text-app">
                  {q.data.range.fromDate} – {q.data.range.toDate}
                </div>
                <div className="text-xs text-app-muted">
                  {q.data.labels[0]} – {q.data.labels[q.data.labels.length - 1]}
                </div>
              </AppCard>
            </div>
            <AppCard pad="compact" className="space-y-3">
              <p className="text-body-sm font-medium text-app">Week-to-Week (Utilization & Backlog)</p>
              <p className="text-xs text-app-muted">
                เปรียบเทียบสัปดาห์ต่อสัปดาห์ในช่วงที่เลือก — สัปดาห์ Pepsi (เริ่ม 1 ม.ค.)
              </p>
              <WeekToWeekTable rows={q.data.weekToWeek} />
            </AppCard>

            <div className="grid gap-6 lg:grid-cols-2">
              <AppCard pad="compact">
                <Bar
                  data={{
                    labels: q.data.labels,
                    datasets: [
                      {
                        label: 'Utilization %',
                        data: q.data.utilization,
                        backgroundColor: 'rgba(59,130,246,0.8)',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { title: { display: true, text: 'Utilization (%)' } },
                    scales: { y: { max: 100 } },
                  }}
                />
              </AppCard>
              <AppCard pad="compact">
                <Line
                  data={{
                    labels: q.data.labels,
                    datasets: [
                      {
                        label: 'Backlog (ชม.)',
                        data: q.data.backlogHours,
                        borderColor: 'rgb(24,24,27)',
                        backgroundColor: 'rgba(24,24,27,0.1)',
                        fill: true,
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { title: { display: true, text: 'แนวโน้ม Backlog' } },
                  }}
                />
              </AppCard>
            </div>
          </>
        ) : (
          <EmptyState title="ไม่มีข้อมูล KPI" description="เลือกช่วงวันที่แล้วกดค้นหา" />
        )}
    </AppPageShell>
  )
}
