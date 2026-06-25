import { describe, expect, it } from 'vitest'
import { dashboardClosedWhere, dashboardClosedEventSecExpr } from './dashboard-closed-filter.js'

describe('dashboardClosedWhere', () => {
  it('requires actfinish and approved QC', () => {
    const sql = dashboardClosedWhere('i')
    expect(sql).toContain('i.actfinish IS NOT NULL')
    expect(sql).toContain("confirm_qc_status, ''))) = 'approved'")
  })

  it('supports custom alias', () => {
    expect(dashboardClosedWhere('wo')).toContain('wo.actfinish')
  })

  it('resolves closed event from confirm_qc_at when actfinish missing', () => {
    const expr = dashboardClosedEventSecExpr('i')
    expect(expr).toContain('confirm_qc_at')
    expect(expr).toContain('tbwrkclose')
  })
})
