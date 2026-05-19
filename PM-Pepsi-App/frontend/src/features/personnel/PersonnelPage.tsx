/**
 * Personal Dashboard — เทียบ navbar profile (`navbar.php`) + `M_personel*.php` (ข้อมูลตนใน `tbworkcenter`)
 * + `M_personel_confirm.php` (สรุปงานปิดของตน) + `worktime_count.php` (ชั่วโมงรวม)
 *
 * ใช้ `GET /api/v1/personnel/me/dashboard` รวม profile + planning summary + confirmation summary + worktime
 * ของ user ปัจจุบันให้ทุกคนเปิดเองได้ (`/personnel` menuright `A:U:W`).
 */
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { fetchPersonnelDashboard, personnelImageUrl } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'
import {
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
  UserCircle2,
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
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {value}
          </div>
          {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
        </div>
        <div className="rounded-lg bg-zinc-100 p-2 text-zinc-700">
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
      {to ? (
        <div className="mt-3 text-xs font-medium text-blue-700">เปิดโมดูล →</div>
      ) : null}
    </div>
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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cfg.tone}`}
    >
      <Icon className="size-3.5" aria-hidden /> {cfg.label}
    </span>
  )
}

export function PersonnelPage() {
  const authUser = getStoredAuthUser()
  const isAdmin = authUser?.userst === 'A'
  const q = useQuery({
    queryKey: ['personnel', 'me', 'dashboard'],
    queryFn: fetchPersonnelDashboard,
    staleTime: 30_000,
  })

  const role = q.data?.role ?? 'planner'
  const showAdminGlobal = role === 'admin' || role === 'planner'
  const showManagerTeam = role === 'manager'

  return (
    <div>
      <PageHeader
        title="Personal Dashboard"
        description="สรุปข้อมูลพนักงานของฉัน — เทียบ navbar/profile + M_personel* + M_personel_confirm + worktime_count"
      >
        {q.data ? <RoleBadge role={q.data.role} /> : null}
        <Button asChild variant="outline" size="sm">
          <Link to="/worktime">ดู Worktime</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/confirmation">รับรอง / Confirm</Link>
        </Button>
        {role === 'planner' ? (
          <Button asChild variant="outline" size="sm">
            <Link to="/planning">หน้าจ่ายงาน Planning</Link>
          </Button>
        ) : null}
        {isAdmin ? (
          <>
            <Button asChild size="sm" variant="outline">
              <Link to="/personnel/confirm">Personnel Confirmation</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/personnel/admin">จัดการบุคลากร (Admin)</Link>
            </Button>
          </>
        ) : null}
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {q.isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : q.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {q.error instanceof Error ? q.error.message : String(q.error)}
          </div>
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
        ) : null}
      </div>
    </div>
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
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-blue-50/30 shadow-sm">
      <div className="flex items-center justify-between border-b border-blue-200 px-5 py-3">
        <div>
          <div className="text-sm font-medium text-blue-900">WO รอจ่ายงาน (Planner)</div>
          <p className="text-xs text-blue-900/70">
            tbiw37n syst CRTD/REL ที่ยังไม่มี tbplangingwork — เรียงตาม bscstart
            ASC, จำกัด 10 ใบ
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/planning">ไปจ่ายงาน ({total})</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>WO</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Short text</TableHead>
            <TableHead>Equipment / Loc</TableHead>
            <TableHead>WC</TableHead>
            <TableHead>Basic start</TableHead>
            <TableHead>Syst</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-sm text-zinc-500">
                ไม่มี WO รอจ่ายงาน — ดีมาก!
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
                <TableCell className="max-w-[16rem] truncate text-sm" title={it.shortText ?? ''}>
                  {it.shortText ?? '—'}
                </TableCell>
                <TableCell className="text-xs">
                  {it.equipment ?? '—'}
                  {it.functionalLoc ? (
                    <div className="text-[11px] text-zinc-500">{it.functionalLoc}</div>
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
    <div className="overflow-hidden rounded-xl border border-purple-200 bg-purple-50/30 shadow-sm">
      <div className="flex items-center justify-between border-b border-purple-200 px-5 py-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-purple-900">
            ทีมของฉัน {team.groupName ? `· ${team.groupName}` : team.groupCode ? `· #${team.groupCode}` : ''}
          </div>
          <p className="text-xs text-purple-900/70">
            สมาชิก {team.members.length} คน — เปิด {team.totalOpen} / ปิด {team.totalClose} (รวมงาน)
          </p>
        </div>
      </div>
      <Table>
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
              <TableCell colSpan={6} className="py-8 text-center text-sm text-zinc-500">
                ไม่มีสมาชิกในกลุ่ม (
                {team.groupCode
                  ? `idwkctrgroup=${team.groupCode}`
                  : 'ผู้ใช้ยังไม่ได้กำหนดกลุ่มงาน'}
                )
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
  )
}

