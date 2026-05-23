import type { NavLinkEntry } from '@/components/layout/nav-config'
import { ADMIN_SECTIONS } from '@/lib/admin-sections'

/** Sidebar items สำหรับโซน `/admin/*` — สอดคล้อง ADMIN_SECTIONS (12 หน้า) */
export function buildAdminNavEntries(): NavLinkEntry[] {
  return ADMIN_SECTIONS.filter((s) => s.implemented).map((s) => ({
    kind: 'item' as const,
    to: s.to,
    label: s.label,
    icon: s.icon,
    menuright: 'A',
    permission: s.permission,
    end: s.segment === '',
  }))
}
