/**
 * Manhour HR — เทียบ PHP `W_manhours_hr.php`
 * รายการ manhour ทุกคนใน Work center เดียวกัน (กรอง `tbworkcenter.wkctr`)
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
import { getStoredAuthUser } from '@/features/auth/login-api'
import {
  formatManhourDate,
  manhourOtNet,
} from '@/features/manhours/format-manhour-date'
import { fetchManhourHr } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'
import { Printer, RefreshCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

function HourCell({ value }: { value: number }) {
  return <span className="tabular-nums">{value}</span>
}

export function ManhoursHrPage() {
  const auth = getStoredAuthUser()
  const wkctrLabel = auth?.wkctr?.trim() || '—'

  const q = useQuery({
    queryKey: ['manhours-hr', wkctrLabel],
    queryFn: () => fetchManhourHr({ limit: 500 }),
    enabled: Boolean(auth?.wkctr?.trim() || auth?.userst === 'A'),
  })

  return (
    <div>
      <PageHeader
        title="Manhour HR"
        description={`รายงาน manhour ฝั่ง HR — เทียบ W_manhours_hr.php (wkctr ${wkctrLabel})`}
      >
        <Badge variant="secondary" className="gap-1">
          <Printer className="size-3.5" />
          {q.data?.totalRows ?? 0} แถว
        </Badge>
        <Button variant="outline" size="sm" asChild>
          <Link to="/reports">รายงานรวม</Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void q.refetch()}
          disabled={q.isFetching}
        >
          <RefreshCcw className={`mr-1 size-3.5 ${q.isFetching ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </PageHeader>

      <div className="space-y-4 px-4 py-6 sm:px-6">
        {q.isLoading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : q.isError ? (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-50">
                  <TableHead className="w-14">ลำดับ</TableHead>
                  <TableHead>วันที่ทำงาน</TableHead>
                  <TableHead>ชื่อ - สกุล (ไทย)</TableHead>
                  <TableHead>ตำแหน่ง</TableHead>
                  <TableHead className="text-right">จำนวนชั่วโมงที่ทำงาน</TableHead>
                  <TableHead className="text-right">OT1</TableHead>
                  <TableHead className="text-right">OT1.5</TableHead>
                  <TableHead className="text-right">OT1HOL</TableHead>
                  <TableHead className="text-right">OT2</TableHead>
                  <TableHead className="text-right">OT3</TableHead>
                  <TableHead className="text-right">Summary/W</TableHead>
                  <TableHead className="text-right">OT net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data?.items.length ? (
                  q.data.items.map((row, i) => (
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="py-8 text-center text-sm text-zinc-500">
                      ยังไม่มีข้อมูล manhour สำหรับ Work center นี้
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
