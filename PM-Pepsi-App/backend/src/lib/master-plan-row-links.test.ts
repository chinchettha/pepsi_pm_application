import { describe, expect, it } from 'vitest'
import { extractMasterPlanLinkKeys, suggestsPm3Phase } from './master-plan-row-links.js'

describe('extractMasterPlanLinkKeys', () => {
  const headers = ['Zone', 'Machine List', 'SAP Code', 'Task list', 'Legacy', 'M/C', 'PM list']

  it('reads values from cells with fill-down display', () => {
    const cells = {
      Zone: '',
      'Machine List': 'Agitator',
      'SAP Code': '4000123',
      'Task list': 'TL01',
      Legacy: 'SE0-MI-EE',
      'M/C': '10000001',
      'PM list': 'ตรวจมอเตอร์',
    }
    const display = { ...cells, Zone: 'SE0' }
    const keys = extractMasterPlanLinkKeys(headers, cells, display)
    expect(keys.zone).toBe('SE0')
    expect(keys.mntplan).toBe('4000123')
    expect(keys.pmlist).toBe('ตรวจมอเตอร์')
  })

  it('detects PM 3-phase keywords in Thai', () => {
    expect(suggestsPm3Phase('วัดกระแส 3 เฟสมอเตอร์')).toBe(true)
    expect(suggestsPm3Phase('Check grease')).toBe(false)
  })
})
