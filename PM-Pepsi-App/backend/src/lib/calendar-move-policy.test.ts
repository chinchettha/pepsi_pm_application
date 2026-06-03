import { describe, expect, it } from 'vitest'
import {
  hasCalendarPlanMove,
  isCalendarDisplayDateOverdue,
  resolveCalendarMoveReasonRequired,
  resolveCalendarTecoBellAlert,
} from './calendar-move-policy.js'

describe('calendar-move-policy', () => {
  it('detects overdue display date', () => {
    const yesterday = Math.floor(
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1).getTime() /
        1000,
    )
    expect(isCalendarDisplayDateOverdue(yesterday)).toBe(true)
    const tomorrow = Math.floor(
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1).getTime() /
        1000,
    )
    expect(isCalendarDisplayDateOverdue(tomorrow)).toBe(false)
  })

  it('shows TECO bell when not fully closed in app', () => {
    expect(
      resolveCalendarTecoBellAlert({
        syst: 'TECO',
        percentClose: 50,
        hasConfirm: 0,
      }),
    ).toBe(true)
    expect(
      resolveCalendarTecoBellAlert({
        syst: 'TECO',
        percentClose: 100,
        confirmQcStatus: 'approved',
      }),
    ).toBe(false)
    expect(resolveCalendarTecoBellAlert({ syst: 'REL', percentClose: 0 })).toBe(false)
  })

  it('requires move reason for moved or overdue CRTD/REL', () => {
    const today = Math.floor(Date.now() / 1000)
    const past = Math.floor(
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 3).getTime() /
        1000,
    )

    expect(
      resolveCalendarMoveReasonRequired({
        syst: 'REL',
        displayUnix: today,
        cday: past,
        mpcount: 1,
      }),
    ).toBe(true)

    expect(
      resolveCalendarMoveReasonRequired({
        syst: 'REL',
        displayUnix: past,
        cday: null,
        mpcount: null,
      }),
    ).toBe(true)

    expect(
      resolveCalendarMoveReasonRequired({
        syst: 'REL',
        displayUnix: today,
        cday: null,
        mpcount: null,
      }),
    ).toBe(false)

    expect(
      resolveCalendarMoveReasonRequired({
        syst: 'TECO',
        displayUnix: past,
        cday: 1,
        mpcount: 1,
      }),
    ).toBe(false)
  })

  it('hasCalendarPlanMove matches CRTD/REL with mpcount', () => {
    expect(
      hasCalendarPlanMove({ syst: 'REL', cday: 100, mpcount: 1 }),
    ).toBe(true)
    expect(hasCalendarPlanMove({ syst: 'TECO', cday: 100, mpcount: 1 })).toBe(false)
  })
})
