import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import multer from 'multer'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import {
  iw37nBatchesResponseSchema,
  iw37nImportResponseSchema,
} from '../schemas/iw37n.js'
import { importIw37nFile, listIw37nBatches } from '../services/iw37n.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
})

function isSchemaMissing(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return message.includes('tbiw37n_import_batch') || message.includes('tbiw37n')
}

export function registerIw37nRoutes(
  app: Express,
  pool: Pool,
  sessionSecret: string,
) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get(
    '/api/v1/iw37n/batches',
    requireAuth,
    async (_req: Request, res: Response) => {
      try {
        const items = await listIw37nBatches(pool)
        res.json(iw37nBatchesResponseSchema.parse({ items }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message:
              'Run migrations 004_tbiw37n_calendar.sql and 006_tbiw37n_import_batch.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.post(
    '/api/v1/iw37n/import',
    requireAuth,
    upload.single('file'),
    async (req: Request, res: Response) => {
      const file = req.file
      if (!file?.buffer?.length) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Multipart field "file" (.xls, .xlsx, .csv) is required',
        })
        return
      }

      const fileName = file.originalname || 'upload.xlsx'
      const lower = fileName.toLowerCase()
      if (
        !lower.endsWith('.xls') &&
        !lower.endsWith('.xlsx') &&
        !lower.endsWith('.csv')
      ) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Only .xls, .xlsx, or .csv files are allowed',
        })
        return
      }

      try {
        const batch = await importIw37nFile(pool, fileName, file.buffer)
        res.json(iw37nImportResponseSchema.parse({ batch }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message:
              'Run migrations 004_tbiw37n_calendar.sql and 006_tbiw37n_import_batch.sql',
          })
          return
        }
        const message = err instanceof Error ? err.message : 'Import failed'
        res.status(400).json({ error: 'IMPORT_FAILED', message })
      }
    },
  )
}
