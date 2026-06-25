import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteAlertDialog } from '@/components/ui/confirm-delete-alert-dialog'
import { DdMmYyyyDatePicker } from '@/components/ui/dd-mm-yyyy-date-picker'
import { HmTimePicker } from '@/components/ui/hm-time-picker'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  deletePersonnelClose,
  fetchPersonnelCloses,
  fetchWorkcenters,
  postPersonnelClose,
} from '@/lib/api-public'
import type { PersonnelCloseKind } from '@/lib/personnel-close-kind'
import {
  formatPersonnelCloseDateTime,
  formatPersonnelCloseDuration,
  previewDurationMinutes,
  todayDdMmYyyy,
} from '@/lib/personnel-close-format'
import { personnelCloseReadyMessage } from '@/lib/work-order-close-ready'
import { invalidateOperationsViews } from '@/lib/operations-live-sync'
import { cn } from '@/lib/utils'

const DEFAULT_START_TIME = '08:00'
const DEFAULT_END_TIME = '17:00'
const MIN_INCOMPLETE_REASON_LEN = 3

function resolveDefaultWorkDate(defaultWorkDate?: string): string {
  const trimmed = defaultWorkDate?.trim()
  if (trimmed && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(trimmed)) return trimmed
  return todayDdMmYyyy()
}

type PersonnelClosePanelProps = {
  idiw37: number | null
  enabled?: boolean
  canWrite?: boolean
  imageAfterCount?: number
  selectedWkctr?: string
  onSelectWkctr?: (wkctr: string) => void
  singleTechnicianWkctr?: string
  defaultWorkDate?: string
  onAppliedToSupervisor?: (row: {
    wkctr: string
    cstdate: number
    cendate: number
  }) => void
  onChanged?: () => void
}

function CloseKindToggle({
  value,
  onChange,
  disabled,
}: {
  value: PersonnelCloseKind
  onChange: (next: PersonnelCloseKind) => void
  disabled?: boolean
}) {
  const { t } = useTranslation('confirmation')
  const options: { kind: PersonnelCloseKind; label: string; hint: string }[] = [
    {
      kind: 'complete',
      label: t('personnel.closeKindComplete'),
      hint: t('personnel.closeKindCompleteHint'),
    },
    {
      kind: 'partial',
      label: t('personnel.closeKindPartial'),
      hint: t('personnel.closeKindPartialHint'),
    },
  ]

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const active = value === opt.kind
        return (
          <button
            key={opt.kind}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(opt.kind)}
            className={cn(
              'rounded-card border px-3 py-2.5 text-left transition-colors',
              active
                ? 'border-[color-mix(in_srgb,var(--app-accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-accent)_8%,var(--app-surface))] ring-1 ring-[color-mix(in_srgb,var(--app-accent)_25%,transparent)]'
                : 'border-app/70 bg-[var(--app-surface)] hover:bg-[color-mix(in_srgb,var(--app-accent)_4%,var(--app-surface))]',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <span className="block text-sm font-medium text-app">{opt.label}</span>
            <span className="mt-0.5 block text-xs text-app-muted">{opt.hint}</span>
          </button>
        )
      })}
    </div>
  )
}

