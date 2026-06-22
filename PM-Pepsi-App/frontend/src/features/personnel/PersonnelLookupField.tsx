import type { ReactNode } from 'react'
import type { PersonnelLookupOption } from '@/lib/api-public'
import { Button } from '@/components/ui/button'
import { ExternalLink, Pencil, Plus, Settings2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export type PersonnelLookupEntity =
  | 'department'
  | 'worktype'
  | 'position'
  | 'group'
  | 'level'

const MASTER_DATA_ENTITY_PATH: Record<PersonnelLookupEntity, string> = {
  department: '/master-data?entity=department',
  worktype: '/master-data?entity=worktype',
  position: '/master-data?entity=position',
  group: '/master-data?entity=group',
  level: '/master-data?entity=level',
}

/**
 * Native <select> ดึงรายชื่อจาก master data
 * - แสดง placeholder "—" เมื่อยังไม่เลือก
 * - ถ้า value ปัจจุบันไม่ match กับ options (เช่น import เข้ามาด้วย id เก่า) จะ insert option fallback
 *   เพื่อไม่ทำให้ค่าหายตอน edit
 */
export function LookupSelect({
  value,
  options,
  loading,
  onChange,
  placeholder,
}: {
  value: string
  options: PersonnelLookupOption[] | undefined
  loading: boolean
  onChange: (next: string) => void
  placeholder?: string
}) {
  const { t } = useTranslation('personnel')
  const ph = placeholder ?? t('admin.lookup.placeholder')
  const list = options ?? []
  const hasCurrent = value === '' || list.some((o) => o.value === value)
  const selectedLabel =
    value === ''
      ? ph
      : (list.find((o) => o.value === value)?.label ??
        (hasCurrent ? value : ph))
  return (
    <select
      value={value}
      disabled={loading}
      title={selectedLabel}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full min-w-0 rounded-button border border-app bg-[var(--app-surface)] px-3 text-body-sm text-app shadow-sm focus-app-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="">{loading ? t('admin.lookup.loading') : ph}</option>
      {!hasCurrent ? (
        <option value={value}>{t('admin.lookup.notInMaster', { value })}</option>
      ) : null}
      {list.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export function PersonnelWorkInfoLookupHint() {
  const { t } = useTranslation('personnel')
  return (
    <p className="rounded-button border border-app bg-app-subtle px-3 py-2 text-[11px] leading-snug text-app-muted">
      {t('admin.lookup.manageHint')}
    </p>
  )
}

export function PersonnelLookupField({
  value,
  options,
  loading,
  onChange,
  entity,
  canReadMasterData,
  canWriteMasterData,
  onRequestQuickAdd,
  onRequestEdit,
  onRequestDelete,
  hintBelow,
}: {
  value: string
  options: PersonnelLookupOption[] | undefined
  loading: boolean
  onChange: (next: string) => void
  entity: PersonnelLookupEntity
  canReadMasterData: boolean
  canWriteMasterData: boolean
  onRequestQuickAdd?: (entity: PersonnelLookupEntity) => void
  onRequestEdit?: (entity: PersonnelLookupEntity, value: string) => void
  onRequestDelete?: (entity: PersonnelLookupEntity, value: string) => void
  hintBelow?: ReactNode
}) {
  const { t } = useTranslation('personnel')
  const list = options ?? []
  const showEmptyOptions = !loading && list.length === 0
  const hasSelection = value !== ''
  const showActions =
    canWriteMasterData &&
    (onRequestQuickAdd || (hasSelection && (onRequestEdit || onRequestDelete)))

  return (
    <div className="space-y-2">
      <LookupSelect value={value} options={options} loading={loading} onChange={onChange} />

      {showActions ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {onRequestQuickAdd ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 px-2.5 text-xs"
              disabled={loading}
              onClick={() => onRequestQuickAdd(entity)}
            >
              <Plus className="mr-1 size-3.5" aria-hidden />
              {t('admin.lookup.quickAdd.button')}
            </Button>
          ) : null}
          {hasSelection && onRequestEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 shrink-0 px-0"
              disabled={loading}
              aria-label={t('admin.lookup.edit.button')}
              onClick={() => onRequestEdit(entity, value)}
            >
              <Pencil className="size-3.5" aria-hidden />
            </Button>
          ) : null}
          {hasSelection && onRequestDelete ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 shrink-0 px-0 text-form-error hover:text-form-error"
              disabled={loading}
              aria-label={t('admin.lookup.delete.button')}
              onClick={() => onRequestDelete(entity, value)}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </Button>
          ) : null}
        </div>
      ) : null}

      {showEmptyOptions ? (
        <p className="text-xs leading-snug text-app-muted">{t('admin.lookup.emptyOptions')}</p>
      ) : null}
      {hintBelow}
      {canReadMasterData ? (
        <a
          href={MASTER_DATA_ENTITY_PATH[entity]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--app-accent)] hover:underline"
        >
          {canWriteMasterData ? (
            <Settings2 className="size-3.5 shrink-0" aria-hidden />
          ) : (
            <ExternalLink className="size-3.5 shrink-0" aria-hidden />
          )}
          {t('admin.lookup.manageLink')}
        </a>
      ) : null}
      {!canWriteMasterData ? (
        <p className="text-xs leading-snug text-app-muted">{t('admin.lookup.contactAdmin')}</p>
      ) : null}
    </div>
  )
}
