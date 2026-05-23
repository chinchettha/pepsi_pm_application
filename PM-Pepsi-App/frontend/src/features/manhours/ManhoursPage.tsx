/**
 * เทียบ `M_manhour_chart.php` + `M_manhour_chart_performance.php` + `M_manhour_chart_show.php`
 */
import { CanPermission } from '@/components/auth/CanPermission'
import { PersonnelAvatar } from '@/components/personnel/PersonnelAvatar'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { EmptyState } from '@/components/ui/empty-state'
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
} from '@/lib/api-public'
import { describePepsiWorkWeekLabel } from '@/lib/pepsi-work-week'
import { useAnyPermission, usePermission } from '@/lib/use-permission'
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
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { AlertCircle, Search } from 'lucide-react'
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

function ChartQueryError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="โหลดข้อมูลไม่สำเร็จ"
      description={message}
      action={{ label: 'ลองใหม่', onClick: onRetry }}
    />
  )
}

export function ManhoursPage() {
  const authUser = getStoredAuthUser()
  const canRead = useAnyPermission(['manhours.read', 'manhours.admin'])
  const canAdmin = usePermission('manhours.admin') || authUser?.userst === 'A'
  const initial = defaultRange()

  const [fromDate, setFromDate] = useState(initial.from)
  const [toDate, setToDate] = useState(initial.to)
  const [submitted, setSubmitted] = useState(initial)
  const [adminWkctr, setAdminWkctr] = useState('')

  const chartOpts = {
    from: submitted.from,
    to: submitted.to,
    idwkctr: canAdmin && adminWkctr.trim() ? adminWkctr.trim() : undefined,
  }

  const perfQ = useQuery({
    queryKey: ['manhours', 'chart', 'performance', chartOpts],
    queryFn: () => fetchManhourChartPerformance(chartOpts),
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const breakdownQ = useQuery({
    queryKey: ['manhours', 'chart', 'breakdown', chartOpts],
    queryFn: () => fetchManhourChartBreakdown(chartOpts),
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const weeklyQ = useQuery({
    queryKey: ['manhours', 'summary'],
    queryFn: fetchManhours,
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const pieData = useMemo(() => {
    const b = breakdownQ.data
    if (!b) return null
    const labels = ['WH', 'OT1', 'OT1.5', 'OT1 วันหยุด', 'OT2', 'OT3', 'Confirm']
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
    labels: weeklyQ.data?.map((w) => describePepsiWorkWeekLabel(w.week)) ?? [],
    datasets: [
      {
        label: 'แผน (ชม.)',
        data: weeklyQ.data?.map((w) => w.planned) ?? [],
        backgroundColor: 'rgba(24,24,27,0.85)',
      },
      {
        label: 'จริง (ชม.)',
        data: weeklyQ.data?.map((w) => w.actual) ?? [],
        backgroundColor: 'rgba(113,113,122,0.9)',
      },
    ],
  }

  const perf = perfQ.data
  const rangeLabel = perf
    ? `${formatThaiDot(perf.range.fromDate)} – ${formatThaiDot(perf.range.toDate)}`
    : `${formatThaiDot(submitted.from)} – ${formatThaiDot(submitted.to)}`

  if (!canRead) {
    return (
      <AppPageShell title="Manhours" description="ประสิทธิภาพและสรุปชั่วโมงงาน">
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">manhours.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="Manhours"
      description="ประสิทธิภาพรายบุคคล · ชั่วโมง HR เทียบ Confirm · สรุปรายสัปดาห์"
      contentClassName="space-y-6"
      headerActions={
        <>
          <Badge variant="secondary" className="text-xs">
            กราฟ + ตาราง
          </Badge>
          {canAdmin ? (
            <Button variant="outline" size="sm" asChild>
              <Link to="/manhours/admin">จัดการ Man Hour</Link>
            </Button>
          ) : null}
          <CanPermission permission="manhours.read">
            <Button variant="outline" size="sm" asChild>
              <Link to="/manhours-hr">Manhour HR</Link>
            </Button>
          </CanPermission>
          <CanPermission permission="personnel.read">
            <Button variant="outline" size="sm" asChild>
              <Link to="/personnel">บุคลากร</Link>
            </Button>
          </CanPermission>
        </>
      }
    >
      <AppCard pad="compact">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="mh-from">เริ่มวันที่</Label>
            <DatePicker id="mh-from" value={fromDate} onChange={setFromDate} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mh-to">ถึงวันที่</Label>
            <DatePicker id="mh-to" value={toDate} onChange={setToDate} />
          </div>
          {canAdmin ? (
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
            <Search className="mr-2 size-4" aria-hidden />
            ค้นหา
          </Button>
        </div>
      </AppCard>

      <Tabs defaultValue="performance">
        <TabsList className="flex h-auto flex-wrap gap-1 bg-[var(--app-surface)] p-1">
          <TabsTrigger value="performance">ประสิทธิภาพ</TabsTrigger>
          <TabsTrigger value="breakdown">HR vs Confirm</TabsTrigger>
          <TabsTrigger value="weekly">รายสัปดาห์</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-4 space-y-4">
          {perfQ.isLoading && !perfQ.data ? (
            <Skeleton className="h-80 w-full rounded-card" />
          ) : perfQ.isError ? (
            <ChartQueryError
              message={(perfQ.error as Error).message}
              onRetry={() => void perfQ.refetch()}
            />
          ) : perf ? (
            <AppCard pad="default">
              <p className="text-center text-body-sm font-medium text-app">
                ช่วงวันที่ {rangeLabel}
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
                <div className="space-y-3">
                  <div className="rounded-card bg-[var(--app-text)] px-3 py-2 text-center text-body-sm font-medium text-white">
                    จำนวน Work order ทั้งหมด
                  </div>
                  <div className="rounded-card bg-app-muted py-6 text-center text-3xl font-bold tabular-nums">
                    {perf.totalPlannedOrders}
                  </div>
                  <div className="mt-6 rounded-card bg-[var(--app-text)] px-3 py-2 text-center text-body-sm font-medium text-white">
                    % Utilization
                  </div>
                  <div className="rounded-card bg-app-muted py-6 text-center text-3xl font-bold tabular-nums">
                    {perf.utilizationPercent.toFixed(2)}%
                  </div>
                  <p className="text-center text-xs text-app-muted">
                    Confirm {perf.confirmHours.toFixed(1)} ชม. / Manhour{' '}
                    {perf.manhourTotal.toFixed(1)} ชม.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 px-2">
                  <PersonnelAvatar
                    idwkctr={perf.profile.idwkctr}
                    displayName={perf.profile.displayName}
                    hasImage
                    size="lg"
                    className="size-48 rounded-card border border-app shadow-sm"
                  />
                  <p className="max-w-[14rem] text-center text-body-sm font-medium">
                    {perf.profile.wkctr} {perf.profile.displayName}
                  </p>
                  <p className="text-center text-xs text-app-muted">
                    {[perf.profile.wkctrtype, perf.profile.position].filter(Boolean).join(' — ')}
                  </p>
                </div>

                <div className="space-y-4">
                  {perf.zb.length === 0 ? (
                    <EmptyState
                      className="border-0 bg-transparent py-6"
                      title="ไม่มีข้อมูล ZB"
                      description="ไม่มีใบงานในช่วงวันที่ที่เลือก"
                    />
                  ) : (
                    perf.zb.map((z) => (
                      <div key={z.wktype}>
                        <div className="rounded-card bg-emerald-600 px-3 py-2 text-center text-body-sm font-medium text-white">
                          {z.wktype}
                        </div>
                        <div className="mt-1 grid grid-cols-3 gap-1 text-center text-body-sm font-semibold">
                          <div className="rounded bg-app-muted py-3 tabular-nums">{z.planned}</div>
                          <div className="rounded bg-blue-100 py-3 tabular-nums">{z.confirmed}</div>
                          <div className="rounded bg-app-muted py-3 tabular-nums">
                            {z.percent.toFixed(2)}%
                          </div>
                        </div>
                        <div className="mt-1 grid grid-cols-3 gap-1 text-center text-badge text-app-muted">
                          <span>มอบหมาย</span>
                          <span>Confirm</span>
                          <span>%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </AppCard>
          ) : (
            <EmptyState
              title="ไม่มีข้อมูลประสิทธิภาพ"
              description="เลือกช่วงวันที่แล้วกดค้นหา"
            />
          )}
        </TabsContent>

        <TabsContent value="breakdown" className="mt-4">
          {breakdownQ.isLoading && !breakdownQ.data ? (
            <Skeleton className="mx-auto h-96 max-w-3xl rounded-card" />
          ) : breakdownQ.isError ? (
            <ChartQueryError
              message={(breakdownQ.error as Error).message}
              onRetry={() => void breakdownQ.refetch()}
            />
          ) : pieData ? (
            <AppCard pad="compact" className="mx-auto max-w-3xl">
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: `ชั่วโมง HR เทียบ Confirm — ${rangeLabel}`,
                    },
                    legend: { position: 'right' },
                  },
                }}
              />
            </AppCard>
          ) : (
            <EmptyState title="ไม่มีข้อมูล breakdown" description="ลองช่วงวันที่อื่น" />
          )}
        </TabsContent>

        <TabsContent value="weekly" className="mt-4 space-y-4">
          {weeklyQ.isLoading && !weeklyQ.data ? (
            <Skeleton className="h-72 w-full rounded-card" />
          ) : weeklyQ.isError ? (
            <ChartQueryError
              message={(weeklyQ.error as Error).message}
              onRetry={() => void weeklyQ.refetch()}
            />
          ) : (
            <>
              <AppCard pad="compact">
                <Bar
                  data={weeklyChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: 'แผน vs จริง (tbmanhours รายสัปดาห์)',
                      },
                      legend: { position: 'top' },
                    },
                  }}
                />
              </AppCard>
              <AppCard pad="compact">
                <div className="app-table-shell overflow-x-auto">
                  <Table embedded stickyHeader zebra>
                    <TableHeader>
                      <TableRow>
                        <TableHead>สัปดาห์</TableHead>
                        <TableHead className="text-right">แผน (ชม.)</TableHead>
                        <TableHead className="text-right">จริง (ชม.)</TableHead>
                        <TableHead className="text-right">Backlog</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(weeklyQ.data?.length ?? 0) === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="p-0">
                            <EmptyState
                              className="border-0 bg-transparent py-10"
                              title="ยังไม่มีสรุปรายสัปดาห์"
                              description="ตรวจ migration tbmanhours หรือบันทึก manhour"
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        weeklyQ.data?.map((w) => (
                          <TableRow key={w.week}>
                            <TableCell className="font-medium">
                              <span className="block">{w.week}</span>
                              <span className="text-xs font-normal text-app-muted">
                                {describePepsiWorkWeekLabel(w.week)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{w.planned}</TableCell>
                            <TableCell className="text-right tabular-nums">{w.actual}</TableCell>
                            <TableCell className="text-right tabular-nums">{w.backlog}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </AppCard>
            </>
          )}
        </TabsContent>
      </Tabs>
    </AppPageShell>
  )
}
