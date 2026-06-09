/**
 * เทียบ `sap/modalPages/ModalMHshow.php` — เปิดเมื่อเลือกช่วงวันบนปฏิทิน backlog/calendar
 */
import { kpiStatToneClass } from '@/components/kpi/kpi-tone'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
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
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle>Man Hours Date {rangeLabel}</DialogTitle>
          <DialogDescription className="sr-only">
            สรุป manhour จาก view_order — เทียบ ModalMHshow.php
          </DialogDescription>
        </DialogHeader>

        {!fromDate || !toDate ? (
          <p className="text-caption">เลือกช่วงวันบนปฏิทินก่อน</p>
        ) : q.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-card" />
            <Skeleton className="h-10 w-full rounded-card" />
            <Skeleton className="h-48 w-full rounded-card" />
          </div>
        ) : q.isError ? (
          <p className="text-body-sm text-red-600">{(q.error as Error).message}</p>
        ) : !q.data || q.data.totalOrders === 0 ? (
          <p className="text-caption">
            ไม่มี Work Order ในวันที่เลือก (เทียบ PHP ที่ไม่เปิด modal เมื่อไม่มีข้อมูล)
          </p>
        ) : (
          <div className="space-y-4">
            <div className={cn(kpiStatToneClass('info'))}>
              <p>
                <strong>Man Hour Plan</strong> {q.data.plannedMinutes} MIN (
                {q.data.plannedHours.toFixed(2)} H)
              </p>
              <p className="mt-1">
                <strong>Man Hour Action</strong> {q.data.actualMinutes} MIN (
                {q.data.actualHours.toFixed(2)} H)
              </p>
            </div>

            <div className={cn(kpiStatToneClass('amber'))}>
              <div className="flex flex-wrap items-center gap-2">
                <strong>Work Order</strong>
                <span>{q.data.totalOrders}</span>
                {q.data.byWkzb.map((x) => (
                  <span key={x.code} className="inline-flex items-center gap-1">
                    <span className="text-app-muted">/</span>
                    <strong>{x.code}</strong>
                    <span>{x.count}</span>
                  </span>
                ))}
                <span className="text-app-muted">/</span>
                <strong>completion</strong>
                <span>{q.data.completionCount}</span>
              </div>
              <div className="mt-2 h-5 overflow-hidden rounded bg-app-subtle">
                <div
                  className="flex h-full items-center justify-center bg-[var(--app-accent)] text-badge font-medium text-white"
                  style={{
                    width: `${q.data.completionPercent}%`,
                    minWidth: q.data.completionPercent > 0 ? '2rem' : 0,
                  }}
                >
                  {q.data.completionPercent > 0 ? `${q.data.completionPercent}%` : ''}
                </div>
              </div>
            </div>

            <div className="overflow-auto rounded-card border border-app">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--app-text)] hover:bg-[var(--app-text)]">
                    <TableHead className="text-[var(--app-surface)]">Work Order/Type</TableHead>
                    <TableHead className="text-[var(--app-surface)]">Status</TableHead>
                    <TableHead className="text-right text-[var(--app-surface)]">Plan</TableHead>
                    <TableHead className="text-right text-[var(--app-surface)]">Action</TableHead>
                    <TableHead className="text-[var(--app-surface)]">Unit</TableHead>
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
              <p className="text-xs text-app-muted">
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
