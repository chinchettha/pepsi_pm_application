import { z } from 'zod'

export const pmMeasurementKindSchema = z.enum([
  'current_3phase',
  'vibration_3axis',
  'none',
])

export const woPmReadingSchema = z.object({
  idreading: z.number().int(),
  machine: z.string(),
  pmlist: z.string(),
  kind: z.enum(['current_3phase', 'vibration_3axis']),
  measuredAt: z.string(),
  v1: z.number(),
  v2: z.number(),
  v3: z.number(),
  unit: z.string(),
  warningLimit: z.number().nullable(),
  alarmLimit: z.number().nullable(),
  wkctr: z.string(),
})

export const woPmExecutionSchema = z.object({
  note: z.string(),
  noteUpdatedAt: z.string().nullable(),
  noteWkctr: z.string(),
  canEdit: z.boolean(),
  readings: z.array(woPmReadingSchema),
})

export const woPmNoteBodySchema = z.object({
  note: z.string().max(4000),
})

export const woPmNoteResponseSchema = z.object({
  ok: z.literal(true),
  noteUpdatedAt: z.string(),
})

export const woPmReadingBodySchema = z.object({
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

export const woPmReadingResponseSchema = z.object({
  item: woPmReadingSchema,
})
