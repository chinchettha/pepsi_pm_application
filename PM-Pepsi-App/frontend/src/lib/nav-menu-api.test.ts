import { describe, expect, it } from 'vitest'
import { appNav, type NavLinkEntry } from '@/components/layout/nav-config'
import { supplementNavFromFallback } from '@/lib/nav-menu-api'

describe('supplementNavFromFallback', () => {
  it('adds /admin/branding when missing from API nav', () => {
    const reports = appNav.find((e) => e.kind === 'item' && e.to === '/reports') as NavLinkEntry
    const settings = appNav.find((e) => e.kind === 'item' && e.to === '/settings') as NavLinkEntry

    const merged = supplementNavFromFallback(
      [
        { kind: 'heading', label: 'รายงาน' },
        reports,
        { kind: 'heading', label: 'ระบบ' },
        settings,
      ],
      appNav,
    )

    const paths = merged.filter((e) => e.kind === 'item').map((e) => e.to)
    expect(paths).toContain('/admin/branding')
    expect(merged.some((e) => e.kind === 'heading' && e.label === 'ผู้ดูแลระบบ')).toBe(true)
  })
})
