import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  BarChart3,
  BookText,
  Boxes,
  CalendarDays,
  ChartGantt,
  ClipboardList,
  Clock3,
  Database,
  Home,
  LayoutList,
  LineChart,
  Printer,
  Settings,
  Timer,
  Users,
  Wrench,
} from 'lucide-react'

/** หัวข้อกลุ่มเมนู — เทียบ `sb-sidenav-menu-heading` + โครง `left_menu_bk17052563.php` / ตาราง `tbmenu` ในระบบเก่า */
export type NavHeading = { kind: 'heading'; label: string }

export type NavLinkEntry = {
  kind: 'item'
  to: string
  label: string
  icon: LucideIcon
  /** สิทธิ์เทียบ `menuright` ใน `tbmenu` / `left_menu.php` (คั่นด้วย `:`) */
  menuright: string
  /** สำหรับ `/` ให้ active เฉพาะ exact */
  end?: boolean
}

export type NavEntry = NavHeading | NavLinkEntry

/**
 * ลำดับเมนู sidebar อ้างอิง PHP:
 * - เมนูจริงโหลดจาก `tbmenu` + `menuright` vs `$_SESSION['UserST']` (`left_menu.php`)
 * - โครงอ้างอิงเพิ่มจาก `left_menu_bk17052563.php` (กลุ่ม USER/ADMIN/Main/Report)
 * ฝั่ง React: กรองด้วย `filterNavForUser` + `menuright` ด้านล่าง (รอ sync จาก API `tbmenu` ภายหลัง)
 */
export const appNav: NavEntry[] = [
  { kind: 'heading', label: 'ปฏิทิน & ใบงาน' },
  { kind: 'item', to: '/', label: 'หน้าแรก', icon: Home, menuright: 'A', end: true },
  { kind: 'item', to: '/calendar', label: 'ปฏิทิน (Work scheduling)', icon: CalendarDays, menuright: 'A:U:W' },
  { kind: 'item', to: '/line-calendar', label: 'ปฏิทินเส้น / Line', icon: ChartGantt, menuright: 'A:U:W' },
  { kind: 'item', to: '/backlog', label: 'Backlog / แผนค้าง', icon: LayoutList, menuright: 'A:U:W' },
  { kind: 'item', to: '/work-orders', label: 'ใบงาน / WO', icon: ClipboardList, menuright: 'A:U:W' },
  { kind: 'item', to: '/confirmation', label: 'รับรอง / Confirmation', icon: BadgeCheck, menuright: 'A:U:W' },

  { kind: 'heading', label: 'แผน & นำเข้า SAP' },
  { kind: 'item', to: '/planning', label: 'แผน PM/CM', icon: Wrench, menuright: 'A' },
  { kind: 'item', to: '/iw37n', label: 'IW37N / นำเข้า SAP', icon: Database, menuright: 'A' },
  { kind: 'item', to: '/master-data', label: 'ข้อมูลหลัก (master)', icon: Boxes, menuright: 'A' },

  { kind: 'heading', label: 'ชั่วโมง & บุคลากร' },
  { kind: 'item', to: '/manhours', label: 'Manhours', icon: Timer, menuright: 'A' },
  { kind: 'item', to: '/worktime', label: 'ดู Worktime ทั้งหมด', icon: Clock3, menuright: 'A:U:W' },
  { kind: 'item', to: '/personnel', label: 'บุคลากร / ทีม', icon: Users, menuright: 'A' },

  { kind: 'heading', label: 'รายงาน' },
  { kind: 'item', to: '/reports', label: 'รายงานรวม', icon: BarChart3, menuright: 'A' },
  { kind: 'item', to: '/manhours-hr', label: 'Manhour HR', icon: Printer, menuright: 'A:U:W' },
  { kind: 'item', to: '/summary-weekly', label: 'สรุปรายสัปดาห์', icon: LineChart, menuright: 'A:U:W' },

  { kind: 'heading', label: 'ระบบ' },
  { kind: 'item', to: '/user-log', label: 'User Log', icon: BookText, menuright: 'A:U:W' },
  { kind: 'item', to: '/settings', label: 'ตั้งค่า', icon: Settings, menuright: 'A' },
]

