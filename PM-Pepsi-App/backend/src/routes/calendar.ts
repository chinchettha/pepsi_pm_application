import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import {
  calendarEventsResponseSchema,
  calendarFilterOptionsResponseSchema,
  calendarSearchBodySchema,
} from '../schemas/calendar.js'
import {
  listCalendarEvents,
  listCalendarEventsFiltered,
  listCalendarFilterOptions,
} from '../services/calendar.js'

const querySchema = z.object({
  year: z.coerce.number().int().min(1970).max(2100),
  month: z.coerce.number().int().min(1).max(12),
})

function isSchemaMissing(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return (
    message.includes('view_confrim') ||
    message.includes('view_order') ||
    message.includes('tbiw37n') ||
    message.includes('tbwkstatus') ||
    message.includes('tbactivitytype') ||
    message.includes('tbwkzb') ||
    message.includes('tbworkcenter') ||
    message.includes('tbfunctional')
  )
}

export function registerCalendarRoutes(
  app: Express,
  pool: Pool,
  sessionSecret: string,
) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get(
    '/api/v1/calendar/filter-options',
    requireAuth,
    async (_req: Request, res: Response) => {
      try {
        const data = await listCalendarFilterOptions(pool)
        res.json(calendarFilterOptionsResponseSchema.parse(data))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message:
              'Run migrations 002_tbactivitytype.sql, 004_tbiw37n_calendar.sql, 005_tbwkzb_tbfunctional.sql (and 001_init_auth_tables.sql for tbworkcenter)',
          })
          return
        }
        throw err
      }
    },
  )

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

  app.post(
    '/api/v1/calendar/events',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = calendarSearchBodySchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid calendar search body',
          issues: parsed.error.issues,
        })
        return
      }
      const body = parsed.data
      try {
        const items = await listCalendarEventsFiltered(pool, body)
        res.json(calendarEventsResponseSchema.parse({ items, year: body.year, month: body.month }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message:
              'Run migrations 004_tbiw37n_calendar.sql (and dependencies for filter options if used)',
          })
          return
        }
        throw err
      }
    },
  )
}
