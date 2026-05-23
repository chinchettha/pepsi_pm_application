import type { LoginMode } from '@/features/auth/login-api'

/** หลัง login work center — เทียบ `login.php` → `M_plan_calendar` */
export const POST_LOGIN_PATH_WORKCENTER = '/plan-calendar'

/** หลัง login สมาชิก (login-bk) — เทียบ `?module=info` → หน้าแรก React */
export const POST_LOGIN_PATH_MEMBER = '/'

export function resolvePostLoginPath(
  fromPath: string | undefined,
  mode: LoginMode = 'workcenter',
): string {
  const defaultPath =
    mode === 'member' ? POST_LOGIN_PATH_MEMBER : POST_LOGIN_PATH_WORKCENTER
  if (!fromPath || fromPath === '/login' || fromPath === '/logout') {
    return defaultPath
  }
  if (mode === 'member' && fromPath === '/') {
    return defaultPath
  }
  return fromPath
}
