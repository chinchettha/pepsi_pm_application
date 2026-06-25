import { describe, expect, it } from 'vitest'
import {
  isVisibleRoleCode,
  normalizePrimaryRolePair,
  resolvePostLoginPathForUserst,
  userroleToUserst,
} from './primary-roles.js'

describe('primary-roles', () => {
  it('maps userrole to userst', () => {
    expect(userroleToUserst('planner')).toBe('U')
    expect(userroleToUserst('technician')).toBe('W')
    expect(userroleToUserst('admin')).toBe('U')
  })

  it('migrates legacy admin and manager to planner', () => {
    expect(normalizePrimaryRolePair({ userst: 'A', userrole: 'admin' })).toEqual({
      userst: 'U',
      userrole: 'planner',
    })
    expect(normalizePrimaryRolePair({ userst: 'H', userrole: 'manager' })).toEqual({
      userst: 'U',
      userrole: 'planner',
    })
  })

  it('resolves post-login path by role', () => {
    expect(resolvePostLoginPathForUserst('U')).toBe('/')
    expect(resolvePostLoginPathForUserst('A')).toBe('/')
    expect(resolvePostLoginPathForUserst('W')).toBe('/plan-calendar')
  })

  it('hides deprecated A/H from role admin UI', () => {
    expect(isVisibleRoleCode('A')).toBe(false)
    expect(isVisibleRoleCode('H')).toBe(false)
    expect(isVisibleRoleCode('U')).toBe(true)
    expect(isVisibleRoleCode('W')).toBe(true)
  })
})
