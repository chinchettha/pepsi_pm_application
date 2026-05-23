/**
 * Eng Utilization + สรุปรายสัปดาห์ — เทียบ `Eng Utilization 2026.xlsx` + `W_summary_weekly.php`
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
} from '@/components/ui/table'
import { ReportsDateFilter } from '@/features/reports/ReportsDateFilter'
import { EngUtilizationChart } from '@/features/reports/EngUtilizationChart'
import { EngUtilizationMissingPhotos } from '@/features/reports/EngUtilizationMissingPhotos'
import { EngUtilizationTeamGrid } from '@/features/reports/EngUtilizationTeamGrid'
import { useAnyPermission, usePermission } from '@/lib/use-permission'
import { SummaryWeeklyImportHint } from '@/features/reports/SummaryWeeklyImportHint'
import { SummaryWeeklyUtilizationChart } from '@/features/reports/SummaryWeeklyUtilizationChart'
import { fetchSummaryWeekly } from '@/lib/api-public'
import {
  ENG_UTILIZATION_PERIOD_PRESETS,
  type EngUtilizationPeriodId,
  excelStylePercentTotal,
  formatEngUtilizationLabel,
  engUtilizationYearlyHint,
  getEngUtilizationPeriodPreset,
  resolveEngUtilizationDateRange,
  toEngUtilizationChartRows,
} from '@/lib/eng-utilization-chart'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, ExternalLink, RefreshCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

function chartFullHref(variant: 'chart' | 'chart2', from: string, to: string) {
  const qs = new URLSearchParams({ variant, from, to })
  return `/summary-weekly/chart/full?${qs.toString()}`
}

export function SummaryWeeklyPage() {
  const canRead = usePermission('reports.read')
  const [periodId, setPeriodId] = useState<EngUtilizationPeriodId>('weekly')
  const [submitted, setSubmitted] = useState(() => resolveEngUtilizationDateRange('weekly'))
  const [showRcaInChart, setShowRcaInChart] = useState(false)
  const [hideWithoutPhoto, setHideWithoutPhoto] = useState(false)
  const canManagePhotos = useAnyPermission(['admin.users.write', 'personnel.write'])

  const periodPreset = getEngUtilizationPeriodPreset(periodId)

  const q = useQuery({
    queryKey: ['summary-weekly', periodId, submitted],
    queryFn: () => fetchSummaryWeekly({ from: submitted.from, to: submitted.to }),
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const engChartRows = useMemo(
    () => (q.data?.rows ? toEngUtilizationChartRows(q.data.rows) : []),
    [q.data?.rows],
  )

  const displayChartRows = useMemo(
    () => (hideWithoutPhoto ? engChartRows.filter((p) => p.hasImage) : engChartRows),
    [engChartRows, hideWithoutPhoto],
  )

  const missingPhotoCount = useMemo(
    () => engChartRows.filter((p) => !p.hasImage).length,
    [engChartRows],
  )

  const chart = q.data?.utilizationChart ?? []
  const fullChart2 = useMemo(
    () => chartFullHref('chart2', submitted.from, submitted.to),
    [submitted.from, submitted.to],
  )
  const fullChart = useMemo(
    () => chartFullHref('chart', submitted.from, submitted.to),
    [submitted.from, submitted.to],
  )

  const applyPeriod = (id: EngUtilizationPeriodId) => {
    setPeriodId(id)
    setSubmitted(resolveEngUtilizationDateRange(id))
  }

  if (!canRead) {
    return (
      <AppPageShell title="Eng Utilization" description="กราฟและตาราง %PM / %Reactive ต่อช่าง">
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
      title="Eng Utilization"
      description="กราฟและตาราง %PM (ZB02) / %Reactive (ZB01·ZB05) ต่อช่าง — ข้อมูลจาก IW37N + manhour + confirm หลัง import SAP"
      contentClassName="space-y-6"
      headerActions={
        <>
          {q.data?.rows ? (
            <Badge variant="secondary" className="text-xs">
              {engChartRows.length} ช่าง
            </Badge>
          ) : null}
          <Button variant="outline" size="sm" asChild>
            <Link to="/reports">รายงาน KPI</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/manhours-hr">Manhour HR</Link>
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
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {ENG_UTILIZATION_PERIOD_PRESETS.map((p) => (
            <Button
              key={p.id}
              type="button"
              size="sm"
              variant={periodId === p.id ? 'default' : 'outline'}
              onClick={() => applyPeriod(p.id)}
              title={p.hint}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-app-muted">
          ช่วงอัตโนมัติ ({periodPreset.label}):{' '}
          {periodId === 'yearly' ? engUtilizationYearlyHint() : periodPreset.hint} — ปรับวันที่เองได้ด้านล่าง
        </p>
      </div>

      <ReportsDateFilter
        key={`${submitted.from}-${submitted.to}`}
        initial={submitted}
        onSearch={(value) => {
          setSubmitted(value)
        }}
      />

      {q.data?.importCoverage ? (
        <SummaryWeeklyImportHint
          coverage={q.data.importCoverage}
          rowCount={q.data.rows.length}
          onApplySapRange={(from, to) => setSubmitted({ from, to })}
        />
      ) : null}

      {q.isLoading && !q.data ? (
        <Skeleton className="h-96 w-full rounded-card" />
      ) : q.isError ? (
        <EmptyState
          icon={AlertCircle}
          title="โหลดรายงานไม่สำเร็จ"
          description={(q.error as Error).message}
          action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
        />
      ) : q.data ? (
        <>
          {q.data.range ? (
            <p className="text-caption">
              ช่วงข้อมูล (ISO): {q.data.range.fromDate} – {q.data.range.toDate} · แสดง{' '}
              {displayChartRows.length}
              {hideWithoutPhoto ? ` / ${engChartRows.length}` : ''} ช่าง (มี HR hour)
            </p>
          ) : null}

          <EngUtilizationMissingPhotos
            people={engChartRows}
            canManagePhotos={canManagePhotos}
          />

          <AppCard pad="compact" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-body-sm font-medium text-app">
                กริดรูปช่าง (เทียบ Eng Utilization 2026.xlsx)
              </p>
              <label className="flex items-center gap-2 text-caption">
                <input
                  type="checkbox"
                  checked={hideWithoutPhoto}
                  onChange={(e) => setHideWithoutPhoto(e.target.checked)}
                  className="size-4 rounded border-app"
                  disabled={missingPhotoCount === 0}
                />
                ซ่อนคนไม่มีรูป
                {missingPhotoCount > 0 ? (
                  <span className="text-app-muted">({missingPhotoCount})</span>
                ) : null}
              </label>
            </div>
            <EngUtilizationTeamGrid people={displayChartRows} showRca={showRcaInChart} />
          </AppCard>

          <AppCard pad="compact" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-body-sm font-medium text-app">
                กราฟรวม Utilization (stacked %)
              </p>
              <label className="flex items-center gap-2 text-caption">
                <input
                  type="checkbox"
                  checked={showRcaInChart}
                  onChange={(e) => setShowRcaInChart(e.target.checked)}
                  className="size-4 rounded border-app"
                />
                รวม %RCA ในกราฟ
              </label>
            </div>
            <EngUtilizationChart
              items={displayChartRows}
              layout="compact"
              showRca={showRcaInChart}
            />
            <p className="text-xs text-app-muted">
              คอลัมน์ Total ใน Excel = %PM + %Reactive (ไม่รวม RCA) · ตารางด้านล่างคอลัมน์ Total รวม RCA
            </p>
          </AppCard>

          <AppCard pad="compact">
            <details>
              <summary className="cursor-pointer text-body-sm font-medium text-app">
                กราฟชั่วโมงรวม (legacy W_summary_weekly_chart2)
              </summary>
              <div className="mt-4">
                <SummaryWeeklyUtilizationChart items={chart} variant="chart2" layout="compact" />
                <p className="mt-3 text-center text-body-sm">
                  <Button variant="ghost" size="sm" className="h-auto px-1 text-sky-700" asChild>
                    <a href={fullChart2} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 inline size-3.5" aria-hidden />
                      ดูกราฟแบบขยาย
                    </a>
                  </Button>
                  <span className="mx-2 text-app-muted">|</span>
                  <Button variant="ghost" size="sm" className="h-auto px-1 text-app-muted" asChild>
                    <a href={fullChart} target="_blank" rel="noopener noreferrer">
                      chart (legacy)
                    </a>
                  </Button>
                </p>
              </div>
            </details>
          </AppCard>

          <AppCard pad="compact" className="p-0">
            <div className="app-table-shell overflow-x-auto">
              <Table embedded stickyHeader zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No.</TableHead>
                    <TableHead>Work Center</TableHead>
                    <TableHead className="text-right">PM (ชม.)</TableHead>
                    <TableHead className="text-right">Reactive (ชม.)</TableHead>
                    <TableHead className="text-right">RCA (ชม.)</TableHead>
                    <TableHead className="text-right">Wo</TableHead>
                    <TableHead className="text-right">HR hour</TableHead>
                    <TableHead className="text-right">OT hour</TableHead>
                    <TableHead className="text-right">%PM</TableHead>
                    <TableHead className="text-right">%Reactive</TableHead>
                    <TableHead className="text-right">%RCA</TableHead>
                    <TableHead className="text-right">Total (Excel)</TableHead>
                    <TableHead className="text-right">Total+RCA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.rows.length ? (
                    q.data.rows.map((row, i) => {
                      const excelTotal = excelStylePercentTotal(
                        row.percentPm,
                        row.percentReactive,
                      )
                      return (
                        <TableRow key={row.idwkctr}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell title={row.displayName ?? undefined}>
                            {formatEngUtilizationLabel(row.wkctr, row.displayName)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.pmHours.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.reactiveHours.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.rcaWork.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-amber-700">
                            {row.woCount}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{row.hrHour}</TableCell>
                          <TableCell className="text-right tabular-nums">{row.otHour}</TableCell>
                          <TableCell className="text-right tabular-nums text-amber-700">
                            {row.percentPm.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-amber-700">
                            {row.percentReactive.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-amber-700">
                            {row.percentRca.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium text-emerald-700">
                            {excelTotal.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-app-muted">
                            {row.percentTotal.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={13} className="p-0">
                        <EmptyState
                          className="border-0 bg-transparent py-10"
                          title="ยังไม่มีข้อมูล"
                          description="ขยายช่วงวันที่หรือ import manhour"
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
