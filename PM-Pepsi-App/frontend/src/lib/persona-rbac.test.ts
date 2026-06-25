import { describe, expect, it } from 'vitest'
import { appNav } from '@/components/layout/nav-config'
import { filterNavForUser } from '@/lib/nav-rbac'
import {
  PLANNER_PERSONA,
  TECHNICIAN_PERSONA,
  TEST_PERSONAS,
  type TestPersona,
} from '@/lib/test-personas'

function navPaths(persona: TestPersona): string[] {
  return filterNavForUser(persona.userst, appNav, persona.permissions, { rbacStrict: true })
    .filter((e) => e.kind === 'item')
    .map((e) => e.to)
}

describe('ISO 29110 personas — Planner vs Technician (unit)', () => {
  describe('Planner (userst U)', () => {
    const persona = PLANNER_PERSONA
    const paths = navPaths(persona)

    it('sees planning and report modules', () => {
      expect(paths).toContain('/planning')
      expect(paths).toContain('/calendar')
      expect(paths).toContain('/activity-log')
      expect(paths).toContain('/summary-weekly')
      expect(paths).toContain('/manhours-hr')
    })

    it('does not expose deprecated admin-only nav without permission', () => {
      expect(paths).not.toContain('/admin/roles')
    })

    for (const route of persona.allowedRoutes.filter((r) =>
      ['/planning', '/activity-log', '/summary-weekly'].includes(r),
    )) {
      it(`allowed route in sidebar: ${route}`, () => {
        expect(paths).toContain(route)
      })
    }
  })

  describe('Technician (userst W)', () => {
    const persona = TECHNICIAN_PERSONA
    const paths = navPaths(persona)

    it('sees field workflow: plan-calendar, confirmation, manhours-hr', () => {
      expect(paths).toContain('/plan-calendar')
      expect(paths).toContain('/confirmation')
      expect(paths).toContain('/manhours-hr')
    })

    it('does not see planner-only or report admin routes', () => {
      for (const route of persona.deniedRoutes) {
        expect(paths).not.toContain(route)
      }
    })

    it('does not see work scheduling calendar (planner view)', () => {
      expect(paths).not.toContain('/calendar')
      expect(paths).not.toContain('/planning')
    })
  })

  it('defines exactly two primary personas for V&V', () => {
    expect(TEST_PERSONAS.map((p) => p.id)).toEqual(['planner', 'technician'])
    expect(TEST_PERSONAS.map((p) => p.userst)).toEqual(['U', 'W'])
  })
})
