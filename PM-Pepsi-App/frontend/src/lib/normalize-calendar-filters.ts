import { ddMmYyyyToIsoDateField, todayDdMmYyyy } from '@/lib/personnel-close-format'

export type CalendarFilterFormShape = {
  activity: string[]
  wktype: string[]
  status: string[]
  displayStatus: string[]
  pmPhase: string[]
  wkctr: string[]
  team: string[]
  functionalloc: string[]
  fromDate?: string
  toDate?: string
  wcStartDate?: string
  wcEndDate?: string
  wcStartTime?: string
  wcEndTime?: string
}

/** Map form values to API body fields (optional wc date range when wkctr + custom dates). */
export function normalizeCalendarSubmittedFilters<T extends CalendarFilterFormShape>(
  data: T,
): T {
  const wcStartIso = ddMmYyyyToIsoDateField(data.wcStartDate?.trim() ?? '')
  const wcEndIso = ddMmYyyyToIsoDateField(data.wcEndDate?.trim() ?? '')
  const todayIso = ddMmYyyyToIsoDateField(todayDdMmYyyy())
  const wcIsDefaultToday = wcStartIso === todayIso && wcEndIso === todayIso
  const hasExplicitCalendarRange = Boolean(data.fromDate?.trim() || data.toDate?.trim())
  const useWcRange =
    data.wkctr.length > 0 &&
    Boolean(wcStartIso && wcEndIso) &&
    !wcIsDefaultToday &&
    !hasExplicitCalendarRange
  const fromIso = useWcRange ? wcStartIso : data.fromDate?.trim() || ''
  const toIso = useWcRange ? wcEndIso : data.toDate?.trim() || ''
  return {
    ...data,
    fromDate: fromIso,
    toDate: toIso,
  }
}

export function parseYearMonthFromIsoDate(iso: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null
  return { year, month }
}
