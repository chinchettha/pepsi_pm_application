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
import { personnelLookupQuickAddErrorMessage } from '@/features/personnel/personnel-lookup-quick-add-error'
import {
  createDepartment,
  createGroup,
  createLevel,
  createPosition,
  createWorkType,
} from '@/lib/master-data-api'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type DepartmentForm = { iddepartment: string; department: string }
type WorktypeForm = { idwkctrtype: string; wkctrtype: string }
type PositionForm = { idposition: string; position: string }
type GroupForm = { wkctrgroup: string; wkctrdescription: string }
type LevelForm = { idwklevel: string; wklevel: string }

const EMPTY: Record<PersonnelLookupEntity, unknown> = {
  department: { iddepartment: '', department: '' } satisfies DepartmentForm,
  worktype: { idwkctrtype: '', wkctrtype: '' } satisfies WorktypeForm,
  position: { idposition: '', position: '' } satisfies PositionForm,
  group: { wkctrgroup: '', wkctrdescription: '' } satisfies GroupForm,
  level: { idwklevel: '', wklevel: '' } satisfies LevelForm,
}

function createdValue(
  entity: PersonnelLookupEntity,
  item: Record<string, unknown>,
): string {
  switch (entity) {
    case 'department':
      return String(item.iddepartment)
    case 'worktype':
      return String(item.idwkctrtype)
    case 'position':
      return String(item.idposition)
    case 'group':
      return String(item.idwkctrgroup)
    case 'level':
      return String(item.idwklevel)
    default: {
      const _exhaustive: never = entity
      return _exhaustive
    }
  }
}

