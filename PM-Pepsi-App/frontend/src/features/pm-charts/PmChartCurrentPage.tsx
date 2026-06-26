import { AppPageSection } from '@/components/layout/AppPageShell'
import { PmDesignLineChart } from '@/features/pm-charts/components/PmDesignCharts'
import {
  PmChartNumericInput,
  PmChartPlot,
  PmChartSection,
  PmChartTableShell,
} from '@/features/pm-charts/components/PmChartUi'
import {
  CURRENT_MACHINE,
  CURRENT_MONTH_SLOTS,
  currentSlotId,
  defaultCurrentYear,
  emptyCurrentPhases,
  type CurrentPhaseRow,
} from '@/features/pm-charts/pm-chart-design-data'
import { usePmChartPeriod } from '@/features/pm-charts/PmChartPeriodContext'
import {
  captureChartImages,
  currentSlotDate,
  filterCurrentForPeriod,
  type CurrentSlotPoint,
} from '@/features/pm-charts/pm-chart-period'
import {
  buildCurrentReportSheet,
  downloadPmChartReportWorkbook,
} from '@/features/pm-charts/pm-chart-report-export'
import { usePmChartPersistence } from '@/features/pm-charts/usePmChartPersistence'
import { usePmChartReportExport } from '@/features/pm-charts/usePmChartReportExport'
import { usePmChartAutoRange } from '@/features/pm-charts/usePmChartAutoRange'
import ExcelJS from 'exceljs'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type MonthGroup = { monthKey: string; label: string; slots: Array<{ slot: 1 | 2; id: string }> }

function buildMonthGroups(): MonthGroup[] {
  const map = new Map<string, MonthGroup>()
  for (const slot of CURRENT_MONTH_SLOTS) {
    let group = map.get(slot.monthKey)
    if (!group) {
      group = { monthKey: slot.monthKey, label: slot.label.replace(/-\d$/, ''), slots: [] }
      map.set(slot.monthKey, group)
    }
    group.slots.push({ slot: slot.slot, id: currentSlotId(slot.monthKey, slot.slot) })
  }
  return [...map.values()]
}

const MONTH_GROUPS = buildMonthGroups()

