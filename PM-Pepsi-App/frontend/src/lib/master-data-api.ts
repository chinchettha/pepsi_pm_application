import type { ActivityTypeItem } from '@/api/schemas'
import { fetchApi } from '@/lib/fetch-api'
import { z } from 'zod'

const activityTypeItemSchema = z.object({
  id: z.string(),
  mat: z.string(),
  matdescrip: z.string(),
  matcheck: z.string(),
})

const importResultSchema = z.object({
  inserted: z.number(),
  updated: z.number(),
  skipped: z.number(),
})

export type ActivityTypeInput = {
  mat: string
  matdescrip?: string
  matcheck?: string
}

export async function createActivityType(body: ActivityTypeInput) {
  const json = await fetchApi<unknown>('/api/v1/master-data/activitytype', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return activityTypeItemSchema.parse(
    (json as { item: unknown }).item,
  ) as ActivityTypeItem
}

export async function updateActivityType(
  mat: string,
  body: { matdescrip?: string; matcheck?: string },
) {
  const json = await fetchApi<unknown>(
    `/api/v1/master-data/activitytype/${encodeURIComponent(mat)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
  return activityTypeItemSchema.parse(
    (json as { item: unknown }).item,
  ) as ActivityTypeItem
}

export async function deleteActivityType(mat: string) {
  await fetchApi<unknown>(
    `/api/v1/master-data/activitytype/${encodeURIComponent(mat)}`,
    { method: 'DELETE' },
  )
}

export async function importActivityTypes(rows: ActivityTypeInput[]) {
  const json = await fetchApi<unknown>('/api/v1/master-data/activitytype/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows }),
  })
  return importResultSchema.parse(json)
}

/** แปลงข้อความ CSV (mat,description,check) แบบ M_activitytype import */
export function parseActivityTypeCsv(text: string): ActivityTypeInput[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const rows: ActivityTypeInput[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (i === 0 && /^mat\b/i.test(line)) continue
    const parts = line.split(/[,;\t]/).map((p) => p.trim().replace(/^"|"$/g, ''))
    if (!parts[0]) continue
    rows.push({
      mat: parts[0],
      matdescrip: parts[1] ?? '',
      matcheck: parts[2] ?? '',
    })
  }
  return rows
}
