import { PageHeader } from '@/components/layout/PageHeader'
import { PlaceholderBlock } from '@/components/layout/PlaceholderBlock'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  deleteConfirmationClose,
  fetchConfirmationByWorkOrder,
  fetchWorkOrderDetail,
  fetchWorkcenters,
  postConfirmationClose,
} from '@/lib/api-public'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

function Shell({
  title,
  description,
  phpModules,
  hint,
}: {
  title: string
  description: string
  phpModules: string[]
  hint?: ReactNode
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <PlaceholderBlock title="Parity กับระบบ PHP (sap/pages)">
        <ul className="list-inside list-disc space-y-1">
          {phpModules.map((m) => (
            <li key={m}>
              <code className="rounded bg-zinc-200 px-1">{m}</code>
            </li>
          ))}
        </ul>
        {hint ? <div className="mt-4">{hint}</div> : null}
      </PlaceholderBlock>
    </div>
  )
}

/** `index.php?module=line_calendar` — คนละมุมกับปฏิทินรายเดือน */
export function LineCalendarParityPage() {
  return (
    <Shell
      title="ปฏิทินเส้น / Line scheduling"
      description="เทียบ `line_calendar.php` (default บน index.php) — มุมมองเส้นเวลา / resource"
      phpModules={['line_calendar.php']}
      hint={
        <Button variant="outline" size="sm" asChild>
          <Link to="/calendar">ไปปฏิทินรายเดือน (mock) ชั่วคราว</Link>
        </Button>
      }
    />
  )
}

