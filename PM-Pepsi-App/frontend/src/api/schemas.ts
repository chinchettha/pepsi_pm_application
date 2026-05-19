/**
 * สัญญา API ฝั่ง client — ล็อก shape ให้ตรงกับ Express backend
 * เพิ่ม endpoint ใหม่: ประกาศ schema ที่นี่ก่อนหรือพร้อมกับ handler mock
 */
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
    operations: z.array(
      z.object({
        no: z.string(),
        desc: z.string(),
        wc: z.string(),
        hours: z.number(),
      }),
    ),
    components: z.array(
      z.object({
        material: z.string(),
        qty: z.number(),
        unit: z.string(),
      }),
    ),
  }),
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
  idplanw: z.number().int().nullable().optional(),
  kind: z.enum(['person', 'group']),
  code: z.string(),
  displayName: z.string(),
  pwcomment: z.string(),
  pwteam: z.string(),
})

export const workOrderPlanningSchema = z.object({
  canAssign: z.boolean(),
  assigned: workOrderPlanningAssignedSchema.nullable(),
  assignees: z.array(workOrderPlanningAssignedSchema).default([]),
  workcenters: z.array(
    z.object({
      wkctr: z.string(),
      displayName: z.string(),
    }),
  ),
  groups: z.array(workOrderPlanningGroupSchema),
})

export const workOrderModalDetailSchema = z.object({
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
  wkctrs: z.array(z.string().min(1)).min(1).max(200),
  comment: z.string().max(255).optional(),
})

export const workOrderPlanningBatchResponseSchema = z.object({
  ok: z.literal(true),
  assigned: z.array(z.string()),
  skipped: z.array(z.string()),
  notFound: z.array(z.string()),
})

export const workOrderPlanningOkResponseSchema = z.object({
  ok: z.literal(true),
})

export const planningAssignBodySchema = z.object({
  idiw37: z.number().int().positive(),
  mode: z.enum(['P', 'G']),
  code: z.string().min(1),
  comment: z.string().optional(),
})

export const planningAssignResponseSchema = z.object({
  ok: z.literal(true),
})

export const movePlanReasonSchema = z.object({
  code: z.string(),
  name: z.string(),
})

export const movePlanReasonsResponseSchema = z.object({
  items: z.array(movePlanReasonSchema),
})

export const movePlanRequestSchema = z.object({
  idiw37: z.string(),
  targetDate: z.string(),
  reasonCode: z.string(),
  comment: z.string().optional(),
})

export const movePlanResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
  mpcount: z.number(),
})

export const workOrderSuggestionSchema = z.object({
  id: z.string(),
  wkorder: z.string(),
  wktype: z.string(),
  label: z.string(),
})

export const workOrderSuggestionsResponseSchema = z.object({
  items: z.array(workOrderSuggestionSchema),
})

export const dashboardSummarySchema = z.object({
  openOrders: z.number(),
  closedThisMonth: z.number(),
  pendingPersonnel: z.number(),
  iw37nLastImport: z.string().nullable(),
})

export const calendarEventItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  orderId: z.string(),
  color: z.string(),
  description: z.string().optional(),
})

export const calendarEventsResponseSchema = z.object({
  items: z.array(calendarEventItemSchema),
  year: z.number(),
  month: z.number(),
})

export const backlogFilterOptionSchema = z.object({
  code: z.string(),
  label: z.string(),
})

export const calendarFilterOptionsResponseSchema = z.object({
  activities: z.array(backlogFilterOptionSchema),
  wktypes: z.array(backlogFilterOptionSchema),
  statuses: z.array(backlogFilterOptionSchema),
  workcenters: z.array(backlogFilterOptionSchema),
  teams: z.array(backlogFilterOptionSchema),
  functionals: z.array(backlogFilterOptionSchema),
  equipments: z.array(backlogFilterOptionSchema),
})

