import type { WoPmExecution } from '@/api/schemas'
import { Button } from '@/components/ui/button'
import { fetchWorkOrderPmReadingsXlsx } from '@/lib/api-public'
import { Download, MessageSquareText } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { WorkOrderPmCommentThread } from './WorkOrderPmCommentThread'

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
  const { t } = useTranslation(['scheduling', 'common'])
  const [exporting, setExporting] = useState(false)
  const hasReadings = pmExecution.readings.length > 0

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
          <div className="mt-3">
            <WorkOrderPmCommentThread
              orderId={orderId}
              pmExecution={pmExecution}
              onSaved={onSaved}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
