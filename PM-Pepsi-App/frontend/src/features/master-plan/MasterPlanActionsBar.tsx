import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  downloadMasterPlanExport,
  fetchMasterPlanStatus,
  importMasterPlanExcel,
  publishMasterPlan,
  type MasterPlanDiscipline,
} from '@/lib/master-plan-api'
import { useMasterDataPermissions } from '@/lib/master-data-permissions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Upload, Send } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type Props = {
  discipline: MasterPlanDiscipline
}

export function MasterPlanActionsBar({ discipline }: Props) {
  const { t } = useTranslation('masterData')
  const { canWrite } = useMasterDataPermissions()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [publishOpen, setPublishOpen] = useState(false)

  const statusQ = useQuery({
    queryKey: ['master-plan', 'status', discipline],
    queryFn: () => fetchMasterPlanStatus(discipline),
  })

  const importMut = useMutation({
    mutationFn: (file: File) => importMasterPlanExcel(discipline, file),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['master-plan'] })
      toast.success(
        t('masterPlan.actions.importSuccess', {
          version: data.versionNo,
          changed: data.diff.totalRowsChanged + data.diff.totalRowsAdded + data.diff.totalRowsRemoved,
        }),
      )
    },
    onError: (err: Error) => {
      const msg = err.message.includes('STRUCTURE_MISMATCH')
        ? t('masterPlan.actions.importStructureError')
        : err.message || t('masterPlan.actions.importFailed')
      toast.error(msg)
    },
  })

  const exportMut = useMutation({
    mutationFn: (status: 'published' | 'draft') => downloadMasterPlanExport(discipline, status),
    onError: () => toast.error(t('masterPlan.actions.exportFailed')),
  })

  const publishMut = useMutation({
    mutationFn: () => publishMasterPlan(discipline),
    onSuccess: (data) => {
      setPublishOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['master-plan'] })
      toast.success(
        t('masterPlan.actions.publishSuccess', {
          version: data.versionNo,
          inserted: data.tasklist.inserted,
          updated: data.tasklist.updated,
        }),
      )
    },
    onError: () => toast.error(t('masterPlan.actions.publishFailed')),
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
        disabled={exportMut.isPending}
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

      {canWrite ? (
        <>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) importMut.mutate(file)
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={importMut.isPending}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-3.5" aria-hidden />
            {importMut.isPending ? t('masterPlan.actions.importing') : t('masterPlan.actions.import')}
          </Button>

          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5 bg-[#2f5597] text-xs text-white hover:bg-[#254878]"
            disabled={publishMut.isPending}
            onClick={() => setPublishOpen(true)}
          >
            <Send className="size-3.5" aria-hidden />
            {publishMut.isPending ? t('masterPlan.actions.publishing') : t('masterPlan.actions.publish')}
          </Button>
        </>
      ) : (
        <span className="text-xs text-app-muted">{t('masterPlan.actions.needWrite')}</span>
      )}

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('masterPlan.actions.publishConfirmTitle')}</DialogTitle>
            <DialogDescription>{t('masterPlan.actions.publishConfirmBody')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setPublishOpen(false)}>
              {t('masterPlan.actions.cancel')}
            </Button>
            <Button
              type="button"
              className="bg-[#2f5597] hover:bg-[#254878]"
              disabled={publishMut.isPending}
              onClick={() => publishMut.mutate()}
            >
              {t('masterPlan.actions.confirmPublish')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
