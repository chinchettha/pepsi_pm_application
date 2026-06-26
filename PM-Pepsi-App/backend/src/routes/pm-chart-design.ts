import type { Express, Request, Response } from 'express'
import type { Pool } from 'pg'
import multer from 'multer'
import { voidAudit, sanitizeAuditPayload } from '../lib/audit-mutation.js'
import { buildPmChartDesignWorkbook } from '../lib/pm-chart-design-export.js'
import { parsePmChartDesignWorkbook } from '../lib/pm-chart-design-import.js'
import { createRequirePermission } from '../middleware/require-permission.js'
import {
  pmChartImportResultSchema,
  pmChartSaveBodySchema,
  pmChartScopeQuerySchema,
  pmChartSheetKeySchema,
  pmChartSheetResponseSchema,
} from '../schemas/pm-chart-design.js'
import {
  getPmChartSheet,
  importPmChartDesignSheets,
  isPmChartDesignTableMissing,
  loadAllPmChartSheets,
  resolvePmChartScopeKey,
  savePmChartSheet,
} from '../services/pm-chart-design.js'

const SCHEMA_HINT = 'Run database/migrations/120_pm_chart_design.sql'

export function registerPmChartDesignRoutes(app: Express, pool: Pool, sessionSecret: string) {
  const perm = createRequirePermission(pool, sessionSecret)
  const requireRead = perm('confirmation.read')
  const requireWrite = perm('confirmation.write')

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  })

  app.post(
    '/api/v1/pm-charts/import',
    ...requireWrite,
    upload.single('file'),
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'ต้องเข้าสู่ระบบ' })
        return
      }
      const file = req.file
      if (!file?.buffer?.length) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'เลือกไฟล์ .xlsx ก่อน' })
        return
      }
      const wkorder =
        typeof req.body?.wkorder === 'string' ? req.body.wkorder.trim().slice(0, 64) : undefined
      const actor = user.wkctr || user.username || ''
      try {
        const parsed = parsePmChartDesignWorkbook(file.buffer)
        if (!parsed.vibration && !parsed.current && !parsed.combustion) {
          res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'No PM chart sheets found in workbook',
            issues: parsed.issues,
          })
          return
        }
        const result = await importPmChartDesignSheets(
          pool,
          {
            vibration: parsed.vibration,
            current: parsed.current,
            combustion: parsed.combustion,
          },
          actor,
          wkorder,
        )
        const mergeIssues: string[] = []
        for (const [key, stats] of Object.entries(result.mergeStats)) {
          if (!stats) continue
          const parts: string[] = []
          if (stats.rowsAdded > 0) parts.push(`${stats.rowsAdded} added`)
          if (stats.rowsUpdated > 0) parts.push(`${stats.rowsUpdated} updated`)
          if (stats.duplicatesSkipped > 0) parts.push(`${stats.duplicatesSkipped} duplicate(s) merged`)
          if (parts.length > 0) mergeIssues.push(`${key}: ${parts.join(', ')}`)
        }
        voidAudit(pool, req, {
          action: 'confirmation.write',
          resource: 'tbpm_chart_design',
          resourceId: `import:${result.scopeKey}`,
          after: sanitizeAuditPayload({
            wkorder: result.wkorder,
            imported: result.imported,
            mergeStats: result.mergeStats,
            issues: parsed.issues,
          }),
        })
        res.json(
          pmChartImportResultSchema.parse({
            ok: true,
            scopeKey: result.scopeKey,
            wkorder: result.wkorder,
            imported: result.imported,
            issues: [...parsed.issues, ...mergeIssues],
            mergeStats: result.mergeStats,
            savedAt: new Date().toISOString(),
          }),
        )
      } catch (err) {
        if (isPmChartDesignTableMissing(err)) {
          res.status(503).json({ error: 'SCHEMA_NOT_READY', message: SCHEMA_HINT })
          return
        }
        throw err
      }
    },
  )

  app.get('/api/v1/pm-charts/export.xlsx', ...requireRead, async (req: Request, res: Response) => {
    const parsed = pmChartScopeQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', issues: parsed.error.issues })
      return
    }
    const scopeKey = resolvePmChartScopeKey(parsed.data.scope, parsed.data.wkorder)
    try {
      const sheets = await loadAllPmChartSheets(pool, scopeKey)
      const buf = buildPmChartDesignWorkbook({
        vibration: sheets.vibration,
        current: sheets.current,
        combustion: sheets.combustion,
      })
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      res.setHeader('Content-Disposition', 'attachment; filename="PMChartDesign.xlsx"')
      res.status(200).send(buf)
    } catch (err) {
      if (isPmChartDesignTableMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: SCHEMA_HINT })
        return
      }
      throw err
    }
  })

  app.get('/api/v1/pm-charts/:sheetKey', ...requireRead, async (req: Request, res: Response) => {
    const keyParsed = pmChartSheetKeySchema.safeParse(req.params.sheetKey)
    if (!keyParsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid sheet key' })
      return
    }
    const qParsed = pmChartScopeQuerySchema.safeParse(req.query)
    if (!qParsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', issues: qParsed.error.issues })
      return
    }
    const scopeKey = resolvePmChartScopeKey(qParsed.data.scope, qParsed.data.wkorder)
    try {
      const row = await getPmChartSheet(pool, keyParsed.data, scopeKey)
      if (!row) {
        res.status(404).json({ error: 'NOT_FOUND', message: 'No saved data for this scope' })
        return
      }
      res.json(pmChartSheetResponseSchema.parse(row))
    } catch (err) {
      if (isPmChartDesignTableMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: SCHEMA_HINT })
        return
      }
      throw err
    }
  })

  app.put('/api/v1/pm-charts/:sheetKey', ...requireWrite, async (req: Request, res: Response) => {
    const user = req.authUser
    if (!user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'ต้องเข้าสู่ระบบ' })
      return
    }
    const keyParsed = pmChartSheetKeySchema.safeParse(req.params.sheetKey)
    if (!keyParsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid sheet key' })
      return
    }
    const bodyParsed = pmChartSaveBodySchema.safeParse(req.body)
    if (!bodyParsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', issues: bodyParsed.error.issues })
      return
    }
    const actor = user.wkctr || user.username || ''
    const scopeKey = resolvePmChartScopeKey(
      bodyParsed.data.scopeKey === 'default' ? undefined : bodyParsed.data.scopeKey,
      bodyParsed.data.wkorder,
    )
    try {
      const saved = await savePmChartSheet(
        pool,
        keyParsed.data,
        scopeKey,
        bodyParsed.data.payload,
        actor,
        bodyParsed.data.wkorder,
      )
      voidAudit(pool, req, {
        action: 'confirmation.write',
        resource: 'tbpm_chart_design',
        resourceId: `${keyParsed.data}:${scopeKey}`,
        after: sanitizeAuditPayload({ wkorder: saved.wkorder }),
      })
      res.json(pmChartSheetResponseSchema.parse(saved))
    } catch (err) {
      if (isPmChartDesignTableMissing(err)) {
        res.status(503).json({ error: 'SCHEMA_NOT_READY', message: SCHEMA_HINT })
        return
      }
      throw err
    }
  })
}