export const calendarSearchBodySchema = z.object({
  year: z.number(),
  month: z.number(),
  activity: z.array(z.string()),
  wktype: z.array(z.string()),
  status: z.array(z.string()),
  wkctr: z.array(z.string()),
  team: z.array(z.string()),
  functionalloc: z.array(z.string()),
  equipment: z.array(z.string()),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
})

export const backlogFilterOptionsResponseSchema = z.object({
  activities: z.array(backlogFilterOptionSchema),
  wktypes: z.array(backlogFilterOptionSchema),
  workcenters: z.array(backlogFilterOptionSchema),
  functionals: z.array(backlogFilterOptionSchema),
  equipments: z.array(backlogFilterOptionSchema),
})

export const backlogSearchBodySchema = z.object({
  year: z.number(),
  month: z.number(),
  activity: z.array(z.string()),
  wktype: z.array(z.string()),
  functionalloc: z.array(z.string()),
  equipment: z.array(z.string()),
  wkctr: z.array(z.string()),
})

export const backlogEventsResponseSchema = z.object({
  items: z.array(calendarEventItemSchema),
  year: z.number(),
  month: z.number(),
})

export const backlogManhourSearchBodySchema = z.object({
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const backlogManhourRowSchema = z.object({
  wkorder: z.string(),
  wktype: z.string().nullable().optional(),
  syst: z.string().nullable().optional(),
  work: z.number(),
  actwork: z.number(),
  unit: z.string(),
  operationshorttext: z.string().nullable().optional(),
})

export const backlogManhourResponseSchema = z.object({
  fromDate: z.string(),
  toDate: z.string(),
  plannedMinutes: z.number(),
  plannedHours: z.number(),
  actualMinutes: z.number(),
  actualHours: z.number(),
  totalOrders: z.number(),
  completionCount: z.number(),
  completionPercent: z.number(),
  byWkzb: z.array(
    z.object({
      code: z.string(),
      label: z.string(),
      count: z.number(),
    }),
  ),
  rows: z.array(backlogManhourRowSchema),
})

export const backlogFilterDetailTeamSchema = z.object({
  count: z.number(),
  workSumMinutes: z.number(),
})

export const backlogFilterDetailResponseSchema = z.object({
  year: z.number(),
  month: z.number(),
  totalOrders: z.number(),
  completionCount: z.number(),
  completionPercent: z.number(),
  byWkzb: z.array(
    z.object({
      code: z.string(),
      label: z.string(),
      count: z.number(),
    }),
  ),
  teamA: backlogFilterDetailTeamSchema,
  teamB: backlogFilterDetailTeamSchema,
  teamP: backlogFilterDetailTeamSchema,
})

export const iw37nBatchItemSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  importedAt: z.string(),
  rows: z.number(),
  sha256: z.string(),
  status: z.enum(['OK', 'PARTIAL', 'ERR']),
  isDuplicate: z.boolean(),
  duplicateOfBatchId: z.string().nullable(),
})

export const iw37nBatchesResponseSchema = z.object({
  items: z.array(iw37nBatchItemSchema),
})

export const iw37nImportResponseSchema = z.object({
  batch: iw37nBatchItemSchema,
  rows: z.array(
    z.object({
      rowNo: z.number(),
      action: z.enum(['inserted', 'updated', 'skipped', 'error']),
      wkorder: z.string(),
      opac: z.string(),
      mntplan: z.string(),
      wktype: z.string(),
      mat: z.string(),
      syst: z.string(),
      message: z.string(),
    }),
  ),
})

export const iw37nBatchRowsResponseSchema = z.object({
  batchId: z.string(),
  items: z.array(
    z.object({
      rowNo: z.number(),
      action: z.enum(['inserted', 'updated', 'skipped', 'error']),
      wkorder: z.string(),
      opac: z.string(),
      mntplan: z.string(),
      wktype: z.string(),
      mat: z.string(),
      syst: z.string(),
      message: z.string(),
      createdAt: z.string(),
    }),
  ),
})

