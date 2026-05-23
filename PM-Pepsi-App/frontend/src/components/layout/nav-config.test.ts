import { describe, expect, it } from 'vitest'
import { appNav } from '@/components/layout/nav-config'
import {
  NAV_ROUTE_PERMISSION,
  PUBLIC_NAV_PATHS,
  permissionForRoute,
} from '@/lib/nav-route-permissions'
import { collectNavPaths } from '@/lib/nav-menu-api'

describe('nav-config sidebar coverage', () => {
  const linkPaths = collectNavPaths(appNav)

  it('includes Plan Calendar (post-login WC path)', () => {
    expect(linkPaths).toContain('/plan-calendar')
    expect(permissionForRoute('/plan-calendar')).toBe('planning.read')
  })

  it('maps every fallback nav route to an RBAC permission (except public kiosk)', () => {
    for (const path of linkPaths) {
      if (PUBLIC_NAV_PATHS.has(path)) continue
      expect(NAV_ROUTE_PERMISSION[path], `missing permission for ${path}`).toBeTruthy()
    }
  })

  it('includes public Engineering Board without RBAC gate', () => {
    expect(linkPaths).toContain('/board')
    expect(PUBLIC_NAV_PATHS.has('/board')).toBe(true)
    expect(permissionForRoute('/board')).toBeUndefined()
  })

  it('does not duplicate /admin/users in fallback nav', () => {
    const adminUserLinks = appNav.filter((e) => e.kind === 'item' && e.to === '/admin/users')
    expect(adminUserLinks).toHaveLength(1)
  })

  it('covers core operational routes from PHP parity', () => {
    for (const path of [
      '/',
      '/plan-calendar',
      '/calendar',
      '/backlog',
      '/work-orders',
      '/confirmation',
      '/planning',
      '/integration',
      '/iw37n',
      '/master-data',
      '/manhours',
      '/personnel',
      '/user-log',
      '/settings',
    ]) {
      expect(linkPaths).toContain(path)
    }
  })
})
