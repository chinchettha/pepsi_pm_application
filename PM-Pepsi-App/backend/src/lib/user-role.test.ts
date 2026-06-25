import { describe, expect, it } from 'vitest'
import { deriveUserRole, normalizeUserRole, resolveUserRole } from './user-role.js'

describe('user-role', () => {
  it('uses explicit userrole as source of truth before legacy hints', () => {
    expect(resolveUserRole('manager', 'A', 'Engineer')).toBe('planner')
    expect(resolveUserRole('technician', 'U', 'Planner')).toBe('technician')
    expect(resolveUserRole('planner', 'A', 'Engineer')).toBe('planner')
  })

  it('falls back to legacy userst when userrole is missing', () => {
    expect(resolveUserRole(null, 'A', null)).toBe('planner')
    expect(resolveUserRole('', 'H', null)).toBe('planner')
    expect(resolveUserRole(undefined, 'W', null)).toBe('technician')
  })

  it('keeps the old position heuristic only as a migration fallback', () => {
    expect(deriveUserRole('U', 'หัวหน้าช่าง')).toBe('manager')
    expect(deriveUserRole('U', 'Technician')).toBe('technician')
    expect(deriveUserRole('U', 'Planning Engineer')).toBe('planner')
    expect(deriveUserRole('U', 'Unknown')).toBe('planner')
  })

  it('normalizes only supported explicit roles', () => {
    expect(normalizeUserRole('ADMIN')).toBe('admin')
    expect(normalizeUserRole(' planner ')).toBe('planner')
    expect(normalizeUserRole('head')).toBeNull()
  })
})
