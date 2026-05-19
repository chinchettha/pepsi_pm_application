import { z } from 'zod'

export const reportsRangeSchema = z.object({
  from: z.number().int(),
  to: z.number().int(),
  fromDate: z.string(),
  toDate: z.string(),
})

export const reportsKpiResponseSchema = z.object({
  range: reportsRangeSchema,
  labels: z.array(z.string()),
  utilization: z.array(z.number()),
  backlogHours: z.array(z.number()),
})

export const summaryWeeklyUtilizationBarSchema = z.object({
  idwkctr: z.string(),
  wkctr: z.string(),
  summaryHours: z.number(),
})

export const summaryWeeklyRowSchema = z.object({
  wkctr: z.string(),
  idwkctr: z.string(),
  displayName: z.string().nullable(),
  pmWork: z.number(),
  pmUnit: z.string(),
  reactiveWork: z.number(),
  reactiveUnit: z.string(),
  rcaWork: z.number(),
  rcaUnit: z.string(),
  woCount: z.number().int(),
  hrHour: z.number(),
  otHour: z.number(),
  percentPm: z.number(),
  percentReactive: z.number(),
  percentRca: z.number(),
  percentTotal: z.number(),
})

export const summaryWeeklyResponseSchema = z.object({
  range: reportsRangeSchema,
  utilizationChart: z.array(summaryWeeklyUtilizationBarSchema),
  rows: z.array(summaryWeeklyRowSchema),
})

export type ReportsKpiResponse = z.infer<typeof reportsKpiResponseSchema>
export type SummaryWeeklyResponse = z.infer<typeof summaryWeeklyResponseSchema>
