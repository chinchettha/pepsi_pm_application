import { CanPermission } from '@/components/auth/CanPermission'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { WorkOrderAutocomplete } from '@/components/scheduling/WorkOrderAutocomplete'
import { FilterDetailSummary } from '@/components/scheduling/FilterDetailSummary'
import { WoPmPhaseBadge, WoPmPhaseLegend } from '@/components/scheduling/WoPmPhaseBadge'
import { WktypeDisplay } from '@/components/scheduling/WktypeDisplay'
import { WktypeZdMappingNote } from '@/components/scheduling/WktypeZdMappingNote'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableStickyClass,
} from '@/components/ui/table'
import type { WorkStatusItem } from '@/api/schemas'
import {
  fetchMasterData,
  fetchWorkOrderFilterOptions,
  patchWorkOrderTeamBatch,
  postWorkOrderFilterDetail,
  postWorkOrdersSearch,
  putWorkOrderTeam,
} from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  applyPendingTeamToFilterDetail,
  normalizeTeamCode,
  patchRowsTeam,
} from '@/lib/filter-detail-team-live'
import { AlertCircle, ClipboardList, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const filterFormSchema = z.object({
  q: z.string(),
  activity: z.array(z.string()),
  wktype: z.array(z.string()),
  status: z.array(z.string()),
  wkctr: z.array(z.string()),
  team: z.array(z.string()),
  functionalloc: z.array(z.string()),
  equipment: z.array(z.string()),
})

type FilterForm = z.infer<typeof filterFormSchema>
type TeamCode = '' | 'A' | 'B' | 'P'

const normalizeTeam = normalizeTeamCode

function FilterMultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { code: string; label: string }[]
  value: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-app">{label}</Label>
      <select
        multiple
        size={5}
        className="w-full min-w-[10rem] rounded-button border border-app bg-[var(--app-surface)] px-2 py-1 text-body-sm shadow-sm"
        value={value}
        onChange={(e) => {
          onChange([...e.target.selectedOptions].map((o) => o.value))
        }}
      >
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="text-caption">เลือกหลายค่า: กด Ctrl (Windows) หรือ Cmd (Mac) ค้าง</p>
    </div>
  )
}

function isWorkStatusItem(x: unknown): x is WorkStatusItem {
  if (!x || typeof x !== 'object') return false
  const r = x as Record<string, unknown>
  return typeof r.syst === 'string' && typeof r.wkstcolor === 'string'
}

