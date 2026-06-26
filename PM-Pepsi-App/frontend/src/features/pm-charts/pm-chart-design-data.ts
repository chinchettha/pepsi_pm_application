/** Types and layout helpers for PM Chart Design (PMChartDesign.xlsx). */

export type VibrationReadingRow = {
  id: string
  date: string
  motorFrontDst: number | null
  motorFrontDb: number | null
  motorBackDst: number | null
  motorBackDb: number | null
  pump1Dst: number | null
  pump1Db: number | null
  pump2Dst: number | null
  pump2Db: number | null
}

export type CurrentMonthSlot = {
  monthKey: string
  slot: 1 | 2
  label: string
}

export type CurrentPhaseRow = {
  phase: 'R' | 'S' | 'T'
  yearAverage: number | null
  values: Record<string, number | null>
}

export type CombustionPointKey = 'Patail' | '50' | '75' | 'Full'

export type CombustionParameterKey =
  | 'tAir'
  | 'tGas'
  | 'o2'
  | 'co'
  | 'no2'
  | 'so2'
  | 'co2'
  | 'eff'
  | 'losses'

export type CombustionMonthKey = 'jan' | 'mar' | 'aug' | 'oct' | 'dec'

export type CombustionRow = {
  parameter: CombustionParameterKey
  values: Record<CombustionMonthKey, number | null>
}

export type CombustionPointBlock = {
  point: CombustionPointKey
  rows: CombustionRow[]
}

export const VIBRATION_CHART_TITLE = 'Vibration Main Oil Pump-Stax'

export const CURRENT_MACHINE = 'Flour Mixer'

export function defaultCurrentYear(): number {
  return new Date().getFullYear()
}

export const CURRENT_MONTH_SLOTS: CurrentMonthSlot[] = [
  { monthKey: 'feb', slot: 1, label: 'Feb-1' },
  { monthKey: 'feb', slot: 2, label: 'Feb-2' },
  { monthKey: 'mar', slot: 1, label: 'Mar-1' },
  { monthKey: 'apr', slot: 1, label: 'Apr-1' },
  { monthKey: 'apr', slot: 2, label: 'Apr-2' },
  { monthKey: 'may', slot: 1, label: 'May-1' },
  { monthKey: 'may', slot: 2, label: 'May-2' },
  { monthKey: 'jun', slot: 1, label: 'Jun-1' },
  { monthKey: 'jun', slot: 2, label: 'Jun-2' },
  { monthKey: 'jul', slot: 1, label: 'Jul-1' },
  { monthKey: 'jul', slot: 2, label: 'Jul-2' },
  { monthKey: 'aug', slot: 1, label: 'Aug-1' },
  { monthKey: 'aug', slot: 2, label: 'Aug-2' },
  { monthKey: 'sep', slot: 1, label: 'Sep-1' },
  { monthKey: 'sep', slot: 2, label: 'Sep-2' },
  { monthKey: 'oct', slot: 1, label: 'Oct-1' },
  { monthKey: 'oct', slot: 2, label: 'Oct-2' },
  { monthKey: 'nov', slot: 1, label: 'Nov-1' },
  { monthKey: 'nov', slot: 2, label: 'Nov-2' },
  { monthKey: 'dec', slot: 1, label: 'Dec-1' },
  { monthKey: 'dec', slot: 2, label: 'Dec-2' },
]

export function currentSlotId(monthKey: string, slot: 1 | 2): string {
  return `${monthKey}-${slot}`
}

export const COMBUSTION_MONTHS: CombustionMonthKey[] = ['jan', 'mar', 'aug', 'oct', 'dec']

export const COMBUSTION_PARAMETERS: CombustionParameterKey[] = [
  'tAir',
  'tGas',
  'o2',
  'co',
  'no2',
  'so2',
  'co2',
  'eff',
  'losses',
]

function emptyCombustionValues(): Record<CombustionMonthKey, number | null> {
  return { jan: null, mar: null, aug: null, oct: null, dec: null }
}

export function emptyVibrationRows(): VibrationReadingRow[] {
  return []
}

export function emptyCurrentPhases(): CurrentPhaseRow[] {
  const values: Record<string, number | null> = {}
  for (const slot of CURRENT_MONTH_SLOTS) {
    values[currentSlotId(slot.monthKey, slot.slot)] = null
  }
  return (['R', 'S', 'T'] as const).map((phase) => ({
    phase,
    yearAverage: null,
    values: { ...values },
  }))
}

export function emptyCombustionBlocks(): CombustionPointBlock[] {
  const points: CombustionPointKey[] = ['Patail', '50', '75', 'Full']
  return points.map((point) => ({
    point,
    rows: COMBUSTION_PARAMETERS.map((parameter) => ({
      parameter,
      values: emptyCombustionValues(),
    })),
  }))
}

export function avgNullable(values: Array<number | null>): number | null {
  const nums = values.filter((v): v is number => v != null && Number.isFinite(v))
  if (nums.length === 0) return null
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100
}

export function vibrationAverages(row: VibrationReadingRow): { dst: number | null; db: number | null } {
  return {
    dst: avgNullable([row.motorFrontDst, row.motorBackDst, row.pump1Dst, row.pump2Dst]),
    db: avgNullable([row.motorFrontDb, row.motorBackDb, row.pump1Db, row.pump2Db]),
  }
}

export function formatChartDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Simple polynomial trend (degree 2) for average series — matches Excel trend line intent. */
export function polynomialTrend(values: Array<number | null>): Array<number | null> {
  const points = values
    .map((y, x) => (y == null ? null : { x, y }))
    .filter((p): p is { x: number; y: number } => p != null)
  if (points.length < 3) return values.map(() => null)

  const n = points.length
  let sx = 0
  let sx2 = 0
  let sx3 = 0
  let sx4 = 0
  let sy = 0
  let sxy = 0
  let sx2y = 0
  for (const { x, y } of points) {
    const x2 = x * x
    sx += x
    sx2 += x2
    sx3 += x2 * x
    sx4 += x2 * x2
    sy += y
    sxy += x * y
    sx2y += x2 * y
  }

  const det =
    n * (sx2 * sx4 - sx3 * sx3) - sx * (sx * sx4 - sx2 * sx3) + sx2 * (sx * sx3 - sx2 * sx2)
  if (Math.abs(det) < 1e-9) return values.map(() => null)

  const a =
    (sy * (sx2 * sx4 - sx3 * sx3) -
      sx * (sxy * sx4 - sx2y * sx3) +
      sx2 * (sxy * sx3 - sx2y * sx2)) /
    det
  const b =
    (n * (sxy * sx4 - sx2y * sx3) -
      sy * (sx * sx4 - sx2 * sx3) +
      sx2 * (sx * sx2y - sx2 * sxy)) /
    det
  const c =
    (n * (sx2 * sx2y - sx3 * sxy) -
      sx * (sx * sx2y - sx2 * sxy) +
      sy * (sx * sx3 - sx2 * sx2)) /
    det

  return values.map((_, x) => {
    const y = a + b * x + c * x * x
    return Number.isFinite(y) ? Math.round(y * 100) / 100 : null
  })
}
