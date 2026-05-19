/**
 * `/worktime` — สอง flow แยกกัน:
 * - แท็บ "มอบหมายงาน" → `W_worktime_view.php` (`GET /api/v1/worktime/planning`)
 * - แท็บ "ชั่วโมง HR" → `worktime_manhours.php` (`GET /api/v1/worktime/me`)
 */
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getStoredAuthUser } from '@/features/auth/login-api'
import { formatManhourDate } from '@/features/manhours/format-manhour-date'
import { fetchWorktimeMe, fetchWorktimePlanning } from '@/lib/api-public'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Clock3, Link as LinkIcon, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function HourCell({ value }: { value: number }) {
  return <span className="tabular-nums">{value > 0 ? value : '0'}</span>
}

function WorktimePlanningTab({
  isWorkcenter,
  adminIdwkctr,
}: {
  isWorkcenter: boolean
  adminIdwkctr: string
}) {
  const auth = getStoredAuthUser()
  const isAdmin = auth?.userst === 'A'

  const q = useQuery({
    queryKey: ['worktime-planning', adminIdwkctr],
    queryFn: () =>
      fetchWorktimePlanning({
        idwkctr: isAdmin && adminIdwkctr.trim() ? adminIdwkctr.trim() : undefined,
        limit: 500,
      }),
    enabled: isWorkcenter || (isAdmin && Boolean(adminIdwkctr.trim())),
  })

  if (!isWorkcenter && !(isAdmin && adminIdwkctr.trim())) {
    return (
      <p className="text-sm text-zinc-600">
        {isAdmin
          ? 'ระบุรหัส HR ด้านบนเพื่อดูรายการมอบหมายงาน'
          : 'หน้านี้สำหรับบัญชี Work center — กรุณาเข้าสู่ระบบด้วยรหัสช่าง (idwkctr)'}
      </p>
    )
  }

  if (q.isLoading) return <Skeleton className="h-64 w-full rounded-xl" />
  if (q.isError) return <p className="text-sm text-red-600">{(q.error as Error).message}</p>

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-sky-50">
            <TableHead className="w-14">ลำดับ</TableHead>
            <TableHead>รหัสแผน</TableHead>
            <TableHead>วันที่เริ่ม</TableHead>
            <TableHead>วันที่สิ้นสุด</TableHead>
            <TableHead>ผู้จัด</TableHead>
            <TableHead>หมายเหตุ/เหตุผล</TableHead>
            <TableHead className="w-24">ใบงาน</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {q.data?.items.length ? (
            q.data.items.map((row, i) => (
              <TableRow key={row.idplanw}>
                <TableCell>{i + 1}</TableCell>
                <TableCell className="font-medium">{row.mntplan ?? row.wkorder}</TableCell>
                <TableCell>{formatManhourDate(row.startDate)}</TableCell>
                <TableCell>{formatManhourDate(row.endDate)}</TableCell>
                <TableCell>{row.assigner ?? '—'}</TableCell>
                <TableCell className="max-w-xs truncate" title={row.comment ?? undefined}>
                  {row.comment ?? '—'}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-sky-700" asChild>
                    <Link to={`/work-orders/${row.idiw37}`}>ดู</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-sm text-zinc-500">
                ยังไม่มีงานที่มอบหมาย
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function WorktimeManhoursTab({ isWorkcenter }: { isWorkcenter: boolean }) {
  const q = useQuery({
    queryKey: ['worktime-me'],
    queryFn: () => fetchWorktimeMe({ limit: 500 }),
    enabled: Boolean(isWorkcenter),
  })

  const total = q.data?.total

  if (!isWorkcenter) {
    return (
      <p className="text-sm text-zinc-600">
        แท็บชั่วโมง HR สำหรับบัญชี Work center — กรุณาเข้าสู่ระบบด้วยรหัสช่าง (idwkctr)
      </p>
    )
  }

  if (q.isLoading) return <Skeleton className="h-64 w-full rounded-xl" />
  if (q.isError) return <p className="text-sm text-red-600">{(q.error as Error).message}</p>

  return (
    <>
      {total ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {(
            [
              ['WH', total.wh],
              ['OT1', total.ot1],
              ['OT1.5', total.ot15],
              ['OT1HOL', total.ot1hol],
              ['OT2', total.ot2],
              ['OT3', total.ot3],
              ['รวม', total.total],
            ] as const
          ).map(([label, val]) => (
            <div
              key={label}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center shadow-sm"
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
              <p className="text-lg font-semibold tabular-nums text-zinc-900">{val}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-50">
              <TableHead className="w-14">ลำดับ</TableHead>
              <TableHead>วันที่ทำงาน</TableHead>
              <TableHead className="text-right">จำนวนชั่วโมงที่ทำงาน</TableHead>
              <TableHead className="text-right">OT1</TableHead>
              <TableHead className="text-right">OT1.5</TableHead>
              <TableHead className="text-right">OT1HOL</TableHead>
              <TableHead className="text-right">OT2</TableHead>
              <TableHead className="text-right">OT3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {q.data?.items.length ? (
              q.data.items.map((row, i) => (
                <TableRow key={row.workday}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{formatManhourDate(row.workDate, row.workday)}</TableCell>
                  <TableCell className="text-right">
                    <HourCell value={row.wh} />
                  </TableCell>
                  <TableCell className="text-right">
                    <HourCell value={row.ot1} />
                  </TableCell>
                  <TableCell className="text-right">
                    <HourCell value={row.ot15} />
                  </TableCell>
                  <TableCell className="text-right">
                    <HourCell value={row.ot1hol} />
                  </TableCell>
                  <TableCell className="text-right">
                    <HourCell value={row.ot2} />
                  </TableCell>
                  <TableCell className="text-right">
                    <HourCell value={row.ot3} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-zinc-500">
                  ยังไม่มีข้อมูล manhour
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export function WorktimePage() {
  const auth = getStoredAuthUser()
  const isAdmin = auth?.userst === 'A'
  const isWorkcenter = auth?.accountType === 'workcenter' || (!auth?.accountType && auth?.idwkctr)
  const [adminIdwkctr, setAdminIdwkctr] = useState('')

  const qc = useQueryClient()

  return (
    <div>
      <PageHeader
        title="ดู Worktime ทั้งหมด"
        description="มอบหมายงาน (W_worktime_view) และชั่วโมง HR รายวัน (worktime_manhours)"
      >
        <Badge variant="secondary" className="gap-1">
          <ClipboardList className="size-3.5" />
          Planning
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Clock3 className="size-3.5" />
          Manhours
        </Badge>
        <Button variant="outline" size="sm" asChild>
          <Link to="/manhours">
            <LinkIcon className="mr-1 size-3.5" />
            Performance
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void qc.invalidateQueries({ queryKey: ['worktime-planning'] })
            void qc.invalidateQueries({ queryKey: ['worktime-me'] })
          }}
        >
          <RefreshCcw className="mr-1 size-3.5" />
          รีเฟรช
        </Button>
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {isAdmin ? (
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="space-y-1">
              <Label htmlFor="wt-idwkctr">รหัส HR (Admin)</Label>
              <Input
                id="wt-idwkctr"
                value={adminIdwkctr}
                onChange={(e) => setAdminIdwkctr(e.target.value)}
                placeholder="ดูมอบหมายงานของช่าง"
                className="w-48"
              />
            </div>
          </div>
        ) : null}

        <Tabs defaultValue="planning">
          <TabsList>
            <TabsTrigger value="planning">มอบหมายงาน</TabsTrigger>
            <TabsTrigger value="manhours">ชั่วโมง HR</TabsTrigger>
          </TabsList>
          <TabsContent value="planning" className="mt-4">
            <WorktimePlanningTab isWorkcenter={Boolean(isWorkcenter)} adminIdwkctr={adminIdwkctr} />
          </TabsContent>
          <TabsContent value="manhours" className="mt-4">
            <WorktimeManhoursTab isWorkcenter={Boolean(isWorkcenter)} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
