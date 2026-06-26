import type { Pool } from 'pg'
import type { z } from 'zod'
import { mergePmChartPayload, type PmChartMergeStats } from '../lib/pm-chart-design-merge.js'
import type { pmChartSheetKeySchema } from '../schemas/pm-chart-design.js'
import { resolveWorkOrderIdiw37 } from './work-orders.js'

type SheetKey = z.infer<typeof pmChartSheetKeySchema>

export function isPmChartDesignTableMissing(err: unknown): boolean {
  const message = err instanceof Error ? err.message : ''
  return message.includes('tbpm_chart_design') || message.includes('does not exist')
}

export function resolvePmChartScopeKey(scope?: string, wkorder?: string): string {
  const wo = wkorder?.trim()
  if (wo) return `wo:${wo}`
  const s = scope?.trim()
  return s && s.length > 0 ? s : 'default'
}

type SheetRow = {
  sheet_key: SheetKey
  scope_key: string
  wkorder: string
  payload: Record<string, unknown>
  updated_at: Date | null
  updated_by: string
}

export async function getPmChartSheet(
  pool: Pool,
  sheetKey: SheetKey,
  scopeKey: string,
): Promise<{
  sheetKey: SheetKey
  scopeKey: string
  wkorder: string
  payload: Record<string, unknown>
  updatedAt: string | null
  updatedBy: string
} | null> {
  const r = await pool.query<SheetRow>(
    `SELECT sheet_key, scope_key, wkorder, payload, updated_at, updated_by
     FROM app.tbpm_chart_design
     WHERE sheet_key = $1 AND scope_key = $2`,
    [sheetKey, scopeKey],
  )
  const row = r.rows[0]
  if (!row) return null
  return {
    sheetKey: row.sheet_key,
    scopeKey: row.scope_key,
    wkorder: row.wkorder?.trim() ?? '',
    payload: row.payload ?? {},
    updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
    updatedBy: row.updated_by?.trim() ?? '',
  }
}

export async function savePmChartSheet(
  pool: Pool,
  sheetKey: SheetKey,
  scopeKey: string,
  payload: Record<string, unknown>,
  actor: string,
  wkorderInput?: string,
): Promise<{
  sheetKey: SheetKey
  scopeKey: string
  wkorder: string
  payload: Record<string, unknown>
  updatedAt: string
  updatedBy: string
}> {
  const wkorder = wkorderInput?.trim() ?? ''
  let idiw37: number | null = null
  if (wkorder) {
    idiw37 = await resolveWorkOrderIdiw37(pool, wkorder)
  }

  const payloadToSave =
    sheetKey === 'vibration' ? mergePmChartPayload('vibration', null, payload).payload : payload

  const r = await pool.query<SheetRow>(
    `INSERT INTO app.tbpm_chart_design (
       sheet_key, scope_key, idiw37, wkorder, payload, wkctr, updated_by, updated_at
     ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, now())
     ON CONFLICT (sheet_key, scope_key) DO UPDATE SET
       idiw37 = EXCLUDED.idiw37,
       wkorder = EXCLUDED.wkorder,
       payload = EXCLUDED.payload,
       wkctr = EXCLUDED.wkctr,
       updated_by = EXCLUDED.updated_by,
       updated_at = now()
     RETURNING sheet_key, scope_key, wkorder, payload, updated_at, updated_by`,
    [sheetKey, scopeKey, idiw37, wkorder, JSON.stringify(payloadToSave), actor, actor],
  )
  const row = r.rows[0]
  if (!row) throw new Error('save_pm_chart_failed')
  return {
    sheetKey: row.sheet_key,
    scopeKey: row.scope_key,
    wkorder: row.wkorder?.trim() ?? '',
    payload: row.payload ?? {},
    updatedAt: row.updated_at!.toISOString(),
    updatedBy: row.updated_by?.trim() ?? '',
  }
}

export async function loadAllPmChartSheets(
  pool: Pool,
  scopeKey: string,
): Promise<Partial<Record<SheetKey, Record<string, unknown>>>> {
  const r = await pool.query<{ sheet_key: SheetKey; payload: Record<string, unknown> }>(
    `SELECT sheet_key, payload FROM app.tbpm_chart_design WHERE scope_key = $1`,
    [scopeKey],
  )
  const out: Partial<Record<SheetKey, Record<string, unknown>>> = {}
  for (const row of r.rows) {
    out[row.sheet_key] = row.payload ?? {}
  }
  return out
}

export async function importPmChartDesignSheets(
  pool: Pool,
  sheets: Partial<Record<SheetKey, Record<string, unknown> | null>>,
  actor: string,
  wkorderInput?: string,
): Promise<{
  scopeKey: string
  wkorder: string
  imported: SheetKey[]
  mergeStats: Partial<Record<SheetKey, PmChartMergeStats>>
}> {
  const scopeKey = resolvePmChartScopeKey(undefined, wkorderInput)
  const imported: SheetKey[] = []
  const mergeStats: Partial<Record<SheetKey, PmChartMergeStats>> = {}
  const keys: SheetKey[] = ['vibration', 'current', 'combustion']
  for (const key of keys) {
    const payload = sheets[key]
    if (!payload) continue
    const existing = await getPmChartSheet(pool, key, scopeKey)
    const { payload: merged, stats } = mergePmChartPayload(key, existing?.payload ?? null, payload)
    await savePmChartSheet(pool, key, scopeKey, merged, actor, wkorderInput)
    imported.push(key)
    mergeStats[key] = stats
  }
  return { scopeKey, wkorder: wkorderInput?.trim() ?? '', imported, mergeStats }
}
