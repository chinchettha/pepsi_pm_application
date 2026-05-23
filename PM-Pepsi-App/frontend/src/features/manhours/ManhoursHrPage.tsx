/**
 * Manhour HR — เทียบ PHP `W_manhours_hr.php` + % Utilization จาก `M_manhour_chart_performance.php`
 */
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableStickyClass,
} from '@/components/ui/table'
import { getStoredAuthUser } from '@/features/auth/login-api'
import {
  formatManhourDate,
  manhourOtNet,
} from '@/features/manhours/format-manhour-date'
import {
  defaultReportsDateRange,
  ReportsDateFilter,
} from '@/features/reports/ReportsDateFilter'
import { fetchManhourHr } from '@/lib/api-public'
import { useAnyPermission } from '@/lib/use-permission'
import { cn } from '@/lib/utils'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, Printer, RefreshCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

function HourCell({ value }: { value: number }) {
  return <span className="tabular-nums">{value}</span>
}

export function ManhoursHrPage() {
  const auth = getStoredAuthUser()
  const canRead = useAnyPermission(['manhours.read', 'manhours.admin'])
  const wkctrLabel = auth?.wkctr?.trim() || '—'
  const canFetch = Boolean(canRead && (auth?.wkctr?.trim() || auth?.userst === 'A'))
  const [submitted, setSubmitted] = useState(() => defaultReportsDateRange(30))

  const q = useQuery({
    queryKey: ['manhours-hr', wkctrLabel, submitted],
    queryFn: () =>
      fetchManhourHr({
        limit: 500,
        from: submitted.from,
        to: submitted.to,
      }),
    enabled: canFetch,
    placeholderData: keepPreviousData,
  })

  const personUtilMap = useMemo(() => {
    const m = new Map<string, { pct: number; confirm: number; mh: number }>()
    for (const p of q.data?.utilization.byPerson ?? []) {
      m.set(p.idwkctr, {
        pct: p.utilizationPercent,
        confirm: p.confirmHours,
        mh: p.manhourHours,
      })
      m.set(p.wkctr, {
        pct: p.utilizationPercent,
        confirm: p.confirmHours,
        mh: p.manhourHours,
      })
    }
    return m
  }, [q.data?.utilization.byPerson])

  const team = q.data?.utilization.team
  const range = q.data?.range

  if (!canRead) {
    return (
      <AppPageShell title="Manhour HR" description="รายงาน manhour + % Utilization">
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

  if (!auth?.wkctr?.trim() && auth?.userst !== 'A') {
    return (
      <AppPageShell title="Manhour HR" description="รายงาน manhour + % Utilization">
        <EmptyState
          title="ต้องเข้าสู่ระบบด้วยรหัส Work center"
          description="หน้านี้สำหรับช่างหรือ Admin ที่ระบุ WC"
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="Manhour HR"
      description={`รายงาน manhour + % Utilization (Confirm÷HR) — WC ${wkctrLabel}`}
      contentClassName="space-y-6"
      headerActions={
        <>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Printer className="size-3.5" aria-hidden />
            {q.data?.totalRows ?? 0} แถว
          </Badge>
          {team ? (
            <Badge variant="secondary" className="text-xs">
              Utilization ทีม {team.utilizationPercent.toFixed(1)}%
            </Badge>
          ) : null}
          <Button variant="outline" size="sm" asChild>
            <Link to="/summary-weekly">Eng Utilization (%PM)</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/manhours">Manhours</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void q.refetch()}
            disabled={q.isFetching}
          >
            <RefreshCcw className={`mr-1 size-3.5 ${q.isFetching ? 'animate-spin' : ''}`} aria-hidden />
            รีเฟรช
          </Button>
        </>
      }
    >
      <ReportsDateFilter
        key={`${submitted.from}-${submitted.to}`}
        initial={submitted}
        onSearch={setSubmitted}
      />

      <p className="text-caption">
        ช่วงที่เลือก (ISO):{' '}
        <span className="font-mono tabular-nums">
          {submitted.from} – {submitted.to}
        </span>
      </p>

      {range ? (
        <AppCard pad="compact" className="space-y-1">
          <p className="text-body-sm font-medium text-app">% Utilization (Confirm ÷ HR)</p>
          <p className="text-caption">
            ช่วงคำนวณ (ISO):{' '}
            <span className="font-mono tabular-nums">
              {range.fromDate} – {range.toDate}
            </span>
            {q.data?.utilization.manhourWorkdayFrom && q.data?.utilization.manhourWorkdayTo
              ? ` · manhour ใน DB (ISO): ${q.data.utilization.manhourWorkdayFrom} – ${q.data.utilization.manhourWorkdayTo}`
              : ''}
          </p>
        </AppCard>
      ) : null}

      {q.isLoading && !q.data ? (
        <Skeleton className="h-72 w-full rounded-card" />
      ) : q.isError ? (
        <EmptyState
          icon={AlertCircle}
          title="โหลดรายงานไม่สำเร็จ"
          description={(q.error as Error).message}
          action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
        />
      ) : q.data ? (
        <>
          {team ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <AppCard pad="compact">
                <div className="text-xs text-app-muted">% Utilization ทีม</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-sky-800">
                  {team.utilizationPercent.toFixed(2)}%
                </div>
                <p className="mt-1 text-xs text-app-muted">
                  Confirm {team.confirmHours.toFixed(1)} ชม. ÷ HR {team.manhourHours.toFixed(1)} ชม.
                </p>
              </AppCard>
              <AppCard pad="compact">
                <div className="text-xs text-app-muted">Confirm รวม</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {team.confirmHours.toFixed(1)}
                </div>
              </AppCard>
              <AppCard pad="compact">
                <div className="text-xs text-app-muted">HR รวม (Summary/W)</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {team.manhourHours.toFixed(1)}
                </div>
              </AppCard>
            </div>
          ) : null}

          <AppCard pad="compact" className="space-y-2">
            <p className="text-body-sm font-medium text-app">Utilization รายคน</p>
            <p className="text-xs text-app-muted">
              เทียบ KPI รายงาน — ต่างจาก Eng Utilization ที่ใช้ %PM/%Reactive จาก WO
            </p>
            <div className="app-table-shell overflow-x-auto">
              <Table embedded stickyHeader zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead className={cn(tableStickyClass(1), 'min-w-[5.5rem]')}>
                      Work Center
                    </TableHead>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead className="text-right">Confirm ชม.</TableHead>
                    <TableHead className="text-right">HR ชม.</TableHead>
                    <TableHead className="text-right">% Util</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.utilization.byPerson.length ? (
                    q.data.utilization.byPerson.map((p) => (
                      <TableRow key={p.idwkctr}>
                        <TableCell
                          className={cn('font-mono text-body-sm', tableStickyClass(1), 'min-w-[5.5rem]')}
                        >
                          {p.wkctr}
                        </TableCell>
                        <TableCell>{p.displayName ?? '—'}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {p.confirmHours.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {p.manhourHours.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-amber-700">
                          {p.utilizationPercent.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="p-0">
                        <EmptyState
                          className="border-0 bg-transparent py-8"
                          title="ไม่มีข้อมูล utilization"
                          description="ขยายช่วงวันที่หรือนำเข้าข้อมูล"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </AppCard>

          <AppCard pad="compact" className="space-y-2">
            <p className="text-body-sm font-medium text-app">รายละเอียด manhour (รายวัน)</p>
            <div className="app-table-shell overflow-x-auto">
              <Table embedded stickyHeader zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">ลำดับ</TableHead>
                    <TableHead>วันที่ทำงาน</TableHead>
                    <TableHead>ชื่อ - สกุล</TableHead>
                    <TableHead>ตำแหน่ง</TableHead>
                    <TableHead className="text-right">WH</TableHead>
                    <TableHead className="text-right">OT1</TableHead>
                    <TableHead className="text-right">OT1.5</TableHead>
                    <TableHead className="text-right">OT1HOL</TableHead>
                    <TableHead className="text-right">OT2</TableHead>
                    <TableHead className="text-right">OT3</TableHead>
                    <TableHead className="text-right">Summary/W</TableHead>
                    <TableHead className="text-right">OT net</TableHead>
                    <TableHead className="text-right">% Util</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.items.length ? (
                    q.data.items.map((row, i) => {
                      const u =
                        personUtilMap.get(row.idwkctr) ??
                        (row.wkctr ? personUtilMap.get(row.wkctr) : undefined)
                      return (
                        <TableRow key={row.idmanhour}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{formatManhourDate(row.endDate, row.workday)}</TableCell>
                          <TableCell className="min-w-[10rem]">
                            {row.displayName?.trim() || row.idwkctr}
                          </TableCell>
                          <TableCell>{row.position?.trim() || '—'}</TableCell>
                          <TableCell className="text-right">
                            <HourCell value={row.wh} />
                          </TableCell>
                          <TableCell className="text-right">
                            <HourCell value={row.ot1} />
                          </TableCell>
                          <TableCell className="text-right">
                            <HourCell value={row.ot15} />
                          </TableCell>
                          <TableCell className="text-right">
                            <HourCell value={row.ot1hol} />
                          </TableCell>
                          <TableCell className="text-right">
                            <HourCell value={row.ot2} />
                          </TableCell>
                          <TableCell className="text-right">
                            <HourCell value={row.ot3} />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <HourCell value={row.total} />
                          </TableCell>
                          <TableCell className="text-right">
                            <HourCell value={manhourOtNet(row)} />
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-amber-700">
                            {u ? `${u.pct.toFixed(2)}%` : '—'}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={13} className="p-0">
                        <EmptyState
                          className="border-0 bg-transparent py-10"
                          title="ยังไม่มีข้อมูล manhour"
                          description="ในช่วงวันที่ที่เลือก"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </AppCard>
        </>
      ) : (
        <EmptyState title="ไม่มีข้อมูล" description="เลือกช่วงวันที่แล้วกดค้นหา" />
      )}
    </AppPageShell>
  )
}
