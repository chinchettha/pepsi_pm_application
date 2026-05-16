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
