import { AppPageSection } from '@/components/layout/AppPageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PmDesignLineChart } from '@/features/pm-charts/components/PmDesignCharts'
import {
  PmChartChartGrid,
  PmChartNumericInput,
  PmChartPlot,
  PmChartSection,
  PmChartTableShell,
} from '@/features/pm-charts/components/PmChartUi'
import {
  emptyVibrationRows,
  formatChartDate,
  polynomialTrend,
  VIBRATION_CHART_TITLE,
  vibrationAverages,
  type VibrationReadingRow,
} from '@/features/pm-charts/pm-chart-design-data'
import { usePmChartPeriod } from '@/features/pm-charts/PmChartPeriodContext'
import { filterVibrationForPeriod, captureChartImages } from '@/features/pm-charts/pm-chart-period'
import {
  buildVibrationReportSheet,
  downloadPmChartReportWorkbook,
} from '@/features/pm-charts/pm-chart-report-export'
import { usePmChartPersistence } from '@/features/pm-charts/usePmChartPersistence'
import { usePmChartReportExport } from '@/features/pm-charts/usePmChartReportExport'
import { usePmChartAutoRange } from '@/features/pm-charts/usePmChartAutoRange'
import ExcelJS from 'exceljs'
import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

function emptyRow(): VibrationReadingRow {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    motorFrontDst: null,
    motorFrontDb: null,
    motorBackDst: null,
    motorBackDb: null,
    pump1Dst: null,
    pump1Db: null,
    pump2Dst: null,
    pump2Db: null,
  }
}

function deserializeVibration(payload: Record<string, unknown>): VibrationReadingRow[] {
  const loaded = payload.rows as VibrationReadingRow[] | undefined
  if (!loaded?.length) return emptyVibrationRows()
  return loaded.map((r) => ({ ...r, id: r.id || crypto.randomUUID() }))
}

