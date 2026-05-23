import type { AdminHealthResponse } from '@/api/schemas'
import { ConfirmPhraseDialog } from '@/components/admin/ConfirmPhraseDialog'
import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied'
import { AdminPageRoot } from '@/components/admin/AdminPageRoot'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/ui/empty-state'
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
  fetchAdminHealth,
  fetchHealthErrorLogs,
  fetchHealthSlowApis,
  formatBytes,
  formatUptime,
  HEALTH_POLL_MS,
  runHealthMigrate,
} from '@/lib/admin-health-api'
import { usePermission } from '@/lib/use-permission'
import { usePublicSettings } from '@/providers/SettingsProvider'
import { cn } from '@/lib/utils'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Database,
  HardDrive,
  Loader2,
  Play,
  RefreshCcw,
  Server,
  Timer,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

type HealthStatus = AdminHealthResponse['db']['status']

function statusBadge(status: HealthStatus) {
  if (status === 'ok') return <Badge className="bg-emerald-700">ปกติ</Badge>
  if (status === 'warning') return <Badge className="bg-amber-600">เตือน</Badge>
  if (status === 'error') return <Badge variant="destructive">ผิดพลาด</Badge>
  return <Badge variant="secondary">ไม่ทราบ</Badge>
}

function StatusCard({
  title,
  description,
  status,
  icon: Icon,
  children,
}: {
  title: string
  description: string
  status: HealthStatus
  icon: typeof Database
  children: React.ReactNode
}) {
  const tone =
    status === 'error' ? 'danger' : status === 'warning' ? 'warning' : status === 'ok' ? 'success' : 'info'

  return (
    <Card data-tone={tone} className={cn('admin-card admin-kpi-card')}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="size-5 text-app-muted" />
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          {statusBadge(status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-body-sm text-app">{children}</CardContent>
    </Card>
  )
}

function OverviewTab({
  data,
  diskPath,
  setDiskPath,
  setAppliedDisk,
  canMigrate,
  maintenanceOn,
  onMigrateClick,
  migratePending,
}: {
  data: AdminHealthResponse
  diskPath: string
  setDiskPath: (v: string) => void
  setAppliedDisk: (v: string) => void
  canMigrate: boolean
  maintenanceOn: boolean
  onMigrateClick: () => void
  migratePending: boolean
}) {
  return (
    <>
      <Card className="admin-card">
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="min-w-[200px] flex-1 space-y-1">
            <Label htmlFor="disk-path">ดิสก์ที่ตรวจ</Label>
            <Input
              id="disk-path"
              value={diskPath}
              onChange={(e) => setDiskPath(e.target.value)}
              placeholder="D:\"
            />
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-button bg-[var(--admin-primary)] px-4 text-body-sm font-medium text-white hover:opacity-90"
            onClick={() => setAppliedDisk(diskPath)}
          >
            ใช้ path นี้
          </button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <StatusCard
          title="ฐานข้อมูล"
          description="SELECT 1 + connection pool"
          status={data.db.status}
          icon={Database}
        >
          <p>
            Latency:{' '}
            <span className="font-mono font-medium">
              {data.db.latencyMs != null ? `${data.db.latencyMs} ms` : '—'}
            </span>
          </p>
          <p>
            Pool — total: {data.db.pool.total}, idle: {data.db.pool.idle}, waiting:{' '}
            {data.db.pool.waiting}
          </p>
          {data.db.message ? <p className="text-xs text-red-600">{data.db.message}</p> : null}
        </StatusCard>

        <StatusCard
          title="ดิสก์"
          description={data.disk.path}
          status={data.disk.status}
          icon={HardDrive}
        >
          <p>
            ใช้แล้ว:{' '}
            <span className="font-medium">
              {formatBytes(data.disk.usedBytes)} (
              {data.disk.usedPercent != null ? `${data.disk.usedPercent}%` : '—'})
            </span>
          </p>
          <p>ว่าง: {formatBytes(data.disk.freeBytes)}</p>
          <p>ทั้งหมด: {formatBytes(data.disk.totalBytes)}</p>
          {data.disk.message ? (
            <p className="text-xs text-amber-700">{data.disk.message}</p>
          ) : null}
        </StatusCard>

        <StatusCard
          title="API process"
          description={`${data.service} v${data.version} (ไม่ใช่ Docker stats)`}
          status={data.process.status}
          icon={Server}
        >
          <p>{data.process.platform}</p>
          <p>Node {data.process.nodeVersion}</p>
          <p>Uptime: {formatUptime(data.process.uptimeSec)}</p>
          <p>
            Memory — RSS {data.process.memoryRssMb} MB, heap {data.process.memoryHeapUsedMb} MB
          </p>
        </StatusCard>

        <StatusCard
          title="Migration"
          description="ตรวจ object สำคัญใน PostgreSQL"
          status={data.migration.status}
          icon={Activity}
        >
          <p>
            ไฟล์ในโฟลเดอร์: <span className="font-medium">{data.migration.totalFiles}</span>
            {data.migration.migrationsDir ? (
              <span className="mt-1 block truncate font-mono text-xs text-app-muted">
                {data.migration.migrationsDir}
              </span>
            ) : null}
          </p>
          <p>
            ตรวจแล้ว: applied {data.migration.appliedCount}, pending{' '}
            <span
              className={cn(
                'font-medium',
                data.migration.pendingCount > 0 && 'text-amber-700',
              )}
            >
              {data.migration.pendingCount}
            </span>
            , ไม่ติดตาม {data.migration.unverifiedCount}
          </p>
          <p>
            ล่าสุดที่พร้อม:{' '}
            {data.migration.latestAppliedId ? (
              <span className="font-mono font-medium">
                {data.migration.latestAppliedId} ({data.migration.latestFile})
              </span>
            ) : (
              '—'
            )}
          </p>
          {canMigrate ? (
            <div className="pt-2">
              <Button
                type="button"
                size="sm"
                disabled={
                  migratePending ||
                  data.migration.pendingCount === 0 ||
                  !maintenanceOn
                }
                onClick={onMigrateClick}
              >
                {migratePending ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <Play className="mr-1 size-4" />
                )}
                รัน pending migrations
              </Button>
              {!maintenanceOn ? (
                <p className="mt-1 text-xs text-amber-800">
                  ต้องเปิด maintenance ก่อน —{' '}
                  <Link to="/admin/settings" className="underline">
                    Settings
                  </Link>{' '}
                  หรือ{' '}
                  <Link to="/admin/announcements" className="underline">
                    Announcements
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}
        </StatusCard>
      </div>

      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-base">รายการ migration ที่ตรวจ</CardTitle>
          <CardDescription>
            รัน pending ผ่าน psql เมื่อ maintenance เปิด · ไฟล์ที่ไม่ติดตาม probe ต้องรันมือ
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-card border border-app">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                <TableHead>รายการ</TableHead>
                <TableHead>ไฟล์</TableHead>
                <TableHead className="text-right">สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.migration.probes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-caption">
                    ไม่พบโฟลเดอร์ migrations บนเซิร์ฟเวอร์ API
                  </TableCell>
                </TableRow>
              ) : (
                data.migration.probes.map((row) => (
                  <TableRow key={row.file}>
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell className="text-body-sm">{row.label}</TableCell>
                    <TableCell className="max-w-[240px] truncate font-mono text-xs">
                      {row.file}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.status === 'applied' ? (
                        <Badge className="bg-emerald-700">applied</Badge>
                      ) : (
                        <Badge variant="destructive">pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

export function AdminHealthPage() {
  const canRead = usePermission('admin.health.read')
  const canMigrate = usePermission('admin.health.migrate')
  const { settings: publicSettings } = usePublicSettings()
  const maintenanceOn = publicSettings?.maintenance?.enabled === true
  const queryClient = useQueryClient()

  const [diskPath, setDiskPath] = useState('D:\\')
  const [appliedDisk, setAppliedDisk] = useState('D:\\')
  const [migrateOpen, setMigrateOpen] = useState(false)
  const [tab, setTab] = useState('overview')

  const q = useQuery({
    queryKey: ['admin', 'health', appliedDisk],
    queryFn: () => fetchAdminHealth(appliedDisk),
    enabled: canRead,
    refetchInterval: HEALTH_POLL_MS,
    placeholderData: keepPreviousData,
  })

  const errorsQ = useQuery({
    queryKey: ['admin', 'health', 'errors'],
    queryFn: () => fetchHealthErrorLogs(100),
    enabled: canRead && tab === 'errors',
    refetchInterval: HEALTH_POLL_MS,
    placeholderData: keepPreviousData,
  })

  const slowQ = useQuery({
    queryKey: ['admin', 'health', 'slow-apis'],
    queryFn: () => fetchHealthSlowApis(1000),
    enabled: canRead && tab === 'slow',
    refetchInterval: HEALTH_POLL_MS,
    placeholderData: keepPreviousData,
  })

  const migrateMut = useMutation({
    mutationFn: runHealthMigrate,
    onSuccess: (result) => {
      setMigrateOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'health'] })
      if (result.stoppedAt) {
        toast.error(`หยุดที่ ${result.stoppedAt.file}: ${result.stoppedAt.message}`)
      } else {
        toast.success(`รัน migration สำเร็จ ${result.applied.length} ไฟล์`)
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  if (!canRead) {
    return (
      <AdminPageRoot tourTarget="admin-health">
        <AdminAccessDenied
          message={
            <>
              ไม่มีสิทธิ์ <code className="text-xs">admin.health.read</code>
            </>
          }
        />
      </AdminPageRoot>
    )
  }

  const data = q.data

  const refetchActive = () => {
    void q.refetch()
    if (tab === 'errors') void errorsQ.refetch()
    if (tab === 'slow') void slowQ.refetch()
  }

  return (
    <AdminPageShell
      tourTarget="admin-health"
      title="สุขภาพระบบ"
      description="ฐานข้อมูล · ดิสก์ · migration · error log · API ช้า (p95 > 1s)"
      contentClassName="space-y-4"
      headerActions={
        <>
          {data ? (
            <Badge variant="outline" className="tabular-nums">
              อัปเดต {new Date(data.time).toLocaleTimeString('th-TH')}
            </Badge>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="admin-toolbar-btn"
            onClick={refetchActive}
            disabled={q.isFetching || errorsQ.isFetching || slowQ.isFetching}
          >
            <RefreshCcw
              className={`mr-1 size-3.5 ${q.isFetching || errorsQ.isFetching || slowQ.isFetching ? 'animate-spin' : ''}`}
              aria-hidden
            />
            รีเฟรช
          </Button>
        </>
      }
    >
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="errors">บันทึก error</TabsTrigger>
            <TabsTrigger value="slow">API ช้า</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-6">
            {q.isLoading && !data ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-40 rounded-card" />
                <Skeleton className="h-40 rounded-card" />
                <Skeleton className="h-40 rounded-card md:col-span-2" />
              </div>
            ) : q.isError && !data ? (
              <EmptyState
                icon={AlertCircle}
                title="โหลดสุขภาพระบบไม่สำเร็จ"
                description={(q.error as Error).message}
                action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
              />
            ) : data ? (
              <OverviewTab
                data={data}
                diskPath={diskPath}
                setDiskPath={setDiskPath}
                setAppliedDisk={setAppliedDisk}
                canMigrate={canMigrate}
                maintenanceOn={maintenanceOn}
                migratePending={migrateMut.isPending}
                onMigrateClick={() => setMigrateOpen(true)}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="errors" className="mt-4">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="size-4 text-amber-600" />
                  Error log (audit)
                </CardTitle>
                <CardDescription>100 รายการล่าสุดที่สถานะ error จาก audit log</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {errorsQ.isLoading && !errorsQ.data ? (
                  <div className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : errorsQ.isError ? (
                  <EmptyState
                    icon={AlertCircle}
                    className="m-4"
                    title="โหลด error log ไม่สำเร็จ"
                    description={(errorsQ.error as Error).message}
                    action={{ label: 'ลองใหม่', onClick: () => void errorsQ.refetch() }}
                  />
                ) : (
                  <div className="app-table-shell overflow-x-auto">
                  <Table embedded stickyHeader zebra>
                    <TableHeader>
                      <TableRow>
                        <TableHead>เวลา</TableHead>
                        <TableHead>action</TableHead>
                        <TableHead>resource</TableHead>
                        <TableHead>ข้อความ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(errorsQ.data ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-caption">
                            ไม่มี error ใน audit log
                          </TableCell>
                        </TableRow>
                      ) : (
                        (errorsQ.data ?? []).map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="whitespace-nowrap text-xs tabular-nums">
                              {new Date(row.createdAt).toLocaleString('th-TH')}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{row.action}</TableCell>
                            <TableCell className="text-xs">
                              {row.resource ?? '—'}
                              {row.resourceId ? ` / ${row.resourceId}` : ''}
                            </TableCell>
                            <TableCell className="max-w-[320px] truncate text-xs" title={row.message ?? ''}>
                              {row.message ?? '—'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slow" className="mt-4">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Timer className="size-4 text-app-muted" />
                  Slow API (p95 &gt; 1s)
                </CardTitle>
                <CardDescription>
                  จาก middleware ใน process นี้ — สะสมหลัง deploy/restart
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {slowQ.isLoading && !slowQ.data ? (
                  <div className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : slowQ.isError ? (
                  <EmptyState
                    icon={AlertCircle}
                    className="m-4"
                    title="โหลดรายการ API ช้าไม่สำเร็จ"
                    description={(slowQ.error as Error).message}
                    action={{ label: 'ลองใหม่', onClick: () => void slowQ.refetch() }}
                  />
                ) : (
                  <div className="app-table-shell overflow-x-auto">
                  <Table embedded stickyHeader zebra>
                    <TableHeader>
                      <TableRow>
                        <TableHead>route</TableHead>
                        <TableHead className="text-right">samples</TableHead>
                        <TableHead className="text-right">p50</TableHead>
                        <TableHead className="text-right">p95</TableHead>
                        <TableHead className="text-right">max</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(slowQ.data?.items ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-caption">
                            ยังไม่มี endpoint ช้าเกิน {slowQ.data?.thresholdMs ?? 1000} ms
                          </TableCell>
                        </TableRow>
                      ) : (
                        (slowQ.data?.items ?? []).map((row) => (
                          <TableRow key={row.route}>
                            <TableCell className="font-mono text-xs">{row.route}</TableCell>
                            <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                            <TableCell className="text-right tabular-nums">{row.p50Ms} ms</TableCell>
                            <TableCell className="text-right font-medium tabular-nums text-amber-800">
                              {row.p95Ms} ms
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{row.maxMs} ms</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      <ConfirmPhraseDialog
        open={migrateOpen}
        onOpenChange={setMigrateOpen}
        tone="danger"
        title="รัน pending migrations"
        description="จะรันไฟล์ SQL ที่ probe เป็น pending ด้วย psql — ใช้เฉพาะ staging/maintenance"
        phrase="MIGRATE"
        phraseLabel="พิมพ์ MIGRATE"
        confirmLabel="รัน migration"
        loading={migrateMut.isPending}
        onConfirm={() => migrateMut.mutate()}
      />
    </AdminPageShell>
  )
}
