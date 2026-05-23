import { CanPermission } from '@/components/auth/CanPermission'
import { PepsiStripe } from '@/components/brand/PepsiStripe'
import { Sparkline, sparklineDelta, type SparklineTone } from '@/components/charts/Sparkline'
import { AppPageContent } from '@/components/layout/AppPageContent'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { getStoredAuthUser } from '@/features/auth/login-api'
import {
  displayUserName,
  navItemsToQuickLinks,
} from '@/features/home/dashboard-config'
import { fetchDashboardSummary } from '@/lib/api-public'
import { useAppNav } from '@/lib/use-app-nav'
import { cn } from '@/lib/utils'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Database,
  Sparkles,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
  type Step,
} from 'react-joyride'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useMemo, useState, type ReactNode } from 'react'

const tourSteps: Step[] = [
  {
    target: '[data-tour="dashboard-kpi"]',
    content: 'ตัวเลขและกราฟ 7 วันจาก PostgreSQL — คลิกการ์ดเพื่อไปโมดูลที่เกี่ยวข้อง',
  },
  {
    target: '[data-tour="dashboard-quick"]',
    content: 'ทางลัดตามสิทธิ์ของคุณ — เหมือนเมนูด้านซ้าย',
  },
]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type KpiTone = 'pepsi-blue' | 'pepsi-red' | 'pepsi-orange'

