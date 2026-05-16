import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import {
  activityTypeBodySchema,
  activityTypeImportBodySchema,
  activityTypeImportResultSchema,
  activityTypePatchSchema,
  activityTypeItemSchema,
  isSupportedMasterEntity,
  masterDataResponseSchema,
} from '../schemas/master-data.js'
import {
  createActivityType,
  deleteActivityType,
  importActivityTypes,
  listActivityTypes,
  updateActivityType,
} from '../services/master-data.js'

export function registerMasterDataRoutes(
  app: Express,
  pool: Pool,
  sessionSecret: string,
) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get('/api/v1/master-data/:entity', requireAuth, async (req: Request, res: Response) => {
    const entity = String(req.params.entity ?? '').toLowerCase()

    if (!isSupportedMasterEntity(entity)) {
      res.status(501).json({
        error: 'NOT_IMPLEMENTED',
        message: `Master entity "${entity}" ยังไม่มีตารางใน PostgreSQL — รองรับ: activitytype`,
      })
      return
    }

    const items =
      entity === 'activitytype' ? await listActivityTypes(pool) : []

    res.json(masterDataResponseSchema.parse({ entity, items }))
  })

  app.post(
    '/api/v1/master-data/activitytype',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = activityTypeBodySchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', issues: parsed.error.issues })
        return
      }
      try {
        const item = await createActivityType(pool, parsed.data)
        res.status(201).json({ item: activityTypeItemSchema.parse(item) })
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        if (message.includes('duplicate key') || message.includes('unique')) {
          res.status(409).json({ error: 'CONFLICT', message: 'mat already exists' })
          return
        }
        throw err
      }
    },
  )

  app.put(
    '/api/v1/master-data/activitytype/:mat',
    requireAuth,
    async (req: Request, res: Response) => {
      const mat = String(req.params.mat ?? '')
      const parsed = activityTypePatchSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', issues: parsed.error.issues })
        return
      }
      const item = await updateActivityType(pool, mat, parsed.data)
      if (!item) {
        res.status(404).json({ error: 'NOT_FOUND' })
        return
      }
      res.json({ item: activityTypeItemSchema.parse(item) })
    },
  )

  app.delete(
    '/api/v1/master-data/activitytype/:mat',
    requireAuth,
    async (req: Request, res: Response) => {
      const mat = String(req.params.mat ?? '')
      const ok = await deleteActivityType(pool, mat)
      if (!ok) {
        res.status(404).json({ error: 'NOT_FOUND' })
        return
      }
      res.status(204).send()
    },
  )

  app.post(
    '/api/v1/master-data/activitytype/import',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = activityTypeImportBodySchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', issues: parsed.error.issues })
        return
      }
      const result = await importActivityTypes(pool, parsed.data.rows)
      res.json(activityTypeImportResultSchema.parse(result))
    },
  )
}
