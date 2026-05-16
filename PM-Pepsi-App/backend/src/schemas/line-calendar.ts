/** รูปแบบเดียวกับ calendar events — ใช้ร่วมกับ frontend calendarEventsResponseSchema */
import { z } from 'zod'

export const lineCalendarEventSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  orderId: z.string(),
  color: z.string(),
  description: z.string().optional(),
})

export const lineCalendarEventsResponseSchema = z.object({
  items: z.array(lineCalendarEventSchema),
  year: z.number(),
  month: z.number(),
})
