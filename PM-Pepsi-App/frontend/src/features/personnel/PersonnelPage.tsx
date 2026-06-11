/**
 * Personal Dashboard — เทียบ navbar profile (`navbar.php`) + `M_personel*.php` (ข้อมูลตนใน `tbworkcenter`)
 * + `M_personel_confirm.php` (สรุปงานปิดของตน) + `worktime_count.php` (ชั่วโมงรวม)
 *
 * ใช้ `GET /api/v1/personnel/me/dashboard` รวม profile + planning summary + confirmation summary + worktime
 * ของ user ปัจจุบันให้ทุกคนเปิดเองได้ (`/personnel` menuright `A:U:W`).
 */
import { CanPermission } from '@/components/auth/CanPermission'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageSection, AppPageShell } from '@/components/layout/AppPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { getStoredAuthUser } from '@/features/auth/login-api'
import { PersonnelAvatar } from '@/components/personnel/PersonnelAvatar'
import { WktypeDisplay } from '@/components/scheduling/WktypeDisplay'
import { fetchPersonnelDashboard } from '@/lib/api-public'
import { useAnyPermission } from '@/lib/use-permission'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  Briefcase,
  CalendarClock,
  ClipboardList,
  ClipboardCheck,
  Inbox,
  Layers,
  Mail,
  Phone,
  ShieldCheck,
  Timer,
  Users,
  Wrench,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

function StatCard({
  label,
  value,
  hint,
  to,
  icon: Icon,
  openModuleLabel,
}: {
  label: string
  value: ReactNode
  hint?: string
  to?: string
  icon: typeof Users
  openModuleLabel?: string
}) {
  const inner = (
    <AppCard pad="compact" className="transition hover:border-[var(--app-border)] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-app-muted">{label}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-app">
            {value}
          </div>
          {hint ? <div className="mt-1 text-xs text-app-muted">{hint}</div> : null}
        </div>
        <div className="rounded-card bg-app-muted p-2 text-app">
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
      {to ? (
        <div className="mt-3 text-xs font-medium text-[var(--app-accent)]">{openModuleLabel}</div>
      ) : null}
    </AppCard>
  )
  if (!to) return inner
  return (
    <Link to={to} className="block focus:outline-none">
      {inner}
    </Link>
  )
}

function formatMinutes(min: number, t: TFunction<'personnel'>): string {
  if (!Number.isFinite(min) || min <= 0) return t('dashboard.time.zeroMin')
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  if (h === 0) return t('dashboard.time.minutes', { m })
  if (m === 0) return t('dashboard.time.hours', { h })
  return t('dashboard.time.hoursMinutes', { h, m })
}

function formatHours(h: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (!Number.isFinite(h) || h <= 0) return t('dashboard.time.hrZero')
  return t('dashboard.time.hrValue', { h: h.toFixed(2) })
}

const ROLE_BADGE_TONE: Record<string, { tone: string; icon: typeof Users }> = {
  admin: {
    tone: 'app-tone-pill-danger-ring',
    icon: ShieldCheck,
  },
  manager: {
    tone: 'app-tone-pill-info-ring',
    icon: Users,
  },
  planner: {
    tone: 'app-tone-pill-info-ring',
    icon: Layers,
  },
  technician: {
    tone: 'app-tone-pill-success-ring',
    icon: Wrench,
  },
}

