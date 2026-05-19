/**

 * กราฟขยายเต็มจอ — เทียบ `W_summary_weekly_chart_full.php`, `W_summary_weekly_chart2_full.php`

 * เปิดแท็บใหม่จาก `/summary-weekly` (ลิงก์ "ดูกราฟแบบขยาย")

 */

import { Button } from '@/components/ui/button'

import { Skeleton } from '@/components/ui/skeleton'

import {

  defaultReportsDateRange,

  ReportsDateFilter,

} from '@/features/reports/ReportsDateFilter'

import { SummaryWeeklyUtilizationChart } from '@/features/reports/SummaryWeeklyUtilizationChart'

import { fetchSummaryWeekly } from '@/lib/api-public'

import { useQuery } from '@tanstack/react-query'

import { ArrowLeft, Maximize2 } from 'lucide-react'

import { useMemo, useState } from 'react'

import { Link, useSearchParams } from 'react-router-dom'



export function SummaryWeeklyChartFullPage() {

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

  })



  const chart = q.data?.utilizationChart ?? []



  return (

    <div className="min-h-screen bg-zinc-50">

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 shadow-sm">

        <div className="flex items-center gap-2">

          <Maximize2 className="size-5 text-zinc-600" />

          <div>

            <h1 className="text-lg font-semibold text-zinc-900">Technician Utilizations</h1>

            <p className="text-xs text-zinc-500">

              {variant === 'chart2'

                ? 'W_summary_weekly_chart2_full'

                : 'W_summary_weekly_chart_full'}

            </p>

          </div>

        </div>

        <Button variant="outline" size="sm" asChild>

          <Link to="/summary-weekly">

            <ArrowLeft className="mr-1 size-4" />

            กลับสรุปรายสัปดาห์

          </Link>

        </Button>

      </header>



      <main className="mx-auto max-w-[1400px] space-y-4 p-4 sm:p-6">

        <ReportsDateFilter initial={submitted} onSearch={setSubmitted} />



        {q.isLoading ? (

          <Skeleton className="h-[min(70vh,700px)] w-full rounded-xl" />

        ) : q.isError ? (

          <p className="text-sm text-red-600">{(q.error as Error).message}</p>

        ) : chart.length ? (

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">

            {q.data?.range ? (

              <p className="mb-3 text-sm text-zinc-600">

                ช่วงข้อมูล: {q.data.range.fromDate} – {q.data.range.toDate}

              </p>

            ) : null}

            <SummaryWeeklyUtilizationChart items={chart} variant={variant} layout="fullscreen" />

          </div>

        ) : (

          <p className="py-12 text-center text-sm text-zinc-500">ยังไม่มีข้อมูล manhour</p>

        )}

      </main>

    </div>

  )

}

