import { fetchApi } from '@/lib/fetch-api'

export type PmChartSheetKey = 'vibration' | 'current' | 'combustion'

export const PM_CHART_SCOPE_KEY = 'default'

export type PmChartSheetResponse = {
  sheetKey: PmChartSheetKey
  scopeKey: string
  wkorder: string
  payload: Record<string, unknown>
  updatedAt: string | null
  updatedBy: string
}

export async function fetchPmChartSheet(
  sheetKey: PmChartSheetKey,
): Promise<PmChartSheetResponse> {
  const path = `/api/v1/pm-charts/${sheetKey}`
  const json = await fetchApi<PmChartSheetResponse>(path)
  return json
}

export async function savePmChartSheet(
  sheetKey: PmChartSheetKey,
  body: { payload: Record<string, unknown> },
): Promise<PmChartSheetResponse> {
  const json = await fetchApi<PmChartSheetResponse>(`/api/v1/pm-charts/${sheetKey}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scopeKey: PM_CHART_SCOPE_KEY, payload: body.payload }),
  })
  return json
}

export async function fetchPmChartDesignExportXlsx(): Promise<Blob> {
  const path = '/api/v1/pm-charts/export.xlsx'
  const res = await fetch(path, { credentials: 'include' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `Export failed (${res.status})`)
  }
  return res.blob()
}

export type PmChartMergeStats = {
  rowsAdded: number
  rowsUpdated: number
  duplicatesSkipped: number
}

export type PmChartImportResult = {
  ok: true
  scopeKey: string
  wkorder: string
  imported: PmChartSheetKey[]
  issues: string[]
  mergeStats?: Partial<Record<PmChartSheetKey, PmChartMergeStats>>
  savedAt?: string
}

export async function postPmChartDesignImport(file: File): Promise<PmChartImportResult> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/v1/pm-charts/import', {
    method: 'POST',
    credentials: 'include',
    body: fd,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `Import failed (${res.status})`)
  }
  return res.json() as Promise<PmChartImportResult>
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
