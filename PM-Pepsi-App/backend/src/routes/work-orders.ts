import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import {
  workOrderDetailSchema,
  workOrdersResponseSchema,
} from '../schemas/work-orders.js'
import { enrichWorkOrderDetail, listWorkOrders } from '../services/work-orders.js'

const listQuerySchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
})

export function registerWorkOrderRoutes(
  app: Express,
  pool: Pool,
  sessionSecret: string,
) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get(
    '/api/v1/work-orders',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = listQuerySchema.safeParse(req.query)
      const opts = parsed.success ? parsed.data : {}
      try {
        const items = await listWorkOrders(pool, opts)
        res.json(workOrdersResponseSchema.parse({ items }))
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        if (message.includes('tbiw37n')) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run database/migrations/004_tbiw37n_calendar.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.get(
    '/api/v1/work-orders/:id',
    requireAuth,
    async (req: Request, res: Response) => {
      const id = String(req.params.id ?? '')
      try {
        const item = await enrichWorkOrderDetail(pool, id)
        if (!item) {
          res.status(404).json({ error: 'NOT_FOUND', message: 'Work order not found' })
          return
        }
        res.json(workOrderDetailSchema.parse({ item }))
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        if (message.includes('tbiw37n')) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run database/migrations/004_tbiw37n_calendar.sql',
          })
          return
        }
        throw err
      }
    },
  )
}
