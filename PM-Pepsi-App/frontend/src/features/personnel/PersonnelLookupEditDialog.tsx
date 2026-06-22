import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MasterDataEntityDialogTitle } from '@/features/master-data/master-data-dialog-i18n'
import { mdField, mdMaxLen, mdRequired } from '@/features/master-data/master-data-form-i18n'
import type { PersonnelLookupEntity } from '@/features/personnel/PersonnelLookupField'
import { splitPersonnelLookupLabel } from '@/features/personnel/personnel-lookup-label'
import { personnelLookupMutateErrorMessage } from '@/features/personnel/personnel-lookup-quick-add-error'
import {
  updateDepartment,
  updateGroup,
  updateLevel,
  updatePosition,
  updateWorkType,
} from '@/lib/master-data-api'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export type PersonnelLookupSelection = {
  entity: PersonnelLookupEntity
  value: string
  label: string
}

export function PersonnelLookupEditDialog({
  selection,
  open,
  onOpenChange,
  onSuccess,
}: {
  selection: PersonnelLookupSelection | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (entity: PersonnelLookupEntity, value: string) => void
}) {
  const { t } = useTranslation('personnel')
  const { t: md } = useTranslation('masterData')
  const [nameField, setNameField] = useState('')
  const [groupCode, setGroupCode] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !selection) return
    const { primary, secondary } = splitPersonnelLookupLabel(selection.label)
    setErrors({})
    setErrorSummary(null)
    if (selection.entity === 'group') {
      setGroupCode(primary)
      setGroupDesc(secondary)
      setNameField('')
      return
    }
    setGroupCode('')
    setGroupDesc('')
    setNameField(secondary || primary)
  }, [open, selection])

  function validate(): boolean {
    if (!selection) return false
    const next: Record<string, string> = {}
    if (selection.entity === 'group') {
      const code = groupCode.trim()
      const desc = groupDesc.trim()
      if (!code) next.wkctrgroup = mdRequired(md, 'wkctrgroup')
      else if (code.length > 64) next.wkctrgroup = mdMaxLen(md, 'wkctrgroup', 64)
      if (desc.length > 2000) next.wkctrdescription = mdMaxLen(md, 'wkctrdescription', 2000)
    } else {
      const name = nameField.trim()
      const fieldKey =
        selection.entity === 'department'
          ? 'department'
          : selection.entity === 'worktype'
            ? 'wkctrtype'
            : selection.entity === 'position'
              ? 'position'
              : 'wklevel'
      if (!name) next.name = mdRequired(md, fieldKey)
      else if (name.length > 2000) next.name = mdMaxLen(md, fieldKey, 2000)
    }
    setErrors(next)
    setErrorSummary(Object.values(next)[0] ?? null)
    return Object.keys(next).length === 0
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!selection) throw new Error('No selection')
      if (!validate()) throw new Error(md('validation.fixErrors'))

      switch (selection.entity) {
        case 'department':
          await updateDepartment(selection.value, { department: nameField.trim() })
          return { entity: selection.entity, value: selection.value }
        case 'worktype':
          await updateWorkType(selection.value, { wkctrtype: nameField.trim() })
          return { entity: selection.entity, value: selection.value }
        case 'position':
          await updatePosition(selection.value, { position: nameField.trim() })
          return { entity: selection.entity, value: selection.value }
        case 'level':
          await updateLevel(selection.value, { wklevel: nameField.trim() })
          return { entity: selection.entity, value: selection.value }
        case 'group':
          await updateGroup(Number(selection.value), {
            wkctrgroup: groupCode.trim(),
            wkctrdescription: groupDesc.trim() || undefined,
          })
          return { entity: selection.entity, value: selection.value }
        default: {
          const _exhaustive: never = selection.entity
          throw new Error(`Unknown entity: ${_exhaustive}`)
        }
      }
    },
    onSuccess: (result) => {
      toast.success(t('admin.lookup.edit.success'))
      onSuccess(result.entity, result.value)
      onOpenChange(false)
    },
    onError: (err) => {
      const msg = personnelLookupMutateErrorMessage(err, t)
      setErrorSummary(msg)
      toast.error(msg)
    },
  })

  if (!selection) return null

  const codeLabel =
    selection.entity === 'department'
      ? mdField(md, 'iddepartment')
      : selection.entity === 'worktype'
        ? mdField(md, 'code')
        : selection.entity === 'position'
          ? mdField(md, 'idposition')
          : selection.entity === 'level'
            ? mdField(md, 'idwklevel')
            : mdField(md, 'wkctrgroup')

  const nameLabel =
    selection.entity === 'department'
      ? mdField(md, 'department')
      : selection.entity === 'worktype'
        ? mdField(md, 'wkctrtype')
        : selection.entity === 'position'
          ? mdField(md, 'position')
          : selection.entity === 'level'
            ? mdField(md, 'wklevel')
            : mdField(md, 'wkctrdescription')

  const codeValue =
    selection.entity === 'group'
      ? splitPersonnelLookupLabel(selection.label).primary
      : selection.value

  return (
    <Dialog open={open} onOpenChange={(v) => !saveMut.isPending && onOpenChange(v)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <MasterDataEntityDialogTitle entity={selection.entity} mode="edit" />
        </DialogHeader>

        <div className="space-y-3 py-1">
          {selection.entity === 'group' ? (
            <>
              <ReadonlyField label={t('admin.lookup.edit.groupId')} value={selection.value} />
              <FieldInput
                id="edit-wkctrgroup"
                label={mdField(md, 'wkctrgroup')}
                value={groupCode}
                error={errors.wkctrgroup}
                onChange={setGroupCode}
              />
              <FieldInput
                id="edit-wkctrdescription"
                label={mdField(md, 'wkctrdescription')}
                value={groupDesc}
                error={errors.wkctrdescription}
                onChange={setGroupDesc}
              />
            </>
          ) : (
            <>
              <ReadonlyField label={codeLabel} value={codeValue} />
              <FieldInput
                id="edit-lookup-name"
                label={nameLabel}
                value={nameField}
                error={errors.name}
                onChange={setNameField}
              />
            </>
          )}
          {errorSummary ? <p className="text-body-sm text-form-error">{errorSummary}</p> : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={saveMut.isPending}
            onClick={() => onOpenChange(false)}
          >
            {md('actions.cancel')}
          </Button>
          <Button type="button" disabled={saveMut.isPending} onClick={() => void saveMut.mutate()}>
            {saveMut.isPending ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
            {md('actions.update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-app-muted">{label}</Label>
      <Input value={value} readOnly disabled className="bg-app-subtle" />
    </div>
  )
}

function FieldInput({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-app-muted">
        {label}
      </Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
      {error ? <p className="text-[11px] text-form-error">{error}</p> : null}
    </div>
  )
}
