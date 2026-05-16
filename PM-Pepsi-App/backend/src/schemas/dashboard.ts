import { z } from 'zod'

export const dashboardSummarySchema = z.object({
  openOrders: z.number(),
  closedThisMonth: z.number(),
  pendingPersonnel: z.number(),
  iw37nLastImport: z.string().nullable(),
})
