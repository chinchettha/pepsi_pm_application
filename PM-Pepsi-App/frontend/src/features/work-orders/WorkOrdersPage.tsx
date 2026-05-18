import { PageHeader } from '@/components/layout/PageHeader'
import { PlaceholderBlock } from '@/components/layout/PlaceholderBlock'
import { WorkOrderAutocomplete } from '@/components/scheduling/WorkOrderAutocomplete'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/table'
import type { WorkStatusItem } from '@/api/schemas'
import {
  fetchMasterData,
  fetchWorkOrderFilterOptions,
  postWorkOrdersSearch,
  putWorkOrderTeam,
} from '@/lib/api-public'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
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
    <div className="space-y-1.5">
      <Label className="text-zinc-800">{label}</Label>
      <select
        multiple
        size={5}
        className="w-full min-w-[10rem] rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm shadow-sm"
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
      <p className="text-[11px] text-zinc-500">เลือกหลายค่า: กด Ctrl (Windows) หรือ Cmd (Mac) ค้าง</p>
    </div>
  )
}

function isWorkStatusItem(x: unknown): x is WorkStatusItem {
  if (!x || typeof x !== 'object') return false
  const r = x as Record<string, unknown>
  return typeof r.syst === 'string' && typeof r.wkstcolor === 'string'
}

export function WorkOrdersPage() {
  const { id } = useParams()
  const [openId, setOpenId] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    if (!id) return
    setOpenId(id)
  }, [id])

  const queryClient = useQueryClient()

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
  })

  const submittedKey = useMemo(() => JSON.stringify({ submitted, fromDate, toDate }), [submitted, fromDate, toDate])

  const listQuery = useQuery({
    queryKey: ['work-orders', 'search', submittedKey],
    queryFn: () =>
      postWorkOrdersSearch({
        ...submitted,
        q: submitted.q.trim() ? submitted.q.trim() : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
  })

  const statusItemsQ = useQuery({
    queryKey: ['master-data', 'workstatus'],
    queryFn: () => fetchMasterData('workstatus'),
    staleTime: 300_000,
  })

  const teamMut = useMutation({
    mutationFn: (args: { id: string; team: '' | 'A' | 'B' | 'P' }) => putWorkOrderTeam(args.id, args.team),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['work-orders', 'search'] })
      await queryClient.invalidateQueries({ queryKey: ['work-orders', 'events'] })
      await queryClient.invalidateQueries({ queryKey: ['backlog', 'events'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] })
    },
  })

  const onSearch = form.handleSubmit((data) => {
    setSubmitted(data)
  })

  return (
    <div>
      <PageHeader
        title="ใบงาน (Work orders)"
        description="กรอง ค้นหา ดูรายละเอียด WO / team / status — เทียบ workorder.php, Work_Order_Status.php"
      >
        <Badge variant="secondary">SAP-style fields</Badge>
        <Badge className="bg-violet-700">API + DB</Badge>
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="max-w-md space-y-1 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4">
          <p className="text-xs font-medium text-zinc-700">ค้น wkorder (เทียบ `autocomplete.php`)</p>
          <WorkOrderAutocomplete
            value={form.watch('q')}
            onSelect={(item) => {
              form.setValue('q', item.wkorder)
              setOpenId(item.id)
            }}
          />
        </div>

        <form onSubmit={onSearch} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-zinc-800">ตัวกรอง (เทียบ `M_filter_iw37.php`)</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-zinc-800" htmlFor="wo-q">
                ค้นหา (เลขที่ / ชื่อ / equipment)
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="wo-q"
                  className="pl-9"
                  value={form.watch('q')}
                  onChange={(e) => form.setValue('q', e.target.value)}
                  placeholder="เช่น 4000001 หรือ motor"
                />
              </div>
            </div>

            {optsQ.isLoading ? (
              <Skeleton className="h-28 w-full rounded-lg" />
            ) : optsQ.isError ? (
              <p className="text-sm text-red-600">{(optsQ.error as Error).message}</p>
            ) : optsQ.data ? (
              <>
                <Controller
                  name="activity"
                  control={form.control}
                  render={({ field }) => (
                    <FilterMultiSelect
                      label="Activity (mat)"
                      options={optsQ.data.activities}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="wktype"
                  control={form.control}
                  render={({ field }) => (
                    <FilterMultiSelect
                      label="Type (wktype)"
                      options={optsQ.data.wktypes}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <FilterMultiSelect
                      label="Status (syst)"
                      options={optsQ.data.statuses}
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
                      label="Resources (wkctr)"
                      options={optsQ.data.workcenters}
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
                      label="TEAM"
                      options={optsQ.data.teams}
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
                      label="Product Line (functionalloc)"
                      options={optsQ.data.functionals}
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
                      label="Equipment"
                      options={optsQ.data.equipments}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </>
            ) : (
              <p className="text-sm text-zinc-600">ยังไม่มีข้อมูล</p>
            )}

            <div className="space-y-1.5">
              <Label className="text-zinc-800" htmlFor="wo-from">
                วันที่ (from)
              </Label>
              <DatePicker id="wo-from" value={fromDate} onChange={setFromDate} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-800" htmlFor="wo-to">
                วันที่ (to)
              </Label>
              <DatePicker id="wo-to" value={toDate} onChange={setToDate} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit">Search</Button>
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

        {listQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : listQuery.isError ? (
          <PlaceholderBlock title="โหลดใบงานไม่สำเร็จ">
            <p className="text-sm text-red-600">{(listQuery.error as Error).message}</p>
          </PlaceholderBlock>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Mnt plan</TableHead>
                  <TableHead>Type/Mat</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Functional</TableHead>
                  <TableHead>Work</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">รายละเอียด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.data?.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-right">
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
                    <TableCell className="text-xs">{row.mntplan}</TableCell>
                    <TableCell className="text-xs">
                      {row.wktype}
                      {row.mat ? `/${row.mat}` : ''}
                    </TableCell>
                    <TableCell className="text-xs">{row.equdescrip}</TableCell>
                    <TableCell className="text-xs">{row.funcdescrip}</TableCell>
                    <TableCell className="text-xs">
                      {row.work} {row.untime}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{row.displayDate}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {(['A', 'B', 'P'] as const).map((t) => (
                          <label key={t} className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`team-${row.id}`}
                              value={t}
                              checked={row.team === t}
                              onChange={() => teamMut.mutate({ id: row.id, team: t })}
                              disabled={teamMut.isPending}
                            />
                            Team {t}
                          </label>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" type="button" onClick={() => setOpenId(row.id)}>
                        เปิด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-zinc-800">Work Order Status (เทียบ `Work_Order_Status.php`)</p>
          {statusItemsQ.isLoading ? (
            <div className="mt-3 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : statusItemsQ.isError ? (
            <p className="mt-3 text-sm text-red-600">{(statusItemsQ.error as Error).message}</p>
          ) : statusItemsQ.data ? (
            <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Color</TableHead>
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
            <p className="mt-3 text-sm text-zinc-600">ยังไม่มีข้อมูล</p>
          )}
        </div>
      </div>

      <WorkOrderDetailDialog orderId={openId} onOpenChange={(o) => !o && setOpenId(null)} />
    </div>
  )
}
