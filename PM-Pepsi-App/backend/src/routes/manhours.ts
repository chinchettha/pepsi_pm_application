import type { Express, Request, Response } from 'express'
import multer from 'multer'
import type { Pool } from 'pg'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import {
  manhourChartBreakdownResponseSchema,
  manhourChartPerformanceResponseSchema,
  manhourImportResponseSchema,
  manhourItemSchema,
  manhourListResponseSchema,
  manhourOkResponseSchema,
  manhourUpsertBodySchema,
  manhoursSummaryResponseSchema,
  worktimeMeResponseSchema,
  worktimePlanningResponseSchema,
} from '../schemas/manhours.js'
import {
  getManhourChartBreakdown,
  getManhourChartPerformance,
  resolveManhourChartRange,
} from '../services/manhour-chart.js'
import {
  deleteManhour,
  getManhour,
  getManhoursWeeklySummary,
  getWorktimeTotal,
  importManhoursFile,
  listManhours,
  listWorktimeDaily,
  upsertManhour,
} from '../services/manhours.js'
import { listWorktimePlanningAssignments } from '../services/worktime-planning.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
})

function isSchemaMissing(err: unknown): boolean {
  const message = err instanceof Error ? err.message : ''
  return (
    message.includes('tbmanhours') ||
    message.includes('stworkday') ||
    message.includes('uq_tbmanhours_wkctr_period') ||
    message.includes('does not exist') ||
    message.includes('undefined table') ||
    message.includes('relation')
  )
}

function isAdmin(req: Request): boolean {
  return (req.authUser?.userst ?? '').trim() === 'A'
}

