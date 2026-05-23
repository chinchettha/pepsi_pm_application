import { EngUtilizationChart } from '@/features/reports/EngUtilizationChart'
import { toEngUtilizationChartRows } from '@/lib/eng-utilization-chart'
import type { SummaryWeeklyRow } from '@/api/schemas'
import { useMemo } from 'react'

const BOARD_CHART_TOP_N = 12

type Props = {
  rows: SummaryWeeklyRow[] | undefined
  loading: boolean
  error: Error | null
  rangeLabel: string
  showRca: boolean
  kioskDark?: boolean
}

/** กราฟ stacked %PM / %Reactive / RCA — เทียบ Eng Utilization 2026.xlsx */
export function BoardEngUtilizationStackedChart({
  rows,
  loading,
  error,
  rangeLabel,
  showRca,
  kioskDark = true,
}: Props) {

  const chartRows = useMemo(() => {
    const all = rows ? toEngUtilizationChartRows(rows) : []
    return [...all].sort((a, b) => b.hrHour - a.hrHour).slice(0, BOARD_CHART_TOP_N)
  }, [rows])

  return (
    <section className="engineering-board__panel engineering-board__panel--chart">
      <h2 className="engineering-board__panel-title">
        Eng Utilization — {rangeLabel}
      </h2>
      {loading ? (
        <p className="text-body-sm opacity-60">กำลังโหลด Eng Utilization…</p>
      ) : error ? (
        <p className="text-body-sm text-red-300">{error.message}</p>
      ) : (
        <div className="engineering-board__chart-zone">
          <EngUtilizationChart
            items={chartRows}
            layout="fullscreen"
            showRca={showRca}
            kioskDark={kioskDark}
          />
        </div>
      )}
      {!loading && !error && chartRows.length > 0 ? (
        <p className="engineering-board__panel-foot">
          แสดง {chartRows.length} ช่าง (เรียงตาม HR hour) · Total ใน Excel = %PM + %Reactive
        </p>
      ) : null}
    </section>
  )
}
