import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied'
import { AdminPageRoot } from '@/components/admin/AdminPageRoot'
import { FailedLoginChart } from './FailedLoginChart'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { AdminKpiCard } from '@/components/admin/AdminKpiCard'
import { AdminKpiGrid } from '@/components/admin/AdminKpiGrid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
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
import { BlockIpQuickButton, BlockedIpCard } from './BlockedIpCard'
import { fetchSecurityOverview } from '@/lib/admin-security-api'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, Ban, Lock, RefreshCcw, ShieldAlert, ShieldX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const selectClass =
  'flex h-10 rounded-button border border-app bg-[var(--app-surface)] px-3 py-2 text-body text-app'

function deniedBadge() {
  return <Badge variant="destructive">denied</Badge>
}

export function AdminSecurityPage() {
  const canRead = usePermission('admin.security.read')
  const canWrite = usePermission('admin.security.write')
  const [days, setDays] = useState(30)

  const q = useQuery({
    queryKey: ['admin', 'security', days],
    queryFn: () => fetchSecurityOverview(days),
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  if (!canRead) {
    return (
      <AdminPageRoot tourTarget="admin-security">
        <AdminAccessDenied
          message={
            <>
              ไม่มีสิทธิ์ <code className="text-xs">admin.security.read</code>
            </>
          }
        />
      </AdminPageRoot>
    )
  }

  const data = q.data

  return (
    <AdminPageShell
      tourTarget="admin-security"
      title="รายงานความปลอดภัย"
      description="Login ล้มเหลว · RBAC deny · Rate limit — จาก audit log"
      contentClassName="space-y-6"
      headerActions={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="admin-toolbar-btn"
          onClick={() => void q.refetch()}
          disabled={q.isFetching}
        >
          <RefreshCcw className={`mr-1 size-3.5 ${q.isFetching ? 'animate-spin' : ''}`} aria-hidden />
          รีเฟรช
        </Button>
      }
    >
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="sec-days">ช่วงเวลา (วัน)</Label>
            <select
              id="sec-days"
              className={selectClass}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>7 วัน</option>
              <option value={14}>14 วัน</option>
              <option value={30}>30 วัน</option>
              <option value={60}>60 วัน</option>
              <option value={90}>90 วัน</option>
            </select>
          </div>
        </div>

        {q.isLoading && !data ? (
          <AdminKpiGrid className="sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28 rounded-card" />
            <Skeleton className="h-28 rounded-card" />
            <Skeleton className="h-28 rounded-card" />
          </AdminKpiGrid>
        ) : q.isError && !data ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลดรายงานความปลอดภัยไม่สำเร็จ"
            description={(q.error as Error).message}
            action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
          />
        ) : data ? (
          <AdminKpiGrid className="sm:grid-cols-2 lg:grid-cols-3">
            <AdminKpiCard
              tone="danger"
              icon={Lock}
              label="Login ล้มเหลว"
              value={String(data.failedLogin.total)}
              hint={`${days} วันล่าสุด`}
            />
            <AdminKpiCard
              tone="warning"
              icon={ShieldX}
              label="RBAC ปฏิเสธ"
              value={String(data.denied.total)}
              hint="action = rbac.deny"
            />
            <AdminKpiCard
              tone="info"
              icon={Ban}
              label="Rate limit (429)"
              value={String(data.rateLimitHits)}
              hint={`${data.rateLimitedIps.length} IP`}
            />
          </AdminKpiGrid>
        ) : null}

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="size-4" aria-hidden />
              Login ล้มเหลวต่อวัน
            </CardTitle>
            <CardDescription>กราฟจาก audit — login ที่ status = denied</CardDescription>
          </CardHeader>
          <CardContent>
            {q.isLoading && !data ? (
              <Skeleton className="h-[220px]" />
            ) : (
              <div className="h-[220px]">
                <FailedLoginChart series={data?.failedLogin.series ?? []} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ban className="size-4" aria-hidden />
              IP ที่โดน rate limit
            </CardTitle>
            <CardDescription>{data?.rateLimitNote}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {q.isLoading && !data ? (
              <Skeleton className="m-4 h-32" />
            ) : (data?.rateLimitedIps.length ?? 0) === 0 ? (
              <p className="p-4 text-caption">
                ยังไม่มีเหตุการณ์ rate limit ใน audit — เกิดเมื่อเรียก API เกินโควต้า
              </p>
            ) : (
              <div className="app-table-shell overflow-x-auto">
              <Table embedded stickyHeader zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP</TableHead>
                    <TableHead>ครั้ง (429)</TableHead>
                    <TableHead>ล่าสุด</TableHead>
                    {canWrite ? <TableHead className="text-right">การกระทำ</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data!.rateLimitedIps.map((row) => (
                    <TableRow key={row.ip}>
                      <TableCell className="font-mono text-xs">{row.ip}</TableCell>
                      <TableCell>{row.hits}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(row.lastAt).toLocaleString('th-TH')}
                      </TableCell>
                      {canWrite ? (
                        <TableCell className="text-right">
                          <BlockIpQuickButton ip={row.ip} canWrite />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="size-4" aria-hidden />
                IP ผิดปกติ (denied ≥ 3)
              </CardTitle>
              <CardDescription>รวม login / rbac / rate limit ในช่วง {days} วัน</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {q.isLoading && !data ? (
                <Skeleton className="m-4 h-32" />
              ) : (data?.suspiciousIps.length ?? 0) === 0 ? (
                <p className="p-4 text-caption">ไม่พบ IP ที่เกินเกณฑ์</p>
              ) : (
                <div className="app-table-shell overflow-x-auto">
                <Table embedded stickyHeader zebra>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP</TableHead>
                      <TableHead>จำนวน</TableHead>
                      <TableHead>ล่าสุด</TableHead>
                      {canWrite ? <TableHead className="text-right">การกระทำ</TableHead> : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data!.suspiciousIps.map((row) => (
                      <TableRow key={row.ip}>
                        <TableCell className="font-mono text-xs">{row.ip}</TableCell>
                        <TableCell>{row.hits}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {new Date(row.lastAt).toLocaleString('th-TH')}
                        </TableCell>
                        {canWrite ? (
                          <TableCell className="text-right">
                            <BlockIpQuickButton ip={row.ip} canWrite />
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">
                RBAC ปฏิเสธ
                {data ? (
                  <Badge variant="secondary" className="ml-2 tabular-nums">
                    {data.denied.total}
                  </Badge>
                ) : null}
              </CardTitle>
              <CardDescription>
                จาก middleware —{' '}
                <Link to="/admin/audit?status=denied" className="text-sky-700 underline">
                  ดูใน Audit
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {q.isLoading && !data ? (
                <Skeleton className="m-4 h-32" />
              ) : (data?.denied.items.length ?? 0) === 0 ? (
                <p className="p-4 text-caption">
                  ยังไม่มี rbac.deny — ลองเข้าหน้าโดยไม่มีสิทธิ์หรือเรียก API ที่ forbidden
                </p>
              ) : (
                <div className="app-table-shell overflow-x-auto">
                <Table embedded stickyHeader zebra>
                  <TableHeader>
                    <TableRow>
                      <TableHead>เวลา</TableHead>
                      <TableHead>ผู้ใช้</TableHead>
                      <TableHead>สิทธิ์ที่ขาด</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data!.denied.items.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap text-xs">
                          {new Date(row.createdAt).toLocaleString('th-TH')}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {row.actorId ?? '—'}
                          {row.ip ? (
                            <span className="mt-1 block text-app-muted">{row.ip}</span>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="font-mono text-xs">{row.message ?? '—'}</span>
                            {deniedBadge()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {data ? (
          <BlockedIpCard items={data.blockedIps.items} canWrite={canWrite} />
        ) : q.isLoading && !data ? (
          <Skeleton className="h-48 rounded-card" />
        ) : null}
    </AdminPageShell>
  )
}