export function WorkOrdersPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [openId, setOpenId] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    if (!id) return
    setOpenId(id)
  }, [id])

  const queryClient = useQueryClient()
  const canRead = usePermission('work-orders.read')
  const canWrite = usePermission('work-orders.write')
  const canIw37n = usePermission('iw37n.read')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [pendingTeam, setPendingTeam] = useState<Record<string, TeamCode>>({})

  const form = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      q: '',
      activity: [],
      wktype: [],
      status: [],
      wkctr: [],
      team: [],
      functionalloc: [],
      equipment: [],
    },
  })

  const [submitted, setSubmitted] = useState<FilterForm>({
    q: '',
    activity: [],
    wktype: [],
    status: [],
    wkctr: [],
    team: [],
    functionalloc: [],
    equipment: [],
  })

  const optsQ = useQuery({
    queryKey: ['work-orders', 'filter-options'],
    queryFn: fetchWorkOrderFilterOptions,
    staleTime: 300_000,
    enabled: canRead,
  })

  const submittedKey = useMemo(() => JSON.stringify({ submitted, fromDate, toDate }), [submitted, fromDate, toDate])
  const searchQueryKey = useMemo(
    () => ['work-orders', 'search', submittedKey] as const,
    [submittedKey],
  )
  const filterDetailQueryKey = useMemo(
    () => ['work-orders', 'filter-detail', submittedKey] as const,
    [submittedKey],
  )

  const searchPayload = useMemo(
    () => ({
      ...submitted,
      q: submitted.q.trim() ? submitted.q.trim() : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [submitted, fromDate, toDate],
  )

  const listQuery = useQuery({
    queryKey: searchQueryKey,
    queryFn: () => postWorkOrdersSearch(searchPayload),
    placeholderData: keepPreviousData,
    enabled: canRead,
  })

  const filterDetailQ = useQuery({
    queryKey: filterDetailQueryKey,
    queryFn: () => postWorkOrderFilterDetail(searchPayload),
    enabled: canRead && Boolean(submittedKey),
    placeholderData: keepPreviousData,
  })

  const statusItemsQ = useQuery({
    queryKey: ['master-data', 'workstatus'],
    queryFn: () => fetchMasterData('workstatus'),
    staleTime: 300_000,
    enabled: canRead,
  })

  const rows = listQuery.data ?? []
  const rowIds = useMemo(() => rows.map((r) => r.id), [rows])

  const liveFilterDetail = useMemo(() => {
    if (!filterDetailQ.data) return { data: undefined, hasPendingChanges: false }
    return applyPendingTeamToFilterDetail(filterDetailQ.data, rows, pendingTeam)
  }, [filterDetailQ.data, rows, pendingTeam])

  useEffect(() => {
    setPendingTeam({})
    setSelectedIds(new Set())
  }, [submittedKey])

  useEffect(() => {
    if (!listQuery.data) return
    setPendingTeam((prev) => {
      const next = { ...prev }
      const ids = new Set(listQuery.data.map((r) => r.id))
      for (const key of Object.keys(next)) {
        if (!ids.has(key)) delete next[key]
      }
      for (const row of listQuery.data) {
        if (!(row.id in next)) {
          next[row.id] = normalizeTeam(row.team)
        }
      }
      return next
    })
  }, [listQuery.data])

  const patchTeamInCaches = useCallback(
    (updates: Map<string, TeamCode>) => {
      queryClient.setQueryData(searchQueryKey, (old) => {
        if (!old) return old
        return patchRowsTeam(old, updates)
      })
      queryClient.setQueryData(filterDetailQueryKey, (old) => {
        if (!old || rows.length === 0) return old
        const patchedRows = patchRowsTeam(rows, updates)
        return applyPendingTeamToFilterDetail(old, patchedRows, {}).data
      })
    },
    [queryClient, searchQueryKey, filterDetailQueryKey, rows],
  )

  const allPageSelected =
    rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id))
  const somePageSelected = rowIds.some((id) => selectedIds.has(id))

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(rowIds))
  }

  const toggleRowSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const applyTeamToSelected = (team: TeamCode) => {
    setPendingTeam((prev) => {
      const next = { ...prev }
      for (const id of selectedIds) next[id] = team
      return next
    })
  }

  const rowTeamMut = useMutation({
    mutationFn: ({ id, team }: { id: string; team: 'A' | 'B' | 'P' }) => putWorkOrderTeam(id, team),
    onSuccess: async (_data, { id, team }) => {
      toast.success(`เพิ่มงานให้ Team ${team} สำเร็จ`)
      patchTeamInCaches(new Map([[id, team]]))
      setPendingTeam((prev) => ({ ...prev, [id]: team }))
      void queryClient.invalidateQueries({ queryKey: ['work-orders', 'events'] })
      void queryClient.invalidateQueries({ queryKey: ['backlog', 'events'] })
      void queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const setRowPendingTeam = (id: string, team: TeamCode) => {
    setPendingTeam((prev) => ({ ...prev, [id]: team }))
    if (team === 'A' || team === 'B' || team === 'P') {
      rowTeamMut.mutate({ id, team })
    }
  }

  const bulkTeamMut = useMutation({
    mutationFn: async (groups: { team: TeamCode; ids: string[] }[]) => {
      const results = []
      for (const g of groups) {
        if (g.ids.length === 0) continue
        results.push(await patchWorkOrderTeamBatch({ ids: g.ids, team: g.team }))
      }
      return results
    },
    onMutate: async (groups) => {
      const updates = new Map<string, TeamCode>()
      for (const g of groups) {
        for (const id of g.ids) updates.set(id, g.team)
      }
      await queryClient.cancelQueries({ queryKey: searchQueryKey })
      const previousSearch = queryClient.getQueryData(searchQueryKey)
      const previousFilter = queryClient.getQueryData(filterDetailQueryKey)
      patchTeamInCaches(updates)
      return { previousSearch, previousFilter }
    },
    onError: (e: Error, _groups, ctx) => {
      toast.error(e.message)
      if (ctx?.previousSearch !== undefined) {
        queryClient.setQueryData(searchQueryKey, ctx.previousSearch)
      }
      if (ctx?.previousFilter !== undefined) {
        queryClient.setQueryData(filterDetailQueryKey, ctx.previousFilter)
      }
    },
    onSuccess: async (results) => {
      const updated = results.reduce((n, r) => n + r.updated.length, 0)
      const notFound = results.flatMap((r) => r.notFound)
      if (notFound.length > 0) {
        toast.warning(`บันทึกทีม ${updated} รายการ · ไม่พบ ${notFound.length} รายการ`)
      } else {
        toast.success(`บันทึกทีม ${updated} รายการ`)
      }
      setSelectedIds(new Set())
      void queryClient.invalidateQueries({ queryKey: searchQueryKey, refetchType: 'none' })
      void queryClient.invalidateQueries({ queryKey: filterDetailQueryKey })
      void queryClient.invalidateQueries({ queryKey: ['work-orders', 'events'] })
      void queryClient.invalidateQueries({ queryKey: ['backlog', 'events'] })
      void queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] })
    },
  })

  const onBulkSave = () => {
    if (selectedIds.size === 0) {
      toast.error('เลือกใบงานในตารางก่อน')
      return
    }
    const byTeam = new Map<TeamCode, string[]>()
    for (const id of selectedIds) {
      const team = pendingTeam[id] ?? ''
      const list = byTeam.get(team) ?? []
      list.push(id)
      byTeam.set(team, list)
    }
    const groups = [...byTeam.entries()].map(([team, ids]) => ({ team, ids }))
    bulkTeamMut.mutate(groups)
  }

  const onSearch = form.handleSubmit((data) => {
    setSubmitted(data)
  })

  if (!canRead) {
    return (
      <AppPageShell
        title="ใบงาน (Work Order)"
        description="ค้นหา กรอง มอบหมายทีม A/B/P และเปิดรายละเอียดใบงาน"
      >
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">work-orders.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <>
      <AppPageShell
        title="ใบงาน (Work Order)"
        description="กรองและค้นหา IW37N · มอบหมายทีม A/B/P · เปิด modal รายละเอียด (แท็บ Task List)"
        contentClassName="space-y-4"
        headerActions={
          <>
            <Badge variant="secondary" className="text-xs">
              โรงงาน 7151
            </Badge>
            <CanPermission permission="calendar.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/calendar">ปฏิทิน Work scheduling</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="backlog.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/backlog">Backlog</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="iw37n.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/iw37n">นำเข้า IW37N</Link>
              </Button>
            </CanPermission>
          </>
        }
      >
        <AppCard pad="compact" className="max-w-md space-y-2">
          <p className="text-body-sm font-medium text-app">ค้นหาเลขที่ใบงานด่วน</p>
          <p className="text-caption">พิมพ์เลข WO แล้วเลือกจากรายการ — เปิดรายละเอียดทันที</p>
          <WorkOrderAutocomplete
            value={form.watch('q')}
            onSelect={(item) => {
              form.setValue('q', item.wkorder)
              setOpenId(item.id)
            }}
          />
        </AppCard>

        <AppCard pad="compact" className="space-y-4">
          <form onSubmit={onSearch} className="space-y-4">
          <p className="text-body-sm font-medium text-app">ตัวกรองใบงาน</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="space-y-2">
              <Label className="text-app" htmlFor="wo-q">
                ค้นหา (เลขที่ / ชื่อ / equipment)
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-app-muted" />
                <Input
                  id="wo-q"
                  className="pl-8"
                  value={form.watch('q')}
                  onChange={(e) => form.setValue('q', e.target.value)}
                  placeholder="เช่น 4000001 หรือ motor"
                />
              </div>
            </div>

            {optsQ.isLoading ? (
              <Skeleton className="h-28 w-full rounded-card" aria-label="กำลังโหลดตัวกรอง" />
            ) : optsQ.isError ? (
              <EmptyState
                icon={AlertCircle}
                title="โหลดตัวเลือกตัวกรองไม่สำเร็จ"
                description={
                  optsQ.error instanceof Error ? optsQ.error.message : 'เกิดข้อผิดพลาด'
                }
                action={{ label: 'ลองใหม่', onClick: () => void optsQ.refetch() }}
              />
            ) : (
              <>
                <Controller
                  name="activity"
                  control={form.control}
                  render={({ field }) => (
                    <FilterMultiSelect
                      label="กิจกรรม (mat)"
                      options={optsQ.data?.activities ?? []}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="wktype"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-0">
                      <FilterMultiSelect
                        label="ประเภทงาน (ZB / SAP ZD)"
                        options={optsQ.data?.wktypes ?? []}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <WktypeZdMappingNote />
                    </div>
                  )}
                />
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <FilterMultiSelect
                      label="สถานะ (syst)"
                      options={optsQ.data?.statuses ?? []}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="wkctr"
                  control={form.control}
                  render={({ field }) => (
                    <FilterMultiSelect
                      label="ศูนย์งาน (wkctr)"
                      options={optsQ.data?.workcenters ?? []}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="team"
                  control={form.control}
                  render={({ field }) => (
                    <FilterMultiSelect
                      label="ทีม (A / B / P)"
                      options={optsQ.data?.teams ?? []}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="functionalloc"
                  control={form.control}
                  render={({ field }) => (
                    <FilterMultiSelect
                      label="Product line (functionalloc)"
                      options={optsQ.data?.functionals ?? []}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="equipment"
                  control={form.control}
                  render={({ field }) => (
                    <FilterMultiSelect
                      label="อุปกรณ์ (equipment)"
                      options={optsQ.data?.equipments ?? []}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </>
            )}

            <div className="space-y-2">
              <Label className="text-app" htmlFor="wo-from">
                วันที่เริ่ม (จาก)
              </Label>
              <DatePicker id="wo-from" value={fromDate} onChange={setFromDate} />
            </div>
            <div className="space-y-2">
              <Label className="text-app" htmlFor="wo-to">
                วันที่สิ้นสุด (ถึง)
              </Label>
              <DatePicker id="wo-to" value={toDate} onChange={setToDate} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="gap-2">
              <Search className="size-4" aria-hidden />
              ค้นหา
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const empty: FilterForm = {
                  q: '',
                  activity: [],
                  wktype: [],
                  status: [],
                  wkctr: [],
                  team: [],
                  functionalloc: [],
                  equipment: [],
                }
                form.reset(empty)
                setSubmitted(empty)
                setFromDate('')
                setToDate('')
              }}
            >
              ล้างตัวกรอง
            </Button>
          </div>
          </form>
        </AppCard>

        <WoPmPhaseLegend />

        <FilterDetailSummary
          title="สรุปทีม A / B / P"
          subtitle="เลือกทีมแล้วตัวเลขอัปเดตทันที (ตัวอย่างก่อนบันทึก) · บันทึกลงฐานข้อมูลเมื่อกดปุ่มหรือคลิกทีมที่แถว"
          data={liveFilterDetail.data}
          isLoading={filterDetailQ.isLoading && !filterDetailQ.data}
          isError={filterDetailQ.isError}
          error={filterDetailQ.error as Error | null}
          teamOnly
          isLivePreview={liveFilterDetail.hasPendingChanges}
          isRefreshing={filterDetailQ.isFetching && filterDetailQ.isLoading}
        />

        {listQuery.isLoading && !listQuery.data ? (
          <Skeleton className="h-64 w-full rounded-card" aria-label="กำลังโหลดรายการใบงาน" />
        ) : listQuery.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลดรายการใบงานไม่สำเร็จ"
            description={
              listQuery.error instanceof Error
                ? listQuery.error.message
                : 'ตรวจการเชื่อมต่อ API'
            }
            action={{ label: 'ลองใหม่', onClick: () => void listQuery.refetch() }}
          />
        ) : (
          <AppCard pad="compact" className="space-y-3">
            {rows.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="ไม่พบใบงาน"
                description="ลองปรับตัวกรอง ล้างเงื่อนไข หรือตรวจนำเข้า IW37N · ข้อมูลตัวอย่างมักอยู่ช่วง ม.ค. 2020"
                action={
                  canIw37n
                    ? { label: 'ไปนำเข้า IW37N', onClick: () => navigate('/iw37n') }
                    : undefined
                }
              />
            ) : (
              <>
            <p className="text-caption">
              แสดง {rows.length.toLocaleString('th-TH')} รายการ
              {listQuery.isFetching ? ' · กำลังอัปเดต…' : ''}
            </p>
            {canWrite && rows.length > 0 ? (
              <div className="app-tone-info flex flex-wrap items-center gap-3 rounded-card border px-3 py-3">
                <span className="text-xs font-medium text-app">
                  มอบหมายทีม ({selectedIds.size} / {rows.length} แถวในหน้านี้)
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {(['A', 'B', 'P'] as const).map((t) => (
                    <label key={t} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="bulk-team"
                        disabled={selectedIds.size === 0 || bulkTeamMut.isPending || rowTeamMut.isPending}
                        onChange={() => applyTeamToSelected(t)}
                      />
                      Team {t}
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="bulk-team"
                      disabled={selectedIds.size === 0 || bulkTeamMut.isPending || rowTeamMut.isPending}
                      onChange={() => applyTeamToSelected('')}
                    />
                    ล้างทีม
                  </label>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={selectedIds.size === 0 || bulkTeamMut.isPending || rowTeamMut.isPending}
                  onClick={onBulkSave}
                >
                  {bulkTeamMut.isPending ? 'กำลังบันทึก…' : 'บันทึกทีมครั้งเดียว'}
                </Button>
                <p className="w-full text-caption sm:w-auto sm:flex-1">
                  คลิก Team A/B/P ที่แถวจะบันทึกทันที (เทียบ AddTeam.php) · เลือกหลายแถวแล้วกดบันทึกครั้งเดียวได้
                </p>
              </div>
            ) : null}

            <div className="app-table-shell max-h-[min(70vh,720px)] overflow-auto overflow-x-auto">
            <Table embedded stickyHeader zebra>
              <TableHeader>
                <TableRow>
                  {canWrite ? (
                    <TableHead className={cn('w-10', tableStickyClass(1))}>
                      <input
                        type="checkbox"
                        aria-label="เลือกทั้งหน้า"
                        checked={allPageSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = somePageSelected && !allPageSelected
                        }}
                        onChange={toggleSelectAllPage}
                        disabled={bulkTeamMut.isPending || rowTeamMut.isPending}
                      />
                    </TableHead>
                  ) : null}
                  <TableHead className={tableStickyClass(canWrite ? 2 : 1)}>เลขที่ใบงาน</TableHead>
                  <TableHead>สถานะ PM</TableHead>
                  <TableHead>แผนบำรุง</TableHead>
                  <TableHead>ประเภท/กิจกรรม</TableHead>
                  <TableHead>อุปกรณ์</TableHead>
                  <TableHead>Functional loc.</TableHead>
                  <TableHead>งาน (work)</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>ทีม</TableHead>
                  <TableHead className="text-right">รายละเอียด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const pending = pendingTeam[row.id] ?? normalizeTeam(row.team)
                  const isSelected = selectedIds.has(row.id)
                  const teamDirty = pending !== normalizeTeam(row.team)
                  return (
                  <TableRow
                    key={row.id}
                    className={isSelected ? 'app-tone-info-row' : teamDirty ? 'bg-amber-50/40' : undefined}
                  >
                    {canWrite ? (
                      <TableCell className={tableStickyClass(1)}>
                        <input
                          type="checkbox"
                          aria-label={`เลือก ${row.wkorder}`}
                          checked={isSelected}
                          onChange={() => toggleRowSelected(row.id)}
                          disabled={bulkTeamMut.isPending || rowTeamMut.isPending}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell className={cn('text-right', tableStickyClass(canWrite ? 2 : 1))}>
                      <button
                        type="button"
                        title={row.operationshorttext}
                        onClick={() => setOpenId(row.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: row.wkstcolor }}
                      >
                        {row.wkorder}
                      </button>
                    </TableCell>
                    <TableCell>
                      <WoPmPhaseBadge phase={row.pmPhase} syst={row.syst} showSyst />
                    </TableCell>
                    <TableCell className="text-xs">{row.mntplan}</TableCell>
                    <TableCell>
                      <WktypeDisplay code={row.wktype} mat={row.mat} />
                    </TableCell>
                    <TableCell className="text-xs">{row.equdescrip}</TableCell>
                    <TableCell className="text-xs">{row.funcdescrip}</TableCell>
                    <TableCell className="text-xs">
                      {row.work} {row.untime}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{row.displayDate}</TableCell>
                    <TableCell>
                      {canWrite ? (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {(['A', 'B', 'P'] as const).map((t) => (
                            <label key={t} className="flex items-center gap-1">
                              <input
                                type="radio"
                                name={`team-${row.id}`}
                                value={t}
                                checked={pending === t}
                                onChange={() => setRowPendingTeam(row.id, t)}
                                disabled={bulkTeamMut.isPending || rowTeamMut.isPending}
                              />
                              Team {t}
                            </label>
                          ))}
                          <label className="flex items-center gap-1 text-app-muted">
                            <input
                              type="radio"
                              name={`team-${row.id}`}
                              value=""
                              checked={pending === ''}
                              onChange={() => setRowPendingTeam(row.id, '')}
                              disabled={bulkTeamMut.isPending || rowTeamMut.isPending}
                            />
                            —
                          </label>
                        </div>
                      ) : (
                        <span className="text-xs">{row.team || '—'}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" type="button" onClick={() => setOpenId(row.id)}>
                        เปิด
                      </Button>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
              </>
            )}
          </AppCard>
        )}

        <AppCard pad="compact" className="space-y-3">
          <p className="text-body-sm font-medium text-app">รหัสสถานะใบงาน (Work status)</p>
          {statusItemsQ.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : statusItemsQ.isError ? (
            <EmptyState
              icon={AlertCircle}
              title="โหลดรหัสสถานะไม่สำเร็จ"
              description={
                statusItemsQ.error instanceof Error
                  ? statusItemsQ.error.message
                  : 'เกิดข้อผิดพลาด'
              }
              action={{ label: 'ลองใหม่', onClick: () => void statusItemsQ.refetch() }}
            />
          ) : statusItemsQ.data ? (
            <div className="app-table-shell overflow-x-auto">
              <Table embedded stickyHeader zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัส (syst)</TableHead>
                    <TableHead>คำอธิบาย</TableHead>
                    <TableHead>สี</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusItemsQ.data.filter(isWorkStatusItem).map((s) => (
                    <TableRow key={s.syst}>
                      <TableCell className="font-mono text-xs">{s.syst}</TableCell>
                      <TableCell className="text-xs">{s.wkstreason}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="inline-block size-3 rounded" style={{ backgroundColor: s.wkstcolor }} />
                          <span className="font-mono">{s.wkstcolor}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-caption">ยังไม่มีข้อมูลสถานะ</p>
          )}
        </AppCard>
      </AppPageShell>

      <WorkOrderDetailDialog
        orderId={openId}
        initialTab="task-list"
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </>
  )
}
