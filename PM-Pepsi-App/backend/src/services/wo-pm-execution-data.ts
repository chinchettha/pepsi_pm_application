import type { Pool } from 'pg'
import {
  inferPmMeasurementKind,
  pmMeasurementMeta,
  type PmMeasurementKind,
} from '../lib/pm-measurement-kind.js'

export type WoPmReadingRow = {
  idreading: number
  machine: string
  pmlist: string
  kind: 'current_3phase' | 'vibration_3axis'
  measuredAt: string
  v1: number
  v2: number
  v3: number
  unit: string
  warningLimit: number | null
  alarmLimit: number | null
  wkctr: string
}

export type WoPmExecutionPayload = {
  note: string
  noteUpdatedAt: string | null
  noteWkctr: string
  canEdit: boolean
  readings: WoPmReadingRow[]
}

type ReadingDbRow = {
  idreading: string
  machine: string
  pmlist: string
  kind: string
  measured_at: Date
  v1: string
  v2: string
  v3: string
  unit: string
  warning_limit: string | null
  alarm_limit: string | null
  wkctr: string
}

type NoteDbRow = {
  note: string
  wkctr: string
  updated_at: Date
}

function mapReading(r: ReadingDbRow): WoPmReadingRow {
  return {
    idreading: Number(r.idreading),
    machine: r.machine?.trim() ?? '',
    pmlist: r.pmlist?.trim() ?? '',
    kind: r.kind as WoPmReadingRow['kind'],
    measuredAt: r.measured_at.toISOString(),
    v1: Number(r.v1),
    v2: Number(r.v2),
    v3: Number(r.v3),
    unit: r.unit?.trim() ?? '',
    warningLimit: r.warning_limit != null ? Number(r.warning_limit) : null,
    alarmLimit: r.alarm_limit != null ? Number(r.alarm_limit) : null,
    wkctr: r.wkctr?.trim() ?? '',
  }
}

function isPmExecutionSchemaMissing(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.includes('tbwo_pm_note') || msg.includes('tbwo_pm_reading')
}

export async function loadWoPmExecution(
  pool: Pool,
  idiw37: number,
  canEdit: boolean,
): Promise<WoPmExecutionPayload> {
  try {
    return await loadWoPmExecutionInner(pool, idiw37, canEdit)
  } catch (err) {
    if (isPmExecutionSchemaMissing(err)) {
      return {
        note: '',
        noteUpdatedAt: null,
        noteWkctr: '',
        canEdit: false,
        readings: [],
      }
    }
    throw err
  }
}

async function loadWoPmExecutionInner(
  pool: Pool,
  idiw37: number,
  canEdit: boolean,
): Promise<WoPmExecutionPayload> {
  const noteR = await pool.query<NoteDbRow>(
    `SELECT note, wkctr, updated_at FROM app.tbwo_pm_note WHERE idiw37 = $1`,
    [idiw37],
  )
  const noteRow = noteR.rows[0]

  const readR = await pool.query<ReadingDbRow>(
    `SELECT idreading, machine, pmlist, kind, measured_at, v1, v2, v3, unit,
            warning_limit, alarm_limit, wkctr
     FROM app.tbwo_pm_reading
     WHERE idiw37 = $1
     ORDER BY measured_at ASC, idreading ASC`,
    [idiw37],
  )

  return {
    note: noteRow?.note?.trim() ?? '',
    noteUpdatedAt: noteRow?.updated_at ? noteRow.updated_at.toISOString() : null,
    noteWkctr: noteRow?.wkctr?.trim() ?? '',
    canEdit,
    readings: readR.rows.map(mapReading),
  }
}

export async function upsertWoPmNote(
  pool: Pool,
  idiw37: number,
  note: string,
  wkctr: string,
): Promise<WoPmExecutionPayload['noteUpdatedAt']> {
  const r = await pool.query<{ updated_at: Date }>(
    `INSERT INTO app.tbwo_pm_note (idiw37, note, wkctr, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (idiw37) DO UPDATE
       SET note = EXCLUDED.note, wkctr = EXCLUDED.wkctr, updated_at = now()
     RETURNING updated_at`,
    [idiw37, note.trim(), wkctr.trim()],
  )
  return r.rows[0]?.updated_at?.toISOString() ?? new Date().toISOString()
}

export async function createWoPmReading(
  pool: Pool,
  input: {
    idiw37: number
    machine: string
    pmlist: string
    kind: 'current_3phase' | 'vibration_3axis'
    measuredAt?: string
    v1: number
    v2: number
    v3: number
    warningLimit?: number | null
    alarmLimit?: number | null
    wkctr: string
  },
): Promise<WoPmReadingRow> {
  const meta = pmMeasurementMeta(input.kind)
  const measuredAt = input.measuredAt?.trim()
    ? new Date(input.measuredAt)
    : new Date()
  if (Number.isNaN(measuredAt.getTime())) {
    throw new Error('INVALID_MEASURED_AT')
  }

  const r = await pool.query<ReadingDbRow>(
    `INSERT INTO app.tbwo_pm_reading
       (idiw37, machine, pmlist, kind, measured_at, v1, v2, v3, unit,
        warning_limit, alarm_limit, wkctr)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING idreading, machine, pmlist, kind, measured_at, v1, v2, v3, unit,
               warning_limit, alarm_limit, wkctr`,
    [
      input.idiw37,
      input.machine.trim(),
      input.pmlist.trim(),
      input.kind,
      measuredAt,
      input.v1,
      input.v2,
      input.v3,
      meta?.unit ?? '',
      input.warningLimit ?? null,
      input.alarmLimit ?? null,
      input.wkctr.trim(),
    ],
  )
  return mapReading(r.rows[0]!)
}

export function buildTaskMeasurementFields(input: {
  pmlist?: string | null
  mpoint?: string | null
  ment?: string | null
}): {
  measurementKind: PmMeasurementKind
  mpoint: string
  measurementTitle: string
  axisLabels: [string, string, string]
  unit: string
} {
  const kind = inferPmMeasurementKind(input)
  const meta = pmMeasurementMeta(kind)
  return {
    measurementKind: kind,
    mpoint: (input.mpoint ?? '').trim(),
    measurementTitle: meta?.title ?? '',
    axisLabels: meta?.labels ?? ['ค่า 1', 'ค่า 2', 'ค่า 3'],
    unit: meta?.unit ?? '',
  }
}
