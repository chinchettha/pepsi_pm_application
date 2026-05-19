import { z } from 'zod'

export const worktimeBreakdownSchema = z.object({
  wh: z.number(),
  ot1: z.number(),
  ot15: z.number(),
  ot1hol: z.number(),
  ot2: z.number(),
  ot3: z.number(),
  total: z.number(),
})

export const manhourItemSchema = z.object({
  idmanhour: z.number().int(),
  idwkctr: z.string(),
  displayName: z.string().nullable(),
  position: z.string().nullable().optional(),
  wkctr: z.string().nullable(),
  stworkday: z.number().int(),
  workday: z.number().int(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  wh: z.number(),
  ot1: z.number(),
  ot15: z.number(),
  ot1hol: z.number(),
  ot2: z.number(),
  ot3: z.number(),
  total: z.number(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

export const manhourListResponseSchema = z.object({
  items: z.array(manhourItemSchema),
  totalRows: z.number().int(),
})

export const manhourUpsertBodySchema = z.object({
  idwkctr: z.string().min(1).max(64),
  /** รับ dd.mm.yyyy / yyyy-mm-dd / unix seconds */
  stworkday: z.union([z.string(), z.number()]),
  workday: z.union([z.string(), z.number()]),
  wh: z.coerce.number().min(0).default(0),
  ot1: z.coerce.number().min(0).default(0),
  ot15: z.coerce.number().min(0).default(0),
  ot1hol: z.coerce.number().min(0).default(0),
  ot2: z.coerce.number().min(0).default(0),
  ot3: z.coerce.number().min(0).default(0),
})

export const manhourOkResponseSchema = z.object({
  ok: z.literal(true),
  idmanhour: z.number().int(),
})

export const manhourImportRowResultSchema = z.object({
  rowNo: z.number().int(),
  idwkctr: z.string(),
  action: z.enum(['inserted', 'updated', 'skipped', 'error']),
  message: z.string().optional(),
})

export const manhourImportResponseSchema = z.object({
  fileName: z.string(),
  totalRows: z.number().int(),
  inserted: z.number().int(),
  updated: z.number().int(),
  skipped: z.number().int(),
  errors: z.number().int(),
  rows: z.array(manhourImportRowResultSchema),
})

export const worktimeDailyItemSchema = z.object({
  workday: z.number().int(),
  workDate: z.string().nullable(),
  wh: z.number(),
  ot1: z.number(),
  ot15: z.number(),
  ot1hol: z.number(),
  ot2: z.number(),
  ot3: z.number(),
  total: z.number(),
})

export const worktimeMeResponseSchema = z.object({
  idwkctr: z.string(),
  total: worktimeBreakdownSchema.nullable(),
  items: z.array(worktimeDailyItemSchema),
})

/** เทียบ `W_worktime_view.php` — แถวมอบหมายจาก tbplangingwork */
export const worktimePlanningItemSchema = z.object({
  idplanw: z.number().int(),
  idiw37: z.number().int(),
  mntplan: z.string().nullable(),
  wkorder: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  assigner: z.string().nullable(),
  comment: z.string().nullable(),
})

export const worktimePlanningResponseSchema = z.object({
  idwkctr: z.string(),
  items: z.array(worktimePlanningItemSchema),
})

export const manhoursSummaryResponseSchema = z.object({
  weeks: z.array(
    z.object({
      week: z.string(),
      planned: z.number(),
      actual: z.number(),
      backlog: z.number(),
    }),
  ),
})

export const manhourChartRangeSchema = z.object({
  from: z.number().int(),
  to: z.number().int(),
  fromDate: z.string(),
  toDate: z.string(),
})

export const manhourChartProfileSchema = z.object({
  idwkctr: z.string(),
  wkctr: z.string(),
  displayName: z.string(),
  position: z.string().nullable(),
  wkctrtype: z.string().nullable(),
  imgmember: z.string().nullable(),
})

export const manhourZbStatSchema = z.object({
  wktype: z.string(),
  planned: z.number(),
  confirmed: z.number(),
  percent: z.number(),
})

export const manhourChartPerformanceResponseSchema = z.object({
  range: manhourChartRangeSchema,
  profile: manhourChartProfileSchema,
  totalPlannedOrders: z.number(),
  utilizationPercent: z.number(),
  confirmHours: z.number(),
  manhourTotal: z.number(),
  zb: z.array(manhourZbStatSchema),
})

export const manhourChartBreakdownResponseSchema = z.object({
  range: manhourChartRangeSchema,
  wh: z.number(),
  ot1: z.number(),
  ot15: z.number(),
  ot1hol: z.number(),
  ot2: z.number(),
  ot3: z.number(),
  confirmHours: z.number(),
})

export type ManhourItem = z.infer<typeof manhourItemSchema>
export type ManhourUpsertBody = z.infer<typeof manhourUpsertBodySchema>
export type ManhourImportResponse = z.infer<typeof manhourImportResponseSchema>
export type WorktimeDailyItem = z.infer<typeof worktimeDailyItemSchema>
