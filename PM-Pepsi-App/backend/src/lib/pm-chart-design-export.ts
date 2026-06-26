import * as XLSX from 'xlsx'

type VibrationRow = {
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

type CurrentPhase = {
  phase: 'R' | 'S' | 'T'
  yearAverage: number | null
  values: Record<string, number | null>
}

type CombustionBlock = {
  point: string
  rows: Array<{ parameter: string; values: Record<string, number | null> }>
}

const CURRENT_MONTHS: Array<{ key: string; slots: Array<1 | 2> }> = [
  { key: 'feb', slots: [1, 2] },
  { key: 'mar', slots: [1] },
  { key: 'apr', slots: [1, 2] },
  { key: 'may', slots: [1, 2] },
  { key: 'jun', slots: [1, 2] },
  { key: 'jul', slots: [1, 2] },
  { key: 'aug', slots: [1, 2] },
  { key: 'sep', slots: [1, 2] },
  { key: 'oct', slots: [1, 2] },
  { key: 'nov', slots: [1, 2] },
  { key: 'dec', slots: [1, 2] },
]

const COMBUSTION_MONTHS = ['jan', 'mar', 'aug', 'oct', 'dec'] as const
const COMBUSTION_PARAMS = ['tAir', 'tGas', 'o2', 'co', 'no2', 'so2', 'co2', 'eff', 'losses'] as const

const PARAM_LABELS: Record<string, string> = {
  tAir: 'T. Air ',
  tGas: 'T. Gas',
  o2: 'O2 (%)',
  co: 'CO (ppm)',
  no2: 'NO2 (ppm)',
  so2: 'SO2 (ppm)',
  co2: 'CO2      ( %)',
  eff: 'Eff.       (%)',
  losses: 'Losses',
}

function avg4(...vals: Array<number | null>): number | null {
  const nums = vals.filter((v): v is number => v != null && Number.isFinite(v))
  if (!nums.length) return null
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100
}

function buildVibrationSheet(payload: Record<string, unknown>): XLSX.WorkSheet {
  const rows = (payload.rows as VibrationRow[] | undefined) ?? []
  const title = (payload.title as string | undefined) ?? ' Vibration Main Oil Pump-Stax'
  const data: unknown[][] = [
    [title],
    ['D/M/Y', 'Main Oil Pump', null, null, null, null, null, null, null, null, null, 'Average'],
    [null, 'Motor Front', null, 'Motor Back', null, 'Pump Point#1', null, 'Pump Point#2', null, null, null, null],
    [null, 'Dst', 'dB', 'Dst', 'dB', 'Dst', 'dB', 'Dst', 'dB', null, null, 'Dst', 'dB'],
  ]

  for (const row of rows) {
    data.push([
      row.date,
      row.motorFrontDst,
      row.motorFrontDb,
      row.motorBackDst,
      row.motorBackDb,
      row.pump1Dst,
      row.pump1Db,
      row.pump2Dst,
      row.pump2Db,
      null,
      null,
      avg4(row.motorFrontDst, row.motorBackDst, row.pump1Dst, row.pump2Dst),
      avg4(row.motorFrontDb, row.motorBackDb, row.pump1Db, row.pump2Db),
    ])
  }

  return XLSX.utils.aoa_to_sheet(data)
}

function buildCurrentSheet(payload: Record<string, unknown>): XLSX.WorkSheet {
  const machine = (payload.machine as string | undefined) ?? 'Flour Mixer'
  const year = (payload.year as number | undefined) ?? new Date().getFullYear()
  const phases = (payload.phases as CurrentPhase[] | undefined) ?? []

  const header1: unknown[] = ['Machine', null, year]
  const header2: unknown[] = [null, `${year} Average`]
  const header3: unknown[] = [null, null]
  for (const m of CURRENT_MONTHS) {
    header2.push(capitalizeMonth(m.key))
    for (const slot of m.slots) {
      header3.push(slot)
    }
    if (m.slots.length === 1) header2.push(null)
  }

  const data: unknown[][] = [header1, header2, header3]

  for (const phase of phases) {
    const line: unknown[] = []
    if (phase.phase === 'R') line.push(machine)
    else line.push(null)
    line.push(phase.yearAverage)
    for (const m of CURRENT_MONTHS) {
      for (const slot of m.slots) {
        const id = `${m.key}-${slot}`
        line.push(phase.values[id] ?? null)
      }
    }
    data.push(line)
  }

  return XLSX.utils.aoa_to_sheet(data)
}

function capitalizeMonth(key: string): string {
  const map: Record<string, string> = {
    feb: 'February',
    mar: 'March',
    apr: 'April',
    may: 'May',
    jun: 'June',
    jul: 'July',
    aug: 'August',
    sep: 'September',
    oct: 'October',
    nov: 'November',
    dec: 'December',
  }
  return map[key] ?? key
}

function buildCombustionSheet(payload: Record<string, unknown>): XLSX.WorkSheet {
  const blocks = (payload.blocks as CombustionBlock[] | undefined) ?? []
  const data: unknown[][] = [
    [null, null, null, 2021],
    [null, 'POINT', 'PARAMETER', 'JAN', 'Mar', 'Aug', 'Oct', 'Dec'],
  ]

  for (const block of blocks) {
    block.rows.forEach((row, idx) => {
      data.push([
        null,
        idx === 0 ? block.point : null,
        PARAM_LABELS[row.parameter] ?? row.parameter,
        ...COMBUSTION_MONTHS.map((m) => row.values[m] ?? null),
      ])
    })
  }

  return XLSX.utils.aoa_to_sheet(data)
}

export function buildPmChartDesignWorkbook(sheets: {
  vibration?: Record<string, unknown>
  current?: Record<string, unknown>
  combustion?: Record<string, unknown>
}): Buffer {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildVibrationSheet(sheets.vibration ?? {}), 'Vibration')
  XLSX.utils.book_append_sheet(wb, buildCurrentSheet(sheets.current ?? {}), 'Current')
  XLSX.utils.book_append_sheet(wb, buildCombustionSheet(sheets.combustion ?? {}), 'Combustion')
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}

export function payloadFromVibrationRows(rows: unknown): Record<string, unknown> {
  return { title: ' Vibration Main Oil Pump-Stax', rows }
}

export function payloadFromCurrent(
  machine: string,
  year: number,
  phases: unknown,
): Record<string, unknown> {
  return { machine, year, phases }
}

export function payloadFromCombustion(blocks: unknown): Record<string, unknown> {
  return { blocks }
}
