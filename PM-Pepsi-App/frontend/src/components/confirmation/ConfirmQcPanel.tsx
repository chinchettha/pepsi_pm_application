import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { workOrderConfirmQcSchema } from '@/api/schemas'
import {
  fetchConfirmQc,
  postConfirmQcApprove,
  postConfirmQcReject,
} from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { z } from 'zod'

type ConfirmQc = z.infer<typeof workOrderConfirmQcSchema>

function statusVariant(
  status: ConfirmQc['status'],
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'approved') return 'default'
  if (status === 'pending') return 'secondary'
  if (status === 'rejected') return 'destructive'
  return 'outline'
}

export type ConfirmQcPanelProps = {
  idiw37: number | null
  wkorder?: string
  /** จาก work order detail — ลด round-trip */
  initialQc?: ConfirmQc | null
  enabled?: boolean
  onQcChange?: () => void
}

export function ConfirmQcPanel({
  idiw37,
  wkorder: _wkorder,
  initialQc,
  enabled = true,
  onQcChange,
}: ConfirmQcPanelProps) {
  const { t } = useTranslation('confirmation')
  const qc = useQueryClient()
  const canReview = usePermission('confirmation.import')
  const [rejectNote, setRejectNote] = useState('')

  const qcQ = useQuery({
    queryKey: ['confirmation', 'qc', idiw37],
    queryFn: () => fetchConfirmQc(idiw37!),
    enabled: enabled && typeof idiw37 === 'number' && !initialQc,
    initialData: initialQc ?? undefined,
  })

  const data = initialQc ?? qcQ.data

  const invalidate = async () => {
    if (typeof idiw37 === 'number') {
      await qc.invalidateQueries({ queryKey: ['confirmation', 'qc', idiw37] })
    }
    await qc.invalidateQueries({ queryKey: ['work-order'] })
    await qc.invalidateQueries({ queryKey: ['confirmation', 'qc', 'pending'] })
    await qc.invalidateQueries({ queryKey: ['personnel', 'admin', 'confirm'] })
    await qc.invalidateQueries({ queryKey: ['dashboard'] })
    onQcChange?.()
  }

  const approveMut = useMutation({
    mutationFn: () => postConfirmQcApprove(idiw37!),
    onSuccess: async () => {
      setRejectNote('')
      await invalidate()
    },
  })

  const rejectMut = useMutation({
    mutationFn: () => postConfirmQcReject(idiw37!, rejectNote),
    onSuccess: async () => {
      setRejectNote('')
      await invalidate()
    },
  })

  if (!enabled || typeof idiw37 !== 'number') return null

  if (qcQ.isLoading && !data) {
    return <Skeleton className="h-24 w-full" />
  }

  if (!data) return null

  return (
    <section className="app-tone-warning-review overflow-hidden rounded-card border p-4 shadow-[var(--app-shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="app-tone-warning-strong flex items-center gap-2 text-body-sm font-semibold">
          <span className="app-tone-warning-card-index flex size-8 items-center justify-center rounded-lg">
            ✓
          </span>
          {t('qc.adminTitle')}
        </h4>
        <Badge variant={statusVariant(data.status)} role="status">
          {data.statusLabel}
        </Badge>
      </div>

      <ul className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <li className="app-tone-warning-review-item rounded-button border app-surface-panel--soft px-3 py-2 text-app">
          {t('qc.images')}: <strong>{data.imageCount}</strong> (
          {t('qc.imagesDetail', { after: data.imageAfter })})
        </li>
        <li className="app-tone-warning-review-item rounded-button border app-surface-panel--soft px-3 py-2 text-app">
          {t('qc.closeCount')}: <strong>{data.closeCount}</strong>
        </li>
        <li className="app-tone-warning-review-item rounded-button border app-surface-panel--soft px-3 py-2 text-app">
          {t('qc.worktimeCount')}: <strong>{data.worktimeCount}</strong>
        </li>
        {data.reviewedAt ? (
          <li className="app-tone-warning-review-item rounded-button border app-surface-panel--soft px-3 py-2 text-app sm:col-span-2">
            {t('qc.reviewedBy')} <strong>{data.reviewedBy ?? '—'}</strong> ·{' '}
            {new Date(data.reviewedAt).toLocaleString('th-TH')}
          </li>
        ) : null}
        {data.note ? (
          <li className="rounded-button border border-red-200/80 bg-red-50/80 px-3 py-2 text-red-800 sm:col-span-2">
            {t('qc.note')}: {data.note}
          </li>
        ) : null}
      </ul>

      {canReview && data.status === 'pending' && data.readyForReview ? (
        <div className="app-tone-warning-review-divider mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:flex-wrap sm:items-end">
          <Button
            type="button"
            size="sm"
            disabled={approveMut.isPending || rejectMut.isPending}
            onClick={() => approveMut.mutate()}
          >
            {approveMut.isPending ? t('qc.approving') : t('qc.approve')}
          </Button>
          <div className="flex min-w-[12rem] flex-1 flex-col gap-1">
            <Label htmlFor="qc-reject-note" className="text-xs">
              {t('qc.rejectReasonLabel')}
            </Label>
            <Textarea
              id="qc-reject-note"
              rows={2}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder={t('qc.rejectReasonPlaceholder')}
              maxLength={500}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={approveMut.isPending || rejectMut.isPending}
            onClick={() => rejectMut.mutate()}
          >
            {rejectMut.isPending ? t('qc.rejecting') : t('qc.reject')}
          </Button>
        </div>
      ) : null}

      {(approveMut.error || rejectMut.error) && (
        <p className="text-body-sm text-red-600">
          {(approveMut.error ?? rejectMut.error)?.message}
        </p>
      )}
    </section>
  )
}
