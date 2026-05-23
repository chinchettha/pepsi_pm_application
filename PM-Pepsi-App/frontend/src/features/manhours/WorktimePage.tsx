/**
 * `/worktime` — สอง flow แยกกัน:
 * - แท็บ "มอบหมายงาน" → `W_worktime_view.php` (`GET /api/v1/worktime/planning`)
 * - แท็บ "ชั่วโมง HR" → `worktime_manhours.php` (`GET /api/v1/worktime/me`)
 */
import { CanPermission } from '@/components/auth/CanPermission'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
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
import { useAnyPermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ClipboardList, Clock3, Link as LinkIcon, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function HourCell({ value }: { value: number }) {
  return <span className="tabular-nums">{value > 0 ? value : '0'}</span>
}

function QueryErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="โหลดไม่สำเร็จ"
      description={message}
      action={{ label: 'ลองใหม่', onClick: onRetry }}
    />
  )
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
    placeholderData: keepPreviousData,
  })

  if (!isWorkcenter && !(isAdmin && adminIdwkctr.trim())) {
    return (
      <EmptyState
        className="border-0 bg-transparent"
        title={isAdmin ? 'ระบุรหัส HR' : 'สำหรับบัญชี Work center'}
        description={
          isAdmin
            ? 'กรอกรหัส HR ด้านบนเพื่อดูรายการมอบหมายงาน'
            : 'เข้าสู่ระบบด้วยรหัสช่าง (idwkctr) เพื่อดูงานที่มอบหมาย'
        }
      />
    )
  }

  if (q.isLoading && !q.data) return <Skeleton className="h-64 w-full rounded-card" />
  if (q.isError) {
    return (
      <QueryErrorState message={(q.error as Error).message} onRetry={() => void q.refetch()} />
    )
  }

  return (
    <div className="app-table-shell overflow-x-auto">
      <Table embedded stickyHeader zebra>
        <TableHeader>
          <TableRow>
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
                  <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                    <Link to={`/work-orders/${row.idiw37}`}>ดู</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState
                  className="border-0 bg-transparent py-10"
                  title="ยังไม่มีงานที่มอบหมาย"
                  description="ตรวจแผน PM/CM หรือการจ่ายงานจากหัวหน้างาน"
                />
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
    placeholderData: keepPreviousData,
  })

  const total = q.data?.total

  if (!isWorkcenter) {
    return (
      <EmptyState
        className="border-0 bg-transparent"
        title="สำหรับบัญชี Work center"
        description="เข้าสู่ระบบด้วยรหัสช่าง (idwkctr) เพื่อดูชั่วโมง HR รายวัน"
      />
    )
  }

  if (q.isLoading && !q.data) return <Skeleton className="h-64 w-full rounded-card" />
  if (q.isError) {
    return (
      <QueryErrorState message={(q.error as Error).message} onRetry={() => void q.refetch()} />
    )
  }

  return (
    <>
      {total ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {(
            [
              ['WH', total.wh],
              ['OT1', total.ot1],
              ['OT1.5', total.ot15],
              ['OT1 วันหยุด', total.ot1hol],
              ['OT2', total.ot2],
              ['OT3', total.ot3],
              ['รวม', total.total],
            ] as const
          ).map(([label, val]) => (
            <AppCard key={label} pad="compact" className="text-center">
              <p className="text-eyebrow text-app-muted">{label}</p>
              <p className="text-lg font-semibold tabular-nums text-app">{val}</p>
            </AppCard>
          ))}
        </div>
      ) : null}

      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">ลำดับ</TableHead>
              <TableHead>วันที่ทำงาน</TableHead>
              <TableHead className="text-right">WH</TableHead>
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
                <TableCell colSpan={8} className="p-0">
                  <EmptyState
                    className="border-0 bg-transparent py-10"
                    title="ยังไม่มีข้อมูล manhour"
                    description="บันทึกชั่วโมงที่แท็บ Admin หรือนำเข้าไฟล์"
                  />
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
  const canRead = useAnyPermission(['manhours.read', 'manhours.admin'])
  const isAdmin = auth?.userst === 'A'
  const isWorkcenter = auth?.accountType === 'workcenter' || (!auth?.accountType && auth?.idwkctr)
  const [adminIdwkctr, setAdminIdwkctr] = useState('')

  const qc = useQueryClient()

  if (!canRead) {
    return (
      <AppPageShell title="Worktime" description="มอบหมายงานและชั่วโมง HR รายวัน">
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">manhours.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="Worktime"
      description="มอบหมายงาน (W_worktime_view) · ชั่วโมง HR รายวัน"
      contentClassName="space-y-6"
      headerActions={
        <>
          <Badge variant="secondary" className="gap-1 text-xs">
            <ClipboardList className="size-3.5" aria-hidden />
            มอบหมาย
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs">
            <Clock3 className="size-3.5" aria-hidden />
            ชั่วโมง
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to="/manhours">
              <LinkIcon className="mr-1 size-3.5" aria-hidden />
              Performance
            </Link>
          </Button>
          {isAdmin ? (
            <Button variant="outline" size="sm" asChild>
              <Link to="/manhours/admin">จัดการ Man Hour</Link>
            </Button>
          ) : null}
          <CanPermission permission="work-orders.read">
            <Button variant="outline" size="sm" asChild>
              <Link to="/work-orders">ใบงาน</Link>
            </Button>
          </CanPermission>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void qc.invalidateQueries({ queryKey: ['worktime-planning'] })
              void qc.invalidateQueries({ queryKey: ['worktime-me'] })
            }}
          >
            <RefreshCcw className="mr-1 size-3.5" aria-hidden />
            รีเฟรช
          </Button>
        </>
      }
    >
        {isAdmin ? (
          <AppCard pad="compact">
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
          </AppCard>
        ) : null}

        <Tabs defaultValue="planning">
          <TabsList className="flex h-auto flex-wrap gap-1 bg-[var(--app-surface)] p-1">
            <TabsTrigger value="planning">มอบหมายงาน</TabsTrigger>
            <TabsTrigger value="manhours">ชั่วโมง HR</TabsTrigger>
          </TabsList>
          <TabsContent value="planning" className="mt-4">
            <AppCard pad="default">
              <WorktimePlanningTab isWorkcenter={Boolean(isWorkcenter)} adminIdwkctr={adminIdwkctr} />
            </AppCard>
          </TabsContent>
          <TabsContent value="manhours" className="mt-4">
            <AppCard pad="default">
              <WorktimeManhoursTab isWorkcenter={Boolean(isWorkcenter)} />
            </AppCard>
          </TabsContent>
        </Tabs>
    </AppPageShell>
  )
}
