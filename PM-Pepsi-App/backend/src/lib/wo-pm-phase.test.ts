import { describe, expect, it } from 'vitest'
import { isWoPmPhaseConfirm, resolveWoPmPhase } from './wo-pm-phase.js'

describe('resolveWoPmPhase', () => {
  it('maps unassigned CRTD to Create', () => {
    expect(resolveWoPmPhase('CRTD')).toBe('create')
    expect(resolveWoPmPhase('CRTD', { assignCount: 0 })).toBe('create')
  })

  it('maps assigned CRTD to REL', () => {
    expect(resolveWoPmPhase('CRTD', { assignCount: 2 })).toBe('rel')
  })

  it('maps REL to REL when still open', () => {
    expect(resolveWoPmPhase('REL')).toBe('rel')
  })

  it('maps closed SAP statuses to Confirm', () => {
    expect(resolveWoPmPhase('TECO')).toBe('confirm')
    expect(resolveWoPmPhase('CLSD')).toBe('confirm')
  })

  it('maps QC approved open WO to Confirm', () => {
    expect(
      resolveWoPmPhase('REL', { confirmQcStatus: 'approved' }),
    ).toBe('confirm')
  })
})

describe('isWoPmPhaseConfirm', () => {
  it('treats percent close 100 as confirm', () => {
    expect(isWoPmPhaseConfirm('CRTD', { percentClose: 100 })).toBe(true)
  })
})
