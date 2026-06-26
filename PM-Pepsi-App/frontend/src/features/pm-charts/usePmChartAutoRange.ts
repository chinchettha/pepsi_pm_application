import { usePmChartPeriod } from '@/features/pm-charts/PmChartPeriodContext'
import { expandRangeForPeriod, minMaxIsoDates } from '@/features/pm-charts/pm-chart-period'
import { useEffect, useRef } from 'react'

/** Once per dataset: expand period range so chart filters include loaded readings. */
export function usePmChartAutoRange(isoDates: string[]) {
  const { period, setRange } = usePmChartPeriod()
  const syncedKey = useRef('')
  const datesKey = isoDates
    .map((d) => d.trim())
    .filter(Boolean)
    .sort()
    .join('|')

  useEffect(() => {
    if (!datesKey || datesKey === syncedKey.current) return
    syncedKey.current = datesKey

    const dated = datesKey.split('|')
    const span = minMaxIsoDates(dated)
    if (!span) return

    const expanded = expandRangeForPeriod(span, period)
    setRange(expanded.from, expanded.to)
  }, [datesKey, period, setRange])
}
