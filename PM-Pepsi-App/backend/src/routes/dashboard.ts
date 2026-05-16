import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import { dashboardSummarySchema } from '../schemas/dashboard.js'
import { getDashboardSummary } from '../services/dashboard.js'

export function registerDashboardRoutes(
  app: Express,
  pool: Pool,
  sessionSecret: string,
) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get(
    '/api/v1/dashboard/summary',
    requireAuth,
    async (_req: Request, res: Response) => {
      try {
        const summary = await getDashboardSummary(pool)
        res.json(dashboardSummarySchema.parse(summary))
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        if (message.includes('tbiw37n')) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run migrations 004 and 006 on PostgreSQL',
          })
          return
        }
        throw err
      }
    },
  )
}
