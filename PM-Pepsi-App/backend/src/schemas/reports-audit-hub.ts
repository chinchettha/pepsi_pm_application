import { z } from 'zod'

export const auditHubResponseSchema = z.object({
  retentionDays: z.number().int(),
  retentionCutoffDate: z.string(),
  range: z.object({ from: z.string(), to: z.string() }),
  totals: z.object({
    events: z.number().int(),
    denied: z.number().int(),
    imports: z.number().int(),
    planning: z.number().int(),
    confirmations: z.number().int(),
    workOrders: z.number().int(),
  }),
  byPrefix: z.array(
    z.object({
      prefix: z.string(),
      label: z.string(),
      count: z.number().int(),
    }),
  ),
})

export type AuditHubResponse = z.infer<typeof auditHubResponseSchema>
