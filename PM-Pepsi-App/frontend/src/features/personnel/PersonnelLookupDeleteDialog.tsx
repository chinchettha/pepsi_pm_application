import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { PersonnelLookupSelection } from '@/features/personnel/PersonnelLookupEditDialog'
import { personnelLookupMutateErrorMessage } from '@/features/personnel/personnel-lookup-quick-add-error'
import {
  deleteDepartment,
  deleteGroup,
  deleteLevel,
  deletePosition,
  deleteWorkType,
} from '@/lib/master-data-api'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function PersonnelLookupDeleteDialog({
  selection,
  open,
  onOpenChange,
  onSuccess,
}: {
  selection: PersonnelLookupSelection | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (entity: NonNullable<PersonnelLookupSelection>['entity'], value: string) => void
}) {
  const { t } = useTranslation('personnel')
  const { t: md } = useTranslation('masterData')

  const deleteMut = useMutation({
    mutationFn: async () => {
      if (!selection) throw new Error('No selection')
      switch (selection.entity) {
        case 'department':
          await deleteDepartment(selection.value)
          return selection
        case 'worktype':
          await deleteWorkType(selection.value)
          return selection
        case 'position':
          await deletePosition(selection.value)
          return selection
        case 'level':
          await deleteLevel(selection.value)
          return selection
        case 'group':
          await deleteGroup(Number(selection.value))
          return selection
        default: {
          const _exhaustive: never = selection.entity
          throw new Error(`Unknown entity: ${_exhaustive}`)
        }
      }
    },
    onSuccess: (sel) => {
      toast.success(t('admin.lookup.delete.success'))
      onSuccess(sel.entity, sel.value)
      onOpenChange(false)
    },
    onError: (err) => {
      toast.error(personnelLookupMutateErrorMessage(err, t))
    },
  })

  if (!selection) return null

  return (
    <AlertDialog open={open} onOpenChange={(v) => !deleteMut.isPending && onOpenChange(v)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.lookup.delete.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.lookup.delete.description', { label: selection.label })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMut.isPending}>{md('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteMut.isPending}
            className="bg-form-error text-white hover:bg-form-error/90"
            onClick={(e) => {
              e.preventDefault()
              void deleteMut.mutate()
            }}
          >
            {deleteMut.isPending ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
            {md('actions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
