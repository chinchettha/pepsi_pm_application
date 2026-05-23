/** รูปแบบเดียวกับ frontend calendarEventsResponseSchema */
import { z } from 'zod'
import { woPmPhaseSchema } from '../lib/wo-pm-phase.js'

export const calendarEventSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  orderId: z.string(),
  color: z.string(),
  description: z.string().optional(),
  /** false เมื่อ syst ไม่ใช่ CRTD/REL (แผนเขียว TECO ห้าม drag) */
  canMovePlan: z.boolean(),
  syst: z.string().optional(),
  pmPhase: z.enum(woPmPhaseSchema),
})

export const calendarEventsResponseSchema = z.object({
  items: z.array(calendarEventSchema),
  year: z.number(),
  month: z.number(),
})

export const calendarFilterOptionSchema = z.object({
  code: z.string(),
  label: z.string(),
})

export const calendarFilterOptionsResponseSchema = z.object({
  activities: z.array(calendarFilterOptionSchema),
  wktypes: z.array(calendarFilterOptionSchema),
  statuses: z.array(calendarFilterOptionSchema),
  workcenters: z.array(calendarFilterOptionSchema),
  teams: z.array(calendarFilterOptionSchema),
  functionals: z.array(calendarFilterOptionSchema),
  equipments: z.array(calendarFilterOptionSchema),
})

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const calendarSearchBodySchema = z.object({
  year: z.number().int().min(1970).max(2100),
  month: z.number().int().min(1).max(12),
  activity: z.array(z.string()),
  wktype: z.array(z.string()),
  status: z.array(z.string()),
  wkctr: z.array(z.string()),
  team: z.array(z.string()),
  functionalloc: z.array(z.string()),
  equipment: z.array(z.string()),
  fromDate: isoDateSchema.optional(),
  toDate: isoDateSchema.optional(),
})

/** เทียบ `FilterDetail.php` + `FilterDetail_AddTeam.php` บน W_calendar.php */
export const calendarFilterDetailTeamSchema = z.object({
  count: z.number(),
  workSumMinutes: z.number(),
})

export const calendarFilterDetailResponseSchema = z.object({
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
  teamA: calendarFilterDetailTeamSchema,
  teamB: calendarFilterDetailTeamSchema,
  teamP: calendarFilterDetailTeamSchema,
})