export const iw37nItemSchema = z.object({
  idiw37: z.number(),
  mntplan: z.string(),
  wkorder: z.string(),
  wktype: z.string(),
  mat: z.string(),
  bscstart: z.number().nullable(),
  actfinish: z.number().nullable(),
  systemstatus: z.string(),
  syst: z.string(),
  opac: z.string(),
  operationshorttext: z.string(),
  ostdescription: z.string(),
  cknow: z.string(),
  wkctr: z.string(),
  work: z.number().nullable(),
  actwork: z.number().nullable(),
  untime: z.number().nullable(),
  equipment: z.string(),
  equdescrip: z.string(),
  functionalloc: z.string(),
  funcdescrip: z.string(),
  team: z.string().nullable(),
})

export const iw37nItemsResponseSchema = z.object({
  items: z.array(iw37nItemSchema),
})

export const iw37nItemResponseSchema = z.object({
  item: iw37nItemSchema,
})

export const healthResponseSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  time: z.string(),
  db: z.enum(['ok', 'error']).optional(),
})

/** POST /api/v1/auth/login — workcenter (login.php) | member (login-bk.php) */
export const loginModeSchema = z.enum(['workcenter', 'member'])

export const loginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  mode: loginModeSchema.optional(),
})

export const authUserSchema = z.object({
  idwkctr: z.string(),
  username: z.string(),
  wkctr: z.string(),
  plnt: z.string().nullable().optional(),
  userst: z.string(),
  sysstatus: z.string(),
  userLevel: z.number().optional(),
  fullnameTh: z.string().optional(),
  fullnameEng: z.string().optional(),
  titlewkctr: z.string().optional(),
  namewkctr: z.string().optional(),
  surnamewkctr: z.string().optional(),
  imgMember: z.string().nullable().optional(),
  accountType: z.enum(['workcenter', 'member']).optional(),
  memId: z.string().optional(),
})

export type AuthUser = z.infer<typeof authUserSchema>

export const loginResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema,
})

export const logoutRequestSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  accountType: z.enum(['workcenter', 'member']).optional(),
})

export const navMenuItemSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('heading'),
    label: z.string(),
    menuright: z.string(),
  }),
  z.object({
    kind: z.literal('item'),
    label: z.string(),
    to: z.string(),
    menuright: z.string(),
    icon: z.string().optional(),
    end: z.boolean().optional(),
  }),
])

export type NavMenuItem = z.infer<typeof navMenuItemSchema>

export const navMenuResponseSchema = z.object({
  items: z.array(navMenuItemSchema),
})

export const logoutResponseSchema = z.object({
  ok: z.literal(true),
})

export const authSessionResponseSchema = z.object({
  user: authUserSchema,
})

export const userProfileSchema = z.object({
  accountType: z.enum(['workcenter', 'member']),
  userId: z.string(),
  username: z.string(),
  displayName: z.string(),
  sysstatus: z.string(),
  userst: z.string().optional(),
  plnt: z.string().nullable().optional(),
  wkctr: z.string().optional(),
  fullnameTh: z.string().optional(),
  fullnameEng: z.string().optional(),
  imgMember: z.string().nullable().optional(),
  birthdayLabel: z.string().optional(),
  workAgeLabel: z.string().optional(),
  worktimeTotalHours: z.number().optional(),
  worktimeBreakdown: z
    .object({
      wh: z.number(),
      ot1: z.number(),
      ot15: z.number(),
      ot1hol: z.number(),
      ot2: z.number(),
      ot3: z.number(),
      total: z.number(),
    })
    .optional(),
  idcard: z.string().optional(),
  bank: z.string().optional(),
  bankNo: z.string().optional(),
  branch: z.string().optional(),
  lastLogin: z.string().nullable().optional(),
})

