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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchBacklogFilterOptions,
  postBacklogEvents,
  postBacklogFilterDetail,
} from '@/lib/api-public'
import type { ScheduleCalendarEvent } from '@/lib/schedule-calendar'
import { usePermission } from '@/lib/use-permission'
import { zodResolver } from '@hookform/resolvers/zod'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { PLAN_NOT_MOVABLE_MESSAGE } from '@/lib/plan-movable'
import { toast } from 'sonner'
import { z } from 'zod'

const backlogFilterFormSchema = z.object({
  activity: z.array(z.string()),
  wktype: z.array(z.string()),
  functionalloc: z.array(z.string()),
  equipment: z.array(z.string()),
  wkctr: z.array(z.string()),
})

type BacklogFilterForm = z.infer<typeof backlogFilterFormSchema>

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

export function BacklogPage() {
  const canRead = usePermission('backlog.read')
  const canMovePlan = usePermission('calendar.write')

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

  const form = useForm<BacklogFilterForm>({
    resolver: zodResolver(backlogFilterFormSchema),
    defaultValues: {
      activity: [],
      wktype: [],
      functionalloc: [],
      equipment: [],
      wkctr: [],
    },
  })

  const [submittedFilters, setSubmittedFilters] = useState<BacklogFilterForm>({
    activity: [],
    wktype: [],
    functionalloc: [],
    equipment: [],
    wkctr: [],
  })

  const optsQ = useQuery({
    queryKey: ['backlog', 'filter-options'],
    queryFn: fetchBacklogFilterOptions,
    staleTime: 300_000,
    enabled: canRead,
  })

  const searchBody = useMemo(
    () => ({
      year,
      month,
      ...submittedFilters,
    }),
    [year, month, submittedFilters],
  )

  const filtersKey = JSON.stringify(submittedFilters)

  const eventsQ = useQuery({
    queryKey: ['backlog', 'events', year, month, filtersKey],
    queryFn: () => postBacklogEvents(searchBody),
    placeholderData: keepPreviousData,
    enabled: canRead,
  })

  const filterDetailQ = useQuery({
    queryKey: ['backlog', 'filter-detail', year, month, filtersKey],
    queryFn: () => postBacklogFilterDetail(searchBody),
    placeholderData: keepPreviousData,
    enabled: canRead,
  })

  const onSearch = form.handleSubmit((data) => {
    setSubmittedFilters(data)
  })

  const openMove = (event: ScheduleCalendarEvent, date: string) => {
    if (!canMovePlan) {
      toast.error('ไม่มีสิทธิ์ย้ายแผน — ต้องมี calendar.write')
      return
    }
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

  const eventCount = eventsQ.data?.items?.length ?? 0

  if (!canRead) {
    return (
      <AppPageShell
        title="Backlog / แผนค้าง"
        description="งาน IW37N สถานะ CRTD และ REL ที่ยังไม่จ่ายแผนเต็มรูปแบบ"
      >
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">backlog.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <>
      <AppPageShell
        title="Backlog / แผนค้าง"
        description="กรองงาน CRTD และ REL บนปฏิทิน · คลิกรายการดูใบงาน · ลากช่วงวันสรุปชั่วโมงทำงาน"
        contentClassName="space-y-4"
        headerActions={
          <>
            <Badge variant="secondary" className="text-xs">
              CRTD + REL
            </Badge>
            <CanPermission permission="calendar.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/calendar">ปฏิทิน Work scheduling</Link>
              </Button>
            </CanPermission>
            <CanPermission permission="work-orders.read">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/work-orders">ใบงาน WO</Link>
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
        <AppCard pad="compact" className="space-y-4">
          <form onSubmit={onSearch} className="space-y-4">
            <p className="text-body-sm font-medium text-app">ตัวกรองงานค้าง</p>

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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                  const empty: BacklogFilterForm = {
                    activity: [],
                    wktype: [],
                    functionalloc: [],
                    equipment: [],
                    wkctr: [],
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
          subtitle="งานค้าง CRTD/REL · ใบงาน · % เสร็จ · ทีม A/B"
          data={filterDetailQ.data}
          isLoading={filterDetailQ.isLoading}
          isError={filterDetailQ.isError}
          error={filterDetailQ.error as Error | null}
        />

        {eventsQ.isLoading && !eventsQ.data ? (
          <Skeleton className="h-[28rem] w-full rounded-card" aria-label="กำลังโหลดปฏิทิน" />
        ) : eventsQ.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลดปฏิทิน Backlog ไม่สำเร็จ"
            description={
              <>
                ตรวจการเชื่อมต่อ API หรือสิทธิ์{' '}
                <code className="text-xs">backlog.read</code>
                {eventsQ.error instanceof Error ? ` — ${eventsQ.error.message}` : null}
              </>
            }
            action={{ label: 'ลองใหม่', onClick: () => void eventsQ.refetch() }}
          />
        ) : (
          <AppCard pad="compact" className="space-y-3">
            {eventCount === 0 ? (
              <p className="text-caption rounded-button border border-dashed border-app bg-app-subtle/50 px-3 py-2">
                ไม่พบงานค้างในเดือนที่เลือก — ลองเปลี่ยนปี/เดือน ล้างตัวกรอง หรือตรวจนำเข้า IW37N
              </p>
            ) : (
              <p className="text-caption">
                แสดง {eventCount.toLocaleString('th-TH')} รายการ (CRTD + REL)
                {eventsQ.isFetching ? ' · กำลังอัปเดต…' : ''}
              </p>
            )}
            <p className="text-caption">
              ลากเลือกช่วงวันบนปฏิทินเพื่อสรุปชั่วโมงทำงาน
              {canMovePlan ? ' · ลากรายการเพื่อย้ายแผน (ถ้างานย้ายได้)' : ' · อ่านอย่างเดียว (ไม่มีสิทธิ์ย้ายแผน)'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setYear(2020)
                  setMonth(1)
                }}
              >
                ไป ม.ค. 2020 (ข้อมูล IW37N ในไฟล์ตัวอย่าง)
              </Button>
            </div>
            <MonthFullCalendar
              year={year}
              month={month}
              viewMode="month-week-day"
              yearMin={2015}
              yearMax={2030}
              events={eventsQ.data?.items ?? []}
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
              onEventDrop={canMovePlan ? (e, newDate) => openMove(e, newDate) : undefined}
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
        onSuccess={() => void eventsQ.refetch()}
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
