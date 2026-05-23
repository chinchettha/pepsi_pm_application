import type { AuthUser } from '@/api/schemas'
import type { NavEntry, NavLinkEntry } from '@/components/layout/nav-config'

/** คำอธิบายสั้นต่อ route — แสดงในการ์ดทางลัด (ไม่โชว์ชื่อ PHP) */
export const ROUTE_HINTS: Record<string, string> = {
  '/plan-calendar': 'จ่ายงานและติดตามแผนรายวัน',
  '/calendar': 'ปฏิทินใบงานและย้ายแผน',
  '/line-calendar': 'ตารางเวลาเส้นผลิต',
  '/backlog': 'งานค้างและแผนที่ยังไม่จ่าย',
  '/work-orders': 'ค้นหาและจัดการใบงาน',
  '/confirmation': 'รับรองและปิดงาน',
  '/planning': 'ตารางแผน PM/CM',
  '/iw37n': 'นำเข้าข้อมูล SAP IW37N',
  '/master-data': 'ข้อมูลหลักระบบ',
  '/manhours': 'บันทึกชั่วโมงทำงาน',
  '/manhours/admin': 'จัดการชั่วโมง (ผู้ดูแล)',
  '/worktime': 'สรุป worktime ทั้งหมด',
  '/personnel': 'โปรไฟล์และงานของฉัน',
  '/personnel/confirm': 'ความคืบหน้าการยืนยันบุคลากร',
  '/reports': 'KPI และแนวโน้ม',
  '/manhours-hr': 'รายงาน manhour ตาม WC',
  '/summary-weekly': 'สรุปรายสัปดาห์',
  '/user-log': 'ประวัติการใช้งาน',
  '/settings': 'โปรไฟล์และรหัสผ่าน',
  '/admin': 'คอนโซลผู้ดูแลระบบ',
}

export function displayUserName(user: AuthUser): string {
  const parts = [user.titlewkctr, user.namewkctr, user.surnamewkctr].filter(Boolean)
  const th = parts.join(' ').trim()
  if (th) return th
  if (user.fullnameTh?.trim()) return user.fullnameTh.trim()
  return user.username
}

export function navItemsToQuickLinks(entries: NavEntry[]): {
  to: string
  label: string
  hint: string
  icon: NavLinkEntry['icon']
}[] {
  return entries
    .filter((e): e is NavLinkEntry => e.kind === 'item' && e.to !== '/')
    .map((e) => ({
      to: e.to,
      label: e.label.replace(/\s*\/\s*.+$/, '').trim() || e.label,
      hint: ROUTE_HINTS[e.to] ?? 'เปิดโมดูล',
      icon: e.icon,
    }))
}