export const planningItemSchema = z.object({
  id: z.string(),
  planName: z.string(),
  line: z.string(),
  month: z.string(),
  status: z.enum(['OPEN', 'CONF', 'CLOS']),
  owner: z.string(),
  wkorder: z.string().optional(),
  wktype: z.string().optional(),
  planDate: z.string().optional(),
  movedDate: z.string().optional(),
  closedDate: z.string().optional(),
})

export const planningResponseSchema = z.object({
  items: z.array(planningItemSchema),
})

export const manhoursResponseSchema = z.object({
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

export const manhourChartPerformanceResponseSchema = z.object({
  range: manhourChartRangeSchema,
  profile: z.object({
    idwkctr: z.string(),
    wkctr: z.string(),
    displayName: z.string(),
    position: z.string().nullable(),
    wkctrtype: z.string().nullable(),
    imgmember: z.string().nullable(),
  }),
  totalPlannedOrders: z.number(),
  utilizationPercent: z.number(),
  confirmHours: z.number(),
  manhourTotal: z.number(),
  zb: z.array(
    z.object({
      wktype: z.string(),
      planned: z.number(),
      confirmed: z.number(),
      percent: z.number(),
    }),
  ),
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
  total: z
    .object({
      wh: z.number(),
      ot1: z.number(),
      ot15: z.number(),
      ot1hol: z.number(),
      ot2: z.number(),
      ot3: z.number(),
      total: z.number(),
    })
    .nullable(),
  items: z.array(worktimeDailyItemSchema),
})

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

export type ManhourItem = z.infer<typeof manhourItemSchema>
export type ManhourImportResponse = z.infer<typeof manhourImportResponseSchema>

export const personnelResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      craft: z.string(),
      wc: z.string(),
      confirmStatus: z.enum(['PENDING', 'OK']),
    }),
  ),
})

export const personnelRoleSchema = z.enum([
  'admin',
  'manager',
  'planner',
  'technician',
])

/** Personal Dashboard — สอดคล้องกับ backend/src/schemas/personnel.ts */
export const personnelDashboardProfileSchema = z.object({
  accountType: z.enum(['workcenter', 'member']),
  idwkctr: z.string(),
  username: z.string(),
  displayName: z.string(),
  wkctr: z.string(),
  plnt: z.string().nullable().optional(),
  userst: z.string(),
  userRole: personnelRoleSchema,
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  workGroup: z.string().nullable().optional(),
  workType: z.string().nullable().optional(),
  workLevel: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  tel: z.string().nullable().optional(),
  imgMember: z.string().nullable().optional(),
  birthdayLabel: z.string().nullable().optional(),
  workAgeLabel: z.string().nullable().optional(),
  startWorkDate: z.string().nullable().optional(),
  birthdayDate: z.string().nullable().optional(),
  lastLogin: z.string().nullable().optional(),
})

export const personnelPlanningItemSchema = z.object({
  idiw37: z.number().int(),
  wkorder: z.string(),
  wktype: z.string().nullable(),
  shortText: z.string().nullable(),
  functionalLoc: z.string().nullable(),
  equipment: z.string().nullable(),
  bscStart: z.string().nullable(),
  syst: z.string().nullable(),
})

export const personnelConfirmItemSchema = z.object({
  idclose: z.number().int(),
  idiw37: z.number().int(),
  wkorder: z.string(),
  confirmation: z.string(),
  wkctr: z.string(),
  timewk: z.number(),
  unitc: z.string(),
  stdate: z.string().nullable(),
  endate: z.string().nullable(),
  timeclose: z.string().nullable(),
})

export const personnelWorktimeBreakdownSchema = z.object({
  wh: z.number(),
  ot1: z.number(),
  ot15: z.number(),
  ot1hol: z.number(),
  ot2: z.number(),
  ot3: z.number(),
  total: z.number(),
})

export const personnelTeamMemberSchema = z.object({
  idwkctr: z.string(),
  displayName: z.string(),
  position: z.string().nullable(),
  workGroup: z.string().nullable(),
  openCount: z.number().int(),
  closedCount: z.number().int(),
  totalMinutes: z.number(),
})