export function PersonnelLookupQuickAddDialog({
  entity,
  open,
  onOpenChange,
  onSuccess,
}: {
  entity: PersonnelLookupEntity | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (entity: PersonnelLookupEntity, value: string) => void
}) {
  const { t } = useTranslation('personnel')
  const { t: md } = useTranslation('masterData')
  const [department, setDepartment] = useState<DepartmentForm>(EMPTY.department as DepartmentForm)
  const [worktype, setWorktype] = useState<WorktypeForm>(EMPTY.worktype as WorktypeForm)
  const [position, setPosition] = useState<PositionForm>(EMPTY.position as PositionForm)
  const [group, setGroup] = useState<GroupForm>(EMPTY.group as GroupForm)
  const [level, setLevel] = useState<LevelForm>(EMPTY.level as LevelForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !entity) return
    setDepartment(EMPTY.department as DepartmentForm)
    setWorktype(EMPTY.worktype as WorktypeForm)
    setPosition(EMPTY.position as PositionForm)
    setGroup(EMPTY.group as GroupForm)
    setLevel(EMPTY.level as LevelForm)
    setErrors({})
    setErrorSummary(null)
  }, [open, entity])

  function validate(): boolean {
    if (!entity) return false
    const next: Record<string, string> = {}

    switch (entity) {
      case 'department': {
        const id = department.iddepartment.trim()
        const name = department.department.trim()
        if (!id) next.iddepartment = mdRequired(md, 'iddepartment')
        else if (id.length > 64) next.iddepartment = mdMaxLen(md, 'iddepartment', 64)
        if (!name) next.department = mdRequired(md, 'department')
        else if (name.length > 2000) next.department = mdMaxLen(md, 'department', 2000)
        break
      }
      case 'worktype': {
        const id = worktype.idwkctrtype.trim()
        const name = worktype.wkctrtype.trim()
        if (!id) next.idwkctrtype = mdRequired(md, 'code')
        else if (id.length > 64) next.idwkctrtype = mdMaxLen(md, 'code', 64)
        if (!name) next.wkctrtype = mdRequired(md, 'wkctrtype')
        else if (name.length > 2000) next.wkctrtype = mdMaxLen(md, 'wkctrtype', 2000)
        break
      }
      case 'position': {
        const id = position.idposition.trim()
        const name = position.position.trim()
        if (!id) next.idposition = mdRequired(md, 'idposition')
        else if (id.length > 64) next.idposition = mdMaxLen(md, 'idposition', 64)
        if (!name) next.position = mdRequired(md, 'position')
        else if (name.length > 2000) next.position = mdMaxLen(md, 'position', 2000)
        break
      }
      case 'group': {
        const code = group.wkctrgroup.trim()
        const desc = group.wkctrdescription.trim()
        if (!code) next.wkctrgroup = mdRequired(md, 'wkctrgroup')
        else if (code.length > 64) next.wkctrgroup = mdMaxLen(md, 'wkctrgroup', 64)
        if (desc.length > 2000) next.wkctrdescription = mdMaxLen(md, 'wkctrdescription', 2000)
        break
      }
      case 'level': {
        const id = level.idwklevel.trim()
        const name = level.wklevel.trim()
        if (!id) next.idwklevel = mdRequired(md, 'idwklevel')
        else if (id.length > 64) next.idwklevel = mdMaxLen(md, 'idwklevel', 64)
        if (!name) next.wklevel = mdRequired(md, 'wklevel')
        else if (name.length > 2000) next.wklevel = mdMaxLen(md, 'wklevel', 2000)
        break
      }
      default: {
        const _exhaustive: never = entity
        return _exhaustive
      }
    }

    setErrors(next)
    const first = Object.values(next)[0] ?? null
    setErrorSummary(first)
    return Object.keys(next).length === 0
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!entity) throw new Error('No entity')
      if (!validate()) throw new Error(md('validation.fixErrors'))

      switch (entity) {
        case 'department':
          return {
            entity,
            item: await createDepartment({
              iddepartment: department.iddepartment.trim(),
              department: department.department.trim(),
            }),
          }
        case 'worktype':
          return {
            entity,
            item: await createWorkType({
              idwkctrtype: worktype.idwkctrtype.trim(),
              wkctrtype: worktype.wkctrtype.trim(),
            }),
          }
        case 'position':
          return {
            entity,
            item: await createPosition({
              idposition: position.idposition.trim(),
              position: position.position.trim(),
            }),
          }
        case 'group':
          return {
            entity,
            item: await createGroup({
              wkctrgroup: group.wkctrgroup.trim(),
              wkctrdescription: group.wkctrdescription.trim() || undefined,
            }),
          }
        case 'level':
          return {
            entity,
            item: await createLevel({
              idwklevel: level.idwklevel.trim(),
              wklevel: level.wklevel.trim(),
            }),
          }
        default: {
          const _exhaustive: never = entity
          throw new Error(`Unknown entity: ${_exhaustive}`)
        }
      }
    },
    onSuccess: (result) => {
      const value = createdValue(result.entity, result.item as Record<string, unknown>)
      toast.success(t('admin.lookup.quickAdd.success'))
      onSuccess(result.entity, value)
      onOpenChange(false)
    },
    onError: (err) => {
      const msg = personnelLookupQuickAddErrorMessage(err, t)
      setErrorSummary(msg)
      toast.error(msg)
    },
  })

  if (!entity) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !saveMut.isPending && onOpenChange(v)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <MasterDataEntityDialogTitle entity={entity} mode="create" />
        </DialogHeader>

        <div className="space-y-3 py-1">
          {entity === 'department' ? (
            <>
              <FieldInput
                id="quick-iddepartment"
                label={mdField(md, 'iddepartment')}
                value={department.iddepartment}
                error={errors.iddepartment}
                onChange={(v) => setDepartment((s) => ({ ...s, iddepartment: v }))}
              />
              <FieldInput
                id="quick-department"
                label={mdField(md, 'department')}
                value={department.department}
                error={errors.department}
                onChange={(v) => setDepartment((s) => ({ ...s, department: v }))}
              />
            </>
          ) : null}

          {entity === 'worktype' ? (
            <>
              <FieldInput
                id="quick-idwkctrtype"
                label={mdField(md, 'code')}
                value={worktype.idwkctrtype}
                error={errors.idwkctrtype}
                onChange={(v) => setWorktype((s) => ({ ...s, idwkctrtype: v }))}
              />
              <FieldInput
                id="quick-wkctrtype"
                label={mdField(md, 'wkctrtype')}
                value={worktype.wkctrtype}
                error={errors.wkctrtype}
                onChange={(v) => setWorktype((s) => ({ ...s, wkctrtype: v }))}
              />
            </>
          ) : null}

          {entity === 'position' ? (
            <>
              <FieldInput
                id="quick-idposition"
                label={mdField(md, 'idposition')}
                value={position.idposition}
                error={errors.idposition}
                onChange={(v) => setPosition((s) => ({ ...s, idposition: v }))}
              />
              <FieldInput
                id="quick-position"
                label={mdField(md, 'position')}
                value={position.position}
                error={errors.position}
                onChange={(v) => setPosition((s) => ({ ...s, position: v }))}
              />
            </>
          ) : null}

          {entity === 'group' ? (
            <>
              <FieldInput
                id="quick-wkctrgroup"
                label={mdField(md, 'wkctrgroup')}
                value={group.wkctrgroup}
                error={errors.wkctrgroup}
                onChange={(v) => setGroup((s) => ({ ...s, wkctrgroup: v }))}
              />
              <FieldInput
                id="quick-wkctrdescription"
                label={mdField(md, 'wkctrdescription')}
                value={group.wkctrdescription}
                error={errors.wkctrdescription}
                onChange={(v) => setGroup((s) => ({ ...s, wkctrdescription: v }))}
              />
            </>
          ) : null}

          {entity === 'level' ? (
            <>
              <FieldInput
                id="quick-idwklevel"
                label={mdField(md, 'idwklevel')}
                value={level.idwklevel}
                error={errors.idwklevel}
                onChange={(v) => setLevel((s) => ({ ...s, idwklevel: v }))}
              />
              <FieldInput
                id="quick-wklevel"
                label={mdField(md, 'wklevel')}
                value={level.wklevel}
                error={errors.wklevel}
                onChange={(v) => setLevel((s) => ({ ...s, wklevel: v }))}
              />
            </>
          ) : null}

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
          <Button
            type="button"
            disabled={saveMut.isPending}
            onClick={() => void saveMut.mutate()}
          >
            {saveMut.isPending ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
            {md('actions.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
