/**
 * สอดคล้อง frontend/src/api/schemas.ts
 */
import { z } from 'zod'

export const activityTypeItemSchema = z.object({
  id: z.string(),
  mat: z.string(),
  matdescrip: z.string(),
  matcheck: z.string(),
})

export const masterDataItemGenericSchema = z.object({
  id: z.string(),
  code: z.string(),
  nameTh: z.string(),
  plant: z.string(),
  active: z.boolean(),
})

export const masterDataResponseSchema = z.object({
  entity: z.string(),
  items: z.array(z.union([activityTypeItemSchema, masterDataItemGenericSchema])),
})

export const SUPPORTED_MASTER_ENTITIES = ['activitytype'] as const
export type SupportedMasterEntity = (typeof SUPPORTED_MASTER_ENTITIES)[number]

export function isSupportedMasterEntity(entity: string): entity is SupportedMasterEntity {
  return (SUPPORTED_MASTER_ENTITIES as readonly string[]).includes(entity)
}

export const activityTypeBodySchema = z.object({
  mat: z.string().min(1).max(64),
  matdescrip: z.string().max(2000).optional().default(''),
  matcheck: z.string().max(64).optional().default(''),
})

export const activityTypeImportBodySchema = z.object({
  rows: z.array(activityTypeBodySchema).min(1).max(500),
})

export const activityTypeImportResultSchema = z.object({
  inserted: z.number(),
  updated: z.number(),
  skipped: z.number(),
})

export const activityTypePatchSchema = z.object({
  matdescrip: z.string().max(2000).optional(),
  matcheck: z.string().max(64).optional(),
})
