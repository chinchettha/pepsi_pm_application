import { describe, expect, it } from 'vitest'
import { mapPlanWorkRowToEvent } from './plan-calendar.js'

describe('mapPlanWorkRowToEvent', () => {
  const moveColor = '#ffa31a'

  const baseRow = {
    percent_close: 0,
    has_confirm: 0,
    confirm_qc_status: null as string | null,
  }

  it('uses cday for display when moved', () => {
    const bsc = Math.floor(new Date('2026-01-15').getTime() / 1000)
    const cday = Math.floor(new Date('2026-02-10').getTime() / 1000)
    const ev = mapPlanWorkRowToEvent(
      {
        ...baseRow,
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
    expect(ev?.title).toBe('[กำลังทำ] WO1 / PM01')
    expect(ev?.pmExecutionStatus).toBe('in_progress')
  })

  it('uses execution color when move is same month', () => {
    const sec = Math.floor(new Date('2026-03-05').getTime() / 1000)
    const ev = mapPlanWorkRowToEvent(
      {
        ...baseRow,
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
    expect(ev?.color).toBe('#9333ea')
    expect(ev?.pmExecutionStatus).toBe('in_progress')
  })

  it('marks done when QC approved', () => {
    const sec = Math.floor(new Date('2026-03-05').getTime() / 1000)
    const ev = mapPlanWorkRowToEvent(
      {
        ...baseRow,
        idiw37: 8,
        wkorder: 'WO8',
        wktype: 'PM01',
        bscstart: sec,
        cday: null,
        syst: 'REL',
        operationshorttext: null,
        wkstcolor: '#004c97',
        confirm_qc_status: 'approved',
        percent_close: 80,
      },
      moveColor,
    )
    expect(ev?.pmExecutionStatus).toBe('done')
    expect(ev?.color).toBe('#16a34a')
    expect(ev?.title).toMatch(/^\[เสร็จแล้ว\]/)
  })

  it('marks TECO as closed and not movable', () => {
    const sec = Math.floor(new Date('2026-03-05').getTime() / 1000)
    const ev = mapPlanWorkRowToEvent(
      {
        ...baseRow,
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
    expect(ev?.pmExecutionStatus).toBe('closed')
    expect(ev?.color).toBe('#16a34a')
  })

  it('returns null without plan date', () => {
    expect(
      mapPlanWorkRowToEvent(
        {
          ...baseRow,
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
