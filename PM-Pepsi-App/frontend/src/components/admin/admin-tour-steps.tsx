import { ADMIN_SECTIONS } from '@/lib/admin-sections'
import type { Step } from 'react-joyride'

export const TOUR_PAGE_SECTIONS = ADMIN_SECTIONS.filter((s) => s.implemented && s.segment)

export const ADMIN_TOUR_STEP_COUNT = 2 + TOUR_PAGE_SECTIONS.length

const GROUP_LABELS: Record<string, string> = {
  overview: 'ภาพรวม',
  access: 'ผู้ใช้ & การเข้าถึง',
  appearance: 'ธีม & การแสดงผล',
  data: 'ข้อมูล & บันทึก',
  ops: 'ระบบ & สำรอง',
  comms: 'ประกาศ & ความปลอดภัย',
}

/** ขั้นตอน Joyride — ใช้ใน AdminTour และ unit test */
export function buildAdminTourSteps(): Step[] {
  return [
    {
      target: '[data-tour="admin-command-hint"]',
      title: 'Command palette',
      content: (
        <span>
          กด <kbd className="admin-tour-kbd">Ctrl+K</kbd> (หรือ <kbd className="admin-tour-kbd">⌘K</kbd> บน Mac)
          เพื่อค้นหาและกระโดดไปหน้าใดก็ได้ในแอป — เหมือน Spotlight
        </span>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="admin-console"]',
      title: 'Admin Console',
      content: 'ศูนย์กลาง KPI สุขภาพระบบ และทางลัดไปทุกโมดูลผู้ดูแลตามสิทธิ์ RBAC',
      placement: 'center',
    },
    ...TOUR_PAGE_SECTIONS.map((s, idx) => ({
      target: `[data-tour="${s.tourTarget}"]`,
      title: s.label,
      content: (
        <span>
          <span className="admin-tour-tooltip__group">{GROUP_LABELS[s.group] ?? s.group}</span>
          <br />
          {s.description}
          <span className="admin-tour-tooltip__step-meta">
            {' '}
            · ขั้นที่ {idx + 3} จาก {ADMIN_TOUR_STEP_COUNT}
          </span>
        </span>
      ),
      placement: 'center' as const,
    })),
  ]
}

export function routeForAdminTourStepIndex(index: number): string | null {
  if (index <= 1) return '/admin'
  const section = TOUR_PAGE_SECTIONS[index - 2]
  return section?.to ?? null
}
