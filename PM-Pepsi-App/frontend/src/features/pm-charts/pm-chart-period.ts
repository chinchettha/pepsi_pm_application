import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import type {
  CombustionMonthKey,
  CombustionPointBlock,
  CurrentPhaseRow,
  VibrationReadingRow,
} from '@/features/pm-charts/pm-chart-design-data'
import { avgNullable } from '@/features/pm-charts/pm-chart-design-data'

export type PmChartPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type PmChartDateRange = {
  from: string
  to: string
}

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

export function parseIsoDate(iso: string): Date | null {
  const d = parseISO(iso.slice(0, 10))
  return Number.isNaN(d.getTime()) ? null : d
}

export function toIsoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function defaultRangeForPeriod(period: PmChartPeriod, anchor = new Date()): PmChartDateRange {
  switch (period) {
    case 'daily':
      return { from: toIsoDate(startOfDay(anchor)), to: toIsoDate(endOfDay(anchor)) }
    case 'weekly':
      return {
        from: toIsoDate(startOfWeek(anchor, { weekStartsOn: 1 })),
        to: toIsoDate(endOfWeek(anchor, { weekStartsOn: 1 })),
      }
    case 'monthly':
      return { from: toIsoDate(startOfMonth(anchor)), to: toIsoDate(endOfMonth(anchor)) }
    case 'yearly':
      return { from: toIsoDate(startOfYear(anchor)), to: toIsoDate(endOfYear(anchor)) }
    default: {
      const _exhaustive: never = period
      return _exhaustive
    }
  }
}

export function minMaxIsoDates(dates: string[]): PmChartDateRange | null {
  const parsed = dates.map((d) => parseIsoDate(d)).filter((d): d is Date => d != null)
  if (parsed.length === 0) return null
  let min = parsed[0]!
  let max = parsed[0]!
  for (const d of parsed) {
    if (d < min) min = d
    if (d > max) max = d
  }
  return { from: toIsoDate(min), to: toIsoDate(max) }
}

/** Expand a data span to sensible period boundaries for chart viewing. */
export function expandRangeForPeriod(span: PmChartDateRange, period: PmChartPeriod): PmChartDateRange {
  const from = parseIsoDate(span.from)
  const to = parseIsoDate(span.to)
  if (!from || !to) return span
  switch (period) {
    case 'daily':
      return { from: toIsoDate(startOfDay(from)), to: toIsoDate(endOfDay(to)) }
    case 'weekly':
      return {
        from: toIsoDate(startOfWeek(from, { weekStartsOn: 1 })),
        to: toIsoDate(endOfWeek(to, { weekStartsOn: 1 })),
      }
    case 'monthly':
      return { from: toIsoDate(startOfMonth(from)), to: toIsoDate(endOfMonth(to)) }
    case 'yearly':
      return { from: toIsoDate(startOfYear(from)), to: toIsoDate(endOfYear(to)) }
    default: {
      const _exhaustive: never = period
      return _exhaustive
    }
  }
}

export function rangeIncludesAnyDate(dates: string[], range: PmChartDateRange): boolean {
  return dates.some((d) => {
    const parsed = parseIsoDate(d)
    return parsed != null && inRange(parsed, range)
  })
}

function inRange(d: Date, range: PmChartDateRange): boolean {
  const from = parseIsoDate(range.from)
  const to = parseIsoDate(range.to)
  if (!from || !to) return true
  return isWithinInterval(d, { start: startOfDay(from), end: endOfDay(to) })
}

function avgField(rows: VibrationReadingRow[], pick: (r: VibrationReadingRow) => number | null): number | null {
  return avgNullable(rows.map(pick))
}

function aggregateVibrationGroup(
  id: string,
  label: string,
  rows: VibrationReadingRow[],
): VibrationReadingRow {
  return {
    id,
    date: label,
    motorFrontDst: avgField(rows, (r) => r.motorFrontDst),
    motorFrontDb: avgField(rows, (r) => r.motorFrontDb),
    motorBackDst: avgField(rows, (r) => r.motorBackDst),
    motorBackDb: avgField(rows, (r) => r.motorBackDb),
    pump1Dst: avgField(rows, (r) => r.pump1Dst),
    pump1Db: avgField(rows, (r) => r.pump1Db),
    pump2Dst: avgField(rows, (r) => r.pump2Dst),
    pump2Db: avgField(rows, (r) => r.pump2Db),
  }
}

