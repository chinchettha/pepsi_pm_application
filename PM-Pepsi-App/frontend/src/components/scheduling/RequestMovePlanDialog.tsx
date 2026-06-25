import type { z } from 'zod'
import { planMoveRequestItemSchema } from '@/api/schemas'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { postPlanMoveRequest } from '@/lib/api-public'
import { invalidateOperationsViews } from '@/lib/operations-live-sync'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const MIN_COMMENT_LEN = 3

type PlanMoveRequestItem = z.infer<typeof planMoveRequestItemSchema>

type RequestMovePlanDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  idiw37: number
  wkorder?: string
  defaultPreferredDate?: string
  onSuccess?: () => void
}

export function RequestMovePlanDialog({
  open,
  onOpenChange,
  idiw37,
  wkorder,
  defaultPreferredDate,
  onSuccess,
}: RequestMovePlanDialogProps) {
  const { t } = useTranslation(['scheduling', 'common'])
  const qc = useQueryClient()
  const [comment, setComment] = useState('')
  const [preferredDate, setPreferredDate] = useState('')

  useEffect(() => {
    if (open) {
      setComment('')
      setPreferredDate(defaultPreferredDate ?? '')
    }
  }, [open, defaultPreferredDate])

  const submitM = useMutation({
    mutationFn: () =>
      postPlanMoveRequest({
        idiw37,
        comment: comment.trim(),
        preferredDate: preferredDate.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success(t('moveRequest.submitSuccess'))
      void invalidateOperationsViews(qc)
      void qc.invalidateQueries({ queryKey: ['work-order', 'modal-detail'] })
      void qc.invalidateQueries({ queryKey: ['work-order'] })
      onSuccess?.()
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const commentValid = comment.trim().length >= MIN_COMMENT_LEN

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => {
          const target = e.target
          if (
            target instanceof Element &&
            target.closest('[data-radix-popper-content-wrapper]')
          ) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('moveRequest.title')}</DialogTitle>
          <DialogDescription>
            {t('moveRequest.description')}
            {wkorder ? ` — ${wkorder}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="move-req-comment">{t('moveRequest.reasonLabel')}</Label>
            <Textarea
              id="move-req-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('moveRequest.reasonPlaceholder')}
              rows={4}
            />
            {!commentValid && comment.length > 0 ? (
              <p className="text-xs text-form-error">{t('moveRequest.reasonRequired')}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>{t('moveRequest.preferredDate')}</Label>
            <DatePicker value={preferredDate} onChange={setPreferredDate} className="w-full" />
            <p className="text-xs text-app-muted">{t('moveRequest.preferredDateHint')}</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            type="button"
            disabled={!commentValid || submitM.isPending}
            onClick={() => submitM.mutate()}
          >
            {submitM.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <CalendarClock className="mr-2 h-4 w-4" aria-hidden />
            )}
            {t('moveRequest.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type PlanMoveRequestPlannerListProps = {
  items: PlanMoveRequestItem[]
}

export function PlanMoveRequestPlannerList({ items }: PlanMoveRequestPlannerListProps) {
  const { t } = useTranslation('scheduling')
  if (items.length === 0) return null
  return (
    <div className="app-tone-warning-callout space-y-2 rounded-card border p-3 text-body-sm">
      <p className="font-medium">{t('moveRequest.plannerPendingTitle')}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-button border border-app/60 bg-[var(--app-surface)] p-2">
            <p className="font-medium">{item.requesterWkctr}</p>
            <p className="mt-1 whitespace-pre-wrap text-app">{item.comment}</p>
            {item.preferredDate ? (
              <p className="mt-1 text-xs text-app-muted">
                {t('moveRequest.preferredDateValue', { date: item.preferredDate })}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="text-xs text-app-muted">{t('moveRequest.plannerHint')}</p>
    </div>
  )
}

type TechnicianMoveRequestBannerProps = {
  pending: PlanMoveRequestItem | null | undefined
  onRequest: () => void
  canRequest: boolean
}

export function TechnicianMoveRequestBanner({
  pending,
  onRequest,
  canRequest,
}: TechnicianMoveRequestBannerProps) {
  const { t } = useTranslation('scheduling')
  if (!canRequest && !pending) return null
  if (pending) {
    return (
      <div className="app-tone-info-callout rounded-card border px-3 py-2 text-body-sm">
        <p className="font-medium">{t('moveRequest.pendingTitle')}</p>
        <p className="mt-1 whitespace-pre-wrap">{pending.comment}</p>
        {pending.preferredDate ? (
          <p className="mt-1 text-xs text-app-muted">
            {t('moveRequest.preferredDateValue', { date: pending.preferredDate })}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-app-muted">{t('moveRequest.pendingHint')}</p>
      </div>
    )
  }
  return (
    <div className="rounded-card border border-dashed border-app bg-app-subtle/40 p-3 text-body-sm">
      <p className="font-medium text-app">{t('moveRequest.technicianTitle')}</p>
      <p className="mt-1 text-app-muted">{t('moveRequest.technicianHint')}</p>
      <Button type="button" size="sm" variant="outline" className="mt-2" onClick={onRequest}>
        {t('moveRequest.openDialog')}
      </Button>
    </div>
  )
}
