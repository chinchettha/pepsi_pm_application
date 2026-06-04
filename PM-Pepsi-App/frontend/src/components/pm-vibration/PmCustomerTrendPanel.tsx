import type { WorkOrderTaskListItemApi, WoPmExecution, WoPmReading } from '@/api/schemas'
import { PmMeasurementLineChart } from '@/components/scheduling/PmMeasurementLineChart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { postPmReadingsBatch } from '@/lib/api-public'
import { filterReadingsForTask, readingsToChartPoints } from '@/lib/pm-measurement-chart'
import { useMutation } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import './sap-wo-print-form.css'

type TrendRow = {
  key: string
  time: string
  v1: string
  v2: string
  v3: string
}

type Props = {
  kind: 'current_3phase' | 'vibration_3axis'
  orderId: string | null
  tasks: WorkOrderTaskListItemApi[]
  pmExecution?: WoPmExecution
  canWrite: boolean
  onSaved: () => void
}

function emptyTrendRow(): TrendRow {
  return { key: crypto.randomUUID(), time: '08:00', v1: '', v2: '', v3: '' }
}

function formatTimeLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

function readingsToTrendRows(readings: WoPmReading[]): TrendRow[] {
  return readings
    .slice()
    .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
    .map((r) => ({
      key: String(r.idreading),
      time: formatTimeLabel(r.measuredAt),
      v1: String(r.v1),
      v2: String(r.v2),
      v3: String(r.v3),
    }))
}

export function PmCustomerTrendPanel({
  kind,
  orderId,
  tasks,
  pmExecution,
  canWrite,
  onSaved,
}: Props) {
  const { t } = useTranslation('pmVibration')
  const task = tasks[0]
  const enabled = Boolean(orderId) && canWrite

  const taskReadings = useMemo(() => {
    if (!pmExecution || !task) return []
    return filterReadingsForTask(pmExecution.readings, task.machine, task.pmlist).filter(
      (r) => r.kind === kind,
    )
  }, [pmExecution, task, kind])

  const [rows, setRows] = useState<TrendRow[]>([emptyTrendRow(), emptyTrendRow(), emptyTrendRow()])

  const chartPoints = useMemo(() => {
    if (taskReadings.length > 0) return readingsToChartPoints(taskReadings)
    const demo = rows
      .filter((r) => r.v1 && r.v2 && r.v3)
      .map((r) => ({
        label: r.time,
        v1: Number(r.v1),
        v2: Number(r.v2),
        v3: Number(r.v3),
      }))
      .filter((p) => [p.v1, p.v2, p.v3].every((n) => Number.isFinite(n)))
    return demo
  }, [taskReadings, rows])

  const axisLabels: [string, string, string] =
    kind === 'current_3phase'
      ? [t('phaseR'), t('phaseS'), t('phaseT')]
      : [t('axisX'), t('axisY'), t('axisZ')]

  const unit = kind === 'current_3phase' ? 'A' : 'mm/s RMS'
  const title = kind === 'current_3phase' ? t('trend.currentTitle') : t('trend.vibrationTitle')
  const subtitle =
    kind === 'current_3phase' ? t('trend.currentSubtitle') : t('trend.vibrationSubtitle')

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!orderId || !task) throw new Error(t('selectWoFirst'))
      const today = new Date().toISOString().slice(0, 10)
      const items = rows.map((row) => {
        const n1 = Number(row.v1)
        const n2 = Number(row.v2)
        const n3 = Number(row.v3)
        if (![n1, n2, n3].every((n) => Number.isFinite(n))) {
          throw new Error(t('valuesRequired'))
        }
        const [hh, mm] = row.time.split(':')
        const measuredAt = new Date(`${today}T${hh || '00'}:${mm || '00'}:00`).toISOString()
        return {
          machine: task.machine,
          pmlist: task.pmlist,
          kind,
          measuredAt,
          v1: n1,
          v2: n2,
          v3: n3,
          warningLimit: kind === 'vibration_3axis' ? 3 : null,
          alarmLimit: kind === 'vibration_3axis' ? 4 : null,
        }
      })
      return postPmReadingsBatch({ orderId, items })
    },
    onSuccess: (res) => {
      if (res.imported > 0) toast.success(t('savedRows', { count: res.imported }))
      onSaved()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const loadFromSaved = () => {
    if (taskReadings.length === 0) return
    setRows(readingsToTrendRows(taskReadings))
  }

  return (
    <section className="sap-wo-print overflow-hidden" aria-label={title}>
      <div className="border-b border-black px-[0.6rem] py-2">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-[11px]">{subtitle}</p>
        {task ? (
          <p className="mt-1 text-[11px] text-slate-700">
            {t('trend.taskLabel')}: {task.machine}
            {task.pmlist ? ` · ${task.pmlist}` : ''}
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-amber-800">{t('trend.noTaskHint')}</p>
        )}
      </div>

      <div className="p-3">
        <PmMeasurementLineChart
          points={chartPoints}
          axisLabels={axisLabels}
          unit={unit}
          chartTitle={title}
          chartSubtitle={subtitle}
          warningLimit={kind === 'vibration_3axis' ? 3 : null}
          alarmLimit={kind === 'vibration_3axis' ? 4 : null}
        />
      </div>

      <p className="px-[0.6rem] pb-1 text-[11px] font-semibold">{t('trend.tableTitle')}</p>

      <div className="px-[0.6rem] pb-2">
        <table className="sap-wo-print__measure-table">
          <thead>
            <tr>
              <th>{t('trend.timeColumn')}</th>
              <th>
                {axisLabels[0]}
                {kind === 'current_3phase' ? '' : ''}
              </th>
              <th>{axisLabels[1]}</th>
              <th>{axisLabels[2]}</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>
                  <Input
                    type="time"
                    className="h-7 border-0 border-b border-slate-400 bg-transparent px-1 text-xs shadow-none"
                    value={row.time}
                    disabled={!enabled}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) => (r.key === row.key ? { ...r, time: e.target.value } : r)),
                      )
                    }
                  />
                </td>
                {(['v1', 'v2', 'v3'] as const).map((field) => (
                  <td key={field}>
                    <input
                      className="sap-wo-print__input"
                      inputMode="decimal"
                      value={row[field]}
                      disabled={!enabled}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r) =>
                            r.key === row.key ? { ...r, [field]: e.target.value } : r,
                          ),
                        )
                      }
                    />
                  </td>
                ))}
                <td>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={!enabled || rows.length <= 1}
                    onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sap-wo-print__actions flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!enabled}
          onClick={() => setRows((prev) => [...prev, emptyTrendRow()])}
        >
          <Plus className="size-4" aria-hidden />
          {t('addRow')}
        </Button>
        {taskReadings.length > 0 ? (
          <Button type="button" size="sm" variant="outline" onClick={loadFromSaved}>
            {t('trend.loadSaved')}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          disabled={!enabled || !task || saveMut.isPending}
          onClick={() => saveMut.mutate()}
        >
          {saveMut.isPending ? t('saving') : t('trend.saveTable')}
        </Button>
        {!orderId ? <span className="self-center text-xs text-slate-600">{t('trend.selectWoHint')}</span> : null}
      </div>
    </section>
  )
}
