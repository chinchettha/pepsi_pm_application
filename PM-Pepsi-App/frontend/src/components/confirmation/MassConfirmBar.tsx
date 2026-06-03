import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStoredAuthUser } from '@/features/auth/login-api'
import { MASS_CONFIRM_MAX_ITEMS } from '@/api/schemas'
import { fetchWorkcenters, postConfirmationMassClose } from '@/lib/api-public'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { MassConfirmBatchResult } from '@/components/confirmation/MassConfirmExportPanel'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

/** Re-export for UI copy — ต้องตรงกับ `SAP_MASS_CONFIRM_MAX` บน backend */
export const MASS_CONFIRM_MAX = MASS_CONFIRM_MAX_ITEMS

function todayDdMmYyyy() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${dd}.${mm}.${yyyy}`
}

export type MassConfirmBarProps = {
  selectedIds: number[]
  onClearSelection?: () => void
  onComplete?: () => void
  onBatchDone?: (result: MassConfirmBatchResult) => void
}

export function MassConfirmBar({
  selectedIds,
  onClearSelection,
  onComplete,
  onBatchDone,
}: MassConfirmBarProps) {
  const { t } = useTranslation('confirmation')
  const authUser = getStoredAuthUser()
  const [wkctr, setWkctr] = useState(() => (authUser?.wkctr ?? '').trim())
  const [startD, setStartD] = useState(todayDdMmYyyy)
  const [endD, setEndD] = useState(todayDdMmYyyy)
  const [startT, setStartT] = useState('08:00')
  const [endT, setEndT] = useState('17:00')

  const wcQ = useQuery({
    queryKey: ['workcenters'],
    queryFn: fetchWorkcenters,
    staleTime: 300_000,
  })

  const wkctrOptions = useMemo(() => wcQ.data ?? [], [wcQ.data])

  const massMut = useMutation({
    mutationFn: () =>
      postConfirmationMassClose({
        idiw37n: selectedIds,
        wkctr: wkctr.trim(),
        startD,
        startT,
        endD,
        endT,
      }),
    onSuccess: (res) => {
      const batch: MassConfirmBatchResult = {
        succeeded: res.succeeded,
        failed: res.failed,
      }
      if (res.failed.length > 0) {
        toast.warning(
          t('massConfirm.toastPartialClose', {
            ok: res.succeeded.length,
            fail: res.failed.length,
          }),
        )
      } else {
        toast.success(t('massConfirm.toastFullClose', { count: res.succeeded.length }))
      }
      onBatchDone?.(batch)
      onClearSelection?.()
      onComplete?.()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const onSave = () => {
    if (selectedIds.length === 0) {
      toast.error(t('massConfirm.selectWoFirst'))
      return
    }
    if (selectedIds.length > MASS_CONFIRM_MAX) {
      toast.error(t('massConfirm.selectMaxBatch', { max: MASS_CONFIRM_MAX }))
      return
    }
    if (!wkctr.trim()) {
      toast.error(t('massConfirm.selectWkctr'))
      return
    }
    massMut.mutate()
  }

  if (selectedIds.length === 0) return null

  return (
    <div
      className="space-y-3 rounded-card border border-emerald-200/80 bg-gradient-to-b from-emerald-50/90 to-emerald-50/40 px-4 py-3.5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-body-sm font-semibold text-app">
          {t('massConfirm.selectedCount')}{' '}
          <span className="tabular-nums text-emerald-800">
            {selectedIds.length} / {MASS_CONFIRM_MAX}
          </span>{' '}
          {t('massConfirm.items')}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onClearSelection}>
          {t('massConfirm.clearSelection')}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5">
          <Label htmlFor="mass-wkctr" className="text-xs font-semibold tracking-wide text-app-muted">
            {t('massConfirm.wkctrLabel')}
          </Label>
          <select
            id="mass-wkctr"
            className="h-10 w-full rounded-button border border-app/80 bg-[var(--app-surface)] px-2 text-body-sm shadow-sm"
            value={wkctr}
            onChange={(e) => setWkctr(e.target.value)}
          >
            <option value="">{t('massConfirm.selectOption')}</option>
            {wkctrOptions.map((w) => (
              <option key={w.wkctr} value={w.wkctr}>
                {w.wkctr} — {w.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mass-start-d" className="text-xs font-semibold tracking-wide text-app-muted">
            {t('massConfirm.startDate')}
          </Label>
          <Input
            id="mass-start-d"
            className="h-10 border-app/80 bg-[var(--app-surface)] shadow-sm"
            value={startD}
            onChange={(e) => setStartD(e.target.value)}
            placeholder={t('massConfirm.datePlaceholder')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mass-start-t" className="text-xs font-semibold tracking-wide text-app-muted">
            {t('massConfirm.startTime')}
          </Label>
          <Input
            id="mass-start-t"
            className="h-10 border-app/80 bg-[var(--app-surface)] shadow-sm"
            value={startT}
            onChange={(e) => setStartT(e.target.value)}
            placeholder={t('massConfirm.timePlaceholder')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mass-end-d" className="text-xs font-semibold tracking-wide text-app-muted">
            {t('massConfirm.endDate')}
          </Label>
          <Input
            id="mass-end-d"
            className="h-10 border-app/80 bg-[var(--app-surface)] shadow-sm"
            value={endD}
            onChange={(e) => setEndD(e.target.value)}
            placeholder={t('massConfirm.datePlaceholder')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mass-end-t" className="text-xs font-semibold tracking-wide text-app-muted">
            {t('massConfirm.endTime')}
          </Label>
          <Input
            id="mass-end-t"
            className="h-10 border-app/80 bg-[var(--app-surface)] shadow-sm"
            value={endT}
            onChange={(e) => setEndT(e.target.value)}
            placeholder={t('massConfirm.timePlaceholder')}
          />
        </div>
      </div>

      <Button
        type="button"
        className="shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
        disabled={massMut.isPending}
        onClick={onSave}
      >
        {massMut.isPending
          ? t('massConfirm.closing')
          : t('massConfirm.closeBatch', { count: selectedIds.length })}
      </Button>
    </div>
  )
}