function periodBucketKey(d: Date, period: PmChartPeriod): string {
  switch (period) {
    case 'daily':
      return format(d, 'yyyy-MM-dd')
    case 'weekly':
      return format(d, "yyyy-'W'II")
    case 'monthly':
      return format(d, 'yyyy-MM')
    case 'yearly':
      return format(d, 'yyyy')
    default: {
      const _exhaustive: never = period
      return _exhaustive
    }
  }
}

function periodBucketLabel(key: string, period: PmChartPeriod): string {
  switch (period) {
    case 'daily': {
      const d = parseIsoDate(key)
      return d ? format(d, 'dd MMM yyyy') : key
    }
    case 'weekly':
      return key.replace('-W', ' W')
    case 'monthly': {
      const [y, m] = key.split('-')
      const d = new Date(Number(y), Number(m) - 1, 1)
      return format(d, 'MMM yyyy')
    }
    case 'yearly':
      return key
    default: {
      const _exhaustive: never = period
      return _exhaustive
    }
  }
}

export function filterVibrationForPeriod(
  rows: VibrationReadingRow[],
  period: PmChartPeriod,
  range: PmChartDateRange,
): VibrationReadingRow[] {
  const dated = rows
    .map((row) => ({ row, d: parseIsoDate(row.date) }))
    .filter((x): x is { row: VibrationReadingRow; d: Date } => x.d != null && inRange(x.d, range))

  if (period === 'daily') {
    return dated.map(({ row }) => row).sort((a, b) => a.date.localeCompare(b.date))
  }

  const groups = new Map<string, VibrationReadingRow[]>()
  for (const { row, d } of dated) {
    const key = periodBucketKey(d, period)
    const list = groups.get(key) ?? []
    list.push(row)
    groups.set(key, list)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, groupRows]) => aggregateVibrationGroup(key, periodBucketLabel(key, period), groupRows))
}

export type CurrentSlotPoint = {
  slotId: string
  label: string
  date: Date
}

export function currentSlotDate(year: number, monthKey: string, slot: 1 | 2): Date {
  const month = MONTH_INDEX[monthKey] ?? 0
  const day = slot === 1 ? 1 : 15
  return new Date(year, month, day)
}

