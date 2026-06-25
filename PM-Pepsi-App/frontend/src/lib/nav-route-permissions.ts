import type { AuthUser } from '@/api/schemas'
import { hasPermission } from '@/lib/permissions-core'

/**
 * Maps React routes to RBAC permission codes (tbl_permission).
 * Used when filtering sidebar fallback nav and API nav items client-side.
 */
/** เปิดได้โดยไม่ผ่าน NavRouteGuard (kiosk / public) */
export const PUBLIC_NAV_PATHS = new Set<string>(['/board'])

/** Routes where any listed permission is sufficient (e.g. planner planning.read → plan-calendar). */
export const NAV_ROUTE_PERMISSION_ANY: Partial<Record<string, readonly string[]>> = {
  '/plan-calendar': ['plan-calendar.read', 'planning.read'],
}

export const NAV_ROUTE_PERMISSION: Record<string, string> = {
  '/': 'dashboard.read',
  '/plan-calendar': 'plan-calendar.read',
  '/calendar': 'calendar.read',
  '/backlog': 'backlog.read',
  '/work-orders': 'work-orders.read',
  '/pm-vibration': 'confirmation.read',
  '/confirmation': 'confirmation.read',
  '/planning': 'planning.read',
  '/integration': 'iw37n.read',
  '/iw37n': 'iw37n.read',
  '/master-plan': 'master-data.read',
  '/master-data': 'master-data.read',
  '/manhours': 'manhours.read',
  '/worktime': 'manhours.read',
  '/personnel': 'personnel.read',
  '/personnel/admin': 'personnel.write',
  '/personnel/confirm': 'confirmation.read',
  '/reports': 'reports.read',
  '/reports/audit': 'reports.read',
  '/activity-log': 'reports.read',
  '/manhours-hr': 'manhours.read',
  '/summary-weekly': 'reports.read',
  '/user-log': 'user-log.read',
  '/settings': 'admin.settings.read',
  '/admin': 'admin.settings.read',
  '/admin/branding': 'admin.branding.read',
  '/admin/settings': 'admin.settings.read',
  '/admin/audit': 'admin.audit.read',
  '/admin/health': 'admin.health.read',
  '/admin/backup': 'admin.backup.read',
  '/admin/announcements': 'admin.announcement.read',
  '/admin/telegram': 'admin.telegram.read',
  '/admin/users': 'admin.users.read',
  '/admin/roles': 'admin.roles.read',
  '/admin/menu': 'admin.menu.read',
  '/admin/master': 'master-data.read',
  '/admin/security': 'admin.security.read',
  '/admin/about': 'admin.about.read',
}

export function permissionForRoute(path: string): string | undefined {
  const perms = permissionsForRoute(path)
  return perms[0]
}

export function permissionsForRoute(path: string): string[] {
  if (NAV_ROUTE_PERMISSION_ANY[path]) return [...NAV_ROUTE_PERMISSION_ANY[path]!]
  if (NAV_ROUTE_PERMISSION[path]) return [NAV_ROUTE_PERMISSION[path]]
  const sorted = Object.keys(NAV_ROUTE_PERMISSION).sort((a, b) => b.length - a.length)
  for (const prefix of sorted) {
    if (prefix !== '/' && path.startsWith(`${prefix}/`)) {
      const any = NAV_ROUTE_PERMISSION_ANY[prefix]
      if (any) return [...any]
      const single = NAV_ROUTE_PERMISSION[prefix]
      if (single) return [single]
    }
  }
  return []
}

export function canAccessRoute(user: AuthUser | null | undefined, path: string): boolean {
  const perms = permissionsForRoute(path)
  if (perms.length === 0) return true
  return perms.some((p) => hasPermission(user, p))
}
