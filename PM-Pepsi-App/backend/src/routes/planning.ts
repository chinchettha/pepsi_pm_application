import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import {
  planningAssignBodySchema,
  planningAssignResponseSchema,
  planningResponseSchema,
} from '../schemas/planning.js'
import { assignPlanningWork, listPlanningForUser } from '../services/planning.js'

function isSchemaMissing(err: unknown): boolean {
  const message = err instanceof Error ? err.message : ''
  return (
    message.includes('view_planwork') ||
    message.includes('tbplangingwork') ||
    message.includes('tbiw37n')
  )
}

export function registerPlanningRoutes(
  app: Express,
  pool: Pool,
  sessionSecret: string,
) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get(
    '/api/v1/planning/orders',
    requireAuth,
    async (req: Request, res: Response) => {
      const idwkctr = req.authUser?.idwkctr
      if (!idwkctr) {
        res.status(401).json({ error: 'UNAUTHORIZED' })
        return
      }
      const status = req.query.status === 'closed' ? 'closed' : 'open'
      try {
        const items = await listPlanningForUser(pool, idwkctr, status)
        res.json(planningResponseSchema.parse({ items }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run database/migrations/007_tbplangingwork_view_planwork.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.post(
    '/api/v1/planning/assign',
    requireAuth,
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED' })
        return
      }
      if ((user.userst ?? '').trim() !== 'A') {
        res.status(403).json({ error: 'FORBIDDEN', message: 'Admin only (M_planwork_view_form)' })
        return
      }
      const parsed = planningAssignBodySchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid body',
          issues: parsed.error.issues,
        })
        return
      }
      const actorWkctr = (user.wkctr || user.username || user.idwkctr || '').trim()
      try {
        const ok = await assignPlanningWork(pool, parsed.data, actorWkctr)
        if (!ok) {
          res.status(404).json({
            error: 'NOT_FOUND',
            message: 'WO not found or not in CRTD/REL',
          })
          return
        }
        res.json(planningAssignResponseSchema.parse({ ok: true }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run database/migrations/007_tbplangingwork_view_planwork.sql',
          })
          return
        }
        throw err
      }
    },
  )
}