export function PersonnelClosePanel({
  idiw37,
  enabled = true,
  canWrite = true,
  imageAfterCount = 0,
  selectedWkctr: selectedWkctrProp,
  onSelectWkctr,
  singleTechnicianWkctr,
  defaultWorkDate,
  onAppliedToSupervisor,
  onChanged,
}: PersonnelClosePanelProps) {
  const { t } = useTranslation('confirmation')
  const qc = useQueryClient()
  const initialWorkDate = useMemo(
    () => resolveDefaultWorkDate(defaultWorkDate),
    [defaultWorkDate],
  )
  const [startD, setStartD] = useState(initialWorkDate)
  const [endD, setEndD] = useState(initialWorkDate)
  const [startT, setStartT] = useState(DEFAULT_START_TIME)
  const [endT, setEndT] = useState(DEFAULT_END_TIME)
  const [closeKind, setCloseKind] = useState<PersonnelCloseKind>('complete')
  const [incompleteReason, setIncompleteReason] = useState('')
  const [localWkctr, setLocalWkctr] = useState('')

  useEffect(() => {
    const workD = resolveDefaultWorkDate(defaultWorkDate)
    setStartD(workD)
    setEndD(workD)
    setStartT(DEFAULT_START_TIME)
    setEndT(DEFAULT_END_TIME)
    setCloseKind('complete')
    setIncompleteReason('')
  }, [idiw37, defaultWorkDate])

  const selectedWkctr = selectedWkctrProp ?? localWkctr
  const setSelectedWkctr = (code: string) => {
    setLocalWkctr(code)
    onSelectWkctr?.(code)
  }

  const workcentersQ = useQuery({
    queryKey: ['workcenters', 'eng'],
    queryFn: fetchWorkcenters,
    enabled,
    retry: 0,
  })

  const personnelQ = useQuery({
    queryKey: ['confirmation', 'personnel-closes', idiw37],
    queryFn: () => fetchPersonnelCloses(idiw37!),
    enabled: enabled && typeof idiw37 === 'number',
    retry: 0,
  })

  const previewMin = useMemo(
    () => previewDurationMinutes(startD, startT, endD, endT),
    [startD, startT, endD, endT],
  )

  const completeCloseCodes = useMemo(
    () =>
      new Set(
        (personnelQ.data ?? [])
          .filter((p) => p.closeKind === 'complete')
          .map((p) => p.wkctr),
      ),
    [personnelQ.data],
  )

  const reasonValid =
    closeKind !== 'partial' || incompleteReason.trim().length >= MIN_INCOMPLETE_REASON_LEN

  const closeBlockedMessage = useMemo(
    () => personnelCloseReadyMessage({ imageAfter: imageAfterCount, closeKind }),
    [imageAfterCount, closeKind],
  )

  const canSubmit =
    canWrite &&
    !closeBlockedMessage &&
    typeof idiw37 === 'number' &&
    startD &&
    endD &&
    startT &&
    endT &&
    previewMin != null &&
    previewMin > 0 &&
    reasonValid

  const addMut = useMutation({
    mutationFn: (wkctr: string) =>
      postPersonnelClose({
        idiw37: idiw37!,
        wkctr,
        startD,
        startT,
        endD,
        endT,
        closeKind,
        incompleteReason: closeKind === 'partial' ? incompleteReason.trim() : undefined,
      }),
    onSuccess: async () => {
      toast.success(
        closeKind === 'partial' ? t('personnel.savePartialSuccess') : t('personnel.saveSuccess'),
      )
      if (closeKind === 'partial') {
        setIncompleteReason('')
      }
      await qc.invalidateQueries({ queryKey: ['confirmation', 'personnel-closes', idiw37] })
      await invalidateOperationsViews(qc)
      onChanged?.()
    },
    onError: (e: Error) => toast.error(e.message || t('personnel.saveFailed')),
  })

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const delMut = useMutation({
    mutationFn: (idwrkclose: number) => deletePersonnelClose(idwrkclose),
    onSuccess: async () => {
      setDeleteTarget(null)
      await qc.invalidateQueries({ queryKey: ['confirmation', 'personnel-closes', idiw37] })
      await invalidateOperationsViews(qc)
      onChanged?.()
    },
    onError: (e: Error) => toast.error(e.message || t('personnel.deleteFailed')),
  })

  const submitForWkctr = (wkctr: string) => {
    if (typeof idiw37 !== 'number') {
      toast.error(t('personnel.openWoFirst'))
      return
    }
    if (closeBlockedMessage) {
      toast.error(closeBlockedMessage)
      return
    }
    if (!reasonValid) {
      toast.error(t('personnel.incompleteReasonRequired'))
      return
    }
    if (!canSubmit) {
      toast.error(t('personnel.invalidDateTime'))
      return
    }
    if (closeKind === 'complete' && completeCloseCodes.has(wkctr)) {
      toast.error(t('personnel.alreadyRecorded'))
      return
    }
    setSelectedWkctr(wkctr)
    addMut.mutate(wkctr)
  }

  const selfWkctr = singleTechnicianWkctr?.trim() ?? ''
  const selfCompleteRecorded = selfWkctr ? completeCloseCodes.has(selfWkctr) : false
  const saveLabel =
    closeKind === 'partial'
      ? addMut.isPending
        ? t('personnel.saving')
        : t('personnel.savePartial')
      : addMut.isPending
        ? t('personnel.saving')
        : t('personnel.recordTime')

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-body-sm font-medium text-app">{t('personnel.title')}</p>
        <p className="text-xs text-app-muted">{t('personnel.backdateHint')}</p>
      </div>
      {closeBlockedMessage ? (
        <p className="app-tone-warning-callout rounded-card border px-3 py-2 text-xs">
          {closeBlockedMessage}
        </p>
      ) : null}

      <div className="app-card app-card-pad-compact space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="pers-start-d">{t('personnel.startDate')}</Label>
            <DdMmYyyyDatePicker
              id="pers-start-d"
              value={startD}
              onChange={setStartD}
              placeholder={t('personnel.datePlaceholder')}
              disabled={!canWrite}
              className="h-10"
              fromYear={new Date().getFullYear() - 10}
              toYear={new Date().getFullYear()}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pers-start-t">{t('personnel.startTime')}</Label>
            <HmTimePicker
              id="pers-start-t"
              value={startT}
              onChange={setStartT}
              placeholder={t('personnel.timePlaceholder')}
              disabled={!canWrite}
              className="h-10"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pers-end-d">{t('personnel.endDate')}</Label>
            <DdMmYyyyDatePicker
              id="pers-end-d"
              value={endD}
              onChange={setEndD}
              placeholder={t('personnel.datePlaceholder')}
              disabled={!canWrite}
              className="h-10"
              fromYear={new Date().getFullYear() - 10}
              toYear={new Date().getFullYear()}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pers-end-t">{t('personnel.endTime')}</Label>
            <HmTimePicker
              id="pers-end-t"
              value={endT}
              onChange={setEndT}
              placeholder={t('personnel.timePlaceholder')}
              disabled={!canWrite}
              className="h-10"
            />
          </div>
        </div>
        {previewMin != null && previewMin > 0 ? (
          <p className="text-xs text-app-muted">
            {t('personnel.durationPreview', {
              duration: formatPersonnelCloseDuration(previewMin),
            })}
          </p>
        ) : startT && endT ? (
          <p className="app-tone-warning-icon text-xs">{t('personnel.invalidDateTime')}</p>
        ) : null}

        <div className="space-y-2 border-t border-app/50 pt-4">
          <Label>{t('personnel.closeKindLabel')}</Label>
          <CloseKindToggle
            value={closeKind}
            onChange={setCloseKind}
            disabled={!canWrite}
          />
        </div>

        {closeKind === 'partial' ? (
          <div className="space-y-1.5">
            <Label htmlFor="pers-incomplete-reason">{t('personnel.incompleteReason')}</Label>
            <Textarea
              id="pers-incomplete-reason"
              value={incompleteReason}
              onChange={(e) => setIncompleteReason(e.target.value)}
              placeholder={t('personnel.incompleteReasonPlaceholder')}
              disabled={!canWrite}
              rows={3}
            />
            {!reasonValid && incompleteReason.length > 0 ? (
              <p className="text-xs text-form-error">{t('personnel.incompleteReasonRequired')}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="app-card app-card-pad-compact">
        {selfWkctr ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="app-tone-info-chip rounded-full px-3 py-1 font-mono text-xs font-semibold">
              {selfWkctr}
            </span>
            <Button
              type="button"
              size="sm"
              disabled={
                !canWrite ||
                addMut.isPending ||
                (closeKind === 'complete' && selfCompleteRecorded) ||
                !canSubmit
              }
              onClick={() => submitForWkctr(selfWkctr)}
            >
              {saveLabel}
            </Button>
            {closeKind === 'complete' && selfCompleteRecorded ? (
              <span className="text-xs text-app-muted">{t('personnel.alreadyRecorded')}</span>
            ) : null}
          </div>
        ) : workcentersQ.isLoading ? (
          <Skeleton className="h-24 w-full rounded-card" />
        ) : workcentersQ.isError ? (
          <p className="text-body-sm text-form-error">{(workcentersQ.error as Error).message}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {(workcentersQ.data ?? []).map((wc) => {
              const isComplete = completeCloseCodes.has(wc.wkctr)
              const isSelected = selectedWkctr === wc.wkctr
              const blocked = closeKind === 'complete' && isComplete
              return (
                <button
                  key={wc.wkctr}
                  type="button"
                  disabled={!canSubmit || addMut.isPending || blocked}
                  title={blocked ? t('personnel.alreadyRecorded') : wc.displayName}
                  onClick={() => submitForWkctr(wc.wkctr)}
                  className={cn(
                    'rounded-card border px-2 py-2 text-left text-xs transition-colors',
                    'app-tone-info-progress border-transparent hover:opacity-90',
                    'disabled:cursor-not-allowed disabled:opacity-45',
                    isSelected &&
                      'ring-2 ring-[var(--app-surface)] ring-offset-2 ring-offset-[color-mix(in_srgb,var(--status-info)_70%,var(--app-bg))]',
                    blocked && 'opacity-60',
                  )}
                >
                  <span className="block font-semibold tabular-nums">{wc.wkctr}</span>
                  {wc.displayName ? (
                    <span className="mt-0.5 block line-clamp-2 text-[10px] leading-tight opacity-95">
                      {wc.displayName}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="overflow-hidden app-table-shell">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>{t('personnel.colCode')}</TableHead>
              <TableHead>{t('personnel.colName')}</TableHead>
              <TableHead>{t('personnel.colStatus')}</TableHead>
              <TableHead>{t('personnel.colStart')}</TableHead>
              <TableHead>{t('personnel.colEnd')}</TableHead>
              <TableHead className="text-right">{t('personnel.colDuration')}</TableHead>
              <TableHead className="w-16 text-right">{t('personnel.colDel')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {typeof idiw37 !== 'number' ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-caption">
                  {t('personnel.openWoBeforeTable')}
                </TableCell>
              </TableRow>
            ) : personnelQ.isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8">
                  <Skeleton className="h-12 w-full rounded-card" />
                </TableCell>
              </TableRow>
            ) : personnelQ.isError ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-body-sm text-form-error">
                  {(personnelQ.error as Error).message}
                </TableCell>
              </TableRow>
            ) : !personnelQ.data?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-caption">
                  {t('personnel.noRecords')}
                </TableCell>
              </TableRow>
            ) : (
              personnelQ.data.map((p) => (
                <TableRow key={p.idwrkclose}>
                  <TableCell className="tabular-nums font-medium">{p.wkctr}</TableCell>
                  <TableCell>{p.displayName || '—'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={p.closeKind === 'partial' ? 'warning' : 'success'}>
                        {p.closeKind === 'partial'
                          ? t('personnel.statusPartial')
                          : t('personnel.statusComplete')}
                      </Badge>
                      {p.closeKind === 'partial' && p.incompleteReason ? (
                        <p className="max-w-[14rem] text-xs text-app-muted line-clamp-2">
                          {p.incompleteReason}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{formatPersonnelCloseDateTime(p.cstdate)}</TableCell>
                  <TableCell className="tabular-nums">{formatPersonnelCloseDateTime(p.cendate)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPersonnelCloseDuration(p.wktimewk, p.wkunit)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {onAppliedToSupervisor && p.closeKind === 'complete' ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            onAppliedToSupervisor({
                              wkctr: p.wkctr,
                              cstdate: p.cstdate,
                              cendate: p.cendate,
                            })
                          }
                        >
                          {t('personnel.confirmClose')}
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={!canWrite || delMut.isPending}
                        onClick={() => setDeleteTarget(p.idwrkclose)}
                        aria-label={t('personnel.deleteAria')}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDeleteAlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('personnel.deleteTitle')}
        description={t('personnel.deleteDescription')}
        loading={delMut.isPending}
        onConfirm={() => {
          if (deleteTarget != null) delMut.mutate(deleteTarget)
        }}
      />
    </div>
  )
}
