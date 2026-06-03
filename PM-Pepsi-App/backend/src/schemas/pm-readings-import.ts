import { z } from 'zod'

export const pmReadingBatchItemSchema = z.object({
  machine: z.string().min(1).max(128),
  pmlist: z.string().min(1).max(128),
  kind: z.enum(['current_3phase', 'vibration_3axis']),
  measuredAt: z.string().datetime().optional(),
  v1: z.number().finite(),
  v2: z.number().finite(),
  v3: z.number().finite(),
  warningLimit: z.number().finite().nullable().optional(),
  alarmLimit: z.number().finite().nullable().optional(),
})

export const pmReadingBatchBodySchema = z.object({
  wkorder: z.string().min(1).optional(),
  orderId: z.string().min(1).optional(),
  items: z.array(pmReadingBatchItemSchema).min(1).max(200),
})

export const pmReadingImportResultSchema = z.object({
  ok: z.literal(true),
  imported: z.number().int(),
  failed: z.number().int(),
  errors: z.array(
    z.object({
      rowNo: z.number().int(),
      wkorder: z.string(),
      message: z.string(),
    }),
  ),
})
