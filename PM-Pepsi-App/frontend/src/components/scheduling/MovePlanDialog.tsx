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

import { fetchMovePlanReasons, postMovePlan } from '@/lib/api-public'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { toast } from 'sonner'



type MovePlanDialogProps = {

  open: boolean

  onOpenChange: (open: boolean) => void

  idiw37: string

  wkorder?: string

  defaultDate?: string

  moveReasonRequired?: boolean

  onSuccess?: () => void

}



export function MovePlanDialog({

  open,

  onOpenChange,

  idiw37,

  wkorder,

  defaultDate,

  moveReasonRequired = true,

  onSuccess,

}: MovePlanDialogProps) {

  const { t } = useTranslation(['scheduling', 'common'])

  const qc = useQueryClient()

  const [targetDate, setTargetDate] = useState(defaultDate ?? '')

  const [reasonCode, setReasonCode] = useState('')

  const [comment, setComment] = useState('')



  useEffect(() => {

    if (open) {

      setTargetDate(defaultDate ?? '')

      setReasonCode('')

      setComment('')

    }

  }, [open, defaultDate])



  const reasonsQ = useQuery({

    queryKey: ['scheduling', 'move-reasons'],

    queryFn: fetchMovePlanReasons,

    enabled: open,

    staleTime: 600_000,

  })



  const moveM = useMutation({

    mutationFn: () =>

      postMovePlan({

        idiw37,

        targetDate,

        reasonCode: reasonCode.trim() || undefined,

        comment: comment.trim() || undefined,

      }),

    onSuccess: (data) => {

      toast.success(data.message)

      void qc.invalidateQueries({ queryKey: ['calendar'] })

      void qc.invalidateQueries({ queryKey: ['backlog'] })

      void qc.invalidateQueries({ queryKey: ['work-order', idiw37] })

      onSuccess?.()

      onOpenChange(false)

    },

    onError: (err: Error) => {

      toast.error(err.message)

    },

  })



  const canSave =

    Boolean(targetDate) &&

    (!moveReasonRequired || Boolean(reasonCode.trim())) &&

    !moveM.isPending



  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="sm:max-w-md">

        <DialogHeader>

          <DialogTitle>{t('movePlan.title')}</DialogTitle>

          <DialogDescription>

            {moveReasonRequired

              ? t('movePlan.requiredHint')

              : t('movePlan.optionalHint')}

            {wkorder ? t('movePlan.woSuffix', { wkorder }) : ''}

          </DialogDescription>

        </DialogHeader>

        <div className="space-y-4">

          <div className="space-y-1">

            <Label>{t('movePlan.targetDate')}</Label>

            <DatePicker value={targetDate} onChange={setTargetDate} className="w-full" />

          </div>

          <div className="space-y-1">

            <Label htmlFor="move-reason">

              {moveReasonRequired

                ? t('movePlan.reasonRequired')

                : t('movePlan.reasonOptional')}

            </Label>

            <select

              id="move-reason"

              className="w-full rounded-button border border-app bg-[var(--app-surface)] px-3 py-2 text-body-sm shadow-sm"

              value={reasonCode}

              onChange={(e) => setReasonCode(e.target.value)}

              disabled={reasonsQ.isLoading}

            >

              <option value="">{t('movePlan.selectReason')}</option>

              {(reasonsQ.data ?? []).map((r) => (

                <option key={r.code} value={r.code}>

                  {r.code} = {r.name}

                </option>

              ))}

            </select>

          </div>

          <div className="space-y-1">

            <Label htmlFor="move-comment">{t('movePlan.comment')}</Label>

            <Textarea

              id="move-comment"

              rows={3}

              value={comment}

              onChange={(e) => setComment(e.target.value)}

              placeholder={t('movePlan.commentPlaceholder')}

              className="resize-y"

            />

          </div>

        </div>

        <DialogFooter className="gap-2 sm:gap-0">

          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>

            {t('common:actions.cancel')}

          </Button>

          <Button type="button" disabled={!canSave} onClick={() => moveM.mutate()}>

            {t('common:actions.save')}

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  )

}

