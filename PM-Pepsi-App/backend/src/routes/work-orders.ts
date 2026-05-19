import type { Express, Request, Response } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import type { Pool } from 'pg'
import multer from 'multer'
import * as XLSX from 'xlsx'
import { z } from 'zod'
import { createRequireApiAuth } from '../middleware/require-api-auth.js'
import {
  confirmationAddCloseBodySchema,
  confirmationAddCloseResponseSchema,
  confirmationByWorkOrderResponseSchema,
  confirmationCommentBodySchema,
  confirmationCommentResponseSchema,
  confirmationCommentsResponseSchema,
  confirmationDeleteCloseResponseSchema,
  confirmationImageDataResponseSchema,
  confirmationImagesResponseSchema,
  confirmationImportResponseSchema,
  confirmationExportResponseSchema,
  confirmationOkResponseSchema,
  workcentersResponseSchema,
  workOrderDetailSchema,
  workOrderFilterOptionsResponseSchema,
  workOrderModalDetailResponseSchema,
  workOrderPlanningBatchBodySchema,
  workOrderPlanningBatchResponseSchema,
  workOrderPlanningOkResponseSchema,
  workOrderPlanningUpsertBodySchema,
  workOrderSearchBodySchema,
  workOrderSearchResponseSchema,
  workOrderTeamPatchResponseSchema,
  workOrderTeamPatchSchema,
  workOrdersResponseSchema,
} from '../schemas/work-orders.js'
import {
  deleteWorkOrderPlanning,
  enrichWorkOrderDetailForUser,
  getWorkOrderModalDetail,
  listWorkOrderFilterOptions,
  assignWorkOrderPlanningBatch,
  listWorkOrders,
  searchWorkOrders,
  upsertWorkOrderPlanning,
  updateWorkOrderTeam,
} from '../services/work-orders.js'
import {
  addConfirmationClose,
  createConfirmationComment,
  createConfirmationImageRecord,
  deleteConfirmationComment,
  deleteConfirmationClose,
  deleteConfirmationImageRecord,
  findWorkOrderByWkorder,
  getConfirmationImageMeta,
  getConfirmationByWorkOrder,
  importConfirmFile,
  listConfirmationExportRows,
  listConfirmationComments,
  listConfirmationImages,
  listWorkcenters,
  updateConfirmationComment,
} from '../services/confirmation.js'

const listQuerySchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
})

const confirmationWkorderParamSchema = z.object({
  wkorder: z.string().min(1),
})

const confirmationIdParamSchema = z.object({
  idiw37: z.coerce.number().int().positive(),
})

const confirmationCloseIdParamSchema = z.object({
  idclose: z.coerce.number().int().positive(),
})

const confirmationCommentIdParamSchema = z.object({
  idcom: z.coerce.number().int().positive(),
})

const confirmationImageIdParamSchema = z.object({
  idcimg: z.coerce.number().int().positive(),
})

const confirmationIwiwParamSchema = z.object({
  idiw37: z.coerce.number().int().positive(),
})

const modalDetailQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

function isSchemaMissing(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return (
    message.includes('tbiw37n') ||
    message.includes('view_order') ||
    message.includes('tbactivitytype') ||
    message.includes('tbwkzb') ||
    message.includes('tbfunctional') ||
    message.includes('tbwkstatus') ||
    message.includes('tbworkcenter') ||
    message.includes('tbwkctrgroup') ||
    message.includes('tbplangingwork') ||
    message.includes('tbtasklist') ||
    message.includes('tbmainteanance') ||
    message.includes('tbzone') ||
    message.includes('tbproductline') ||
    message.includes('tblineschdul') ||
    message.includes('tbmaterial') ||
    message.includes('tbcofirm') ||
    message.includes('view_confirmation') ||
    message.includes('view_exportconfirm') ||
    message.includes('tbconfirmimg') ||
    message.includes('tbconfirmcom')
  )
}

