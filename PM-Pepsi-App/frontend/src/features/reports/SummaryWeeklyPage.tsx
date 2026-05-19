/**

 * เทียบ `W_summary_weekly.php`, `W_summary_weekly_chart2.php`

 */

import { PageHeader } from '@/components/layout/PageHeader'

import { Badge } from '@/components/ui/badge'

import { Button } from '@/components/ui/button'

import { Skeleton } from '@/components/ui/skeleton'

import {

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableHeader,

  TableRow,

} from '@/components/ui/table'

import {

  defaultReportsDateRange,

  ReportsDateFilter,

} from '@/features/reports/ReportsDateFilter'

import { SummaryWeeklyUtilizationChart } from '@/features/reports/SummaryWeeklyUtilizationChart'

import { fetchSummaryWeekly } from '@/lib/api-public'

import { useQuery } from '@tanstack/react-query'

import { ExternalLink } from 'lucide-react'

import { useMemo, useState } from 'react'

import { Link } from 'react-router-dom'



function chartFullHref(variant: 'chart' | 'chart2', from: string, to: string) {

  const qs = new URLSearchParams({ variant, from, to })

  return `/summary-weekly/chart/full?${qs.toString()}`

}



export function SummaryWeeklyPage() {

  const [submitted, setSubmitted] = useState(() => defaultReportsDateRange(30))



  const q = useQuery({

    queryKey: ['summary-weekly', submitted],

    queryFn: () => fetchSummaryWeekly({ from: submitted.from, to: submitted.to }),

  })



  const chart = q.data?.utilizationChart ?? []

  const fullChart2 = useMemo(

    () => chartFullHref('chart2', submitted.from, submitted.to),

    [submitted.from, submitted.to],

  )

  const fullChart = useMemo(

    () => chartFullHref('chart', submitted.from, submitted.to),

    [submitted.from, submitted.to],

  )



  return (

    <div className="contents">

      <PageHeader

        title="สรุปรายสัปดาห์"

        description="Technician Utilizations + ตาราง PM/Reactive/RCA — เทียบ W_summary_weekly*"

      >

        <Badge variant="secondary">DB</Badge>

        <Button variant="outline" size="sm" asChild>

          <Link to="/reports">รายงาน KPI</Link>

        </Button>

      </PageHeader>



      <div className="space-y-6 px-4 py-6 sm:px-6">

        <ReportsDateFilter initial={submitted} onSearch={setSubmitted} />



        {q.isLoading ? (

          <Skeleton className="h-96 w-full rounded-xl" />

        ) : q.isError ? (

          <p className="text-sm text-red-600">{(q.error as Error).message}</p>

        ) : q.data ? (

          <>

            {q.data.range ? (

              <p className="text-sm text-zinc-600">

                ช่วงข้อมูล: {q.data.range.fromDate} – {q.data.range.toDate}

              </p>

            ) : null}



            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">

              <SummaryWeeklyUtilizationChart items={chart} variant="chart2" layout="compact" />

              <p className="mt-3 text-center text-sm">

                <Button variant="ghost" size="sm" className="h-auto px-1 text-sky-700" asChild>

                  <a href={fullChart2} target="_blank" rel="noopener noreferrer">

                    <ExternalLink className="mr-1 inline size-3.5" />

                    ดูกราฟแบบขยาย

                  </a>

                </Button>

                <span className="mx-2 text-zinc-300">|</span>

                <Button variant="ghost" size="sm" className="h-auto px-1 text-zinc-600" asChild>

                  <a href={fullChart} target="_blank" rel="noopener noreferrer">

                    chart (CanvasJS)

                  </a>

                </Button>

              </p>

            </div>



            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">

              <Table>

                <TableHeader>

                  <TableRow className="bg-sky-50">

                    <TableHead className="w-12">No.</TableHead>

                    <TableHead>Work Center</TableHead>

                    <TableHead className="text-right">ZB02 PM</TableHead>

                    <TableHead className="text-right">ZB01/ZB05 Reactive</TableHead>

                    <TableHead className="text-right">RCA</TableHead>

                    <TableHead className="text-right">Wo</TableHead>

                    <TableHead className="text-right">HR hour</TableHead>

                    <TableHead className="text-right">OT hour</TableHead>

                    <TableHead className="text-right">%PM</TableHead>

                    <TableHead className="text-right">%Reactive</TableHead>

                    <TableHead className="text-right">%RCA</TableHead>

                    <TableHead className="text-right">Total</TableHead>

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {q.data.rows.length ? (

                    q.data.rows.map((row, i) => (

                      <TableRow key={row.idwkctr}>

                        <TableCell>{i + 1}</TableCell>

                        <TableCell title={row.displayName ?? undefined}>

                          <span className="font-medium">{row.wkctr}</span>

                          {row.displayName ? (

                            <span className="ml-1 text-xs text-zinc-500">{row.displayName}</span>

                          ) : null}

                        </TableCell>

                        <TableCell className="text-right tabular-nums">

                          {row.pmWork} {row.pmUnit}

                        </TableCell>

                        <TableCell className="text-right tabular-nums">

                          {row.reactiveWork} {row.reactiveUnit}

                        </TableCell>

                        <TableCell className="text-right tabular-nums">

                          {row.rcaWork} {row.rcaUnit}

                        </TableCell>

                        <TableCell className="text-right tabular-nums text-amber-700">

                          {row.woCount}

                        </TableCell>

                        <TableCell className="text-right tabular-nums">{row.hrHour}</TableCell>

                        <TableCell className="text-right tabular-nums">{row.otHour}</TableCell>

                        <TableCell className="text-right tabular-nums text-amber-700">

                          {row.percentPm.toFixed(2)}

                        </TableCell>

                        <TableCell className="text-right tabular-nums text-amber-700">

                          {row.percentReactive.toFixed(2)}

                        </TableCell>

                        <TableCell className="text-right tabular-nums text-amber-700">

                          {row.percentRca.toFixed(2)}

                        </TableCell>

                        <TableCell className="text-right tabular-nums font-medium text-emerald-700">

                          {row.percentTotal.toFixed(2)}

                        </TableCell>

                      </TableRow>

                    ))

                  ) : (

                    <TableRow>

                      <TableCell colSpan={12} className="py-8 text-center text-sm text-zinc-500">

                        ยังไม่มีข้อมูล manhour / work order

                      </TableCell>

                    </TableRow>

                  )}

                </TableBody>

              </Table>

            </div>

          </>

        ) : null}

      </div>

    </div>

  )

}

