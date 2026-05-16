/** รูปแบบเดียวกับ frontend calendarEventsResponseSchema */
import { z } from 'zod'

export const calendarEventSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  orderId: z.string(),
  color: z.string(),
  description: z.string().optional(),
})

export const calendarEventsResponseSchema = z.object({
  items: z.array(calendarEventSchema),
  year: z.number(),
  month: z.number(),
})