export function registerWorkOrderRoutes(
  app: Express,
  pool: Pool,
  sessionSecret: string,
) {
  const requireAuth = createRequireApiAuth(sessionSecret)

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 },
  })

  // multer แยกสำหรับไฟล์ Excel (M_Confirm.php) — ใหญ่กว่ารูปได้
  const uploadExcel = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 },
  })

  const imagesDir = path.resolve(process.cwd(), 'uploads', 'confirm-images')
  fs.mkdirSync(imagesDir, { recursive: true })

  app.get(
    '/api/v1/work-orders/filter-options',
    requireAuth,
    async (_req: Request, res: Response) => {
      try {
        const data = await listWorkOrderFilterOptions(pool)
        res.json(workOrderFilterOptionsResponseSchema.parse(data))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message:
              'Run database/migrations/002_tbactivitytype.sql, 004_tbiw37n_calendar.sql, 005_tbwkzb_tbfunctional.sql, 013_tbwkstatus_add_wkstreason.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.post(
    '/api/v1/work-orders/search',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = workOrderSearchBodySchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid work orders search body',
          issues: parsed.error.issues,
        })
        return
      }
      try {
        const items = await searchWorkOrders(pool, parsed.data)
        res.json(workOrderSearchResponseSchema.parse({ items }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message:
              'Run database/migrations/004_tbiw37n_calendar.sql and 013_tbwkstatus_add_wkstreason.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.put(
    '/api/v1/work-orders/:id/team',
    requireAuth,
    async (req: Request, res: Response) => {
      const id = String(req.params.id ?? '')
      const parsed = workOrderTeamPatchSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid team payload',
          issues: parsed.error.issues,
        })
        return
      }
      try {
        const ok = await updateWorkOrderTeam(pool, id, parsed.data.team)
        if (!ok) {
          res.status(404).json({ error: 'NOT_FOUND', message: 'Work order not found' })
          return
        }
        res.json(workOrderTeamPatchResponseSchema.parse({ ok: true }))
      } catch (err) {
        if (isSchemaMissing(err)) {
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
    '/api/v1/work-orders',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = listQuerySchema.safeParse(req.query)
      const opts = parsed.success ? parsed.data : {}
      try {
        const items = await listWorkOrders(pool, opts)
        res.json(workOrdersResponseSchema.parse({ items }))
      } catch (err) {
        if (isSchemaMissing(err)) {
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
        const item = await enrichWorkOrderDetailForUser(pool, id, req.authUser?.userst)
        if (!item) {
          res.status(404).json({ error: 'NOT_FOUND', message: 'Work order not found' })
          return
        }
        res.json(workOrderDetailSchema.parse({ item }))
      } catch (err) {
        if (isSchemaMissing(err)) {
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
    '/api/v1/work-orders/:id/modal-detail',
    requireAuth,
    async (req: Request, res: Response) => {
      const id = String(req.params.id ?? '')
      const parsed = modalDetailQuerySchema.safeParse(req.query)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid query' })
        return
      }
      try {
        const payload = await getWorkOrderModalDetail(pool, id, { date: parsed.data.date }, req.authUser?.userst)
        if (!payload) {
          res.status(404).json({ error: 'NOT_FOUND', message: 'Work order not found' })
          return
        }
        res.json(workOrderModalDetailResponseSchema.parse(payload))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message:
              'Run database/migrations/003_tblineschdul.sql, 014_tbwkctrtype.sql, 015_tbproductline.sql, 016_tbzone.sql, 017_tbmainteanance.sql, 018_tbmaterial.sql, 021_tbwkctrgroup.sql, 022_tbtasklist.sql, 007_tbplangingwork_view_planwork.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.put(
    '/api/v1/work-orders/:id/planning',
    requireAuth,
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED' })
        return
      }
      if ((user.userst ?? '').trim() !== 'A') {
        res.status(403).json({ error: 'FORBIDDEN' })
        return
      }
      const id = String(req.params.id ?? '')
      const parsed = workOrderPlanningUpsertBodySchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid body', issues: parsed.error.issues })
        return
      }
      try {
        const ok = await upsertWorkOrderPlanning(pool, id, parsed.data, user.wkctr || user.username || user.idwkctr)
        if (!ok) {
          res.status(404).json({ error: 'NOT_FOUND' })
          return
        }
        res.json(workOrderPlanningOkResponseSchema.parse({ ok: true }))
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

  // Multi-assign แบบ batch — เพิ่มช่างหลายคนในคลิกเดียว (เทียบ M_personel/AddPlan.php loop หลายครั้ง)
  app.post(
    '/api/v1/work-orders/:id/planning/batch',
    requireAuth,
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED' })
        return
      }
      if ((user.userst ?? '').trim() !== 'A') {
        res.status(403).json({ error: 'FORBIDDEN' })
        return
      }
      const id = String(req.params.id ?? '')
      const parsed = workOrderPlanningBatchBodySchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid body',
          issues: parsed.error.issues,
        })
        return
      }
      try {
        const result = await assignWorkOrderPlanningBatch(
          pool,
          id,
          parsed.data.wkctrs,
          parsed.data.comment,
          user.wkctr || user.username || user.idwkctr,
        )
        if (!result) {
          res.status(404).json({ error: 'NOT_FOUND' })
          return
        }
        res.json(
          workOrderPlanningBatchResponseSchema.parse({
            ok: true,
            assigned: result.assigned,
            skipped: result.skipped,
            notFound: result.notFound,
          }),
        )
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

  // DELETE all assignments ของ WO (back-compat) — เทียบ legacy "clear ทั้ง WO"
  app.delete(
    '/api/v1/work-orders/:id/planning',
    requireAuth,
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED' })
        return
      }
      if ((user.userst ?? '').trim() !== 'A') {
        res.status(403).json({ error: 'FORBIDDEN' })
        return
      }
      const id = String(req.params.id ?? '')
      try {
        const ok = await deleteWorkOrderPlanning(pool, id)
        if (!ok) {
          res.status(404).json({ error: 'NOT_FOUND' })
          return
        }
        res.json(workOrderPlanningOkResponseSchema.parse({ ok: true }))
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

  // DELETE assignment เฉพาะ (idiw37, wkctr) — multi-assign — เทียบ AddPlan.php `st=Del`
  app.delete(
    '/api/v1/work-orders/:id/planning/:wkctr',
    requireAuth,
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED' })
        return
      }
      if ((user.userst ?? '').trim() !== 'A') {
        res.status(403).json({ error: 'FORBIDDEN' })
        return
      }
      const id = String(req.params.id ?? '')
      const wkctr = String(req.params.wkctr ?? '').trim()
      if (!wkctr) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'wkctr is required' })
        return
      }
      try {
        const ok = await deleteWorkOrderPlanning(pool, id, wkctr)
        if (!ok) {
          res.status(404).json({ error: 'NOT_FOUND' })
          return
        }
        res.json(workOrderPlanningOkResponseSchema.parse({ ok: true }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run database/migrations/007_tbplangingwork_view_planwork.sql + 038_tbplangingwork_multi_assign.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.get('/api/v1/workcenters', requireAuth, async (_req: Request, res: Response) => {
    const items = await listWorkcenters(pool)
    res.json(workcentersResponseSchema.parse({ items }))
  })

  app.get(
    '/api/v1/confirmation/by-wkorder/:wkorder',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = confirmationWkorderParamSchema.safeParse(req.params)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'wkorder is required' })
        return
      }
      const wkorder = parsed.data.wkorder

      const wo = await findWorkOrderByWkorder(pool, wkorder)
      if (!wo) {
        res.status(404).json({ error: 'NOT_FOUND', message: 'Work order not found' })
        return
      }

      const data = await getConfirmationByWorkOrder(pool, wkorder)
      const items = data?.items ?? []
      res.json(
        confirmationByWorkOrderResponseSchema.parse({
          idiw37: wo.idiw37,
          wkorder: wo.wkorder,
          items,
        }),
      )
    },
  )

  app.get(
    '/api/v1/confirmation/:idiw37/comments',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = confirmationIwiwParamSchema.safeParse(req.params)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idiw37' })
        return
      }
      try {
        const items = await listConfirmationComments(pool, parsed.data.idiw37)
        res.json(confirmationCommentsResponseSchema.parse({ items }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run migrations 026_confirmation_tables.sql and 029_confirmation_comments_images.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.post(
    '/api/v1/confirmation/:idiw37/comments',
    requireAuth,
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'ต้องเข้าสู่ระบบ' })
        return
      }
      const idParsed = confirmationIwiwParamSchema.safeParse(req.params)
      if (!idParsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idiw37' })
        return
      }
      const bodyParsed = confirmationCommentBodySchema.safeParse(req.body)
      if (!bodyParsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid body', issues: bodyParsed.error.issues })
        return
      }
      try {
        const item = await createConfirmationComment(pool, {
          idiw37: idParsed.data.idiw37,
          comdetail: bodyParsed.data.comdetail,
          wkctr: user.wkctr || user.username || '',
        })
        res.status(201).json(confirmationCommentResponseSchema.parse({ item }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run migration 029_confirmation_comments_images.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.put(
    '/api/v1/confirmation/comments/:idcom',
    requireAuth,
    async (req: Request, res: Response) => {
      const idParsed = confirmationCommentIdParamSchema.safeParse(req.params)
      if (!idParsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idcom' })
        return
      }
      const bodyParsed = confirmationCommentBodySchema.safeParse(req.body)
      if (!bodyParsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid body', issues: bodyParsed.error.issues })
        return
      }
      try {
        const item = await updateConfirmationComment(pool, idParsed.data.idcom, bodyParsed.data.comdetail)
        if (!item) {
          res.status(404).json({ error: 'NOT_FOUND' })
          return
        }
        res.json(confirmationCommentResponseSchema.parse({ item }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run migration 029_confirmation_comments_images.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.delete(
    '/api/v1/confirmation/comments/:idcom',
    requireAuth,
    async (req: Request, res: Response) => {
      const idParsed = confirmationCommentIdParamSchema.safeParse(req.params)
      if (!idParsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idcom' })
        return
      }
      try {
        const ok = await deleteConfirmationComment(pool, idParsed.data.idcom)
        if (!ok) {
          res.status(404).json({ error: 'NOT_FOUND' })
          return
        }
        res.json(confirmationOkResponseSchema.parse({ ok: true }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run migration 029_confirmation_comments_images.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.get(
    '/api/v1/confirmation/:idiw37/images',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = confirmationIwiwParamSchema.safeParse(req.params)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idiw37' })
        return
      }
      try {
        const items = await listConfirmationImages(pool, parsed.data.idiw37)
        res.json(confirmationImagesResponseSchema.parse({ items }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run migration 029_confirmation_comments_images.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.get(
    '/api/v1/confirmation/export',
    requireAuth,
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'ต้องเข้าสู่ระบบ' })
        return
      }
      const actorWkctr = (user.wkctr || user.username || '').trim()
      const scope: 'ALL' | 'OWN' =
        actorWkctr === 'PAC007' || actorWkctr === 'PRO005' ? 'ALL' : 'OWN'

      try {
        const items = await listConfirmationExportRows(pool, actorWkctr)
        res.json(
          confirmationExportResponseSchema.parse({
            scope,
            actorWkctr,
            totalRows: items.length,
            items,
          }),
        )
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message:
              'Run migrations 026_confirmation_tables.sql และ 033_view_exportconfirm.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.get(
    '/api/v1/confirmation/export.xlsx',
    requireAuth,
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'ต้องเข้าสู่ระบบ' })
        return
      }

      try {
        const rows = await listConfirmationExportRows(pool, user.wkctr || user.username || '')
        const data = [
          [
            '',
            'Comfirmation',
            'Order',
            'Operation',
            'SubO',
            'Ca..',
            'Split',
            'Wrk Ctr',
            'Act.Work',
            'unit',
            'Start date Exe.',
            'End Date Exe.',
            'Start Execute',
            'End Execute',
          ],
          ...rows.map((row) => [
            row.no,
            row.confirmation,
            row.wkorder,
            row.opac,
            row.subO,
            row.ca,
            row.split,
            row.wkctr,
            row.timewk,
            row.unitc,
            row.startDateExe,
            row.endDateExe,
            row.startExecute,
            row.endExecute,
          ]),
        ]

        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet(data)
        for (const col of Array.from({ length: 14 }, (_, i) => i)) {
          const letter = XLSX.utils.encode_col(col)
          ws['!cols'] = ws['!cols'] ?? []
          ws['!cols'][col] = { wch: Math.max(10, String(data[0][col] ?? '').length + 2) }
          if (!ws[`${letter}1`]) continue
        }
        XLSX.utils.book_append_sheet(wb, ws, 'Export Confirm')
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }) as Buffer

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        res.setHeader('Content-Disposition', 'attachment; filename="Export_Confirm.xlsx"')
        res.status(200).send(buf)
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message:
              'Run migrations 026_confirmation_tables.sql และ 033_view_exportconfirm.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.post(
    '/api/v1/confirmation/:idiw37/images',
    requireAuth,
    upload.single('file'),
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'ต้องเข้าสู่ระบบ' })
        return
      }
      const idParsed = confirmationIwiwParamSchema.safeParse(req.params)
      if (!idParsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idiw37' })
        return
      }

      const file = req.file
      if (!file?.buffer?.length) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Multipart field "file" is required' })
        return
      }

      const mime = file.mimetype || 'application/octet-stream'
      if (mime !== 'image/jpeg' && mime !== 'image/jpg') {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Only JPEG images are allowed' })
        return
      }

      const safeExt = '.jpg'
      const fileName = `${idParsed.data.idiw37}_${Date.now()}_${Math.random().toString(16).slice(2)}${safeExt}`
      const abs = path.join(imagesDir, fileName)
      await fs.promises.writeFile(abs, file.buffer)

      try {
        const item = await createConfirmationImageRecord(pool, {
          idiw37: idParsed.data.idiw37,
          fileName,
          originalName: file.originalname || '',
          mime: 'image/jpeg',
          bytes: file.buffer.length,
          wkctr: user.wkctr || user.username || '',
        })
        res.status(201).json(confirmationImagesResponseSchema.parse({ items: [item] }))
      } catch (err) {
        await fs.promises.unlink(abs).catch(() => {})
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run migration 029_confirmation_comments_images.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.get(
    '/api/v1/confirmation/images/:idcimg/data',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = confirmationImageIdParamSchema.safeParse(req.params)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idcimg' })
        return
      }
      try {
        const meta = await getConfirmationImageMeta(pool, parsed.data.idcimg)
        if (!meta) {
          res.status(404).json({ error: 'NOT_FOUND' })
          return
        }
        const abs = path.join(imagesDir, meta.fileName)
        const buf = await fs.promises.readFile(abs)
        res.json(
          confirmationImageDataResponseSchema.parse({
            idcimg: meta.idcimg,
            mime: meta.mime,
            base64: buf.toString('base64'),
          }),
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('ENOENT')) {
          res.status(404).json({ error: 'NOT_FOUND', message: 'File missing' })
          return
        }
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run migration 029_confirmation_comments_images.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.delete(
    '/api/v1/confirmation/images/:idcimg',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = confirmationImageIdParamSchema.safeParse(req.params)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idcimg' })
        return
      }
      try {
        const out = await deleteConfirmationImageRecord(pool, parsed.data.idcimg)
        if (!out.ok) {
          res.status(404).json({ error: 'NOT_FOUND' })
          return
        }
        if (out.fileName) {
          await fs.promises.unlink(path.join(imagesDir, out.fileName)).catch(() => {})
        }
        res.json(confirmationOkResponseSchema.parse({ ok: true }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message: 'Run migration 029_confirmation_comments_images.sql',
          })
          return
        }
        throw err
      }
    },
  )

  app.post(
    '/api/v1/confirmation/:idiw37/close',
    requireAuth,
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'ต้องเข้าสู่ระบบ' })
        return
      }

      const idParsed = confirmationIdParamSchema.safeParse(req.params)
      if (!idParsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idiw37' })
        return
      }

      const bodyParsed = confirmationAddCloseBodySchema.safeParse(req.body)
      if (!bodyParsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid body' })
        return
      }

      try {
        await addConfirmationClose(pool, {
          idiw37: idParsed.data.idiw37,
          wkctr: bodyParsed.data.wkctr,
          startD: bodyParsed.data.startD,
          startT: bodyParsed.data.startT,
          endD: bodyParsed.data.endD,
          endT: bodyParsed.data.endT,
          cwkctr: user.wkctr || user.username || null,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        res.status(400).json({ error: 'VALIDATION_ERROR', message })
        return
      }

      res.json(confirmationAddCloseResponseSchema.parse({ ok: true }))
    },
  )

  app.delete(
    '/api/v1/confirmation/close/:idclose',
    requireAuth,
    async (req: Request, res: Response) => {
      const parsed = confirmationCloseIdParamSchema.safeParse(req.params)
      if (!parsed.success) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid idclose' })
        return
      }
      await deleteConfirmationClose(pool, parsed.data.idclose)
      res.json(confirmationDeleteCloseResponseSchema.parse({ ok: true }))
    },
  )

  // POST /api/v1/confirmation/import (Admin only) — เทียบ M_Confirm.php
  // skip 2 rows + validate ตาม PHP บรรทัด 76 + insert/update เทียบ PHP บรรทัด 130-165
  app.post(
    '/api/v1/confirmation/import',
    requireAuth,
    uploadExcel.single('file'),
    async (req: Request, res: Response) => {
      const user = req.authUser
      if (!user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'ต้องเข้าสู่ระบบ' })
        return
      }
      if ((user.userst ?? '').trim() !== 'A') {
        res.status(403).json({ error: 'FORBIDDEN', message: 'Admin only (M_Confirm)' })
        return
      }

      const file = req.file
      if (!file?.buffer?.length) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Multipart field "file" (.xls, .xlsx, .csv) is required',
        })
        return
      }

      const fileName = file.originalname || 'Confirm.xlsx'
      const lower = fileName.toLowerCase()
      if (!lower.endsWith('.xls') && !lower.endsWith('.xlsx') && !lower.endsWith('.csv')) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Only .xls, .xlsx, or .csv files are allowed',
        })
        return
      }

      try {
        const summary = await importConfirmFile(pool, fileName, file.buffer)
        res.json(confirmationImportResponseSchema.parse({ fileName, ...summary }))
      } catch (err) {
        if (isSchemaMissing(err)) {
          res.status(503).json({
            error: 'SCHEMA_NOT_READY',
            message:
              'Run migrations 026_confirmation_tables.sql และ 032_tbcofirm_import_uniq.sql',
          })
          return
        }
        const message = err instanceof Error ? err.message : 'Import failed'
        res.status(400).json({ error: 'IMPORT_FAILED', message })
      }
    },
  )
}
