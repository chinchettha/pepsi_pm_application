import { describe, expect, it } from 'vitest'
import {
  parseIw37nOstDescription,
  resolveIw37nMasterPlanEnrichment,
  type Iw37nEnrichmentContext,
  type TasklistEnrichmentRow,
} from './iw37n-master-plan-enrich.js'

describe('iw37n-master-plan-enrich', () => {
  it('parses Description field legacy pattern', () => {
    expect(parseIw37nOstDescription('610000004496 & SE3-MI-EE')).toEqual({
      planCode: '610000004496',
      legacy: 'SE3-MI-EE',
    })
  })

  it('picks tasklist row matching legacy and zone', () => {
    const candidates: TasklistEnrichmentRow[] = [
      {
        mntplan: '610000004398',
        tasklist: '100000',
        legacy: 'OTHER-EE',
        zone: 'XX0',
        craft: 'EE',
        machine: 'Wrong',
        pmlist: 'other task',
        pmday: 30,
      },
      {
        mntplan: '610000004496',
        tasklist: '100930',
        legacy: 'SE3-MI-EE',
        zone: 'SE3',
        craft: 'EE',
        machine: 'Incline Conveyor #1(Blue)',
        pmlist: 'ตรวจเช็คสภาพท่อร้อยสายไฟ',
        pmday: 30,
      },
    ]
    const ctx: Iw37nEnrichmentContext = {
      tasklistByMntplan: new Map([['610000004496', candidates]]),
      tasklistByLegacy: new Map([['SE3-MI-EE', [candidates[1]!]]]),
      masterByMntplan: new Map(),
      masterByLegacy: new Map(),
    }
    const out = resolveIw37nMasterPlanEnrichment(
      {
        mntplan: '610000004496',
        operationshorttext: '1M - EE Cutting & Embrossing Zone (SE3)',
        ostdescription: '610000004496 & SE3-MI-EE',
        equipment: '10049490',
        equdescrip: 'Cutting & Embrossing',
        functionalloc: 'PI-TH-7151-FA-F2-SC',
      },
      ctx,
    )
    expect(out.linked).toBe(true)
    expect(out.tasklist).toBe('100930')
    expect(out.legacy).toBe('SE3-MI-EE')
    expect(out.zone).toBe('SE3')
    expect(out.pmday).toBe(30)
  })
})
