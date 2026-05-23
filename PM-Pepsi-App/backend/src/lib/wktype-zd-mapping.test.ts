import { describe, expect, it } from 'vitest'
import {
  buildWktypeFilterOptions,
  formatWktypeDisplay,
  formatWktypeFilterLabel,
} from './wktype-zd-mapping.js'

describe('wktype-zd-mapping', () => {
  it('labels ZB02 with ZD02 PM from customer meeting', () => {
    expect(formatWktypeFilterLabel('ZB02')).toBe('ZB02 → ZD02 Preventive Maintenance (PM)')
  })

  it('maps ZB05 to ZD01 breakdown', () => {
    const d = formatWktypeDisplay('ZB05')
    expect(d.zdCode).toBe('ZD01')
    expect(d.primary).toContain('ZD01')
  })

  it('buildWktypeFilterOptions merges master and distinct', () => {
    const opts = buildWktypeFilterOptions(
      [{ wkzb: 'ZB01', zbdescrip: 'Corrective' }],
      [{ wktype: 'ZB02' }],
    )
    expect(opts.map((o) => o.code)).toEqual(['ZB01', 'ZB02'])
    expect(opts[1].label).toContain('ZD02')
  })
})