function RoleBadge({ role }: { role: string }) {
  const { t } = useTranslation('personnel')
  const cfg = ROLE_BADGE_TONE[role] ?? ROLE_BADGE_TONE.planner
  const Icon = cfg.icon
  const labelKey = `dashboard.roles.${role}` as 'dashboard.roles.admin'
  const label = t(labelKey, { defaultValue: t('dashboard.roles.planner') })
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 ${cfg.tone}`}
    >
      <Icon className="size-3.5" aria-hidden /> {label}
    </span>
  )
}

export function PersonnelPage() {
  const { t } = useTranslation('personnel')
  const { t: tc } = useTranslation('common')
  const authUser = getStoredAuthUser()
  const canRead = useAnyPermission(['personnel.read', 'personnel.write'])
  const isAdmin = authUser?.userst === 'A'
  const q = useQuery({
    queryKey: ['personnel', 'me', 'dashboard'],
    queryFn: fetchPersonnelDashboard,
    staleTime: 30_000,
    enabled: canRead,
    placeholderData: keepPreviousData,
  })

  const role = q.data?.role ?? 'planner'
  const showAdminGlobal = role === 'admin' || role === 'planner'
  const showManagerTeam = role === 'manager'

  if (!canRead) {
    return (
      <AppPageShell title={t('dashboard.title')} description={t('dashboard.description')}>
        <EmptyState
          icon={AlertCircle}
          title={t('dashboard.noAccess')}
          description={
            <>
              {tc('rbac.requiresPermission')}{' '}
              <code className="text-xs">personnel.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  const hints = t('dashboard.hints', { returnObjects: true }) as string[]

  return (
    <AppPageShell
      title={t('dashboard.title')}
      description={t('dashboard.description')}
      hints={hints}
      headerActions={
        <>
          {q.data ? <RoleBadge role={q.data.role} /> : null}
          <CanPermission permission="manhours.read">
            <Button asChild variant="outline" size="sm">
              <Link to="/worktime">{t('dashboard.actions.worktime')}</Link>
            </Button>
          </CanPermission>
          <CanPermission permission="confirmation.read">
            <Button asChild variant="outline" size="sm">
              <Link to="/confirmation">{t('dashboard.actions.exportConfirmation')}</Link>
            </Button>
          </CanPermission>
          {role === 'planner' ? (
            <CanPermission permission="planning.read">
              <Button asChild variant="outline" size="sm">
                <Link to="/planning">{t('dashboard.actions.assignWork')}</Link>
              </Button>
            </CanPermission>
          ) : null}
          {isAdmin ? (
            <>
              <Button asChild size="sm" variant="outline">
                <Link to="/personnel/confirm">{t('dashboard.actions.perPersonClose')}</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/users">{t('dashboard.actions.manageUsers')}</Link>
              </Button>
            </>
          ) : null}
        </>
      }
    >
        <AppPageSection index={0}>
        {q.isLoading && !q.data ? (
          <Skeleton className="h-48 w-full rounded-card" />
        ) : q.isError ? (
          <EmptyState
            icon={AlertCircle}
            title={t('dashboard.loadFailed')}
            description={q.error instanceof Error ? q.error.message : String(q.error)}
            action={{ label: tc('actions.retry'), onClick: () => void q.refetch() }}
          />
        ) : q.data ? (
          <>
            <ProfileCard data={q.data} />

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label={t('dashboard.stats.openJobs')}
                value={q.data.planning.openCount}
                hint={t('dashboard.stats.openJobsHint')}
                to="/planning"
                icon={ClipboardList}
                openModuleLabel={t('dashboard.openModule')}
              />
              <StatCard
                label={t('dashboard.stats.closedJobs')}
                value={q.data.planning.closedCount}
                hint={t('dashboard.stats.closedJobsHint')}
                to="/planning"
                icon={Briefcase}
                openModuleLabel={t('dashboard.openModule')}
              />
              <StatCard
                label={t('dashboard.stats.myConfirmation')}
                value={q.data.confirmation.totalClose}
                hint={t('dashboard.stats.myConfirmationTotal', {
                  minutes: formatMinutes(q.data.confirmation.totalMinutes, t),
                })}
                to="/confirmation"
                icon={Users}
                openModuleLabel={t('dashboard.openModule')}
              />
              <StatCard
                label={t('dashboard.stats.totalHours')}
                value={
                  q.data.worktime?.total
                    ? formatHours(q.data.worktime.total, t)
                    : '—'
                }
                hint={t('dashboard.stats.totalHoursHint')}
                to="/manhours"
                icon={Timer}
                openModuleLabel={t('dashboard.openModule')}
              />
            </div>

            {showAdminGlobal && q.data.roleData?.global ? (
              <GlobalOverviewCards
                data={q.data.roleData.global}
                unassignedCount={q.data.roleData.unassigned?.total ?? 0}
              />
            ) : null}

            {showAdminGlobal && q.data.roleData?.unassigned ? (
              <UnassignedWorkOrdersSection
                items={q.data.roleData.unassigned.items}
                total={q.data.roleData.unassigned.total}
              />
            ) : null}

            {showManagerTeam && q.data.roleData?.team ? (
              <ManagerTeamSection team={q.data.roleData.team} />
            ) : null}

            <RecentPlanning data={q.data} />
            <RecentConfirmation data={q.data} />
          </>
        ) : (
          <EmptyState
            title={t('dashboard.noData')}
            description={t('dashboard.noDataHint')}
          />
        )}
        </AppPageSection>
    </AppPageShell>
  )
}

function GlobalOverviewCards({
  data,
  unassignedCount,
}: {
  data: NonNullable<NonNullable<Awaited<ReturnType<typeof fetchPersonnelDashboard>>['roleData']>['global']>
  unassignedCount: number
}) {
  const { t } = useTranslation('personnel')
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label={t('dashboard.stats.factoryOpenWo')}
        value={data.openTotal}
        hint={t('dashboard.stats.factoryOpenWoHint')}
        to="/work-orders"
        icon={ClipboardList}
        openModuleLabel={t('dashboard.openModule')}
      />
      <StatCard
        label={t('dashboard.stats.assigned')}
        value={data.assignedTotal}
        hint={t('dashboard.stats.assignedHint')}
        to="/planning"
        icon={ClipboardCheck}
        openModuleLabel={t('dashboard.openModule')}
      />
      <StatCard
        label={t('dashboard.stats.closedToday')}
        value={data.closeToday}
        hint={t('dashboard.stats.closedTodayHint')}
        to="/confirmation"
        icon={Briefcase}
        openModuleLabel={t('dashboard.openModule')}
      />
      <StatCard
        label={t('dashboard.stats.unassigned')}
        value={unassignedCount}
        hint={t('dashboard.stats.unassignedHint')}
        to="/planning"
        icon={Inbox}
        openModuleLabel={t('dashboard.openModule')}
      />
    </div>
  )
}

function UnassignedWorkOrdersSection({
  items,
  total,
}: {
  items: NonNullable<
    NonNullable<Awaited<ReturnType<typeof fetchPersonnelDashboard>>['roleData']>['unassigned']
  >['items']
  total: number
}) {
  const { t } = useTranslation('personnel')
  return (
    <div className="app-tone-info-callout overflow-hidden rounded-card border shadow-sm">
      <div className="flex items-center justify-between border-b border-app/50 px-6 py-3">
        <div>
          <div className="text-body-sm font-medium text-app">
            {t('dashboard.unassigned.title')}
          </div>
          <p className="text-xs text-app-muted">{t('dashboard.unassigned.subtitle')}</p>
        </div>
        <Button asChild size="sm">
          <Link to="/planning">{t('dashboard.unassigned.goAssign', { total })}</Link>
        </Button>
      </div>
      <div className="app-table-shell overflow-x-auto">
      <Table embedded stickyHeader zebra>
        <TableHeader>
          <TableRow>
            <TableHead>{t('dashboard.table.wo')}</TableHead>
            <TableHead>{t('dashboard.table.type')}</TableHead>
            <TableHead>{t('dashboard.table.description')}</TableHead>
            <TableHead>{t('dashboard.table.equipLoc')}</TableHead>
            <TableHead>{t('dashboard.table.workCntr')}</TableHead>
            <TableHead>{t('dashboard.table.start')}</TableHead>
            <TableHead>{t('dashboard.table.syst')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState
                  className="border-0 bg-transparent py-10"
                  title={t('dashboard.unassigned.emptyTitle')}
                  description={t('dashboard.unassigned.emptyDesc')}
                />
              </TableCell>
            </TableRow>
          ) : (
            items.map((it) => (
              <TableRow key={it.idiw37}>
                <TableCell className="tabular-nums">
                  <Link to={`/work-orders/${it.idiw37}`} className="text-[var(--app-accent)] hover:underline">
                    {it.wkorder}
                  </Link>
                </TableCell>
                <TableCell className="text-xs">
                  {it.wktype ? <WktypeDisplay code={it.wktype} /> : '—'}
                </TableCell>
                <TableCell className="max-w-[16rem] truncate text-body-sm" title={it.shortText ?? ''}>
                  {it.shortText ?? '—'}
                </TableCell>
                <TableCell className="text-xs">
                  {it.equipment ?? '—'}
                  {it.functionalLoc ? (
                    <div className="text-caption">{it.functionalLoc}</div>
                  ) : null}
                </TableCell>
                <TableCell className="text-xs">{it.wkctr ?? '—'}</TableCell>
                <TableCell className="tabular-nums">{it.bscStart ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{it.syst ?? '—'}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}

function ManagerTeamSection({
  team,
}: {
  team: NonNullable<
    NonNullable<Awaited<ReturnType<typeof fetchPersonnelDashboard>>['roleData']>['team']
  >
}) {
  const { t } = useTranslation('personnel')
  const teamTitle = team.groupName
    ? t('dashboard.team.titleWithName', { name: team.groupName })
    : team.groupCode
      ? t('dashboard.team.titleWithCode', { code: team.groupCode })
      : t('dashboard.team.title')
  return (
    <div className="app-tone-info-section overflow-hidden rounded-card border shadow-sm">
      <div className="app-tone-info-inner flex items-center justify-between border-b px-6 py-3">
        <div className="min-w-0">
          <div className="app-tone-info-strong text-body-sm font-medium">{teamTitle}</div>
          <p className="app-tone-info-label text-xs">
            {t('dashboard.team.subtitle', {
              members: team.members.length,
              open: team.totalOpen,
              close: team.totalClose,
            })}
          </p>
        </div>
      </div>
      <div className="app-table-shell overflow-x-auto">
      <Table embedded stickyHeader zebra>
        <TableHeader>
          <TableRow>
            <TableHead>{t('dashboard.table.code')}</TableHead>
            <TableHead>{t('dashboard.table.name')}</TableHead>
            <TableHead>{t('dashboard.profile.position')}</TableHead>
            <TableHead className="text-right">{t('dashboard.stats.openJobs')}</TableHead>
            <TableHead className="text-right">{t('dashboard.stats.closedJobs')}</TableHead>
            <TableHead className="text-right">{t('dashboard.stats.totalHours')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {team.members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <EmptyState
                  className="border-0 bg-transparent py-10"
                  title={t('dashboard.team.emptyTitle')}
                  description={
                    team.groupCode
                      ? t('dashboard.team.emptyDescCode', { code: team.groupCode })
                      : t('dashboard.team.emptyDescNoGroup')
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            team.members.map((m) => (
              <TableRow key={m.idwkctr}>
                <TableCell className="font-mono text-xs">{m.idwkctr}</TableCell>
                <TableCell>{m.displayName}</TableCell>
                <TableCell className="text-xs">{m.position ?? '—'}</TableCell>
                <TableCell className="text-right tabular-nums">{m.openCount}</TableCell>
                <TableCell className="text-right tabular-nums">{m.closedCount}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMinutes(m.totalMinutes, t)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}

function ProfileCard({ data }: { data: NonNullable<ReturnType<typeof useQuery<Awaited<ReturnType<typeof fetchPersonnelDashboard>>>>['data']> }) {
  const { t } = useTranslation('personnel')
  const p = data.profile
  return (
    <AppCard pad="default">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <PersonnelAvatar
          idwkctr={p.idwkctr}
          displayName={p.displayName}
          hasImage={Boolean(p.imgMember)}
          size="lg"
          className="ring-2"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="text-xl font-semibold text-app">
              {p.displayName}
            </div>
            <div className="mt-1 text-caption">
              {t('dashboard.profile.hrCode')}{' '}
              <span className="font-mono">{p.idwkctr}</span>
              {p.username && p.username !== p.idwkctr ? (
                <span className="ml-2 text-xs text-app-muted">({p.username})</span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <DataLine label={t('dashboard.profile.workCntr')} value={p.wkctr || '—'} />
            <DataLine label={t('dashboard.profile.plant')} value={p.plnt || '—'} />
            <DataLine label={t('dashboard.profile.role')} value={<RoleBadge role={p.userRole} />} />
            <DataLine label={t('dashboard.profile.userSt')} value={p.userst || '—'} />
            <DataLine label={t('dashboard.profile.position')} value={p.position || '—'} />
            <DataLine label={t('dashboard.profile.department')} value={p.department || '—'} />
            <DataLine label={t('dashboard.profile.workGroup')} value={p.workGroup || '—'} />
            <DataLine label={t('dashboard.profile.techType')} value={p.workType || '—'} />
            <DataLine label={t('dashboard.profile.level')} value={p.workLevel || '—'} />
            <DataLine
              label={
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5" aria-hidden /> {t('dashboard.profile.email')}
                </span>
              }
              value={p.email || '—'}
            />
            <DataLine
              label={
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" aria-hidden /> {t('dashboard.profile.phone')}
                </span>
              }
              value={p.tel || '—'}
            />
            <DataLine
              label={
                <span className="flex items-center gap-1">
                  <CalendarClock className="size-3.5" aria-hidden /> {t('dashboard.profile.tenure')}
                </span>
              }
              value={p.workAgeLabel || '—'}
            />
            <DataLine label={t('dashboard.profile.currentAge')} value={p.birthdayLabel || '—'} />
            <DataLine label={t('dashboard.profile.startDate')} value={p.startWorkDate || '—'} />
            <DataLine label={t('dashboard.profile.birthday')} value={p.birthdayDate || '—'} />
            <DataLine
              label={t('dashboard.profile.lastLogin')}
              value={
                p.lastLogin
                  ? new Date(p.lastLogin).toLocaleString()
                  : '—'
              }
            />
          </div>
        </div>
      </div>
    </AppCard>
  )
}

function DataLine({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-dashed border-app py-1 text-body-sm">
      <div className="w-28 shrink-0 text-xs text-app-muted">{label}</div>
      <div className="min-w-0 truncate text-app">{value}</div>
    </div>
  )
}

function RecentPlanning({
  data,
}: {
  data: Awaited<ReturnType<typeof fetchPersonnelDashboard>>
}) {
  const { t } = useTranslation('personnel')
  const items = data.planning.recent
  return (
    <div className="overflow-hidden app-table-shell">
      <div className="flex items-center justify-between border-b border-app px-6 py-3">
        <div>
          <div className="text-body-sm font-medium text-app">
            {t('dashboard.recentPlanning.title')}
          </div>
          <p className="text-xs text-app-muted">{t('dashboard.recentPlanning.subtitle')}</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/planning">{t('dashboard.recentPlanning.goPlanning')}</Link>
        </Button>
      </div>
      <div className="app-table-shell overflow-x-auto">
      <Table embedded stickyHeader zebra>
        <TableHeader>
          <TableRow>
            <TableHead>{t('dashboard.table.wo')}</TableHead>
            <TableHead>{t('dashboard.table.type')}</TableHead>
            <TableHead>{t('dashboard.table.description')}</TableHead>
            <TableHead>{t('dashboard.table.functionalEquip')}</TableHead>
            <TableHead>{t('dashboard.table.start')}</TableHead>
            <TableHead>{t('dashboard.table.syst')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <EmptyState
                  className="border-0 bg-transparent py-10"
                  title={t('dashboard.recentPlanning.emptyTitle')}
                  description={t('dashboard.recentPlanning.emptyDesc')}
                />
              </TableCell>
            </TableRow>
          ) : (
            items.map((it) => (
              <TableRow key={it.idiw37}>
                <TableCell className="tabular-nums">
                  <Link
                    to={`/work-orders/${it.idiw37}`}
                    className="text-[var(--app-accent)] hover:underline"
                  >
                    {it.wkorder}
                  </Link>
                </TableCell>
                <TableCell className="text-xs">
                  {it.wktype ? <WktypeDisplay code={it.wktype} /> : '—'}
                </TableCell>
                <TableCell
                  className="max-w-[16rem] truncate text-body-sm"
                  title={it.shortText ?? ''}
                >
                  {it.shortText ?? '—'}
                </TableCell>
                <TableCell className="text-xs">
                  {it.functionalLoc ?? '—'}
                  {it.equipment ? (
                    <div className="text-caption">{it.equipment}</div>
                  ) : null}
                </TableCell>
                <TableCell className="tabular-nums">{it.bscStart ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{it.syst ?? '—'}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}

function RecentConfirmation({
  data,
}: {
  data: Awaited<ReturnType<typeof fetchPersonnelDashboard>>
}) {
  const { t } = useTranslation('personnel')
  const items = data.confirmation.recent
  return (
    <div className="overflow-hidden app-table-shell">
      <div className="flex items-center justify-between border-b border-app px-6 py-3">
        <div>
          <div className="text-body-sm font-medium text-app">
            {t('dashboard.recentConfirm.title')}
          </div>
          <p className="text-xs text-app-muted">{t('dashboard.recentConfirm.subtitle')}</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/confirmation">{t('dashboard.recentConfirm.goConfirmation')}</Link>
        </Button>
      </div>
      <div className="app-table-shell overflow-x-auto">
      <Table embedded stickyHeader zebra>
        <TableHeader>
          <TableRow>
            <TableHead>{t('dashboard.table.wo')}</TableHead>
            <TableHead>{t('dashboard.table.confirmation')}</TableHead>
            <TableHead>{t('dashboard.table.workCntr')}</TableHead>
            <TableHead>{t('dashboard.table.start')}</TableHead>
            <TableHead>{t('dashboard.table.end')}</TableHead>
            <TableHead className="text-right">{t('dashboard.table.actWork')}</TableHead>
            <TableHead>{t('dashboard.table.closedAt')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState
                  className="border-0 bg-transparent py-10"
                  title={t('dashboard.recentConfirm.emptyTitle')}
                  description={t('dashboard.recentConfirm.emptyDesc')}
                />
              </TableCell>
            </TableRow>
          ) : (
            items.map((it) => (
              <TableRow key={it.idclose}>
                <TableCell className="tabular-nums">
                  <Link
                    to={`/work-orders/${it.idiw37}`}
                    className="text-[var(--app-accent)] hover:underline"
                  >
                    {it.wkorder || `#${it.idiw37}`}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {it.confirmation || '—'}
                </TableCell>
                <TableCell className="tabular-nums">{it.wkctr}</TableCell>
                <TableCell className="tabular-nums">{it.stdate || '—'}</TableCell>
                <TableCell className="tabular-nums">{it.endate || '—'}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {it.timewk} {it.unitc}
                </TableCell>
                <TableCell className="tabular-nums">
                  {it.timeclose || '—'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}
