import {
  backlogEventsResponseSchema,
  backlogFilterOptionsResponseSchema,
  backlogSearchBodySchema,
  calendarEventsResponseSchema,
  dashboardSummarySchema,
  iw37nBatchesResponseSchema,
  iw37nImportResponseSchema,
  kpiResponseSchema,
  manhoursResponseSchema,
  masterDataResponseSchema,
  personnelResponseSchema,
  planningResponseSchema,
  usersResponseSchema,
  movePlanReasonsResponseSchema,
  movePlanRequestSchema,
  movePlanResponseSchema,
  workOrderDetailSchema,
  workOrderListItemSchema,
  workOrderSuggestionsResponseSchema,
  workOrdersResponseSchema,
} from '@/api/schemas'
import { fetchApi } from '@/lib/fetch-api'
import { z } from 'zod'

export type WorkOrderListItem = z.infer<typeof workOrderListItemSchema>
export async function fetchDashboardSummary() {
  const json = await fetchApi<unknown>('/api/v1/dashboard/summary')
  return dashboardSummarySchema.parse(json)
}

export async function fetchWorkOrders(params?: { q?: string; status?: string }) {
  const sp = new URLSearchParams()
  if (params?.q) sp.set('q', params.q)
  if (params?.status) sp.set('status', params.status)
  const qs = sp.toString()
  const path = qs ? `/api/v1/work-orders?${qs}` : '/api/v1/work-orders'
  const json = await fetchApi<unknown>(path)
  return workOrdersResponseSchema.parse(json).items
}

export async function fetchWorkOrderDetail(id: string) {
  const json = await fetchApi<unknown>(`/api/v1/work-orders/${encodeURIComponent(id)}`)
  return workOrderDetailSchema.parse(json).item
}

export async function fetchMovePlanReasons() {
  const json = await fetchApi<unknown>('/api/v1/scheduling/move-reasons')
  return movePlanReasonsResponseSchema.parse(json).items
}

export async function postMovePlan(body: z.infer<typeof movePlanRequestSchema>) {
  const payload = movePlanRequestSchema.parse(body)
  const json = await fetchApi<unknown>('/api/v1/scheduling/move-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return movePlanResponseSchema.parse(json)
}

export async function fetchWorkOrderSuggestions(q: string) {
  const json = await fetchApi<unknown>(
    `/api/v1/work-orders/suggestions?${new URLSearchParams({ q })}`,
  )
  return workOrderSuggestionsResponseSchema.parse(json).items
}

export type BacklogSearchInput = z.infer<typeof backlogSearchBodySchema>

export async function fetchCalendarEvents(year: number, month: number) {
  const json = await fetchApi<unknown>(
    `/api/v1/calendar/events?year=${year}&month=${month}`,
  )
  return calendarEventsResponseSchema.parse(json)
}

export async function fetchLineCalendarEvents(year: number, month: number) {
  const json = await fetchApi<unknown>(
    `/api/v1/line-calendar/events?year=${year}&month=${month}`,
  )
  return calendarEventsResponseSchema.parse(json)
}

export async function fetchBacklogFilterOptions() {
  const json = await fetchApi<unknown>('/api/v1/backlog/filter-options')
  return backlogFilterOptionsResponseSchema.parse(json)
}

export async function postBacklogEvents(body: BacklogSearchInput) {
  const payload = backlogSearchBodySchema.parse(body)
  const json = await fetchApi<unknown>('/api/v1/backlog/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return backlogEventsResponseSchema.parse(json)
}

export async function fetchIw37nBatches() {
  const json = await fetchApi<unknown>('/api/v1/iw37n/batches')
  return iw37nBatchesResponseSchema.parse(json).items
}

export async function postIw37nImport(file: File) {
  const form = new FormData()
  form.append('file', file)
  const json = await fetchApi<unknown>('/api/v1/iw37n/import', {
    method: 'POST',
    body: form,
  })
  return iw37nImportResponseSchema.parse(json).batch
}

export async function fetchMasterData(entity: string) {
  const json = await fetchApi<unknown>(
    `/api/v1/master-data/${encodeURIComponent(entity)}`,
  )
  return masterDataResponseSchema.parse(json).items
}

export async function fetchPlanning() {
  const json = await fetchApi<unknown>('/api/v1/planning/orders')
  return planningResponseSchema.parse(json).items
}

export async function fetchManhours() {
  const json = await fetchApi<unknown>('/api/v1/manhours/summary')
  return manhoursResponseSchema.parse(json).weeks
}

export async function fetchPersonnel(tab: 'all' | 'pending') {
  const json = await fetchApi<unknown>(
    `/api/v1/personnel/technicians?tab=${tab === 'pending' ? 'pending' : 'all'}`,
  )
  return personnelResponseSchema.parse(json).items
}

export async function fetchKpi() {
  const json = await fetchApi<unknown>('/api/v1/reports/kpi')
  return kpiResponseSchema.parse(json)
}

export async function fetchUsers() {
  const json = await fetchApi<unknown>('/api/v1/users')
  return usersResponseSchema.parse(json).items
}
