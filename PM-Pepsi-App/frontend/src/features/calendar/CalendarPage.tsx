import { PageHeader } from '@/components/layout/PageHeader'
import { MovePlanDialog } from '@/components/scheduling/MovePlanDialog'
import { MonthFullCalendar } from '@/components/scheduling/MonthFullCalendar'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchCalendarFilterOptions, postCalendarEvents } from '@/lib/api-public'
import type { ScheduleCalendarEvent } from '@/lib/schedule-calendar'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

const calendarFilterFormSchema = z.object({
  activity: z.array(z.string()),
  wktype: z.array(z.string()),
  status: z.array(z.string()),
  wkctr: z.array(z.string()),
  team: z.array(z.string()),
  functionalloc: z.array(z.string()),
  equipment: z.array(z.string()),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
})

type CalendarFilterForm = z.infer<typeof calendarFilterFormSchema>

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
        onChange={(e) => onChange([...e.target.selectedOptions].map((o) => o.value))}
      >
        {options.map((o) => (
          <option key={`${o.code}-${o.label}`} value={o.code}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="text-[11px] text-zinc-500">
        เลือกหลายค่า: กด Ctrl (Windows) หรือ Cmd (Mac) ค้าง — เทียบ `bootstrap-select` multiple ใน PHP
      </p>
    </div>
  )
}

export function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [detailTarget, setDetailTarget] = useState<{ id: string; date: string } | null>(null)
  const [moveTarget, setMoveTarget] = useState<{
    idiw37: string
    wkorder: string
    date: string
  } | null>(null)

  const params = useParams()
  const [sp] = useSearchParams()
  const wkctrFromUrl = useMemo(() => {
    const fromPath = String(params.code ?? '').trim()
    const fromQuery = String(sp.get('wkctr') ?? '').trim()
    return (fromPath || fromQuery).trim()
  }, [params.code, sp])

  const form = useForm<CalendarFilterForm>({
    resolver: zodResolver(calendarFilterFormSchema),
    defaultValues: {
      activity: [],
      wktype: [],
      status: [],
      wkctr: [],
      team: [],
      functionalloc: [],
      equipment: [],
      fromDate: '',
      toDate: '',
    },
  })

  const [submittedFilters, setSubmittedFilters] = useState<CalendarFilterForm>({
    activity: [],
    wktype: [],
    status: [],
    wkctr: [],
    team: [],
    functionalloc: [],
    equipment: [],
    fromDate: '',
    toDate: '',
  })

  const optsQ = useQuery({
    queryKey: ['calendar', 'filter-options'],
    queryFn: fetchCalendarFilterOptions,
    staleTime: 300_000,
  })

  const filtersKey = JSON.stringify(submittedFilters)

  const q = useQuery({
    queryKey: ['calendar', 'events', year, month, filtersKey],
    queryFn: () =>
      postCalendarEvents({
        year,
        month,
        activity: submittedFilters.activity,
        wktype: submittedFilters.wktype,
        status: submittedFilters.status,
        wkctr: submittedFilters.wkctr,
        team: submittedFilters.team,
        functionalloc: submittedFilters.functionalloc,
        equipment: submittedFilters.equipment,
        fromDate: submittedFilters.fromDate?.trim() ? submittedFilters.fromDate.trim() : undefined,
        toDate: submittedFilters.toDate?.trim() ? submittedFilters.toDate.trim() : undefined,
      }),
  })

  const onSearch = form.handleSubmit((data) => {
    setSubmittedFilters(data)
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((data.fromDate ?? '').trim())
    if (m) {
      const y = Number(m[1])
      const mm = Number(m[2])
      if (Number.isFinite(y) && Number.isFinite(mm) && mm >= 1 && mm <= 12) {
        setYear(y)
        setMonth(mm)
      }
    }
  })

  useEffect(() => {
    if (!wkctrFromUrl) return
    const current = form.getValues('wkctr') ?? []
    if (current.length === 1 && current[0] === wkctrFromUrl) return
    form.setValue('wkctr', [wkctrFromUrl], { shouldDirty: true })
    setSubmittedFilters((prev) => ({ ...prev, wkctr: [wkctrFromUrl] }))
  }, [form, wkctrFromUrl])

  const openMove = (event: ScheduleCalendarEvent, date: string) => {
    setMoveTarget({
      idiw37: event.id,
      wkorder: event.orderId ?? event.title,
      date,
    })
  }

  return (
    <div>
      <PageHeader
        title="ปฏิทินงาน"
        description="Work scheduling — FullCalendar + ModalOrderDetail + MovePlant + ฟิลเตอร์ (POST)"
      >
        <Badge variant="secondary">Work order</Badge>
        <Badge className="bg-blue-700">API + DB</Badge>
      </PageHeader>

      <div className="space-y-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/line-calendar">ปฏิทินเส้น (product line)</Link>
          </Button>
        </div>

        <form
          onSubmit={onSearch}
          className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-medium text-zinc-800">ตัวกรอง (เทียบ `M_filter_iw37.php`)</p>
          {wkctrFromUrl ? (
            <p className="text-xs text-zinc-500">Work center: {wkctrFromUrl}</p>
          ) : null}

          {optsQ.isLoading ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : optsQ.isError ? (
            <p className="text-sm text-red-600">{(optsQ.error as Error).message}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Controller
                name="activity"
                control={form.control}
                render={({ field }) => (
                  <FilterMultiSelect
                    label="Activity (mat)"
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
                  <FilterMultiSelect
                    label="Type (wktype)"
                    options={optsQ.data?.wktypes ?? []}
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
                    label="Resources (wkctr)"
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
                    label="TEAM"
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
                    label="Product Line (functionalloc)"
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
                    label="Equipment"
                    options={optsQ.data?.equipments ?? []}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <div className="space-y-1.5">
                <Label htmlFor="calendar-from">จากวันที่</Label>
                <Controller
                  name="fromDate"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker
                      id="calendar-from"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="calendar-to">ถึงวันที่</Label>
                <Controller
                  name="toDate"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker
                      id="calendar-to"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit">Search</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const empty: CalendarFilterForm = {
                  activity: [],
                  wktype: [],
                  status: [],
                  wkctr: [],
                  team: [],
                  functionalloc: [],
                  equipment: [],
                  fromDate: '',
                  toDate: '',
                }
                form.reset(empty)
                setSubmittedFilters(empty)
              }}
            >
              ล้างตัวกรอง
            </Button>
          </div>
        </form>

        {q.isLoading ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : q.isError ? (
          <p className="text-sm text-red-600">{(q.error as Error).message}</p>
        ) : (
          <MonthFullCalendar
            year={year}
            month={month}
            events={q.data?.items ?? []}
            onMonthChange={(y, m) => {
              setYear(y)
              setMonth(m)
            }}
            onEventClick={(e) => setDetailTarget({ id: e.id, date: e.date })}
            onEventDrop={(e, newDate) => openMove(e, newDate)}
          />
        )}
      </div>

      <WorkOrderDetailDialog
        orderId={detailTarget?.id ?? null}
        contextDate={detailTarget?.date}
        onOpenChange={(o) => !o && setDetailTarget(null)}
      />

      <MovePlanDialog
        open={Boolean(moveTarget)}
        onOpenChange={(o) => !o && setMoveTarget(null)}
        idiw37={moveTarget?.idiw37 ?? ''}
        wkorder={moveTarget?.wkorder}
        defaultDate={moveTarget?.date}
        onSuccess={() => void q.refetch()}
      />
    </div>
  )
}
