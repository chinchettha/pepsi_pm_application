import type { Express, Response } from 'express'
import type { Pool } from 'pg'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import {
  reportsKpiResponseSchema,
  summaryWeeklyResponseSchema,
} from '../schemas/reports.js'
import { getReportsKpi, getSummaryWeekly } from '../services/reports.js'

function isSchemaMissing(err: unknown): boolean {
  const message = err instanceof Error ? err.message : ''
  return (
    message.includes('does not exist') ||
    message.includes('undefined table') ||
    message.includes('relation')
  )
}

export function registerReportsRoutes(app: Express, pool: Pool, sessionSecret: string) {
  const requireAuth = createRequireApiAuth(sessionSecret)
  const schemaHint =
    'Run migrations for tbmanhours, view_order, view_exportconfirm, view_confirmation'

  app.get('/api/v1/reports/kpi', requireAuth, async (req, res: Response) => {
    const weeksBack = Number(req.query.weeksBack ?? 8)
    const from = typeof req.query.from === 'string' ? req.query.from : undefined
    const to = typeof req.query.to === 'string' ? req.query.to : undefined
    try {
      const data = await getReportsKpi(pool, {
        fromInput: from,
        toInput: to,
        weeksBack: Number.isFinite(weeksBack) ? weeksBack : 8,
      })
      res.json(reportsKpiResponseSchema.parse(data))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      throw err
    }
  })

  app.get('/api/v1/reports/summary-weekly', requireAuth, async (req, res: Response) => {
    const weeksBack = Number(req.query.weeksBack ?? 8)
    const from = typeof req.query.from === 'string' ? req.query.from : undefined
    const to = typeof req.query.to === 'string' ? req.query.to : undefined
    try {
      const data = await getSummaryWeekly(pool, {
        fromInput: from,
        toInput: to,
        weeksBack: Number.isFinite(weeksBack) ? weeksBack : 8,
      })
      res.json(summaryWeeklyResponseSchema.parse(data))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      throw err
    }
  })
}