function ProfileCard({ data }: { data: NonNullable<ReturnType<typeof useQuery<Awaited<ReturnType<typeof fetchPersonnelDashboard>>>>['data']> }) {
  const p = data.profile
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        {p.imgMember ? (
          <img
            src={personnelImageUrl(p.idwkctr)}
            alt={p.displayName}
            className="h-24 w-24 shrink-0 rounded-full object-cover ring-2 ring-zinc-200"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-zinc-100 p-3 text-zinc-700">
            <UserCircle2 className="size-12" aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="text-xl font-semibold text-zinc-900">
              {p.displayName}
            </div>
            <div className="mt-0.5 text-sm text-zinc-500">
              <span className="font-mono">{p.idwkctr}</span>
              {p.username && p.username !== p.idwkctr ? (
                <span className="ml-2 text-xs text-zinc-400">({p.username})</span>
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
    </div>
  )
}

function DataLine({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-dashed border-zinc-200 py-1 text-sm">
      <div className="w-28 shrink-0 text-xs text-zinc-500">{label}</div>
      <div className="min-w-0 truncate text-zinc-900">{value}</div>
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
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
        <div>
          <div className="text-sm font-medium text-zinc-900">งานเปิดล่าสุดของฉัน</div>
          <p className="text-xs text-zinc-500">
            ดึงจาก <code>view_planwork</code> (syst IN CRTD,REL) จำกัด 5 รายการ
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/planning">ไปหน้าแผนงาน</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>WO</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Short text</TableHead>
            <TableHead>Functional loc / Equipment</TableHead>
            <TableHead>Basic start</TableHead>
            <TableHead>Syst</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-8 text-center text-sm text-zinc-500"
              >
                ไม่มีงานเปิดสำหรับ <code>idwkctr={data.profile.idwkctr}</code>
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
                  className="max-w-[16rem] truncate text-sm"
                  title={it.shortText ?? ''}
                >
                  {it.shortText ?? '—'}
                </TableCell>
                <TableCell className="text-xs">
                  {it.functionalLoc ?? '—'}
                  {it.equipment ? (
                    <div className="text-[11px] text-zinc-500">{it.equipment}</div>
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
  )
}

function RecentConfirmation({
  data,
}: {
  data: Awaited<ReturnType<typeof fetchPersonnelDashboard>>
}) {
  const items = data.confirmation.recent
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
        <div>
          <div className="text-sm font-medium text-zinc-900">
            Confirmation ล่าสุดของฉัน
          </div>
          <p className="text-xs text-zinc-500">
            ดึงจาก <code>tbcofirm</code> ที่ <code>cwkctr</code> = ฉัน หรือ{' '}
            <code>wkctr</code> ตรงกับ WC ของฉัน (เทียบ <code>view_confirm.php</code>)
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/confirmation">ไปหน้า Confirmation</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>WO</TableHead>
            <TableHead>Confirmation</TableHead>
            <TableHead>WC</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead className="text-right">Act.Work</TableHead>
            <TableHead>Time close</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-sm text-zinc-500"
              >
                ไม่มี confirmation ของฉัน
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
  )
}
