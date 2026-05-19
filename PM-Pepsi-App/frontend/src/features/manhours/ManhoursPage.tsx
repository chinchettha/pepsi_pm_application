/**
 * เทียบ `M_manhour_chart.php` + `M_manhour_chart_performance.php` + `M_manhour_chart_show.php`
 */
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getStoredAuthUser } from '@/features/auth/login-api'
import {
  fetchManhourChartBreakdown,
  fetchManhourChartPerformance,
  fetchManhours,
  personnelImageUrl,
} from '@/lib/api-public'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import { Link } from 'react-router-dom'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

function defaultRange() {
  const to = new Date()
  const from = subDays(to, 30)
  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd'),
  }
}

function formatThaiDot(iso: string) {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}.${m}.${y}`
}

export function ManhoursPage() {
  const authUser = getStoredAuthUser()
  const isAdmin = authUser?.userst === 'A'
  const initial = defaultRange()

  const [fromDate, setFromDate] = useState(initial.from)
  const [toDate, setToDate] = useState(initial.to)
  const [submitted, setSubmitted] = useState(initial)
  const [adminWkctr, setAdminWkctr] = useState('')

  const chartOpts = {
    from: submitted.from,
    to: submitted.to,
    idwkctr: isAdmin && adminWkctr.trim() ? adminWkctr.trim() : undefined,
  }

  const perfQ = useQuery({
    queryKey: ['manhours', 'chart', 'performance', chartOpts],
    queryFn: () => fetchManhourChartPerformance(chartOpts),
  })

  const breakdownQ = useQuery({
    queryKey: ['manhours', 'chart', 'breakdown', chartOpts],
    queryFn: () => fetchManhourChartBreakdown(chartOpts),
  })

  const weeklyQ = useQuery({
    queryKey: ['manhours', 'summary'],
    queryFn: fetchManhours,
  })

  const pieData = useMemo(() => {
    const b = breakdownQ.data
    if (!b) return null
    const labels = ['WH', 'OT1', 'OT1.5', 'OT1 HOL', 'OT2', 'OT3', 'Confirm Hours']
    const values = [b.wh, b.ot1, b.ot15, b.ot1hol, b.ot2, b.ot3, b.confirmHours]
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            'rgba(24,24,27,0.9)',
            'rgba(63,63,70,0.9)',
            'rgba(113,113,122,0.9)',
            'rgba(161,161,170,0.9)',
            'rgba(212,212,216,0.9)',
            'rgba(228,228,231,0.9)',
            'rgba(34,197,94,0.85)',
          ],
        },
      ],
    }
  }, [breakdownQ.data])

  const weeklyChartData = {
    labels: weeklyQ.data?.map((w) => w.week) ?? [],
    datasets: [
      {
        label: 'Planned (h)',
        data: weeklyQ.data?.map((w) => w.planned) ?? [],
        backgroundColor: 'rgba(24,24,27,0.85)',
      },
      {
        label: 'Actual (h)',
        data: weeklyQ.data?.map((w) => w.actual) ?? [],
        backgroundColor: 'rgba(113,113,122,0.9)',
      },
    ],
  }

  const perf = perfQ.data
  const rangeLabel = perf
    ? `${formatThaiDot(perf.range.fromDate)} – ${formatThaiDot(perf.range.toDate)}`
    : `${formatThaiDot(submitted.from)} – ${formatThaiDot(submitted.to)}`

  return (
    <div className="contents">
      <PageHeader
        title="Manhours / Performance"
        description="เทียบ M_manhour_chart, M_manhour_chart_performance, M_manhour_chart_show"
      >
        <Badge variant="secondary">Chart</Badge>
        {isAdmin ? (
          <Button variant="outline" size="sm" asChild>
            <Link to="/manhours/admin">จัดการ Man Hour (Admin)</Link>
          </Button>
        ) : null}
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="space-y-1">
            <Label htmlFor="mh-from">เริ่มวันที่</Label>
            <DatePicker id="mh-from" value={fromDate} onChange={setFromDate} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mh-to">ถึงวันที่</Label>
            <DatePicker id="mh-to" value={toDate} onChange={setToDate} />
          </div>
          {isAdmin ? (
            <div className="space-y-1">
              <Label htmlFor="mh-idwkctr">รหัส HR (Admin)</Label>
              <Input
                id="mh-idwkctr"
                value={adminWkctr}
                onChange={(e) => setAdminWkctr(e.target.value)}
                placeholder="ว่าง = ของตัวเอง"
                className="w-40"
              />
            </div>
          ) : null}
          <Button
            type="button"
            onClick={() => setSubmitted({ from: fromDate, to: toDate })}
            disabled={!fromDate || !toDate}
          >
            <Search className="mr-2 size-4" />
            ค้นหา
          </Button>
        </div>

        <Tabs defaultValue="performance">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="breakdown">HR vs Confirm</TabsTrigger>
            <TabsTrigger value="weekly">รายสัปดาห์</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-4 space-y-4">
            {perfQ.isLoading ? (
              <Skeleton className="h-80 w-full rounded-xl" />
            ) : perfQ.isError ? (
              <p className="text-sm text-red-600">{(perfQ.error as Error).message}</p>
            ) : perf ? (
              <>
                <p className="text-center text-sm font-medium text-zinc-700">
                  ช่วงวันที่ {rangeLabel}
                </p>
                <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
                  <div className="space-y-3">
                    <div className="rounded-lg bg-zinc-900 px-3 py-2 text-center text-sm font-medium text-white">
                      จำนวน Work order ทั้งหมด
                    </div>
                    <div className="rounded-lg bg-zinc-100 py-6 text-center text-3xl font-bold tabular-nums">
                      {perf.totalPlannedOrders}
                    </div>
                    <div className="mt-6 rounded-lg bg-zinc-900 px-3 py-2 text-center text-sm font-medium text-white">
                      % Utilization
                    </div>
                    <div className="rounded-lg bg-zinc-100 py-6 text-center text-3xl font-bold tabular-nums">
                      {perf.utilizationPercent.toFixed(2)}%
                    </div>
                    <p className="text-center text-xs text-zinc-500">
                      Confirm {perf.confirmHours.toFixed(1)} h / Manhour {perf.manhourTotal.toFixed(1)} h
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2 px-2">
                    <img
                      src={personnelImageUrl(perf.profile.idwkctr)}
                      alt={perf.profile.displayName}
                      className="size-48 rounded-xl border border-zinc-200 object-cover shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.visibility = 'hidden'
                      }}
                    />
                    <p className="max-w-[14rem] text-center text-sm font-medium">
                      {perf.profile.wkctr} {perf.profile.displayName}
                    </p>
                    <p className="text-center text-xs text-zinc-500">
                      {[perf.profile.wkctrtype, perf.profile.position].filter(Boolean).join(' — ')}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {perf.zb.map((z) => (
                      <div key={z.wktype}>
                        <div className="rounded-lg bg-emerald-600 px-3 py-1.5 text-center text-sm font-medium text-white">
                          {z.wktype}
                        </div>
                        <div className="mt-1 grid grid-cols-3 gap-1 text-center text-sm font-semibold">
                          <div className="rounded bg-zinc-100 py-3 tabular-nums">{z.planned}</div>
                          <div className="rounded bg-blue-100 py-3 tabular-nums">{z.confirmed}</div>
                          <div className="rounded bg-zinc-100 py-3 tabular-nums">
                            {z.percent.toFixed(2)}%
                          </div>
                        </div>
                        <div className="mt-1 grid grid-cols-3 gap-1 text-center text-[10px] text-zinc-500">
                          <span>มอบหมาย</span>
                          <span>Confirm</span>
                          <span>%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="breakdown" className="mt-4">
            {breakdownQ.isLoading ? (
              <Skeleton className="mx-auto h-96 max-w-3xl rounded-xl" />
            ) : breakdownQ.isError ? (
              <p className="text-sm text-red-600">{(breakdownQ.error as Error).message}</p>
            ) : pieData ? (
              <div className="mx-auto max-w-3xl rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: `ชั่วโมงการทำงาน HR เทียบ Confirm — ${rangeLabel}`,
                      },
                      legend: { position: 'right' },
                    },
                  }}
                />
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="weekly" className="mt-4 space-y-4">
            {weeklyQ.isLoading ? (
              <Skeleton className="h-72 w-full rounded-xl" />
            ) : weeklyQ.isError ? (
              <p className="text-sm text-red-600">{(weeklyQ.error as Error).message}</p>
            ) : (
              <>
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <Bar
                    data={weeklyChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        title: { display: true, text: 'Planned vs Actual (tbmanhours รายสัปดาห์)' },
                        legend: { position: 'top' },
                      },
                    }}
                  />
                </div>
                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>สัปดาห์</TableHead>
                        <TableHead className="text-right">Planned</TableHead>
                        <TableHead className="text-right">Actual</TableHead>
                        <TableHead className="text-right">Backlog</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weeklyQ.data?.map((w) => (
                        <TableRow key={w.week}>
                          <TableCell className="font-medium">{w.week}</TableCell>
                          <TableCell className="text-right tabular-nums">{w.planned}</TableCell>
                          <TableCell className="text-right tabular-nums">{w.actual}</TableCell>
                          <TableCell className="text-right tabular-nums">{w.backlog}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