export const personnelUnassignedWorkOrderSchema = z.object({
  idiw37: z.number().int(),
  wkorder: z.string(),
  wktype: z.string().nullable(),
  shortText: z.string().nullable(),
  equipment: z.string().nullable(),
  functionalLoc: z.string().nullable(),
  bscStart: z.string().nullable(),
  syst: z.string().nullable(),
  wkctr: z.string().nullable(),
})

export const personnelRoleDataSchema = z.object({
  team: z
    .object({
      groupCode: z.string().nullable(),
      groupName: z.string().nullable(),
      totalOpen: z.number().int(),
      totalClose: z.number().int(),
      members: z.array(personnelTeamMemberSchema),
    })
    .nullable()
    .optional(),
  unassigned: z
    .object({
      total: z.number().int(),
      items: z.array(personnelUnassignedWorkOrderSchema),
    })
    .nullable()
    .optional(),
  global: z
    .object({
      openTotal: z.number().int(),
      closeToday: z.number().int(),
      assignedTotal: z.number().int(),
    })
    .nullable()
    .optional(),
})

export const personnelDashboardResponseSchema = z.object({
  role: personnelRoleSchema,
  roleLabel: z.string(),
  profile: personnelDashboardProfileSchema,
  planning: z.object({
    openCount: z.number().int(),
    closedCount: z.number().int(),
    recent: z.array(personnelPlanningItemSchema),
  }),
  confirmation: z.object({
    totalClose: z.number().int(),
    totalMinutes: z.number(),
    recent: z.array(personnelConfirmItemSchema),
  }),
  worktime: personnelWorktimeBreakdownSchema.nullable(),
  roleData: personnelRoleDataSchema,
})

export type PersonnelRole = z.infer<typeof personnelRoleSchema>
export type PersonnelDashboardResponse = z.infer<typeof personnelDashboardResponseSchema>

/** Admin CRUD `M_personel.php` — แถวสำหรับตาราง/ฟอร์ม */
export const personnelAdminItemSchema = z.object({
  idwkctr: z.string(),
  titlewkctr: z.string().nullable(),
  namewkctr: z.string().nullable(),
  surnamewkctr: z.string().nullable(),
  titlewkctreng: z.string().nullable(),
  namewkctreng: z.string().nullable(),
  surnamewkctreng: z.string().nullable(),
  startwork: z.number().int().nullable(),
  wkctrdate: z.number().int().nullable(),
  iddepartment: z.string().nullable(),
  department: z.string().nullable(),
  idposition: z.string().nullable(),
  position: z.string().nullable(),
  wkctr: z.string(),
  plnt: z.string().nullable(),
  cat: z.string().nullable(),
  resp: z.string().nullable(),
  idwkctrgroup: z.string().nullable(),
  wkctrgroup: z.string().nullable(),
  idwkctrtype: z.string().nullable(),
  wkctrtype: z.string().nullable(),
  idwklevel: z.string().nullable(),
  wklevel: z.string().nullable(),
  wkctrtel: z.string().nullable(),
  wkctrmail: z.string().nullable(),
  labourcost: z.number(),
  userst: z.string(),
  userrole: personnelRoleSchema,
  workstatus: z.string().nullable(),
  imgmember: z.string().nullable(),
  imgmemberMime: z.string(),
  imgmemberBytes: z.number().int(),
  hasImage: z.boolean(),
})

export const personnelAdminListResponseSchema = z.object({
  items: z.array(personnelAdminItemSchema),
  totalRows: z.number().int(),
})

export const personnelAdminOkSchema = z.object({
  ok: z.literal(true),
  idwkctr: z.string(),
})

export const personnelImportRowResultSchema = z.object({
  rowNo: z.number().int(),
  idwkctr: z.string(),
  action: z.enum(['inserted', 'updated', 'skipped', 'error']),
  message: z.string().optional(),
})

