import { z } from 'zod'

export const workOrderListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  orderType: z.string(),
  equipment: z.string(),
  functLoc: z.string(),
  priority: z.string(),
  status: z.string(),
  basicStart: z.string(),
  basicFinish: z.string(),
  plant: z.string(),
  workCenter: z.string(),
  systemStatus: z.string(),
  userStatus: z.string(),
  description: z.string(),
})

export const workOrderOperationSchema = z.object({
  no: z.string(),
  desc: z.string(),
  wc: z.string(),
  hours: z.number(),
})

export const workOrderComponentSchema = z.object({
  material: z.string(),
  qty: z.number(),
  unit: z.string(),
})

export const workOrderMovePlanSchema = z.object({
  movedDate: z.string(),
  moveCount: z.number(),
  reasonCode: z.string(),
  reasonName: z.string(),
  movedByWkctr: z.string(),
  comment: z.string(),
})

export const workOrderDetailSchema = z.object({
  item: workOrderListItemSchema.extend({
    wkorder: z.string(),
    team: z.string(),
    mat: z.string(),
    plannedDate: z.string(),
    finishDate: z.string(),
    statusColor: z.string(),
    canMovePlan: z.boolean(),
    movePlan: workOrderMovePlanSchema.nullable(),
    operations: z.array(workOrderOperationSchema),
    components: z.array(workOrderComponentSchema),
  }),
})

export const workOrdersResponseSchema = z.object({
  items: z.array(workOrderListItemSchema),
})

export const workOrderFilterOptionSchema = z.object({
  code: z.string(),
  label: z.string(),
})

export const workOrderFilterOptionsResponseSchema = z.object({
  activities: z.array(workOrderFilterOptionSchema),
  wktypes: z.array(workOrderFilterOptionSchema),
  statuses: z.array(workOrderFilterOptionSchema),
  workcenters: z.array(workOrderFilterOptionSchema),
  teams: z.array(workOrderFilterOptionSchema),
  functionals: z.array(workOrderFilterOptionSchema),
  equipments: z.array(workOrderFilterOptionSchema),
})

