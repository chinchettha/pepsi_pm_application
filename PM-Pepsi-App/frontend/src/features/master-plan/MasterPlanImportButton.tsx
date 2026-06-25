import { Button } from '@/components/ui/button'
import { importMasterPlanExcel, type MasterPlanDiscipline } from '@/lib/master-plan-api'
import { useMasterDataPermissions } from '@/lib/master-data-permissions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type MasterPlanImportButtonProps = {
  onImported?: (discipline: MasterPlanDiscipline) => void
}

/** Upload any Master Plan Excel — backend detects EE / ME / PK and auto-publishes to task list. */
export function MasterPlanImportButton({ onImported }: MasterPlanImportButtonProps) {
  const { t } = useTranslation('masterData')
  const { canWrite } = useMasterDataPermissions()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const importMut = useMutation({
    mutationFn: (file: File) => importMasterPlanExcel(file),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['master-plan'] })
      toast.success(
        t('masterPlan.actions.importPublishedSuccess', {
          discipline: data.discipline,
          version: data.versionNo,
          inserted: data.tasklist?.inserted ?? 0,
          updated: data.tasklist?.updated ?? 0,
        }),
      )
      onImported?.(data.discipline)
    },
    onError: (err: Error) => {
      const msg = err.message.includes('STRUCTURE_MISMATCH')
        ? t('masterPlan.actions.importStructureError')
        : err.message.includes('UNRECOGNIZED_WORKBOOK')
          ? t('masterPlan.actions.importUnrecognized')
          : err.message || t('masterPlan.actions.importFailed')
      toast.error(msg)
    },
  })

  if (!canWrite) return null

  return (
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
        size="sm"
        className="h-8 gap-1.5 bg-[#2f5597] text-xs text-white hover:bg-[#254878]"
        disabled={importMut.isPending}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="size-3.5" aria-hidden />
        {importMut.isPending ? t('masterPlan.actions.importing') : t('masterPlan.actions.importAny')}
      </Button>
    </>
  )
}
