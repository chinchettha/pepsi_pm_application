import { describe, expect, it } from 'vitest'
import {
  MASTER_PLAN_VIRTUAL_LAST_CLOSED,
  withMasterPlanVirtualColumns,
} from './master-plan-virtual-columns'

describe('master-plan-virtual-columns', () => {
  it('appends virtual columns at the end on detail sheets', () => {
    const cols = ['Zone', 'PM list', 'days', 'Min']
    const out = withMasterPlanVirtualColumns(cols, 'detail')
    expect(out.slice(0, 4)).toEqual(cols)
    expect(out[4]).toBe(MASTER_PLAN_VIRTUAL_LAST_CLOSED)
    expect(out[5]).toBe('__pmNextDue')
  })

  it('skips virtual columns on summary sheets', () => {
    const cols = ['col0', 'col1']
    expect(withMasterPlanVirtualColumns(cols, 'summary')).toEqual(cols)
  })
})
