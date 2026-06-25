import { describe, expect, it } from 'vitest'
import { resolvePlannerPipeline, resolveWorkProgressPercent } from './planner-pipeline.js'

describe('resolvePlannerPipeline', () => {
  it('returns unassigned when no assign rows', () => {
    const r = resolvePlannerPipeline({
      syst: 'REL',
      assignCount: 0,
      worktimeCount: 0,
    })
    expect(r.status).toBe('unassigned')
    expect(r.color).toBe('#FF3B30')
    expect(r.badges).toEqual([])
  })

  it('returns assigned purple when assigned but no worktime', () => {
    const r = resolvePlannerPipeline({
      syst: 'REL',
      assignCount: 2,
      worktimeCount: 0,
      ackPending: 1,
      ackAcknowledged: 1,
    })
    expect(r.status).toBe('assigned')
    expect(r.badges).toContain('ack_pending')
  })

  it('returns in_progress blue when worktime recorded', () => {
    const r = resolvePlannerPipeline({
      syst: 'REL',
      assignCount: 1,
      worktimeCount: 2,
      ackAcknowledged: 1,
    })
    expect(r.status).toBe('in_progress')
    expect(r.badges).toContain('ack_done')
  })

  it('returns partial orange when partial close recorded', () => {
    const r = resolvePlannerPipeline({
      syst: 'REL',
      assignCount: 1,
      worktimeCount: 1,
      partialCloseCount: 1,
      ackAcknowledged: 1,
    })
    expect(r.status).toBe('partial')
    expect(r.color).toBe('#F7941D')
    expect(r.badges).toContain('partial_close')
    expect(r.badges).toContain('ack_done')
  })

  it('returns closed green with qc_pending after supervisor close', () => {
    const r = resolvePlannerPipeline({
      syst: 'REL',
      assignCount: 1,
      worktimeCount: 1,
      hasSupervisorClose: true,
      confirmQcStatus: 'pending',
    })
    expect(r.status).toBe('closed')
    expect(r.badges).toEqual(['qc_pending'])
  })

  it('returns closed with qc_approved', () => {
    const r = resolvePlannerPipeline({
      syst: 'TECO',
      assignCount: 1,
      worktimeCount: 1,
      confirmQcStatus: 'approved',
    })
    expect(r.status).toBe('closed')
    expect(r.badges).toEqual(['qc_approved'])
  })

  it('returns closed green when QC approved but syst still CRTD', () => {
    const r = resolvePlannerPipeline({
      syst: 'CRTD',
      assignCount: 1,
      worktimeCount: 1,
      confirmQcStatus: 'approved',
      ackAcknowledged: 1,
    })
    expect(r.status).toBe('closed')
    expect(r.color).toBe('#7AC943')
    expect(r.badges).toEqual(['qc_approved'])
  })

  it('returns closed when all assigned technicians complete-closed', () => {
    const r = resolvePlannerPipeline({
      syst: 'REL',
      assignCount: 2,
      worktimeCount: 2,
      completeCloseWkctrCount: 2,
      ackAcknowledged: 2,
    })
    expect(r.status).toBe('closed')
    expect(r.color).toBe('#7AC943')
    expect(r.badges).toEqual(['qc_pending'])
  })
})

describe('resolveWorkProgressPercent', () => {
  it('returns 50% for one partial-only technician of one assigned', () => {
    expect(
      resolveWorkProgressPercent({
        syst: 'REL',
        assignCount: 1,
        completeCloseWkctrCount: 0,
        partialOnlyWkctrCount: 1,
        pipelineStatus: 'partial',
      }),
    ).toBe(50)
  })

  it('returns 100% when all assigned technicians complete-closed', () => {
    expect(
      resolveWorkProgressPercent({
        syst: 'REL',
        assignCount: 2,
        completeCloseWkctrCount: 2,
        partialOnlyWkctrCount: 0,
        pipelineStatus: 'in_progress',
      }),
    ).toBe(100)
  })

  it('uses supervisor percent when higher', () => {
    expect(
      resolveWorkProgressPercent({
        syst: 'REL',
        assignCount: 2,
        completeCloseWkctrCount: 1,
        partialOnlyWkctrCount: 0,
        supervisorPercentClose: 75,
        pipelineStatus: 'in_progress',
      }),
    ).toBe(75)
  })

  it('returns null for closed pipeline', () => {
    expect(
      resolveWorkProgressPercent({
        syst: 'REL',
        assignCount: 1,
        completeCloseWkctrCount: 1,
        partialOnlyWkctrCount: 0,
        pipelineStatus: 'closed',
      }),
    ).toBeNull()
  })
})