export const personnelImportResponseSchema = z.object({
  fileName: z.string(),
  totalRows: z.number().int(),
  inserted: z.number().int(),
  updated: z.number().int(),
  skipped: z.number().int(),
  errors: z.number().int(),
  rows: z.array(personnelImportRowResultSchema),
})

export const personnelImageUploadResponseSchema = z.object({
  idwkctr: z.string(),
  imgmember: z.string(),
  mime: z.literal('image/webp'),
  bytes: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
})

export const personnelWorkstatusOptionSchema = z.object({
  workstatus: z.string(),
  wkstatusdes: z.string(),
  wkstcolor: z.string().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
})

export const personnelWorkstatusOptionsResponseSchema = z.object({
  items: z.array(personnelWorkstatusOptionSchema),
})

export type PersonnelAdminItem = z.infer<typeof personnelAdminItemSchema>
export type PersonnelImportResponse = z.infer<typeof personnelImportResponseSchema>
export type PersonnelWorkstatusOption = z.infer<typeof personnelWorkstatusOptionSchema>
export type PersonnelImageUploadResponse = z.infer<typeof personnelImageUploadResponseSchema>

/** Personnel Confirmation row (M_personel_confirm.php → view_countpersonelclose) */
export const personnelConfirmRowSchema = z.object({
  idiw37: z.number().int(),
  wkorder: z.string(),
  mntplan: z.string().nullable(),
  wktype: z.string().nullable(),
  mat: z.string().nullable(),
  equdescrip: z.string().nullable(),
  functionalloc: z.string().nullable(),
  shortText: z.string().nullable(),
  bscStart: z.string().nullable(),
  cday: z.string().nullable(),
  syst: z.string().nullable(),
  systemstatus: z.string().nullable(),
  wkstcolor: z.string().nullable(),
  wkctr: z.string().nullable(),
  plannedCount: z.number().int(),
  closedCount: z.number().int(),
  percentClose: z.number().int(),
  hasConfirm: z.boolean(),
})

export const personnelConfirmListResponseSchema = z.object({
  items: z.array(personnelConfirmRowSchema),
  totalRows: z.number().int(),
  summary: z.object({
    totalOpen: z.number().int(),
    fullyClosed: z.number().int(),
    inProgress: z.number().int(),
    notStarted: z.number().int(),
  }),
})

export type PersonnelConfirmRow = z.infer<typeof personnelConfirmRowSchema>
export type PersonnelConfirmListResponse = z.infer<
  typeof personnelConfirmListResponseSchema
>

export const masterDataItemGenericSchema = z.object({
  id: z.string(),
  code: z.string(),
  nameTh: z.string(),
  plant: z.string(),
  active: z.boolean(),
})

/** เทียบ `tbactivitytype` — M_activitytype.php */
export const activityTypeItemSchema = z.object({
  id: z.string(),
  mat: z.string(),
  matdescrip: z.string(),
  matcheck: z.string(),
})

/** เทียบ `tbdepartment` — M_department.php */
export const departmentItemSchema = z.object({
  id: z.string(),
  iddepartment: z.string(),
  department: z.string(),
})

/** เทียบ `tbequipment` — M_equipment.php */
export const equipmentItemSchema = z.object({
  id: z.string(),
  equipment: z.string(),
  equdescrip: z.string(),
  equipmentsub: z.string(),
  functionalloc: z.string(),
  equl: z.string(),
  equ1: z.string(),
  equea: z.string(),
})

/** เทียบ `tbfunctional` — M_functional.php */
export const functionalItemSchema = z.object({
  id: z.string(),
  functionalloc: z.string(),
  funldescrip: z.string(),
  functionallocsub: z.string(),
})

export const reasonItemSchema = z.object({
  id: z.string(),
  reasoncode: z.string(),
  reasonname: z.string(),
})

