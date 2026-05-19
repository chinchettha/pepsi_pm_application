/**
 * เทียบ `sap/modalPages/ModalMHshow.php` — เปิดเมื่อเลือกช่วงวันบนปฏิทิน backlog/calendar
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatManhourDate } from '@/features/manhours/format-manhour-date'
import { postBacklogManhourSummary } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'

function formatRangeLabel(from: string, to: string): string {
  if (!from) return ''
  if (from === to) return formatManhourDate(from)
  const a = formatManhourDate(from)
  const b = formatManhourDate(to)
  return `${a} – ${b}`
}

export function ManhourSummaryDialog({
  open,
  onOpenChange,
  fromDate,
  toDate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fromDate: string
  toDate: string
}) {
  const enabled = open && Boolean(fromDate && toDate)

  const q = useQuery({
    queryKey: ['backlog', 'manhour-summary', fromDate, toDate],
    queryFn: () => postBacklogManhourSummary({ fromDate, toDate }),
    enabled,
  })

  const rangeLabel = formatRangeLabel(fromDate, toDate)
  const singleDay = fromDate === toDate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-base font-semibold text-emerald-900">
            Man Hours Date {rangeLabel}
          </DialogTitle>
          <DialogDescription className="sr-only">
            สรุป manhour จาก view_order — เทียบ ModalMHshow.php
          </DialogDescription>
        </DialogHeader>

        {!fromDate || !toDate ? (
          <p className="text-sm text-zinc-600">เลือกช่วงวันบนปฏิทินก่อน</p>
        ) : q.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : q.isError ? (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        ) : !q.data || q.data.totalOrders === 0 ? (
          <p className="text-sm text-zinc-600">
            ไม่มี Work Order ในวันที่เลือก (เทียบ PHP ที่ไม่เปิด modal เมื่อไม่มีข้อมูล)
          </p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-zinc-800">
              <p>
                <strong>Man Hour Plan</strong> {q.data.plannedMinutes} MIN (
                {q.data.plannedHours.toFixed(2)} H)
              </p>
              <p className="mt-1">
                <strong>Man Hour Action</strong> {q.data.actualMinutes} MIN (
                {q.data.actualHours.toFixed(2)} H)
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-zinc-800">
              <div className="flex flex-wrap items-center gap-2">
                <strong>Work Order</strong>
                <span>{q.data.totalOrders}</span>
                {q.data.byWkzb.map((x) => (
                  <span key={x.code} className="inline-flex items-center gap-1">
                    <span className="text-zinc-400">/</span>
                    <strong>{x.code}</strong>
                    <span>{x.count}</span>
                  </span>
                ))}
                <span className="text-zinc-400">/</span>
                <strong>completion</strong>
                <span>{q.data.completionCount}</span>
              </div>
              <div className="mt-2 h-5 overflow-hidden rounded bg-amber-100">
                <div
                  className="flex h-full items-center justify-center bg-amber-500 text-[10px] font-medium text-white"
                  style={{
                    width: `${q.data.completionPercent}%`,
                    minWidth: q.data.completionPercent > 0 ? '2rem' : 0,
                  }}
                >
                  {q.data.completionPercent > 0 ? `${q.data.completionPercent}%` : ''}
                </div>
              </div>
            </div>

            <div className="overflow-auto rounded-lg border border-zinc-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-800 hover:bg-zinc-800">
                    <TableHead className="text-zinc-50">Work Order/Type</TableHead>
                    <TableHead className="text-zinc-50">Status</TableHead>
                    <TableHead className="text-right text-zinc-50">Plan</TableHead>
                    <TableHead className="text-right text-zinc-50">Action</TableHead>
                    <TableHead className="text-zinc-50">Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.rows.map((r, i) => (
                    <TableRow key={`${r.wkorder}-${r.wktype ?? ''}-${i}`}>
                      <TableCell className="max-w-[14rem] truncate" title={r.operationshorttext ?? ''}>
                        {r.wkorder}
                        {r.wktype ? ` / ${r.wktype}` : ''}
                      </TableCell>
                      <TableCell>{r.syst ?? ''}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.work}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.actwork}</TableCell>
                      <TableCell>{r.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {!singleDay ? (
              <p className="text-xs text-zinc-500">
                ช่วง {fromDate} → {toDate} — เลือกวันเดียวบนปฏิทินเพื่อเทียบ ModalMHshow แบบวันเดียว (bscstart/cday
                ตรงวัน)
              </p>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
