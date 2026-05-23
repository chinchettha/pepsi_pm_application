import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import { voidAudit, sanitizeAuditPayload } from '../lib/audit-mutation.js'
import { createRequirePermission } from '../middleware/require-permission.js'
import { calendarEventsResponseSchema } from '../schemas/calendar.js'
import {
  planningAssignBodySchema,
  planningAssignResponseSchema,
  planningResponseSchema,
} from '../schemas/planning.js'
import { listPlanCalendarEvents } from '../services/plan-calendar.js'
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
  const requireRead = createRequirePermission(pool, sessionSecret)('planning.read')
  const requireAssign = createRequirePermission(pool, sessionSecret)('planning.assign')

  app.get(
    '/api/v1/plan-calendar/events',
    ...requireRead,
    async (req: Request, res: Response) => {
      const idwkctr = req.authUser?.idwkctr
      if (!idwkctr) {
        res.status(401).json({ error: 'UNAUTHORIZED' })
        return
      }
      const now = new Date()
      const year = Math.min(
        2100,
        Math.max(1970, Number(req.query.year) || now.getFullYear()),
      )
      const month = Math.min(
        12,
        Math.max(1, Number(req.query.month) || now.getMonth() + 1),
      )
      try {
        const items = await listPlanCalendarEvents(pool, idwkctr, year, month)
        res.json(calendarEventsResponseSchema.parse({ items, year, month }))
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

  app.get(
    '/api/v1/planning/orders',
    ...requireRead,
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
    ...requireAssign,
    async (req: Request, res: Response) => {
      const user = req.authUser!
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
        voidAudit(pool, req, {
          action: 'planning.assign',
          resource: 'tbplangingwork',
          resourceId: String(parsed.data.idiw37),
          after: sanitizeAuditPayload(parsed.data),
        })
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