export function PmChartCurrentPage() {
  const { t } = useTranslation('pmCharts')
  const { period, from, to } = usePmChartPeriod()
  const [machine, setMachine] = useState(CURRENT_MACHINE)
  const [year, setYear] = useState(() => defaultCurrentYear())
  const [phases, setPhases] = useState<CurrentPhaseRow[]>(emptyCurrentPhases)

  const slotPoints = useMemo<CurrentSlotPoint[]>(
    () =>
      CURRENT_MONTH_SLOTS.map((slot) => ({
        slotId: currentSlotId(slot.monthKey, slot.slot),
        label: slot.label,
        date: currentSlotDate(year, slot.monthKey, slot.slot),
      })),
    [year],
  )

  const applyCurrentMeta = useCallback((payload: Record<string, unknown>) => {
    const machineVal = payload.machine
    if (typeof machineVal === 'string' && machineVal.trim()) {
      setMachine(machineVal.trim())
    } else {
      setMachine(CURRENT_MACHINE)
    }
    const yearVal = payload.year
    if (typeof yearVal === 'number' && Number.isFinite(yearVal)) {
      setYear(yearVal)
    } else {
      setYear(defaultCurrentYear())
    }
  }, [])

  usePmChartPersistence({
    sheetKey: 'current',
    emptyDefault: emptyCurrentPhases(),
    data: phases,
    onLoad: setPhases,
    serialize: (data) => ({ machine, year, phases: data }),
    deserialize: (payload) => {
      applyCurrentMeta(payload)
      const loaded = payload.phases as CurrentPhaseRow[] | undefined
      if (!loaded?.length) return emptyCurrentPhases()
      return loaded.map((p) => ({ ...p, values: { ...p.values } }))
    },
    saveExtraDeps: [machine, year],
  })

  const range = useMemo(() => ({ from, to }), [from, to])
  const chartDates = useMemo(
    () => slotPoints.map((p) => p.date.toISOString().slice(0, 10)),
    [slotPoints],
  )
  usePmChartAutoRange(chartDates)

  const filtered = useMemo(
    () => filterCurrentForPeriod(phases, slotPoints, period, range),
    [phases, slotPoints, period, range],
  )

  const chartLabels = filtered.labels.length > 0 ? filtered.labels : ['—']

  const chartSeries = useMemo(() => {
    const build = (phase: 'R' | 'S' | 'T') => {
      const row = filtered.phases.find((p) => p.phase === phase)
      return filtered.slotIds.map((id) => row?.values[id] ?? null)
    }
    return {
      r: build('R'),
      s: build('S'),
      t: build('T'),
      rRef: filtered.phases.find((p) => p.phase === 'R')?.yearAverage ?? null,
      sRef: filtered.phases.find((p) => p.phase === 'S')?.yearAverage ?? null,
      tRef: filtered.phases.find((p) => p.phase === 'T')?.yearAverage ?? null,
    }
  }, [filtered])

  const buildReport = useCallback(async () => {
    const charts = captureChartImages()
    const wb = new ExcelJS.Workbook()
    await buildCurrentReportSheet(
      wb,
      filtered.phases,
      filtered.labels,
      filtered.slotIds,
      CURRENT_MACHINE,
      year,
      {
        sheetName: `${CURRENT_MACHINE} Current`,
        period,
        from,
        to,
      },
      charts,
    )
    await downloadPmChartReportWorkbook(wb, `PMChart_Current_${period}_${from}.xlsx`)
  }, [filtered, machine, year, period, from, to])

  usePmChartReportExport(buildReport)

  const refLine = (value: number | null, len: number) =>
    value == null ? [] : Array.from({ length: len }, () => value)

  const updatePhase = (phase: 'R' | 'S' | 'T', patch: Partial<CurrentPhaseRow>) => {
    setPhases((prev) => prev.map((p) => (p.phase === phase ? { ...p, ...patch } : p)))
  }

  const updateValue = (phase: 'R' | 'S' | 'T', slotId: string, value: number | null) => {
    setPhases((prev) =>
      prev.map((p) =>
        p.phase === phase ? { ...p, values: { ...p.values, [slotId]: value } } : p,
      ),
    )
  }

  const len = Math.max(chartSeries.r.length, chartSeries.s.length, chartSeries.t.length, 1)

  return (
    <>
      <AppPageSection>
        <PmChartSection
          title={t('current.title', { machine })}
          subtitle={t('current.subtitle', { year })}
        >
          <PmChartTableShell className="min-w-[960px]">
            <thead>
              <tr>
                <th rowSpan={2} className="border border-slate-300 bg-slate-700 px-2 py-2 text-white">
                  {t('current.machine')}
                </th>
                <th rowSpan={2} className="border border-slate-300 bg-slate-600 px-2 py-2 text-white">
                  {t('current.phase')}
                </th>
                <th rowSpan={2} className="border border-slate-300 bg-blue-800 px-2 py-2 text-white">
                  {t('current.yearAverage', { year })}
                </th>
                <th colSpan={MONTH_GROUPS.reduce((n, g) => n + g.slots.length, 0)} className="border border-slate-300 bg-blue-700 px-2 py-1 text-white">
                  {year}
                </th>
              </tr>
              <tr>
                {MONTH_GROUPS.map((group) => (
                  <th
                    key={group.monthKey}
                    colSpan={group.slots.length}
                    className="border border-slate-300 bg-blue-100 px-1 py-1 font-medium capitalize text-slate-800"
                  >
                    {t(`months.${group.monthKey}`)}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="border border-slate-300 bg-slate-100" colSpan={3} />
                {MONTH_GROUPS.flatMap((group) =>
                  group.slots.map((s) => (
                    <th
                      key={s.id}
                      className="border border-slate-300 bg-slate-50 px-1 py-1 text-center text-[10px] text-slate-600"
                    >
                      {s.slot}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody>
              {phases.map((row, rowIdx) => (
                <tr key={row.phase} className="odd:bg-white even:bg-slate-50/80">
                  {rowIdx === 0 ? (
                    <td rowSpan={3} className="border border-slate-200 bg-slate-50 px-2 py-2 font-semibold text-slate-800">
                      {machine}
                    </td>
                  ) : null}
                  <td className="border border-slate-200 px-2 py-1 font-mono font-semibold text-[#1f3864]">
                    {row.phase}
                  </td>
                  <td className="border border-slate-200 p-1">
                    <PmChartNumericInput
                      value={row.yearAverage}
                      onChange={(v) => updatePhase(row.phase, { yearAverage: v })}
                    />
                  </td>
                  {MONTH_GROUPS.flatMap((group) =>
                    group.slots.map((s) => (
                      <td key={s.id} className="border border-slate-200 p-1">
                        <PmChartNumericInput
                          value={row.values[s.id] ?? null}
                          onChange={(v) => updateValue(row.phase, s.id, v)}
                        />
                      </td>
                    )),
                  )}
                </tr>
              ))}
            </tbody>
          </PmChartTableShell>
        </PmChartSection>
      </AppPageSection>

      <AppPageSection>
        <PmChartSection
          title={t('current.chartTitle', { machine })}
          subtitle={t('period.viewHint', { period: t(`period.${period}`), from, to })}
        >
          {filtered.slotIds.length === 0 ? (
            <p className="text-sm text-app-muted">{t('period.noData')}</p>
          ) : (
          <PmChartPlot title={t('current.chartTitle', { machine })} className="max-w-4xl mx-auto">
            <PmDesignLineChart
              labels={chartLabels}
              yTitle={t('current.yAxis')}
              yMin={17}
              yMax={24}
              series={[
                { label: 'R', data: chartSeries.r, color: '#1f4e79' },
                { label: 'S', data: chartSeries.s, color: '#c55a11' },
                { label: 'T', data: chartSeries.t, color: '#548235' },
                {
                  label: t('current.rRef', { year }),
                  data: refLine(chartSeries.rRef, len),
                  color: '#8faadc',
                  dashed: true,
                  pointRadius: 0,
                },
                {
                  label: t('current.sRef', { year }),
                  data: refLine(chartSeries.sRef, len),
                  color: '#f4b183',
                  dashed: true,
                  pointRadius: 0,
                },
                {
                  label: t('current.tRef', { year }),
                  data: refLine(chartSeries.tRef, len),
                  color: '#a9d18e',
                  dashed: true,
                  pointRadius: 0,
                },
              ]}
            />
          </PmChartPlot>
          )}
        </PmChartSection>
      </AppPageSection>
    </>
  )
}