function KpiCard({
  label,
  value,
  hint,
  to,
  icon: Icon,
  tone,
  trend,
  sparkTone,
  index,
  reducedMotion,
}: {
  label: string
  value: string | number
  hint: string
  to: string
  icon: LucideIcon
  tone: KpiTone
  trend: number[]
  sparkTone: SparklineTone
  index: number
  reducedMotion: boolean
}) {
  const toneClass = {
    'pepsi-blue': 'dashboard-kpi--pepsi-blue',
    'pepsi-red': 'dashboard-kpi--pepsi-red',
    'pepsi-orange': 'dashboard-kpi--pepsi-orange',
  }[tone]

  const delta = sparklineDelta(trend)

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial={reducedMotion ? false : 'hidden'}
      animate="show"
    >
      <Link
        to={to}
        className={cn('dashboard-kpi group block focus:outline-none', toneClass)}
      >
        <div className="dashboard-kpi__glow" aria-hidden />
        <div className="dashboard-kpi__stripe" aria-hidden />
        <div className="dashboard-kpi__inner">
          <div className="flex items-start justify-between gap-2">
            <div className="dashboard-kpi__icon">
              <Icon className="size-5" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-col items-end gap-1">
              <Sparkline
                data={trend}
                tone={sparkTone}
                width={112}
                height={40}
                className="max-w-full shrink-0 opacity-95"
              />
              <span className="text-caption">7 วันย้อนหลัง</span>
            </div>
          </div>
          <p className="mt-3 text-body-sm font-medium text-[var(--app-text-muted)]">{label}</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <p className="text-3xl font-semibold tracking-tight tabular-nums text-[var(--app-text)]">
              {value}
            </p>
            {delta != null ? (
              <span
                className={cn(
                  'dashboard-kpi__delta',
                  delta >= 0 ? 'dashboard-kpi__delta--up' : 'dashboard-kpi__delta--down',
                )}
              >
                {delta >= 0 ? '+' : ''}
                {delta}%
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--app-text-muted)]">{hint}</p>
          <span className="dashboard-kpi__cta mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--app-accent)]">
            เปิดโมดูล
            <ArrowUpRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

function formatThaiDate(d: Date): string {
  return d.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** หัวหน้าแดชบอร์ด — เทียบเท่า `PageHeader` (hero แบบเต็มความกว้าง) */
function DashboardHero({
  userName,
  wkctrBadge,
  isFetching,
  onStartTour,
  reducedMotion,
}: {
  userName: string
  wkctrBadge: ReactNode
  isFetching: boolean
  onStartTour: () => void
  reducedMotion: boolean
}) {
  return (
    <header className="dashboard-hero dashboard-hero--compact shrink-0">
      <div className="dashboard-hero__mesh" aria-hidden />
      {!reducedMotion ? (
        <>
          <motion.div
            className="dashboard-orb dashboard-orb--a"
            animate={{ x: [0, 40, 10, 0], y: [0, -24, 12, 0], scale: [1, 1.08, 0.96, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
          <motion.div
            className="dashboard-orb dashboard-orb--b"
            animate={{ x: [0, -32, -8, 0], y: [0, 18, -12, 0], scale: [1, 0.94, 1.06, 1] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
          <motion.div
            className="dashboard-orb dashboard-orb--c"
            animate={{ x: [0, 20, -16, 0], y: [0, 28, 8, 0] }}
            transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
        </>
      ) : null}

      <motion.div
        className="dashboard-hero__content dashboard-page__pad mx-auto w-full max-w-[1600px]"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="dashboard-hero__eyebrow">
              <Sparkles className="size-4 shrink-0" aria-hidden />
              แผนและบำรุงรักษา · Pepsi
            </p>
            <h1 className="dashboard-hero__title">สวัสดี{userName ? `, ${userName}` : ''}</h1>
            <p className="dashboard-hero__subtitle">
              แดชบอร์ดภาพรวมงานบำรุงรักษา — {formatThaiDate(new Date())}
              {wkctrBadge}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('dashboard-live', isFetching && 'dashboard-live--pulse')}>
              <span className="dashboard-live__dot" />
              {isFetching ? 'กำลังอัปเดต…' : 'ข้อมูลพร้อมใช้'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="dashboard-hero__btn border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
              onClick={onStartTour}
            >
              แนะนำการใช้งาน
            </Button>
            <CanPermission permission="dashboard.read">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="dashboard-hero__btn border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
              >
                <Link to="/board" target="_blank" rel="noopener noreferrer">
                  จอ Engineering Board
                </Link>
              </Button>
            </CanPermission>
            <CanPermission permission="planning.read">
              <Button asChild size="sm" className="dashboard-hero__btn-primary shadow-lg">
                <Link to="/plan-calendar">
                  ไปจ่ายงาน
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CanPermission>
          </div>
        </div>
      </motion.div>
      <PepsiStripe className="dashboard-hero__pepsi-stripe" />
    </header>
  )
}

export function HomePage() {
  const [runTour, setRunTour] = useState(false)
  const reducedMotion = useReducedMotion()
  const user = getStoredAuthUser()
  const { entries } = useAppNav()
  const dash = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardSummary,
    placeholderData: keepPreviousData,
  })

  const quickLinks = useMemo(() => navItemsToQuickLinks(entries), [entries])

  const handleJoyrideEvent = (data: EventData) => {
    if (data.type === EVENTS.TOUR_END) {
      setRunTour(false)
      toast.success('จบการแนะนำเบื้องต้น')
    }
    if (data.status === STATUS.SKIPPED) {
      setRunTour(false)
    }
  }

  const trends = dash.data?.trends

  const kpis =
    dash.data == null || trends == null
      ? null
      : [
          {
            label: 'ใบงานเปิด',
            value: dash.data.openOrders.toLocaleString('th-TH'),
            hint: 'สถานะ CRTD / REL',
            to: '/work-orders',
            icon: ClipboardList,
            tone: 'pepsi-blue' as const,
            trend: trends.openDaily,
            sparkTone: 'pepsi-blue' as const,
          },
          {
            label: 'ปิดเดือนนี้',
            value: dash.data.closedThisMonth.toLocaleString('th-TH'),
            hint: 'นับจากวันที่ปิดจริง',
            to: '/work-orders',
            icon: CheckCircle2,
            tone: 'pepsi-red' as const,
            trend: trends.closedDaily,
            sparkTone: 'pepsi-red' as const,
          },
          {
            label: 'รอจ่ายงาน',
            value: dash.data.pendingPersonnel.toLocaleString('th-TH'),
            hint: 'ยังไม่มีแผนใน tbplangingwork',
            to: '/planning',
            icon: UserRound,
            tone: 'pepsi-orange' as const,
            trend: trends.pendingDaily,
            sparkTone: 'pepsi-orange' as const,
          },
          {
            label: 'นำเข้า IW37N ล่าสุด',
            value: dash.data.iw37nLastImport
              ? new Date(dash.data.iw37nLastImport).toLocaleDateString('th-TH')
              : '—',
            hint: `รวม 7 วัน: ${trends.importDaily.reduce((a, b) => a + b, 0)} batch`,
            to: '/iw37n',
            icon: Database,
            tone: 'pepsi-blue' as const,
            trend: trends.importDaily,
            sparkTone: 'pepsi-blue' as const,
          },
        ]

  const wkctrBadge =
    user?.wkctr ? (
      <span className="dashboard-hero__badge">
        WC {user.wkctr}
        {user.sysstatus ? ` · ${user.sysstatus}` : ''}
      </span>
    ) : null

  return (
    <div className="dashboard-page min-h-full w-full">
      <DashboardHero
        userName={user ? displayUserName(user) : ''}
        wkctrBadge={wkctrBadge}
        isFetching={dash.isFetching}
        onStartTour={() => setRunTour(true)}
        reducedMotion={!!reducedMotion}
      />

      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        scrollToFirstStep
        options={{
          buttons: ['back', 'primary', 'skip'],
          primaryColor: '#004c97',
        }}
        onEvent={handleJoyrideEvent}
        styles={{ tooltipContainer: { zIndex: 10000 } }}
        locale={{
          back: 'กลับ',
          close: 'ปิด',
          last: 'เสร็จ',
          next: 'ถัดไป',
          skip: 'ข้าม',
        }}
      />

      <AppPageContent className="dashboard-page__body mx-auto w-full max-w-[1600px] space-y-8 !pt-6">
        <section data-tour="dashboard-kpi" aria-labelledby="dashboard-kpi-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2
                id="dashboard-kpi-heading"
                className="text-lg font-semibold tracking-tight text-[var(--app-text)]"
              >
                ภาพรวมวันนี้
              </h2>
              <p className="text-caption">ตัวชี้วัดหลักจากฐานข้อมูล — คลิกเพื่อเปิดรายละเอียด</p>
            </div>
            <CanPermission permission="reports.read">
              <Link
                to="/reports"
                className="hidden text-body-sm font-medium text-[var(--app-accent)] hover:underline sm:inline-flex sm:items-center sm:gap-1"
              >
                ดูรายงานเต็ม
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </CanPermission>
          </div>

          {dash.isLoading ? (
            <div className="dashboard-kpi-grid" aria-busy="true" aria-label="กำลังโหลดตัวชี้วัด">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[188px] rounded-card" />
              ))}
            </div>
          ) : dash.isError ? (
            <EmptyState
              icon={AlertCircle}
              title="โหลดสรุปไม่สำเร็จ"
              description={
                <>
                  ตรวจการเชื่อมต่อ API หรือสิทธิ์{' '}
                  <code className="text-xs">dashboard.read</code>
                  {dash.error instanceof Error ? ` — ${dash.error.message}` : null}
                </>
              }
              action={{ label: 'ลองใหม่', onClick: () => void dash.refetch() }}
            />
          ) : kpis ? (
            <div className="dashboard-kpi-grid">
              {kpis.map((k, i) => (
                <KpiCard key={k.label} {...k} index={i} reducedMotion={!!reducedMotion} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="ยังไม่มีข้อมูลสรุป"
              description="ลองรีเฟรชหน้าหรือติดต่อผู้ดูแลระบบ"
              action={{ label: 'รีเฟรช', onClick: () => void dash.refetch() }}
            />
          )}
        </section>

        <section data-tour="dashboard-quick" aria-labelledby="dashboard-quick-heading">
          <div className="mb-4">
            <h2
              id="dashboard-quick-heading"
              className="text-lg font-semibold tracking-tight text-[var(--app-text)]"
            >
              ทางลัด
            </h2>
            <p className="text-caption">โมดูลที่คุณเข้าถึงได้ — จัดตามเมนูระบบ</p>
          </div>

          {quickLinks.length === 0 ? (
            <EmptyState
              title="ไม่มีเมนูที่แสดง"
              description="ตรวจสิทธิ์ RBAC ของบัญชีหรือรอโหลดเมนูจากระบบ"
            />
          ) : (
            <motion.div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              initial={reducedMotion ? false : 'hidden'}
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04 } },
              }}
            >
              {quickLinks.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div key={item.to} custom={i + 4} variants={fadeUp}>
                    <Link to={item.to} className="dashboard-quick group block focus:outline-none">
                      <div className="dashboard-quick__shine" aria-hidden />
                      <div className="flex items-start gap-3">
                        <div className="dashboard-quick__icon">
                          <Icon className="size-5" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[var(--app-text)] group-hover:text-[var(--app-accent)]">
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--app-text-muted)]">
                            {item.hint}
                          </p>
                        </div>
                        <CalendarClock
                          className="size-4 shrink-0 text-[var(--app-text-muted)] opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden
                        />
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </section>
      </AppPageContent>
    </div>
  )
}
