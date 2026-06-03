import type { WorkOrderTaskListItemApi, WoPmExecution, WoPmReading } from '@/api/schemas'
import { PmMeasurementLineChart } from '@/components/scheduling/PmMeasurementLineChart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { postWorkOrderPmReading } from '@/lib/api-public'
import {
  filterReadingsForTask,
  readingsToChartPoints,
} from '@/lib/pm-measurement-chart'
import { useMutation } from '@tanstack/react-query'
import { Activity, LineChart } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type Props = {
  orderId: string
  item: WorkOrderTaskListItemApi
  pmExecution: WoPmExecution
  onSaved: () => void
}

const KIND_OPTIONS = [
  { value: 'current_3phase' as const, labelKey: 'pmMeasurement.current3phase' as const },
  { value: 'vibration_3axis' as const, labelKey: 'pmMeasurement.vibration3axis' as const },
]

function chartCopy(t: ReturnType<typeof useTranslation>['t'], kind: 'current_3phase' | 'vibration_3axis') {
  if (kind === 'current_3phase') {
    return {
      title: t('pmMeasurement.currentTitle'),
      subtitle: t('pmMeasurement.currentSubtitle'),
    }
  }
  return {
    title: t('pmMeasurement.vibrationTitle'),
    subtitle: t('pmMeasurement.vibrationSubtitle'),
  }
}

function defaultAxisLabels(
  t: ReturnType<typeof useTranslation>['t'],
  kind: 'current_3phase' | 'vibration_3axis',
): [string, string, string] {
  return kind === 'vibration_3axis'
    ? [t('pmMeasurement.axisX'), t('pmMeasurement.axisY'), t('pmMeasurement.axisZ')]
    : [t('pmMeasurement.phaseR'), t('pmMeasurement.phaseS'), t('pmMeasurement.phaseT')]
}

function fallbackAxisLabels(t: ReturnType<typeof useTranslation>['t']): [string, string, string] {
  return [
    t('pmMeasurement.valueN', { n: 1 }),
    t('pmMeasurement.valueN', { n: 2 }),
    t('pmMeasurement.valueN', { n: 3 }),
  ]
}

function defaultUnit(kind: 'current_3phase' | 'vibration_3axis'): string {
  return kind === 'vibration_3axis' ? 'mm/s' : 'A'
}

