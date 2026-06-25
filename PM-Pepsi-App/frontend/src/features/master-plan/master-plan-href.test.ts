import { describe, expect, it } from 'vitest'
import { buildMasterPlanHref } from './master-plan-href'

describe('buildMasterPlanHref', () => {
  it('includes discipline and maintenance plan query', () => {
    expect(
      buildMasterPlanHref({
        masterPlanMntplan: '366383',
        masterPlanDiscipline: 'PK',
      }),
    ).toBe('/master-plan?q=366383&discipline=PK')
  })

  it('falls back to mntplan when master plan code missing', () => {
    expect(buildMasterPlanHref({ mntplan: '610000004863' })).toBe('/master-plan?q=610000004863')
  })
})
