import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchConfirmQcPending } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'

export type ConfirmQcPendingQueueProps = {
  enabled?: boolean
  onOpenWo: (wkorder: string, idiw37: number) => void
}

export function ConfirmQcPendingQueue({ enabled = true, onOpenWo }: ConfirmQcPendingQueueProps) {
  const pendingQ = useQuery({
    queryKey: ['confirmation', 'qc', 'pending'],
    queryFn: () => fetchConfirmQcPending(30),
    enabled,
    refetchInterval: 60_000,
  })

  if (!enabled) return null

  const items = pendingQ.data ?? []

  return (
    <div className="app-card app-card-pad-compact space-y-3">
      <div>
        <h3 className="text-body-sm font-semibold text-app">คิวรอ Admin QC</h3>
        <p className="text-xs text-app-muted">
          ใบงานที่ช่างส่งรูป/เวลาแล้ว — อนุมัติก่อนนับใน Personnel Confirm และ Export SAP
        </p>
      </div>

      {pendingQ.isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : items.length === 0 ? (
        <p className="text-caption">ไม่มีใบงานรอตรวจ</p>
      ) : (
        <ul className="divide-y divide-[var(--app-border)] rounded-button border border-app">
          {items.map((row) => (
            <li
              key={row.idiw37}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-body-sm"
            >
              <div>
                <span className="font-medium">{row.wkorder}</span>
                <span className="ml-2 text-xs text-app-muted">
                  รูป {row.imageCount} · ปิดงาน {row.closeCount}
                  {row.submittedAt
                    ? ` · ${new Date(row.submittedAt).toLocaleString('th-TH')}`
                    : ''}
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onOpenWo(row.wkorder, row.idiw37)}
              >
                เปิดตรวจ
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