export function WorkOrderPmMeasurementBlock({ orderId, item, pmExecution, onSaved }: Props) {
  const { t, i18n } = useTranslation(['scheduling', 'common'])
  const dateLocale = i18n.language.startsWith('th') ? 'th-TH' : 'en-US'
  const inferred =
    item.measurementKind === 'current_3phase' || item.measurementKind === 'vibration_3axis'
      ? item.measurementKind
      : null
  const [kindOverride, setKindOverride] = useState<'current_3phase' | 'vibration_3axis' | ''>(
    inferred ?? '',
  )
  const kind = inferred ?? (kindOverride || null)

  const [v1, setV1] = useState('')
  const [v2, setV2] = useState('')
  const [v3, setV3] = useState('')
  const [warningLimit, setWarningLimit] = useState('')
  const [alarmLimit, setAlarmLimit] = useState('')

  const taskReadings = useMemo(
    () => filterReadingsForTask(pmExecution.readings, item.machine, item.pmlist),
    [pmExecution.readings, item.machine, item.pmlist],
  )

  const chartPoints = useMemo(() => readingsToChartPoints(taskReadings), [taskReadings])

  const axisLabels =
    item.measurementKind !== 'none' && item.axisLabels[0]
      ? item.axisLabels
      : kind
        ? defaultAxisLabels(t, kind)
        : fallbackAxisLabels(t)

  const unit = item.unit || (kind ? defaultUnit(kind) : '')
  const chartMeta = kind ? chartCopy(t, kind) : null

  const latestLimits = useMemo(() => {
    const last = taskReadings[taskReadings.length - 1]
    return {
      warning: last?.warningLimit ?? null,
      alarm: last?.alarmLimit ?? null,
    }
  }, [taskReadings])

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!kind) throw new Error(t('pmMeasurement.selectKindFirst'))
      const n1 = Number(v1)
      const n2 = Number(v2)
      const n3 = Number(v3)
      if (![n1, n2, n3].every((n) => Number.isFinite(n))) {
        throw new Error(t('pmMeasurement.fillAllThree'))
      }
      return postWorkOrderPmReading(orderId, {
        machine: item.machine,
        pmlist: item.pmlist,
        kind,
        v1: n1,
        v2: n2,
        v3: n3,
        warningLimit: warningLimit.trim() ? Number(warningLimit) : null,
        alarmLimit: alarmLimit.trim() ? Number(alarmLimit) : null,
      })
    },
    onSuccess: () => {
      toast.success(t('pmMeasurement.saved'))
      setV1('')
      setV2('')
      setV3('')
      onSaved()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (!kind && !pmExecution.canEdit && taskReadings.length === 0) return null

  return (
    <div className="mt-3 space-y-3 rounded-button border border-sky-200/70 bg-sky-50/30 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-sky-900">
        <LineChart className="size-4" aria-hidden />
        {item.measurementTitle || t('pmMeasurement.defaultTitle')}
        {item.mpoint ? (
          <span className="font-normal text-app-muted">· {item.mpoint}</span>
        ) : null}
      </div>

      {!inferred && !kind && pmExecution.canEdit ? (
        <div className="space-y-2">
          <Label>{t('pmMeasurement.kindLabel')}</Label>
          <select
            className="w-full rounded-button border border-app bg-[var(--app-surface)] px-3 py-2 text-body-sm"
            value={kindOverride}
            onChange={(e) =>
              setKindOverride(e.target.value as 'current_3phase' | 'vibration_3axis' | '')
            }
          >
            <option value="">{t('shared.selectPlaceholder')}</option>
            {KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.labelKey)}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {kind ? (
        <>
          <PmMeasurementLineChart
            points={chartPoints}
            axisLabels={axisLabels}
            unit={unit}
            chartTitle={item.measurementTitle || chartMeta?.title}
            chartSubtitle={chartMeta?.subtitle}
            warningLimit={latestLimits.warning}
            alarmLimit={latestLimits.alarm}
          />

          {taskReadings.length > 0 ? (
            <div className="overflow-x-auto rounded-button border border-app">
              <table className="w-full min-w-[280px] text-left text-xs">
                <thead className="bg-app-subtle/60 text-app-muted">
                  <tr>
                    <th className="px-2 py-1.5">{t('shared.time')}</th>
                    <th className="px-2 py-1.5">{axisLabels[0]}</th>
                    <th className="px-2 py-1.5">{axisLabels[1]}</th>
                    <th className="px-2 py-1.5">{axisLabels[2]}</th>
                  </tr>
                </thead>
                <tbody>
                  {taskReadings.map((r: WoPmReading) => (
                    <tr key={r.idreading} className="border-t border-app/60">
                      <td className="px-2 py-1.5 tabular-nums">
                        {new Date(r.measuredAt).toLocaleString(dateLocale, {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums">{r.v1}</td>
                      <td className="px-2 py-1.5 tabular-nums">{r.v2}</td>
                      <td className="px-2 py-1.5 tabular-nums">{r.v3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {pmExecution.canEdit ? (
            <div className="space-y-2 border-t border-sky-200/60 pt-3">
              <p className="flex items-center gap-1 text-xs font-semibold text-sky-900">
                <Activity className="size-3.5" aria-hidden />
                {kind === 'current_3phase'
                  ? t('pmMeasurement.saveCurrent3phase')
                  : t('pmMeasurement.saveThisReading')}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <Label>{axisLabels[0]}</Label>
                  <Input inputMode="decimal" value={v1} onChange={(e) => setV1(e.target.value)} />
                </div>
                <div>
                  <Label>{axisLabels[1]}</Label>
                  <Input inputMode="decimal" value={v2} onChange={(e) => setV2(e.target.value)} />
                </div>
                <div>
                  <Label>{axisLabels[2]}</Label>
                  <Input inputMode="decimal" value={v3} onChange={(e) => setV3(e.target.value)} />
                </div>
              </div>
              {kind === 'vibration_3axis' ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label>Warning (mm/s)</Label>
                    <Input
                      inputMode="decimal"
                      placeholder={t('pmMeasurement.warningPlaceholder')}
                      value={warningLimit}
                      onChange={(e) => setWarningLimit(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Alarm (mm/s)</Label>
                    <Input
                      inputMode="decimal"
                      placeholder={t('pmMeasurement.alarmPlaceholder')}
                      value={alarmLimit}
                      onChange={(e) => setAlarmLimit(e.target.value)}
                    />
                  </div>
                </div>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={saveMut.isPending}
                onClick={() => saveMut.mutate()}
              >
                {saveMut.isPending ? t('shared.saving') : t('pmMeasurement.saveReading')}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
