import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

export function MasterDataPanelSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-40 rounded-card" />
      <Skeleton className="h-48 w-full rounded-card" />
    </div>
  )
}

export function MasterDataPanelError({
  error,
  onRetry,
}: {
  error: unknown
  onRetry?: () => void
}) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <EmptyState
      icon={AlertCircle}
      title="โหลดไม่สำเร็จ"
      description={message}
      action={onRetry ? { label: 'ลองใหม่', onClick: onRetry } : undefined}
    />
  )
}

export function MasterDataPanelEmpty({ description }: { description?: string }) {
  return (
    <EmptyState
      title="ไม่มีข้อมูล"
      description={description ?? 'ตรวจ migration/seed หรือนำเข้าข้อมูล'}
    />
  )
}
