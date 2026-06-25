import type { UserSt } from '@/lib/nav-rbac'

/** ISO 29110 / UAT personas — Planner (U) vs Technician (W) */
export type TestPersonaId = 'planner' | 'technician'

export type TestPersona = {
  id: TestPersonaId
  labelEn: string
  labelTh: string
  userst: UserSt
  /** Dev seed login — idwkctr */
  username: string
  password: string
  /** Expected wkctr after login (display / HR scope) */
  expectedWkctr: string
  permissions: string[]
  /** Routes that MUST be reachable (nav or page load without access denied) */
  allowedRoutes: string[]
  /** Routes that MUST NOT be in sidebar (rbacStrict) or show access denied */
  deniedRoutes: string[]
}

/** Planner — userst U (ADMIN01 after migration 113; includes legacy admin scope) */
export const PLANNER_PERSONA: TestPersona = {
  id: 'planner',
  labelEn: 'Planner',
  labelTh: 'Planner / วางแผน',
  userst: 'U',
  username: 'ADMIN01',
  password: 'admin',
  expectedWkctr: 'ADMIN01',
  permissions: [
    'dashboard.read',
    'planning.read',
    'planning.assign',
    'work-orders.read',
    'calendar.read',
    'backlog.read',
    'personnel.read',
    'manhours.read',
    'reports.read',
    'confirmation.read',
    'confirmation.write',
    'confirmation.close',
  ],
  allowedRoutes: [
    '/',
    '/planning',
    '/plan-calendar',
    '/calendar',
    '/confirmation',
    '/backlog',
    '/activity-log',
    '/manhours-hr',
    '/summary-weekly',
    '/reports',
    '/personnel',
  ],
  deniedRoutes: [],
}

/** Technician — userst W (dev seed WC001 → wkctr PAC002) */
export const TECHNICIAN_PERSONA: TestPersona = {
  id: 'technician',
  labelEn: 'Technician',
  labelTh: 'Technician / ช่าง',
  userst: 'W',
  username: 'WC001',
  password: 'wc001',
  expectedWkctr: 'PAC002',
  permissions: [
    'dashboard.read',
    'plan-calendar.read',
    'work-orders.read',
    'confirmation.read',
    'manhours.read',
  ],
  allowedRoutes: ['/', '/plan-calendar', '/confirmation', '/manhours-hr', '/manhours', '/settings'],
  deniedRoutes: [
    '/calendar',
    '/activity-log',
    '/summary-weekly',
    '/reports',
    '/iw37n',
    '/admin/roles',
    '/user-log',
  ],
}

export const TEST_PERSONAS: TestPersona[] = [PLANNER_PERSONA, TECHNICIAN_PERSONA]

export function personaById(id: TestPersonaId): TestPersona {
  const p = TEST_PERSONAS.find((x) => x.id === id)
  if (!p) throw new Error(`Unknown persona: ${id}`)
  return p
}
