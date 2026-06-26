import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { PmChartPeriod } from '@/features/pm-charts/pm-chart-period'
import { defaultRangeForPeriod } from '@/features/pm-charts/pm-chart-period'

export type PmChartPeriodState = {
  period: PmChartPeriod
  setPeriod: (p: PmChartPeriod) => void
  from: string
  to: string
  setFrom: (v: string) => void
  setTo: (v: string) => void
  setRange: (from: string, to: string) => void
}

const PmChartPeriodContext = createContext<PmChartPeriodState | null>(null)

export function PmChartPeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriodState] = useState<PmChartPeriod>('yearly')
  const initialRange = defaultRangeForPeriod('yearly')
  const [from, setFrom] = useState(initialRange.from)
  const [to, setTo] = useState(initialRange.to)

  const setPeriod = useCallback((p: PmChartPeriod) => {
    setPeriodState(p)
  }, [])

  const setRange = useCallback((nextFrom: string, nextTo: string) => {
    setFrom(nextFrom)
    setTo(nextTo)
  }, [])

  const value = useMemo(
    () => ({ period, setPeriod, from, to, setFrom, setTo, setRange }),
    [period, setPeriod, from, to, setRange],
  )

  return <PmChartPeriodContext.Provider value={value}>{children}</PmChartPeriodContext.Provider>
}

export function usePmChartPeriod() {
  const ctx = useContext(PmChartPeriodContext)
  if (!ctx) throw new Error('usePmChartPeriod outside provider')
  return ctx
}
