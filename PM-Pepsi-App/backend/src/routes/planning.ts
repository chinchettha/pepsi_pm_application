import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import { planningResponseSchema } from '../schemas/planning.js'
import { listPlanningForUser } from '../services/planning.js'

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
      try {
        const items = await listPlanningForUser(pool, idwkctr)
        res.json(planningResponseSchema.parse({ items }))
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        if (message.includes('view_planwork') || message.includes('tbplangingwork')) {
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
