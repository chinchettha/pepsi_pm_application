import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import {
  movePlanReasonsResponseSchema,
  movePlanRequestSchema,
  movePlanResponseSchema,
  workOrderSuggestionsResponseSchema,
} from '../schemas/scheduling.js'
import {
  listMovePlanReasons,
  moveWorkOrderPlan,
  MovePlanError,
  searchWorkOrderSuggestions,
} from '../services/scheduling-move.js'

const suggestionsQuerySchema = z.object({
  q: z.string().min(1),
})

export function registerSchedulingRoutes(
  app: Express,
  pool: Pool,
  sessionSecret: string,
) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get(
    '/api/v1/scheduling/move-reasons',
    requireAuth,
    async (_req: Request, res: Response) => {
      try {
        const items = await listMovePlanReasons(pool)
        res.json(movePlanReasonsResponseSchema.parse({ items }))
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        if (message.includes('tbreason')) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run database/migrations/009_tbreason.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.post(
    '/api/v1/scheduling/move-plan',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = movePlanRequestSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION', message: parsed.error.message })
        return
      }
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED' })
        return
      }

      try {
        const result = await moveWorkOrderPlan(pool, {
          ...parsed.data,
          mwkctr: user.wkctr || user.idwkctr,
        })
        res.json(
          movePlanResponseSchema.parse({
            ok: true,
            message: 'Move Plan Success',
            mpcount: result.mpcount,
          }),
        )
      } catch (err) {
        if (err instanceof MovePlanError) {
          const status =
            err.code === 'NOT_FOUND' ? 404 : err.code === 'STATUS_NOT_MOVABLE' ? 409 : 400
          res.status(status).json({ error: err.code, message: err.message })
          return
        }
        throw err
      }
    },
  )

  app.get(
    '/api/v1/work-orders/suggestions',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = suggestionsQuerySchema.safeParse(req.query)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION', message: 'q is required' })
        return
      }
      const items = await searchWorkOrderSuggestions(pool, parsed.data.q)
      res.json(workOrderSuggestionsResponseSchema.parse({ items }))
    },
  )
}
