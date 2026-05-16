import { z } from 'zod'
import { calendarEventSchema } from './calendar.js'

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
  year: z.number().int().min(1970).max(2100),
  month: z.number().int().min(1).max(12),
  activity: z.array(z.string()),
  wktype: z.array(z.string()),
  functionalloc: z.array(z.string()),
  equipment: z.array(z.string()),
  wkctr: z.array(z.string()),
})

export const backlogEventsResponseSchema = z.object({
  items: z.array(calendarEventSchema),
  year: z.number(),
  month: z.number(),
})
