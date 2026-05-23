/**
 * กราฟขยายเต็มจอ — เทียบ `W_summary_weekly_chart_full.php`, `W_summary_weekly_chart2_full.php`
 * เปิดแท็บใหม่จาก `/summary-weekly` (ลิงก์ "ดูกราฟแบบขยาย")
 */
import { AppCard } from '@/components/layout/AppCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  defaultReportsDateRange,
  ReportsDateFilter,
} from '@/features/reports/ReportsDateFilter'
import { SummaryWeeklyUtilizationChart } from '@/features/reports/SummaryWeeklyUtilizationChart'
import { fetchSummaryWeekly } from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, Maximize2, Printer, RefreshCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

export function SummaryWeeklyChartFullPage() {
  const navigate = useNavigate()
  const canRead = usePermission('reports.read')
  const [params] = useSearchParams()
  const variant = params.get('variant') === 'chart' ? 'chart' : 'chart2'
  const urlFrom = params.get('from') ?? undefined
  const urlTo = params.get('to') ?? undefined

  const initial = useMemo(() => {
    const base = defaultReportsDateRange(30)
    return {
      from: urlFrom ?? base.from,
      to: urlTo ?? base.to,
    }
  }, [urlFrom, urlTo])

  const [submitted, setSubmitted] = useState(initial)

  const q = useQuery({
    queryKey: ['summary-weekly', submitted, 'full'],
    queryFn: () => fetchSummaryWeekly({ from: submitted.from, to: submitted.to }),
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const chart = q.data?.utilizationChart ?? []
  const variantLabel =
    variant === 'chart2'
      ? 'กราฟชั่วโมงรวม (chart2)'
      : 'กราฟ utilization (legacy chart)'

  if (!canRead) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-subtle p-6">
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">reports.read</code>
            </>
          }
        />
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/summary-weekly">กลับ Eng Utilization</Link>
        </Button>
      </div>
    )
  }

  const printTitle = `กราฟ Utilization — ${variantLabel}`
  const printRange =
    q.data?.range != null
      ? `${q.data.range.fromDate} – ${q.data.range.toDate}`
      : `${submitted.from} – ${submitted.to}`

  return (
    <div className="summary-weekly-chart-full min-h-screen bg-app-subtle">
      <header className="print-hidden flex flex-wrap items-center justify-between gap-3 border-b border-app bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Maximize2 className="size-5 text-app-muted" aria-hidden />
          <div>
            <h1 className="text-lg font-semibold text-app">กราฟ Utilization แบบขยาย</h1>
            <p className="text-xs text-app-muted">{variantLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            disabled={!chart.length}
          >
            <Printer className="mr-1 size-4" aria-hidden />
            พิมพ์กราฟ
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
          <Button variant="outline" size="sm" asChild>
            <Link to="/summary-weekly">
              <ArrowLeft className="mr-1 size-4" aria-hidden />
              กลับ Eng Utilization
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-4 p-4 sm:p-6">
        <div className="print-hidden">
          <ReportsDateFilter initial={submitted} onSearch={setSubmitted} />
        </div>

        {q.isLoading && !q.data ? (
          <Skeleton className="h-[min(70vh,700px)] w-full rounded-card" />
        ) : q.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลดกราฟไม่สำเร็จ"
            description={(q.error as Error).message}
            action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
          />
        ) : chart.length ? (
          <AppCard pad="compact" className="print-chart-target">
            <div className="mb-4 hidden print:block">
              <h1 className="text-xl font-semibold text-black">{printTitle}</h1>
              <p className="mt-1 text-sm text-zinc-600">ช่วงข้อมูล: {printRange}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                พิมพ์เมื่อ {new Date().toLocaleString('th-TH')}
              </p>
            </div>
            {q.data?.range ? (
              <p className="print-hidden mb-3 text-caption">
                ช่วงข้อมูล: {q.data.range.fromDate} – {q.data.range.toDate}
              </p>
            ) : null}
            <SummaryWeeklyUtilizationChart items={chart} variant={variant} layout="fullscreen" />
          </AppCard>
        ) : (
          <EmptyState
            title="ยังไม่มีข้อมูล manhour"
            description="ขยายช่วงวันที่หรือ import manhour แล้วลองใหม่"
            action={{
              label: 'กลับ Eng Utilization',
              onClick: () => navigate('/summary-weekly'),
            }}
          />
        )}
      </main>
    </div>
  )
}
