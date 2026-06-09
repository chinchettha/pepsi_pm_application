import type { z } from 'zod'
import type { workOrderModalDetailSchema } from '@/api/schemas'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import './sap-wo-print-form.css'

type WoHeader = z.infer<typeof workOrderModalDetailSchema>['woHeader']

export type SapPrintCurrentRow = {
  key: string
  machine: string
  pmlist: string
  v1: string
  v2: string
  v3: string
}

export type SapPrintCompletion = {
  completionDate: string
  timeStart: string
  timeEnd: string
  completed: '' | 'Y' | 'N'
  completedBy: string
}

function Inline({ label, value }: { label: string; value: string }) {
  const display = value.trim()
  return (
    <span>
      <span className="sap-wo-print__inline">{label}:</span>{' '}
      {display ? <span>{display}</span> : null}
    </span>
  )
}

function WoBarcode({ value }: { value: string }) {
  if (!value.trim()) return null
  const bars = value.split('').flatMap((ch) => {
    const n = ch.charCodeAt(0)
    return [Math.max(1, n % 3), 1, Math.max(1, n % 4)]
  })
  const width = bars.length * 3
  return (
    <svg
      className="sap-wo-print__barcode"
      viewBox={`0 0 ${width} 32`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {bars.map((w, i) => (
        <rect key={`${i}-${w}`} x={i * 3} y={0} width={w} height={32} fill="#000" />
      ))}
    </svg>
  )
}

function PepsiCoLogo() {
  return (
    <div className="sap-wo-print__logo">
      <svg className="sap-wo-print__logo-globe" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="none" stroke="var(--brand-logo-blue-dark,#003366)" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="var(--brand-logo-blue-dark,#003366)" strokeWidth="1" />
        <path d="M12 2v20M2 12h20" stroke="var(--brand-logo-blue-dark,#003366)" strokeWidth="0.8" />
      </svg>
      <span>PEPSICO INTERNATIONAL</span>
    </div>
  )
}

type Props = {
  header: WoHeader
  currentRows: SapPrintCurrentRow[]
  measuredAtLocal: string
  completion: SapPrintCompletion
  canWrite: boolean
  saving?: boolean
  selectWoHint?: string
  onCurrentRowChange: (key: string, field: 'v1' | 'v2' | 'v3', value: string) => void
  onMeasuredAtChange: (value: string) => void
  onCompletionChange: (patch: Partial<SapPrintCompletion>) => void
  onSave: () => void
}

export function WorkOrderPmSapPrintForm({
  header,
  currentRows,
  measuredAtLocal,
  completion,
  canWrite,
  saving,
  selectWoHint,
  onCurrentRowChange,
  onMeasuredAtChange,
  onCompletionChange,
  onSave,
}: Props) {
  const { t } = useTranslation('pmVibration')

  const objectList =
    header.objectList.trim() !== ''
      ? t('formHeader.objectCount', { count: header.objectList })
      : t('formHeader.noObjects')

  return (
    <section className="sap-wo-print" aria-label={t('formHeader.sectionAria')}>
      <div className="sap-wo-print__top">
        <div>
          <span className="sap-wo-print__wo-label">{t('formHeader.workOrder')}:</span>{' '}
          <span className="sap-wo-print__wo-number">{header.wkorder || '—'}</span>
        </div>
        <PepsiCoLogo />
      </div>
      <WoBarcode value={header.wkorder} />
      {header.printMetaLine ? <p className="sap-wo-print__meta">{header.printMetaLine}</p> : null}

      <hr className="sap-wo-print__rule" />

      <div className="sap-wo-print__row">
        <div className="sap-wo-print__pair">
          <Inline label={t('formHeader.functionalLocation')} value={header.functionalLocation} />
        </div>
        <div className="sap-wo-print__pair sap-wo-print__pair--right">
          <Inline label={t('formHeader.description')} value={header.descriptionLine1} />
        </div>
      </div>
      <div className="sap-wo-print__row">
        <div className="sap-wo-print__pair">
          <Inline label={t('formHeader.equipment')} value={header.equipment} />
        </div>
        <div className="sap-wo-print__pair sap-wo-print__pair--right">
          <Inline label={t('formHeader.description')} value={header.descriptionLine2} />
        </div>
      </div>

      <hr className="sap-wo-print__rule" />

      <div className="sap-wo-print__grid-2">
        <div>
          <div className="sap-wo-print__row">
            <Inline label={t('formHeader.workCentre')} value={header.workCentre} />
          </div>
          <div className="sap-wo-print__row">
            <Inline label={t('formHeader.startDate')} value={header.startDate} />
          </div>
          <div className="sap-wo-print__row">
            <Inline label={t('formHeader.activityType')} value={header.activityType} />
          </div>
          <div className="sap-wo-print__row">
            <Inline label={t('formHeader.revision')} value={header.revision} />
          </div>
        </div>
        <div>
          <div className="sap-wo-print__row">
            <Inline label={t('formHeader.priority')} value={header.priority} />
          </div>
          <div className="sap-wo-print__row">
            <Inline label={t('formHeader.endDate')} value={header.endDate} />
          </div>
          <div className="sap-wo-print__row">
            <Inline label={t('formHeader.techId')} value={header.techId} />
          </div>
          <div className="sap-wo-print__row">
            <Inline label={t('formHeader.sysCond')} value={header.sysCond} />
          </div>
        </div>
      </div>

      <hr className="sap-wo-print__rule" />

      <div className="sap-wo-print__row sap-wo-print__row--stack">
        <Inline label={t('formHeader.description')} value={header.description} />
        <p className="sap-wo-print__indent">{header.permitStatus}</p>
        <Inline label={t('formHeader.headerShortText')} value={header.headerShortText} />
      </div>

      <hr className="sap-wo-print__rule" />

      <div className="sap-wo-print__row sap-wo-print__row--stack">
        <span>{t('formHeader.objectList')}:</span>
        <p className="sap-wo-print__indent">{objectList}</p>
      </div>

      <hr className="sap-wo-print__rule" />

      <div className="sap-wo-print__row">
        <div className="sap-wo-print__pair">
          <Inline label={t('formHeader.operation')} value={header.operationNumber} />
        </div>
        <div className="sap-wo-print__pair sap-wo-print__pair--right">
          <Inline label={t('formHeader.workCentre')} value={header.operationWorkCentre} />
        </div>
      </div>
      <div className="sap-wo-print__row">
        <div className="sap-wo-print__pair">
          <Inline label={t('formHeader.operationText')} value={header.operationText} />
        </div>
        <div className="sap-wo-print__pair sap-wo-print__pair--right">
          <Inline label={t('formHeader.unloadingPoint')} value={header.unloadingPoint} />
        </div>
      </div>

      <hr className="sap-wo-print__rule" />

      <p className="sap-wo-print__longtext-title">{t('paperForm.operationLongText')}</p>
      <p className="sap-wo-print__longtext-sub">{t('paperForm.current3PhaseTitle')}</p>

      <div className="px-[0.6rem] pb-2">
        <table className="sap-wo-print__measure-table">
          <thead>
            <tr>
              <th className="text-left">{t('paperForm.machineColumn')}</th>
              <th>{t('phaseR')}</th>
              <th>{t('phaseS')}</th>
              <th>{t('phaseT')}</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-[10px]">
                  {t('noTasks')}
                </td>
              </tr>
            ) : (
              currentRows.map((row) => (
                <tr key={row.key}>
                  <td>
                    <span>{row.machine || row.pmlist || '—'}</span>
                    {row.machine ? (
                      <span className="mt-0.5 block text-[10px] leading-tight">
                        {t('paperForm.taskLineSuffix')}
                      </span>
                    ) : null}
                  </td>
                  {(['v1', 'v2', 'v3'] as const).map((field) => (
                    <td key={field}>
                      <input
                        className="sap-wo-print__input"
                        inputMode="decimal"
                        value={row[field]}
                        disabled={!canWrite}
                        aria-label={`${row.machine} ${field}`}
                        onChange={(e) => onCurrentRowChange(row.key, field, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="sap-wo-print__row">
        <span>{t('paperForm.measuredAt')}:</span>
        <input
          type="datetime-local"
          className="sap-wo-print__input sap-wo-print__input--left max-w-[14rem]"
          value={measuredAtLocal}
          disabled={!canWrite}
          onChange={(e) => onMeasuredAtChange(e.target.value)}
        />
      </div>

      <hr className="sap-wo-print__rule" />

      <div className="sap-wo-print__completion">
        <p className="font-bold">{t('paperForm.completionTitle')}</p>
        <div className="sap-wo-print__completion-grid">
          <label className="flex items-center gap-2">
            <span>{t('paperForm.completionDate')}:</span>
            <input
              type="date"
              className="sap-wo-print__input sap-wo-print__input--left flex-1"
              value={completion.completionDate}
              disabled={!canWrite}
              onChange={(e) => onCompletionChange({ completionDate: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2">
            <span>{t('paperForm.duration')}:</span>
            <input
              type="time"
              className="sap-wo-print__input w-[5.5rem]"
              value={completion.timeStart}
              disabled={!canWrite}
              onChange={(e) => onCompletionChange({ timeStart: e.target.value })}
            />
            <span>–</span>
            <input
              type="time"
              className="sap-wo-print__input w-[5.5rem]"
              value={completion.timeEnd}
              disabled={!canWrite}
              onChange={(e) => onCompletionChange({ timeEnd: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2">
            <span>{t('paperForm.completed')}:</span>
            <select
              className="sap-wo-print__input sap-wo-print__input--left max-w-[5rem]"
              value={completion.completed}
              disabled={!canWrite}
              onChange={(e) =>
                onCompletionChange({ completed: e.target.value as SapPrintCompletion['completed'] })
              }
            >
              <option value="">—</option>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span>{t('paperForm.completedBy')}:</span>
            <input
              className="sap-wo-print__input sap-wo-print__input--left flex-1"
              value={completion.completedBy}
              disabled={!canWrite}
              onChange={(e) => onCompletionChange({ completedBy: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="sap-wo-print__actions">
        {!canWrite && selectWoHint ? (
          <p className="mb-2 text-xs text-amber-800">{selectWoHint}</p>
        ) : null}
        <Button type="button" size="sm" disabled={!canWrite || saving} onClick={onSave}>
          {saving ? t('saving') : t('paperForm.saveCurrentReadings')}
        </Button>
      </div>
    </section>
  )
}
