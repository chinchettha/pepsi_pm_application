import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied'
import { AdminPageRoot } from '@/components/admin/AdminPageRoot'
import { AdminKpiCard } from '@/components/admin/AdminKpiCard'
import { AdminKpiGrid } from '@/components/admin/AdminKpiGrid'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAdminAbout } from '@/lib/admin-about-api'
import { formatBytes, formatUptime } from '@/lib/admin-health-api'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, Building2, Cpu, HardDrive, Info, KeyRound, RefreshCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  licenseStatusLabel,
  licenseStatusTone,
  migrationProgressPercent,
} from './about-display'

function migrationBadge(pending: number, status: string) {
  if (pending === 0 && status === 'ok') {
    return <Badge className="bg-emerald-700">ครบ</Badge>
  }
  if (status === 'error') return <Badge variant="destructive">ผิดพลาด</Badge>
  return <Badge className="bg-amber-600">ค้าง {pending}</Badge>
}

function licenseBadge(status: string) {
  const tone = licenseStatusTone(status)
  if (tone === 'ok') return <Badge className="bg-emerald-700">{licenseStatusLabel(status)}</Badge>
  if (tone === 'warn') return <Badge className="bg-amber-600">{licenseStatusLabel(status)}</Badge>
  return <Badge variant="secondary">{licenseStatusLabel(status)}</Badge>
}

