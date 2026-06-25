import { describe, expect, it } from 'vitest'
import {
  buildMasterPlanSearchLabel,
  escapeIlikePattern,
  scoreMaintenancePlanQueryMatch,
} from './master-plan-search.js'

describe('master-plan-search', () => {
  const headers = [
    'Zone',
    'Machine List',
    'Maintenance plan',
    'Task list',
    'Legacy',
    'M/C',
    'PM list',
  ]

  it('builds label from link keys', () => {
    const cells = {
      Zone: 'P17',
      'Maintenance plan': '342596',
      'Task list': '596',
      'M/C': 'SSN Dust Collector',
      'PM list': 'เปลี่ยน Bearing',
    }
    expect(buildMasterPlanSearchLabel(headers, cells, cells)).toBe('342596 · 596')
  })

  it('escapes ilike wildcards', () => {
    expect(escapeIlikePattern('100%')).toBe('100\\%')
  })

  it('scores exact maintenance plan match highest', () => {
    const cells = { 'Maintenance plan': '366383', 'Task list': '6797' }
    expect(scoreMaintenancePlanQueryMatch(headers, cells, cells, '366383')).toBe(100)
    expect(scoreMaintenancePlanQueryMatch(headers, cells, cells, '6797')).toBe(0)
  })
})
