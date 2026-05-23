import { BoardEngUtilizationStackedChart } from '@/features/board/BoardEngUtilizationStackedChart'
import { BoardEngUtilizationTeamGrid } from '@/features/board/BoardEngUtilizationTeamGrid'
import { BoardUtilLegend } from '@/features/board/BoardUtilLegend'
import type { SummaryWeeklyRow } from '@/api/schemas'

type WeekRow = {
  weekLabel: string
  utilization: number
  utilizationDelta: number
  backlogHours: number
  backlogDelta: number
}

type Props = {
  rangeLabel: string
  showRca: boolean
  onShowRcaChange: (value: boolean) => void
  weeklyRows: SummaryWeeklyRow[] | undefined
  weeklyLoading: boolean
  weeklyError: Error | null
  weekRows: WeekRow[]
  deltaClass: (n: number) => string
  carousel?: boolean
  kioskDark?: boolean
}

/** โซน B — กราฟ utilization + week table + กริดทีม */
export function BoardZoneB({
  rangeLabel,
  showRca,
  onShowRcaChange,
  weeklyRows,
  weeklyLoading,
  weeklyError,
  weekRows,
  deltaClass,
  carousel = false,
  kioskDark = true,
}: Props) {
  return (
    <div
      className={
        carousel
          ? 'engineering-board__zone engineering-board__zone--b engineering-board__zone-b-stack'
          : 'engineering-board__zone-b-stack'
      }
      aria-label="โซน B — Eng Utilization"
    >
      {carousel ? <p className="engineering-board__zone-tag">โซน B · Utilization</p> : null}

      <div className="engineering-board__util-toolbar">
        <BoardUtilLegend showRca={showRca} />
        <label className="engineering-board__rca-toggle">
          <input
            type="checkbox"
            checked={showRca}
            onChange={(e) => onShowRcaChange(e.target.checked)}
            className="engineering-board__rca-input"
          />
          รวม %RCA ในกราฟและการ์ด
        </label>
      </div>

      <section className="engineering-board__analytics engineering-board__analytics--zone-b">
        <BoardEngUtilizationStackedChart
          rows={weeklyRows}
          loading={weeklyLoading}
          error={weeklyError}
          rangeLabel={rangeLabel}
          showRca={showRca}
          kioskDark={kioskDark}
        />

        <section className="engineering-board__panel engineering-board__panel--week">
          <h2 className="engineering-board__panel-title">Week-to-Week</h2>
          {weekRows.length === 0 ? (
            <p className="engineering-board__empty">ต้องมีอย่างน้อย 2 สัปดาห์ในช่วง KPI</p>
          ) : (
            <div className="engineering-board__table-wrap">
              <table className="engineering-board__table">
                <thead>
                  <tr>
                    <th>สัปดาห์</th>
                    <th className="text-right">Util %</th>
                    <th className="text-right">Δ</th>
                    <th className="text-right">Backlog</th>
                  </tr>
                </thead>
                <tbody>
                  {weekRows.slice(0, 8).map((r) => (
                    <tr key={r.weekLabel}>
                      <td>{r.weekLabel}</td>
                      <td className="text-right tabular-nums">{r.utilization.toFixed(1)}%</td>
                      <td className={`text-right tabular-nums ${deltaClass(r.utilizationDelta)}`}>
                        {r.utilizationDelta > 0 ? '+' : ''}
                        {r.utilizationDelta.toFixed(1)}%
                      </td>
                      <td className={`text-right tabular-nums ${deltaClass(-r.backlogDelta)}`}>
                        {r.backlogHours.toFixed(0)}
                        <span className="engineering-board__table-sub">
                          ({r.backlogDelta > 0 ? '+' : ''}
                          {r.backlogDelta.toFixed(0)})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <BoardEngUtilizationTeamGrid
        rows={weeklyRows}
        loading={weeklyLoading}
        error={weeklyError}
        rangeLabel={rangeLabel}
        showRca={showRca}
      />
    </div>
  )
}