export function filterCurrentForPeriod(
  phases: CurrentPhaseRow[],
  slotPoints: CurrentSlotPoint[],
  period: PmChartPeriod,
  range: PmChartDateRange,
): {
  labels: string[]
  slotIds: string[]
  phases: CurrentPhaseRow[]
} {
  const inRangePoints = slotPoints.filter((p) => inRange(p.date, range))

  if (period === 'daily') {
    const labels = inRangePoints.map((p) => p.label)
    const slotIds = inRangePoints.map((p) => p.slotId)
    return { labels, slotIds, phases }
  }

  if (period === 'monthly') {
    const byMonth = new Map<string, CurrentSlotPoint[]>()
    for (const p of inRangePoints) {
      const key = format(p.date, 'yyyy-MM')
      const list = byMonth.get(key) ?? []
      list.push(p)
      byMonth.set(key, list)
    }
    const labels: string[] = []
    const slotIds: string[] = []
    const aggregated: CurrentPhaseRow[] = phases.map((phase) => ({
      phase: phase.phase,
      yearAverage: phase.yearAverage,
      values: {} as Record<string, number | null>,
    }))

    for (const [key, points] of [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const id = `month-${key}`
      slotIds.push(id)
      labels.push(periodBucketLabel(key, 'monthly'))
      for (const agg of aggregated) {
        const src = phases.find((p) => p.phase === agg.phase)
        agg.values[id] = avgNullable(points.map((pt) => src?.values[pt.slotId] ?? null))
      }
    }
    return { labels, slotIds, phases: aggregated }
  }

  if (period === 'weekly') {
    const byWeek = new Map<string, CurrentSlotPoint[]>()
    for (const p of inRangePoints) {
      const key = periodBucketKey(p.date, 'weekly')
      const list = byWeek.get(key) ?? []
      list.push(p)
      byWeek.set(key, list)
    }
    const labels: string[] = []
    const slotIds: string[] = []
    const aggregated: CurrentPhaseRow[] = phases.map((phase) => ({
      phase: phase.phase,
      yearAverage: phase.yearAverage,
      values: {} as Record<string, number | null>,
    }))

    for (const [key, points] of [...byWeek.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const id = `week-${key}`
      slotIds.push(id)
      labels.push(periodBucketLabel(key, 'weekly'))
      for (const agg of aggregated) {
        const src = phases.find((p) => p.phase === agg.phase)
        agg.values[id] = avgNullable(points.map((pt) => src?.values[pt.slotId] ?? null))
      }
    }
    return { labels, slotIds, phases: aggregated }
  }

  // yearly — one bucket per year in range
  const years = new Set(inRangePoints.map((p) => format(p.date, 'yyyy')))
  const labels = [...years].sort()
  const slotIds = labels.map((y) => `year-${y}`)
  const aggregated: CurrentPhaseRow[] = phases.map((phase) => ({
    phase: phase.phase,
    yearAverage: phase.yearAverage,
    values: Object.fromEntries(
      labels.map((y) => {
        const pts = inRangePoints.filter((p) => format(p.date, 'yyyy') === y)
        return [`year-${y}`, avgNullable(pts.map((pt) => phase.values[pt.slotId] ?? null))]
      }),
    ),
  }))
  return { labels, slotIds, phases: aggregated }
}

export function combustionMonthDate(year: number, month: CombustionMonthKey): Date {
  const monthIdx = MONTH_INDEX[month] ?? 0
  return new Date(year, monthIdx, 15)
}

export function filterCombustionMonthsForPeriod(
  months: CombustionMonthKey[],
  year: number,
  period: PmChartPeriod,
  range: PmChartDateRange,
): CombustionMonthKey[] {
  const dated = months
    .map((m) => ({ m, d: combustionMonthDate(year, m) }))
    .filter(({ d }) => inRange(d, range))

  if (period === 'daily' || period === 'weekly' || period === 'monthly') {
    return dated.map(({ m }) => m)
  }

  // yearly — keep all months in range as representative samples
  return dated.map(({ m }) => m)
}

export function aggregateCombustionForPeriod(
  block: CombustionPointBlock,
  months: CombustionMonthKey[],
  period: PmChartPeriod,
): { labels: string[]; months: CombustionMonthKey[]; block: CombustionPointBlock } {
  if (period !== 'yearly' || months.length <= 1) {
    return {
      labels: months.map((m) => m.toUpperCase()),
      months,
      block,
    }
  }

  const yearLabel = 'Year avg'
  const aggregated: CombustionPointBlock = {
    point: block.point,
    rows: block.rows.map((row) => ({
      parameter: row.parameter,
      values: {
        jan: avgNullable(months.map((m) => row.values[m] ?? null)),
        mar: null,
        aug: null,
        oct: null,
        dec: null,
      },
    })),
  }

  return {
    labels: [yearLabel],
    months: ['jan'],
    block: aggregated,
  }
}

export function captureChartImages(containerSelector = '[data-pm-chart-plot]'): Array<{ title: string; base64: string }> {
  if (typeof document === 'undefined') return []
  const plots = document.querySelectorAll(containerSelector)
  const out: Array<{ title: string; base64: string }> = []
  plots.forEach((plot) => {
    const canvas = plot.querySelector('canvas')
    if (!canvas) return
    const title =
      plot.querySelector('[data-pm-chart-title]')?.textContent?.trim() ||
      plot.getAttribute('data-pm-chart-title') ||
      'Chart'
    try {
      const base64 = canvas.toDataURL('image/png').split(',')[1]
      if (base64) out.push({ title, base64 })
    } catch {
      // canvas tainted or empty
    }
  })
  return out
}
