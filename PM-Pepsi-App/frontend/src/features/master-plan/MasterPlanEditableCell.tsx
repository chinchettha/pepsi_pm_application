import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Check, Pencil, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type MasterPlanEditableCellProps = {
  column: string
  value: string
  editable: boolean
  cellClassName: string
  rowSpan?: number
  flashing?: boolean
  saving?: boolean
  onCommit: (nextValue: string) => Promise<void>
}

export function MasterPlanEditableCell({
  column,
  value,
  editable,
  cellClassName,
  rowSpan,
  flashing,
  saving,
  onCommit,
}: MasterPlanEditableCellProps) {
  const { t } = useTranslation('masterData')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isPmList = /pm list/i.test(column)
  const useTextarea = isPmList || value.length > 48

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [editing, value])

  useEffect(() => {
    if (!editing) return
    if (useTextarea) textareaRef.current?.focus()
    else inputRef.current?.focus()
  }, [editing, useTextarea])

  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  const save = async () => {
    if (draft === value) {
      setEditing(false)
      return
    }
    await onCommit(draft)
    setEditing(false)
  }

  const startEdit = () => {
    if (!editable || saving) return
    setDraft(value)
    setEditing(true)
  }

  if (!editable) {
    return (
      <td
        rowSpan={rowSpan}
        className={cn(
          'master-plan-cell border border-[#b4c6e7] px-2.5 py-1.5 text-xs text-[#333]',
          cellClassName,
          flashing && 'master-plan-cell-flash',
        )}
      >
        <CellContent column={column} value={value} rowSpan={rowSpan} />
      </td>
    )
  }

  if (editing) {
    return (
      <td
        rowSpan={rowSpan}
        className={cn(
          'master-plan-cell border border-[#2f5597]/50 bg-[#e9eff7] px-2 py-1.5 align-top',
          cellClassName,
        )}
      >
        <div className="space-y-1">
          {useTextarea ? (
            <Textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={saving}
              rows={Math.min(6, Math.max(2, draft.split('\n').length))}
              className="min-h-[2.5rem] resize-y px-2 py-1 text-[11px]"
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancel()
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void save()
              }}
            />
          ) : (
            <Input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={saving}
              className="h-8 px-2 py-1 text-[11px]"
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancel()
                if (e.key === 'Enter') void save()
              }}
            />
          )}
          <div className="flex items-center gap-1">
            <IconButton
              aria-label={t('masterPlan.save')}
              className="size-7 text-[#1f3864]"
              disabled={saving}
              onClick={() => void save()}
            >
              <Check className="size-3.5" />
            </IconButton>
            <IconButton
              aria-label={t('masterPlan.cancel')}
              className="size-7 text-app-muted"
              disabled={saving}
              onClick={cancel}
            >
              <X className="size-3.5" />
            </IconButton>
            <span className="text-[10px] text-app-muted">
              {useTextarea ? t('masterPlan.saveHintCtrlEnter') : t('masterPlan.saveHintEnter')}
            </span>
          </div>
        </div>
      </td>
    )
  }

  return (
    <td
      rowSpan={rowSpan}
      className={cn(
        'master-plan-cell group/cell border border-[#b4c6e7] px-2.5 py-1.5 text-xs text-[#333]',
        cellClassName,
        flashing && 'master-plan-cell-flash',
        editable && 'cursor-text hover:bg-[#e9eff7]/80',
      )}
      onDoubleClick={startEdit}
    >
      <div className="flex items-start justify-between gap-1.5">
        <CellContent column={column} value={value} rowSpan={rowSpan} className="min-w-0 flex-1" />
        <IconButton
          aria-label={t('masterPlan.editCell')}
          className="size-6 shrink-0 opacity-0 transition-opacity group-hover/cell:opacity-100"
          onClick={startEdit}
        >
          <Pencil className="size-3" />
        </IconButton>
      </div>
    </td>
  )
}

function CellContent({
  column,
  value,
  rowSpan,
  className,
}: {
  column: string
  value: string
  rowSpan?: number
  className?: string
}) {
  const merged = rowSpan != null && rowSpan > 1
  const h = column.trim()
  const centerMerged =
    merged &&
    /^zone$|sap code|maintenance plan|mnt\s*plan|task list|^mant$|^days$|^min$|^man$|legacy/i.test(h)

  return (
    <span
      className={cn(
        'block whitespace-pre-wrap break-words',
        centerMerged && 'mx-auto w-full text-center',
        /pm list/i.test(h) && 'leading-[1.55]',
        className,
      )}
    >
      {value}
    </span>
  )
}
