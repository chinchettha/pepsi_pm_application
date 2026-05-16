import { z } from 'zod'

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
