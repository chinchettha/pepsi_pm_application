import { AdminKpiCard } from '@/components/admin/AdminKpiCard'
import { AdminKpiGrid } from '@/components/admin/AdminKpiGrid'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { AdminQuickLink } from '@/components/admin/AdminQuickLink'
import { AdminCard, AdminCardContent, AdminCardDescription, AdminCardHeader, AdminCardTitle } from '@/components/admin/admin-card-exports'
import { Skeleton } from '@/components/ui/skeleton'
import { countAccessibleAdminSections, getGroupedAdminSections } from '@/lib/admin-sections'
import { hasPermission } from '@/lib/permissions'
import { fetchAdminHealth } from '@/lib/admin-health-api'
import { useAuthUser, usePermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Activity, AlertCircle, History, LayoutGrid, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stagger = {
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } },
}

export function AdminConsolePage() {
  const authUser = useAuthUser()
  const canHealth = usePermission('admin.health.read')
  const healthQ = useQuery({
    queryKey: ['admin', 'health', 'console'],
    queryFn: () => fetchAdminHealth('D:\\'),
    enabled: canHealth,
    staleTime: 30_000,
    retry: 1,
    placeholderData: keepPreviousData,
  })

  const groupedSections = getGroupedAdminSections({ skipOverview: true })
  const moduleCount = countAccessibleAdminSections(authUser?.permissions)
  const quickCount = groupedSections.reduce(
    (n, g) => n + g.sections.filter((s) => hasPermission(authUser, s.permission)).length,
    0,
  )

  return (
    <AdminPageShell
      tourTarget="admin-console"
      title="ศูนย์ผู้ดูแลระบบ"
      description="KPI สถานะระบบ · ทางลัดโมดูลตามสิทธิ์ RBAC"
      contentClassName="space-y-6"
      headerActions={
        canHealth ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="admin-toolbar-btn"
            onClick={() => void healthQ.refetch()}
            disabled={healthQ.isFetching}
          >
            <RefreshCcw
              className={`mr-1 size-3.5 ${healthQ.isFetching ? 'animate-spin' : ''}`}
              aria-hidden
            />
            รีเฟรช
          </Button>
        ) : null
      }
    >
        <motion.div variants={stagger} initial="hidden" animate="show">
        <AdminKpiGrid>
          {canHealth && healthQ.isLoading ? (
            <>
              <motion.div variants={item}>
                <Skeleton className="h-28 rounded-card" />
              </motion.div>
              <motion.div variants={item}>
                <Skeleton className="h-28 rounded-card" />
              </motion.div>
            </>
          ) : null}

          {canHealth && healthQ.isError ? (
            <motion.div variants={item}>
              <AdminKpiCard
                tone="danger"
                icon={AlertCircle}
                label="Health API"
                value="ไม่โหลดได้"
                hint={healthQ.error instanceof Error ? healthQ.error.message : 'ตรวจ backend + สิทธิ์ admin.health.read'}
              />
            </motion.div>
          ) : null}

          {canHealth && healthQ.data ? (
            <>
              <motion.div variants={item}>
                <AdminKpiCard
                  tone={healthQ.data.db.status === 'ok' ? 'info' : 'danger'}
                  icon={Activity}
                  label="Database"
                  value={
                    healthQ.data.db.latencyMs != null ? `${healthQ.data.db.latencyMs} ms` : '—'
                  }
                  hint={healthQ.data.db.status}
                />
              </motion.div>
              <motion.div variants={item}>
                <AdminKpiCard
                  tone={
                    healthQ.data.migration.pendingCount > 0 ? 'warning' : 'success'
                  }
                  label="Migration"
                  value={`${healthQ.data.migration.appliedCount}/${healthQ.data.migration.totalFiles}`}
                  hint={`pending ${healthQ.data.migration.pendingCount}`}
                />
              </motion.div>
            </>
          ) : null}

          {!canHealth ? (
            <motion.div variants={item}>
              <AdminKpiCard
                tone="default"
                icon={Activity}
                label="Health"
                value="—"
                hint="ไม่มีสิทธิ์ admin.health.read"
              />
            </motion.div>
          ) : null}

          <motion.div variants={item}>
            <AdminKpiCard
              tone="default"
              icon={LayoutGrid}
              label="โมดูลที่เข้าได้"
              value={`${moduleCount.accessible}/${moduleCount.total}`}
              hint="ตาม user.permissions"
            />
          </motion.div>

          <motion.div variants={item}>
            <AdminKpiCard
              tone="success"
              icon={History}
              label="ทัวร์ Admin"
              value={moduleCount.total}
              hint="Joyride · Ctrl+K · breadcrumb"
            />
          </motion.div>
        </AdminKpiGrid>
        </motion.div>

        <motion.div variants={item} initial="hidden" animate="show">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle className="text-base">ทางลัด ({quickCount} หน้า)</AdminCardTitle>
              <AdminCardDescription>
                จัดกลุ่มตามหน้าที่ · แสดงเฉพาะโมดูลที่มีสิทธิ์ · ⌘K / Ctrl+K เปิด command palette
              </AdminCardDescription>
            </AdminCardHeader>
            <AdminCardContent className="space-y-8">
              {groupedSections.map(({ group, sections }) => {
                const visible = sections.filter((s) => hasPermission(authUser, s.permission))
                if (visible.length === 0) return null
                return (
                  <section key={group.id} aria-labelledby={`admin-group-${group.id}`}>
                    <h2
                      id={`admin-group-${group.id}`}
                      className="admin-section-group-title mb-3 border-b border-[var(--admin-border)] pb-2"
                    >
                      {group.label}
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {visible.map((s) => (
                        <AdminQuickLink key={s.to} section={s} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </AdminCardContent>
          </AdminCard>
        </motion.div>
    </AdminPageShell>
  )
}
