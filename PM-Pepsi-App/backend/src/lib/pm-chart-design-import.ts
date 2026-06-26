import * as XLSX from 'xlsx'

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

const LABEL_TO_PARAM = new Map<string, string>()
for (const [key, label] of Object.entries(PARAM_LABELS)) {
  LABEL_TO_PARAM.set(normalizeLabel(label), key)
}

export type PmChartDesignImportResult = {
  vibration: Record<string, unknown> | null
  current: Record<string, unknown> | null
  combustion: Record<string, unknown> | null
  issues: string[]
}

function normalizeLabel(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function num(v: unknown): number | null {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

function isoDate(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10)
  }
  if (typeof v === 'string' && v.trim()) {
    const d = new Date(v)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
    return v.trim()
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    const parsed = XLSX.SSF.parse_date_code(v)
    if (parsed) {
      const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d))
      return d.toISOString().slice(0, 10)
    }
  }
  return null
}

function sheetRows(wb: XLSX.WorkBook, name: string): unknown[][] {
  const ws = wb.Sheets[name]
  if (!ws) return []
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true }) as unknown[][]
}

function parseVibration(aoa: unknown[][]): Record<string, unknown> | null {
  if (aoa.length < 5) return null
  const title = String(aoa[0]?.[0] ?? ' Vibration Main Oil Pump-Stax')
  const rows = []
  for (let i = 4; i < aoa.length; i++) {
    const row = aoa[i]
    if (!row) continue
    const date = isoDate(row[0])
    if (!date) continue
    const hasData = [1, 2, 3, 4, 5, 6, 7, 8].some((c) => num(row[c]) != null)
    if (!hasData) continue
    rows.push({
      id: `import-v-${i}`,
      date,
      motorFrontDst: num(row[1]),
      motorFrontDb: num(row[2]),
      motorBackDst: num(row[3]),
      motorBackDb: num(row[4]),
      pump1Dst: num(row[5]),
      pump1Db: num(row[6]),
      pump2Dst: num(row[7]),
      pump2Db: num(row[8]),
    })
  }
  if (rows.length === 0) return null
  return { title, rows }
}

const MONTH_NAME_TO_KEY: Record<string, string> = {
  february: 'feb',
  march: 'mar',
  april: 'apr',
  may: 'may',
  june: 'jun',
  july: 'jul',
  august: 'aug',
  september: 'sep',
  october: 'oct',
  november: 'nov',
  december: 'dec',
}

function parseCurrent(aoa: unknown[][]): Record<string, unknown> | null {
  if (aoa.length < 4) return null
  const machine = String(aoa[3]?.[0] ?? aoa[4]?.[0] ?? 'Flour Mixer').trim() || 'Flour Mixer'
  const yearRaw = aoa[0]?.[2] ?? aoa[1]?.[2] ?? new Date().getFullYear()
  const year = num(yearRaw) ?? new Date().getFullYear()

  const header2 = aoa[1] ?? []
  const header3 = aoa[2] ?? []
  const slotIds: string[] = []
  let col = 2
  while (col < header2.length) {
    const monthLabel = String(header2[col] ?? '').trim()
    if (!monthLabel) {
      col++
      continue
    }
    const monthKey = MONTH_NAME_TO_KEY[monthLabel.toLowerCase()]
    if (!monthKey) {
      col++
      continue
    }
    const slotNum = num(header3[col])
    if (slotNum === 1 || slotNum === 2) {
      slotIds.push(`${monthKey}-${slotNum}`)
      col++
      if (header3[col] != null && num(header3[col]) != null && !header2[col]) {
        col++
      }
      continue
    }
    slotIds.push(`${monthKey}-1`)
    col++
  }

  if (slotIds.length === 0) {
    for (const m of CURRENT_MONTHS) {
      for (const slot of m.slots) {
        slotIds.push(`${m.key}-${slot}`)
      }
    }
  }

  const phaseLabels: Array<'R' | 'S' | 'T'> = ['R', 'S', 'T']
  const phases = []
  let dataRow = 3
  for (const phase of phaseLabels) {
    while (dataRow < aoa.length) {
      const row = aoa[dataRow]
      dataRow++
      if (!row) continue
      const avg = num(row[1])
      const values: Record<string, number | null> = {}
      let hasValue = false
      slotIds.forEach((id, idx) => {
        const v = num(row[2 + idx])
        values[id] = v
        if (v != null) hasValue = true
      })
      if (avg != null || hasValue) {
        phases.push({ phase, yearAverage: avg, values })
        break
      }
    }
  }

  if (phases.length === 0) return null
  return { machine, year, phases }
}

function resolveParamKey(label: unknown): string | null {
  const norm = normalizeLabel(String(label ?? ''))
  if (LABEL_TO_PARAM.has(norm)) return LABEL_TO_PARAM.get(norm)!
  if (norm.startsWith('t. air')) return 'tAir'
  if (norm.startsWith('t. gas')) return 'tGas'
  if (norm.includes('o2')) return 'o2'
  if (norm.startsWith('co (') || norm === 'co (ppm)') return 'co'
  if (norm.includes('no2')) return 'no2'
  if (norm.includes('so2')) return 'so2'
  if (norm.includes('co2')) return 'co2'
  if (norm.includes('eff')) return 'eff'
  if (norm.includes('loss')) return 'losses'
  return null
}

function parseCombustion(aoa: unknown[][]): Record<string, unknown> | null {
  const blocks: Array<{ point: string; rows: Array<{ parameter: string; values: Record<string, number | null> }> }> =
    []
  let currentPoint: string | null = null
  let currentRows: Array<{ parameter: string; values: Record<string, number | null> }> = []

  const flush = () => {
    if (currentPoint && currentRows.length > 0) {
      blocks.push({ point: currentPoint, rows: currentRows })
    }
    currentPoint = null
    currentRows = []
  }

  for (let i = 0; i < aoa.length; i++) {
    const row = aoa[i]
    if (!row) continue
    const pointCell = row[0]
    const paramCell = row[1]
    const pointLabel = String(pointCell ?? '').trim()
    const paramLabel = String(paramCell ?? '').trim()
    if (pointLabel.toUpperCase() === 'POINT' || paramLabel.toUpperCase() === 'PARAMETER') continue

    if (pointLabel) {
      flush()
      currentPoint = pointLabel
    }
    if (!currentPoint) continue

    const paramKey = resolveParamKey(paramCell)
    if (!paramKey) continue

    const values: Record<string, number | null> = {}
    COMBUSTION_MONTHS.forEach((m, idx) => {
      values[m] = num(row[2 + idx])
    })
    currentRows.push({ parameter: paramKey, values })
  }
  flush()

  if (blocks.length === 0) return null
  return { blocks }
}

export function parsePmChartDesignWorkbook(buffer: Buffer): PmChartDesignImportResult {
  const issues: string[] = []
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })

  const vibration = wb.SheetNames.includes('Vibration')
    ? parseVibration(sheetRows(wb, 'Vibration'))
    : null
  if (!vibration) issues.push('Vibration sheet missing or empty')

  const current = wb.SheetNames.includes('Current')
    ? parseCurrent(sheetRows(wb, 'Current'))
    : null
  if (!current) issues.push('Current sheet missing or empty')

  const combustion = wb.SheetNames.includes('Combustion')
    ? parseCombustion(sheetRows(wb, 'Combustion'))
    : null
  if (!combustion) issues.push('Combustion sheet missing or empty')

  return { vibration, current, combustion, issues }
}
