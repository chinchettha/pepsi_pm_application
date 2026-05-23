import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAuditHub } from '@/lib/api-public'
import { usePermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, BookText, History, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

function KpiCard({
  title,
  value,
  hint,
}: {
  title: string
  value: number
  hint?: string
}) {
  return (
    <AppCard pad="compact">
      <div className="text-xs text-app-muted">{title}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-app">
        {value.toLocaleString('th-TH')}
      </div>
      {hint ? <p className="mt-1 text-xs text-app-muted">{hint}</p> : null}
    </AppCard>
  )
}

/** Phase A — Auditor Hub สำหรับ Planner+ (`reports.read`) */
export function AuditorHubPage() {
  const canRead = usePermission('reports.read')
  const canAdminAudit = usePermission('admin.audit.read')

  const hubQ = useQuery({
    queryKey: ['reports', 'audit-hub'],
    queryFn: fetchAuditHub,
    staleTime: 60_000,
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const data = hubQ.data
  const rangeLabel = data
    ? `${new Date(data.range.from).toLocaleDateString('th-TH')} – ${new Date(data.range.to).toLocaleDateString('th-TH')}`
    : '7 วันล่าสุด'

  if (!canRead) {
    return (
      <AppPageShell title="Auditor Hub" description="ภาพรวมกิจกรรมระบบสำหรับ Planner และ Admin">
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
      title="Auditor Hub"
      description="ภาพรวมกิจกรรมระบบ — เก็บ audit 365 วัน"
      contentClassName="space-y-4"
      headerActions={
        <>
          <Badge variant="secondary" className="text-xs">
            7 วันล่าสุด
          </Badge>
          <Button variant="default" size="sm" asChild>
            <Link to="/activity-log">
              <BookText className="mr-1 size-4" aria-hidden />
              Activity Log
            </Link>
          </Button>
          {canAdminAudit ? (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/audit">
                <History className="mr-1 size-4" aria-hidden />
                Audit เต็ม
              </Link>
            </Button>
          ) : null}
        </>
      }
    >
        {hubQ.isLoading && !hubQ.data ? (
          <Skeleton className="h-32 w-full rounded-card" />
        ) : data ? (
          <p className="text-caption">
            ช่วงสรุป: <strong>{rangeLabel}</strong> · นโยบายเก็บ log{' '}
            <strong>{data.retentionDays} วัน</strong> (ลบ manual ได้ก่อน{' '}
            {data.retentionCutoffDate} เฉพาะ Admin)
          </p>
        ) : null}

        {hubQ.isError ? (
          <EmptyState
            icon={ShieldAlert}
            title="โหลดสรุป audit ไม่สำเร็จ"
            description="ใช้ Activity Log หรือติดต่อ Admin"
            action={{ label: 'ลองใหม่', onClick: () => void hubQ.refetch() }}
          />
        ) : null}

        {data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <KpiCard title="กิจกรรมสำเร็จ (ok)" value={data.totals.events} />
              <KpiCard title="ถูกปฏิเสธสิทธิ์" value={data.totals.denied} hint="rbac.deny" />
              <KpiCard title="นำเข้า SAP / Integration" value={data.totals.imports} />
              <KpiCard title="จ่ายงาน / Planning" value={data.totals.planning} />
              <KpiCard title="Confirmation" value={data.totals.confirmations} />
              <KpiCard title="Work orders" value={data.totals.workOrders} />
            </div>

            {data.byPrefix.length > 0 ? (
              <AppCard pad="default">
                <h3 className="text-base font-semibold text-app">แยกตามกลุ่ม action</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {data.byPrefix.map((p) => (
                    <li
                      key={p.prefix}
                      className="rounded-button border border-app bg-[var(--app-surface)] px-3 py-2 text-body-sm"
                    >
                      {p.label}{' '}
                      <span className="font-medium tabular-nums text-app">{p.count}</span>
                    </li>
                  ))}
                </ul>
              </AppCard>
            ) : null}
          </>
        ) : hubQ.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-card" />
            ))}
          </div>
        ) : !hubQ.isError ? (
          <EmptyState title="ไม่มีข้อมูลสรุป" description="ลองรีเฟรชหรือตรวจ migration audit" />
        ) : null}

        <AppCard pad="default">
          <h3 className="text-base font-semibold text-app">ทางเข้าสำหรับตรวจสอบ</h3>
          <p className="mt-1 text-xs text-app-muted">
            Planner ใช้ Activity Log เป็นหลัก — Admin เปิด Audit เต็มเมื่อต้องดู before/after
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/activity-log">Activity Log (คน · Line · WO · เวลา)</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/reports">รายงาน KPI / Week-to-Week</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/user-log">User Log (login/logout)</Link>
            </Button>
            {canAdminAudit ? (
              <Button variant="outline" asChild>
                <Link to="/admin/security">Security (login ล้มเหลว)</Link>
              </Button>
            ) : null}
          </div>
        </AppCard>
    </AppPageShell>
  )
}
