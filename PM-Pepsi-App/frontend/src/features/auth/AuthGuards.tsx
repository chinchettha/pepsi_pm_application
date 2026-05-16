import {
  POST_LOGIN_PATH_WORKCENTER,
  resolvePostLoginPath,
} from '@/features/auth/auth-paths'
import {
  getStoredAuthUser,
  isLoggedIn,
  refreshAuthSession,
} from '@/features/auth/login-api'
import { useAppNav } from '@/lib/use-app-nav'
import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'

export {
  POST_LOGIN_PATH_WORKCENTER as POST_LOGIN_PATH,
  POST_LOGIN_PATH_MEMBER,
  POST_LOGIN_PATH_WORKCENTER,
  resolvePostLoginPath,
} from '@/features/auth/auth-paths'

export function RequireAuth() {
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (!isLoggedIn()) {
        if (!cancelled) {
          setAuthed(false)
          setChecking(false)
        }
        return
      }
      const ok = await refreshAuthSession()
      if (!cancelled) {
        setAuthed(ok)
        setChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [location.key])

  if (checking) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-zinc-100 text-sm text-zinc-600">
        กำลังตรวจสอบเซสชัน…
      </div>
    )
  }

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

function pathAllowedForUser(pathname: string, allowedPaths: string[]): boolean {
  return allowedPaths.some(
    (p) => p === pathname || (p !== '/' && pathname.startsWith(`${p}/`)),
  )
}

/** กัน deep link ไป route ที่ role ไม่มีสิทธิ์ (เมนูจาก tbmenu หรือ fallback) */
export function NavRouteGuard() {
  const location = useLocation()
  const navigate = useNavigate()
  const authUser = getStoredAuthUser()
  const { allowedPaths, isLoading } = useAppNav()

  useEffect(() => {
    if (!authUser || isLoading) return
    if (allowedPaths.length === 0) return
    if (!pathAllowedForUser(location.pathname, allowedPaths)) {
      navigate(POST_LOGIN_PATH_WORKCENTER, { replace: true })
    }
  }, [authUser, allowedPaths, isLoading, location.pathname, navigate])

  return <Outlet />
}

export function GuestOnly() {
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from

  if (isLoggedIn()) {
    const user = getStoredAuthUser()
    const mode = user?.accountType === 'member' ? 'member' : 'workcenter'
    return <Navigate to={resolvePostLoginPath(from?.pathname, mode)} replace />
  }
  return <Outlet />
}
