import { z } from 'zod'

export const iw37nBatchItemSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  importedAt: z.string(),
  rows: z.number(),
  sha256: z.string(),
  status: z.enum(['OK', 'PARTIAL', 'ERR']),
})

export const iw37nBatchesResponseSchema = z.object({
  items: z.array(iw37nBatchItemSchema),
})

export const iw37nImportResponseSchema = z.object({
  batch: iw37nBatchItemSchema,
})
