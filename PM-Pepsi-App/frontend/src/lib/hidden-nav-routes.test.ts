import { describe, expect, it } from 'vitest'
import { Home } from 'lucide-react'
import type { NavEntry } from '@/components/layout/nav-config'
import { isHiddenNavRoute } from '@/lib/hidden-nav-routes'
import { collectNavPaths, stripDeprecatedNavEntries } from '@/lib/nav-menu-api'

describe('hidden-nav-routes', () => {
  it('flags pm-vibration as hidden', () => {
    expect(isHiddenNavRoute('/pm-vibration')).toBe(true)
    expect(isHiddenNavRoute('/pm-vibration?wkorder=123')).toBe(true)
    expect(isHiddenNavRoute('/confirmation')).toBe(false)
  })

  it('strips hidden routes from sidebar blocks', () => {
    const entries: NavEntry[] = [
      { kind: 'heading', label: 'Test' },
      {
        kind: 'item',
        to: '/pm-vibration',
        label: 'PM Measurements',
        icon: Home,
        menuright: 'A:U:W',
      },
      { kind: 'item', to: '/confirmation', label: 'Confirmation', icon: Home, menuright: 'A:U' },
    ]
    const paths = collectNavPaths(stripDeprecatedNavEntries(entries))
    expect(paths).not.toContain('/pm-vibration')
    expect(paths).toContain('/confirmation')
  })
})