export const workOrderSearchBodySchema = z.object({
  q: z.string().optional(),
  activity: z.array(z.string()),
  wktype: z.array(z.string()),
  status: z.array(z.string()),
  wkctr: z.array(z.string()),
  team: z.array(z.string()),
  functionalloc: z.array(z.string()),
  equipment: z.array(z.string()),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const workOrderSearchRowSchema = z.object({
  id: z.string(),
  wkorder: z.string(),
  mntplan: z.string(),
  wktype: z.string(),
  mat: z.string(),
  equdescrip: z.string(),
  funcdescrip: z.string(),
  work: z.number(),
  untime: z.string(),
  displayDate: z.string(),
  team: z.string(),
  wkstcolor: z.string(),
  operationshorttext: z.string(),
})

export const workOrderSearchResponseSchema = z.object({
  items: z.array(workOrderSearchRowSchema),
})

export const workOrderTeamPatchSchema = z.object({
  team: z.enum(['', 'A', 'B', 'P']),
})

export const workOrderTeamPatchResponseSchema = z.object({
  ok: z.literal(true),
})

export const workcenterItemSchema = z.object({
  wkctr: z.string(),
  displayName: z.string(),
})

export const workcentersResponseSchema = z.object({
  items: z.array(workcenterItemSchema),
})

export const confirmationCloseItemSchema = z.object({
  idclose: z.number(),
  idiw37: z.number(),
  wkctr: z.string(),
  displayName: z.string(),
  stdate: z.number(),
  endate: z.number(),
  timewk: z.number(),
  unitc: z.string(),
})

export const confirmationByWorkOrderResponseSchema = z.object({
  idiw37: z.number(),
  wkorder: z.string(),
  items: z.array(confirmationCloseItemSchema),
})

export const confirmationAddCloseBodySchema = z.object({
  wkctr: z.string().min(1),
  startD: z.string().min(1),
  startT: z.string().min(1),
  endD: z.string().min(1),
  endT: z.string().min(1),
})

export const confirmationAddCloseResponseSchema = z.object({
  ok: z.literal(true),
})

export const confirmationDeleteCloseResponseSchema = z.object({
  ok: z.literal(true),
})

export const confirmationCommentItemSchema = z.object({
  idcom: z.number(),
  idiw37: z.number(),
  comdetail: z.string(),
  wkctr: z.string(),
  createdAt: z.string(),
})

export const confirmationCommentsResponseSchema = z.object({
  items: z.array(confirmationCommentItemSchema),
})

export const confirmationCommentBodySchema = z.object({
  comdetail: z.string().min(1).max(8000),
})

export const confirmationCommentResponseSchema = z.object({
  item: confirmationCommentItemSchema,
})

export const confirmationImageItemSchema = z.object({
  idcimg: z.number(),
  idiw37: z.number(),
  fileName: z.string(),
  originalName: z.string(),
  mime: z.string(),
  bytes: z.number(),
  wkctr: z.string(),
  createdAt: z.string(),
})

export const confirmationImagesResponseSchema = z.object({
  items: z.array(confirmationImageItemSchema),
})

export const confirmationImageDataResponseSchema = z.object({
  idcimg: z.number(),
  mime: z.string(),
  base64: z.string(),
})

export const confirmationOkResponseSchema = z.object({
  ok: z.literal(true),
})

export const confirmationImportRowResultSchema = z.object({
  rowNo: z.number().int(),
  action: z.enum(['inserted', 'updated', 'skipped', 'error']),
  confirmation: z.string(),
  wkorder: z.string(),
  wkctr: z.string(),
  stdate: z.number().nullable(),
  endate: z.number().nullable(),
  timewk: z.number().nullable(),
  message: z.string(),
})

export const confirmationImportResponseSchema = z.object({
  fileName: z.string(),
  totalRows: z.number().int(),
  inserted: z.number().int(),
  updated: z.number().int(),
  skipped: z.number().int(),
  errors: z.number().int(),
  rows: z.array(confirmationImportRowResultSchema),
})

export const confirmationExportRowSchema = z.object({
  no: z.number().int(),
  confirmation: z.string(),
  wkorder: z.string(),
  opac: z.string(),
  subO: z.string(),
  ca: z.string(),
  split: z.string(),
  wkctr: z.string(),
  timewk: z.number(),
  unitc: z.string(),
  startDateExe: z.string(),
  endDateExe: z.string(),
  startExecute: z.string(),
  endExecute: z.string(),
})

export const confirmationExportResponseSchema = z.object({
  scope: z.enum(['ALL', 'OWN']),
  actorWkctr: z.string(),
  totalRows: z.number().int(),
  items: z.array(confirmationExportRowSchema),
})

export const workOrderTaskListItemSchema = z.object({
  tasklist: z.string(),
  machine: z.string(),
  pmlist: z.string(),
  machinestatus: z.number().nullable(),
  mat: z.string(),
  matdescrip: z.string(),
})

export const workOrderTaskListSchema = z.object({
  mntplan: z.string(),
  summary: z
    .object({
      tasklist: z.string(),
      productline: z.string(),
      zone: z.string(),
      wkctrtype: z.string(),
    })
    .nullable(),
  items: z.array(workOrderTaskListItemSchema),
})

export const workOrderMachineSchema = z.object({
  zone: z.string(),
  wkctrtype: z.string(),
  productline: z.string(),
  uptime: z.number().nullable(),
  machines: z.array(z.string()),
})

export const workOrderMaterialItemSchema = z.object({
  matpo: z.string(),
  pstngdate: z.string(),
  materialdesc: z.string(),
  amountinlc: z.number(),
  mvt: z.string(),
  material: z.string(),
})

export const workOrderMaterialsSchema = z.object({
  items: z.array(workOrderMaterialItemSchema),
})

export const workOrderPlanningGroupSchema = z.object({
  wkctrgroup: z.string(),
  wkctrdescription: z.string(),
})

export const workOrderPlanningAssignedSchema = z.object({
  /** ใหม่: id ของแถว tbplangingwork (ใช้ลบรายตัว) — ค่าเก่าจะเป็น null */
  idplanw: z.number().int().nullable().optional(),
  kind: z.enum(['person', 'group']),
  code: z.string(),
  displayName: z.string(),
  pwcomment: z.string(),
  pwteam: z.string(),
})

export const workOrderPlanningSchema = z.object({
  canAssign: z.boolean(),
  /** back-compat: ช่างคนแรก (legacy single-assign) */
  assigned: workOrderPlanningAssignedSchema.nullable(),
  /** Multi-assign: ช่างทั้งหมดที่ถูกมอบหมายให้ WO นี้ */
  assignees: z.array(workOrderPlanningAssignedSchema),
  workcenters: z.array(workcenterItemSchema),
  groups: z.array(workOrderPlanningGroupSchema),
})

export const workOrderModalDetailResponseSchema = z.object({
  date: z.string(),
  taskList: workOrderTaskListSchema,
  machine: workOrderMachineSchema,
  planning: workOrderPlanningSchema,
  materials: workOrderMaterialsSchema,
})

export const workOrderPlanningUpsertBodySchema = z.object({
  mode: z.enum(['P', 'G']),
  code: z.string().min(1),
  comment: z.string().optional(),
})

export const workOrderPlanningBatchBodySchema = z.object({
  /** wkctr (รหัส workcenter) หลายคน — backend dedupe + กรอง not-found ให้ */
  wkctrs: z.array(z.string().min(1)).min(1).max(200),
  /** หมายเหตุการจ่ายงาน (ใช้ร่วมกันทุกคน) — เทียบ legacy `pwcomment` */
  comment: z.string().max(255).optional(),
})

export const workOrderPlanningBatchResponseSchema = z.object({
  ok: z.literal(true),
  /** wkctr ที่เพิ่งจ่ายงานสำเร็จในรอบนี้ */
  assigned: z.array(z.string()),
  /** wkctr ที่ส่งมา แต่จ่ายไปแล้ว (ข้าม) */
  skipped: z.array(z.string()),
  /** wkctr ที่ไม่อยู่ใน tbworkcenter (เช่น พิมพ์ผิด) */
  notFound: z.array(z.string()),
})

export const workOrderPlanningOkResponseSchema = z.object({
  ok: z.literal(true),
})
