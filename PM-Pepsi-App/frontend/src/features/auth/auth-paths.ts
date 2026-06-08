import type { LoginMode } from '@/features/auth/login-api'
import { resolvePostLoginPathForUserst } from '@/lib/primary-roles'

/** หลัง login work center — default ช่าง → plan-calendar */
export const POST_LOGIN_PATH_WORKCENTER = '/plan-calendar'

/** หลัง login สมาชิก (login-bk) — เทียบ `?module=info` → หน้าแรก React */
export const POST_LOGIN_PATH_MEMBER = '/'

export function resolvePostLoginPath(
  fromPath: string | undefined,
  mode: LoginMode = 'workcenter',
  userst?: string | null,
): string {
  const roleDefault =
    mode === 'member'
      ? POST_LOGIN_PATH_MEMBER
      : resolvePostLoginPathForUserst(userst, POST_LOGIN_PATH_WORKCENTER)
  if (!fromPath || fromPath === '/login' || fromPath === '/logout') {
    return roleDefault
  }
  if (mode === 'member' && fromPath === '/') {
    return roleDefault
  }
  return fromPath
}
