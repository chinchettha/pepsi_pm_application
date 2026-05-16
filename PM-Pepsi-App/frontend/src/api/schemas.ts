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

export const iw37nBatchItemSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  importedAt: z.string(),
  rows: z.number(),
  sha256: z.string(),
  status: z.enum(['OK', 'PARTIAL', 'ERR']),
})

export const iw37nBatchesResponseSchema = z.object({
  items: z.array(iw37nBatchItemSchema),
})

export const iw37nImportResponseSchema = z.object({
  batch: iw37nBatchItemSchema,
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

export type MasterDataItemGeneric = z.infer<typeof masterDataItemGenericSchema>
export type ActivityTypeItem = z.infer<typeof activityTypeItemSchema>
export type MasterDataItem = MasterDataItemGeneric | ActivityTypeItem

export function isActivityTypeItem(item: MasterDataItem): item is ActivityTypeItem {
  return 'mat' in item && 'matdescrip' in item
}

export const masterDataResponseSchema = z.object({
  entity: z.string(),
  items: z.array(z.union([activityTypeItemSchema, masterDataItemGenericSchema])),
})

export const kpiResponseSchema = z.object({
  utilization: z.array(z.number()),
  backlogHours: z.array(z.number()),
  labels: z.array(z.string()),
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
