import { describe, expect, it } from 'vitest'
import { isPortalModuleVisible } from './portal-modules.js'

describe('isPortalModuleVisible', () => {
  it('hides store and repair when base_url is empty', () => {
    expect(isPortalModuleVisible('store', '')).toBe(false)
    expect(isPortalModuleVisible('repair', '   ')).toBe(false)
  })

  it('shows store and repair when base_url is configured', () => {
    expect(isPortalModuleVisible('store', 'https://store.example')).toBe(true)
    expect(isPortalModuleVisible('repair', 'https://repair.example')).toBe(true)
  })

  it('always shows pm', () => {
    expect(isPortalModuleVisible('pm', '')).toBe(true)
  })
})
