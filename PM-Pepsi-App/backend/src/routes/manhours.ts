import type { Express, Response } from 'express'
import type { Pool } from 'pg'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import { manhoursSummaryResponseSchema } from '../schemas/manhours.js'
import { getManhoursWeeklySummary } from '../services/manhours.js'

function resolveIdwkctr(auth: {
  accountType: string
  idwkctr?: string
  memId?: string
}): string | null {
  if (auth.accountType === 'workcenter' && auth.idwkctr) return auth.idwkctr
  return null
}

export function registerManhoursRoutes(app: Express, pool: Pool, sessionSecret: string) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  app.get('/api/v1/manhours/summary', requireAuth, async (req, res: Response) => {
    const idwkctr = resolveIdwkctr(req.authUser!)
    if (!idwkctr) {
      res.json(manhoursSummaryResponseSchema.parse({ weeks: [] }))
      return
    }

    try {
      const weeks = await getManhoursWeeklySummary(pool, idwkctr)
      res.json(manhoursSummaryResponseSchema.parse({ weeks }))
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('tbmanhours')) {
        res.status(503).json({
          error: 'SCHEMA_NOT_READY',
          message: 'Run migration 010_tbmanhours.sql',
        })
        return
      }
      throw err
    }
  })
}
