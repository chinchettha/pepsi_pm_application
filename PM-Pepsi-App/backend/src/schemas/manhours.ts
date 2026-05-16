import { z } from 'zod'

export const worktimeBreakdownSchema = z.object({
  wh: z.number(),
  ot1: z.number(),
  ot15: z.number(),
  ot1hol: z.number(),
  ot2: z.number(),
  ot3: z.number(),
  total: z.number(),
})

export const manhoursSummaryResponseSchema = z.object({
  weeks: z.array(
    z.object({
      week: z.string(),
      planned: z.number(),
      actual: z.number(),
      backlog: z.number(),
    }),
  ),
})