export function AdminAboutPage() {
  const canRead = usePermission('admin.about.read')

  const q = useQuery({
    queryKey: ['admin', 'about'],
    queryFn: fetchAdminAbout,
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  if (!canRead) {
    return (
      <AdminPageRoot tourTarget="admin-about">
        <AdminAccessDenied
          message={
            <>
              ไม่มีสิทธิ์ <code className="text-xs">admin.about.read</code>
            </>
          }
        />
      </AdminPageRoot>
    )
  }

  const d = q.data
  const migPct = d ? migrationProgressPercent(d.migration.appliedCount, d.migration.totalFiles) : 0

  return (
    <AdminPageShell
      tourTarget="admin-about"
      title="เกี่ยวกับระบบ"
      description="เวอร์ชัน · องค์กร · migration · เซิร์ฟเวอร์และ license"
      contentClassName="space-y-6"
      headerActions={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="admin-toolbar-btn"
          disabled={q.isFetching}
          onClick={() => void q.refetch()}
        >
          <RefreshCcw className={`mr-1 size-3.5 ${q.isFetching ? 'animate-spin' : ''}`} aria-hidden />
          รีเฟรช
        </Button>
      }
    >
        {q.isError && !d ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลดข้อมูลไม่สำเร็จ"
            description={(q.error as Error)?.message ?? 'ไม่ทราบสาเหตุ'}
            action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
          />
        ) : null}

        {q.isLoading && !d ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-28 rounded-card" />
            <Skeleton className="h-28 rounded-card" />
            <Skeleton className="h-28 rounded-card" />
          </div>
        ) : d ? (
          <>
            <AdminKpiGrid className="sm:grid-cols-2 lg:grid-cols-3">
              <AdminKpiCard
                tone="info"
                icon={Info}
                label="เวอร์ชัน API"
                value={d.apiVersion}
                hint={`Web ${d.webVersion}`}
              />
              <AdminKpiCard
                tone={d.migration.pendingCount === 0 ? 'success' : 'warning'}
                icon={HardDrive}
                label="Migration"
                value={`${d.migration.appliedCount}/${d.migration.totalFiles}`}
                hint={
                  d.migration.latestAppliedId
                    ? `#${d.migration.latestAppliedId} ${d.migration.latestFile ?? ''}`
                    : 'ยังไม่มี probe ผ่าน'
                }
              />
              <AdminKpiCard
                tone={licenseStatusTone(d.license.status) === 'warn' ? 'warning' : 'info'}
                icon={KeyRound}
                label="License"
                value={licenseStatusLabel(d.license.status)}
                hint={d.license.expiresAt ? 'มีวันหมดอายุ' : 'ดูใน Settings'}
              />
            </AdminKpiGrid>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="admin-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Info className="size-4" />
                    Build
                  </CardTitle>
                  <CardDescription>จาก package.json + env ตอน deploy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-body-sm">
                  <p>
                    <span className="text-app-muted">API:</span> {d.apiVersion}
                  </p>
                  <p>
                    <span className="text-app-muted">Web:</span> {d.webVersion}
                  </p>
                  {d.buildCommit ? (
                    <p className="font-mono text-xs text-app-muted">commit {d.buildCommit}</p>
                  ) : (
                    <p className="text-xs text-app-muted">ตั้ง BUILD_COMMIT ตอน build เพื่อแสดง hash</p>
                  )}
                  {d.buildTime ? (
                    <p className="text-xs text-app-muted">
                      build {new Date(d.buildTime).toLocaleString('th-TH')}
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="size-4" />
                    องค์กร
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-body-sm">
                  <p>
                    <span className="text-app-muted">Vendor:</span> {d.vendor}
                  </p>
                  <p>
                    <span className="text-app-muted">Client:</span> {d.client}
                  </p>
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Migration</CardTitle>
                  <CardDescription>
                    <Link to="/admin/health" className="text-sky-700 underline">
                      รายละเอียด + รัน SQL ใน Health
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-body-sm">
                  <div className="flex items-center gap-2">
                    {migrationBadge(d.migration.pendingCount, d.migration.status)}
                    <span className="tabular-nums">
                      {d.migration.appliedCount}/{d.migration.totalFiles} ไฟล์ (probe)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-app-muted">
                    <div
                      className="h-full bg-emerald-600 transition-all"
                      style={{ width: `${migPct}%` }}
                    />
                  </div>
                  {d.migration.latestAppliedId ? (
                    <p className="text-xs text-app-muted">
                      ล่าสุด #{d.migration.latestAppliedId}
                      {d.migration.latestFile ? ` — ${d.migration.latestFile}` : ''}
                    </p>
                  ) : null}
                  {d.migration.unverifiedCount > 0 ? (
                    <p className="text-xs text-amber-700">
                      ไม่มี probe ใน Health: {d.migration.unverifiedCount} ไฟล์ (นับรวมใน total)
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="admin-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Cpu className="size-4" />
                    เซิร์ฟเวอร์ API
                  </CardTitle>
                  <CardDescription>เทียบ spec: Windows Server + Node process</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-body-sm">
                  <p>
                    <span className="text-app-muted">OS:</span> {d.server.platformLabel}
                  </p>
                  <p>
                    <span className="text-app-muted">Node:</span> {d.server.nodeVersion}
                  </p>
                  <p>
                    <span className="text-app-muted">Uptime:</span> {formatUptime(d.server.uptimeSec)}
                  </p>
                  <p className="text-xs text-app-muted">
                    อัปเดตเมื่อ {new Date(d.time).toLocaleString('th-TH')}
                  </p>
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HardDrive className="size-4" />
                    ดิสก์ {d.server.disk.path}
                  </CardTitle>
                  <CardDescription>อ่านจาก Health — path ดิสก์ที่ตั้งในระบบ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-body-sm">
                  <p>
                    ใช้ {d.server.disk.usedPercent ?? '—'}% — {formatBytes(d.server.disk.usedBytes)} /{' '}
                    {formatBytes(d.server.disk.totalBytes)}
                  </p>
                  <p className="text-app-muted">ว่าง {formatBytes(d.server.disk.freeBytes)}</p>
                  {d.server.disk.message ? (
                    <p className="text-xs text-amber-700">{d.server.disk.message}</p>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <KeyRound className="size-4" />
                  License
                </CardTitle>
                <CardDescription>
                  คีย์ license เก็บใน Settings (แสดงแบบ masked) —{' '}
                  <Link to="/admin/settings" className="text-sky-700 underline">
                    ตั้งใน Settings
                  </Link>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-body-sm">
                <p className="flex items-center gap-2">
                  สถานะ: {licenseBadge(d.license.status)}
                </p>
                {d.license.expiresAt ? (
                  <p className="text-app-muted">
                    หมดอายุ: {new Date(d.license.expiresAt).toLocaleDateString('th-TH')}
                  </p>
                ) : (
                  <p className="text-app-muted">
                    วันหมดอายุ: ตั้ง <code>LICENSE_EXPIRES</code> บน API หรือเพิ่มคีย์ใน Settings
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
    </AdminPageShell>
  )
}
