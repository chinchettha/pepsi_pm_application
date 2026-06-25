import { describe, expect, it } from 'vitest'
import { appNav } from '@/components/layout/nav-config'
import { canAccessNavItem, filterNavForUser } from '@/lib/nav-rbac'

describe('nav-rbac', () => {
  const plannerPerms = [
    'dashboard.read',
    'planning.read',
    'planning.assign',
    'work-orders.read',
    'calendar.read',
    'backlog.read',
    'personnel.read',
    'manhours.read',
    'reports.read',
  ]

  it('filters fallback nav by permissions for planner', () => {
    const filtered = filterNavForUser('U', appNav, plannerPerms)
    const paths = filtered.filter((e) => e.kind === 'item').map((e) => e.to)
    expect(paths).toContain('/planning')
    expect(paths).toContain('/personnel')
    expect(paths).not.toContain('/personnel/admin')
    expect(paths).not.toContain('/manhours/admin')
  })

  it('manager H sees confirmation without admin routes (rbac strict)', () => {
    const managerPerms = [
      'dashboard.read',
      'planning.read',
      'work-orders.read',
      'confirmation.read',
      'confirmation.write',
      'confirmation.close',
      'reports.read',
    ]
    const filtered = filterNavForUser('H', appNav, managerPerms, { rbacStrict: true })
    const paths = filtered.filter((e) => e.kind === 'item').map((e) => e.to)
    expect(paths).toContain('/confirmation')
    expect(paths).not.toContain('/admin/roles')
    expect(paths).not.toContain('/admin/users')
  })

  it('hides admin-only routes, work calendar, and planner-only pages for technician permissions', () => {
    const techPerms = [
      'dashboard.read',
      'plan-calendar.read',
      'work-orders.read',
      'confirmation.read',
      'manhours.read',
    ]
    const filtered = filterNavForUser('W', appNav, techPerms, { rbacStrict: true })
    const paths = filtered.filter((e) => e.kind === 'item').map((e) => e.to)
    expect(paths).not.toContain('/calendar')
    expect(paths).not.toContain('/planning')
    expect(paths).not.toContain('/reports/audit')
    expect(paths).not.toContain('/activity-log')
    expect(paths).not.toContain('/summary-weekly')
    expect(paths).not.toContain('/user-log')
    expect(paths).not.toContain('/iw37n')
    expect(paths).not.toContain('/admin/roles')
    expect(paths).toContain('/plan-calendar')
    expect(paths).toContain('/confirmation')
  })

  it('shows admin branding for admin permissions', () => {
    const adminPerms = ['admin.branding.read', 'dashboard.read', 'reports.read']
    const filtered = filterNavForUser('A', appNav, adminPerms)
    const paths = filtered.filter((e) => e.kind === 'item').map((e) => e.to)
    expect(paths).toContain('/admin/branding')
  })

  it('shows admin system settings when permitted', () => {
    const adminPerms = ['admin.settings.read', 'dashboard.read']
    const filtered = filterNavForUser('A', appNav, adminPerms)
    const paths = filtered.filter((e) => e.kind === 'item').map((e) => e.to)
    expect(paths).toContain('/admin/settings')
  })

  it('falls back to menuright when permissions array is empty', () => {
    const item = appNav.find((e) => e.kind === 'item' && e.to === '/planning')
    expect(item && item.kind === 'item').toBe(true)
    if (!item || item.kind !== 'item') return
    expect(canAccessNavItem('A', item, [])).toBe(true)
    expect(canAccessNavItem('W', item, [])).toBe(false)

    const calendar = appNav.find((e) => e.kind === 'item' && e.to === '/calendar')
    expect(calendar && calendar.kind === 'item').toBe(true)
    if (!calendar || calendar.kind !== 'item') return
    expect(canAccessNavItem('U', calendar, [])).toBe(true)
    expect(canAccessNavItem('W', calendar, [])).toBe(false)
  })
})
