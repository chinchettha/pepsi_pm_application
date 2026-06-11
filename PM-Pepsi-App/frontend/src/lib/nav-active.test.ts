import { describe, expect, it } from 'vitest'
import { isNavPathActive } from '@/lib/nav-active'

describe('isNavPathActive', () => {
  it('highlights parent for nested child routes when end is false', () => {
    expect(isNavPathActive('/work-orders/123', '/work-orders')).toBe(true)
    expect(isNavPathActive('/work-orders/123/edit', '/work-orders')).toBe(true)
  })

  it('does not highlight parent for unrelated routes', () => {
    expect(isNavPathActive('/confirmation', '/work-orders')).toBe(false)
  })

  it('respects end=true for exact match only', () => {
    expect(isNavPathActive('/', '/', true)).toBe(true)
    expect(isNavPathActive('/planning', '/', true)).toBe(false)
    expect(isNavPathActive('/planning', '/planning', true)).toBe(true)
    expect(isNavPathActive('/planning/extra', '/planning', true)).toBe(false)
  })
})
