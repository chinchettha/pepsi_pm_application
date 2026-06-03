import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('masterData')
  const message = error instanceof Error ? error.message : String(error)
  return (
    <EmptyState
      icon={AlertCircle}
      title={t('panel.loadFailed')}
      description={message}
      action={onRetry ? { label: t('panel.retry'), onClick: onRetry } : undefined}
    />
  )
}

export function MasterDataPanelEmpty({ description }: { description?: string }) {
  const { t } = useTranslation('masterData')
  return (
    <EmptyState
      title={t('panel.empty')}
      description={description ?? t('panel.emptyHint')}
    />
  )
}
