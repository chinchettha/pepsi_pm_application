/** Merge imported PM chart payloads with existing DB data — dedupe by natural keys. */

export type PmChartMergeStats = {
  rowsAdded: number
  rowsUpdated: number
  duplicatesSkipped: number
}

type VibrationRow = {
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

type CurrentPhase = {
  phase: 'R' | 'S' | 'T'
  yearAverage: number | null
  values: Record<string, number | null>
}

type CombustionBlock = {
  point: string
  rows: Array<{ parameter: string; values: Record<string, number | null> }>
}

const VIBRATION_FIELDS = [
  'motorFrontDst',
  'motorFrontDb',
  'motorBackDst',
  'motorBackDb',
  'pump1Dst',
  'pump1Db',
  'pump2Dst',
  'pump2Db',
] as const

function normalizeDate(raw: string): string {
  const d = raw.trim().slice(0, 10)
  const parsed = new Date(d)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return d
}

function mergeNumericFields<T extends Record<string, unknown>>(
  base: T,
  incoming: T,
  fields: readonly string[],
): T {
  const out = { ...base }
  for (const key of fields) {
    const v = incoming[key]
    if (v != null && typeof v === 'number' && Number.isFinite(v)) {
      out[key as keyof T] = v as T[keyof T]
    }
  }
  return out
}

function mergeSlotValues(
  base: Record<string, number | null>,
  incoming: Record<string, number | null>,
): { values: Record<string, number | null>; updated: number } {
  const values = { ...base }
  let updated = 0
  for (const [key, v] of Object.entries(incoming)) {
    if (v == null || !Number.isFinite(v)) continue
    if (values[key] != null && Number.isFinite(values[key]!)) updated++
    values[key] = v
  }
  return { values, updated }
}

export function mergeVibrationPayload(
  existing: Record<string, unknown> | null,
  incoming: Record<string, unknown>,
): { payload: Record<string, unknown>; stats: PmChartMergeStats } {
  const stats: PmChartMergeStats = { rowsAdded: 0, rowsUpdated: 0, duplicatesSkipped: 0 }
  const existingRows = (existing?.rows as VibrationRow[] | undefined) ?? []
  const incomingRows = (incoming.rows as VibrationRow[] | undefined) ?? []

  const byDate = new Map<string, VibrationRow>()
  for (const row of existingRows) {
    if (!row?.date) continue
    byDate.set(normalizeDate(row.date), { ...row, date: normalizeDate(row.date) })
  }

  const incomingByDate = new Map<string, VibrationRow>()
  for (const row of incomingRows) {
    if (!row?.date) continue
    const date = normalizeDate(row.date)
    if (incomingByDate.has(date)) stats.duplicatesSkipped++
    incomingByDate.set(date, { ...row, date })
  }

  for (const [date, row] of incomingByDate) {
    const prev = byDate.get(date)
    if (prev) {
      stats.rowsUpdated++
      byDate.set(date, {
        ...mergeNumericFields(prev, row, VIBRATION_FIELDS),
        id: prev.id || `vib-${date}`,
        date,
      })
    } else {
      stats.rowsAdded++
      byDate.set(date, { ...row, id: row.id || `vib-${date}`, date })
    }
  }

  const rows = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  const title =
    typeof incoming.title === 'string' && incoming.title.trim()
      ? incoming.title
      : typeof existing?.title === 'string'
        ? existing.title
        : ' Vibration Main Oil Pump-Stax'

  return { payload: { title, rows }, stats }
}

export function mergeCurrentPayload(
  existing: Record<string, unknown> | null,
  incoming: Record<string, unknown>,
): { payload: Record<string, unknown>; stats: PmChartMergeStats } {
  const stats: PmChartMergeStats = { rowsAdded: 0, rowsUpdated: 0, duplicatesSkipped: 0 }
  const existingPhases = (existing?.phases as CurrentPhase[] | undefined) ?? []
  const incomingPhases = (incoming.phases as CurrentPhase[] | undefined) ?? []

  const machine =
    typeof incoming.machine === 'string' && incoming.machine.trim()
      ? incoming.machine.trim()
      : typeof existing?.machine === 'string'
        ? existing.machine
        : 'Flour Mixer'

  const year =
    typeof incoming.year === 'number' && Number.isFinite(incoming.year)
      ? incoming.year
      : typeof existing?.year === 'number' && Number.isFinite(existing.year)
        ? existing.year
        : new Date().getFullYear()

  const byPhase = new Map<'R' | 'S' | 'T', CurrentPhase>()
  for (const phase of existingPhases) {
    if (phase?.phase) byPhase.set(phase.phase, { ...phase, values: { ...phase.values } })
  }

  for (const incomingPhase of incomingPhases) {
    if (!incomingPhase?.phase) continue
    const prev = byPhase.get(incomingPhase.phase)
    if (prev) {
      const { values, updated } = mergeSlotValues(prev.values ?? {}, incomingPhase.values ?? {})
      stats.rowsUpdated += updated
      stats.duplicatesSkipped += updated
      byPhase.set(incomingPhase.phase, {
        phase: incomingPhase.phase,
        yearAverage:
          incomingPhase.yearAverage != null && Number.isFinite(incomingPhase.yearAverage)
            ? incomingPhase.yearAverage
            : prev.yearAverage,
        values,
      })
    } else {
      stats.rowsAdded++
      byPhase.set(incomingPhase.phase, {
        phase: incomingPhase.phase,
        yearAverage: incomingPhase.yearAverage ?? null,
        values: { ...(incomingPhase.values ?? {}) },
      })
    }
  }

  const phases = (['R', 'S', 'T'] as const)
    .map((p) => byPhase.get(p))
    .filter((p): p is CurrentPhase => p != null)

  return { payload: { machine, year, phases }, stats }
}

export function mergeCombustionPayload(
  existing: Record<string, unknown> | null,
  incoming: Record<string, unknown>,
): { payload: Record<string, unknown>; stats: PmChartMergeStats } {
  const stats: PmChartMergeStats = { rowsAdded: 0, rowsUpdated: 0, duplicatesSkipped: 0 }
  const existingBlocks = (existing?.blocks as CombustionBlock[] | undefined) ?? []
  const incomingBlocks = (incoming.blocks as CombustionBlock[] | undefined) ?? []

  const year =
    typeof incoming.year === 'number' && Number.isFinite(incoming.year)
      ? incoming.year
      : typeof existing?.year === 'number' && Number.isFinite(existing.year)
        ? existing.year
        : new Date().getFullYear()

  const byPoint = new Map<string, CombustionBlock>()
  for (const block of existingBlocks) {
    if (!block?.point) continue
    byPoint.set(block.point, {
      point: block.point,
      rows: block.rows.map((r) => ({ parameter: r.parameter, values: { ...r.values } })),
    })
  }

  for (const incomingBlock of incomingBlocks) {
    if (!incomingBlock?.point) continue
    const prev = byPoint.get(incomingBlock.point)
    if (!prev) {
      stats.rowsAdded += incomingBlock.rows.length
      byPoint.set(incomingBlock.point, {
        point: incomingBlock.point,
        rows: incomingBlock.rows.map((r) => ({
          parameter: r.parameter,
          values: { ...(r.values ?? {}) },
        })),
      })
      continue
    }

    const byParam = new Map(prev.rows.map((r) => [r.parameter, r]))
    for (const row of incomingBlock.rows) {
      const prevRow = byParam.get(row.parameter)
      if (prevRow) {
        const { values, updated } = mergeSlotValues(prevRow.values ?? {}, row.values ?? {})
        stats.rowsUpdated += updated
        stats.duplicatesSkipped += updated
        byParam.set(row.parameter, { parameter: row.parameter, values })
      } else {
        stats.rowsAdded++
        byParam.set(row.parameter, { parameter: row.parameter, values: { ...(row.values ?? {}) } })
      }
    }
    byPoint.set(incomingBlock.point, { point: incomingBlock.point, rows: [...byParam.values()] })
  }

  return { payload: { blocks: [...byPoint.values()], year }, stats }
}

export function mergePmChartPayload(
  sheetKey: 'vibration' | 'current' | 'combustion',
  existing: Record<string, unknown> | null,
  incoming: Record<string, unknown>,
): { payload: Record<string, unknown>; stats: PmChartMergeStats } {
  switch (sheetKey) {
    case 'vibration':
      return mergeVibrationPayload(existing, incoming)
    case 'current':
      return mergeCurrentPayload(existing, incoming)
    case 'combustion':
      return mergeCombustionPayload(existing, incoming)
    default: {
      const _exhaustive: never = sheetKey
      return _exhaustive
    }
  }
}
