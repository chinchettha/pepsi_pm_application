import type { WoPmExecution } from '@/api/schemas'
import { Button } from '@/components/ui/button'
import { putWorkOrderPmNote } from '@/lib/api-public'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import './sap-wo-print-form.css'

type Props = {
  orderId: string | null
  wkorder: string
  pmExecution?: WoPmExecution
  canWrite: boolean
  onSaved?: () => void
}

export function WorkOrderPmSapPage2Form({
  orderId,
  wkorder,
  pmExecution,
  canWrite,
  onSaved,
}: Props) {
  const { t } = useTranslation('pmVibration')
  const enabled = Boolean(orderId) && canWrite && pmExecution?.canEdit

  const [comments, setComments] = useState(pmExecution?.note ?? '')
  const [activityReport, setActivityReport] = useState('')
  const [subsequentNotification, setSubsequentNotification] = useState('')
  const [completedBy, setCompletedBy] = useState('')
  const [signatureDate, setSignatureDate] = useState('')
  const [equipmentOk, setEquipmentOk] = useState<'' | 'Y' | 'N'>('')

  useEffect(() => {
    setComments(pmExecution?.note ?? '')
  }, [pmExecution?.note, orderId])

  const saveMut = useMutation({
    mutationFn: () => {
      if (!orderId) throw new Error(t('selectWoFirst'))
      return putWorkOrderPmNote(orderId, { note: comments })
    },
    onSuccess: () => {
      toast.success(t('page2.saved'))
      onSaved?.()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const dotted = 'sap-wo-print__input sap-wo-print__input--left w-full'

  return (
    <section className="sap-wo-print" aria-label={t('page2.sectionAria')}>
      <div className="sap-wo-print__top">
        <div>
          <span className="sap-wo-print__wo-label">{t('formHeader.workOrder')}:</span>{' '}
          <span className="sap-wo-print__wo-number">{wkorder || '—'}</span>
        </div>
        <span className="sap-wo-print__logo text-[10px]">PEPSICO INTERNATIONAL</span>
      </div>
      <p className="sap-wo-print__meta">{t('page2.metaLine')}</p>

      <hr className="sap-wo-print__rule" />

      <p className="sap-wo-print__longtext-title">{t('page2.title')}</p>

      <div className="sap-wo-print__row sap-wo-print__row--stack">
        <span>{t('page2.comments')}:</span>
        <textarea
          rows={4}
          className={`${dotted} min-h-[4.5rem] resize-y`}
          value={comments}
          disabled={!enabled}
          placeholder={t('page2.commentsPlaceholder')}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      <p className="sap-wo-print__meta text-center">{t('page2.damageCodesNote')}</p>

      <div className="sap-wo-print__row">
        <label className="sap-wo-print__pair flex items-center gap-2">
          <span>{t('page2.activityReport')}:</span>
          <input
            className={dotted}
            value={activityReport}
            disabled={!enabled}
            onChange={(e) => setActivityReport(e.target.value)}
          />
        </label>
        <label className="sap-wo-print__pair sap-wo-print__pair--right flex items-center gap-2">
          <span>{t('page2.subsequentNotification')}:</span>
          <input
            className={dotted}
            value={subsequentNotification}
            disabled={!enabled}
            onChange={(e) => setSubsequentNotification(e.target.value)}
          />
        </label>
      </div>

      <div className="sap-wo-print__row">
        <label className="sap-wo-print__pair flex items-center gap-2">
          <span>{t('page2.completedBy')}:</span>
          <input
            className={dotted}
            value={completedBy}
            disabled={!enabled}
            onChange={(e) => setCompletedBy(e.target.value)}
          />
        </label>
        <label className="sap-wo-print__pair sap-wo-print__pair--right flex items-center gap-2">
          <span>{t('page2.signature')}:</span>
          <input className={dotted} disabled placeholder="—" />
        </label>
      </div>

      <div className="sap-wo-print__row">
        <label className="flex items-center gap-2">
          <span>{t('page2.date')}:</span>
          <input
            type="date"
            className="sap-wo-print__input max-w-[10rem]"
            value={signatureDate}
            disabled={!enabled}
            onChange={(e) => setSignatureDate(e.target.value)}
          />
        </label>
      </div>

      <hr className="sap-wo-print__rule" />

      <div className="sap-wo-print__row sap-wo-print__row--stack">
        <p>{t('page2.equipmentQuestion')}</p>
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="equipment-ok"
              checked={equipmentOk === 'Y'}
              disabled={!enabled}
              onChange={() => setEquipmentOk('Y')}
            />
            Y
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="equipment-ok"
              checked={equipmentOk === 'N'}
              disabled={!enabled}
              onChange={() => setEquipmentOk('N')}
            />
            N
          </label>
        </div>
      </div>

      <div className="sap-wo-print__actions">
        <Button type="button" size="sm" disabled={!enabled || saveMut.isPending} onClick={() => saveMut.mutate()}>
          {saveMut.isPending ? t('saving') : t('page2.saveComments')}
        </Button>
        {!orderId ? (
          <p className="mt-2 text-xs text-slate-600">{t('page2.selectWoHint')}</p>
        ) : null}
      </div>
    </section>
  )
}
