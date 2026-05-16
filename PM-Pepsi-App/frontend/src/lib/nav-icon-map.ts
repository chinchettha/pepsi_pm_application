import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
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
  Circle,
} from 'lucide-react'

const byRoute: Record<string, LucideIcon> = {
  '/': Home,
  '/calendar': CalendarDays,
  '/line-calendar': ChartGantt,
  '/backlog': LayoutList,
  '/work-orders': ClipboardList,
  '/confirmation': Users,
  '/planning': Wrench,
  '/iw37n': Database,
  '/master-data': Boxes,
  '/manhours': Timer,
  '/worktime': Clock3,
  '/personnel': Users,
  '/reports': BarChart3,
  '/manhours-hr': Printer,
  '/summary-weekly': LineChart,
  '/settings': Settings,
}

/** แปลง `menuicon` จาก tbmenu หรือใช้ route เป็น fallback */
export function resolveNavIcon(reactRoute: string, menuicon?: string): LucideIcon {
  const fromRoute = byRoute[reactRoute]
  if (fromRoute) return fromRoute
  const icon = (menuicon ?? '').toLowerCase()
  if (icon.includes('calendar')) return CalendarDays
  if (icon.includes('home')) return Home
  if (icon.includes('database')) return Database
  if (icon.includes('user')) return Users
  if (icon.includes('chart')) return BarChart3
  if (icon.includes('cog')) return Settings
  return Circle
}
