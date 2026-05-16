import { PageHeader } from '@/components/layout/PageHeader'
import { MovePlanDialog } from '@/components/scheduling/MovePlanDialog'
import { MonthFullCalendar } from '@/components/scheduling/MonthFullCalendar'
import { WorkOrderDetailDialog } from '@/components/scheduling/WorkOrderDetailDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchBacklogFilterOptions, postBacklogEvents } from '@/lib/api-public'
import type { ScheduleCalendarEvent } from '@/lib/schedule-calendar'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
      <p className="text-[11px] text-zinc-500">
        เลือกหลายค่า: กด Ctrl (Windows) หรือ Cmd (Mac) ค้าง — เทียบ `bootstrap-select` multiple ใน PHP
      </p>
    </div>
  )
}

export function BacklogPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
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
  })

  const filtersKey = JSON.stringify(submittedFilters)

  const eventsQ = useQuery({
    queryKey: ['backlog', 'events', year, month, filtersKey],
    queryFn: () =>
      postBacklogEvents({
        year,
        month,
        ...submittedFilters,
      }),
  })

  const onSearch = form.handleSubmit((data) => {
    setSubmittedFilters(data)
  })

  return (
    <div>
      <PageHeader
        title="Backlog / แผนค้าง (IW37N)"
        description="เทียบ backlog.php — ฟิลเตอร์ view_order (syst CRTD/REL) + POST /api/v1/backlog/events"
      >
        <Badge variant="secondary">CRTD + REL</Badge>
        <Badge className="bg-violet-700">API + DB</Badge>
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        <form
          onSubmit={onSearch}
          className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-medium text-zinc-800">
            ตัวกรอง (เทียบ Activity / Type / Resources / Product Line / Equipment ใน PHP)
          </p>
          {optsQ.isLoading ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : optsQ.isError ? (
            <p className="text-sm text-red-600">{(optsQ.error as Error).message}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="gap-2">
              <Search className="size-4" aria-hidden />
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const empty = {
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

        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4">
          <p className="text-sm font-medium text-zinc-800">Manhour ช่วงวันที่ (เทียบเลือกช่วงบน FullCalendar)</p>
          <p className="mt-1 text-xs text-zinc-500">
            PHP โหลด `modalPages/ModalMHshow.php` — ที่นี่เป็น mock จนกว่าจะมี API จริง
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="mh-from">จาก</Label>
              <DatePicker id="mh-from" value={mhFrom} onChange={setMhFrom} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mh-to">ถึง</Label>
              <DatePicker id="mh-to" value={mhTo} onChange={setMhTo} />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!mhFrom || !mhTo}
              onClick={() => setMhOpen(true)}
            >
              เปิดสรุป manhour (mock)
            </Button>
          </div>
        </div>

        {eventsQ.isLoading ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : eventsQ.isError ? (
          <p className="text-sm text-red-600">{(eventsQ.error as Error).message}</p>
        ) : (
          <MonthFullCalendar
            year={year}
            month={month}
            events={eventsQ.data?.items ?? []}
            onMonthChange={(y, m) => {
              setYear(y)
              setMonth(m)
            }}
            onEventClick={(e) => setDetailOrderId(e.id)}
            onEventDrop={(e: ScheduleCalendarEvent, newDate: string) =>
              setMoveTarget({
                idiw37: e.id,
                wkorder: e.orderId ?? e.title,
                date: newDate,
              })
            }
          />
        )}
      </div>

      <WorkOrderDetailDialog
        orderId={detailOrderId}
        onOpenChange={(o) => !o && setDetailOrderId(null)}
      />

      <MovePlanDialog
        open={Boolean(moveTarget)}
        onOpenChange={(o) => !o && setMoveTarget(null)}
        idiw37={moveTarget?.idiw37 ?? ''}
        wkorder={moveTarget?.wkorder}
        defaultDate={moveTarget?.date}
        onSuccess={() => void eventsQ.refetch()}
      />

      <Dialog open={mhOpen} onOpenChange={setMhOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manhour ช่วงที่เลือก (mock)</DialogTitle>
            <DialogDescription>
              {mhFrom} → {mhTo} — เทียบ `ModalMHshow.php` (POST Event / End)
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-zinc-600">
            ตัวอย่างผลลัพธ์: ในช่วงนี้มีใบงานที่เกี่ยวข้องกับแบ็คล็อกในปฏิทิน{' '}
            {eventsQ.data?.items.length ?? 0} รายการในเดือนที่กำลังดู (ไม่กรองซ้ำตามช่วงวันที่ใน mock)
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
