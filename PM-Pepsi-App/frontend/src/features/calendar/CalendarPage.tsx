import { CanPermission } from '@/components/auth/CanPermission'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { FilterDetailSummary } from '@/components/scheduling/FilterDetailSummary'
import { WoPmPhaseLegend } from '@/components/scheduling/WoPmPhaseBadge'
import { WktypeZdMappingNote } from '@/components/scheduling/WktypeZdMappingNote'
import { ManhourSummaryDialog } from '@/components/scheduling/ManhourSummaryDialog'
import { MovePlanDialog } from '@/components/scheduling/MovePlanDialog'
import { MonthFullCalendar } from '@/components/scheduling/MonthFullCalendar'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { EmptyState } from '@/components/ui/empty-state'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchCalendarFilterOptions,
  postCalendarEvents,
  postCalendarFilterDetail,
} from '@/lib/api-public'
import type { ScheduleCalendarEvent } from '@/lib/schedule-calendar'
import { zodResolver } from '@hookform/resolvers/zod'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { PLAN_NOT_MOVABLE_MESSAGE } from '@/lib/plan-movable'
import { toast } from 'sonner'
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
    <div className="space-y-2">
      <Label className="text-app">{label}</Label>
      <select
        multiple
        size={5}
        className="w-full min-w-[10rem] rounded-button border border-app bg-[var(--app-surface)] px-2 py-1 text-body-sm shadow-sm"
        value={value}
        onChange={(e) => onChange([...e.target.selectedOptions].map((o) => o.value))}
      >
        {options.map((o) => (
          <option key={`${o.code}-${o.label}`} value={o.code}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="text-caption">เลือกหลายค่า: กด Ctrl (Windows) หรือ Cmd (Mac) ค้างไว้</p>
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
  const [mhOpen, setMhOpen] = useState(false)
  const [mhFrom, setMhFrom] = useState('')
  const [mhTo, setMhTo] = useState('')

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

  const calendarSearchBody = useMemo(
    () => ({
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
    [year, month, submittedFilters],
  )

  const q = useQuery({
    queryKey: ['calendar', 'events', year, month, filtersKey],
    queryFn: () => postCalendarEvents(calendarSearchBody),
    placeholderData: keepPreviousData,
  })

  const filterDetailQ = useQuery({
    queryKey: ['calendar', 'filter-detail', year, month, filtersKey],
    queryFn: () => postCalendarFilterDetail(calendarSearchBody),
    placeholderData: keepPreviousData,
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
    if (event.canMovePlan === false) {
      toast.error(PLAN_NOT_MOVABLE_MESSAGE)
      return
    }
    setMoveTarget({
      idiw37: event.id,
      wkorder: event.orderId ?? event.title,
      date,
    })
  }

  const eventCount = q.data?.items?.length ?? 0

  return (
    <>
      <AppPageShell
        title="ปฏิทิน Work scheduling"
        description="กรองและดูงานบนปฏิทิน · ลากย้ายแผน · คลิกรายการเปิดใบงาน · ลากช่วงวันสรุปชั่วโมงทำงาน"
        contentClassName="space-y-4"
        headerActions={
          <>
            <CanPermission permission="planning.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/plan-calendar">ปฏิทินจ่ายงาน</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="calendar.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/line-calendar">ปฏิทินเส้น (Product line)</Link>
              </Button>
            </CanPermission>
          </>
        }
      >
        <AppCard pad="compact" className="space-y-4">
          <form onSubmit={onSearch} className="space-y-4">
            <p className="text-body-sm font-medium text-app">ตัวกรองงาน</p>
            {wkctrFromUrl ? (
              <p className="text-caption">ศูนย์งานจากลิงก์: {wkctrFromUrl}</p>
            ) : null}

            {optsQ.isLoading ? (
              <Skeleton className="h-40 w-full rounded-card" aria-label="กำลังโหลดตัวกรอง" />
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                      label="สถานะระบบ (syst)"
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

                <div className="space-y-2">
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

                <div className="space-y-2">
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
              <Button type="submit" className="gap-2">
                <Search className="size-4" aria-hidden />
                ค้นหา
              </Button>
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
        </AppCard>

        <WoPmPhaseLegend />

        <FilterDetailSummary
          title="สรุปตามตัวกรอง"
          subtitle="ใบงาน · % เสร็จ · ทีม A/B — ตรงกับตัวกรองและช่วงวันที่ด้านบน"
          data={filterDetailQ.data}
          isLoading={filterDetailQ.isLoading}
          isError={filterDetailQ.isError}
          error={filterDetailQ.error as Error | null}
        />

        {q.isLoading && !q.data ? (
          <Skeleton className="h-[28rem] w-full rounded-card" aria-label="กำลังโหลดปฏิทิน" />
        ) : q.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลดปฏิทินไม่สำเร็จ"
            description={
              <>
                ตรวจการเชื่อมต่อ API หรือสิทธิ์{' '}
                <code className="text-xs">calendar.read</code>
                {q.error instanceof Error ? ` — ${q.error.message}` : null}
              </>
            }
            action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
          />
        ) : (
          <AppCard pad="compact" className="space-y-3">
            {eventCount === 0 ? (
              <p className="text-caption rounded-button border border-dashed border-app bg-app-subtle/50 px-3 py-2">
                ไม่พบงานในเดือนที่เลือก — ลองเปลี่ยนปี/เดือน กดค้นหาหลังตั้งช่วงวันที่ หรือตรวจนำเข้า
                IW37N
              </p>
            ) : (
              <p className="text-caption">
                แสดง {eventCount.toLocaleString('th-TH')} รายการในเดือนที่เลือก
                {q.isFetching ? ' · กำลังอัปเดต…' : ''}
              </p>
            )}
            <p className="text-caption">
              ลากเลือกช่วงวันบนปฏิทินเพื่อสรุปชั่วโมงทำงาน · ลากรายการเพื่อย้ายแผน (ถ้างานย้ายได้)
              · บนแท็บเล็ต: แตะค้างรายการ ~0.4 วินาที แล้วลาก
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setYear(2020)
                  setMonth(1)
                  form.setValue('fromDate', '2020-01-01')
                  form.setValue('toDate', '2020-04-30')
                  setSubmittedFilters((prev) => ({
                    ...prev,
                    fromDate: '2020-01-01',
                    toDate: '2020-04-30',
                  }))
                }}
              >
                ไป ม.ค. 2020 (ช่วงข้อมูลตัวอย่าง)
              </Button>
            </div>
            <MonthFullCalendar
              year={year}
              month={month}
              viewMode="month-week-day"
              yearMin={2015}
              yearMax={2030}
              events={q.data?.items ?? []}
              onMonthChange={(y, m) => {
                setYear(y)
                setMonth(m)
              }}
              onRangeSelect={(from, to) => {
                setMhFrom(from)
                setMhTo(to)
                setMhOpen(true)
              }}
              onEventClick={(e) => setDetailTarget({ id: e.id, date: e.date })}
              onEventDrop={(e, newDate) => openMove(e, newDate)}
            />
          </AppCard>
        )}
      </AppPageShell>

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

      <ManhourSummaryDialog
        open={mhOpen}
        onOpenChange={setMhOpen}
        fromDate={mhFrom}
        toDate={mhTo}
      />
    </>
  )
}