/** Admin: `M_confirmation.php` — ช่าง: ใช้ `W_planwork_view` เป็นเมนู Confirmation ในเมนูสำรอง */
export function ConfirmationParityPage() {
  const qc = useQueryClient()
  const [wkorder, setWkorder] = useState('')

  const today = useMemo(() => {
    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = String(d.getFullYear())
    return `${dd}.${mm}.${yyyy}`
  }, [])

  const [startD, setStartD] = useState(today)
  const [endD, setEndD] = useState(today)
  const [startT, setStartT] = useState('')
  const [endT, setEndT] = useState('')

  const workcentersQ = useQuery({
    queryKey: ['workcenters'],
    queryFn: fetchWorkcenters,
    retry: 0,
  })

  const detailQ = useQuery({
    queryKey: ['work-order-detail', wkorder],
    queryFn: () => fetchWorkOrderDetail(wkorder),
    enabled: false,
    retry: 0,
  })

  const confirmationQ = useQuery({
    queryKey: ['confirmation-by-wkorder', wkorder],
    queryFn: () => fetchConfirmationByWorkOrder(wkorder),
    enabled: false,
    retry: 0,
  })

  const addClose = useMutation({
    mutationFn: postConfirmationClose,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation-by-wkorder', wkorder] })
      toast.success('Saved')
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const delClose = useMutation({
    mutationFn: deleteConfirmationClose,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['confirmation-by-wkorder', wkorder] })
      toast.success('Deleted')
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const onGo = async () => {
    const w = wkorder.trim()
    if (!w) {
      toast.error('Work order is required')
      return
    }
    await Promise.all([detailQ.refetch(), confirmationQ.refetch()])
  }

  return (
    <div>
      <PageHeader
        title="รับรอง / Confirmation"
        description="Phase 1 — เทียบ M_confirmation.php + confirmTab2 (เพิ่ม/ลบช่างและเวลา)"
      >
        <Badge variant="secondary">API + DB</Badge>
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <Label htmlFor="wkorder">Number Work Order</Label>
              <Input
                id="wkorder"
                inputMode="numeric"
                value={wkorder}
                onChange={(e) => setWkorder(e.target.value)}
                placeholder="Enter Work Order"
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={onGo} disabled={detailQ.isFetching || confirmationQ.isFetching}>
                Go
              </Button>
            </div>
          </div>

          <div className="mt-4">
            {(detailQ.isFetching || confirmationQ.isFetching) && !detailQ.data ? (
              <Skeleton className="h-24 w-full rounded-lg" />
            ) : null}
            {detailQ.isError ? <p className="mt-2 text-sm text-red-600">{(detailQ.error as Error).message}</p> : null}
            {confirmationQ.isError ? (
              <p className="mt-2 text-sm text-red-600">{(confirmationQ.error as Error).message}</p>
            ) : null}
          </div>
        </div>

        <Tabs defaultValue="workorder" className="w-full">
          <TabsList>
            <TabsTrigger value="workorder">Work Order</TabsTrigger>
            <TabsTrigger value="confirmation">Confirmation</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="workorder" className="mt-4">
            {!detailQ.data ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
                Search work order first.
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="text-sm">
                    <div className="text-xs text-zinc-500">Work Order</div>
                    <div className="font-medium tabular-nums">{detailQ.data.wkorder}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-xs text-zinc-500">Status</div>
                    <div className="font-medium">{detailQ.data.status}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-xs text-zinc-500">Functional Location</div>
                    <div className="font-medium">{detailQ.data.functLoc}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-xs text-zinc-500">Equipment</div>
                    <div className="font-medium">{detailQ.data.equipment}</div>
                  </div>
                  <div className="text-sm sm:col-span-2">
                    <div className="text-xs text-zinc-500">Title</div>
                    <div className="font-medium">{detailQ.data.title}</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="confirmation" className="mt-4 space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="startD">Start date</Label>
                  <Input id="startD" value={startD} onChange={(e) => setStartD(e.target.value)} placeholder="DD.MM.YYYY" />
                </div>
                <div>
                  <Label htmlFor="startT">Start time</Label>
                  <Input id="startT" value={startT} onChange={(e) => setStartT(e.target.value)} placeholder="HH:MM" />
                </div>
                <div>
                  <Label htmlFor="endD">End date</Label>
                  <Input id="endD" value={endD} onChange={(e) => setEndD(e.target.value)} placeholder="DD.MM.YYYY" />
                </div>
                <div>
                  <Label htmlFor="endT">End time</Label>
                  <Input id="endT" value={endT} onChange={(e) => setEndT(e.target.value)} placeholder="HH:MM" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-medium text-zinc-800">Technicians</div>
              {workcentersQ.isLoading ? (
                <Skeleton className="h-24 w-full rounded-lg" />
              ) : workcentersQ.isError ? (
                <p className="text-sm text-red-600">{(workcentersQ.error as Error).message}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(workcentersQ.data ?? []).map((wc) => (
                    <Button
                      key={wc.wkctr}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!confirmationQ.data || addClose.isPending}
                      onClick={() => {
                        const idiw37 = confirmationQ.data?.idiw37
                        if (!idiw37) {
                          toast.error('Search work order first')
                          return
                        }
                        addClose.mutate({
                          idiw37,
                          wkctr: wc.wkctr,
                          startD,
                          startT,
                          endD,
                          endT,
                        })
                      }}
                    >
                      <span className="tabular-nums">{wc.wkctr}</span>
                      {wc.displayName ? <span className="ml-2">{wc.displayName}</span> : null}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WkCtr</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead className="text-right">Minutes</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!confirmationQ.data ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                        Search work order first.
                      </TableCell>
                    </TableRow>
                  ) : (confirmationQ.data.items ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                        No confirmations
                      </TableCell>
                    </TableRow>
                  ) : (
                    (confirmationQ.data.items ?? []).map((row) => (
                      <TableRow key={row.idclose}>
                        <TableCell className="tabular-nums">{row.wkctr}</TableCell>
                        <TableCell>{row.displayName}</TableCell>
                        <TableCell className="tabular-nums">
                          {row.stdate ? new Date(row.stdate * 1000).toLocaleString() : ''}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {row.endate ? new Date(row.endate * 1000).toLocaleString() : ''}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.timewk} {row.unitc}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={delClose.isPending}
                            onClick={() => delClose.mutate(row.idclose)}
                          >
                            Del
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <PlaceholderBlock title="Images (ยังไม่ทำ)">
              <p className="text-sm text-zinc-600">Phase 2 — confirmTab3.php (upload image)</p>
            </PlaceholderBlock>
          </TabsContent>

          <TabsContent value="planning" className="mt-4">
            <PlaceholderBlock title="Planning (ยังไม่ทำ)">
              <p className="text-sm text-zinc-600">Phase 2 — confirmTab4.php</p>
            </PlaceholderBlock>
          </TabsContent>
        </Tabs>

        <PlaceholderBlock title="Parity กับระบบ PHP (sap/pages)">
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-zinc-200 px-1">M_confirmation.php</code>
            </li>
            <li>
              <code className="rounded bg-zinc-200 px-1">M_confirmation_form.php</code>
            </li>
            <li>
              <code className="rounded bg-zinc-200 px-1">modalPages/confirmTab2.php</code>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/planning">แผนงาน (ใกล้เคียง W_planwork_view)</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/work-orders">ใบงาน / WO</Link>
            </Button>
          </div>
        </PlaceholderBlock>
      </div>
    </div>
  )
}

/** `W_worktime_view.php` */
export function WorktimeViewParityPage() {
  return (
    <Shell
      title="ดู Worktime ทั้งหมด"
      description="เทียบ `W_worktime_view.php` — รายการชั่วโมง/ช่วงเวลา"
      phpModules={['W_worktime_view.php']}
      hint={
        <Button variant="outline" size="sm" asChild>
          <Link to="/manhours">Manhours (mock)</Link>
        </Button>
      }
    />
  )
}

/** `W_manhours_hr.php` */
export function ManhoursHrParityPage() {
  return (
    <Shell
      title="Manhour HR"
      description="เทียบ `W_manhours_hr.php` — รายงาน manhour ฝั่ง HR"
      phpModules={['W_manhours_hr.php']}
      hint={
        <Button variant="outline" size="sm" asChild>
          <Link to="/reports">รายงานรวม</Link>
        </Button>
      }
    />
  )
}

/** `W_summary_weekly*.php` */
export function SummaryWeeklyParityPage() {
  return (
    <Shell
      title="สรุปรายสัปดาห์"
      description="เทียบ `W_summary_weekly.php` และชุด chart ที่เกี่ยวข้อง"
      phpModules={['W_summary_weekly.php', 'W_summary_weekly_chart.php', 'W_summary_weekly_chart_full.php']}
      hint={
        <Button variant="outline" size="sm" asChild>
          <Link to="/reports">รายงาน / กราฟ (mock)</Link>
        </Button>
      }
    />
  )
}
