import { describe, expect, it } from 'vitest'
import { licenseStatusLabel, migrationProgressPercent } from './about-display'

describe('about-display', () => {
  it('labels known license statuses', () => {
    expect(licenseStatusLabel('not_configured')).toContain('ยังไม่')
    expect(licenseStatusLabel('active')).toBe('ใช้งานได้')
  })

  it('computes migration percent', () => {
    expect(migrationProgressPercent(7, 10)).toBe(70)
    expect(migrationProgressPercent(0, 0)).toBe(0)
  })
})
