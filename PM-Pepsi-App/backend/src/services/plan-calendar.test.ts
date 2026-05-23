import { describe, expect, it } from 'vitest'
import { mapPlanWorkRowToEvent } from './plan-calendar.js'

describe('mapPlanWorkRowToEvent', () => {
  const moveColor = '#ffa31a'

  it('uses cday for display when moved', () => {
    const bsc = Math.floor(new Date('2026-01-15').getTime() / 1000)
    const cday = Math.floor(new Date('2026-02-10').getTime() / 1000)
    const ev = mapPlanWorkRowToEvent(
      {
        idiw37: 1,
        wkorder: 'WO1',
        wktype: 'PM01',
        bscstart: bsc,
        cday,
        syst: 'REL',
        operationshorttext: 'Test op',
        wkstcolor: '#004c97',
      },
      moveColor,
    )
    expect(ev?.date).toBe('2026-02-10')
    expect(ev?.color).toBe(moveColor)
    expect(ev?.title).toBe('WO1 / PM01')
  })

  it('uses status color when move is same month', () => {
    const sec = Math.floor(new Date('2026-03-05').getTime() / 1000)
    const ev = mapPlanWorkRowToEvent(
      {
        idiw37: 2,
        wkorder: 'WO2',
        wktype: null,
        bscstart: sec,
        cday: Math.floor(new Date('2026-03-20').getTime() / 1000),
        syst: 'CRTD',
        operationshorttext: null,
        wkstcolor: '#00ff00',
      },
      moveColor,
    )
    expect(ev?.color).toBe('#00ff00')
  })

  it('marks TECO as not movable (green plan)', () => {
    const sec = Math.floor(new Date('2026-03-05').getTime() / 1000)
    const ev = mapPlanWorkRowToEvent(
      {
        idiw37: 9,
        wkorder: 'WO9',
        wktype: 'PM01',
        bscstart: sec,
        cday: null,
        syst: 'TECO',
        operationshorttext: null,
        wkstcolor: '#00ff00',
      },
      moveColor,
    )
    expect(ev?.canMovePlan).toBe(false)
    expect(ev?.syst).toBe('TECO')
  })

  it('returns null without plan date', () => {
    expect(
      mapPlanWorkRowToEvent(
        {
          idiw37: 3,
          wkorder: 'WO3',
          wktype: null,
          bscstart: null,
          cday: null,
          syst: 'REL',
          operationshorttext: null,
          wkstcolor: '#000',
        },
        moveColor,
      ),
    ).toBeNull()
  })
})