function requireAdmin(req: Request, res: Response): boolean {
  if (!isAdmin(req)) {
    res.status(403).json({ error: 'FORBIDDEN' })
    return false
  }
  return true
}

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
  const schemaHint = 'Run migrations 010_tbmanhours.sql and 042_tbmanhours_full_api.sql'

  function resolveChartIdwkctr(req: Request): string | null {
    const requested = typeof req.query.idwkctr === 'string' ? req.query.idwkctr.trim() : ''
    if (isAdmin(req) && requested) return requested
    return resolveIdwkctr(req.authUser!)
  }

  app.get('/api/v1/manhours/chart/performance', requireAuth, async (req, res: Response) => {
    const idwkctr = resolveChartIdwkctr(req)
    if (!idwkctr) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Workcenter session required' })
      return
    }
    const range = resolveManhourChartRange(
      typeof req.query.from === 'string' ? req.query.from : undefined,
      typeof req.query.to === 'string' ? req.query.to : undefined,
    )
    try {
      const data = await getManhourChartPerformance(pool, idwkctr, range)
      if (!data) {
        res.status(404).json({ error: 'NOT_FOUND' })
        return
      }
      res.json(manhourChartPerformanceResponseSchema.parse(data))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      throw err
    }
  })

  app.get('/api/v1/manhours/chart/breakdown', requireAuth, async (req, res: Response) => {
    const idwkctr = resolveChartIdwkctr(req)
    if (!idwkctr) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Workcenter session required' })
      return
    }
    const range = resolveManhourChartRange(
      typeof req.query.from === 'string' ? req.query.from : undefined,
      typeof req.query.to === 'string' ? req.query.to : undefined,
    )
    try {
      const data = await getManhourChartBreakdown(pool, idwkctr, range)
      if (!data) {
        res.status(404).json({ error: 'NOT_FOUND' })
        return
      }
      res.json(manhourChartBreakdownResponseSchema.parse(data))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      throw err
    }
  })

  app.get('/api/v1/manhours/summary', requireAuth, async (req, res: Response) => {
    const requestedId = typeof req.query.idwkctr === 'string' ? req.query.idwkctr.trim() : ''
    const idwkctr = isAdmin(req) && requestedId ? requestedId : resolveIdwkctr(req.authUser!)
    if (!idwkctr) {
      res.json(manhoursSummaryResponseSchema.parse({ weeks: [] }))
      return
    }
    const daysBack = Number(req.query.daysBack ?? 56)

    try {
      const weeks = await getManhoursWeeklySummary(
        pool,
        idwkctr,
        Number.isFinite(daysBack) ? daysBack : 56,
      )
      res.json(manhoursSummaryResponseSchema.parse({ weeks }))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      throw err
    }
  })

  app.get('/api/v1/manhours/hr', requireAuth, async (req, res: Response) => {
    const sessionWkctr = (req.authUser?.wkctr ?? '').trim()
    const wkctr =
      isAdmin(req) && typeof req.query.wkctr === 'string' && req.query.wkctr.trim()
        ? req.query.wkctr.trim()
        : sessionWkctr
    if (!wkctr) {
      res.json(manhourListResponseSchema.parse({ items: [], totalRows: 0 }))
      return
    }
    try {
      const data = await listManhours(pool, {
        q: typeof req.query.q === 'string' ? req.query.q : undefined,
        filterWkctr: wkctr,
        from: typeof req.query.from === 'string' ? req.query.from : undefined,
        to: typeof req.query.to === 'string' ? req.query.to : undefined,
        limit: Number(req.query.limit ?? 500),
        offset: Number(req.query.offset ?? 0),
      })
      res.json(manhourListResponseSchema.parse(data))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      throw err
    }
  })

  app.get('/api/v1/manhours', requireAuth, async (req, res: Response) => {
    const ownId = resolveIdwkctr(req.authUser!)
    const idwkctr =
      isAdmin(req) && typeof req.query.idwkctr === 'string'
        ? req.query.idwkctr.trim()
        : (ownId ?? '')
    try {
      const data = await listManhours(pool, {
        q: typeof req.query.q === 'string' ? req.query.q : undefined,
        idwkctr: idwkctr || undefined,
        from: typeof req.query.from === 'string' ? req.query.from : undefined,
        to: typeof req.query.to === 'string' ? req.query.to : undefined,
        limit: Number(req.query.limit ?? 200),
        offset: Number(req.query.offset ?? 0),
      })
      res.json(manhourListResponseSchema.parse(data))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      throw err
    }
  })

  app.get('/api/v1/manhours/:idmanhour', requireAuth, async (req, res: Response) => {
    const id = Number(req.params.idmanhour)
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idmanhour' })
      return
    }
    try {
      const item = await getManhour(pool, id)
      if (!item) {
        res.status(404).json({ error: 'NOT_FOUND' })
        return
      }
      if (!isAdmin(req) && item.idwkctr !== resolveIdwkctr(req.authUser!)) {
        res.status(403).json({ error: 'FORBIDDEN' })
        return
      }
      res.json(manhourItemSchema.parse(item))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      throw err
    }
  })

  app.post('/api/v1/manhours', requireAuth, async (req, res: Response) => {
    if (!requireAdmin(req, res)) return
    const parsed = manhourUpsertBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: parsed.error.message })
      return
    }
    try {
      const out = await upsertManhour(pool, parsed.data)
      res.json(manhourOkResponseSchema.parse({ ok: true, idmanhour: out.idmanhour }))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      res.status(400).json({ error: 'MANHOUR_ERROR', message: err instanceof Error ? err.message : String(err) })
    }
  })

  app.put('/api/v1/manhours/:idmanhour', requireAuth, async (req, res: Response) => {
    if (!requireAdmin(req, res)) return
    const id = Number(req.params.idmanhour)
    const parsed = manhourUpsertBodySchema.safeParse(req.body)
    if (!Number.isInteger(id) || id <= 0 || !parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: parsed.success ? 'Invalid idmanhour' : parsed.error.message })
      return
    }
    try {
      const out = await upsertManhour(pool, parsed.data, id)
      res.json(manhourOkResponseSchema.parse({ ok: true, idmanhour: out.idmanhour }))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      if (err instanceof Error && err.message === 'NOT_FOUND') {
        res.status(404).json({ error: 'NOT_FOUND' })
        return
      }
      res.status(400).json({ error: 'MANHOUR_ERROR', message: err instanceof Error ? err.message : String(err) })
    }
  })

  app.delete('/api/v1/manhours/:idmanhour', requireAuth, async (req, res: Response) => {
    if (!requireAdmin(req, res)) return
    const id = Number(req.params.idmanhour)
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idmanhour' })
      return
    }
    try {
      const ok = await deleteManhour(pool, id)
      if (!ok) {
        res.status(404).json({ error: 'NOT_FOUND' })
        return
      }
      res.json(manhourOkResponseSchema.parse({ ok: true, idmanhour: id }))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      throw err
    }
  })

  app.post('/api/v1/manhours/import', requireAuth, upload.single('file'), async (req, res: Response) => {
    if (!requireAdmin(req, res)) return
    if (!req.file) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'file is required' })
      return
    }
    try {
      const result = await importManhoursFile(pool, {
        fileName: req.file.originalname,
        buffer: req.file.buffer,
      })
      res.json(manhourImportResponseSchema.parse(result))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      res.status(400).json({ error: 'IMPORT_ERROR', message: err instanceof Error ? err.message : String(err) })
    }
  })

  app.get('/api/v1/worktime/planning', requireAuth, async (req, res: Response) => {
    const requested = typeof req.query.idwkctr === 'string' ? req.query.idwkctr.trim() : ''
    const idwkctr =
      isAdmin(req) && requested ? requested : resolveIdwkctr(req.authUser!)
    if (!idwkctr) {
      res.json(worktimePlanningResponseSchema.parse({ idwkctr: '', items: [] }))
      return
    }
    try {
      const items = await listWorktimePlanningAssignments(pool, idwkctr, {
        limit: Number(req.query.limit ?? 500),
      })
      res.json(worktimePlanningResponseSchema.parse({ idwkctr, items }))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      const msg = err instanceof Error ? err.message : ''
      if (
        msg.includes('tbplangingwork') ||
        msg.includes('tbiw37n') ||
        msg.includes('does not exist') ||
        msg.includes('relation')
      ) {
        res.status(503).json({
          error: 'SCHEMA_NOT_READY',
          message: 'Run database/migrations/007_tbplangingwork_view_planwork.sql',
        })
        return
      }
      throw err
    }
  })

  app.get('/api/v1/worktime/me', requireAuth, async (req, res: Response) => {
    const idwkctr = resolveIdwkctr(req.authUser!)
    if (!idwkctr) {
      res.json(worktimeMeResponseSchema.parse({ idwkctr: '', total: null, items: [] }))
      return
    }
    try {
      const [total, items] = await Promise.all([
        getWorktimeTotal(pool, idwkctr),
        listWorktimeDaily(pool, idwkctr, {
          from: typeof req.query.from === 'string' ? req.query.from : undefined,
          to: typeof req.query.to === 'string' ? req.query.to : undefined,
          limit: Number(req.query.limit ?? 200),
        }),
      ])
      res.json(worktimeMeResponseSchema.parse({ idwkctr, total, items }))
    } catch (err) {
      if (isSchemaMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: schemaHint })
        return
      }
      throw err
    }
  })
}
