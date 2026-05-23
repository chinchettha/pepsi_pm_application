/**
 * Personal Dashboard — เทียบ navbar profile (`navbar.php`) + `M_personel*.php` (ข้อมูลตนใน `tbworkcenter`)
 * + `M_personel_confirm.php` (สรุปงานปิดของตน) + `worktime_count.php` (ชั่วโมงรวม)
 *
 * ใช้ `GET /api/v1/personnel/me/dashboard` รวม profile + planning summary + confirmation summary + worktime
 * ของ user ปัจจุบันให้ทุกคนเปิดเองได้ (`/personnel` menuright `A:U:W`).
 */
import { CanPermission } from '@/components/auth/CanPermission'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
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

function StatCard({
  label,
  value,
  hint,
  to,
  icon: Icon,
}: {
  label: string
  value: ReactNode
  hint?: string
  to?: string
  icon: typeof Users
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
        <div className="mt-3 text-xs font-medium text-blue-700">เปิดโมดูล →</div>
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

function formatMinutes(min: number): string {
  if (!Number.isFinite(min) || min <= 0) return '0 นาที'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  if (h === 0) return `${m} นาที`
  if (m === 0) return `${h} ชม.`
  return `${h} ชม. ${m} นาที`
}

function formatHours(h: number): string {
  if (!Number.isFinite(h) || h <= 0) return '0 ชม.'
  return `${h.toFixed(2)} ชม.`
}

const ROLE_BADGE: Record<string, { label: string; tone: string; icon: typeof Users }> = {
  admin: {
    label: 'Admin',
    tone: 'bg-rose-100 text-rose-800 ring-rose-200',
    icon: ShieldCheck,
  },
  manager: {
    label: 'Manager',
    tone: 'bg-purple-100 text-purple-800 ring-purple-200',
    icon: Users,
  },
  planner: {
    label: 'Planner / Engineering',
    tone: 'bg-blue-100 text-blue-800 ring-blue-200',
    icon: Layers,
  },
  technician: {
    label: 'Technician',
    tone: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    icon: Wrench,
  },
}

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_BADGE[role] ?? ROLE_BADGE.planner
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 ${cfg.tone}`}
    >
      <Icon className="size-3.5" aria-hidden /> {cfg.label}
    </span>
  )
}

export function PersonnelPage() {
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
      <AppPageShell title="แดชบอร์ดส่วนตัว" description="สรุปงานและข้อมูลพนักงานของฉัน">
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">personnel.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  return (
    <AppPageShell
      title="แดชบอร์ดส่วนตัว"
      description="โปรไฟล์ · งานเปิด/ปิด · Confirmation · ชั่วโมงรวม"
      contentClassName="space-y-6"
      headerActions={
        <>
          {q.data ? <RoleBadge role={q.data.role} /> : null}
          <CanPermission permission="manhours.read">
            <Button asChild variant="outline" size="sm">
              <Link to="/worktime">Worktime</Link>
            </Button>
          </CanPermission>
          <CanPermission permission="confirmation.read">
            <Button asChild variant="outline" size="sm">
              <Link to="/confirmation">รับรองงาน</Link>
            </Button>
          </CanPermission>
          {role === 'planner' ? (
            <CanPermission permission="planning.read">
              <Button asChild variant="outline" size="sm">
                <Link to="/planning">จ่ายงาน</Link>
              </Button>
            </CanPermission>
          ) : null}
          {isAdmin ? (
            <>
              <Button asChild size="sm" variant="outline">
                <Link to="/personnel/confirm">ปิดงานรายบุคคล</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/users">จัดการผู้ใช้</Link>
              </Button>
            </>
          ) : null}
        </>
      }
    >
        {q.isLoading && !q.data ? (
          <Skeleton className="h-48 w-full rounded-card" />
        ) : q.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="โหลดแดชบอร์ดไม่สำเร็จ"
            description={q.error instanceof Error ? q.error.message : String(q.error)}
            action={{ label: 'ลองใหม่', onClick: () => void q.refetch() }}
          />
        ) : q.data ? (
          <>
            <ProfileCard data={q.data} />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="งานเปิด (รอปิด)"
                value={q.data.planning.openCount}
                hint="view_planwork ที่ idwkctr ของฉัน + syst CRTD/REL"
                to="/planning"
                icon={ClipboardList}
              />
              <StatCard
                label="งานปิดแล้ว"
                value={q.data.planning.closedCount}
                hint="ผ่านสถานะ TECO/COMP (PHP `cwkctr`)"
                to="/planning"
                icon={Briefcase}
              />
              <StatCard
                label="Confirmation ของฉัน"
                value={q.data.confirmation.totalClose}
                hint={`รวม ${formatMinutes(q.data.confirmation.totalMinutes)}`}
                to="/confirmation"
                icon={Users}
              />
              <StatCard
                label="ชั่วโมงรวม"
                value={
                  q.data.worktime?.total
                    ? formatHours(q.data.worktime.total)
                    : '—'
                }
                hint="tbmanhours (wh + ot ทั้งหมด)"
                to="/manhours"
                icon={Timer}
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
          <EmptyState title="ไม่มีข้อมูล" description="ลองรีเฟรชหน้าหรือตรวจการเชื่อมต่อ" />
        )}
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
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="WO เปิดทั้งโรงงาน"
        value={data.openTotal}
        hint="tbiw37n syst CRTD/REL"
        to="/work-orders"
        icon={ClipboardList}
      />
      <StatCard
        label="จ่ายงานแล้ว"
        value={data.assignedTotal}
        hint="มี tbplangingwork อย่างน้อย 1 แถว"
        to="/planning"
        icon={ClipboardCheck}
      />
      <StatCard
        label="ปิดวันนี้"
        value={data.closeToday}
        hint="actfinish ตั้งแต่เที่ยงคืนวันนี้"
        to="/confirmation"
        icon={Briefcase}
      />
      <StatCard
        label="ยังไม่จ่ายงาน"
        value={unassignedCount}
        hint="ดึง 10 ใบล่าสุดด้านล่าง"
        to="/planning"
        icon={Inbox}
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
  return (
    <div className="overflow-hidden rounded-card border border-blue-200 bg-blue-50/30 shadow-sm">
      <div className="flex items-center justify-between border-b border-blue-200 px-6 py-3">
        <div>
          <div className="text-body-sm font-medium text-blue-900">WO รอจ่ายงาน (Planner)</div>
          <p className="text-xs text-blue-900/70">
            tbiw37n syst CRTD/REL ที่ยังไม่มี tbplangingwork — เรียงตาม bscstart
            ASC, จำกัด 10 ใบ
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/planning">ไปจ่ายงาน ({total})</Link>
        </Button>
      </div>
      <div className="app-table-shell overflow-x-auto">
      <Table embedded stickyHeader zebra>
        <TableHeader>
          <TableRow>
            <TableHead>WO</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>คำอธิบาย</TableHead>
            <TableHead>Equipment / Loc</TableHead>
            <TableHead>WC</TableHead>
            <TableHead>เริ่ม</TableHead>
            <TableHead>Syst</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState
                  className="border-0 bg-transparent py-10"
                  title="ไม่มี WO รอจ่ายงาน"
                  description="ทุกใบงานได้รับการจ่ายแล้ว"
                />
              </TableCell>
            </TableRow>
          ) : (
            items.map((it) => (
              <TableRow key={it.idiw37}>
                <TableCell className="tabular-nums">
                  <Link to={`/work-orders/${it.idiw37}`} className="text-blue-700 hover:underline">
                    {it.wkorder}
                  </Link>
                </TableCell>
                <TableCell className="text-xs">{it.wktype ?? '—'}</TableCell>
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
  return (
    <div className="overflow-hidden rounded-card border border-purple-200 bg-purple-50/30 shadow-sm">
      <div className="flex items-center justify-between border-b border-purple-200 px-6 py-3">
        <div className="min-w-0">
          <div className="text-body-sm font-medium text-purple-900">
            ทีมของฉัน {team.groupName ? `· ${team.groupName}` : team.groupCode ? `· #${team.groupCode}` : ''}
          </div>
          <p className="text-xs text-purple-900/70">
            สมาชิก {team.members.length} คน — เปิด {team.totalOpen} / ปิด {team.totalClose} (รวมงาน)
          </p>
        </div>
      </div>
      <div className="app-table-shell overflow-x-auto">
      <Table embedded stickyHeader zebra>
        <TableHeader>
          <TableRow>
            <TableHead>รหัส</TableHead>
            <TableHead>ชื่อ</TableHead>
            <TableHead>ตำแหน่ง</TableHead>
            <TableHead className="text-right">เปิด</TableHead>
            <TableHead className="text-right">ปิด</TableHead>
            <TableHead className="text-right">ชั่วโมงรวม</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {team.members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <EmptyState
                  className="border-0 bg-transparent py-10"
                  title="ไม่มีสมาชิกในกลุ่ม"
                  description={
                    team.groupCode
                      ? `idwkctrgroup=${team.groupCode}`
                      : 'ผู้ใช้ยังไม่ได้กำหนดกลุ่มงาน'
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
                  {formatMinutes(m.totalMinutes)}
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
              <span className="font-mono">{p.idwkctr}</span>
              {p.username && p.username !== p.idwkctr ? (
                <span className="ml-2 text-xs text-app-muted">({p.username})</span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <DataLine label="WC (SAP)" value={p.wkctr || '—'} />
            <DataLine label="Plant" value={p.plnt || '—'} />
            <DataLine label="บทบาท" value={<RoleBadge role={p.userRole} />} />
            <DataLine label="UserST" value={p.userst || '—'} />
            <DataLine label="ตำแหน่ง" value={p.position || '—'} />
            <DataLine label="หน่วยงาน" value={p.department || '—'} />
            <DataLine label="กลุ่มงาน" value={p.workGroup || '—'} />
            <DataLine label="ประเภทช่าง" value={p.workType || '—'} />
            <DataLine label="ระดับ" value={p.workLevel || '—'} />
            <DataLine
              label={
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5" aria-hidden /> อีเมล
                </span>
              }
              value={p.email || '—'}
            />
            <DataLine
              label={
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" aria-hidden /> โทรศัพท์
                </span>
              }
              value={p.tel || '—'}
            />
            <DataLine
              label={
                <span className="flex items-center gap-1">
                  <CalendarClock className="size-3.5" aria-hidden /> อายุงาน
                </span>
              }
              value={p.workAgeLabel || '—'}
            />
            <DataLine label="ปัจจุบันอายุ" value={p.birthdayLabel || '—'} />
            <DataLine
              label="วันที่เริ่มงาน"
              value={p.startWorkDate || '—'}
            />
            <DataLine label="วันเกิด" value={p.birthdayDate || '—'} />
            <DataLine
              label="ล็อกอินล่าสุด"
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
  const items = data.planning.recent
  return (
    <div className="overflow-hidden app-table-shell">
      <div className="flex items-center justify-between border-b border-app px-6 py-3">
        <div>
          <div className="text-body-sm font-medium text-app">งานเปิดล่าสุดของฉัน</div>
          <p className="text-xs text-app-muted">
            ดึงจาก <code>view_planwork</code> (syst IN CRTD,REL) จำกัด 5 รายการ
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/planning">ไปหน้าแผนงาน</Link>
        </Button>
      </div>
      <div className="app-table-shell overflow-x-auto">
      <Table embedded stickyHeader zebra>
        <TableHeader>
          <TableRow>
            <TableHead>WO</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>คำอธิบาย</TableHead>
            <TableHead>Functional loc / Equipment</TableHead>
            <TableHead>เริ่ม</TableHead>
            <TableHead>Syst</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <EmptyState
                  className="border-0 bg-transparent py-10"
                  title="ไม่มีงานเปิด"
                  description={`idwkctr=${data.profile.idwkctr}`}
                />
              </TableCell>
            </TableRow>
          ) : (
            items.map((it) => (
              <TableRow key={it.idiw37}>
                <TableCell className="tabular-nums">
                  <Link
                    to={`/work-orders/${it.idiw37}`}
                    className="text-blue-700 hover:underline"
                  >
                    {it.wkorder}
                  </Link>
                </TableCell>
                <TableCell className="text-xs">{it.wktype ?? '—'}</TableCell>
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
  const items = data.confirmation.recent
  return (
    <div className="overflow-hidden app-table-shell">
      <div className="flex items-center justify-between border-b border-app px-6 py-3">
        <div>
          <div className="text-body-sm font-medium text-app">
            Confirmation ล่าสุดของฉัน
          </div>
          <p className="text-xs text-app-muted">
            ดึงจาก <code>tbcofirm</code> ที่ <code>cwkctr</code> = ฉัน หรือ{' '}
            <code>wkctr</code> ตรงกับ WC ของฉัน (เทียบ <code>view_confirm.php</code>)
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/confirmation">ไปหน้า Confirmation</Link>
        </Button>
      </div>
      <div className="app-table-shell overflow-x-auto">
      <Table embedded stickyHeader zebra>
        <TableHeader>
          <TableRow>
            <TableHead>WO</TableHead>
            <TableHead>Confirmation</TableHead>
            <TableHead>WC</TableHead>
            <TableHead>เริ่ม</TableHead>
            <TableHead>สิ้นสุด</TableHead>
            <TableHead className="text-right">Act.Work</TableHead>
            <TableHead>ปิดเมื่อ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState
                  className="border-0 bg-transparent py-10"
                  title="ไม่มี confirmation"
                  description="ยังไม่มีรายการปิดงานของคุณ"
                />
              </TableCell>
            </TableRow>
          ) : (
            items.map((it) => (
              <TableRow key={it.idclose}>
                <TableCell className="tabular-nums">
                  <Link
                    to={`/work-orders/${it.idiw37}`}
                    className="text-blue-700 hover:underline"
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
