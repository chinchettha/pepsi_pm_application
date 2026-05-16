import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import { calendarEventsResponseSchema } from '../schemas/calendar.js'
import { listCalendarEvents } from '../services/calendar.js'

const querySchema = z.object({
  year: z.coerce.number().int().min(1970).max(2100),
  month: z.coerce.number().int().min(1).max(12),
})

export function registerCalendarRoutes(
  app: Express,
  pool: Pool,
  sessionSecret: string,
) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get(
    '/api/v1/calendar/events',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = querySchema.safeParse(req.query)
      if (!parsed.success) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'year and month query params required',
        })
        return
      }
      const { year, month } = parsed.data
      try {
        const items = await listCalendarEvents(pool, year, month)
        res.json(calendarEventsResponseSchema.parse({ items, year, month }))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'query failed'
        if (message.includes('view_order') || message.includes('tbiw37n')) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message:
              'Run database/migrations/004_tbiw37n_calendar.sql on PostgreSQL',
          })
          return
        }
        throw err
      }
    },
  )
}
