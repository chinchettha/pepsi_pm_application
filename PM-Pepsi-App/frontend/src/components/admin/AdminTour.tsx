import { clearAdminTourSeen, hasSeenAdminTour, markAdminTourSeen } from '@/lib/admin-tour-pref'
import {
  ADMIN_TOUR_STEP_COUNT,
  buildAdminTourSteps,
  routeForAdminTourStepIndex,
} from '@/components/admin/admin-tour-steps'
import { AdminTourTooltip } from '@/components/admin/AdminTourTooltip'
import { toastSuccess } from '@/lib/app-toast'
import { EVENTS, Joyride, STATUS, type EventData } from 'react-joyride'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export { ADMIN_TOUR_STEP_COUNT, buildAdminTourSteps, routeForAdminTourStepIndex }

const joyrideOptions = {
  primaryColor: 'var(--brand-pepsi-blue, #004c97)',
  zIndex: 10000,
  arrowColor: 'var(--admin-tour-arrow, #ffffff)',
  backgroundColor: 'var(--admin-tour-surface, #ffffff)',
  textColor: 'var(--admin-tour-text, #18181b)',
  overlayColor: 'var(--admin-tour-overlay, rgba(15, 23, 42, 0.52))',
} as const

export function AdminTour({
  run,
  onRunChange,
}: {
  run: boolean
  onRunChange: (run: boolean) => void
}) {
  const navigate = useNavigate()
  const steps = useMemo(() => buildAdminTourSteps(), [])

  const handleEvent = (data: EventData) => {
    if (data.type === EVENTS.STEP_BEFORE) {
      const to = routeForAdminTourStepIndex(data.index)
      if (to) navigate(to)
    }
    if (data.type === EVENTS.TOUR_END) {
      markAdminTourSeen()
      onRunChange(false)
      toastSuccess(`จบทัวร์ Admin — ครบ ${ADMIN_TOUR_STEP_COUNT} ขั้นตอน`)
    }
    if (data.status === STATUS.SKIPPED) {
      markAdminTourSeen()
      onRunChange(false)
      toast.message('ข้ามทัวร์ Admin — เปิดใหม่ได้จากปุ่ม「ทัวร์ Admin」')
    }
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      scrollDuration={400}
      showProgress
      showSkipButton
      disableOverlayClose
      disableScrolling={false}
      spotlightClicks={false}
      spotlightPadding={12}
      callback={handleEvent}
      tooltipComponent={AdminTourTooltip}
      floaterProps={{ disableAnimation: false }}
      styles={{
        options: joyrideOptions,
        spotlight: {
          borderRadius: 'var(--app-radius-card, 12px)',
        },
        tooltip: {
          padding: 0,
          borderRadius: 'var(--app-radius-dialog, 16px)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
      }}
      locale={{
        back: 'กลับ',
        close: 'ปิด',
        last: 'เสร็จสิ้น',
        next: 'ถัดไป',
        skip: 'ข้าม',
      }}
    />
  )
}

export function shouldAutoStartAdminTour(pathname: string, canAdmin: boolean): boolean {
  if (!canAdmin) return false
  if (!pathname.startsWith('/admin')) return false
  return !hasSeenAdminTour()
}

export function restartAdminTour(onRun: () => void) {
  clearAdminTourSeen()
  onRun()
}
