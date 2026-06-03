import type { WoPmExecution } from '@/api/schemas'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { fetchWorkOrderPmReadingsXlsx, putWorkOrderPmNote } from '@/lib/api-public'
import { useMutation } from '@tanstack/react-query'
import { Download, MessageSquareText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type Props = {
  orderId: string
  pmExecution: WoPmExecution
  onSaved: () => void
  wkorderLabel?: string
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function WorkOrderPmCommentSection({
  orderId,
  pmExecution,
  onSaved,
  wkorderLabel,
}: Props) {
  const { t, i18n } = useTranslation(['scheduling', 'common'])
  const dateLocale = i18n.language.startsWith('th') ? 'th-TH' : 'en-US'
  const [note, setNote] = useState(pmExecution.note)
  const [exporting, setExporting] = useState(false)
  const canEdit = pmExecution.canEdit
  const hasReadings = pmExecution.readings.length > 0

  useEffect(() => {
    setNote(pmExecution.note)
  }, [pmExecution.note, orderId])

  const saveMut = useMutation({
    mutationFn: () => putWorkOrderPmNote(orderId, { note }),
    onSuccess: () => {
      toast.success(t('pmComment.saved'))
      onSaved()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <section className="rounded-card border border-violet-200/80 bg-violet-50/40 p-4">
      <div className="flex items-start gap-2">
        <MessageSquareText className="mt-0.5 size-5 shrink-0 text-violet-800" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-violet-950">{t('pmComment.title')}</h3>
              <p className="mt-1 text-xs text-violet-900/80">{t('pmComment.description')}</p>
            </div>
            {hasReadings ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 gap-1"
                disabled={exporting}
                onClick={async () => {
                  setExporting(true)
                  try {
                    const blob = await fetchWorkOrderPmReadingsXlsx(orderId)
                    const name = wkorderLabel?.trim() || orderId
                    downloadBlob(blob, `PM_Readings_${name}.xlsx`)
                    toast.success(t('pmComment.exported'))
                  } catch (e) {
                    toast.error((e as Error).message)
                  } finally {
                    setExporting(false)
                  }
                }}
              >
                <Download className="size-3.5" aria-hidden />
                {exporting ? t('pmComment.exporting') : t('pmComment.exportExcel')}
              </Button>
            ) : null}
          </div>
          {canEdit ? (
            <div className="mt-3 space-y-2">
              <Label htmlFor="pm-wo-comment">{t('shared.comment')}</Label>
              <textarea
                id="pm-wo-comment"
                rows={4}
                className="w-full rounded-button border border-app bg-[var(--app-surface)] px-3 py-2 text-body-sm"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('pmComment.placeholder')}
              />
              <Button
                type="button"
                size="sm"
                disabled={saveMut.isPending}
                onClick={() => saveMut.mutate()}
              >
                {saveMut.isPending ? t('shared.saving') : t('pmComment.saveNote')}
              </Button>
            </div>
          ) : note.trim() ? (
            <p className="mt-3 whitespace-pre-wrap rounded-button border border-app bg-[var(--app-surface)] px-3 py-2 text-body-sm text-app">
              {note}
            </p>
          ) : (
            <p className="mt-2 text-xs text-app-muted">{t('pmComment.empty')}</p>
          )}
          {pmExecution.noteUpdatedAt ? (
            <p className="mt-2 text-[10px] text-app-muted">
              {t('pmComment.updatedAt', {
                at: new Date(pmExecution.noteUpdatedAt).toLocaleString(dateLocale),
                wkctr: pmExecution.noteWkctr ? ` · ${pmExecution.noteWkctr}` : '',
              })}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
