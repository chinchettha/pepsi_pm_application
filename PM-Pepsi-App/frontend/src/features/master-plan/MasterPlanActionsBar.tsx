import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  downloadMasterPlanExport,
  fetchMasterPlanStatus,
  type MasterPlanDiscipline,
} from '@/lib/master-plan-api'
import { useMasterDataPermissions } from '@/lib/master-data-permissions'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type Props = {
  discipline: MasterPlanDiscipline
}

export function MasterPlanActionsBar({ discipline }: Props) {
  const { t } = useTranslation('masterData')
  const { canWrite } = useMasterDataPermissions()

  const statusQ = useQuery({
    queryKey: ['master-plan', 'status', discipline],
    queryFn: () => fetchMasterPlanStatus(discipline),
  })

  const exportMut = useMutation({
    mutationFn: (status: 'published' | 'draft') => downloadMasterPlanExport(discipline, status),
    onError: () => toast.error(t('masterPlan.actions.exportFailed')),
  })

  const sync = statusQ.data?.tasklistSync
  const syncLabel =
    sync === 'in_sync'
      ? t('masterPlan.actions.syncInSync')
      : sync === 'diverged'
        ? t('masterPlan.actions.syncDiverged')
        : sync === 'never_published'
          ? t('masterPlan.actions.syncNever')
          : null

  const syncVariant =
    sync === 'in_sync' ? 'secondary' : sync === 'diverged' ? 'destructive' : 'outline'

  const hasPublished = Boolean(statusQ.data?.published)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {statusQ.data?.draft ? (
        <Badge variant="outline" className="text-xs tabular-nums">
          {t('masterPlan.actions.draftBadge', { version: statusQ.data.draft.versionNo })}
        </Badge>
      ) : null}
      {syncLabel ? (
        <Badge variant={syncVariant} className="text-xs">
          {syncLabel}
        </Badge>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        disabled={exportMut.isPending || !hasPublished}
        onClick={() => exportMut.mutate('published')}
      >
        <Download className="size-3.5" aria-hidden />
        {exportMut.isPending ? t('masterPlan.actions.exporting') : t('masterPlan.actions.export')}
      </Button>

      {statusQ.data?.draft ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          disabled={exportMut.isPending}
          onClick={() => exportMut.mutate('draft')}
        >
          {t('masterPlan.actions.exportDraft')}
        </Button>
      ) : null}

      {!canWrite ? (
        <span className="text-xs text-app-muted">{t('masterPlan.actions.needWrite')}</span>
      ) : null}
    </div>
  )
}
