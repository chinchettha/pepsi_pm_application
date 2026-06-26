import { AppPageSection } from '@/components/layout/AppPageShell'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PmDesignEfficiencyLineChart,
  PmDesignGroupedBarChart,
  PmDesignLineChart,
} from '@/features/pm-charts/components/PmDesignCharts'
import {
  PmChartChartGrid,
  PmChartNumericInput,
  PmChartPlot,
  PmChartSection,
  PmChartTableShell,
} from '@/features/pm-charts/components/PmChartUi'
import {
  COMBUSTION_MONTHS,
  COMBUSTION_PARAMETERS,
  defaultCurrentYear,
  emptyCombustionBlocks,
  type CombustionMonthKey,
  type CombustionParameterKey,
  type CombustionPointBlock,
  type CombustionPointKey,
} from '@/features/pm-charts/pm-chart-design-data'
import { usePmChartPeriod } from '@/features/pm-charts/PmChartPeriodContext'
import {
  aggregateCombustionForPeriod,
  captureChartImages,
  combustionMonthDate,
  filterCombustionMonthsForPeriod,
  toIsoDate,
} from '@/features/pm-charts/pm-chart-period'
import {
  buildCombustionReportSheet,
  downloadPmChartReportWorkbook,
} from '@/features/pm-charts/pm-chart-report-export'
import { usePmChartPersistence } from '@/features/pm-charts/usePmChartPersistence'
import { usePmChartReportExport } from '@/features/pm-charts/usePmChartReportExport'
import { usePmChartAutoRange } from '@/features/pm-charts/usePmChartAutoRange'
import ExcelJS from 'exceljs'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const POINTS: CombustionPointKey[] = ['Patail', '50', '75', 'Full']

function cloneBlocks(blocks: CombustionPointBlock[]): CombustionPointBlock[] {
  return blocks.map((b) => ({
    point: b.point,
    rows: b.rows.map((r) => ({ parameter: r.parameter, values: { ...r.values } })),
  }))
}

function getRow(block: CombustionPointBlock, param: CombustionParameterKey) {
  return block.rows.find((r) => r.parameter === param)
}

