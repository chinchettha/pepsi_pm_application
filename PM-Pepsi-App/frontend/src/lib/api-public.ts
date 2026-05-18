import {
  backlogEventsResponseSchema,
  backlogFilterDetailResponseSchema,
  backlogFilterOptionsResponseSchema,
  backlogManhourResponseSchema,
  backlogManhourSearchBodySchema,
  backlogSearchBodySchema,
  calendarEventsResponseSchema,
  calendarFilterOptionsResponseSchema,
  calendarSearchBodySchema,
  dashboardSummarySchema,
  iw37nBatchesResponseSchema,
  iw37nBatchRowsResponseSchema,
  iw37nItemResponseSchema,
  iw37nItemsResponseSchema,
  iw37nImportResponseSchema,
  kpiResponseSchema,
  manhoursResponseSchema,
  masterDataResponseSchema,
  personnelResponseSchema,
  planningResponseSchema,
  confirmationByWorkOrderResponseSchema,
  confirmationCommentBodySchema,
  confirmationCommentResponseSchema,
  confirmationCommentsResponseSchema,
  confirmationImageDataResponseSchema,
  confirmationImagesResponseSchema,
  userLogResponseSchema,
  workcentersResponseSchema,
  usersResponseSchema,
  movePlanReasonsResponseSchema,
  movePlanRequestSchema,
  movePlanResponseSchema,
  workOrderFilterOptionsResponseSchema,
  workOrderDetailSchema,
  workOrderListItemSchema,
  workOrderModalDetailSchema,
  workOrderPlanningOkResponseSchema,
  workOrderPlanningUpsertBodySchema,
  workOrderSearchBodySchema,
  workOrderSearchResponseSchema,
  workOrderSuggestionsResponseSchema,
  workOrderTeamPatchResponseSchema,
  workOrderTeamPatchSchema,
  workOrdersResponseSchema,
} from '@/api/schemas'
import { fetchApi } from '@/lib/fetch-api'
import { getAuthToken } from '@/features/auth/login-api'
import { getApiBaseUrl } from '@/lib/api-client'
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

export async function fetchWorkOrderModalDetail(id: string, date?: string) {
  const sp = new URLSearchParams()
  if (date) sp.set('date', date)
  const qs = sp.toString()
  const path = qs
    ? `/api/v1/work-orders/${encodeURIComponent(id)}/modal-detail?${qs}`
    : `/api/v1/work-orders/${encodeURIComponent(id)}/modal-detail`
  const json = await fetchApi<unknown>(path)
  return workOrderModalDetailSchema.parse(json)
}