export function PmChartVibrationPage() {
  const { t } = useTranslation('pmCharts')
  const { period, from, to } = usePmChartPeriod()
  const [rows, setRows] = useState<VibrationReadingRow[]>(emptyVibrationRows)

  usePmChartPersistence({
    sheetKey: 'vibration',
    emptyDefault: emptyVibrationRows(),
    data: rows,
    onLoad: setRows,
    serialize: (data) => ({ title: VIBRATION_CHART_TITLE, rows: data }),
    deserialize: deserializeVibration,
  })

  const range = useMemo(() => ({ from, to }), [from, to])
  const chartDates = useMemo(() => rows.map((r) => r.date).filter(Boolean), [rows])
  usePmChartAutoRange(chartDates)

  const viewRows = useMemo(
    () => filterVibrationForPeriod(rows, period, range),
    [rows, period, range],
  )

  const labels = useMemo(() => viewRows.map((r) => formatChartDate(r.date)), [viewRows])
  const avgDb = useMemo(() => viewRows.map((r) => vibrationAverages(r).db), [viewRows])
  const avgDst = useMemo(() => viewRows.map((r) => vibrationAverages(r).dst), [viewRows])
  const trendDb = useMemo(() => polynomialTrend(avgDb), [avgDb])
  const trendDst = useMemo(() => polynomialTrend(avgDst), [avgDst])

  const buildReport = useCallback(async () => {
    const charts = captureChartImages()
    const wb = new ExcelJS.Workbook()
    await buildVibrationReportSheet(
      wb,
      viewRows,
      {
        sheetName: VIBRATION_CHART_TITLE,
        period,
        from,
        to,
      },
      charts,
    )
    await downloadPmChartReportWorkbook(wb, `PMChart_Vibration_${period}_${from}.xlsx`)
  }, [viewRows, period, from, to])

  usePmChartReportExport(buildReport)

  const updateRow = (id: string, patch: Partial<VibrationReadingRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  return (
    <>
      <AppPageSection>
        <PmChartSection title={VIBRATION_CHART_TITLE} subtitle={t('vibration.subtitle')}>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setRows((p) => [...p, emptyRow()])}>
              <Plus className="mr-1 size-4" aria-hidden />
              {t('actions.addRow')}
            </Button>
          </div>

          <PmChartTableShell>
            <thead>
              <tr>
                <th rowSpan={3} className="border border-slate-300 bg-red-600 px-2 py-2 text-white">
                  {t('vibration.date')}
                </th>
                <th colSpan={8} className="border border-slate-300 bg-pink-200 px-2 py-1 font-semibold text-slate-800">
                  {t('vibration.mainOilPump')}
                </th>
                <th colSpan={2} rowSpan={2} className="border border-slate-300 bg-emerald-700 px-2 py-2 text-white">
                  {t('vibration.average')}
                </th>
                <th rowSpan={3} className="w-10 border border-slate-300 bg-slate-100" aria-label={t('actions.removeRow')} />
              </tr>
              <tr>
                <th colSpan={2} className="border border-slate-300 bg-pink-100 px-2 py-1 text-slate-800">
                  {t('vibration.motorFront')}
                </th>
                <th colSpan={2} className="border border-slate-300 bg-pink-100 px-2 py-1 text-slate-800">
                  {t('vibration.motorBack')}
                </th>
                <th colSpan={2} className="border border-slate-300 bg-green-100 px-2 py-1 text-slate-800">
                  {t('vibration.pump1')}
                </th>
                <th colSpan={2} className="border border-slate-300 bg-green-100 px-2 py-1 text-slate-800">
                  {t('vibration.pump2')}
                </th>
              </tr>
              <tr>
                <th className="border border-slate-300 bg-pink-50 px-1 py-1">{t('vibration.dst')}</th>
                <th className="border border-slate-300 bg-pink-50 px-1 py-1">{t('vibration.db')}</th>
                <th className="border border-slate-300 bg-pink-50 px-1 py-1">{t('vibration.dst')}</th>
                <th className="border border-slate-300 bg-pink-50 px-1 py-1">{t('vibration.db')}</th>
                <th className="border border-slate-300 bg-green-50 px-1 py-1">{t('vibration.dst')}</th>
                <th className="border border-slate-300 bg-green-50 px-1 py-1">{t('vibration.db')}</th>
                <th className="border border-slate-300 bg-green-50 px-1 py-1">{t('vibration.dst')}</th>
                <th className="border border-slate-300 bg-green-50 px-1 py-1">{t('vibration.db')}</th>
                <th className="border border-slate-300 bg-emerald-100 px-1 py-1">{t('vibration.dst')}</th>
                <th className="border border-slate-300 bg-emerald-100 px-1 py-1">{t('vibration.db')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="border border-slate-200 p-6 text-center text-sm text-app-muted">
                    {t('empty.noRows')}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const avg = vibrationAverages(row)
                  return (
                    <tr key={row.id} className="odd:bg-white even:bg-slate-50/80">
                      <td className="border border-slate-200 p-1">
                        <Input
                          type="date"
                          className="h-8 min-w-[9rem] text-xs"
                          value={row.date}
                          onChange={(e) => updateRow(row.id, { date: e.target.value })}
                        />
                      </td>
                      {(
                        [
                          ['motorFrontDst', row.motorFrontDst],
                          ['motorFrontDb', row.motorFrontDb],
                          ['motorBackDst', row.motorBackDst],
                          ['motorBackDb', row.motorBackDb],
                          ['pump1Dst', row.pump1Dst],
                          ['pump1Db', row.pump1Db],
                          ['pump2Dst', row.pump2Dst],
                          ['pump2Db', row.pump2Db],
                        ] as const
                      ).map(([key, val]) => (
                        <td key={key} className="border border-slate-200 p-1">
                          <PmChartNumericInput
                            value={val}
                            onChange={(v) => updateRow(row.id, { [key]: v })}
                          />
                        </td>
                      ))}
                      <td className="border border-slate-200 bg-emerald-50/60 p-1 text-center font-medium tabular-nums">
                        {avg.dst ?? '—'}
                      </td>
                      <td className="border border-slate-200 bg-emerald-50/60 p-1 text-center font-medium tabular-nums">
                        {avg.db ?? '—'}
                      </td>
                      <td className="border border-slate-200 p-1 text-center">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label={t('actions.removeRow')}
                          onClick={() => setRows((p) => p.filter((r) => r.id !== row.id))}
                        >
                          <Trash2 className="size-3.5 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </PmChartTableShell>
        </PmChartSection>
      </AppPageSection>

      <AppPageSection>
        <PmChartSection
          title={t('vibration.chartsTitle')}
          subtitle={t('period.viewHint', { period: t(`period.${period}`), from, to })}
        >
          {viewRows.length === 0 ? (
            <p className="text-sm text-app-muted">{t('period.noData')}</p>
          ) : (
          <PmChartChartGrid>
            <PmChartPlot title={`${VIBRATION_CHART_TITLE} — ${t('vibration.soundLevel')}`}>
              <PmDesignLineChart
                labels={labels}
                yTitle={t('vibration.soundLevelAxis')}
                yMin={0}
                series={[
                  { label: t('vibration.motorFrontDb'), data: viewRows.map((r) => r.motorFrontDb), color: '#ed7d31' },
                  { label: t('vibration.motorBackDb'), data: viewRows.map((r) => r.motorBackDb), color: '#4472c4' },
                  { label: t('vibration.pump1Db'), data: viewRows.map((r) => r.pump1Db), color: '#548235' },
                  { label: t('vibration.pump2Db'), data: viewRows.map((r) => r.pump2Db), color: '#a0522d' },
                  { label: t('vibration.average'), data: avgDb, color: '#94a3b8', dashed: false, pointRadius: 3 },
                  { label: t('vibration.trend'), data: trendDb, color: '#dc2626', dashed: true, pointRadius: 0 },
                ]}
              />
            </PmChartPlot>
            <PmChartPlot title={`${VIBRATION_CHART_TITLE} — ${t('vibration.displacement')}`}>
              <PmDesignLineChart
                labels={labels}
                yTitle={t('vibration.displacementAxis')}
                yMin={0}
                series={[
                  { label: t('vibration.motorFrontDst'), data: viewRows.map((r) => r.motorFrontDst), color: '#ed7d31' },
                  { label: t('vibration.motorBackDst'), data: viewRows.map((r) => r.motorBackDst), color: '#4472c4' },
                  { label: t('vibration.pump1Dst'), data: viewRows.map((r) => r.pump1Dst), color: '#548235' },
                  { label: t('vibration.pump2Dst'), data: viewRows.map((r) => r.pump2Dst), color: '#a0522d' },
                  { label: t('vibration.average'), data: avgDst, color: '#94a3b8', pointRadius: 3 },
                  { label: t('vibration.trend'), data: trendDst, color: '#dc2626', dashed: true, pointRadius: 0 },
                ]}
              />
            </PmChartPlot>
          </PmChartChartGrid>
          )}
        </PmChartSection>
      </AppPageSection>
    </>
  )
}