export function PmChartCombustionPage() {
  const { t } = useTranslation('pmCharts')
  const { period, from, to } = usePmChartPeriod()
  const [blocks, setBlocks] = useState<CombustionPointBlock[]>(emptyCombustionBlocks)
  const [point, setPoint] = useState<CombustionPointKey>('Patail')
  const [chartYear, setChartYear] = useState(() => defaultCurrentYear())

  usePmChartPersistence({
    sheetKey: 'combustion',
    emptyDefault: cloneBlocks(emptyCombustionBlocks()),
    data: blocks,
    onLoad: setBlocks,
    serialize: (data) => ({ blocks: data, year: chartYear }),
    deserialize: (payload) => {
      const yearVal = payload.year
      if (typeof yearVal === 'number' && Number.isFinite(yearVal)) {
        setChartYear(yearVal)
      } else {
        setChartYear(defaultCurrentYear())
      }
      const loaded = payload.blocks as CombustionPointBlock[] | undefined
      if (!loaded?.length) return cloneBlocks(emptyCombustionBlocks())
      return cloneBlocks(loaded)
    },
    saveExtraDeps: [chartYear],
  })

  const block = blocks.find((b) => b.point === point) ?? blocks[0]!

  const range = useMemo(() => ({ from, to }), [from, to])
  const chartDates = useMemo(
    () => COMBUSTION_MONTHS.map((m) => toIsoDate(combustionMonthDate(chartYear, m))),
    [chartYear],
  )
  usePmChartAutoRange(chartDates)

  const visibleMonths = useMemo(
    () => filterCombustionMonthsForPeriod(COMBUSTION_MONTHS, chartYear, period, range),
    [chartYear, period, range],
  )
  const periodView = useMemo(
    () => aggregateCombustionForPeriod(block, visibleMonths, period),
    [block, visibleMonths, period],
  )

  const monthLabels = useMemo(
    () => periodView.labels.map((m) => (COMBUSTION_MONTHS.includes(m as CombustionMonthKey) ? t(`combustionMonths.${m as CombustionMonthKey}`) : m)),
    [periodView.labels, t],
  )

  const chartData = useMemo(() => {
    const viewBlock = periodView.block
    const months = periodView.months
    const val = (param: CombustionParameterKey) =>
      months.map((m) => getRow(viewBlock, param)?.values[m as CombustionMonthKey] ?? null)
    return {
      tAir: val('tAir'),
      tGas: val('tGas'),
      eff: val('eff'),
      co: val('co'),
      no2: val('no2'),
      so2: val('so2'),
      o2: val('o2'),
      co2: val('co2'),
    }
  }, [periodView])

  const buildReport = useCallback(async () => {
    const charts = captureChartImages()
    const wb = new ExcelJS.Workbook()
    await buildCombustionReportSheet(
      wb,
      periodView.block,
      monthLabels,
      periodView.months,
      {
        sheetName: `Combustion ${point}`,
        period,
        from,
        to,
      },
      charts,
    )
    await downloadPmChartReportWorkbook(wb, `PMChart_Combustion_${point}_${period}_${from}.xlsx`)
  }, [periodView, monthLabels, point, period, from, to])

  usePmChartReportExport(buildReport)

  const updateCell = (
    pointKey: CombustionPointKey,
    param: CombustionParameterKey,
    month: CombustionMonthKey,
    value: number | null,
  ) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.point !== pointKey) return b
        return {
          ...b,
          rows: b.rows.map((r) =>
            r.parameter === param ? { ...r, values: { ...r.values, [month]: value } } : r,
          ),
        }
      }),
    )
  }

  return (
    <>
      <AppPageSection>
        <PmChartSection title={t('combustion.title')} subtitle={t('combustion.subtitle')}>
          <div className="mb-4">
            <Tabs value={point} onValueChange={(v) => setPoint(v as CombustionPointKey)}>
              <TabsList className="h-auto flex-wrap">
                {POINTS.map((p) => (
                  <TabsTrigger key={p} value={p} className="text-xs sm:text-sm">
                    {t('combustion.point', { point: p })}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <PmChartTableShell>
            <thead>
              <tr>
                <th rowSpan={2} className="border border-slate-300 bg-slate-700 px-2 py-2 text-white">
                  {t('combustion.pointCol')}
                </th>
                <th rowSpan={2} className="border border-slate-300 bg-slate-600 px-2 py-2 text-white">
                  {t('combustion.parameter')}
                </th>
                <th colSpan={COMBUSTION_MONTHS.length} className="border border-slate-300 bg-blue-800 px-2 py-1 text-white">
                  {chartYear}
                </th>
              </tr>
              <tr>
                {COMBUSTION_MONTHS.map((m) => (
                  <th key={m} className="border border-slate-300 bg-blue-100 px-2 py-1 capitalize text-slate-800">
                    {t(`combustionMonths.${m}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMBUSTION_PARAMETERS.map((param, idx) => (
                <tr key={param} className="odd:bg-white even:bg-slate-50/80">
                  {idx === 0 ? (
                    <td
                      rowSpan={COMBUSTION_PARAMETERS.length}
                      className="border border-slate-200 bg-slate-50 px-2 py-2 text-center font-bold text-[#1f3864]"
                    >
                      {point}
                    </td>
                  ) : null}
                  <td className="border border-slate-200 px-2 py-1 font-medium text-slate-700">
                    {t(`combustionParams.${param}`)}
                  </td>
                  {COMBUSTION_MONTHS.map((month) => (
                    <td key={month} className="border border-slate-200 p-1">
                      <PmChartNumericInput
                        value={getRow(block, param)?.values[month] ?? null}
                        onChange={(v) => updateCell(point, param, month, v)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </PmChartTableShell>
        </PmChartSection>
      </AppPageSection>

      <AppPageSection>
        <PmChartSection
          title={t('combustion.chartsTitle', { point })}
          subtitle={t('period.viewHint', { period: t(`period.${period}`), from, to })}
        >
          {visibleMonths.length === 0 ? (
            <p className="text-sm text-app-muted">{t('period.noData')}</p>
          ) : (
          <PmChartChartGrid>
            <PmChartPlot title={t('combustion.tempChart')}>
              <PmDesignEfficiencyLineChart
                labels={monthLabels}
                tAir={chartData.tAir}
                tGas={chartData.tGas}
                eff={chartData.eff}
              />
            </PmChartPlot>
            <PmChartPlot title={t('combustion.impuritiesChart')}>
              <PmDesignGroupedBarChart
                labels={monthLabels}
                yTitle="PPM"
                yMax={160}
                series={[
                  { label: 'CO (ppm)', data: chartData.co, color: '#1f4e79' },
                  { label: 'NO2 (ppm)', data: chartData.no2, color: '#c55a11' },
                  { label: 'SO2 (ppm)', data: chartData.so2, color: '#548235' },
                ]}
              />
            </PmChartPlot>
            <PmChartPlot title={t('combustion.gasChart')} className="lg:col-span-2 max-w-2xl mx-auto w-full">
              <PmDesignLineChart
                labels={monthLabels}
                yTitle={t('combustion.percentAxis')}
                yMin={0}
                yMax={18}
                series={[
                  { label: 'O2 (%)', data: chartData.o2, color: '#1f4e79' },
                  { label: 'CO2 (%)', data: chartData.co2, color: '#c55a11' },
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
