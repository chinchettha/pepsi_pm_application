/**
 * 2 role หลักสำหรับ go-live — Planner (รวม Admin) / Technician
 * Legacy Admin (A/admin), Manager (H/manager) ยังอ่านได้แต่ normalize → planner
 */
export const PRIMARY_USERST = ['U', 'W'] as const
export const PRIMARY_USERROLES = ['planner', 'technician'] as const

export type PrimaryUserst = (typeof PRIMARY_USERST)[number]
export type PrimaryUserrole = (typeof PRIMARY_USERROLES)[number]

export const DEPRECATED_ROLE_CODES = ['A', 'H'] as const
export const DEPRECATED_USERROLES = ['admin', 'manager'] as const

export const USERROLE_TO_USERST: Record<PrimaryUserrole, PrimaryUserst> = {
  planner: 'U',
  technician: 'W',
}

export const USERST_TO_USERROLE: Record<PrimaryUserst, PrimaryUserrole> = {
  U: 'planner',
  W: 'technician',
}

export const POST_LOGIN_PATH_BY_USERST: Record<PrimaryUserst, string> = {
  U: '/',
  W: '/plan-calendar',
}

export function isPrimaryUserrole(value: string | null | undefined): value is PrimaryUserrole {
  return (PRIMARY_USERROLES as readonly string[]).includes((value ?? '').trim().toLowerCase())
}

export function isPrimaryUserst(value: string | null | undefined): value is PrimaryUserst {
  return (PRIMARY_USERST as readonly string[]).includes(
    (value ?? '').trim().toUpperCase() as PrimaryUserst,
  )
}

export function userroleToUserst(userrole: string | null | undefined): PrimaryUserst | null {
  const v = (userrole ?? '').trim().toLowerCase()
  if (v === 'planner' || v === 'admin' || v === 'manager') return 'U'
  if (v === 'technician') return 'W'
  return null
}

export function userstToUserrole(userst: string | null | undefined): PrimaryUserrole | null {
  const v = (userst ?? '').trim().toUpperCase()
  if (v === 'U' || v === 'A' || v === 'H') return 'planner'
  if (v === 'W') return 'technician'
  return null
}

/** บังคับคู่ userrole + userst ให้ตรง 2 role หลัก (legacy admin/manager → planner) */
export function normalizePrimaryRolePair(input: {
  userst?: string | null
  userrole?: string | null
}): { userst: PrimaryUserst; userrole: PrimaryUserrole } {
  const rawRole = (input.userrole ?? '').trim().toLowerCase()
  const rawSt = (input.userst ?? '').trim().toUpperCase()

  if (
    rawRole === 'admin' ||
    rawRole === 'manager' ||
    rawSt === 'A' ||
    rawSt === 'H'
  ) {
    return { userst: 'U', userrole: 'planner' }
  }

  const fromRole = userroleToUserst(rawRole)
  if (fromRole) {
    return {
      userst: fromRole,
      userrole: fromRole === 'W' ? 'technician' : 'planner',
    }
  }

  const fromSt = userstToUserrole(rawSt)
  if (fromSt) {
    return {
      userst: rawSt === 'W' ? 'W' : 'U',
      userrole: fromSt,
    }
  }

  return { userst: 'U', userrole: 'planner' }
}

export function resolvePostLoginPathForUserst(
  userst: string | null | undefined,
  fallback = '/plan-calendar',
): string {
  const primary = userstToUserrole(userst)
  if (primary) {
    return POST_LOGIN_PATH_BY_USERST[USERROLE_TO_USERST[primary]]
  }
  return fallback
}

export function isVisibleRoleCode(roleCode: string): boolean {
  return !(DEPRECATED_ROLE_CODES as readonly string[]).includes(
    roleCode.toUpperCase() as (typeof DEPRECATED_ROLE_CODES)[number],
  )
}
