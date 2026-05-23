import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
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
import {
  defaultReportsDateRange,
  ReportsDateFilter,
} from '@/features/reports/ReportsDateFilter'
import { fetchActivityLog } from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { cn } from '@/lib/utils'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function formatTime(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('th-TH')
}

export function ActivityLogPage() {
  const canRead = usePermission('reports.read')
  const [submitted, setSubmitted] = useState(() => defaultReportsDateRange(7))
  const [searchQ, setSearchQ] = useState('')
  const [appliedQ, setAppliedQ] = useState('')

  const q = useQuery({
    queryKey: ['activity-log', submitted, appliedQ],
    queryFn: () =>
      fetchActivityLog({
        from: submitted.from,
        to: submitted.to,
        q: appliedQ || undefined,
        limit: 200,
        offset: 0,
      }),
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  if (!canRead) {
    return (
      <AppPageShell title="Activity Log" description="บันทึกกิจกรรมระบบ">
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">reports.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="Activity Log"
      description="บันทึกกิจกรรม — คน · สาย · เวลา · ใบงาน · audit/login"
      contentClassName="space-y-6"
      headerActions={
        <>
          <Badge variant="secondary" className="text-xs">
            สูงสุด 200 แถว
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to="/reports">รายงาน KPI</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/reports/audit">Auditor Hub</Link>
          </Button>
        </>
      }
    >
        <ReportsDateFilter
          key={`${submitted.from}-${submitted.to}`}
          initial={submitted}
          onSearch={setSubmitted}
        />

        <AppCard pad="compact">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1 space-y-1">
              <Label htmlFor="activity-q">ค้นหา</Label>
              <Input
                id="activity-q"
                placeholder="คน, WO, Line, action…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={() => setAppliedQ(searchQ.trim())}
              disabled={q.isFetching}
            >
              <Search className="mr-2 size-4" aria-hidden />
              ค้นหา
            </Button>
          </div>
        </AppCard>

        {q.isLoading && !q.data ? (
          <Skeleton className="h-64 w-full rounded-card" />
        ) : q.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลด log ไม่สำเร็จ"
            description={(q.error as Error).message}
            action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
          />
        ) : q.data ? (
          <>
            <p className="text-caption">
              แสดง {q.data.items.length.toLocaleString()} / {q.data.total.toLocaleString()} รายการ
              · ช่วง {submitted.from} – {submitted.to}
            </p>
            <AppCard pad="compact">
              <div className="app-table-shell overflow-x-auto">
                <Table embedded stickyHeader zebra>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn('w-12', tableStickyClass(1))}>#</TableHead>
                      <TableHead className={tableStickyClass(2)}>เวลา</TableHead>
                      <TableHead>คน</TableHead>
                      <TableHead>สาย</TableHead>
                      <TableHead>WO</TableHead>
                      <TableHead>กิจกรรม</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {q.data.items.length ? (
                      q.data.items.map((row, i) => (
                        <TableRow key={row.id}>
                          <TableCell className={tableStickyClass(1)}>{i + 1}</TableCell>
                          <TableCell
                            className={cn(
                              'whitespace-nowrap text-body-sm tabular-nums',
                              tableStickyClass(2),
                            )}
                          >
                            {formatTime(row.createdAt)}
                          </TableCell>
                          <TableCell className="text-body-sm">
                            <span className="font-medium">{row.actorDisplayName ?? '—'}</span>
                            {row.actorId && row.actorId !== row.actorDisplayName ? (
                              <span className="block text-xs text-app-muted">{row.actorId}</span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-body-sm">{row.productLine ?? '—'}</TableCell>
                          <TableCell className="text-body-sm tabular-nums">
                            {row.workOrder ?? '—'}
                          </TableCell>
                          <TableCell className="text-body-sm">
                            <span>{row.actionLabel}</span>
                            {row.message ? (
                              <span className="mt-0.5 block max-w-[240px] truncate text-xs text-app-muted">
                                {row.message}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-xs uppercase">{row.status}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <EmptyState
                            className="border-0 bg-transparent py-10"
                            title="ไม่มีรายการในช่วงนี้"
                            description="ลองขยายวันที่หรือทำ mutation/import แล้วรีเฟรช"
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </AppCard>
          </>
        ) : (
          <EmptyState title="ไม่มีข้อมูล" description="เลือกช่วงวันที่แล้วกดค้นหา" />
        )}
    </AppPageShell>
  )
}