export async function putWorkOrderPlanning(id: string, body: z.infer<typeof workOrderPlanningUpsertBodySchema>) {
  const payload = workOrderPlanningUpsertBodySchema.parse(body)
  const json = await fetchApi<unknown>(`/api/v1/work-orders/${encodeURIComponent(id)}/planning`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return workOrderPlanningOkResponseSchema.parse(json)
}

export async function deleteWorkOrderPlanning(id: string) {
  const json = await fetchApi<unknown>(`/api/v1/work-orders/${encodeURIComponent(id)}/planning`, {
    method: 'DELETE',
  })
  return workOrderPlanningOkResponseSchema.parse(json)
}

export async function fetchWorkOrderFilterOptions() {
  const json = await fetchApi<unknown>('/api/v1/work-orders/filter-options')
  return workOrderFilterOptionsResponseSchema.parse(json)
}

export type WorkOrderSearchInput = z.infer<typeof workOrderSearchBodySchema>
export async function postWorkOrdersSearch(body: WorkOrderSearchInput) {
  const payload = workOrderSearchBodySchema.parse(body)
  const json = await fetchApi<unknown>('/api/v1/work-orders/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return workOrderSearchResponseSchema.parse(json).items
}

export async function putWorkOrderTeam(id: string, team: z.infer<typeof workOrderTeamPatchSchema>['team']) {
  const payload = workOrderTeamPatchSchema.parse({ team })
  const json = await fetchApi<unknown>(`/api/v1/work-orders/${encodeURIComponent(id)}/team`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return workOrderTeamPatchResponseSchema.parse(json)
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

export async function fetchCalendarFilterOptions() {
  const json = await fetchApi<unknown>('/api/v1/calendar/filter-options')
  return calendarFilterOptionsResponseSchema.parse(json)
}

export type CalendarSearchInput = z.infer<typeof calendarSearchBodySchema>
export async function postCalendarEvents(body: CalendarSearchInput) {
  const payload = calendarSearchBodySchema.parse(body)
  const json = await fetchApi<unknown>('/api/v1/calendar/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
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

export async function postBacklogFilterDetail(body: BacklogSearchInput) {
  const payload = backlogSearchBodySchema.parse(body)
  const json = await fetchApi<unknown>('/api/v1/backlog/filter-detail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return backlogFilterDetailResponseSchema.parse(json)
}

export type BacklogManhourInput = z.infer<typeof backlogManhourSearchBodySchema>
export async function postBacklogManhourSummary(body: BacklogManhourInput) {
  const payload = backlogManhourSearchBodySchema.parse(body)
  const json = await fetchApi<unknown>('/api/v1/backlog/manhour-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return backlogManhourResponseSchema.parse(json)
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
  return iw37nImportResponseSchema.parse(json)
}

export async function fetchIw37nBatchRows(batchId: string, opts?: { limit?: number; offset?: number }) {
  const sp = new URLSearchParams()
  if (typeof opts?.limit === 'number') sp.set('limit', String(opts.limit))
  if (typeof opts?.offset === 'number') sp.set('offset', String(opts.offset))
  const qs = sp.toString()
  const path = qs
    ? `/api/v1/iw37n/batches/${encodeURIComponent(batchId)}/rows?${qs}`
    : `/api/v1/iw37n/batches/${encodeURIComponent(batchId)}/rows`
  const json = await fetchApi<unknown>(path)
  return iw37nBatchRowsResponseSchema.parse(json)
}

export async function fetchIw37nBatchCsv(batchId: string): Promise<Blob> {
  const base = getApiBaseUrl()
  const p = `/api/v1/iw37n/batches/${encodeURIComponent(batchId)}/export.csv`
  const url = base ? `${base}${p}` : p
  const token = getAuthToken()
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'text/csv',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.blob()
}

export async function fetchIw37nItems(params?: { q?: string; limit?: number; offset?: number }) {
  const sp = new URLSearchParams()
  if (params?.q) sp.set('q', params.q)
  if (typeof params?.limit === 'number') sp.set('limit', String(params.limit))
  if (typeof params?.offset === 'number') sp.set('offset', String(params.offset))
  const qs = sp.toString()
  const path = qs ? `/api/v1/iw37n/items?${qs}` : '/api/v1/iw37n/items'
  const json = await fetchApi<unknown>(path)
  return iw37nItemsResponseSchema.parse(json).items
}

export async function fetchIw37nItem(id: number) {
  const json = await fetchApi<unknown>(`/api/v1/iw37n/items/${encodeURIComponent(String(id))}`)
  return iw37nItemResponseSchema.parse(json).item
}

export async function putIw37nItem(id: number, body: any) {
  const json = await fetchApi<unknown>(`/api/v1/iw37n/items/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return iw37nItemResponseSchema.parse(json).item
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

export async function fetchUserLog(params?: { limit?: number; offset?: number }) {
  const sp = new URLSearchParams()
  if (typeof params?.limit === 'number') sp.set('limit', String(params.limit))
  if (typeof params?.offset === 'number') sp.set('offset', String(params.offset))
  const qs = sp.toString()
  const path = qs ? `/api/v1/user-log?${qs}` : '/api/v1/user-log'
  const json = await fetchApi<unknown>(path)
  return userLogResponseSchema.parse(json).items
}

export async function fetchWorkcenters() {
  const json = await fetchApi<unknown>('/api/v1/workcenters')
  return workcentersResponseSchema.parse(json).items
}

export async function fetchConfirmationByWorkOrder(wkorder: string) {
  const json = await fetchApi<unknown>(
    `/api/v1/confirmation/by-wkorder/${encodeURIComponent(wkorder)}`,
  )
  return confirmationByWorkOrderResponseSchema.parse(json)
}

export async function postConfirmationClose(body: {
  idiw37: number
  wkctr: string
  startD: string
  startT: string
  endD: string
  endT: string
}) {
  const json = await fetchApi<unknown>(`/api/v1/confirmation/${body.idiw37}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wkctr: body.wkctr,
      startD: body.startD,
      startT: body.startT,
      endD: body.endD,
      endT: body.endT,
    }),
  })
  const ok = z.object({ ok: z.literal(true) }).safeParse(json)
  if (!ok.success) throw new Error('Unexpected response')
  return ok.data
}

export async function deleteConfirmationClose(idclose: number) {
  const json = await fetchApi<unknown>(`/api/v1/confirmation/close/${idclose}`, {
    method: 'DELETE',
  })
  const ok = z.object({ ok: z.literal(true) }).safeParse(json)
  if (!ok.success) throw new Error('Unexpected response')
  return ok.data
}

export async function fetchConfirmationComments(idiw37: number) {
  const json = await fetchApi<unknown>(`/api/v1/confirmation/${idiw37}/comments`)
  return confirmationCommentsResponseSchema.parse(json).items
}

export async function postConfirmationComment(idiw37: number, comdetail: string) {
  const payload = confirmationCommentBodySchema.parse({ comdetail })
  const json = await fetchApi<unknown>(`/api/v1/confirmation/${idiw37}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return confirmationCommentResponseSchema.parse(json).item
}

export async function putConfirmationComment(idcom: number, comdetail: string) {
  const payload = confirmationCommentBodySchema.parse({ comdetail })
  const json = await fetchApi<unknown>(`/api/v1/confirmation/comments/${idcom}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return confirmationCommentResponseSchema.parse(json).item
}

export async function deleteConfirmationComment(idcom: number) {
  const json = await fetchApi<unknown>(`/api/v1/confirmation/comments/${idcom}`, {
    method: 'DELETE',
  })
  const ok = z.object({ ok: z.literal(true) }).safeParse(json)
  if (!ok.success) throw new Error('Unexpected response')
  return ok.data
}

export async function fetchConfirmationImages(idiw37: number) {
  const json = await fetchApi<unknown>(`/api/v1/confirmation/${idiw37}/images`)
  return confirmationImagesResponseSchema.parse(json).items
}

export async function postConfirmationImage(idiw37: number, file: File) {
  const form = new FormData()
  form.append('file', file)
  const json = await fetchApi<unknown>(`/api/v1/confirmation/${idiw37}/images`, {
    method: 'POST',
    body: form,
  })
  return confirmationImagesResponseSchema.parse(json).items[0]
}

export async function deleteConfirmationImage(idcimg: number) {
  const json = await fetchApi<unknown>(`/api/v1/confirmation/images/${idcimg}`, {
    method: 'DELETE',
  })
  const ok = z.object({ ok: z.literal(true) }).safeParse(json)
  if (!ok.success) throw new Error('Unexpected response')
  return ok.data
}

export async function fetchConfirmationImageData(idcimg: number) {
  const json = await fetchApi<unknown>(`/api/v1/confirmation/images/${idcimg}/data`)
  return confirmationImageDataResponseSchema.parse(json)
}
