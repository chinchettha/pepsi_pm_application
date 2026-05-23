import {
  formatBoardPeriodRangeLabel,
  readBoardPeriod,
  resolveBoardPeriodDateRange,
  writeBoardPeriod,
  type BoardPeriodId,
} from '@/lib/board-period'
import { useCallback, useMemo, useState } from 'react'

export function useBoardPeriod() {
  const [period, setPeriodState] = useState<BoardPeriodId>(() => readBoardPeriod())

  const range = useMemo(() => resolveBoardPeriodDateRange(period), [period])

  const rangeLabel = useMemo(
    () => formatBoardPeriodRangeLabel(period, range),
    [period, range],
  )

  const setPeriod = useCallback((id: BoardPeriodId) => {
    writeBoardPeriod(id)
    setPeriodState(id)
  }, [])

  return { period, range, rangeLabel, setPeriod }
}