export const workStatusItemSchema = z.object({
  id: z.string(),
  syst: z.string(),
  wkstreason: z.string(),
  wkstcolor: z.string(),
})

export const workTypeItemSchema = z.object({
  id: z.string(),
  idwkctrtype: z.string(),
  wkctrtype: z.string(),
})

export const zbItemSchema = z.object({
  id: z.string(),
  wkzb: z.string(),
  zbdescrip: z.string(),
})

export const lineProductItemSchema = z.object({
  id: z.string(),
  productline: z.string(),
  prolinedescrip: z.string(),
})

export const zoneItemSchema = z.object({
  id: z.string(),
  idzone: z.string(),
  zone: z.string(),
  zonedescrip: z.string(),
  idproductline: z.string(),
  productline: z.string(),
})

export const machineItemSchema = z.object({
  id: z.string(),
  machine: z.string(),
  idzone: z.string(),
  zone: z.string(),
  idwkctrtype: z.string(),
  wkctrtype: z.string(),
})

export const materialItemSchema = z.object({
  id: z.string(),
  idmaterial: z.number(),
  wkorder: z.string(),
  matdoc: z.string(),
  entrydate: z.string(),
  matpo: z.string(),
  pstngdate: z.string(),
  docdate: z.string(),
  materialdesc: z.string(),
  matquantity: z.number(),
  matbun: z.string(),
  amountinlc: z.number(),
  crcy: z.string(),
  mvt: z.string(),
  costctr: z.string(),
  mattime: z.string(),
  matyr: z.string(),
  material: z.string(),
})

export const levelItemSchema = z.object({
  id: z.string(),
  idwklevel: z.string(),
  wklevel: z.string(),
})

export const positionItemSchema = z.object({
  id: z.string(),
  idposition: z.string(),
  position: z.string(),
})

export const groupItemSchema = z.object({
  id: z.string(),
  idwkctrgroup: z.number(),
  wkctrgroup: z.string(),
  wkctrdescription: z.string(),
})

export const tasklistItemSchema = z.object({
  id: z.string(),
  idtasklist: z.number(),
  idwkctrtype: z.string(),
  wkctrtype: z.string(),
  idzone: z.string(),
  zone: z.string(),
  idmachine: z.string(),
  mntplan: z.string(),
  tasklist: z.string(),
  legacy: z.string(),
  machine: z.string(),
  pmlist: z.string(),
  pmday: z.number(),
  machinestatus: z.number(),
  pmmin: z.number(),
  pmman: z.number(),
  manhour: z.number(),
  mat: z.string(),
  runhr: z.number(),
  mpoint: z.string(),
  bcprunhr: z.number(),
  gls: z.string(),
  ment: z.string(),
  freqhour: z.number(),
  plan: z.string(),
})

export const lineSchdulItemSchema = z.object({
  id: z.string(),
  idline: z.number(),
  idproductline: z.string(),
  productline: z.string(),
  lineday: z.number(),
  uptime: z.number(),
  linereason: z.string(),
})

export type MasterDataItemGeneric = z.infer<typeof masterDataItemGenericSchema>
export type ActivityTypeItem = z.infer<typeof activityTypeItemSchema>
export type DepartmentItem = z.infer<typeof departmentItemSchema>
export type EquipmentItem = z.infer<typeof equipmentItemSchema>
export type FunctionalItem = z.infer<typeof functionalItemSchema>
export type ReasonItem = z.infer<typeof reasonItemSchema>
export type WorkStatusItem = z.infer<typeof workStatusItemSchema>
export type WorkTypeItem = z.infer<typeof workTypeItemSchema>
export type ZbItem = z.infer<typeof zbItemSchema>
export type LineProductItem = z.infer<typeof lineProductItemSchema>
export type ZoneItem = z.infer<typeof zoneItemSchema>
export type MachineItem = z.infer<typeof machineItemSchema>
export type MaterialItem = z.infer<typeof materialItemSchema>
export type LevelItem = z.infer<typeof levelItemSchema>
export type PositionItem = z.infer<typeof positionItemSchema>
export type GroupItem = z.infer<typeof groupItemSchema>
export type TasklistItem = z.infer<typeof tasklistItemSchema>
export type LineSchdulItem = z.infer<typeof lineSchdulItemSchema>
export type MasterDataItem =
  | MasterDataItemGeneric
  | ActivityTypeItem
  | DepartmentItem
  | EquipmentItem
  | FunctionalItem
  | ReasonItem
  | WorkStatusItem
  | WorkTypeItem
  | ZbItem
  | LineProductItem
  | ZoneItem
  | MachineItem
  | MaterialItem
  | LevelItem
  | PositionItem
  | GroupItem
  | TasklistItem
  | LineSchdulItem

