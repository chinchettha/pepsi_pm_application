import { describe, expect, it } from 'vitest'
import { kpiStatToneClass } from '@/components/kpi/kpi-tone'

describe('kpiStatToneClass', () => {
  it('includes tone border classes', () => {
    expect(kpiStatToneClass('emerald')).toContain('border-emerald-200')
    expect(kpiStatToneClass('info')).toContain('app-tone-info')
  })
})
