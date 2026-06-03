import { PlanningQuickAssign } from '@/components/scheduling/PlanningQuickAssign'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { fetchWorkOrderModalDetail, postPlanningAssign } from '@/lib/api-public'
import { formatPlanningHourValue } from '@/lib/planning-available-hours'
import { planningAssignModeMeta } from '@/lib/planning-i18n'
import type { PlanningAssignMode } from '@/lib/planning-assign-mode'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export type PlanningAssignTarget = {
  idiw37: number
  wkorder: string
  planDate?: string
  workHours?: number
  importWkctr?: string
}

type Props = {
  target: PlanningAssignTarget | null
  onClose: () => void
  myCode?: string
}

export function PlanningAssignDialog({ target, onClose, myCode = '' }: Props) {
  const { t } = useTranslation('planning')
  const { t: tc } = useTranslation('common')
  const qc = useQueryClient()
  const [mode, setMode] = useState<PlanningAssignMode>('P')
  const [groupCode, setGroupCode] = useState('')
  const [comment, setComment] = useState('')

  const modalQ = useQuery({
    queryKey: ['work-orders', 'modal-detail', target?.idiw37, target?.planDate],
    queryFn: () =>
      fetchWorkOrderModalDetail(String(target!.idiw37), target!.planDate || undefined),
    enabled: !!target,
  })

  useEffect(() => {
    if (!target) return
    setMode('P')
    setGroupCode('')
    setComment('')
  }, [target?.idiw37])

  const assignMut = useMutation({
    mutationFn: (input: { idiw37: number; mode: PlanningAssignMode; code: string; comment?: string }) =>
      postPlanningAssign(input),
    onSuccess: async (_data, variables) => {
      await qc.invalidateQueries({ queryKey: ['planning'] })
      await qc.invalidateQueries({ queryKey: ['work-orders'] })
      toast.success(
        variables.mode === 'G'
          ? t('assignDialog.successAuto')
          : t('assignDialog.successManual'),
      )
      onClose()
    },
    onError: (err) => toast.error((err as Error).message || t('assignDialog.assignFailed')),
  })

  const submitting = assignMut.isPending
  const planning = modalQ.data?.planning
  const groups = planning?.groups ?? []
  const workcenters = planning?.workcenters ?? []
  const assignedCodes = planning?.assignees.map((a) => a.code) ?? []
  const workHours = target?.workHours ?? 0
  const importWkctr = (target?.importWkctr ?? '').trim()

  const onSubmitAuto = () => {
    if (!target) return
    const code = groupCode.trim()
    if (!code) {
      toast.error(t('assignDialog.selectGroupError'))
      return
    }
    assignMut.mutate({
      idiw37: target.idiw37,
      mode: 'G',
      code,
      comment: comment.trim() || undefined,
    })
  }

  return (
    <Dialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open && !submitting) onClose()
      }}
    >
      <DialogContent className="max-h-[min(92vh,900px)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('assignDialog.title', { wo: target?.wkorder })}</DialogTitle>
          <DialogDescription>{t('assignDialog.description')}</DialogDescription>
        </DialogHeader>

        {modalQ.isLoading ? (
          <Skeleton className="h-48 w-full rounded-card" />
        ) : modalQ.isError ? (
          <p className="text-sm text-red-600">{(modalQ.error as Error).message}</p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2 rounded-card border border-app/60 bg-app-subtle/40 px-3 py-2 text-xs sm:grid-cols-2">
              <p>
                <span className="font-medium text-app">{t('assignDialog.woHours')}</span>{' '}
                {workHours > 0
                  ? `${formatPlanningHourValue(workHours)} ${t('assignDialog.hoursUnit')}`
                  : '—'}
              </p>
              {importWkctr ? (
                <p>
                  <span className="font-medium text-app">{t('assignDialog.importWkctr')}</span>{' '}
                  <span className="font-mono">{importWkctr}</span>
                </p>
              ) : null}
            </div>

            {modalQ.data?.date ? (
              <p className="rounded-card border border-teal-200/70 bg-teal-50/60 px-3 py-2 text-xs text-teal-950">
                {t('assignDialog.availableHour', { date: modalQ.data.date })}
              </p>
            ) : null}

            <div className="grid gap-2">
              <Label>{t('assignDialog.modeLabel')}</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                {(['P', 'G'] as const).map((m) => {
                  const meta = planningAssignModeMeta(t, m)
                  return (
                    <label
                      key={m}
                      className={`flex flex-1 cursor-pointer gap-2 rounded-card border px-3 py-2 text-sm ${
                        mode === m
                          ? 'border-teal-600 bg-teal-50/80 ring-1 ring-teal-600/30'
                          : 'border-app/60 bg-[var(--app-surface)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="planning-assign-mode"
                        value={m}
                        checked={mode === m}
                        onChange={() => setMode(m)}
                        disabled={submitting}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-medium">{meta.label}</span>
                        <span className="text-xs text-app-muted">{meta.description}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {mode === 'P' ? (
              <PlanningQuickAssign
                workcenters={workcenters}
                assignedCodes={assignedCodes}
                submitting={submitting}
                assigningCode={
                  assignMut.isPending && assignMut.variables?.mode === 'P'
                    ? assignMut.variables.code
                    : null
                }
                onAssign={(code) => {
                  if (!target) return
                  assignMut.mutate({
                    idiw37: target.idiw37,
                    mode: 'P',
                    code,
                    comment: comment.trim() || undefined,
                  })
                }}
              />
            ) : (
              <div className="space-y-2 rounded-card border border-app bg-[var(--app-surface)] p-3">
                <Label htmlFor="planning-group">{t('assignDialog.groupLabel')}</Label>
                <select
                  id="planning-group"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  disabled={submitting}
                  className="flex h-9 w-full rounded-button border border-app bg-[var(--app-surface)] px-3 py-1 text-body-sm"
                >
                  <option value="">{t('assignDialog.groupPlaceholder')}</option>
                  {groups.map((g) => (
                    <option key={g.wkctrgroup} value={g.wkctrgroup}>
                      {g.wkctrgroup}
                      {g.wkctrdescription ? ` — ${g.wkctrdescription}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-app-muted">{t('assignDialog.autoHint')}</p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="planning-assign-comment">{t('assignDialog.commentLabel')}</Label>
              <Textarea
                id="planning-assign-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                disabled={submitting}
                placeholder={t('assignDialog.commentPlaceholder')}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {tc('actions.cancel')}
          </Button>
          {mode === 'G' ? (
            <Button type="button" onClick={onSubmitAuto} disabled={submitting || !groupCode.trim()}>
              {t('assignDialog.assignAuto')}
            </Button>
          ) : myCode && !assignedCodes.includes(myCode) ? (
            <Button
              type="button"
              variant="secondary"
              disabled={submitting || !target}
              onClick={() => {
                if (!target) return
                assignMut.mutate({
                  idiw37: target.idiw37,
                  mode: 'P',
                  code: myCode,
                  comment: comment.trim() || undefined,
                })
              }}
            >
              {t('assignDialog.assignSelf', { code: myCode })}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