export function isActivityTypeItem(item: MasterDataItem): item is ActivityTypeItem {
  return 'mat' in item && 'matdescrip' in item
}

export const masterDataResponseSchema = z.object({
  entity: z.string(),
  items: z.array(
    z.union([
      activityTypeItemSchema,
      departmentItemSchema,
      equipmentItemSchema,
      functionalItemSchema,
      reasonItemSchema,
      workStatusItemSchema,
      workTypeItemSchema,
      zbItemSchema,
      lineProductItemSchema,
      zoneItemSchema,
      machineItemSchema,
      materialItemSchema,
      levelItemSchema,
      positionItemSchema,
      groupItemSchema,
      tasklistItemSchema,
      lineSchdulItemSchema,
      masterDataItemGenericSchema,
    ]),
  ),
})

export const reportsRangeSchema = z.object({
  from: z.number().int(),
  to: z.number().int(),
  fromDate: z.string(),
  toDate: z.string(),
})

export const kpiResponseSchema = z.object({
  range: reportsRangeSchema,
  utilization: z.array(z.number()),
  backlogHours: z.array(z.number()),
  labels: z.array(z.string()),
})

export const summaryWeeklyUtilizationBarSchema = z.object({
  idwkctr: z.string(),
  wkctr: z.string(),
  summaryHours: z.number(),
})

export type SummaryWeeklyUtilizationBar = z.infer<typeof summaryWeeklyUtilizationBarSchema>

export const summaryWeeklyRowSchema = z.object({
  wkctr: z.string(),
  idwkctr: z.string(),
  displayName: z.string().nullable(),
  pmWork: z.number(),
  pmUnit: z.string(),
  reactiveWork: z.number(),
  reactiveUnit: z.string(),
  rcaWork: z.number(),
  rcaUnit: z.string(),
  woCount: z.number().int(),
  hrHour: z.number(),
  otHour: z.number(),
  percentPm: z.number(),
  percentReactive: z.number(),
  percentRca: z.number(),
  percentTotal: z.number(),
})

export const summaryWeeklyResponseSchema = z.object({
  range: reportsRangeSchema,
  utilizationChart: z.array(summaryWeeklyUtilizationBarSchema),
  rows: z.array(summaryWeeklyRowSchema),
})

export const usersResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      username: z.string(),
      role: z.string(),
      active: z.boolean(),
    }),
  ),
})

export const userLogItemSchema = z.object({
  id: z.number(),
  actionTime: z.string(),
  action: z.string(),
  userIp: z.string().nullable(),
  myIp: z.string().nullable(),
})

export const userLogResponseSchema = z.object({
  items: z.array(userLogItemSchema),
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
  comdetail: z.string().min(1),
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

export type ConfirmationImportRowResult = z.infer<typeof confirmationImportRowResultSchema>
export type ConfirmationImportResponse = z.infer<typeof confirmationImportResponseSchema>

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

export type ConfirmationExportRow = z.infer<typeof confirmationExportRowSchema>
export type ConfirmationExportResponse = z.infer<typeof confirmationExportResponseSchema>
