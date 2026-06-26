import { z } from 'zod'

export const pmChartSheetKeySchema = z.enum(['vibration', 'current', 'combustion'])

export const pmChartScopeQuerySchema = z.object({
  scope: z.string().trim().min(1).max(128).optional(),
  wkorder: z.string().trim().max(64).optional(),
})

export const pmChartSaveBodySchema = z.object({
  scopeKey: z.string().trim().min(1).max(128).default('default'),
  wkorder: z.string().trim().max(64).optional(),
  payload: z.record(z.string(), z.unknown()),
})

export const pmChartSheetResponseSchema = z.object({
  sheetKey: pmChartSheetKeySchema,
  scopeKey: z.string(),
  wkorder: z.string(),
  payload: z.record(z.string(), z.unknown()),
  updatedAt: z.string().nullable(),
  updatedBy: z.string(),
})

export const pmChartMergeStatsSchema = z.object({
  rowsAdded: z.number(),
  rowsUpdated: z.number(),
  duplicatesSkipped: z.number(),
})

export const pmChartImportResultSchema = z.object({
  ok: z.literal(true),
  scopeKey: z.string(),
  wkorder: z.string(),
  imported: z.array(pmChartSheetKeySchema),
  issues: z.array(z.string()),
  mergeStats: z.record(z.string(), pmChartMergeStatsSchema).optional(),
  savedAt: z.string().optional(),
})
