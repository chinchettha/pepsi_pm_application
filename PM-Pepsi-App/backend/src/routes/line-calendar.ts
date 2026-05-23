import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { createRequirePermission } from '../middleware/require-permission.js'
import { lineCalendarEventsResponseSchema } from '../schemas/line-calendar.js'
import { listLineCalendarEvents } from '../services/line-calendar.js'

const querySchema = z.object({
  year: z.coerce.number().int().min(1970).max(2100),
  month: z.coerce.number().int().min(1).max(12),
})

export function registerLineCalendarRoutes(
  app: Express,
  pool: Pool,
  sessionSecret: string,
) {
  const requireRead = createRequirePermission(pool, sessionSecret)('calendar.read')

  app.get(
    '/api/v1/line-calendar/events',
    ...requireRead,
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
      const items = await listLineCalendarEvents(pool, year, month)
      res.json(lineCalendarEventsResponseSchema.parse({ items, year, month }))
    },
  )
}
