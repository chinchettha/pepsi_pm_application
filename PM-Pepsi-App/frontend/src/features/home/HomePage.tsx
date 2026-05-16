import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { fetchDashboardSummary } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Database,
  Timer,
  Users,
  Wrench,
} from 'lucide-react'
import {
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
  type Step,
} from 'react-joyride'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useState } from 'react'

const steps: Step[] = [
  {
    target: '[data-tour="hero-cards"]',
    content:
      'สรุปจาก API + PostgreSQL — เลือกโมดูลด้านล่างให้ครบทุกฟังก์ชันหลักเหมือนระบบ PHP เดิม',
  },
  {
    target: '[data-tour="sidebar-note"]',
    content: 'เมนูฝั่งซ้าย (จอใหญ่) — สไตล์ SB Admin มืดเหมือนเดิม',
    placement: 'right',
  },
]

const cards = [
  { to: '/calendar', title: 'ปฏิทินงาน', desc: 'W_calendar, calendar.php', icon: CalendarDays },
  { to: '/work-orders', title: 'ใบงาน', desc: 'workorder, W_confirm*', icon: ClipboardList },
  { to: '/planning', title: 'แผน PM/CM', desc: 'M_planwork*', icon: Wrench },
  { to: '/iw37n', title: 'IW37N', desc: 'M_iw37n*, import SAP', icon: Database },
  { to: '/manhours', title: 'Manhours', desc: 'M_manhour*, W_manhours*', icon: Timer },
  { to: '/personnel', title: 'บุคลากร', desc: 'M_personel*, confirm', icon: Users },
  { to: '/reports', title: 'รายงาน', desc: 'charts, KPI', icon: BarChart3 },
] as const

export function HomePage() {
  const [runTour, setRunTour] = useState(false)
  const dash = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboardSummary })

  const handleJoyrideEvent = (data: EventData) => {
    if (data.type === EVENTS.TOUR_END) {
      setRunTour(false)
      toast.success('จบการแนะนำเบื้องต้น')
    }
    if (data.status === STATUS.SKIPPED) {
      setRunTour(false)
      toast.message('ข้ามการแนะนำ')
    }
  }

  return (
    <div>
      <PageHeader
        title="Planning — PM / CM"
        description="แดชบอร์ด + ลิงก์โมดูล — สรุปจาก GET /api/v1/dashboard/summary (PostgreSQL)"
      >
        <span
          className="rounded-md border border-zinc-200 bg-zinc-100 px-2 py-1 text-xs text-zinc-600"
          data-tour="sidebar-note"
        >
          {dash.isFetching ? 'กำลังโหลด…' : 'ข้อมูลอัปเดต'}
        </span>
        <button
          type="button"
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          onClick={() => setRunTour(true)}
        >
          แนะนำการใช้งาน
        </button>
      </PageHeader>

      <Joyride
        steps={steps}
        run={runTour}
        continuous
        scrollToFirstStep
        options={{
          buttons: ['back', 'primary', 'skip'],
          primaryColor: '#18181b',
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

      {dash.isSuccess ? (
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            { label: 'ใบงานเปิด/คิว', value: dash.data.openOrders },
            { label: 'ปิดเดือนนี้', value: dash.data.closedThisMonth },
            { label: 'รอยืนยันบุคลากร', value: dash.data.pendingPersonnel },
            { label: 'นำเข้า IW37N ล่าสุด', value: dash.data.iw37nLastImport?.slice(0, 10) ?? '—' },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="text-xs text-zinc-500">{k.label}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
                {k.value}
              </div>
            </div>
          ))}
        </div>
      ) : dash.isLoading ? (
        <div className="mx-auto max-w-6xl px-6 py-4 text-sm text-zinc-500">กำลังโหลดสรุป…</div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6" data-tour="hero-cards">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {cards.map(({ to, title, desc, icon: Icon }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
            >
              <Link to={to} className="block h-full focus:outline-none">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                    <div className="rounded-lg bg-zinc-100 p-2">
                      <Icon className="size-5 text-zinc-800" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base">{title}</CardTitle>
                      <CardDescription className="mt-1">{desc}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm font-medium text-zinc-900">เปิดโมดูล →</span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
