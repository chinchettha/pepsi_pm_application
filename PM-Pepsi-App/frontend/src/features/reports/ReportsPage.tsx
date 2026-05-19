import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  defaultReportsDateRange,
  ReportsDateFilter,
} from '@/features/reports/ReportsDateFilter'
import { fetchKpi } from '@/lib/api-public'
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
import { useQuery } from '@tanstack/react-query'
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
  })

  const avgUtil =
    q.data && q.data.utilization.length
      ? Math.round(
          q.data.utilization.reduce((a, b) => a + b, 0) / q.data.utilization.length,
        )
      : 0

  return (
    <div>
      <PageHeader
        title="รายงานและแดชบอร์ด"
        description="KPI utilization + backlog รายสัปดาห์ — เทียบ W_summary_weekly*"
      >
        <Badge variant="secondary">GET /api/v1/reports/kpi</Badge>
        <Button variant="outline" size="sm" asChild>
          <Link to="/summary-weekly">สรุปรายสัปดาห์</Link>
        </Button>
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
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

        {q.isLoading ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : q.isError ? (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        ) : q.data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-zinc-500">Utilization เฉลี่ย (Confirm/HR)</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{avgUtil}%</div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-zinc-500">Backlog ล่าสุด (ชม.)</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {q.data.backlogHours[q.data.backlogHours.length - 1] ?? 0}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-zinc-500">ช่วงข้อมูล</div>
                <div className="mt-1 text-sm font-medium text-zinc-800">
                  {q.data.range.fromDate} – {q.data.range.toDate}
                </div>
                <div className="text-xs text-zinc-500">
                  {q.data.labels[0]} – {q.data.labels[q.data.labels.length - 1]}
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
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
                    plugins: { title: { display: true, text: 'Utilization' } },
                    scales: { y: { max: 100 } },
                  }}
                />
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <Line
                  data={{
                    labels: q.data.labels,
                    datasets: [
                      {
                        label: 'Backlog (hours)',
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
                    plugins: { title: { display: true, text: 'Backlog trend' } },
                  }}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
